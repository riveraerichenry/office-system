import { pool } from "@/lib/db";

export async function getUserModules(
  userId: string
) {
  const result = await pool.query(
    `
    SELECT m.path
    FROM user_modules um
    INNER JOIN modules m
      ON m.id = um.module_id
    WHERE um.user_id = $1
    `,
    [userId]
  );

  return result.rows.map(
    (row) => row.path
  );
}