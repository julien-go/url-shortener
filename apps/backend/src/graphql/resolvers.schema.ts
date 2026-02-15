import { z } from "zod";

export const createShortUrlInputSchema = z
  .object({
    originalUrl: z
      .string()
      .trim()
      .url()
      .max(2048)
      .refine((url) => {
        const protocol = new URL(url).protocol;
        return protocol === "http:" || protocol === "https:";
      }, "Only http/https URLs are allowed"),
    code: z.preprocess(
      (value) =>
        typeof value === "string" && value.trim() === "" ? undefined : value,
      z
        .string()
        .trim()
        .toLowerCase()
        .min(3)
        .max(32)
        .regex(
          /^[a-z0-9-]+$/,
          "Slug must contain only lowercase letters, numbers and '-'",
        )
        .optional(),
    ),
  })
  .strict();

export const myLinksArgsSchema = z
  .object({
    limit: z.number().int().min(1).max(50).optional(),
    cursor: z.preprocess(
      (value) =>
        value === null || value === undefined || value === ""
          ? undefined
          : value,
      z.string().min(1).max(512).optional(),
    ),
  })
  .strict();

export const linkStatsArgsSchema = z
  .object({
    linkId: z.string().uuid(),
    range: z.enum(["DAYS_7", "DAYS_30"]),
  })
  .strict();

export const deleteLinkArgsSchema = z
  .object({
    id: z.string().uuid(),
  })
  .strict();
