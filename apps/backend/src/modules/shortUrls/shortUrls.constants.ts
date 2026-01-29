export const SLUG_REGEX = /^[a-zA-Z0-9-]+$/;
export const SLUG_MIN_LENGTH = 3;
export const SLUG_MAX_LENGTH = 32;
export const AUTO_SLUG_LENGTH = 7;
export const MAX_SLUG_RETRIES = 5;

export const RESERVED_CODES = new Set([
  // backend
  "graphql",
  "healthz",
  "health",
  "status",
  "metrics",
  "api",
  "auth",
  "login",
  "logout",
  "register",
  "callback",

  // http / infra
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  "assets",
  "static",
  "public",
  "uploads",

  // env / debug
  "dev",
  "test",
  "staging",
  "prod",
  "debug",
  "admin",
  "root",

  // future
  "dashboard",
  "stats",
  "links",
  "users",
  "settings",
  "profile",
  "account",
  "billing",
  "pricing",
]);
