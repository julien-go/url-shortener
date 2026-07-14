import { pino } from "pino";
import { env } from "../config/env";

const isProduction = env.NODE_ENV === "production";
const level = env.LOG_LEVEL ?? "info";
const usePrettyTransport = env.LOG_PRETTY && !isProduction && level !== "silent";

export const logger = pino({
  level,
  redact: {
    paths: [
      "req.headers.cookie",
      "req.headers.authorization",
      "password",
      "err.detail",
      "err.where",
      "err.hint",
    ],
    remove: true,
  },
  ...(usePrettyTransport
    ? {
        transport: {
          target: "pino-pretty",
          options: { colorize: true, translateTime: "SYS:standard" },
        },
      }
    : {}),
});
