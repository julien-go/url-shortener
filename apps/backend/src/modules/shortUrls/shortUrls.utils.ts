import { randomInt } from "node:crypto";
import {
  RESERVED_CODES,
  SLUG_MAX_LENGTH,
  SLUG_MIN_LENGTH,
  SLUG_REGEX,
} from "./shortUrls.constants";

export function isHttpUrlProtocol(url: string): boolean {
  try {
    const protocol = new URL(url).protocol;
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

export function isValidSlug(code: string): boolean {
  const normalizedCode = code.toLowerCase();
  return (
    SLUG_REGEX.test(code) &&
    code.length >= SLUG_MIN_LENGTH &&
    code.length <= SLUG_MAX_LENGTH &&
    !RESERVED_CODES.has(normalizedCode)
  );
}

export function generateRandomSlug(length: number): string {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let slug = "";

  for (let i = 0; i < length; i++) {
    slug += chars[randomInt(chars.length)];
  }

  return slug;
}

export function isUniqueViolation(err: unknown): boolean {
  // Postgres unique_violation
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: unknown }).code === "23505"
  );
}
