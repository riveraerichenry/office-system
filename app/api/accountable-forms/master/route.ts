import { NextResponse } from "next/server";
import { pool } from "@/lib/db";



export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
          id,
          form_code,
          form_name,
          description,
          is_serialized,
          is_active
      FROM accountable_forms
      WHERE is_active = TRUE
      ORDER BY form_code
    `);

    return NextResponse.json({
      success: true,
      data: result.rows,
    });

  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      {
        status: 500,
      }
    );
  }
}