import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

import { authorize } from "@/lib/authorize";
import { MODULE_PATHS } from "@/lib/module-paths";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await authorize(request, MODULE_PATHS.DIPP, "view");

    const bankAccountId =
      request.nextUrl.searchParams.get("bank_account_id");

    const date = request.nextUrl.searchParams.get("date");

    // =====================================================
    // GET ACTIVE BANK ACCOUNTS
    // =====================================================

    if (!bankAccountId && !date) {
      const result = await pool.query(`
        SELECT
          ba.id,
          ba.bank_id,
          b.bank_name,
          b.bank_code,
          ba.account_number,
          ba.account_name
        FROM bank_accounts ba
        INNER JOIN banks b
          ON b.id = ba.bank_id
        WHERE ba.is_active = TRUE
          AND b.is_active = TRUE
        ORDER BY
          b.bank_name ASC,
          ba.account_name ASC
      `);

      return NextResponse.json({
        success: true,
        count: result.rows.length,
        accounts: result.rows,
      });
    }

    // =====================================================
    // VALIDATE FILTERS
    // =====================================================

    if (!bankAccountId || !date) {
      return NextResponse.json(
        {
          success: false,
          error: "Bank account and date are required.",
        },
        { status: 400 }
      );
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid date format.",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // GET CHECK ISSUANCE TRANSACTIONS
    // =====================================================

    const result = await pool.query(
      `
        SELECT
          t.id,
          t.check_number,
          t.check_date,
          t.dv_no,
          t.payee,
          t.particulars,
          t.total_amount,
          t.status
        FROM check_issuance_transaction t

        INNER JOIN check_booklet_registration cbr
          ON cbr.id = t.booklet_id

        WHERE cbr.bank_account_id = $1
          AND t.check_date::date = $2::date
          AND LOWER(COALESCE(t.status, '')) NOT IN (
            'cancelled',
            'void'
          )

        ORDER BY
          t.check_date ASC,
          t.check_number ASC,
          t.id ASC
      `,
      [bankAccountId, date]
    );

    return NextResponse.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error: unknown) {
    console.error("GET /api/check-issuance/rci error:", error);

    if (
      error instanceof Error &&
      error.message === "FORBIDDEN"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "You do not have permission to generate RCI.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve RCI records.",
      },
      { status: 500 }
    );
  }
}