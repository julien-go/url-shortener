import { z } from "zod";
import { GraphQLError } from "graphql";
import { createShortUrl } from "../modules/shortUrls/shortUrls.service";

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
  Query: { health: () => "ok" },

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
  },
};
