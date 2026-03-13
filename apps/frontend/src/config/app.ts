function trimTrailingSlash(value: string) {
  return value.replace(/\/$/, "");
}

const rawAppName = import.meta.env.VITE_APP_NAME as string;
const rawSiteUrl = import.meta.env.VITE_SITE_URL as string;

export const appConfig = {
  appName: rawAppName?.trim(),
  siteUrl: trimTrailingSlash(rawSiteUrl.trim()),
};
