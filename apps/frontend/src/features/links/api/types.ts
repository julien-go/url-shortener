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
  clickCount: string;
  shortLink: string;
};

export type MyLinksResponse = {
  myLinks: {
    totalCount: number;
    nextCursor: string | null;
    items: MyLink[];
  };
};

export type StatsRange = "DAYS_7" | "DAYS_30" | "DAYS_90" | "MONTHS_12";
export type StatsGranularity = "DAY" | "WEEK" | "MONTH";

export type ClickPoint = { bucketStart: string; clicks: number };

export type LinkStatsResponse = {
  linkStats: {
    linkId: string;
    totalClicks: string;
    lastClickedAt: string | null;
    granularity: StatsGranularity;
    rangeClicks: number;
    previousRangeClicks: number;
    series: ClickPoint[];
    link: MyLink;
  };
};
