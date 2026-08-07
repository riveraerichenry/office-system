import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

/*
--------------------------------------------------------
GET
Returns ALL modules together with the permissions
assigned to the selected role.
--------------------------------------------------------
*/

export async function GET(
  req: NextRequest,
  { params }: Params
) {
  try {
    const { id: roleId } = await params;

    const result = await pool.query(
      `
      SELECT
        m.id,
        m.module_name,
        m.path,
        m.icon,
        m.background_color,

        COALESCE(rm.can_view, FALSE) AS can_view,
        COALESCE(rm.can_add, FALSE) AS can_add,
        COALESCE(rm.can_edit, FALSE) AS can_edit,
        COALESCE(rm.can_delete, FALSE) AS can_delete,
        COALESCE(rm.can_approve, FALSE) AS can_approve,
        COALESCE(rm.can_print, FALSE) AS can_print

      FROM modules m

      LEFT JOIN role_modules rm
        ON rm.module_id = m.id
       AND rm.role_id = $1

      ORDER BY m.sort_order, m.module_name
      `,
      [roleId]
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch role modules.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
--------------------------------------------------------
PUT
Completely replaces all permissions of a role.
--------------------------------------------------------
*/

export async function PUT(
  req: NextRequest,
  { params }: Params
) {
  const client = await pool.connect();

  try {
    const { id: roleId } = await params;

    const { modules } = await req.json();

    await client.query("BEGIN");

    await client.query(
      `
      DELETE FROM role_modules
      WHERE role_id=$1
      `,
      [roleId]
    );

    for (const module of modules) {

      if (
        !module.can_view &&
        !module.can_add &&
        !module.can_edit &&
        !module.can_delete &&
        !module.can_approve &&
        !module.can_print
      ) {
        continue;
      }

      await client.query(
        `
        INSERT INTO role_modules
        (
          role_id,
          module_id,

          can_view,
          can_add,
          can_edit,
          can_delete,
          can_approve,
          can_print
        )

        VALUES
        (
          $1,$2,
          $3,$4,$5,$6,$7,$8
        )
        `,
        [
          roleId,
          module.id,

          module.can_view,
          module.can_add,
          module.can_edit,
          module.can_delete,
          module.can_approve,
          module.can_print,
        ]
      );
    }

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
    });

  } catch (error) {

    await client.query("ROLLBACK");

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to save permissions.",
      },
      {
        status: 500,
      }
    );

  } finally {
    client.release();
  }
}