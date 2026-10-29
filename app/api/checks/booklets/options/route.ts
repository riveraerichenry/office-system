
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [banksResult, accountsResult, fundsResult] =
      await Promise.all([
        pool.query(`
          SELECT
            id,
            bank_name AS "bankName",
            to_jsonb(b) AS details
          FROM banks b
          ORDER BY bank_name ASC
        `),

        pool.query(`
          SELECT
            ba.id,
            ba.bank_id AS "bankId",
            ba.account_number AS "accountNumber",
            to_jsonb(ba) AS details
          FROM bank_accounts ba
          ORDER BY ba.account_number ASC
        `),

        pool.query(`
          SELECT
            id,
            fund_name AS "fundName",
            to_jsonb(fs) AS details
          FROM fund_sources fs
          ORDER BY fund_name ASC
        `),
      ]);

    return NextResponse.json({
      success: true,
      banks: banksResult.rows,
      accounts: accountsResult.rows,
      fundSources: fundsResult.rows,
    });
  } catch (error) {
    console.error("GET /api/checks/booklets/options error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load bank, account, and fund source options.",
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
      },
      { status: 500 }
    );
  }
}
