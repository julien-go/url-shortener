export const typeDefs = `#graphql
  scalar DateTime

  type Query {
    health: String!,
    me: User
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

input RegisterInput {
  email: String!
  password: String!
}

input LoginInput {
  email: String!
  password: String!
}

type AuthPayload {
  token: String!
  user: User!
}

type User {
  id: ID!
  email: String!
  createdAt: DateTime!
}

type Mutation {
  createShortUrl(input: CreateShortUrlInput!): CreateShortUrlPayload!,
  register(input: RegisterInput!): AuthPayload!
  login(input: LoginInput!): AuthPayload!
}
`;
