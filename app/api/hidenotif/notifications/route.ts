import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = verifyToken(token) as any;

    const result = await pool.query(
      `
      SELECT
          id,
          title,
          message,
          module,
          record_id,
          type AS notification_type,
          is_read,
          created_at,
          read_at,
          action_url,
          priority
      FROM notifications
      WHERE
    user_id = $1
    AND is_completed = FALSE
      ORDER BY
          is_read ASC,
          created_at DESC
      `,
      [user.id]
    );


    const unread =
  result.rows.filter(
    (x) => !x.is_read
  ).length;

    return NextResponse.json({
  success: true,
  data: result.rows,
  unread,
});

  } catch (err) {

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

export async function PATCH(
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

    const { id } =
      await req.json();

    await pool.query(
      `
      UPDATE notifications

      SET

          is_read = TRUE,

          read_at = NOW()

      WHERE

          id = $1

          AND user_id = $2
      `,
      [
        id,
        user.id,
      ]
    );

    return NextResponse.json({
      success: true,
    });

  } catch (err) {

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