import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        id,
        window_number,
        window_name
      FROM queuing_windows
      WHERE is_active = TRUE
      ORDER BY window_number
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("QUEUE WINDOWS ERROR:", error);

    return NextResponse.json(
      { error: "Failed to load windows" },
      { status: 500 }
    );
  }
}