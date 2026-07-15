import type { QueryClient } from "@tanstack/react-query";
import { GraphQLRequestError } from "../../lib/graphql/graphqlFetch";

export function isUnauthenticatedError(error: unknown): boolean {
  if (!(error instanceof GraphQLRequestError)) return false;
  if (error.status === 401) return true;
  return error.errors.some(
    (item) => item.extensions?.code === "UNAUTHENTICATED",
  );
}

export function resetSessionQueries(queryClient: QueryClient) {
  queryClient.setQueryData(["me"], { me: null });
  queryClient.removeQueries({
    predicate: (query) => query.queryKey[0] !== "me",
  });
}
