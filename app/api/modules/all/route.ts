import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  const result = await pool.query(`
    SELECT id, module_name
    FROM modules
    ORDER BY sort_order
  `);

  return NextResponse.json({
    data: result.rows,
  });
}