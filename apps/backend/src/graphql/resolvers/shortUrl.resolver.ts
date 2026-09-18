import { buildShortLink } from "../../modules/shortUrls/shortUrls.utils";

export const shortUrlResolver = {
  shortLink: (parent: { code: string }) => buildShortLink(parent.code),
};
