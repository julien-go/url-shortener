import express from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { env } from "./config/env";
import { typeDefs } from "./graphql/schema";
import { resolvers } from "./graphql/resolvers";
import { redirectRouter } from "./http/routes/redirect.route";
import { buildContext } from "./graphql/context";
import {
  authRateLimit,
  createShortUrlRateLimit,
} from "./security/rateLimit.middleware";
import { securityHeadersMiddleware } from "./security/headers";
import { getRateLimitMetricsSnapshot } from "./security/rateLimit";

const app = express();

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
  }),
  express.json({ limit: env.JSON_BODY_LIMIT }),
  authRateLimit,
  createShortUrlRateLimit,
);

const server = new ApolloServer({ typeDefs, resolvers });
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
  console.log(`✅ Backend GraphQL: http://localhost:${env.PORT}/graphql`);
});
