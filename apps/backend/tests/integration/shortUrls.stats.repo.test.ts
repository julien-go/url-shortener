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

function utcDayOffset(days: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

beforeEach(truncateAll);
afterAll(async () => {
  await testPool.end();
});

describe("findLinkStats", () => {
  it("returns one point per day, padding days without clicks with zero", async () => {
    const userId = await insertUser("stats@example.com");
    const linkId = await insertLink({ userId, code: "stats1" });

    await insertDailyClicks(linkId, utcDayOffset(0), 5);
    await insertDailyClicks(linkId, utcDayOffset(-3), 2);

    const stats = await findLinkStats({ userId, linkId, days: 7 });

    expect(stats).not.toBeNull();
    expect(stats!.series).toHaveLength(7);

    const days = stats!.series.map((point) => point.dayUtc);
    expect(days[0]).toBe(utcDayOffset(-6));
    expect(days[6]).toBe(utcDayOffset(0));
    expect([...days].sort()).toEqual(days);

    const byDay = new Map(stats!.series.map((p) => [p.dayUtc, p.clicks]));
    expect(byDay.get(utcDayOffset(0))).toBe(5);
    expect(byDay.get(utcDayOffset(-3))).toBe(2);
    expect(byDay.get(utcDayOffset(-1))).toBe(0);
  });

  it("covers a 30 day window when asked", async () => {
    const userId = await insertUser("range@example.com");
    const linkId = await insertLink({ userId, code: "stats2" });

    const stats = await findLinkStats({ userId, linkId, days: 30 });

    expect(stats!.series).toHaveLength(30);
  });

  it("ignores clicks outside the requested window", async () => {
    const userId = await insertUser("window@example.com");
    const linkId = await insertLink({ userId, code: "stats3" });

    await insertDailyClicks(linkId, utcDayOffset(-20), 99);

    const stats = await findLinkStats({ userId, linkId, days: 7 });

    const total = stats!.series.reduce((sum, p) => sum + p.clicks, 0);
    expect(total).toBe(0);
  });

  it("returns null for a link owned by someone else", async () => {
    const ownerId = await insertUser("owner@example.com");
    const otherId = await insertUser("other@example.com");
    const linkId = await insertLink({ userId: ownerId, code: "stats4" });

    await expect(
      findLinkStats({ userId: otherId, linkId, days: 7 }),
    ).resolves.toBeNull();
  });

  it("returns null for a soft-deleted link", async () => {
    const userId = await insertUser("deleted@example.com");
    const linkId = await insertLink({ userId, code: "stats5" });

    await testPool.query(
      `UPDATE short_urls SET deleted_at = now(), is_active = false WHERE id = $1`,
      [linkId],
    );

    await expect(
      findLinkStats({ userId, linkId, days: 7 }),
    ).resolves.toBeNull();
  });
});
