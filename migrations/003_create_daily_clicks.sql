CREATE TABLE IF NOT EXISTS daily_clicks (
  short_url_id uuid NOT NULL REFERENCES short_urls(id) ON DELETE CASCADE,
  day_utc      date NOT NULL,
  clicks       integer NOT NULL DEFAULT 0,

  PRIMARY KEY (short_url_id, day_utc)
);

CREATE INDEX IF NOT EXISTS daily_clicks_day_utc_idx
ON daily_clicks (day_utc);
