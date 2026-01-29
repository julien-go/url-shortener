const API_URL = import.meta.env.VITE_API_URL as string;

type GraphQLErrorItem = {
  message: string;
  extensions?: {
    code?: string;
    reason?: string;
    validation?: unknown;
  };
};

type GraphQLResponse<T> = {
  data?: T;
  errors?: GraphQLErrorItem[];
};

export class GraphQLRequestError extends Error {
  public readonly errors: GraphQLErrorItem[];

  constructor(message: string, errors: GraphQLErrorItem[]) {
    super(message);
    this.name = "GraphQLRequestError";
    this.errors = errors;
  }
}

export async function graphqlFetch<
  TData,
  TVars extends Record<string, unknown> = Record<string, never>,
>(query: string, variables?: TVars): Promise<TData> {
  if (!API_URL) throw new Error("VITE_API_URL is not set");

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });

  const json = (await res.json()) as GraphQLResponse<TData>;

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  if (json.errors?.length) {
    throw new GraphQLRequestError(
      json.errors[0]?.message ?? "GraphQL error",
      json.errors,
    );
  }

  if (!json.data) {
    throw new Error("No data returned from GraphQL");
  }

  return json.data;
}
