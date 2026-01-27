import "dotenv/config";

export const env = {
  PORT: Number(process.env.PORT ?? 4000),
  FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN,
  DATABASE_URL: process.env.DATABASE_URL,
};
