import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeCtx } from "./helpers/graphqlContext";

const shortUrlServiceMocks = vi.hoisted(() => ({
  createShortUrl: vi.fn(),
}));
vi.mock("../src/modules/shortUrls/shortUrls.service", () => shortUrlServiceMocks);

const usersRepoMocks = vi.hoisted(() => ({
  createUser: vi.fn(),
  findUserByEmail: vi.fn(),
  incrementUserTokenVersion: vi.fn(),
}));
vi.mock("../src/modules/users/users.repo", () => usersRepoMocks);

const authServiceMocks = vi.hoisted(() => ({
  DUMMY_PASSWORD_HASH: "dummy-hash",
  hashPassword: vi.fn(),
  signToken: vi.fn(),
  verifyPassword: vi.fn(),
}));
vi.mock("../src/modules/auth/auth.service", () => authServiceMocks);

const shortUrlsRepoMocks = vi.hoisted(() => ({
  softDeleteLink: vi.fn(),
}));
vi.mock("../src/modules/shortUrls/shortUrls.repo", () => shortUrlsRepoMocks);

const authCookiesMocks = vi.hoisted(() => ({
  setAuthCookie: vi.fn(),
  clearAuthCookie: vi.fn(),
}));
vi.mock("../src/security/authCookies", () => authCookiesMocks);

import { mutationResolvers } from "../src/graphql/resolvers/mutation.resolver";

describe("mutationResolvers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createShortUrl", () => {
    it("throws UNAUTHENTICATED when there is no current user", async () => {
      await expect(
        mutationResolvers.createShortUrl(
          null,
          { input: { originalUrl: "https://example.com" } },
          makeCtx(null),
        ),
      ).rejects.toMatchObject({ extensions: { code: "UNAUTHENTICATED" } });
    });

    it("throws BAD_USER_INPUT for an invalid input", async () => {
      await expect(
        mutationResolvers.createShortUrl(
          null,
          { input: { originalUrl: "not-a-url" } },
          makeCtx({ id: "user-1", email: "a@b.com" }),
        ),
      ).rejects.toMatchObject({ extensions: { code: "BAD_USER_INPUT" } });
    });

    it("maps a SLUG_TAKEN result to a BAD_USER_INPUT error", async () => {
      shortUrlServiceMocks.createShortUrl.mockResolvedValue({
        ok: false,
        reason: "SLUG_TAKEN",
      });

      await expect(
        mutationResolvers.createShortUrl(
          null,
          { input: { originalUrl: "https://example.com", code: "taken" } },
          makeCtx({ id: "user-1", email: "a@b.com" }),
        ),
      ).rejects.toMatchObject({
        message: "Code already taken",
        extensions: { code: "BAD_USER_INPUT", reason: "SLUG_TAKEN" },
      });
    });

    it("returns the created short url on success", async () => {
      shortUrlServiceMocks.createShortUrl.mockResolvedValue({
        ok: true,
        shortUrl: {
          id: "link-1",
          code: "abc123",
          target_url: "https://example.com",
          created_at: "2025-01-01T00:00:00.000Z",
        },
        shortLink: "https://short.test/abc123",
      });

      const result = await mutationResolvers.createShortUrl(
        null,
        { input: { originalUrl: "https://example.com" } },
        makeCtx({ id: "user-1", email: "a@b.com" }),
      );

      expect(result).toMatchObject({
        shortLink: "https://short.test/abc123",
        shortUrl: { id: "link-1", code: "abc123", clickCount: "0" },
      });
    });

    it("maps an unexpected error to INTERNAL_SERVER_ERROR", async () => {
      shortUrlServiceMocks.createShortUrl.mockRejectedValue(new Error("boom"));

      await expect(
        mutationResolvers.createShortUrl(
          null,
          { input: { originalUrl: "https://example.com" } },
          makeCtx({ id: "user-1", email: "a@b.com" }),
        ),
      ).rejects.toMatchObject({
        extensions: { code: "INTERNAL_SERVER_ERROR" },
      });
    });
  });

  describe("register", () => {
    it("throws BAD_USER_INPUT for an invalid input", async () => {
      await expect(
        mutationResolvers.register(
          null,
          { input: { email: "not-an-email", password: "x" } },
          makeCtx(),
        ),
      ).rejects.toMatchObject({ extensions: { code: "BAD_USER_INPUT" } });
    });

    it("creates the user, signs a token and sets the auth cookie", async () => {
      authServiceMocks.hashPassword.mockResolvedValue("hashed");
      usersRepoMocks.createUser.mockResolvedValue({
        id: "user-1",
        email: "a@b.com",
        token_version: 0,
        created_at: "2025-01-01T00:00:00.000Z",
      });
      authServiceMocks.signToken.mockReturnValue("signed-token");

      const ctx = makeCtx();
      const result = await mutationResolvers.register(
        null,
        { input: { email: "a@b.com", password: "Correct-horse1" } },
        ctx,
      );

      expect(authServiceMocks.signToken).toHaveBeenCalledWith({
        sub: "user-1",
        email: "a@b.com",
        tokenVersion: 0,
      });
      expect(authCookiesMocks.setAuthCookie).toHaveBeenCalledWith(
        ctx.res,
        "signed-token",
      );
      expect(result).toMatchObject({ user: { id: "user-1", email: "a@b.com" } });
    });

    it("maps a unique-violation error to BAD_USER_INPUT", async () => {
      authServiceMocks.hashPassword.mockResolvedValue("hashed");
      usersRepoMocks.createUser.mockRejectedValue({ code: "23505" });

      await expect(
        mutationResolvers.register(
          null,
          { input: { email: "a@b.com", password: "Correct-horse1" } },
          makeCtx(),
        ),
      ).rejects.toMatchObject({
        extensions: { code: "BAD_USER_INPUT", reason: "REGISTRATION_FAILED" },
      });
    });

    it("maps an unexpected error to INTERNAL_SERVER_ERROR", async () => {
      authServiceMocks.hashPassword.mockResolvedValue("hashed");
      usersRepoMocks.createUser.mockRejectedValue(new Error("db down"));

      await expect(
        mutationResolvers.register(
          null,
          { input: { email: "a@b.com", password: "Correct-horse1" } },
          makeCtx(),
        ),
      ).rejects.toMatchObject({
        extensions: { code: "INTERNAL_SERVER_ERROR" },
      });
    });
  });

  describe("login", () => {
    it("throws a generic BAD_USER_INPUT when the user does not exist", async () => {
      usersRepoMocks.findUserByEmail.mockResolvedValue(null);
      authServiceMocks.verifyPassword.mockResolvedValue(false);

      await expect(
        mutationResolvers.login(
          null,
          { input: { email: "unknown@b.com", password: "whatever" } },
          makeCtx(),
        ),
      ).rejects.toMatchObject({
        message: "Invalid credentials",
        extensions: { code: "BAD_USER_INPUT" },
      });

      expect(authServiceMocks.verifyPassword).toHaveBeenCalledWith(
        "whatever",
        authServiceMocks.DUMMY_PASSWORD_HASH,
      );
    });

    it("throws a generic BAD_USER_INPUT when the password is wrong", async () => {
      usersRepoMocks.findUserByEmail.mockResolvedValue({
        id: "user-1",
        email: "a@b.com",
        password_hash: "hashed",
        token_version: 0,
        created_at: "2025-01-01T00:00:00.000Z",
      });
      authServiceMocks.verifyPassword.mockResolvedValue(false);

      await expect(
        mutationResolvers.login(
          null,
          { input: { email: "a@b.com", password: "wrong" } },
          makeCtx(),
        ),
      ).rejects.toMatchObject({
        message: "Invalid credentials",
        extensions: { code: "BAD_USER_INPUT" },
      });
    });

    it("signs a token and sets the auth cookie on success", async () => {
      usersRepoMocks.findUserByEmail.mockResolvedValue({
        id: "user-1",
        email: "a@b.com",
        password_hash: "hashed",
        token_version: 2,
        created_at: "2025-01-01T00:00:00.000Z",
      });
      authServiceMocks.verifyPassword.mockResolvedValue(true);
      authServiceMocks.signToken.mockReturnValue("signed-token");

      const ctx = makeCtx();
      const result = await mutationResolvers.login(
        null,
        { input: { email: "a@b.com", password: "correct horse" } },
        ctx,
      );

      expect(authServiceMocks.signToken).toHaveBeenCalledWith({
        sub: "user-1",
        email: "a@b.com",
        tokenVersion: 2,
      });
      expect(authCookiesMocks.setAuthCookie).toHaveBeenCalledWith(
        ctx.res,
        "signed-token",
      );
      expect(result).toMatchObject({ user: { id: "user-1", email: "a@b.com" } });
    });
  });

  describe("logout", () => {
    it("clears the auth cookie without touching the DB when anonymous", async () => {
      const ctx = makeCtx(null);
      const result = await mutationResolvers.logout(null, null, ctx);

      expect(usersRepoMocks.incrementUserTokenVersion).not.toHaveBeenCalled();
      expect(authCookiesMocks.clearAuthCookie).toHaveBeenCalledWith(ctx.res);
      expect(result).toBe(true);
    });

    it("bumps the token version and clears the cookie when authenticated", async () => {
      const ctx = makeCtx({ id: "user-1", email: "a@b.com" });
      const result = await mutationResolvers.logout(null, null, ctx);

      expect(usersRepoMocks.incrementUserTokenVersion).toHaveBeenCalledWith(
        "user-1",
      );
      expect(authCookiesMocks.clearAuthCookie).toHaveBeenCalledWith(ctx.res);
      expect(result).toBe(true);
    });
  });

  describe("deleteLink", () => {
    it("throws UNAUTHENTICATED when there is no current user", async () => {
      await expect(
        mutationResolvers.deleteLink(
          null,
          { id: "123e4567-e89b-12d3-a456-426614174000" },
          makeCtx(null),
        ),
      ).rejects.toMatchObject({ extensions: { code: "UNAUTHENTICATED" } });
    });

    it("throws BAD_USER_INPUT for a non-uuid id", async () => {
      await expect(
        mutationResolvers.deleteLink(
          null,
          { id: "not-a-uuid" },
          makeCtx({ id: "user-1", email: "a@b.com" }),
        ),
      ).rejects.toMatchObject({ extensions: { code: "BAD_USER_INPUT" } });
    });

    it("delegates to softDeleteLink scoped to the current user", async () => {
      shortUrlsRepoMocks.softDeleteLink.mockResolvedValue(true);

      const result = await mutationResolvers.deleteLink(
        null,
        { id: "123e4567-e89b-12d3-a456-426614174000" },
        makeCtx({ id: "user-1", email: "a@b.com" }),
      );

      expect(shortUrlsRepoMocks.softDeleteLink).toHaveBeenCalledWith({
        userId: "user-1",
        id: "123e4567-e89b-12d3-a456-426614174000",
      });
      expect(result).toBe(true);
    });
  });
});
