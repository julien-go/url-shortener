import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { graphqlFetch } from "../../../lib/graphql/graphqlFetch";
import type { LinkStatsResponse } from "../api/types";

export type StatsRange = "DAYS_7" | "DAYS_30";

const LINK_STATS_QUERY = `#graphql
  query LinkStats($linkId: ID!, $range: StatsRange!) {
    linkStats(linkId: $linkId, range: $range) {
      linkId
      totalClicks
      lastClickedAt
      series {
        dayUtc
        clicks
      }
      link {
        id
        code
        originalUrl
        createdAt
        clickCount
        shortLink
      }
    }
  }
`;

function fetchLinkStats(params: { linkId: string; range: StatsRange }) {
  return graphqlFetch<LinkStatsResponse, typeof params>(
    LINK_STATS_QUERY,
    params,
  );
}

export function useLinkStats(
  linkId: string,
  range: StatsRange,
  enabled = true,
) {
  return useQuery({
    queryKey: ["linkStats", linkId, range],
    queryFn: () => fetchLinkStats({ linkId, range }),
    enabled: enabled && Boolean(linkId),
    staleTime: 10_000,
    placeholderData: keepPreviousData,
  });
}
