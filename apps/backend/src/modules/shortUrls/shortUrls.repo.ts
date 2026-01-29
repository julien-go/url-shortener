import { pool } from "../../db/pool";
import { DayUTC } from "../../utils/dayUtc";
import { ShortUrlRow } from "./shortUrls.types";

export async function findByCode(code: string): Promise<ShortUrlRow | null> {
  const norm = code.trim().toLowerCase();
  const { rows } = await pool.query<ShortUrlRow>(
    `
    SELECT id, code, target_url, deleted_at, is_active
    FROM short_urls
    WHERE LOWER(code) = $1
    LIMIT 1
    `,
    [norm],
  );
  return rows[0] ?? null;
}

export async function trackClick(
  shortUrlId: string,
  dayUtc: DayUTC,
): Promise<void> {
  await pool.query(
    `
    WITH upsert_daily AS (
      INSERT INTO daily_clicks (short_url_id, day_utc, clicks)
      VALUES ($1, $2, 1)
      ON CONFLICT (short_url_id, day_utc)
      DO UPDATE SET clicks = daily_clicks.clicks + 1
    )
    UPDATE short_urls
    SET total_clicks = total_clicks + 1,
        last_clicked_at = now()
    WHERE id = $1
    `,
    [shortUrlId, dayUtc],
  );
}

export async function createShortUrlRow(params: {
  code: string;
  targetUrl: string;
  userId: string | null;
}): Promise<ShortUrlRow> {
  const { code, targetUrl, userId } = params;

  const { rows } = await pool.query<ShortUrlRow>(
    `
    INSERT INTO short_urls (code, target_url, user_id)
    VALUES ($1, $2, $3)
    RETURNING id, code, target_url, created_at, deleted_at, is_active
    `,
    [code, targetUrl, userId],
  );

  return rows[0];
}
