import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { insertLink, insertUser, testPool, truncateAll } from "./helpers/db";

vi.mock("../../src/db/pool", () => ({ pool: testPool }));

const {
  countMyLinks,
  findByCode,
  findMyLinksPage,
  softDeleteLink,
  trackClick,
} = await import("../../src/modules/shortUrls/shortUrls.repo");

beforeEach(truncateAll);
afterAll(async () => {
  await testPool.end();
});

async function seedThreeLinks(userId: string) {
  await insertLink({
    userId,
    code: "oldest",
    createdAt: "2026-01-01T00:00:00Z",
  });
  await insertLink({
    userId,
    code: "middle",
    createdAt: "2026-02-01T00:00:00Z",
  });
  await insertLink({
    userId,
    code: "newest",
    createdAt: "2026-03-01T00:00:00Z",
  });
}

describe("findMyLinksPage", () => {
  it("returns newest first and fetches limit + 1 rows to detect a next page", async () => {
    const userId = await insertUser("page@example.com");
    await seedThreeLinks(userId);

    const rows = await findMyLinksPage({ userId, limit: 2 });

    expect(rows.map((r) => r.code)).toEqual(["newest", "middle", "oldest"]);
  });

  it("continues after a cursor without repeating or skipping a row", async () => {
    const userId = await insertUser("cursor@example.com");
    await seedThreeLinks(userId);

    const first = (await findMyLinksPage({ userId, limit: 2 })).slice(0, 2);
    const last = first[first.length - 1];

    const second = await findMyLinksPage({
      userId,
      limit: 2,
      cursor: { createdAt: new Date(last.created_at).toISOString(), id: last.id },
    });

    expect(first.map((r) => r.code)).toEqual(["newest", "middle"]);
    expect(second.map((r) => r.code)).toEqual(["oldest"]);
  });

  it("never leaks another user's links", async () => {
    const mine = await insertUser("mine@example.com");
    const theirs = await insertUser("theirs@example.com");
    await insertLink({ userId: mine, code: "mine01" });
    await insertLink({ userId: theirs, code: "their1" });

    const rows = await findMyLinksPage({ userId: mine, limit: 10 });

    expect(rows.map((r) => r.code)).toEqual(["mine01"]);
  });

  it("excludes soft-deleted links from the page and the count", async () => {
    const userId = await insertUser("soft@example.com");
    const keptId = await insertLink({ userId, code: "kept01" });
    const goneId = await insertLink({ userId, code: "gone01" });

    await softDeleteLink({ userId, id: goneId });

    const rows = await findMyLinksPage({ userId, limit: 10 });

    expect(rows.map((r) => r.id)).toEqual([keptId]);
    await expect(countMyLinks(userId)).resolves.toBe(1);
  });
});

describe("softDeleteLink", () => {
  it("refuses to delete a link owned by someone else", async () => {
    const ownerId = await insertUser("owner2@example.com");
    const otherId = await insertUser("other2@example.com");
    const linkId = await insertLink({ userId: ownerId, code: "owned1" });

    await expect(
      softDeleteLink({ userId: otherId, id: linkId }),
    ).resolves.toBe(false);

    const { rows } = await testPool.query(
      `SELECT deleted_at FROM short_urls WHERE id = $1`,
      [linkId],
    );
    expect(rows[0].deleted_at).toBeNull();
  });

  it("is idempotent", async () => {
    const userId = await insertUser("idem@example.com");
    const linkId = await insertLink({ userId, code: "idem01" });

    await expect(softDeleteLink({ userId, id: linkId })).resolves.toBe(true);
    await expect(softDeleteLink({ userId, id: linkId })).resolves.toBe(false);
  });
});

describe("trackClick", () => {
  it("increments both the daily row and the link total on repeated clicks", async () => {
    const userId = await insertUser("click@example.com");
    const linkId = await insertLink({ userId, code: "click1" });

    await trackClick(linkId);
    await trackClick(linkId);
    await trackClick(linkId);

    const { rows: daily } = await testPool.query<{ clicks: number }>(
      `SELECT clicks FROM daily_clicks WHERE short_url_id = $1`,
      [linkId],
    );
    const { rows: link } = await testPool.query<{
      total_clicks: string;
      last_clicked_at: Date | null;
    }>(
      `SELECT total_clicks, last_clicked_at FROM short_urls WHERE id = $1`,
      [linkId],
    );

    expect(daily).toHaveLength(1);
    expect(daily[0].clicks).toBe(3);
    expect(Number(link[0].total_clicks)).toBe(3);
    expect(link[0].last_clicked_at).not.toBeNull();
  });
});

describe("findByCode", () => {
  it("matches the stored code case-insensitively", async () => {
    const userId = await insertUser("case@example.com");
    await insertLink({ userId, code: "abc123" });

    await expect(findByCode("ABC123")).resolves.toMatchObject({
      code: "abc123",
    });
    await expect(findByCode("  abc123  ")).resolves.toMatchObject({
      code: "abc123",
    });
    await expect(findByCode("nope99")).resolves.toBeNull();
  });
});
