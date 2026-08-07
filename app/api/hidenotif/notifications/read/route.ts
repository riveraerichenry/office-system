import { NextRequest, NextResponse } from "next/server";

import { pool } from "@/lib/db";

 import { verifyToken } from "@/lib/auth";

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