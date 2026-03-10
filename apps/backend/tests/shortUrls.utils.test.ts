import { describe, expect, it } from "vitest";
import {
  generateRandomSlug,
  isUniqueViolation,
  isValidHttpUrl,
  isValidSlug,
} from "../src/modules/shortUrls/shortUrls.utils";

describe("shortUrls.utils", () => {
  it("validates only public http/https URLs", () => {
    expect(isValidHttpUrl("https://example.com")).toBe(true);
    expect(isValidHttpUrl("http://example.com/path?q=1")).toBe(true);
    expect(isValidHttpUrl("ftp://example.com")).toBe(false);
    expect(isValidHttpUrl("123")).toBe(false);
    expect(isValidHttpUrl("http://localhost:3000")).toBe(false);
    expect(isValidHttpUrl("http://127.0.0.1")).toBe(false);
    expect(isValidHttpUrl("http://10.0.0.8")).toBe(false);
    expect(isValidHttpUrl("http://172.16.0.8")).toBe(false);
    expect(isValidHttpUrl("http://192.168.1.10")).toBe(false);
    expect(isValidHttpUrl("http://169.254.169.254/latest/meta-data")).toBe(
      false,
    );
    expect(isValidHttpUrl("http://[::1]")).toBe(false);
    expect(isValidHttpUrl("http://[fc00::1234]")).toBe(false);
    expect(isValidHttpUrl("http://[fd12:3456:789a::1]")).toBe(false);
    expect(isValidHttpUrl("http://[fe80::1]")).toBe(false);
    expect(isValidHttpUrl("http://[::ffff:192.168.1.10]")).toBe(false);
    expect(
      isValidHttpUrl("http://metadata.google.internal/computeMetadata/v1"),
    ).toBe(false);
  });

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

  it("generates random slug with expected length and charset", () => {
    const slug = generateRandomSlug(12);
    expect(slug).toHaveLength(12);
    expect(slug).toMatch(/^[a-zA-Z0-9]+$/);
  });

  it("keeps generator robust across multiple runs", () => {
    const generated = new Set<string>();

    for (let i = 0; i < 200; i++) {
      const slug = generateRandomSlug(7);
      expect(slug).toHaveLength(7);
      expect(slug).toMatch(/^[a-zA-Z0-9]+$/);
      generated.add(slug);
    }

    expect(generated.size).toBeGreaterThan(180);
  });

  it("detects postgres unique_violation errors", () => {
    expect(isUniqueViolation({ code: "23505" })).toBe(true);
    expect(isUniqueViolation({ code: "22001" })).toBe(false);
    expect(isUniqueViolation(new Error("404"))).toBe(false);
  });
});
