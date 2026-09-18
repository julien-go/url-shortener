import { describe, expect, it } from "vitest";
import {
  generateRandomSlug,
  isHttpUrlProtocol,
  isUniqueViolation,
  isValidSlug,
} from "../src/modules/shortUrls/shortUrls.utils";

describe("shortUrls.utils", () => {
  describe("isHttpUrlProtocol", () => {
    it("accepts http and https URLs", () => {
      expect(isHttpUrlProtocol("https://example.com")).toBe(true);
      expect(isHttpUrlProtocol("http://example.com/path?q=1")).toBe(true);
    });

    it("rejects other protocols and malformed input", () => {
      expect(isHttpUrlProtocol("ftp://example.com")).toBe(false);
      expect(isHttpUrlProtocol("javascript:alert(1)")).toBe(false);
      expect(isHttpUrlProtocol("123")).toBe(false);
    });

    it("accepts private hosts, since the server never fetches the target", () => {
      expect(isHttpUrlProtocol("http://localhost:3000")).toBe(true);
      expect(isHttpUrlProtocol("http://169.254.169.254")).toBe(true);
    });
  });

  describe("isValidSlug", () => {
    it("validates slugs based on repo constraints", () => {
      expect(isValidSlug("abc123")).toBe(true);
      expect(isValidSlug("ab")).toBe(false);
      expect(isValidSlug("invalid slug")).toBe(false);
      expect(isValidSlug("bad@slug")).toBe(false);
    });

    it("rejects reserved slugs", () => {
      expect(isValidSlug("graphql")).toBe(false);
      expect(isValidSlug("healthz")).toBe(false);
      expect(isValidSlug("my-custom-slug")).toBe(true);
    });
  });

  describe("generateRandomSlug", () => {
    const GENERATION_SAMPLE_SIZE = 200;
    const MIN_EXPECTED_UNIQUE_SLUGS = 180;

    it("generates a random slug with expected length and charset", () => {
      const slug = generateRandomSlug(12);
      expect(slug).toHaveLength(12);
      expect(slug).toMatch(/^[a-zA-Z0-9]+$/);
    });

    it("stays robust across multiple runs", () => {
      const generated = new Set<string>();

      for (let i = 0; i < GENERATION_SAMPLE_SIZE; i++) {
        const slug = generateRandomSlug(7);
        expect(slug).toHaveLength(7);
        expect(slug).toMatch(/^[a-zA-Z0-9]+$/);
        generated.add(slug);
      }

      expect(generated.size).toBeGreaterThan(MIN_EXPECTED_UNIQUE_SLUGS);
    });
  });

  describe("isUniqueViolation", () => {
    it("detects postgres unique_violation errors", () => {
      expect(isUniqueViolation({ code: "23505" })).toBe(true);
      expect(isUniqueViolation({ code: "22001" })).toBe(false);
      expect(isUniqueViolation(new Error("404"))).toBe(false);
    });
  });
});
