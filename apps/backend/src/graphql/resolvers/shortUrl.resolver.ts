import { env } from "../../config/env";

export const shortUrlResolver = {
  shortLink: (parent: { code: string }) => {
    const base = env.PUBLIC_BASE_URL ?? "http://localhost:4000";
    return `${base.replace(/\/$/, "")}/${parent.code}`;
  },
};
