import { describe, expect, it } from "vitest";

import { getPasswordValidationError } from "../../../src/features/auth/components/password";

describe("getPasswordValidationError", () => {
  it("returns null for an empty password", () => {
    expect(getPasswordValidationError("")).toBeNull();
  });

  it("returns null for a compliant password", () => {
    expect(getPasswordValidationError("Correct-horse1")).toBeNull();
  });

  it("flags a password shorter than the minimum length", () => {
    expect(getPasswordValidationError("Ab1!")).toBe(
      "Password must be at least 8 characters",
    );
  });

  it("flags a password longer than the maximum length", () => {
    expect(getPasswordValidationError("Aa1!".repeat(20))).toBe(
      "Password must be at most 72 characters",
    );
  });
});
