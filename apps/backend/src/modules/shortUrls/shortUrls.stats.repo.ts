import { pool } from "../../db/pool";
import { LinkStats, LinkStatsRow } from "./shortUrls.types";

export async function findLinkStats(params: {
  userId: string;
  linkId: string;
  days: number;
}): Promise<LinkStats | null> {
  const { userId, linkId, days } = params;

  const { rows } = await pool.query<LinkStatsRow>(
    `
    WITH su AS (
      SELECT id, total_clicks, last_clicked_at
      FROM short_urls
      WHERE id = $1
        AND user_id = $2
        AND deleted_at IS NULL
      LIMIT 1
    ),
    days AS (
      SELECT generate_series(
        ((now() AT TIME ZONE 'utc')::date - ($3::int - 1)),
        (now() AT TIME ZONE 'utc')::date,
        interval '1 day'
      )::date AS day_utc
    )
    SELECT
      (SELECT id FROM su) AS link_id,
      (SELECT total_clicks FROM su) AS total_clicks,
      (SELECT last_clicked_at FROM su)::text AS last_clicked_at,
      d.day_utc::text AS day_utc,
      COALESCE(dc.clicks, 0)::int AS clicks
    FROM days d
    LEFT JOIN daily_clicks dc
      ON dc.short_url_id = (SELECT id FROM su)
     AND dc.day_utc = d.day_utc
    WHERE (SELECT id FROM su) IS NOT NULL
    ORDER BY d.day_utc ASC;
    `,
    [linkId, userId, days],
  );

  if (rows.length === 0) return null;

  const first = rows[0];

  return {
    linkId: first.link_id,
    totalClicks: first.total_clicks,
    lastClickedAt: first.last_clicked_at,
    series: rows.map((r) => ({ dayUtc: r.day_utc, clicks: r.clicks })),
  };
}
