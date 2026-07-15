import { describe, expect, it } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { GraphQLRequestError } from "../../../src/lib/graphql/graphqlFetch";
import {
  isUnauthenticatedError,
  resetSessionQueries,
} from "../../../src/features/auth/session";

describe("session", () => {
  describe("isUnauthenticatedError", () => {
    it("is true for a GraphQLRequestError with an UNAUTHENTICATED code", () => {
      const error = new GraphQLRequestError("nope", [
        { message: "nope", extensions: { code: "UNAUTHENTICATED" } },
      ]);
      expect(isUnauthenticatedError(error)).toBe(true);
    });

    it("is true for a GraphQLRequestError with an HTTP 401 status", () => {
      const error = new GraphQLRequestError("HTTP error", [], 401);
      expect(isUnauthenticatedError(error)).toBe(true);
    });

    it("is false for other GraphQL errors and plain errors", () => {
      const badInput = new GraphQLRequestError("bad", [
        { message: "bad", extensions: { code: "BAD_USER_INPUT" } },
      ]);
      expect(isUnauthenticatedError(badInput)).toBe(false);
      expect(isUnauthenticatedError(new Error("boom"))).toBe(false);
      expect(isUnauthenticatedError(null)).toBe(false);
    });
  });

  describe("resetSessionQueries", () => {
    it("nulls the me query and removes every other query", () => {
      const queryClient = new QueryClient();
      queryClient.setQueryData(["me"], { me: { id: "u1" } });
      queryClient.setQueryData(["myLinks", 10, null], { myLinks: {} });
      queryClient.setQueryData(["linkStats", "l1", "DAYS_7"], {});

      resetSessionQueries(queryClient);

      expect(queryClient.getQueryData(["me"])).toEqual({ me: null });
      expect(queryClient.getQueryData(["myLinks", 10, null])).toBeUndefined();
      expect(
        queryClient.getQueryData(["linkStats", "l1", "DAYS_7"]),
      ).toBeUndefined();
    });
  });
});
