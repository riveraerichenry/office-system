import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/authorize";
import { pool } from "@/lib/db";
import { MODULE_PATHS } from "@/lib/module-paths";

export async function PATCH(
  req: NextRequest
) {
  try {

    const user = await authorize(
      req,
      MODULE_PATHS.SMI,
      "view"
    );

    await pool.query(
      `
      UPDATE notifications

      SET

          is_read = TRUE,

          read_at = NOW()

      WHERE

          user_id = $1

          AND is_read = FALSE
      `,
      [
        user.id,
      ]
    );

    return NextResponse.json({
      success: true,
    });

  } catch (err: any) {

    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    if (err.message === "FORBIDDEN") {
      return NextResponse.json(
        {
          message: "Forbidden",
        },
        {
          status: 403,
        }
      );
    }

    console.error(err);

    return NextResponse.json(
      {
        message: "Server Error",
      },
      {
        status: 500,
      }
    );

  }
}