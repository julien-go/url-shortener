import { beforeEach, describe, expect, it, vi } from "vitest";

const repoMocks = vi.hoisted(() => ({
  createShortUrlRow: vi.fn(),
  findByCode: vi.fn(),
  trackClick: vi.fn(),
}));
vi.mock("../src/modules/shortUrls/shortUrls.repo", () => repoMocks);
vi.mock("../src/config/env", () => ({
  env: {
    PUBLIC_BASE_URL: "https://short.test",
    NODE_ENV: "test",
    LOG_LEVEL: "silent",
  },
}));

import {
  createShortUrl,
  resolveShortUrl,
} from "../src/modules/shortUrls/shortUrls.service";
import * as shortUrlsUtils from "../src/modules/shortUrls/shortUrls.utils";

describe("shortUrls.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createShortUrl", () => {
    it("returns INVALID_URL when original url is invalid", async () => {
      const result = await createShortUrl({ originalUrl: "bad url" }, "userid");

      expect(result).toEqual({ ok: false, reason: "INVALID_URL" });
      expect(repoMocks.createShortUrlRow).not.toHaveBeenCalled();
    });

    it("returns INVALID_CODE for invalid custom code", async () => {
      const result = await createShortUrl(
        { originalUrl: "https://example.com", code: "bad slug" },
        "userid",
      );

      expect(result).toEqual({ ok: false, reason: "INVALID_CODE" });
      expect(repoMocks.createShortUrlRow).not.toHaveBeenCalled();
    });

    it("returns SLUG_TAKEN when custom code already exists", async () => {
      repoMocks.createShortUrlRow.mockRejectedValue({ code: "23505" });

      const result = await createShortUrl(
        { originalUrl: "https://example.com", code: "already-used-slug" },
        "userid",
      );

      expect(result).toEqual({ ok: false, reason: "SLUG_TAKEN" });
    });

    it("retries on slug collision for generated code", async () => {
      vi.spyOn(shortUrlsUtils, "generateRandomSlug")
        .mockReturnValueOnce("taken-slug1")
        .mockReturnValueOnce("new-slug2");

      repoMocks.createShortUrlRow
        .mockRejectedValueOnce({ code: "23505" })
        .mockResolvedValueOnce({ id: "id-2", code: "new-slug2" });

      const result = await createShortUrl(
        { originalUrl: "https://example.com" },
        "userid",
      );

      expect(result).toEqual({
        ok: true,
        shortUrl: { id: "id-2", code: "new-slug2" },
        shortLink: `https://short.test/new-slug2`,
      });
      expect(repoMocks.createShortUrlRow).toHaveBeenCalledTimes(2);
    });
  });

  describe("resolveShortUrl", () => {
    it("returns NOT_FOUND when code does not exist", async () => {
      repoMocks.findByCode.mockResolvedValue(null);

      const result = await resolveShortUrl("missing");

      expect(result).toEqual({ ok: false, reason: "NOT_FOUND" });
    });

    it("returns DELETED when link was deleted", async () => {
      repoMocks.findByCode.mockResolvedValue({
        id: "id-1",
        target_url: "https://example.com",
        deleted_at: new Date().toISOString(),
        is_active: true,
      });

      const result = await resolveShortUrl("deleted");

      expect(result).toEqual({ ok: false, reason: "DELETED" });
      expect(repoMocks.trackClick).not.toHaveBeenCalled();
    });

    it("returns INACTIVE when link is disabled", async () => {
      repoMocks.findByCode.mockResolvedValue({
        id: "id-1",
        target_url: "https://example.com",
        deleted_at: null,
        is_active: false,
      });

      const result = await resolveShortUrl("inactive");

      expect(result).toEqual({ ok: false, reason: "INACTIVE" });
    });

    it("returns target url and tracks click by default", async () => {
      repoMocks.findByCode.mockResolvedValue({
        id: "id-1",
        target_url: "https://example.com",
        deleted_at: null,
        is_active: true,
      });
      repoMocks.trackClick.mockResolvedValue(undefined);

      const result = await resolveShortUrl("code-1");

      expect(result).toEqual({ ok: true, targetUrl: "https://example.com" });
      expect(repoMocks.trackClick).toHaveBeenCalledWith("id-1");
    });

    it("can disable tracking when requested", async () => {
      repoMocks.findByCode.mockResolvedValue({
        id: "id-1",
        target_url: "https://example.com",
        deleted_at: null,
        is_active: true,
      });

      const result = await resolveShortUrl("slug-1", { track: false });

      expect(result).toEqual({ ok: true, targetUrl: "https://example.com" });
      expect(repoMocks.trackClick).not.toHaveBeenCalled();
    });
  });
});
