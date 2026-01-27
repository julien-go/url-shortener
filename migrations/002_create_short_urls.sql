CREATE TABLE IF NOT EXISTS short_urls (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  code            text NOT NULL,
  target_url      text NOT NULL,

  is_active       boolean NOT NULL DEFAULT true,
  total_clicks    bigint  NOT NULL DEFAULT 0,
  last_clicked_at timestamptz NULL,

  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS short_urls_code_lower_unique
ON short_urls (LOWER(code));

CREATE INDEX IF NOT EXISTS short_urls_user_id_idx
ON short_urls (user_id);

CREATE INDEX IF NOT EXISTS short_urls_created_at_idx
ON short_urls (created_at);
