import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var pgPool: Pool | undefined;
}

/* ============================================================
   DATABASE CONFIG
============================================================ */

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

/* ============================================================
   SINGLETON POSTGRES POOL
============================================================ */

export const pool =
  global.pgPool ??
  new Pool({
    connectionString,

    // Maximum number of simultaneous DB connections
    max: 10,

    // Close idle connections after 30 seconds
    idleTimeoutMillis: 30000,

    // Don't wait forever when DB has no available connection
    connectionTimeoutMillis: 5000,

    // Optional but useful for Neon / hosted PostgreSQL
    keepAlive: true,
  });

/* ============================================================
   SAVE POOL GLOBALLY
   Prevents multiple pools during Next.js reloads / HMR.
============================================================ */

global.pgPool = pool;

/* ============================================================
   ERROR HANDLER
   Prevents unhandled pool-level errors.
============================================================ */

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL pool error:", err);
});