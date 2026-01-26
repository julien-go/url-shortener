import express from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";

import { env } from "./config/env";
import { typeDefs } from "./graphql/schema";
import { resolvers } from "./graphql/resolvers";

const app = express();

app.use(
  "/graphql",
  cors({ origin: env.FRONTEND_ORIGIN, credentials: true }),
  express.json(),
);

const server = new ApolloServer({ typeDefs, resolvers });
await server.start();

app.use("/graphql", expressMiddleware(server));

app.listen(env.PORT, () => {
  console.log(`✅ Backend GraphQL: http://localhost:${env.PORT}/graphql`);
});
