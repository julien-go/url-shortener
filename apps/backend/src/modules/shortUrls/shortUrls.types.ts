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
  total_clicks: number;
};

export type StatsRange = "DAYS_7" | "DAYS_30";

export type LinkStatsRow = {
  link_id: string;
  total_clicks: string;
  last_clicked_at: string | null;
  day_utc: string;
  clicks: number;
};

export type LinkStats = {
  linkId: string;
  totalClicks: string;
  lastClickedAt: string | null;
  series: { dayUtc: string; clicks: number }[];
};
