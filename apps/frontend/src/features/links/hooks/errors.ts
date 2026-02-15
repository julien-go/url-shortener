import {
  GraphQLRequestError,
  type GraphQLErrorItem,
} from "../../../lib/graphql/graphqlFetch";

export function isGraphQLRequestError(e: unknown): e is GraphQLRequestError {
  return e instanceof GraphQLRequestError;
}

export function getGraphQLErrorCode(
  error: GraphQLErrorItem,
): string | undefined {
  const code = error.extensions?.code;
  return typeof code === "string" ? code : undefined;
}

function getFirstValidationIssueMessage(
  error: GraphQLErrorItem,
): string | null {
  const validation = error.extensions?.validation;
  if (!validation || typeof validation !== "object") return null;

  const flat = validation as {
    fieldErrors?: Record<string, string[] | undefined>;
  };
  const fieldErrors = flat.fieldErrors;
  if (!fieldErrors || typeof fieldErrors !== "object") return null;

  const firstField = Object.values(fieldErrors)[0];
  const firstMessage = Array.isArray(firstField) ? firstField[0] : null;
  return typeof firstMessage === "string" && firstMessage.length > 0
    ? firstMessage
    : null;
}

export function getGraphQLRequestErrorMessage(
  err: unknown,
  fallback = "GraphQL error.",
): string {
  if (!isGraphQLRequestError(err)) {
    if (err instanceof Error) return err.message;
    return fallback;
  }

  const first = err.errors[0];
  if (!first) return fallback;

  const validationMessage = getFirstValidationIssueMessage(first);
  if (validationMessage) return validationMessage;

  return first.message || fallback;
}

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
        return getGraphQLRequestErrorMessage(err, "GraphQL error.");
    }
  }

  if (err instanceof Error) return err.message;
  return "An unknown error has occurred.";
}
