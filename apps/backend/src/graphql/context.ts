import type { Request, Response } from "express";
import { verifyToken } from "../modules/auth/auth.service";
import { env } from "../config/env";
import { extractCookieValue } from "../security/authCookies";

export type GraphQLContext = {
  user: { id: string; email: string } | null;
  res: Response;
};

function extractCookieToken(cookieHeader: unknown): string | null {
  if (typeof cookieHeader !== "string") return null;
  return extractCookieValue(cookieHeader, env.COOKIE_NAME);
}

export async function buildContext(
  req: Request,
  res: Response,
): Promise<GraphQLContext> {
  const token =
    extractBearerToken(req.headers.authorization) ??
    extractCookieToken(req.headers.cookie);

  if (!token) return { user: null, res };

  const payload = verifyToken(token);
  if (!payload) return { user: null, res };

  return { user: { id: payload.sub, email: payload.email }, res };
}
