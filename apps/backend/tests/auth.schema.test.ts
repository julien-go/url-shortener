import { describe, expect, it } from "vitest";

import { registerInputSchema } from "../src/modules/auth/auth.schema";

describe("registerInputSchema", () => {
  it("accepts a password with lowercase, uppercase, digit and special character", () => {
    const result = registerInputSchema.safeParse({
      email: "a@b.com",
      password: "Correct-horse1",
    });

    expect(result.success).toBe(true);
  });

  it.each([
    ["too short", "Ab1!"],
    ["no uppercase", "correct-horse1"],
    ["no lowercase", "CORRECT-HORSE1"],
    ["no digit", "Correct-horse"],
    ["no special character", "Correcthorse1"],
  ])("rejects a password with %s", (_label, password) => {
    const result = registerInputSchema.safeParse({
      email: "a@b.com",
      password,
    });

    expect(result.success).toBe(false);
  });
});
