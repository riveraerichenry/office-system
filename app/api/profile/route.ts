import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);

    const result = await pool.query(
      `
      SELECT
          u.id,
          u.username,
          u.full_name,
          r.id AS role_id,
          r.role_name
      FROM users u
      LEFT JOIN user_roles ur
          ON ur.user_id = u.id
      LEFT JOIN roles r
          ON r.id = ur.role_id
      WHERE u.id = $1
      `,
      [user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });

  } catch (error: any) {

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      {
        status: 500,
      }
    );

  }
}