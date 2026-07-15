import { describe, expect, it, vi } from "vitest";

vi.mock("../src/config/env", () => ({
  env: {
    JWT_SECRET: "test-secret",
    COOKIE_MAX_AGE_SECONDS: 604800,
    NODE_ENV: "test",
    LOG_LEVEL: "silent",
  },
}));

import {
  DUMMY_PASSWORD_HASH,
  hashPassword,
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
});
