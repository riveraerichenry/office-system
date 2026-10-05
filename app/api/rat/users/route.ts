import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/authorize";
import { pool } from "@/lib/db";
import { MODULE_PATHS } from "@/lib/module-paths";

export async function GET(
  req: NextRequest
) {
  try {

    await authorize(
      req,
      MODULE_PATHS.RAT,
      "view"
    );

    const result = await pool.query(
      `
      SELECT
          id,
          full_name
      FROM users
      WHERE
          is_active = TRUE
      ORDER BY
          full_name ASC
      `
    );

    return NextResponse.json({
      success: true,
      users: result.rows,
    });

  } catch (err: any) {

    console.error(
      "RAT Users Error:",
      err
    );

    return NextResponse.json(
      {
        success: false,
        message:
          err.message ||
          "Failed to load users.",
      },
      {
        status: 500,
      }
    );
  }
}