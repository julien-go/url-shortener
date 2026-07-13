import "dotenv/config";
import { z } from "zod";

const NODE_ENV = process.env.NODE_ENV ?? "development";
const isProduction = NODE_ENV === "production";

const booleanFromEnv = (fallback: boolean) =>
  z
    .string()
    .optional()
    .transform((raw) => {
      if (raw === undefined) return fallback;
      const normalized = raw.trim().toLowerCase();
      if (["1", "true", "yes", "on"].includes(normalized)) return true;
      if (["0", "false", "no", "off"].includes(normalized)) return false;
      return fallback;
    });

const numberFromEnv = (fallback: number) =>
  z
    .string()
    .optional()
    .transform((raw) => {
      if (raw === undefined || raw.trim() === "") return fallback;
      const parsed = Number(raw);
      return Number.isFinite(parsed) ? parsed : fallback;
    });

const originsFromEnv = z
  .string()
  .optional()
  .transform((raw) =>
    raw
      ? raw
          .split(",")
          .map((origin) => origin.trim())
          .filter(Boolean)
      : [],
  );

const schema = z
  .object({
    PORT: numberFromEnv(4000),
    FRONTEND_ORIGIN: z.string().optional(),
    FRONTEND_ORIGINS: originsFromEnv,
    PUBLIC_BASE_URL: z.string().optional(),
    DATABASE_URL: z.string().optional(),
    JWT_SECRET: z.string().optional(),
    TRUST_PROXY: numberFromEnv(1),
    JSON_BODY_LIMIT: z.string().default("16kb"),
    RL_REDIRECT_WINDOW_MS: numberFromEnv(60_000),
    RL_REDIRECT_MAX: numberFromEnv(60),
    RL_CREATE_WINDOW_MS: numberFromEnv(60_000),
    RL_CREATE_MAX: numberFromEnv(10),
    RL_AUTH_WINDOW_MS: numberFromEnv(60_000),
    RL_AUTH_MAX: numberFromEnv(5),
    RL_AUTH_IP_MAX: numberFromEnv(20),
    RL_AUTH_BLOCK_BASE_SECONDS: numberFromEnv(30),
    COOKIE_NAME: z.string().default("auth_token"),
    COOKIE_SAMESITE: z.enum(["Lax", "Strict", "None"]).default("Lax"),
    COOKIE_DOMAIN: z.string().optional(),
    COOKIE_PATH: z.string().default("/"),
    COOKIE_SECURE: booleanFromEnv(false),
    COOKIE_MAX_AGE_SECONDS: numberFromEnv(60 * 60 * 24 * 7),
    ENABLE_CSP: booleanFromEnv(true),
    APP_NAME: z.string().optional(),
    APP_DASHBOARD_URL: z.string().optional(),
    METRICS_ENABLED: booleanFromEnv(!isProduction),
    METRICS_API_KEY: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.COOKIE_SAMESITE === "None" && !value.COOKIE_SECURE) {
      ctx.addIssue({
        code: "custom",
        path: ["COOKIE_SECURE"],
        message: "COOKIE_SECURE must be true when COOKIE_SAMESITE=None",
      });
    }

    if (!isProduction) return;

    if (!value.FRONTEND_ORIGIN) {
      ctx.addIssue({
        code: "custom",
        path: ["FRONTEND_ORIGIN"],
        message: "FRONTEND_ORIGIN must be set in production",
      });
    }

    if (!value.DATABASE_URL) {
      ctx.addIssue({
        code: "custom",
        path: ["DATABASE_URL"],
        message: "DATABASE_URL must be set in production",
      });
    }

    if (!value.PUBLIC_BASE_URL) {
      ctx.addIssue({
        code: "custom",
        path: ["PUBLIC_BASE_URL"],
        message: "PUBLIC_BASE_URL must be set in production",
      });
    }

    if (!value.JWT_SECRET) {
      ctx.addIssue({
        code: "custom",
        path: ["JWT_SECRET"],
        message: "JWT_SECRET must be set in production",
      });
    }

    if (value.METRICS_ENABLED && !value.METRICS_API_KEY) {
      ctx.addIssue({
        code: "custom",
        path: ["METRICS_API_KEY"],
        message: "METRICS_API_KEY must be set when metrics are enabled",
      });
    }
  });

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`)
    .join("\n");
  throw new Error(`Invalid environment configuration:\n${details}`);
}

const config = parsed.data;

const CORS_ALLOWED_ORIGINS = Array.from(
  new Set(
    [config.FRONTEND_ORIGIN, ...config.FRONTEND_ORIGINS].filter(Boolean),
  ),
);

const APP_DASHBOARD_URL =
  config.APP_DASHBOARD_URL ??
  config.FRONTEND_ORIGIN ??
  config.PUBLIC_BASE_URL ??
  "http://localhost:5173";

export const env = {
  PORT: config.PORT,
  FRONTEND_ORIGIN: config.FRONTEND_ORIGIN,
  FRONTEND_ORIGINS: config.FRONTEND_ORIGINS,
  PUBLIC_BASE_URL: config.PUBLIC_BASE_URL,
  CORS_ALLOWED_ORIGINS,
  DATABASE_URL: config.DATABASE_URL,
  JWT_SECRET: config.JWT_SECRET,
  TRUST_PROXY: config.TRUST_PROXY,
  JSON_BODY_LIMIT: config.JSON_BODY_LIMIT,
  RL_REDIRECT_WINDOW_MS: config.RL_REDIRECT_WINDOW_MS,
  RL_REDIRECT_MAX: config.RL_REDIRECT_MAX,
  RL_CREATE_WINDOW_MS: config.RL_CREATE_WINDOW_MS,
  RL_CREATE_MAX: config.RL_CREATE_MAX,
  RL_AUTH_WINDOW_MS: config.RL_AUTH_WINDOW_MS,
  RL_AUTH_MAX: config.RL_AUTH_MAX,
  RL_AUTH_IP_MAX: config.RL_AUTH_IP_MAX,
  RL_AUTH_BLOCK_BASE_SECONDS: config.RL_AUTH_BLOCK_BASE_SECONDS,
  NODE_ENV,
  COOKIE_NAME: config.COOKIE_NAME,
  COOKIE_SAMESITE: config.COOKIE_SAMESITE,
  COOKIE_DOMAIN: config.COOKIE_DOMAIN,
  COOKIE_PATH: config.COOKIE_PATH,
  COOKIE_SECURE: config.COOKIE_SECURE,
  COOKIE_MAX_AGE_SECONDS: config.COOKIE_MAX_AGE_SECONDS,
  ENABLE_CSP: config.ENABLE_CSP,
  APP_NAME: config.APP_NAME,
  APP_DASHBOARD_URL,
  METRICS_ENABLED: config.METRICS_ENABLED,
  METRICS_API_KEY: config.METRICS_API_KEY,
};
