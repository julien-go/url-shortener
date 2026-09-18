import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import {
  insertDailyClicks,
  insertLink,
  insertUser,
  testPool,
  truncateAll,
} from "./helpers/db";

vi.mock("../../src/db/pool", () => ({ pool: testPool }));

const { findLinkStats } = await import(
  "../../src/modules/shortUrls/shortUrls.stats.repo"
);
const { STATS_RANGES } = await import(
  "../../src/modules/shortUrls/shortUrls.constants"
);

function utcDayOffset(days: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function query(range: keyof typeof STATS_RANGES, ids: { userId: string; linkId: string }) {
  const { days, granularity, pgGrain } = STATS_RANGES[range];
  return findLinkStats({ ...ids, days, granularity, pgGrain });
}

beforeEach(truncateAll);
afterAll(async () => {
  await testPool.end();
});

describe("findLinkStats — daily ranges", () => {
  it("returns one bucket per day, padding days without clicks with zero", async () => {
    const userId = await insertUser("stats@example.com");
    const linkId = await insertLink({ userId, code: "stats1" });

    await insertDailyClicks(linkId, utcDayOffset(0), 5);
    await insertDailyClicks(linkId, utcDayOffset(-3), 2);

    const stats = await query("DAYS_7", { userId, linkId });

    expect(stats!.granularity).toBe("DAY");
    expect(stats!.series).toHaveLength(7);

    const buckets = stats!.series.map((p) => p.bucketStart);
    expect(buckets[0]).toBe(utcDayOffset(-6));
    expect(buckets[6]).toBe(utcDayOffset(0));
    expect([...buckets].sort()).toEqual(buckets);

    const byDay = new Map(stats!.series.map((p) => [p.bucketStart, p.clicks]));
    expect(byDay.get(utcDayOffset(0))).toBe(5);
    expect(byDay.get(utcDayOffset(-3))).toBe(2);
    expect(byDay.get(utcDayOffset(-1))).toBe(0);
  });

  it("covers 30 days at daily granularity", async () => {
    const userId = await insertUser("range30@example.com");
    const linkId = await insertLink({ userId, code: "stats2" });

    const stats = await query("DAYS_30", { userId, linkId });

    expect(stats!.granularity).toBe("DAY");
    expect(stats!.series).toHaveLength(30);
  });

  it("keeps clicks outside the window out of the series", async () => {
    const userId = await insertUser("window@example.com");
    const linkId = await insertLink({ userId, code: "stats3" });

    await insertDailyClicks(linkId, utcDayOffset(-20), 99);

    const stats = await query("DAYS_7", { userId, linkId });

    expect(stats!.series.reduce((sum, p) => sum + p.clicks, 0)).toBe(0);
  });
});

describe("findLinkStats — coarser granularity", () => {
  it("groups 90 days into weekly buckets starting on a Monday", async () => {
    const userId = await insertUser("weekly@example.com");
    const linkId = await insertLink({ userId, code: "stats4" });

    await insertDailyClicks(linkId, utcDayOffset(0), 3);
    await insertDailyClicks(linkId, utcDayOffset(-1), 4);

    const stats = await query("DAYS_90", { userId, linkId });

    expect(stats!.granularity).toBe("WEEK");
    expect(stats!.series.length).toBeGreaterThanOrEqual(13);
    expect(stats!.series.length).toBeLessThanOrEqual(14);

    for (const point of stats!.series) {
      expect(new Date(`${point.bucketStart}T00:00:00Z`).getUTCDay()).toBe(1);
    }

    expect(stats!.series.reduce((sum, p) => sum + p.clicks, 0)).toBe(7);
  });

  it("groups 12 months into monthly buckets starting on the first of a month", async () => {
    const userId = await insertUser("monthly@example.com");
    const linkId = await insertLink({ userId, code: "stats5" });

    await insertDailyClicks(linkId, utcDayOffset(0), 6);
    await insertDailyClicks(linkId, utcDayOffset(-40), 10);

    const stats = await query("MONTHS_12", { userId, linkId });

    expect(stats!.granularity).toBe("MONTH");
    expect(stats!.series.length).toBeGreaterThanOrEqual(12);
    expect(stats!.series.length).toBeLessThanOrEqual(13);

    for (const point of stats!.series) {
      expect(point.bucketStart.endsWith("-01")).toBe(true);
    }

    expect(stats!.series.reduce((sum, p) => sum + p.clicks, 0)).toBe(16);
  });

  it("sums a whole week into a single bucket", async () => {
    const userId = await insertUser("sum@example.com");
    const linkId = await insertLink({ userId, code: "stats6" });

    for (let offset = 0; offset < 7; offset++) {
      await insertDailyClicks(linkId, utcDayOffset(-offset), 1);
    }

    const stats = await query("DAYS_90", { userId, linkId });
    const nonEmpty = stats!.series.filter((p) => p.clicks > 0);

    expect(nonEmpty.length).toBeLessThanOrEqual(2);
    expect(nonEmpty.reduce((sum, p) => sum + p.clicks, 0)).toBe(7);
  });
});

describe("findLinkStats — comparison with the previous window", () => {
  it("counts the preceding window of equal length", async () => {
    const userId = await insertUser("compare@example.com");
    const linkId = await insertLink({ userId, code: "stats7" });

    await insertDailyClicks(linkId, utcDayOffset(-1), 10);
    await insertDailyClicks(linkId, utcDayOffset(-8), 4);

    const stats = await query("DAYS_7", { userId, linkId });

    expect(stats!.rangeClicks).toBe(10);
    expect(stats!.previousRangeClicks).toBe(4);
  });

  it("reports zero on both windows when the link has no clicks", async () => {
    const userId = await insertUser("empty@example.com");
    const linkId = await insertLink({ userId, code: "stats8" });

    const stats = await query("DAYS_7", { userId, linkId });

    expect(stats!.rangeClicks).toBe(0);
    expect(stats!.previousRangeClicks).toBe(0);
  });

  it("ignores clicks older than the previous window", async () => {
    const userId = await insertUser("older@example.com");
    const linkId = await insertLink({ userId, code: "stats9" });

    await insertDailyClicks(linkId, utcDayOffset(-30), 50);

    const stats = await query("DAYS_7", { userId, linkId });

    expect(stats!.rangeClicks).toBe(0);
    expect(stats!.previousRangeClicks).toBe(0);
  });
});

describe("findLinkStats — ownership", () => {
  it("returns null for a link owned by someone else", async () => {
    const ownerId = await insertUser("owner@example.com");
    const otherId = await insertUser("other@example.com");
    const linkId = await insertLink({ userId: ownerId, code: "stats10" });

    await expect(
      query("DAYS_7", { userId: otherId, linkId }),
    ).resolves.toBeNull();
  });

  it("returns null for a soft-deleted link", async () => {
    const userId = await insertUser("deleted@example.com");
    const linkId = await insertLink({ userId, code: "stats11" });

    await testPool.query(
      `UPDATE short_urls SET deleted_at = now(), is_active = false WHERE id = $1`,
      [linkId],
    );

    await expect(query("DAYS_7", { userId, linkId })).resolves.toBeNull();
  });
});
