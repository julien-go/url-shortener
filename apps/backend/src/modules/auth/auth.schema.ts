import { z } from "zod";

// Mirrored in apps/frontend/src/features/auth/components/password.ts — keep both in sync.
export const PASSWORD_COMPLEXITY_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!"#$%&'()*+,\-./:;<=>?@[\]^_`{|}~]).+$/;

export const registerInputSchema = z
  .object({
    email: z.string().trim().toLowerCase().email().max(254),
    password: z
      .string()
      .min(8)
      .max(72)
      .regex(PASSWORD_COMPLEXITY_REGEX, {
        message:
          "Password must include an uppercase letter, a lowercase letter, a digit, and a special character",
      }),
  })
  .strict();

export const loginInputSchema = z
  .object({
    email: z.string().trim().toLowerCase().email().max(254),
    password: z.string().min(1).max(72),
  })
  .strict();
