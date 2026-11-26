import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bankAccountId = searchParams.get("bank_account_id");

    if (!bankAccountId) {
      return NextResponse.json(
        {
          success: false,
          message: "Bank account ID is required.",
        },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `
      SELECT
        id,
        booklet_number,
        book_no,
        bank,
        account_number,
        beginning_check_no,
        ending_check_no,
        current_check_no,
        date_received,
        total_checks,
        issued_checks,
        remaining_checks,
        bank_account_id,
        bank_id,
        fund_source_id,
        status,
        remarks
      FROM check_booklet_registration
      WHERE bank_account_id = $1
        AND COALESCE(remaining_checks, 0) > 0
        AND COALESCE(current_check_no, '') <> ''
      ORDER BY date_received ASC, created_at ASC
      `,
      [bankAccountId]
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Available checks API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch available registered checks.",
      },
      { status: 500 }
    );
  }
}