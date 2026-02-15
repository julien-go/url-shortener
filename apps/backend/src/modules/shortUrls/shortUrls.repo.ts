import { pool } from "../../db/pool";
import { MyLinkRow, ShortUrlRow } from "./shortUrls.types";

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

export async function trackClick(shortUrlId: string): Promise<void> {
  await pool.query(
    `
    WITH upsert_daily AS (
      INSERT INTO daily_clicks (short_url_id, day_utc, clicks)
      VALUES ($1, (now() AT TIME ZONE 'utc')::date, 1)
      ON CONFLICT (short_url_id, day_utc)
      DO UPDATE SET clicks = daily_clicks.clicks + 1
      RETURNING 1
    )
    UPDATE short_urls
    SET total_clicks = total_clicks + 1,
        last_clicked_at = now(),
        updated_at = now()
    WHERE id = $1
    `,
    [shortUrlId],
  );
}

export async function createShortUrlRow(params: {
  code: string;
  targetUrl: string;
  userId: string;
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

export async function countMyLinks(userId: string): Promise<number> {
  const { rows } = await pool.query<{ count: number }>(
    `
    SELECT COUNT(*)::int AS count
    FROM short_urls
    WHERE user_id = $1
      AND deleted_at IS NULL
      AND is_active = true
    `,
    [userId],
  );
  return rows[0]?.count ?? 0;
}

export async function findMyLinksPage(params: {
  userId: string;
  limit: number;
  cursor?: { createdAt: string; id: string } | null;
}): Promise<MyLinkRow[]> {
  const { userId, limit, cursor } = params;

  const pageSize = limit + 1;
  const values: any[] = [userId, pageSize];
  let cursorSql = "";

  if (cursor) {
    values.push(cursor.createdAt, cursor.id);
    cursorSql = `
      AND (
        su.created_at < $3::timestamptz
        OR (su.created_at = $3::timestamptz AND su.id < $4)
      )
    `;
  }

  const { rows } = await pool.query<MyLinkRow>(
    `
    SELECT
      su.id,
      su.code,
      su.target_url,
      su.created_at,
      su.total_clicks
    FROM short_urls su
    WHERE su.user_id = $1
      AND su.deleted_at IS NULL
      AND su.is_active = true
      ${cursorSql}
    ORDER BY su.created_at DESC, su.id DESC
    LIMIT $2
    `,
    values,
  );

  return rows;
}

export async function softDeleteLink(params: {
  userId: string;
  id: string;
}): Promise<boolean> {
  const { userId, id } = params;

  const r = await pool.query(
    `
    UPDATE short_urls
    SET deleted_at = now(),
        is_active = false
    WHERE id = $1
      AND user_id = $2
      AND deleted_at IS NULL
    `,
    [id, userId],
  );

  return (r.rowCount ?? 0) > 0;
}
