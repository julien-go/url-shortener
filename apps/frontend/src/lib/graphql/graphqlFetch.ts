const API_URL = import.meta.env.VITE_API_URL as string;

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

async function parseJsonBody(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    throw new GraphQLRequestError("Invalid JSON response", [], res.status);
  }
}

function extractGraphQLErrors(json: unknown): GraphQLErrorItem[] | null {
  if (
    typeof json === "object" &&
    json !== null &&
    "errors" in json &&
    Array.isArray((json as { errors?: unknown }).errors) &&
    (json as { errors?: unknown[] }).errors?.length
  ) {
    return (json as { errors: GraphQLErrorItem[] }).errors;
  }
  return null;
}

function hasData(json: unknown): json is { data: unknown } {
  return typeof json === "object" && json !== null && "data" in json;
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

  const json = await parseJsonBody(res);

  if (!res.ok) {
    throw new GraphQLRequestError("HTTP error", [], res.status);
  }

  const errors = extractGraphQLErrors(json);
  if (errors) {
    throw new GraphQLRequestError(
      errors[0]?.message ?? "GraphQL error",
      errors,
      res.status,
    );
  }

  if (hasData(json)) {
    return json.data as TData;
  }

  throw new GraphQLRequestError("Missing GraphQL data", [], res.status);
}
