-- migrate:up
ALTER TABLE short_urls
ALTER COLUMN user_id DROP NOT NULL;

-- migrate:down
ALTER TABLE short_urls
ALTER COLUMN user_id SET NOT NULL;
