import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { MODULE_PATHS } from "@/lib/module-paths";

export async function GET(
  req: NextRequest
) {
  try {

    const token =
      req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const user =
      verifyToken(token) as any;

      console.log("PATH:", MODULE_PATHS.RIS_APPROVAL);
console.log("MODULES:", user.modules);

console.log(
  "HAS VIEW:",
  hasPermission(
    user.modules,
    MODULE_PATHS.RIS_APPROVAL,
    "view"
  )
);

    if (
      !hasPermission(
        user.modules,
        MODULE_PATHS.RIS_APPROVAL,
        "view"
      )
    ) {
      return NextResponse.json(
        {
          message: "Forbidden",
        },
        {
          status: 403,
        }
      );
    }

    const result =
      await pool.query(
        `
        SELECT

            r.*,

            u.username
                AS requested_by_name,

            (
                SELECT COUNT(*)

                FROM ris_request_items ri

                WHERE

                    ri.ris_request_id = r.id

                    AND ri.is_active = TRUE

            ) AS total_items

        FROM ris_requests r

        LEFT JOIN users u
            ON u.id = r.requested_by

        WHERE

            r.is_active = TRUE

            AND r.status = 'PENDING'

        ORDER BY

            r.created_at DESC
        `
      );

    return NextResponse.json({
      success: true,
      data: result.rows,
    });

  } catch (err) {

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