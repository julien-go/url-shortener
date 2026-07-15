import { findByCode, trackClick } from "./shortUrls.repo";
import { ResolveShortUrlResult } from "./shortUrls.types";
import {
  AUTO_SLUG_LENGTH,
  MAX_SLUG_RETRIES,
  RESERVED_CODES,
} from "./shortUrls.constants";
import { CreateShortUrlInput, CreateShortUrlResult } from "./shortUrls.types";
import { createShortUrlRow } from "./shortUrls.repo";
import { env } from "../../config/env";
import { logger } from "../../utils/logger";
import {
  isValidHttpUrl,
  isValidSlug,
  isUniqueViolation,
  generateRandomSlug,
} from "./shortUrls.utils";

export async function resolveShortUrl(
  code: string,
  opts?: { track?: boolean },
): Promise<ResolveShortUrlResult> {
  const link = await findByCode(code);

  if (!link) return { ok: false, reason: "NOT_FOUND" };
  if (link.deleted_at) return { ok: false, reason: "DELETED" };
  if (!link.is_active) return { ok: false, reason: "INACTIVE" };

  if (opts?.track !== false) {
    void trackClick(link.id).catch((err) => {
      logger.error({ err, shortUrlId: link.id }, "trackClick failed");
    });
  }

  return { ok: true, targetUrl: link.target_url };
}

async function tryCreateShortUrl(
  code: string,
  targetUrl: string,
  userId: string,
  publicBaseUrl: string,
): Promise<CreateShortUrlResult | null> {
  try {
    const row = await createShortUrlRow({ code, targetUrl, userId });

    return {
      ok: true,
      shortUrl: row,
      shortLink: `${publicBaseUrl}/${row.code}`,
    };
  } catch (err) {
    if (!isUniqueViolation(err)) throw err;
    return null;
  }
}

export async function createShortUrl(
  input: CreateShortUrlInput,
  userId: string,
): Promise<CreateShortUrlResult> {
  const originalUrl = input.originalUrl?.trim();
  const customCode = input.code?.trim();

  if (!originalUrl || !isValidHttpUrl(originalUrl)) {
    return { ok: false, reason: "INVALID_URL" };
  }

  if (customCode && !isValidSlug(customCode)) {
    return { ok: false, reason: "INVALID_CODE" };
  }

  const publicBaseUrl = env.PUBLIC_BASE_URL;
  if (!publicBaseUrl) throw new Error("PUBLIC_BASE_URL is not set");

  if (customCode) {
    const result = await tryCreateShortUrl(
      customCode,
      originalUrl,
      userId,
      publicBaseUrl,
    );
    return result ?? { ok: false, reason: "SLUG_TAKEN" };
  }

  for (let attempt = 0; attempt < MAX_SLUG_RETRIES; attempt++) {
    const code = generateRandomSlug(AUTO_SLUG_LENGTH);
    if (RESERVED_CODES.has(code.toLowerCase())) continue;

    const result = await tryCreateShortUrl(
      code,
      originalUrl,
      userId,
      publicBaseUrl,
    );
    if (result) return result;
  }

  throw new Error("Could not generate a unique slug after retries");
}
