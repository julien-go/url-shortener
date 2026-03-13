import { GraphQLError } from "graphql";
import type { GraphQLContext } from "../context";

export function requireAuth(ctx: GraphQLContext): {
  id: string;
  email: string;
} {
  if (!ctx.user) {
    throw new GraphQLError("Not authenticated", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  return ctx.user;
}

export function badUserInput(message: string, validation?: unknown): never {
  throw new GraphQLError(message, {
    extensions: {
      code: "BAD_USER_INPUT",
      ...(validation ? { validation } : {}),
    },
  });
}

export function internalServerError(message: string): never {
  throw new GraphQLError(message, {
    extensions: { code: "INTERNAL_SERVER_ERROR" },
  });
}
