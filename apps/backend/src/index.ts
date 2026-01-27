import express from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { env } from "./config/env";
import { typeDefs } from "./graphql/schema";
import { resolvers } from "./graphql/resolvers";
import { redirectRouter } from "./http/routes/redirect.route";

const app = express();

app.use(
  "/graphql",
  cors({ origin: env.FRONTEND_ORIGIN, credentials: true }),
  express.json(),
);

const server = new ApolloServer({ typeDefs, resolvers });
await server.start();

app.use("/graphql", expressMiddleware(server));

app.use("/", redirectRouter);

app.get("/healthz", (_req, res) => {
  res.json({ ok: true });
});

app.listen(env.PORT, () => {
  console.log(`✅ Backend GraphQL: http://localhost:${env.PORT}/graphql`);
});
