export const typeDefs = `#graphql
  scalar DateTime

  type Query {
    health: String!
  }

  input CreateShortUrlInput {
  originalUrl: String!
  code: String
  }

type ShortUrl {
  id: ID!
  code: String!
  originalUrl: String!
  createdAt: DateTime!
}

type CreateShortUrlPayload {
  shortUrl: ShortUrl!
  shortLink: String!
}

type Mutation {
  createShortUrl(input: CreateShortUrlInput!): CreateShortUrlPayload!
}

`;
