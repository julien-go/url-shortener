import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { Response } from "express";
import { env } from "../../config/env";
import { JwtPayload } from "./auth.types";
import { setAuthCookie } from "../../security/authCookies";
import type { UserRow } from "../users/users.types";

const JWT_ALGORITHM = "HS256" as const;

export const DUMMY_PASSWORD_HASH =
  "$2b$10$YO/7w00jcPITZ.kMOOmS6.vtqeisl2P2jOQLKrO49AVNernil/BWW";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

function getJwtSecret(): string {
  const secret = env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return secret;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, getJwtSecret(), {
    algorithm: JWT_ALGORITHM,
    expiresIn: env.COOKIE_MAX_AGE_SECONDS,
  });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, getJwtSecret(), {
      algorithms: [JWT_ALGORITHM],
    }) as JwtPayload;
  } catch {
    return null;
  }
}

export function issueSession(res: Response, user: UserRow) {
  const token = signToken({
    sub: user.id,
    email: user.email,
    tokenVersion: user.token_version,
  });
  setAuthCookie(res, token);

  return {
    user: {
      id: user.id,
      email: user.email,
      createdAt: user.created_at,
    },
  };
}
