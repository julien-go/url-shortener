import type { Request } from "express";
import { env } from "../config/env";
import { verifyToken } from "../modules/auth/auth.service";
import { createFixedWindowRateLimit } from "./rateLimit";
import { extractCookieValue } from "./authCookies";
import { renderStatusPage } from "../http/statusPage";

function getClientIp(req: Request): string {
  return req.ip || req.socket.remoteAddress || "unknown";
}

function createShortUrlIdentity(req: Request): string {
  const cookieToken =
    typeof req.headers.cookie === "string"
      ? extractCookieValue(req.headers.cookie, env.COOKIE_NAME)
      : null;

  if (cookieToken) {
    const payload = verifyToken(cookieToken);
    if (payload?.sub) {
      return `user:${payload.sub}`;
    }
  }

  return `ip:${getClientIp(req)}`;
}

function getGraphqlBody(req: Request): Record<string, unknown> | null {
  const body = req.body;
  if (!body || typeof body !== "object") return null;
  return body as Record<string, unknown>;
}

function isOperation(
  req: Request,
  pattern: RegExp,
  operationHint: string,
): boolean {
  const body = getGraphqlBody(req);
  if (!body) return false;

  const operationName =
    typeof body.operationName === "string" ? body.operationName : "";
  if (operationName.toLowerCase().includes(operationHint)) return true;

  const query = typeof body.query === "string" ? body.query : "";
  return pattern.test(query);
}

function isCreateShortUrlOperation(req: Request): boolean {
  return isOperation(req, /\bcreateShortUrl\b/, "createshorturl");
}

function isAuthMutationOperation(req: Request): boolean {
  return (
    isOperation(req, /\blogin\b/, "login") ||
    isOperation(req, /\bregister\b/, "register")
  );
}

function extractAuthEmail(req: Request): string | null {
  const body = getGraphqlBody(req);
  if (!body) return null;

  const variables = body.variables;
  if (!variables || typeof variables !== "object") return null;

  const input = (variables as Record<string, unknown>).input;
  if (!input || typeof input !== "object") return null;

  const email = (input as Record<string, unknown>).email;
  if (typeof email !== "string") return null;

  const normalized = email.trim().toLowerCase();
  return normalized.length ? normalized : null;
}

function createAuthIdentity(req: Request): string {
  const ip = getClientIp(req);
  const email = extractAuthEmail(req) ?? "unknown-email";

  return `auth:${ip}:${email}`;
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
      res
        .status(429)
        .type("html")
        .send(
          renderStatusPage({
            title: `Too many requests • ${env.APP_NAME}`,
            heading: "Too many requests",
            message:
              `You have reached the request limit for this short link. ` +
              `Please try again in ${retryAfterSeconds} second(s).`,
            actionHref: req.originalUrl,
            actionLabel: "Try again",
            brandName: env.APP_NAME,
          }),
        );
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

export const authIpRateLimit = createFixedWindowRateLimit({
  name: "auth-ip",
  windowMs: env.RL_AUTH_WINDOW_MS,
  max: env.RL_AUTH_IP_MAX,
  keyGenerator: (req) => `authip:${getClientIp(req)}`,
  skip: (req) => !isAuthMutationOperation(req),
});

export const authRateLimit = createFixedWindowRateLimit({
  name: "auth",
  windowMs: env.RL_AUTH_WINDOW_MS,
  max: env.RL_AUTH_MAX,
  keyGenerator: (req) => createAuthIdentity(req),
  skip: (req) => !isAuthMutationOperation(req),
  onLimit: (_req, res, retryAfterSeconds) => {
    res.setHeader("Retry-After", String(retryAfterSeconds));
    res.status(429).json({
      error: "Too many authentication attempts",
      retryAfterSeconds,
    });
  },
});
