import "dotenv/config";

function envNumber(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function envBoolean(name: string, fallback: boolean): boolean {
  const raw = process.env[name];
  if (!raw) return fallback;

  const normalized = raw.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return fallback;
}

function parseOrigins(raw: string | undefined): string[] {
  if (!raw) return [];

  return raw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

const NODE_ENV = process.env.NODE_ENV ?? "development";
const isProduction = NODE_ENV === "production";

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN;
const EXTRA_FRONTEND_ORIGINS = parseOrigins(process.env.FRONTEND_ORIGINS);
const CORS_ALLOWED_ORIGINS = Array.from(
  new Set([FRONTEND_ORIGIN, ...EXTRA_FRONTEND_ORIGINS].filter(Boolean)),
);

if (isProduction && !FRONTEND_ORIGIN) {
  throw new Error("FRONTEND_ORIGIN must be set in production");
}

const METRICS_ENABLED = envBoolean("METRICS_ENABLED", !isProduction);
const METRICS_API_KEY = process.env.METRICS_API_KEY;

if (isProduction && METRICS_ENABLED && !METRICS_API_KEY) {
  throw new Error("METRICS_API_KEY must be set when metrics are enabled");
}

export const env = {
  PORT: envNumber("PORT", 4000),
  FRONTEND_ORIGIN,
  FRONTEND_ORIGINS: EXTRA_FRONTEND_ORIGINS,
  CORS_ALLOWED_ORIGINS,
  DATABASE_URL: process.env.DATABASE_URL,
  TRUST_PROXY: envNumber("TRUST_PROXY", 1),
  JSON_BODY_LIMIT: process.env.JSON_BODY_LIMIT ?? "16kb",
  RL_REDIRECT_WINDOW_MS: envNumber("RL_REDIRECT_WINDOW_MS", 60_000),
  RL_REDIRECT_MAX: envNumber("RL_REDIRECT_MAX", 60),
  RL_CREATE_WINDOW_MS: envNumber("RL_CREATE_WINDOW_MS", 60_000),
  RL_CREATE_MAX: envNumber("RL_CREATE_MAX", 10),
  RL_AUTH_WINDOW_MS: envNumber("RL_AUTH_WINDOW_MS", 60_000),
  RL_AUTH_MAX: envNumber("RL_AUTH_MAX", 5),
  RL_AUTH_BLOCK_BASE_SECONDS: envNumber("RL_AUTH_BLOCK_BASE_SECONDS", 30),
  NODE_ENV,
  COOKIE_NAME: process.env.COOKIE_NAME ?? "auth_token",
  COOKIE_SAMESITE: (process.env.COOKIE_SAMESITE ?? "Lax") as
    | "Lax"
    | "Strict"
    | "None",
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN,
  COOKIE_PATH: process.env.COOKIE_PATH ?? "/",
  COOKIE_SECURE: envBoolean("COOKIE_SECURE", false),
  COOKIE_MAX_AGE_SECONDS: envNumber("COOKIE_MAX_AGE_SECONDS", 15 * 60),
  ENABLE_CSP: envBoolean("ENABLE_CSP", true),
  METRICS_ENABLED,
  METRICS_API_KEY,
};
