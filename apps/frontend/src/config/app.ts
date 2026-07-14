function trimTrailingSlash(value: string) {
  return value.replace(/\/$/, "");
}

const rawAppName = import.meta.env.VITE_APP_NAME as string | undefined;
const rawSiteUrl = import.meta.env.VITE_SITE_URL as string | undefined;

export const appConfig = {
  appName: rawAppName?.trim() ?? "",
  siteUrl: rawSiteUrl ? trimTrailingSlash(rawSiteUrl.trim()) : "",
};
