export type ShortUrlRow = {
  id: string;
  code: string;
  target_url: string;
  created_at: Date;
  deleted_at: Date | null;
  is_active: boolean;
};

export type ResolveShortUrlResult =
  | { ok: true; targetUrl: string }
  | { ok: false; reason: "NOT_FOUND" | "DELETED" | "INACTIVE" };

export type CreateShortUrlInput = {
  originalUrl: string;
  code?: string;
};

export type CreateShortUrlSuccess = {
  ok: true;
  shortUrl: {
    id: string;
    code: string;
    target_url: string;
    created_at: Date;
  };
  shortLink: string;
};

export type CreateShortUrlErrorReason =
  | "INVALID_URL"
  | "INVALID_CODE"
  | "SLUG_TAKEN";

export type CreateShortUrlFailure = {
  ok: false;
  reason: CreateShortUrlErrorReason;
};

export type CreateShortUrlResult =
  | CreateShortUrlSuccess
  | CreateShortUrlFailure;

export type MyLinkRow = {
  id: string;
  code: string;
  target_url: string;
  created_at: string;
  total_clicks: string;
};

export type StatsRange = "DAYS_7" | "DAYS_30" | "DAYS_90" | "MONTHS_12";
export type StatsGranularity = "DAY" | "WEEK" | "MONTH";

export type LinkStatsRow = {
  link_id: string;
  code: string;
  target_url: string;
  created_at: string;
  total_clicks: string;
  last_clicked_at: string | null;
  bucket_start: string;
  clicks: number;
  range_clicks: number;
  previous_range_clicks: number;
};

export type LinkStats = {
  linkId: string;
  totalClicks: string;
  lastClickedAt: string | null;
  link: {
    id: string;
    code: string;
    originalUrl: string;
    createdAt: string;
    clickCount: string;
  };
  granularity: StatsGranularity;
  rangeClicks: number;
  previousRangeClicks: number;
  series: { bucketStart: string; clicks: number }[];
};
