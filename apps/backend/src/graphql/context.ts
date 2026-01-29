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

export async function createContext(req: {
  headers: Record<string, string | string[] | undefined>;
}): Promise<GraphQLContext> {
  const authHeader = req.headers["authorization"];
  const headerValue = Array.isArray(authHeader) ? authHeader[0] : authHeader;

  const token = extractBearerToken(headerValue);
  if (!token) return { user: null };

  const payload = verifyToken(token);
  if (!payload) return { user: null };

  console.log("[auth] ctx.user =", payload?.sub ?? null);

  return {
    user: {
      id: payload.sub,
      email: payload.email,
    },
  };
}
