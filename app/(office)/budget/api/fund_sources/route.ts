import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        id,
        fund_code,
        fund_name,
        acronym,
        is_active
      FROM public.fund_sources
      WHERE is_active = TRUE
      ORDER BY fund_code, fund_name
    `);

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("GET FUND SOURCES:", error);

    return NextResponse.json(
      { success: false, message: "Failed to load fund sources." },
      { status: 500 }
    );
  }
}