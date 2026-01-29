import { graphqlFetch } from "../../../lib/graphql/graphqlFetch";
import type { AuthPayload } from "./types";

const REGISTER = `
mutation Register($input: RegisterInput!) {
  register(input: $input) {
    token
    user { id email createdAt }
  }
}
`;

export function register(input: { email: string; password: string }) {
  return graphqlFetch<{ register: AuthPayload }, { input: typeof input }>(
    REGISTER,
    { input },
  );
}
