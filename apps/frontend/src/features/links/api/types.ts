export type CreateShortUrlInput = {
  originalUrl: string;
  code?: string;
};

export type CreateShortUrlResponse = {
  createShortUrl: {
    shortLink: string;
    shortUrl: {
      id: string;
      code: string;
      originalUrl: string;
      createdAt: string;
    };
  };
};

export type MyLink = {
  id: string;
  code: string;
  originalUrl: string;
  createdAt: string;
  clickCount: number;
  shortLink: string;
};

export type MyLinksResponse = {
  myLinks: {
    totalCount: number;
    nextCursor: string | null;
    items: MyLink[];
  };
};

export type StatsRange = "DAYS_7" | "DAYS_30";

export type LinkStatsData = {
  linkStats: {
    linkId: string;
    totalClicks: string;
    lastClickedAt: string | null;
    series: { dayUtc: string; clicks: number }[];
  };
};

export type LinkStatsResponse = {
  linkStats: {
    linkId: string;
    totalClicks: string;
    lastClickedAt: string | null;
    series: { dayUtc: string; clicks: number }[];
    link: {
      id: string;
      code: string;
      originalUrl: string;
      createdAt: string;
      clickCount: number;
      shortLink: string;
    };
  };
};
