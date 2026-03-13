import { mutationResolvers } from "./resolvers/mutation.resolver";
import { queryResolvers } from "./resolvers/query.resolver";
import { shortUrlResolver } from "./resolvers/shortUrl.resolver";

export const resolvers = {
  ShortUrl: shortUrlResolver,
  Query: queryResolvers,
  Mutation: mutationResolvers,
};
