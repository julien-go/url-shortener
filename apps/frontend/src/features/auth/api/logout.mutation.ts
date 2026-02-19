import { graphqlFetch } from "../../../lib/graphql/graphqlFetch";

const LOGOUT = `
mutation Logout {
  logout
}
`;

export function logout() {
  return graphqlFetch<{ logout: boolean }>(LOGOUT);
}
