import type { Request } from "express";
import { verifyToken } from "../modules/auth/auth.service";

export type GraphQLContext = {
  user: { id: string; email: string } | null;
};

function extractBearerToken(authHeader: unknown): string | null {
  if (typeof authHeader !== "string") return null;

  const trimmed = authHeader.trim();
  if (!trimmed.toLowerCase().startsWith("bearer ")) return null;

  const token = trimmed.slice("bearer ".length).trim();
  return token.length ? token : null;
}

export async function buildContext(req: Request): Promise<GraphQLContext> {
  const token = extractBearerToken(req.headers.authorization);
  if (!token) return { user: null };

  const payload = verifyToken(token);
  if (!payload) return { user: null };

  return { user: { id: payload.sub, email: payload.email } };
}
