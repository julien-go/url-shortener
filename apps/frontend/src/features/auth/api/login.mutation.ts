import { graphqlFetch } from "../../../lib/graphql/graphqlFetch";
import type { AuthPayload } from "./types";

const LOGIN = `
mutation Login($input: LoginInput!) {
  login(input: $input) {
    token
    user { id email createdAt }
  }
}
`;

export function login(input: { email: string; password: string }) {
  return graphqlFetch<{ login: AuthPayload }, { input: typeof input }>(LOGIN, {
    input,
  });
}
