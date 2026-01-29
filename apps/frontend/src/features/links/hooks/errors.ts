import { GraphQLRequestError } from "../../../lib/graphql/graphqlFetch";

export type CreateShortUrlReason =
  | "SLUG_TAKEN"
  | "INVALID_URL"
  | "INVALID_CODE"
  | "VALIDATION_ERROR";

export function getCreateShortUrlErrorMessage(err: unknown): string {
  if (err instanceof GraphQLRequestError) {
    const first = err.errors[0];
    const reason = first.extensions?.reason as CreateShortUrlReason | undefined;

    switch (reason) {
      case "SLUG_TAKEN":
        return "Slug already taken.";
      case "INVALID_URL":
        return "Invalid URL (http/https only).";
      case "INVALID_CODE":
        return "Invalid slug (letters/numbers and '-').";
      case "VALIDATION_ERROR":
        return "Invalid inputs.";
      default:
        return first.message || "GraphQL error.";
    }
  }

  if (err instanceof Error) return err.message;
  return "An unknown error has occurred.";
}
