-- migrate:up
CREATE TABLE IF NOT EXISTS users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_unique
ON public.users (LOWER(email));

-- migrate:down
DROP INDEX IF EXISTS public.users_email_lower_unique;
DROP TABLE IF EXISTS public.users;
