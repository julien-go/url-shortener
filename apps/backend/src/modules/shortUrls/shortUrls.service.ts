import { findByCode, trackClick } from "./shortUrls.repo";
import { ResolveShortUrlResult } from "./shortUrls.types";
import { AUTO_SLUG_LENGTH, MAX_SLUG_RETRIES } from "./shortUrls.constants";
import { CreateShortUrlInput, CreateShortUrlResult } from "./shortUrls.types";
import { createShortUrlRow } from "./shortUrls.repo";
import { env } from "../../config/env";
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
    void trackClick(link.id).catch(console.error);
  }

  return { ok: true, targetUrl: link.target_url };
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
    try {
      const row = await createShortUrlRow({
        code: customCode,
        targetUrl: originalUrl,
        userId: userId,
      });

      return {
        ok: true,
        shortUrl: row,
        shortLink: `${publicBaseUrl}/${row.code}`,
      };
    } catch (err) {
      if (isUniqueViolation(err)) {
        return { ok: false, reason: "SLUG_TAKEN" };
      }
      throw err;
    }
  }

  for (let attempt = 0; attempt < MAX_SLUG_RETRIES; attempt++) {
    const code = generateRandomSlug(AUTO_SLUG_LENGTH);

    try {
      const row = await createShortUrlRow({
        code,
        targetUrl: originalUrl,
        userId: userId,
      });

      return {
        ok: true,
        shortUrl: row,
        shortLink: `${publicBaseUrl}/${row.code}`,
      };
    } catch (err) {
      if (!isUniqueViolation(err)) throw err;
      // collision => retry
    }
  }

  throw new Error("Could not generate a unique slug after retries");
}
