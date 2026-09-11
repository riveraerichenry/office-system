import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { authorize } from "@/lib/authorize";
import { MODULE_PATHS } from "@/lib/module-paths";

export async function GET(req: NextRequest) {
  try {
    await authorize(
      req,
      MODULE_PATHS.SMI,
      "view"
    );

    const { searchParams } = new URL(req.url);

    const search =
      searchParams.get("search") || "";

    const fiscalYear =
      searchParams.get("year") ||
      new Date().getFullYear().toString();

    const values: any[] = [];
    const conditions: string[] = [];

    /*
    |--------------------------------------------------------------------------
    | Search
    |--------------------------------------------------------------------------
    */

    if (search) {
      values.push(`%${search}%`);

      conditions.push(`
        (
          af.form_code ILIKE $${values.length}
          OR af.form_name ILIKE $${values.length}
        )
      `);
    }

    /*
    |--------------------------------------------------------------------------
    | Fiscal Year
    |--------------------------------------------------------------------------
    */

    values.push(Number(fiscalYear));

    const yearParam = values.length;

    /*
    |--------------------------------------------------------------------------
    | Inventory Query
    |--------------------------------------------------------------------------
    */

    const result = await pool.query(
      `
      SELECT
          af.id,
          af.form_code,
          af.form_name,

          /*
          |--------------------------------------------------------------------------
          | Total Registered
          |--------------------------------------------------------------------------
          | Number of active booklets registered
          | for the selected fiscal year.
          |--------------------------------------------------------------------------
          */

          COALESCE(
            COUNT(br.id),
            0
          ) AS total_registered,

          /*
          |--------------------------------------------------------------------------
          | Total Issued
          |--------------------------------------------------------------------------
          | A registered booklet is considered issued
          | when issued_date is NOT NULL.
          |
          | br.id IS NOT NULL is important because this
          | query uses LEFT JOIN. Without it, an
          | unregistered accountable form could incorrectly
          | be counted as one remaining booklet.
          |--------------------------------------------------------------------------
          */

          COALESCE(
            COUNT(*) FILTER (
              WHERE
                br.id IS NOT NULL
                AND br.issued_date IS NOT NULL
            ),
            0
          ) AS total_issued,

          /*
          |--------------------------------------------------------------------------
          | Total Remaining
          |--------------------------------------------------------------------------
          | A registered booklet is considered remaining
          | when issued_date is NULL.
          |
          | br.id IS NOT NULL ensures that an accountable
          | form with no registered booklet is counted as
          | zero remaining.
          |--------------------------------------------------------------------------
          */

          COALESCE(
            COUNT(*) FILTER (
              WHERE
                br.id IS NOT NULL
                AND br.issued_date IS NULL
            ),
            0
          ) AS total_remaining

      FROM accountable_forms af

      LEFT JOIN smi_booklet_registration br
        ON br.accountable_form_id = af.id
        AND br.is_active = TRUE
        AND br.fiscal_year = $${yearParam}

      ${
        conditions.length
          ? `WHERE ${conditions.join(" AND ")}`
          : ""
      }

      GROUP BY
          af.id,
          af.form_code,
          af.form_name

      ORDER BY
          af.form_code;
      `,
      values
    );

    /*
    |--------------------------------------------------------------------------
    | Fiscal Years
    |--------------------------------------------------------------------------
    */

    const yearsResult = await pool.query(`
      SELECT DISTINCT
          fiscal_year
      FROM smi_booklet_registration
      WHERE is_active = TRUE
      ORDER BY fiscal_year DESC
    `);

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    return NextResponse.json({
      success: true,
      data: result.rows,
      years: yearsResult.rows.map(
        (row) => row.fiscal_year
      ),
    });

  } catch (error) {
    console.error(
      "Inventory Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to load inventory.",
      },
      {
        status: 500,
      }
    );
  }
}