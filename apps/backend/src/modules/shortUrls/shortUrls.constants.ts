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
