import type { QueryClient } from "@tanstack/react-query";
import { GraphQLRequestError } from "../../lib/graphql/graphqlFetch";

const HTTP_STATUS_UNAUTHORIZED = 401;

export function isUnauthenticatedError(error: unknown): boolean {
  if (!(error instanceof GraphQLRequestError)) return false;
  if (error.status === HTTP_STATUS_UNAUTHORIZED) return true;
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
