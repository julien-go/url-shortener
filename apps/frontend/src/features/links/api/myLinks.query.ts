import { graphqlFetch } from "../../../lib/graphql/graphqlFetch";
import type { MyLinksResponse } from "./types";

export function fetchMyLinks(params: {
  limit: number;
  cursor?: string | null;
}) {
  return graphqlFetch<MyLinksResponse, typeof params>(
    `#graphql
    query MyLinks($limit: Int!, $cursor: String) {
      myLinks(limit: $limit, cursor: $cursor) {
        totalCount
        nextCursor
        items {
          id
          code
          originalUrl
          createdAt
          clickCount
          shortLink
        }
      }
    }
    `,
    params,
  );
}
