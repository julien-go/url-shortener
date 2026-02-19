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

export const env = {
  PORT: envNumber("PORT", 4000),
  FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN,
  DATABASE_URL: process.env.DATABASE_URL,
  TRUST_PROXY: envNumber("TRUST_PROXY", 1),
  JSON_BODY_LIMIT: process.env.JSON_BODY_LIMIT ?? "16kb",
  RL_REDIRECT_WINDOW_MS: envNumber("RL_REDIRECT_WINDOW_MS", 60_000),
  RL_REDIRECT_MAX: envNumber("RL_REDIRECT_MAX", 60),
  RL_CREATE_WINDOW_MS: envNumber("RL_CREATE_WINDOW_MS", 60_000),
  RL_CREATE_MAX: envNumber("RL_CREATE_MAX", 10),
  NODE_ENV: process.env.NODE_ENV ?? "development",
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
};
