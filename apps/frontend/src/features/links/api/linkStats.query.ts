export const LINK_STATS_QUERY = `
  query LinkStats($linkId: ID!, $range: StatsRange!) {
    linkStats(linkId: $linkId, range: $range) {
      totalClicks
      lastClickedAt
      link {
        id
        code
        originalUrl
        createdAt
        clickCount
        shortLink
      }
      series {
        dayUtc
        clicks
      }
    }
  }
`;
