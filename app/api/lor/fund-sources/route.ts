import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/authorize";
import { pool } from "@/lib/db";
import { MODULE_PATHS } from "@/lib/module-paths";

export async function GET(req: NextRequest) {
  try {
    await authorize(req, MODULE_PATHS.LOR, "view");

    const result = await pool.query(`
      SELECT
        id,
        fund_code,
        fund_name,
        acronym,
        seq_no,
        remarks
      FROM fund_sources
      WHERE is_active = TRUE
      ORDER BY fund_code ASC, fund_name ASC
    `);

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (err: any) {
    console.error("LOR FUND SOURCES ERROR:", err);

    return NextResponse.json(
      {
        success: false,
        message:
          err?.message ?? "Failed to load fund sources.",
      },
      { status: 500 }
    );
  }
}