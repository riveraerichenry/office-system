
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { authorize } from "@/lib/authorize";
import { MODULE_PATHS } from "@/lib/module-paths";

export async function GET(req: NextRequest) {
  try {
    await authorize(req, MODULE_PATHS.SMI, "view");

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";

    const result = await pool.query(
      `
      SELECT DISTINCT full_name
      FROM users
      WHERE full_name IS NOT NULL
        AND TRIM(full_name) <> ''
        AND full_name ILIKE $1
      ORDER BY full_name
      LIMIT 50
      `,
      [`%${search}%`]
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Cash Ticket Users Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load users.",
      },
      { status: 500 }
    );
  }
}
