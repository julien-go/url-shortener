import express from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { GraphQLError } from "graphql";
import { expressMiddleware } from "@as-integrations/express5";
import { env } from "./config/env";
import { typeDefs } from "./graphql/schema";
import { resolvers } from "./graphql/resolvers";
import { redirectRouter } from "./http/routes/redirect.route";
import { buildContext } from "./graphql/context";
import {
  authIpRateLimit,
  authRateLimit,
  createShortUrlRateLimit,
} from "./security/rateLimit.middleware";
import { securityHeadersMiddleware } from "./security/headers";
import { getRateLimitMetricsSnapshot } from "./security/rateLimit";
import { logger } from "./utils/logger";

const app = express();
const isProduction = env.NODE_ENV === "production";

app.set("trust proxy", env.TRUST_PROXY);
app.use(securityHeadersMiddleware);

app.use(
  "/graphql",
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (env.CORS_ALLOWED_ORIGINS.includes(origin))
        return callback(null, true);
      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  }),
  express.json({ limit: env.JSON_BODY_LIMIT }),
  authIpRateLimit,
  authRateLimit,
  createShortUrlRateLimit,
);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: !isProduction,
  includeStacktraceInErrorResponses: !isProduction,
  formatError: (formattedError, error) => {
    const extensionCode = formattedError.extensions?.code;
    const safeCode =
      typeof extensionCode === "string" && extensionCode.length > 0
        ? extensionCode
        : "INTERNAL_SERVER_ERROR";

    if (safeCode === "INTERNAL_SERVER_ERROR") {
      logger.error({ err: error }, "GraphQL internal error");
    }

    if (!isProduction) return formattedError;

    return new GraphQLError(
      safeCode === "INTERNAL_SERVER_ERROR"
        ? "Internal server error"
        : formattedError.message,
      {
        extensions: { code: safeCode },
      },
    );
  },
});
await server.start();

app.use(
  "/graphql",
  expressMiddleware(server, {
    context: async ({ req, res }) => buildContext(req, res),
  }),
);

app.get("/healthz", (_req, res) => {
  res.json({ ok: true });
});

if (env.METRICS_ENABLED) {
  app.get("/metrics", (req, res) => {
    const hasValidApiKey =
      !env.METRICS_API_KEY ||
      req.header("x-metrics-api-key") === env.METRICS_API_KEY;

    if (!hasValidApiKey) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    return res.json({
      rateLimit: getRateLimitMetricsSnapshot(),
    });
  });
}

app.use("/", redirectRouter);

app.listen(env.PORT, () => {
  logger.info(
    { url: `${env.PUBLIC_BASE_URL}/graphql` },
    "Backend GraphQL ready",
  );
});
