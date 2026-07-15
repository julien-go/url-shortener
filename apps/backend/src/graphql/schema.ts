export const typeDefs = `#graphql
  """
  ISO 8601 date-time string (e.g. "2025-01-12T10:11:12.000Z").
  """
  scalar DateTime

  type Query {
    "Liveness check for the GraphQL API. Always returns \\"ok\\"."
    health: String!

    "The currently authenticated user, or null if the auth cookie is missing/invalid."
    me: User

    "Paginated list of the current user's active (non-deleted) short links, newest first."
    myLinks(limit: Int = 10, cursor: String): MyLinksPage!

    "Click statistics for one of the current user's links over a given time range."
    linkStats(linkId: ID!, range: StatsRange!): LinkStats!
  }

  type Mutation {
    "Creates a new short link for the current user, with an optional custom slug."
    createShortUrl(input: CreateShortUrlInput!): CreateShortUrlPayload!

    "Creates a new account and signs the user in (sets the auth cookie)."
    register(input: RegisterInput!): AuthPayload!

    "Authenticates an existing user and sets the auth cookie."
    login(input: LoginInput!): AuthPayload!

    "Soft-deletes one of the current user's links (marks it inactive, does not remove the row)."
    deleteLink(id: ID!): Boolean!

    "Clears the auth cookie and invalidates the current session (bumps the user's token version)."
    logout: Boolean!
  }

  input CreateShortUrlInput {
    "The destination URL to redirect to. Must be an absolute http(s) URL."
    originalUrl: String!
    "Optional custom slug (3-32 lowercase alphanumeric/hyphen characters). A random one is generated if omitted."
    code: String
  }

  type ShortUrl {
    id: ID!
    "The short link's slug, e.g. \\"abc123\\" for https://fliro.cc/abc123."
    code: String!
    "The destination URL this short link redirects to."
    originalUrl: String!
    createdAt: DateTime!
    "Total number of times this link has been visited (as a string to avoid Int precision limits)."
    clickCount: String!
    "The full short URL, ready to share (public base URL + code)."
    shortLink: String!
  }

  type MyLinksPage {
    items: [ShortUrl!]!
    "Opaque cursor for fetching the next page, or null if this is the last page."
    nextCursor: String
    "Total number of active links owned by the current user."
    totalCount: Int!
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
    user: User!
  }

  type User {
    id: ID!
    email: String!
    createdAt: DateTime!
  }

  "Time window for aggregating link click statistics."
  enum StatsRange {
    DAYS_7
    DAYS_30
  }

  "Click count for a single UTC day."
  type ClickPoint {
    "UTC calendar day, formatted as YYYY-MM-DD."
    dayUtc: String!
    clicks: Int!
  }

  type LinkStats {
    linkId: ID!
    "Total number of clicks across the link's entire lifetime (as a string to avoid Int precision limits)."
    totalClicks: String!
    lastClickedAt: String
    "One data point per day in the requested range, in chronological order."
    series: [ClickPoint!]!
    link: ShortUrl!
  }
`;
