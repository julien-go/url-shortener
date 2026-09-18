import { pool } from "../../db/pool";
import { LinkStats, LinkStatsRow, StatsGranularity } from "./shortUrls.types";

const FIND_LINK_STATS_QUERY = `
  WITH su AS (
    SELECT id, code, target_url, created_at, total_clicks, last_clicked_at
    FROM short_urls
    WHERE id = $1
      AND user_id = $2
      AND deleted_at IS NULL
    LIMIT 1
  ),
  windows AS (
    SELECT
      range_start,
      range_end,
      range_start - (range_end - range_start + 1) AS previous_start,
      range_start - 1 AS previous_end
    FROM (
      SELECT
        date_trunc(
          $4,
          ((now() AT TIME ZONE 'utc')::date - ($3::int - 1))::timestamp
        )::date AS range_start,
        (now() AT TIME ZONE 'utc')::date AS range_end
    ) AS bounds
  ),
  buckets AS (
    SELECT generate_series(
      w.range_start::timestamp,
      w.range_end::timestamp,
      ('1 ' || $4)::interval
    )::date AS bucket_start
    FROM windows w
  ),
  bucketed AS (
    SELECT
      date_trunc($4, dc.day_utc::timestamp)::date AS bucket_start,
      SUM(dc.clicks)::int AS clicks
    FROM daily_clicks dc, windows w
    WHERE dc.short_url_id = (SELECT id FROM su)
      AND dc.day_utc BETWEEN w.range_start AND w.range_end
    GROUP BY 1
  ),
  totals AS (
    SELECT
      COALESCE(SUM(dc.clicks) FILTER (
        WHERE dc.day_utc BETWEEN w.range_start AND w.range_end
      ), 0)::int AS range_clicks,
      COALESCE(SUM(dc.clicks) FILTER (
        WHERE dc.day_utc BETWEEN w.previous_start AND w.previous_end
      ), 0)::int AS previous_range_clicks
    FROM windows w
    LEFT JOIN daily_clicks dc ON dc.short_url_id = (SELECT id FROM su)
  )
  SELECT
    (SELECT id FROM su) AS link_id,
    (SELECT code FROM su) AS code,
    (SELECT target_url FROM su) AS target_url,
    (SELECT created_at FROM su)::text AS created_at,
    (SELECT total_clicks FROM su) AS total_clicks,
    (SELECT last_clicked_at FROM su)::text AS last_clicked_at,
    b.bucket_start::text AS bucket_start,
    COALESCE(bk.clicks, 0) AS clicks,
    t.range_clicks,
    t.previous_range_clicks
  FROM buckets b
  LEFT JOIN bucketed bk ON bk.bucket_start = b.bucket_start
  CROSS JOIN totals t
  WHERE (SELECT id FROM su) IS NOT NULL
  ORDER BY b.bucket_start ASC;
`;

export async function findLinkStats(params: {
  userId: string;
  linkId: string;
  days: number;
  granularity: StatsGranularity;
  pgGrain: "day" | "week" | "month";
}): Promise<LinkStats | null> {
  const { userId, linkId, days, granularity, pgGrain } = params;

  const { rows } = await pool.query<LinkStatsRow>(FIND_LINK_STATS_QUERY, [
    linkId,
    userId,
    days,
    pgGrain,
  ]);

  if (rows.length === 0) return null;

  const firstRow = rows[0];

  return {
    linkId: firstRow.link_id,
    totalClicks: firstRow.total_clicks,
    lastClickedAt: firstRow.last_clicked_at,
    link: {
      id: firstRow.link_id,
      code: firstRow.code,
      originalUrl: firstRow.target_url,
      createdAt: firstRow.created_at,
      clickCount: String(firstRow.total_clicks ?? 0),
    },
    granularity,
    rangeClicks: firstRow.range_clicks,
    previousRangeClicks: firstRow.previous_range_clicks,
    series: rows.map((row) => ({
      bucketStart: row.bucket_start,
      clicks: row.clicks,
    })),
  };
}
