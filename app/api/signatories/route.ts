// app/api/signatories/route.ts

import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        id,
        full_name,
        office,
        position,
        remarks
      FROM signatories
      WHERE is_active = TRUE
      ORDER BY full_name ASC
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching signatories:", error);

    return NextResponse.json(
      { error: "Failed to fetch signatories." },
      { status: 500 }
    );
  }
}