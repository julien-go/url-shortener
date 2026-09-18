import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL_TEST;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL_TEST is not set. Integration tests need a dedicated database.",
  );
}

const databaseName = new URL(connectionString).pathname.replace(/^\//, "");

if (!databaseName.endsWith("_test")) {
  throw new Error(
    `Refusing to run integration tests against "${databaseName}": these tests truncate every table, so the database name must end with "_test".`,
  );
}

export const testPool = new Pool({ connectionString });

export async function truncateAll(): Promise<void> {
  await testPool.query(
    "TRUNCATE daily_clicks, short_urls, users RESTART IDENTITY CASCADE",
  );
}

export async function insertUser(email: string): Promise<string> {
  const { rows } = await testPool.query<{ id: string }>(
    `INSERT INTO users (email, password_hash) VALUES ($1, 'x') RETURNING id`,
    [email],
  );
  return rows[0].id;
}

export async function insertLink(params: {
  userId: string;
  code: string;
  targetUrl?: string;
  createdAt?: string;
}): Promise<string> {
  const { userId, code, targetUrl = "https://example.com", createdAt } = params;

  const { rows } = await testPool.query<{ id: string }>(
    `
    INSERT INTO short_urls (user_id, code, target_url, created_at)
    VALUES ($1, $2, $3, COALESCE($4::timestamptz, now()))
    RETURNING id
    `,
    [userId, code, targetUrl, createdAt ?? null],
  );
  return rows[0].id;
}

export async function insertDailyClicks(
  shortUrlId: string,
  dayUtc: string,
  clicks: number,
): Promise<void> {
  await testPool.query(
    `INSERT INTO daily_clicks (short_url_id, day_utc, clicks) VALUES ($1, $2::date, $3)`,
    [shortUrlId, dayUtc, clicks],
  );
}
