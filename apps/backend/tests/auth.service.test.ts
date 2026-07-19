import { describe, expect, it, vi } from "vitest";

vi.mock("../src/config/env", () => ({
  env: {
    JWT_SECRET: "test-secret",
    COOKIE_MAX_AGE_SECONDS: 604800,
    COOKIE_NAME: "auth_token",
    COOKIE_PATH: "/",
    COOKIE_SAMESITE: "Lax",
    COOKIE_SECURE: false,
    COOKIE_DOMAIN: undefined,
    NODE_ENV: "test",
    LOG_LEVEL: "silent",
  },
}));

import type { Response } from "express";
import {
  DUMMY_PASSWORD_HASH,
  hashPassword,
  issueSession,
  signToken,
  verifyPassword,
  verifyToken,
} from "../src/modules/auth/auth.service";

describe("auth.service", () => {
  describe("hashPassword / verifyPassword", () => {
    it("verifies a password against its own hash", async () => {
      const hash = await hashPassword("correct horse battery staple");

      await expect(
        verifyPassword("correct horse battery staple", hash),
      ).resolves.toBe(true);
    });

    it("rejects a wrong password", async () => {
      const hash = await hashPassword("correct horse battery staple");

      await expect(verifyPassword("wrong password", hash)).resolves.toBe(
        false,
      );
    });

    it("rejects any password against the dummy hash", async () => {
      await expect(
        verifyPassword("anything", DUMMY_PASSWORD_HASH),
      ).resolves.toBe(false);
    });
  });

  describe("signToken / verifyToken", () => {
    const payload = { sub: "user-1", email: "a@b.com", tokenVersion: 0 };

    it("round-trips a signed token", () => {
      const token = signToken(payload);
      const decoded = verifyToken(token);

      expect(decoded).toMatchObject(payload);
    });

    it("returns null for a malformed token", () => {
      expect(verifyToken("not-a-jwt")).toBeNull();
    });

    it("returns null for a token signed with a different secret", () => {
      const token = signToken(payload);
      const tampered = token.slice(0, -2) + (token.endsWith("a") ? "bb" : "aa");

      expect(verifyToken(tampered)).toBeNull();
    });
  });

  describe("issueSession", () => {
    it("sets the auth cookie with a valid signed token and returns the public user shape", () => {
      const setHeader = vi.fn();
      const res = { setHeader } as unknown as Response;
      const createdAt = new Date("2025-01-01T00:00:00.000Z");
      const user = {
        id: "user-1",
        email: "a@b.com",
        password_hash: "hashed",
        token_version: 2,
        created_at: createdAt,
      };

      const result = issueSession(res, user);

      expect(result).toEqual({
        user: { id: "user-1", email: "a@b.com", createdAt },
      });

      const [, cookieValue] = setHeader.mock.calls[0] as [string, string];
      const token = cookieValue.split(";")[0].split("=")[1];
      expect(verifyToken(token)).toMatchObject({
        sub: "user-1",
        email: "a@b.com",
        tokenVersion: 2,
      });
    });
  });
});
