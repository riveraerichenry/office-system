import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const fiscalYearParam = request.nextUrl.searchParams.get("fiscal_year");
    const fiscalYear = fiscalYearParam
      ? Number(fiscalYearParam)
      : new Date().getFullYear();

    if (!Number.isInteger(fiscalYear) || fiscalYear < 1900 || fiscalYear > 9999) {
      return NextResponse.json(
        { success: false, message: "Invalid fiscal year." },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `
        WITH office_appropriations AS (
          SELECT
            COALESCE(category.office_id, sub_office.office_id) AS office_id,
            SUM(appropriation.appropriated_amount)::numeric AS total_appropriation
          FROM budget_appropriations AS appropriation
          INNER JOIN expense_accounts AS account
            ON account.id = appropriation.account_id
          INNER JOIN expense_account_category AS category
            ON category.id = account.category_id
          LEFT JOIN sub_offices AS sub_office
            ON sub_office.id = category.sub_office_id
          WHERE appropriation.fiscal_year = $1
            AND appropriation.is_active = TRUE
          GROUP BY COALESCE(category.office_id, sub_office.office_id)
        )
        SELECT
          office.id AS office_id,
          office.office_name,
          COALESCE(office_appropriations.total_appropriation, 0)::numeric
            AS appropriation
        FROM offices AS office
        LEFT JOIN office_appropriations
          ON office_appropriations.office_id = office.id
        ORDER BY office.office_name ASC
      `,
      [fiscalYear]
    );

    const data = result.rows.map((row) => ({
      office_id: String(row.office_id),
      office_name: row.office_name,
      appropriation: Number(row.appropriation || 0),
    }));

    return NextResponse.json({
      success: true,
      fiscal_year: fiscalYear,
      data,
    });
  } catch (error) {
    console.error("GET /budget/api/dashboard/office-utilization Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load budget utilization by office.",
      },
      { status: 500 }
    );
  }
}
