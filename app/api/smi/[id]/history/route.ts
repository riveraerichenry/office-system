import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { authorize } from "@/lib/authorize";
import { MODULE_PATHS } from "@/lib/module-paths";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  req: NextRequest,
  { params }: Params
) {
  try {

    await authorize(
      req,
      MODULE_PATHS.SMI,
      "view"
    );

    const { id } =
      await params;

    const result =
      await pool.query(
        `
        SELECT

            a.id,

            a.action,

            a.description,

            a.created_at,

            u.full_name

        FROM audit_logs a

        LEFT JOIN users u
            ON u.id = a.user_id

        WHERE

            a.module_name = 'SMI'

            AND a.record_id = $1

        ORDER BY
            a.created_at DESC
        `,
        [id]
      );

    return NextResponse.json({
      success: true,
      data: result.rows,
    });

  } catch (err: any) {

    if (
      err.message ===
      "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        {
          message:
            "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    if (
      err.message ===
      "FORBIDDEN"
    ) {
      return NextResponse.json(
        {
          message:
            "Forbidden",
        },
        {
          status: 403,
        }
      );
    }

    console.error(err);

    return NextResponse.json(
      {
        success: false,
        message:
          "Server Error",
      },
      {
        status: 500,
      }
    );

  }
}