DELETE FROM short_urls
WHERE user_id IS NULL;

ALTER TABLE short_urls
ALTER COLUMN user_id SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'short_urls_user_id_fkey'
  ) THEN
    ALTER TABLE short_urls
    ADD CONSTRAINT short_urls_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE;
  END IF;
END $$;
