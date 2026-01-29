import { z } from "zod";
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

const createShortUrlInputSchema = z.object({
  originalUrl: z
    .string()
    .trim()
    .url()
    .refine(
      (url) => url.startsWith("http://") || url.startsWith("https://"),
      "Only http/https URLs are allowed",
    ),
  code: z
    .string()
    .trim()
    .min(3)
    .max(32)
    .regex(/^[a-zA-Z0-9-]+$/, "Slug must contain only letters, numbers and '-'")
    .optional(),
});

export const resolvers = {
  Query: {
    health: () => "ok",
    me: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      if (!ctx.user) {
        throw new GraphQLError("Not authenticated", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const user = await findUserById(ctx.user.id);
      if (!user) return null;

      return {
        id: user.id,
        email: user.email,
        createdAt: user.created_at,
      };
    },
  },

  Mutation: {
    createShortUrl: async (_: unknown, { input }: { input: unknown }) => {
      const parsed = createShortUrlInputSchema.safeParse(input);

      if (!parsed.success) {
        throw new GraphQLError("Invalid input", {
          extensions: {
            code: "BAD_USER_INPUT",
            reason: "VALIDATION_ERROR",
            validation: parsed.error.flatten(),
          },
        });
      }

      const result = await createShortUrl(parsed.data);

      if (!result.ok) {
        const message =
          result.reason === "INVALID_URL"
            ? "Invalid URL"
            : result.reason === "INVALID_CODE"
              ? "Invalid slug"
              : "Slug already taken";

        throw new GraphQLError(message, {
          extensions: {
            code: "BAD_USER_INPUT",
            reason: result.reason,
          },
        });
      }

      return {
        shortUrl: {
          id: result.shortUrl.id,
          code: result.shortUrl.code,
          originalUrl: result.shortUrl.target_url,
          createdAt: result.shortUrl.created_at,
        },
        shortLink: result.shortLink,
      };
    },

    register: async (
      _: unknown,
      { input }: { input: { email: string; password: string } },
    ) => {
      const email = input.email.trim().toLowerCase();

      const existing = await findUserByEmail(email);
      if (existing) {
        throw new GraphQLError("Invalid credentials", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      const passwordHash = await hashPassword(input.password);
      const user = await createUser(email, passwordHash);
      const token = signToken({ sub: user.id, email: user.email });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.created_at,
        },
      };
    },

    login: async (
      _: unknown,
      { input }: { input: { email: string; password: string } },
    ) => {
      const email = input.email.trim().toLowerCase();

      const user = await findUserByEmail(email);
      if (!user) {
        throw new GraphQLError("Invalid credentials", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      const ok = await verifyPassword(input.password, user.password_hash);
      if (!ok) {
        throw new GraphQLError("Invalid credentials", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      const token = signToken({ sub: user.id, email: user.email });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.created_at,
        },
      };
    },
  },
};
