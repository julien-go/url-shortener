import { randomInt } from "node:crypto";
import { env } from "../../config/env";
import {
  RESERVED_CODES,
  SLUG_MAX_LENGTH,
  SLUG_MIN_LENGTH,
  SLUG_REGEX,
} from "./shortUrls.constants";

const SLUG_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

export function isHttpUrlProtocol(url: string): boolean {
  try {
    const protocol = new URL(url).protocol;
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

export function normalizeSlug(code: string): string {
  return code.trim().toLowerCase();
}

export function isValidSlug(code: string): boolean {
  return (
    SLUG_REGEX.test(code) &&
    code.length >= SLUG_MIN_LENGTH &&
    code.length <= SLUG_MAX_LENGTH &&
    !RESERVED_CODES.has(code)
  );
}

export function generateRandomSlug(length: number): string {
  let slug = "";

  for (let i = 0; i < length; i++) {
    slug += SLUG_ALPHABET[randomInt(SLUG_ALPHABET.length)];
  }

  return slug;
}

export function buildShortLink(code: string): string {
  const base = env.PUBLIC_BASE_URL;
  if (!base) throw new Error("PUBLIC_BASE_URL is not set");

  return `${base.replace(/\/$/, "")}/${code}`;
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
