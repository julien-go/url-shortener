import { graphqlFetch } from "../../../lib/graphql/graphqlFetch";
import type { CreateShortUrlInput, CreateShortUrlResponse } from "./types";

const CREATE_SHORT_URL_MUTATION = `
mutation CreateShortUrl($input: CreateShortUrlInput!) {
  createShortUrl(input: $input) {
    shortLink
    shortUrl {
      id
      code
      originalUrl
      createdAt
    }
  }
}
`;

export function createShortUrl(input: CreateShortUrlInput) {
  return graphqlFetch<CreateShortUrlResponse, { input: CreateShortUrlInput }>(
    CREATE_SHORT_URL_MUTATION,
    { input },
  );
}
