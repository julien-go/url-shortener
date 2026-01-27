export type ShortUrlRow = {
  id: string;
  code: string;
  target_url: string;
  deleted_at: Date | null;
  is_active: boolean;
};

export type ResolveShortUrlResult =
  | { ok: true; targetUrl: string }
  | { ok: false; reason: "NOT_FOUND" | "DELETED" | "INACTIVE" };
