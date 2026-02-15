import { z } from "zod";

export const registerInputSchema = z
  .object({
    email: z.string().trim().toLowerCase().email().max(254),
    password: z.string().min(8).max(72),
  })
  .strict();

export const loginInputSchema = z
  .object({
    email: z.string().trim().toLowerCase().email().max(254),
    password: z.string().min(1).max(72),
  })
  .strict();
