import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeCtx } from "./helpers/graphqlContext";

const usersRepoMocks = vi.hoisted(() => ({
  findUserById: vi.fn(),
}));
vi.mock("../src/modules/users/users.repo", () => usersRepoMocks);

const shortUrlsRepoMocks = vi.hoisted(() => ({
  countMyLinks: vi.fn(),
  findMyLinksPage: vi.fn(),
}));
vi.mock("../src/modules/shortUrls/shortUrls.repo", () => shortUrlsRepoMocks);

const statsRepoMocks = vi.hoisted(() => ({
  findLinkStats: vi.fn(),
}));
vi.mock("../src/modules/shortUrls/shortUrls.stats.repo", () => statsRepoMocks);

import { queryResolvers } from "../src/graphql/resolvers/query.resolver";
import { encodeCursor } from "../src/graphql/cursor";

describe("queryResolvers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("health", () => {
    it("returns ok", () => {
      expect(queryResolvers.health()).toBe("ok");
    });
  });

  describe("me", () => {
    it("throws UNAUTHENTICATED when there is no current user", async () => {
      await expect(
        queryResolvers.me(null, null, makeCtx(null)),
      ).rejects.toMatchObject({ extensions: { code: "UNAUTHENTICATED" } });
    });

    it("throws UNAUTHENTICATED when the user no longer exists", async () => {
      usersRepoMocks.findUserById.mockResolvedValue(null);

      await expect(
        queryResolvers.me(
          null,
          null,
          makeCtx({ id: "user-1", email: "a@b.com" }),
        ),
      ).rejects.toMatchObject({ extensions: { code: "UNAUTHENTICATED" } });
    });

    it("returns the current user", async () => {
      usersRepoMocks.findUserById.mockResolvedValue({
        id: "user-1",
        email: "a@b.com",
        created_at: "2025-01-01T00:00:00.000Z",
      });

      const result = await queryResolvers.me(
        null,
        null,
        makeCtx({ id: "user-1", email: "a@b.com" }),
      );

      expect(result).toMatchObject({ id: "user-1", email: "a@b.com" });
    });
  });

  describe("myLinks", () => {
    it("throws UNAUTHENTICATED when there is no current user", async () => {
      await expect(
        queryResolvers.myLinks(null, {}, makeCtx(null)),
      ).rejects.toMatchObject({ extensions: { code: "UNAUTHENTICATED" } });
    });

    it("throws BAD_USER_INPUT for an out-of-range limit", async () => {
      await expect(
        queryResolvers.myLinks(
          null,
          { limit: 1000 },
          makeCtx({ id: "user-1", email: "a@b.com" }),
        ),
      ).rejects.toMatchObject({ extensions: { code: "BAD_USER_INPUT" } });
    });

    it("throws BAD_USER_INPUT for a malformed cursor", async () => {
      shortUrlsRepoMocks.countMyLinks.mockResolvedValue(0);
      shortUrlsRepoMocks.findMyLinksPage.mockResolvedValue([]);

      await expect(
        queryResolvers.myLinks(
          null,
          { cursor: "not-a-valid-cursor" },
          makeCtx({ id: "user-1", email: "a@b.com" }),
        ),
      ).rejects.toMatchObject({ extensions: { code: "BAD_USER_INPUT" } });
    });

    it("maps rows to items and omits nextCursor on the last page", async () => {
      shortUrlsRepoMocks.countMyLinks.mockResolvedValue(1);
      shortUrlsRepoMocks.findMyLinksPage.mockResolvedValue([
        {
          id: "link-1",
          code: "abc123",
          target_url: "https://example.com",
          created_at: "2025-01-01T00:00:00.000Z",
          total_clicks: 5,
        },
      ]);

      const result = await queryResolvers.myLinks(
        null,
        { limit: 10 },
        makeCtx({ id: "user-1", email: "a@b.com" }),
      );

      expect(result).toEqual({
        items: [
          {
            id: "link-1",
            code: "abc123",
            originalUrl: "https://example.com",
            createdAt: "2025-01-01T00:00:00.000Z",
            clickCount: "5",
          },
        ],
        nextCursor: null,
        totalCount: 1,
      });
    });

    it("returns a nextCursor when there are more rows than the page limit", async () => {
      shortUrlsRepoMocks.countMyLinks.mockResolvedValue(2);
      shortUrlsRepoMocks.findMyLinksPage.mockResolvedValue([
        {
          id: "link-1",
          code: "abc123",
          target_url: "https://example.com",
          created_at: "2025-01-02T00:00:00.000Z",
          total_clicks: 0,
        },
        {
          id: "link-2",
          code: "def456",
          target_url: "https://example.org",
          created_at: "2025-01-01T00:00:00.000Z",
          total_clicks: 0,
        },
      ]);

      const result = await queryResolvers.myLinks(
        null,
        { limit: 1 },
        makeCtx({ id: "user-1", email: "a@b.com" }),
      );

      expect(result.items).toHaveLength(1);
      expect(result.nextCursor).toBe(
        encodeCursor("2025-01-02T00:00:00.000Z", "link-1"),
      );
    });
  });

  describe("linkStats", () => {
    it("throws UNAUTHENTICATED when there is no current user", async () => {
      await expect(
        queryResolvers.linkStats(
          null,
          {
            linkId: "123e4567-e89b-12d3-a456-426614174000",
            range: "DAYS_7",
          },
          makeCtx(null),
        ),
      ).rejects.toMatchObject({ extensions: { code: "UNAUTHENTICATED" } });
    });

    it("throws BAD_USER_INPUT for a non-uuid linkId", async () => {
      await expect(
        queryResolvers.linkStats(
          null,
          { linkId: "not-a-uuid", range: "DAYS_7" },
          makeCtx({ id: "user-1", email: "a@b.com" }),
        ),
      ).rejects.toMatchObject({ extensions: { code: "BAD_USER_INPUT" } });
    });

    it("throws NOT_FOUND when the link does not belong to the user", async () => {
      statsRepoMocks.findLinkStats.mockResolvedValue(null);

      await expect(
        queryResolvers.linkStats(
          null,
          {
            linkId: "123e4567-e89b-12d3-a456-426614174000",
            range: "DAYS_30",
          },
          makeCtx({ id: "user-1", email: "a@b.com" }),
        ),
      ).rejects.toMatchObject({ extensions: { code: "NOT_FOUND" } });
    });

    it("resolves DAYS_7/DAYS_30 to 7/30 days and returns the stats", async () => {
      statsRepoMocks.findLinkStats.mockResolvedValue({ totalClicks: 3 });

      const result = await queryResolvers.linkStats(
        null,
        {
          linkId: "123e4567-e89b-12d3-a456-426614174000",
          range: "DAYS_30",
        },
        makeCtx({ id: "user-1", email: "a@b.com" }),
      );

      expect(statsRepoMocks.findLinkStats).toHaveBeenCalledWith({
        userId: "user-1",
        linkId: "123e4567-e89b-12d3-a456-426614174000",
        days: 30,
      });
      expect(result).toEqual({ totalClicks: 3 });
    });
  });
});
