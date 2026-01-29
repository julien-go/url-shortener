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
import {
  loginInputSchema,
  registerInputSchema,
} from "../modules/auth/auth.schema";

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

        return {
          token,
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
