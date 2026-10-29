
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        cbr.id,
        cbr.booklet_number,
        cbr.book_no,
        cbr.bank,
        b.bank_code,
        cbr.account_number,
        cbr.beginning_check_no,
        cbr.ending_check_no,
        cbr.current_check_no,
        cbr.total_checks,
        cbr.issued_checks,
        cbr.remaining_checks,
        cbr.date_received,
        cbr.fund_source_id,
        cbr.bank_id,
        cbr.bank_account_id,
        cbr.status,
        fs.fund_code,
        fs.fund_name,
        fs.acronym
      FROM check_booklet_registration cbr
      LEFT JOIN banks b
        ON b.id = cbr.bank_id
      LEFT JOIN fund_sources fs
        ON fs.id = cbr.fund_source_id
      WHERE
        COALESCE(cbr.remaining_checks, 0) > 0
        AND LOWER(COALESCE(cbr.status, '')) IN (
          'active',
          'registered'
        )
      ORDER BY
        cbr.registered_at DESC NULLS LAST,
        cbr.created_at DESC NULLS LAST
    `);

    const data = result.rows.map((row) => ({
      id: row.id,
      booklet_number: row.booklet_number,
      book_no: row.book_no,
      check_number: row.current_check_no,
      beginning_check_no: row.beginning_check_no,
      ending_check_no: row.ending_check_no,
      bank_name: row.bank,
      bank_code: row.bank_code,
      account_number: row.account_number,
      bank_id: row.bank_id,
      bank_account_id: row.bank_account_id,
      fund_source_id: row.fund_source_id,
      fund_source: row.fund_name ?? "Unassigned Fund Source",
      fund_code: row.fund_code,
      fund_acronym: row.acronym,
      total_checks: Number(row.total_checks ?? 0),
      issued_checks: Number(row.issued_checks ?? 0),
      remaining_checks: Number(row.remaining_checks ?? 0),
      date_received: row.date_received,
      status: "Available",
    }));

    return NextResponse.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("GET /api/checks/available:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve available checks.",
        error:
          error instanceof Error
            ? error.message
            : "Unknown database error",
      },
      { status: 500 }
    );
  }
}
