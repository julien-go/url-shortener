import {
  SLUG_MAX_LENGTH,
  SLUG_MIN_LENGTH,
  SLUG_REGEX,
} from "./shortUrls.constants";

export function isValidHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function isValidSlug(code: string): boolean {
  return (
    SLUG_REGEX.test(code) &&
    code.length >= SLUG_MIN_LENGTH &&
    code.length <= SLUG_MAX_LENGTH
  );
}

export function generateRandomSlug(length: number): string {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let slug = "";

  for (let i = 0; i < length; i++) {
    slug += chars[Math.floor(Math.random() * chars.length)];
  }

  return slug;
}

export function isUniqueViolation(err: unknown): boolean {
  // Postgres unique_violation
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as any).code === "23505"
  );
}
