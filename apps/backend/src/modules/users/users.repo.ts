import { pool } from "../../db/pool";
import type { UserRow } from "./users.types";

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const { rows } = await pool.query<UserRow>(
    `
    SELECT id, email, password_hash, created_at
    FROM users
    WHERE email = $1
    LIMIT 1
    `,
    [email.toLowerCase()],
  );

  return rows[0] ?? null;
}

export async function findUserById(id: string): Promise<UserRow | null> {
  const { rows } = await pool.query<UserRow>(
    `
    SELECT id, email, password_hash, created_at
    FROM users
    WHERE id = $1
    LIMIT 1
    `,
    [id],
  );

  return rows[0] ?? null;
}

export async function createUser(
  email: string,
  passwordHash: string,
): Promise<UserRow> {
  const { rows } = await pool.query<UserRow>(
    `
    INSERT INTO users (email, password_hash)
    VALUES ($1, $2)
    RETURNING id, email, password_hash, created_at
    `,
    [email.toLowerCase(), passwordHash],
  );

  return rows[0];
}
