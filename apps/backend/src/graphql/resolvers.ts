import { GraphQLError } from "graphql";
import type { GraphQLContext } from "./context";
import { createShortUrl } from "../modules/shortUrls/shortUrls.service";
import {
  createUser,
  findUserByEmail,
  findUserById,
} from "../modules/users/users.repo";
import {
  hashPassword,
  verifyPassword,
  signToken,
} from "../modules/auth/auth.service";
import {
  loginInputSchema,
  registerInputSchema,
} from "../modules/auth/auth.schema";
import {
  countMyLinks,
  findMyLinksPage,
  softDeleteLink,
} from "../modules/shortUrls/shortUrls.repo";
import { decodeCursor, encodeCursor } from "./cursor";
import { findLinkStats } from "../modules/shortUrls/shortUrls.stats.repo";
import {
  createShortUrlInputSchema,
  deleteLinkArgsSchema,
  linkStatsArgsSchema,
  myLinksArgsSchema,
} from "./resolvers.schema";
import { clearAuthCookie, setAuthCookie } from "../security/authCookies";

export const resolvers = {
  ShortUrl: {
    shortLink: (parent: { code: string }) => {
      const base = process.env.PUBLIC_BASE_URL ?? "http://localhost:4000";
      return `${base.replace(/\/$/, "")}/${parent.code}`;
    },
  },

  Query: {
    health: () => "ok",
    me: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      if (!ctx.user) {
        throw new GraphQLError("Not authenticated", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const user = await findUserById(ctx.user.id);
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
      if (!ctx.user) {
        throw new GraphQLError("Not authenticated", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const parsed = myLinksArgsSchema.safeParse(args ?? {});
      if (!parsed.success) {
        throw new GraphQLError("Invalid input", {
          extensions: {
            code: "BAD_USER_INPUT",
            validation: parsed.error.flatten(),
          },
        });
      }

      const limit = parsed.data.limit ?? 10;

      let decoded: { createdAt: string; id: string } | null = null;
      if (parsed.data.cursor) {
        try {
          decoded = decodeCursor(parsed.data.cursor);
        } catch {
          throw new GraphQLError("Invalid cursor", {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
      }

      const [totalCount, rows] = await Promise.all([
        countMyLinks(ctx.user.id),
        findMyLinksPage({ userId: ctx.user.id, limit, cursor: decoded }),
      ]);

      const pageRows = rows.slice(0, limit);

      const items = pageRows.map((r) => ({
        id: r.id,
        code: r.code,
        originalUrl: r.target_url,
        createdAt: r.created_at,
        clickCount: r.total_clicks ?? 0,
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
      if (!ctx.user) {
        throw new GraphQLError("Not authenticated", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const parsed = linkStatsArgsSchema.safeParse(args);
      if (!parsed.success) {
        throw new GraphQLError("Invalid input", {
          extensions: {
            code: "BAD_USER_INPUT",
            validation: parsed.error.flatten(),
          },
        });
      }

      const days = parsed.data.range === "DAYS_7" ? 7 : 30;

      const stats = await findLinkStats({
        userId: ctx.user.id,
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
  },

  Mutation: {
    createShortUrl: async (
      _: unknown,
      { input }: { input: { originalUrl: string; code?: string } },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.user) {
        throw new GraphQLError("Not authenticated", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const parsed = createShortUrlInputSchema.safeParse(input);
      if (!parsed.success) {
        throw new GraphQLError("Invalid input", {
          extensions: {
            code: "BAD_USER_INPUT",
            validation: parsed.error.flatten(),
          },
        });
      }

      try {
        const result = await createShortUrl(parsed.data, ctx.user.id);

        if (!result.ok) {
          const message =
            result.reason === "INVALID_URL"
              ? "Invalid URL"
              : result.reason === "INVALID_CODE"
                ? "Invalid slug"
                : "Code already taken";

          throw new GraphQLError(message, {
            extensions: { code: "BAD_USER_INPUT", reason: result.reason },
          });
        }

        return {
          shortUrl: {
            id: result.shortUrl.id,
            code: result.shortUrl.code,
            originalUrl: result.shortUrl.target_url,
            createdAt: result.shortUrl.created_at,
            clickCount: 0,
            shortLink: result.shortLink,
          },
          shortLink: result.shortLink,
        };
      } catch (e) {
        if (e instanceof GraphQLError) throw e;

        throw new GraphQLError("Could not create short link", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },

    register: async (
      _: unknown,
      { input }: { input: { email: string; password: string } },
      ctx: GraphQLContext,
    ) => {
      const parsed = registerInputSchema.safeParse(input);
      if (!parsed.success) {
        throw new GraphQLError("Invalid input", {
          extensions: {
            code: "BAD_USER_INPUT",
            validation: parsed.error.flatten(),
          },
        });
      }

      const { email, password } = parsed.data;

      // early check for nicer UX (still keep unique-violation handling)
      const existing = await findUserByEmail(email);
      if (existing) {
        throw new GraphQLError("Email already in use", {
          extensions: { code: "BAD_USER_INPUT", reason: "EMAIL_TAKEN" },
        });
      }

      try {
        const passwordHash = await hashPassword(password);
        const user = await createUser(email, passwordHash);
        const token = signToken({ sub: user.id, email: user.email });
        setAuthCookie(ctx.res, token);

        return {
          user: {
            id: user.id,
            email: user.email,
            createdAt: user.created_at,
          },
        };
      } catch (e: any) {
        if (e?.code === "23505") {
          throw new GraphQLError("Email already in use", {
            extensions: { code: "BAD_USER_INPUT", reason: "EMAIL_TAKEN" },
          });
        }

        throw new GraphQLError("Could not create account", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },

    login: async (
      _: unknown,
      { input }: { input: { email: string; password: string } },
      ctx: GraphQLContext,
    ) => {
      const parsed = loginInputSchema.safeParse(input);
      if (!parsed.success) {
        throw new GraphQLError("Invalid input", {
          extensions: {
            code: "BAD_USER_INPUT",
            validation: parsed.error.flatten(),
          },
        });
      }

      const { email, password } = parsed.data;

      const user = await findUserByEmail(email);
      if (!user) {
        throw new GraphQLError("Invalid credentials", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      const ok = await verifyPassword(password, user.password_hash);
      if (!ok) {
        throw new GraphQLError("Invalid credentials", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      const token = signToken({ sub: user.id, email: user.email });
      setAuthCookie(ctx.res, token);

      return {
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.created_at,
        },
      };
    },

    logout: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      clearAuthCookie(ctx.res);
      return true;
    },

    deleteLink: async (
      _: unknown,
      { id }: { id: string },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.user) {
        throw new GraphQLError("Not authenticated", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }
      const parsed = deleteLinkArgsSchema.safeParse({ id });
      if (!parsed.success) {
        throw new GraphQLError("Invalid input", {
          extensions: {
            code: "BAD_USER_INPUT",
            validation: parsed.error.flatten(),
          },
        });
      }
      const ok = await softDeleteLink({
        userId: ctx.user.id,
        id: parsed.data.id,
      });
      return ok;
    },
  },
};
