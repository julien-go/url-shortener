import { z } from "zod";
import { MAX_TARGET_URL_LENGTH } from "../../modules/shortUrls/shortUrls.constants";

export const createShortUrlInputSchema = z
  .object({
    originalUrl: z.string().trim().min(1).max(MAX_TARGET_URL_LENGTH),
    code: z.preprocess(
      (value) =>
        typeof value === "string" && value.trim() === "" ? undefined : value,
      z.string().trim().optional(),
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
    range: z.enum(["DAYS_7", "DAYS_30", "DAYS_90", "MONTHS_12"]),
  })
  .strict();

export const deleteLinkArgsSchema = z
  .object({
    id: z.string().uuid(),
  })
  .strict();
