const API_URL = import.meta.env.VITE_API_URL as string;

let onUnauthenticated: (() => void) | null = null;

export function setGraphqlOnUnauthenticated(fn: () => void) {
  onUnauthenticated = fn;
}

export type GraphQLErrorItem = {
  message: string;
  locations?: { line: number; column: number }[];
  path?: (string | number)[];
  extensions?: Record<string, unknown>;
};

export class GraphQLRequestError extends Error {
  public readonly errors: GraphQLErrorItem[];
  public readonly status?: number;

  constructor(message: string, errors: GraphQLErrorItem[], status?: number) {
    super(message);
    this.name = "GraphQLRequestError";
    this.errors = errors;
    this.status = status;
  }
}

export async function graphqlFetch<
  TData,
  TVars extends Record<string, unknown> = Record<string, never>,
>(query: string, variables?: TVars): Promise<TData> {
  const res = await fetch(API_URL, {
    method: "POST",
    credentials: "include",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new GraphQLRequestError("Invalid JSON response", [], res.status);
  }

  if (!res.ok) {
    throw new GraphQLRequestError("HTTP error", [], res.status);
  }

  if (
    typeof json === "object" &&
    json !== null &&
    "errors" in json &&
    Array.isArray((json as { errors?: unknown }).errors) &&
    (json as { errors?: unknown[] }).errors?.length
  ) {
    const first = (json as { errors: GraphQLErrorItem[] }).errors[0];
    const code = first?.extensions?.code;

    if (code === "UNAUTHENTICATED") {
      onUnauthenticated?.();
    }

    throw new GraphQLRequestError(
      first?.message ?? "GraphQL error",
      (json as { errors: GraphQLErrorItem[] }).errors,
      res.status,
    );
  }

  if (typeof json === "object" && json !== null && "data" in json) {
    return (json as { data: TData }).data;
  }

  throw new GraphQLRequestError("Missing GraphQL data", [], res.status);
}
