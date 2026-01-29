import { graphqlFetch } from "../../../lib/graphql/graphqlFetch";

export function deleteLink(id: string) {
  return graphqlFetch<{ deleteLink: boolean }, { id: string }>(
    `#graphql
    mutation DeleteLink($id: ID!) {
      deleteLink(id: $id)
    }
    `,
    { id },
  );
}
