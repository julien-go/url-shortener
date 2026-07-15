import { Pool } from "pg";
import { env } from "../config/env";
import { logger } from "../utils/logger";

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  statement_timeout: env.DB_STATEMENT_TIMEOUT_MS,
});

pool.on("error", (err) => {
  logger.error({ err }, "Unexpected error on idle pg client");
});
