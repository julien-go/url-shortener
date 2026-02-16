import "dotenv/config";

function envNumber(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
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
};
