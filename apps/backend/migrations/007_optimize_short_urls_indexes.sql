-- migrate:up
CREATE INDEX IF NOT EXISTS short_urls_user_active_created_idx
ON short_urls (user_id, created_at DESC, id DESC)
WHERE deleted_at IS NULL AND is_active = true;

DROP INDEX IF EXISTS public.short_urls_created_at_idx;
DROP INDEX IF EXISTS public.short_urls_code_uq;
DROP INDEX IF EXISTS public.daily_clicks_day_utc_idx;

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;

-- migrate:down
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_email_key'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS daily_clicks_day_utc_idx ON daily_clicks (day_utc);
CREATE INDEX IF NOT EXISTS short_urls_created_at_idx ON short_urls (created_at);

DROP INDEX IF EXISTS public.short_urls_user_active_created_idx;
