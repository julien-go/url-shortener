import { GraphQLError } from "graphql";
import type { GraphQLContext } from "../context";
import { createShortUrl } from "../../modules/shortUrls/shortUrls.service";
import {
  createUser,
  findUserByEmail,
  incrementUserTokenVersion,
} from "../../modules/users/users.repo";
import {
  DUMMY_PASSWORD_HASH,
  hashPassword,
  signToken,
  verifyPassword,
} from "../../modules/auth/auth.service";
import {
  loginInputSchema,
  registerInputSchema,
} from "../../modules/auth/auth.schema";
import { softDeleteLink } from "../../modules/shortUrls/shortUrls.repo";
import {
  createShortUrlInputSchema,
  deleteLinkArgsSchema,
} from "./resolvers.schema";
import { clearAuthCookie, setAuthCookie } from "../../security/authCookies";
import { badUserInput, internalServerError, requireAuth } from "./shared";

function isPgUniqueViolation(error: unknown): error is {
  code?: string;
} {
  return !!error && typeof error === "object" && "code" in error;
}

export const mutationResolvers = {
  createShortUrl: async (
    _: unknown,
    { input }: { input: { originalUrl: string; code?: string } },
    ctx: GraphQLContext,
  ) => {
    const currentUser = requireAuth(ctx);

    const parsed = createShortUrlInputSchema.safeParse(input);
    if (!parsed.success) {
      badUserInput("Invalid input", parsed.error.flatten());
    }

    try {
      const result = await createShortUrl(parsed.data, currentUser.id);

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
          clickCount: "0",
          shortLink: result.shortLink,
        },
        shortLink: result.shortLink,
      };
    } catch (error) {
      if (error instanceof GraphQLError) throw error;
      internalServerError("Could not create short link");
    }
  },

  register: async (
    _: unknown,
    { input }: { input: { email: string; password: string } },
    ctx: GraphQLContext,
  ) => {
    const parsed = registerInputSchema.safeParse(input);
    if (!parsed.success) {
      badUserInput("Invalid input", parsed.error.flatten());
    }

    const { email, password } = parsed.data;

    try {
      const passwordHash = await hashPassword(password);
      const user = await createUser(email, passwordHash);
      const token = signToken({
        sub: user.id,
        email: user.email,
        tokenVersion: user.token_version,
      });
      setAuthCookie(ctx.res, token);

      return {
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.created_at,
        },
      };
    } catch (error) {
      if (isPgUniqueViolation(error) && error.code === "23505") {
        throw new GraphQLError("Registration failed", {
          extensions: { code: "BAD_USER_INPUT", reason: "REGISTRATION_FAILED" },
        });
      }

      internalServerError("Could not create account");
    }
  },

  login: async (
    _: unknown,
    { input }: { input: { email: string; password: string } },
    ctx: GraphQLContext,
  ) => {
    const parsed = loginInputSchema.safeParse(input);
    if (!parsed.success) {
      badUserInput("Invalid input", parsed.error.flatten());
    }

    const { email, password } = parsed.data;

    const user = await findUserByEmail(email);

    const ok = await verifyPassword(
      password,
      user?.password_hash ?? DUMMY_PASSWORD_HASH,
    );

    if (!user || !ok) {
      badUserInput("Invalid credentials");
    }

    const token = signToken({
      sub: user.id,
      email: user.email,
      tokenVersion: user.token_version,
    });
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
    if (ctx.user) {
      await incrementUserTokenVersion(ctx.user.id);
    }
    clearAuthCookie(ctx.res);
    return true;
  },

  deleteLink: async (
    _: unknown,
    { id }: { id: string },
    ctx: GraphQLContext,
  ) => {
    const currentUser = requireAuth(ctx);

    const parsed = deleteLinkArgsSchema.safeParse({ id });
    if (!parsed.success) {
      badUserInput("Invalid input", parsed.error.flatten());
    }

    const ok = await softDeleteLink({
      userId: currentUser.id,
      id: parsed.data.id,
    });

    return ok;
  },
};
