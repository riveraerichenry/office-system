import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var pgPool: Pool | undefined;
}

console.log(
  "DATABASE_URL:",
  process.env.DATABASE_URL?.replace(/:(.*?)@/, ":******@")
);

export const pool =
  global.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

pool
  .query("SELECT current_user, current_database()")
  .then((r) => console.log("DB Connected:", r.rows[0]))
  .catch((err) => console.error("DB Connection Error:", err));

if (process.env.NODE_ENV !== "production") {
  global.pgPool = pool;
}