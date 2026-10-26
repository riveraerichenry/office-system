import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const bankId = req.nextUrl.searchParams.get("bank_id");

    if (!bankId) {
      return NextResponse.json(
        { success: false, message: "Bank ID is required." },
        { status: 400 }
      );
    }

    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidPattern.test(bankId)) {
      return NextResponse.json(
        { success: false, message: "Invalid bank ID." },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `
        SELECT
          ba.id,
          ba.bank_id AS "bankId",
          ba.sequence_code AS "sequenceCode",
          ba.account_number AS "accountNumber",
          ba.account_code AS "accountCode",
          ba.account_name AS "accountName",
          ba.account_status AS "accountStatus",
          ba.deposit_label AS "depositLabel",
          ba.remarks,
          ba.is_active AS "isActive"
        FROM bank_accounts ba
        INNER JOIN banks b
          ON b.id = ba.bank_id
        WHERE ba.bank_id = $1
          AND ba.is_active = TRUE
          AND b.is_active = TRUE
        ORDER BY ba.account_name ASC
      `,
      [bankId]
    );

    return NextResponse.json({
      success: true,
      accounts: result.rows,
    });
  } catch (error) {
    console.error("GET /api/deposit/bank-accounts error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to load bank accounts." },
      { status: 500 }
    );
  }
}