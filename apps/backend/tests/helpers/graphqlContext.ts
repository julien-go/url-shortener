import type { GraphQLContext } from "../../src/graphql/context";

export function makeCtx(user: GraphQLContext["user"] = null): GraphQLContext {
  return { user, res: {} as GraphQLContext["res"] };
}
