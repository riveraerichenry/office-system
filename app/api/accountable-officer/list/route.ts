import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const result =
      await pool.query(`
        SELECT
          id,
          first_name,
          middle_name,
          last_name,
          position
        FROM accountable_officers
        ORDER BY last_name
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