import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(
  req: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } =
      await context.params;

    const result =
      await pool.query(
        `
        SELECT *
        FROM bank_accounts
        WHERE bank_id = $1
        ORDER BY sequence_code
      `,
        [id]
      );

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