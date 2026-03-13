export const shortUrlResolver = {
  shortLink: (parent: { code: string }) => {
    const base = process.env.PUBLIC_BASE_URL ?? "http://localhost:4000";
    return `${base.replace(/\/$/, "")}/${parent.code}`;
  },
};
