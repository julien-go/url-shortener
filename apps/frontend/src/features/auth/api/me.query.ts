import { graphqlFetch } from "../../../lib/graphql/graphqlFetch";
import type { AuthUser } from "./types";

const ME = `
query Me {
  me { id email createdAt }
}
`;

export function me() {
  return graphqlFetch<{ me: AuthUser | null }>(ME);
}
