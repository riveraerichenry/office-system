
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [fundSources, banks, accounts] = await Promise.all([
      pool.query(`
        SELECT
          id,
          fund_name AS name,
          fund_code,
          acronym
        FROM fund_sources
        WHERE is_active = TRUE
        ORDER BY fund_name ASC
      `),

      pool.query(`
        SELECT
          id,
          bank_name AS name,
          bank_code
        FROM banks
        WHERE is_active = TRUE
        ORDER BY bank_name ASC
      `),

      pool.query(`
        SELECT
          id,
          bank_id,
          account_number,
          account_name,
          account_code
        FROM bank_accounts
        WHERE is_active = TRUE
          AND UPPER(account_status) = 'ACTIVE'
        ORDER BY account_number ASC
      `),
    ]);

    return NextResponse.json({
      fundSources: fundSources.rows,
      banks: banks.rows,
      accounts: accounts.rows,
    });
  } catch (error) {
    console.error("Failed to load check registration options:", error);

    return NextResponse.json(
      { message: "Failed to load check registration options." },
      { status: 500 }
    );
  }
}
