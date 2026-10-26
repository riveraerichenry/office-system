import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(
      `
        SELECT
          id,
          bank_code,
          bank_name AS name
        FROM banks
        WHERE is_active = TRUE
        ORDER BY bank_name ASC
      `
    );

    return NextResponse.json({
      success: true,
      banks: result.rows,
    });
  } catch (error) {
    console.error("GET /api/deposit/banks error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to load banks." },
      { status: 500 }
    );
  }
}