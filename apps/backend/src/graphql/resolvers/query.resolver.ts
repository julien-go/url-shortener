import { GraphQLError } from "graphql";
import type { GraphQLContext } from "../context";
import { findUserById } from "../../modules/users/users.repo";
import {
  countMyLinks,
  findMyLinksPage,
} from "../../modules/shortUrls/shortUrls.repo";
import { decodeCursor, encodeCursor } from "../cursor";
import { findLinkStats } from "../../modules/shortUrls/shortUrls.stats.repo";
import { linkStatsArgsSchema, myLinksArgsSchema } from "./resolvers.schema";
import { badUserInput, requireAuth } from "./shared";

export const queryResolvers = {
  health: () => "ok",

  me: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
    const currentUser = requireAuth(ctx);
    const user = await findUserById(currentUser.id);

    if (!user) {
      throw new GraphQLError("Not authenticated", {
        extensions: { code: "UNAUTHENTICATED" },
      });
    }

    return {
      id: user.id,
      email: user.email,
      createdAt: user.created_at,
    };
  },

  myLinks: async (
    _: unknown,
    args: { limit?: number; cursor?: string | null },
    ctx: GraphQLContext,
  ) => {
    const currentUser = requireAuth(ctx);

    const parsed = myLinksArgsSchema.safeParse(args ?? {});
    if (!parsed.success) {
      badUserInput("Invalid input", parsed.error.flatten());
    }

    const limit = parsed.data.limit ?? 10;

    let decoded: { createdAt: string; id: string } | null = null;
    if (parsed.data.cursor) {
      try {
        decoded = decodeCursor(parsed.data.cursor);
      } catch {
        badUserInput("Invalid cursor");
      }
    }

    const [totalCount, rows] = await Promise.all([
      countMyLinks(currentUser.id),
      findMyLinksPage({ userId: currentUser.id, limit, cursor: decoded }),
    ]);

    const pageRows = rows.slice(0, limit);
    const items = pageRows.map((r) => ({
      id: r.id,
      code: r.code,
      originalUrl: r.target_url,
      createdAt: r.created_at,
      clickCount: String(r.total_clicks ?? 0),
    }));

    const hasNextPage = rows.length > limit;
    const last = pageRows[pageRows.length - 1];
    const nextCursor =
      hasNextPage && last ? encodeCursor(last.created_at, last.id) : null;

    return { items, nextCursor, totalCount };
  },

  linkStats: async (
    _: unknown,
    args: { linkId: string; range: "DAYS_7" | "DAYS_30" },
    ctx: GraphQLContext,
  ) => {
    const currentUser = requireAuth(ctx);

    const parsed = linkStatsArgsSchema.safeParse(args);
    if (!parsed.success) {
      badUserInput("Invalid input", parsed.error.flatten());
    }

    const days = parsed.data.range === "DAYS_7" ? 7 : 30;

    const stats = await findLinkStats({
      userId: currentUser.id,
      linkId: parsed.data.linkId,
      days,
    });

    if (!stats) {
      throw new GraphQLError("Link not found", {
        extensions: { code: "NOT_FOUND" },
      });
    }

    return stats;
  },
};
