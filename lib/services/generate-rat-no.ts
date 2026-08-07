import { PoolClient } from "pg";

export async function generateRatNo(client: PoolClient) {
  const year = new Date().getFullYear();

  const result = await client.query(
    `
    SELECT COUNT(*)::int AS total
    FROM rat_headers
    WHERE EXTRACT(YEAR FROM rat_date) = $1
    `,
    [year]
  );

  const next = result.rows[0].total + 1;

  return `RAT-${year}-${String(next).padStart(5, "0")}`;
}