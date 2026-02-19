import {
  SLUG_MAX_LENGTH,
  SLUG_MIN_LENGTH,
  SLUG_REGEX,
} from "./shortUrls.constants";

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "metadata.google.internal",
  "169.254.169.254",
  "100.100.100.200",
]);

export function isValidHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const isHttp = parsed.protocol === "http:" || parsed.protocol === "https:";

    if (!isHttp) return false;

    return !isPrivateOrSensitiveHost(parsed.hostname);
  } catch {
    return false;
  }
}

function isPrivateOrSensitiveHost(hostname: string): boolean {
  const normalized = hostname.trim().toLowerCase();

  if (BLOCKED_HOSTNAMES.has(normalized) || normalized.endsWith(".localhost")) {
    return true;
  }

  if (normalized === "::1") return true;

  if (isIPv4(normalized)) {
    return isPrivateIPv4(normalized);
  }

  return false;
}

function isIPv4(value: string): boolean {
  const parts = value.split(".");
  if (parts.length !== 4) return false;

  return parts.every((part) => {
    if (!/^\d+$/.test(part)) return false;
    const n = Number(part);
    return n >= 0 && n <= 255;
  });
}

function isPrivateIPv4(ip: string): boolean {
  const [a, b] = ip.split(".").map(Number);

  return (
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168)
  );
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
