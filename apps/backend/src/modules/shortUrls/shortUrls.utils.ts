import { randomInt } from "node:crypto";
import {
  RESERVED_CODES,
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

const IPV4_OCTET_MAX = 255;
const PRIVATE_CLASS_A_OCTET = 10;
const LOOPBACK_OCTET = 127;
const LINK_LOCAL_OCTETS = { first: 169, second: 254 };
const PRIVATE_CLASS_B_OCTETS = { first: 172, secondMin: 16, secondMax: 31 };
const PRIVATE_CLASS_C_OCTETS = { first: 192, second: 168 };

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

function normalizeHostname(hostname: string): string {
  const h = hostname.trim().toLowerCase();

  if (h.startsWith("[") && h.endsWith("]")) return h.slice(1, -1);

  return h;
}

function isPrivateOrSensitiveHost(hostname: string): boolean {
  const normalized = normalizeHostname(hostname);

  if (BLOCKED_HOSTNAMES.has(normalized) || normalized.endsWith(".localhost")) {
    return true;
  }

  if (isIPv4(normalized)) {
    return isPrivateIPv4(normalized);
  }

  if (isSensitiveIPv6(normalized)) {
    return true;
  }

  return false;
}

function isSensitiveIPv6(value: string): boolean {
  if (!value.includes(":")) return false;

  const normalized = value.toLowerCase();

  if (normalized === "::1") return true;
  if (normalized.startsWith("fe80:")) return true; // link-local

  const firstHextet = normalized.split(":", 1)[0];

  if (/^[0-9a-f]{1,4}$/.test(firstHextet)) {
    const parsed = Number.parseInt(firstHextet, 16);

    if ((parsed & 0xfe00) === 0xfc00) return true;
  }

  const mappedPrefix = "::ffff:";
  if (normalized.startsWith(mappedPrefix)) {
    return true;
  }

  return false;
}

function isIPv4(value: string): boolean {
  const parts = value.split(".");
  if (parts.length !== 4) return false;

  return parts.every((part) => {
    if (!/^\d+$/.test(part)) return false;
    const n = Number(part);
    return n >= 0 && n <= IPV4_OCTET_MAX;
  });
}

function isPrivateIPv4(ip: string): boolean {
  const [a, b] = ip.split(".").map(Number);

  return (
    a === PRIVATE_CLASS_A_OCTET ||
    a === LOOPBACK_OCTET ||
    (a === LINK_LOCAL_OCTETS.first && b === LINK_LOCAL_OCTETS.second) ||
    (a === PRIVATE_CLASS_B_OCTETS.first &&
      b >= PRIVATE_CLASS_B_OCTETS.secondMin &&
      b <= PRIVATE_CLASS_B_OCTETS.secondMax) ||
    (a === PRIVATE_CLASS_C_OCTETS.first && b === PRIVATE_CLASS_C_OCTETS.second)
  );
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
