import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        id,
        account_number,
        account_code,
        account_name,
        bank_id,
        fund_source_id,
        remarks,
        deposit_label
      FROM bank_accounts
      WHERE is_active = TRUE
      ORDER BY account_name ASC
    `);

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Bank accounts error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch bank accounts.",
      },
      { status: 500 }
    );
  }
}