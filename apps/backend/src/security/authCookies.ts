import type { Response } from "express";
import { env } from "../config/env";

function encodeCookieValue(value: string): string {
  return encodeURIComponent(value);
}

function buildCookieString(name: string, value: string, maxAgeSeconds: number) {
  const parts = [
    `${name}=${encodeCookieValue(value)}`,
    `Path=${env.COOKIE_PATH}`,
    "HttpOnly",
    `SameSite=${env.COOKIE_SAMESITE}`,
    `Max-Age=${Math.max(0, Math.floor(maxAgeSeconds))}`,
  ];

  if (env.COOKIE_SECURE) parts.push("Secure");
  if (env.COOKIE_DOMAIN) parts.push(`Domain=${env.COOKIE_DOMAIN}`);

  return parts.join("; ");
}

export function setAuthCookie(res: Response, token: string): void {
  res.setHeader(
    "Set-Cookie",
    buildCookieString(env.COOKIE_NAME, token, env.COOKIE_MAX_AGE_SECONDS),
  );
}

export function clearAuthCookie(res: Response): void {
  res.setHeader("Set-Cookie", buildCookieString(env.COOKIE_NAME, "", 0));
}

export function extractCookieValue(cookieHeader: string, cookieName: string) {
  const items = cookieHeader.split(";");
  for (const item of items) {
    const [rawKey, ...rest] = item.trim().split("=");
    if (rawKey !== cookieName) continue;
    const rawValue = rest.join("=");
    return decodeURIComponent(rawValue);
  }
  return null;
}
