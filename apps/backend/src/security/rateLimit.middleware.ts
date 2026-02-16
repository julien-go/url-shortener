import type { Request } from "express";
import { verifyToken } from "../modules/auth/auth.service";
import { env } from "../config/env";
import { createFixedWindowRateLimit } from "./rateLimit";

function getClientIp(req: Request): string {
  return req.ip || req.socket.remoteAddress || "unknown";
}

function extractBearerToken(authHeader: unknown): string | null {
  if (typeof authHeader !== "string") return null;

  const trimmed = authHeader.trim();
  if (!trimmed.toLowerCase().startsWith("bearer ")) return null;

  const token = trimmed.slice("bearer ".length).trim();
  return token.length ? token : null;
}

function createShortUrlIdentity(req: Request): string {
  const token = extractBearerToken(req.headers.authorization);
  if (token) {
    const payload = verifyToken(token);
    if (payload?.sub) {
      return `user:${payload.sub}`;
    }
  }

  return `ip:${getClientIp(req)}`;
}

function isCreateShortUrlOperation(req: Request): boolean {
  const body = req.body;
  if (!body || typeof body !== "object") return false;

  const operationName =
    typeof body.operationName === "string" ? body.operationName : "";
  if (operationName.toLowerCase().includes("createshorturl")) return true;

  const query = typeof body.query === "string" ? body.query : "";
  return /\bcreateShortUrl\b/.test(query);
}

export const redirectRateLimit = createFixedWindowRateLimit({
  name: "redirect",
  windowMs: env.RL_REDIRECT_WINDOW_MS,
  max: env.RL_REDIRECT_MAX,
  keyGenerator: (req) => `ip:${getClientIp(req)}`,
  onLimit: (req, res, retryAfterSeconds) => {
    res.setHeader("Retry-After", String(retryAfterSeconds));

    const acceptHeader = String(req.headers.accept ?? "").toLowerCase();
    const secFetchDest = String(
      req.headers["sec-fetch-dest"] ?? "",
    ).toLowerCase();
    const userAgent = String(req.headers["user-agent"] ?? "");

    const isBrowserNavigation =
      req.method === "GET" &&
      acceptHeader.includes("text/html") &&
      (secFetchDest === "document" || userAgent.includes("Mozilla"));

    if (isBrowserNavigation) {
      res.status(429).type("text/html").send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Too many requests</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 2rem; line-height: 1.5; }
      .button { display: inline-block; margin-top: 1rem; padding: 0.6rem 1rem; border-radius: 8px; border: 1px solid #222; text-decoration: none; color: #111; }
      .hint { color: #444; margin-top: 0.5rem; }
    </style>
  </head>
  <body>
    <h1>Too many requests</h1>
    <p>You have reached the request limit for this short link. Please try again in ${retryAfterSeconds} second(s).</p>
    <a class="button" href="${req.originalUrl}">Try again</a>
    <p class="hint">Tip: wait a few seconds before retrying to avoid another limit response.</p>
  </body>
</html>`);
      return;
    }

    res.status(429).json({
      error: "Too many requests",
      retryAfterSeconds,
    });
  },
});

export const createShortUrlRateLimit = createFixedWindowRateLimit({
  name: "createShortUrl",
  windowMs: env.RL_CREATE_WINDOW_MS,
  max: env.RL_CREATE_MAX,
  keyGenerator: (req) => createShortUrlIdentity(req),
  skip: (req) => !isCreateShortUrlOperation(req),
});
