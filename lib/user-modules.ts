import { pool } from "@/lib/db";

export async function getUserModules(
  userId: string
) {
  const result = await pool.query(
    `
    SELECT

        m.id,
        m.module_name,
        m.path,
        m.icon,
        m.background_color,

        BOOL_OR(rm.can_view) AS can_view,
        BOOL_OR(rm.can_add) AS can_add,
        BOOL_OR(rm.can_edit) AS can_edit,
        BOOL_OR(rm.can_delete) AS can_delete,
        BOOL_OR(rm.can_approve) AS can_approve,
        BOOL_OR(rm.can_print) AS can_print

    FROM user_roles ur

    INNER JOIN role_modules rm
        ON rm.role_id = ur.role_id

    INNER JOIN modules m
        ON m.id = rm.module_id

    WHERE
        ur.user_id = $1

    GROUP BY
        m.id,
        m.module_name,
        m.path,
        m.icon,
        m.background_color,
        m.sort_order

    ORDER BY
        m.sort_order
    `,
    [userId]
  );

  return result.rows;
}