import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const result =
      await pool.query(`
        SELECT DISTINCT fiscal_year
        FROM accountable_form_inventory
        ORDER BY fiscal_year DESC
      `);

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}