import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/authorize";
import { pool } from "@/lib/db";
import { MODULE_PATHS } from "@/lib/module-paths";

export async function GET(req: NextRequest) {
  try {
    await authorize(
      req,
      MODULE_PATHS.RAT,
      "view"
    );

    const { searchParams } =
      new URL(req.url);

    const search =
      searchParams.get("search") ?? "";

    const month =
      searchParams.get("month");

    const fiscalYear =
      searchParams.get("fiscal_year");

    const status =
      searchParams.get("status");

    const values: any[] = [];
    const conditions: string[] = [];

    /*
    |--------------------------------------------------------------------------
    | Search
    |--------------------------------------------------------------------------
    */

    values.push(`%${search}%`);

    conditions.push(`
      (
          rh.rat_no ILIKE $${values.length}

          OR rr.ris_no ILIKE $${values.length}

          OR requester.full_name ILIKE $${values.length}
      )
    `);

    /*
    |--------------------------------------------------------------------------
    | Month
    |--------------------------------------------------------------------------
    */

    if (month) {

      values.push(month);

      conditions.push(`
        EXTRACT(
          MONTH
          FROM rh.generated_at
        ) = $${values.length}
      `);

    }

    /*
    |--------------------------------------------------------------------------
    | Fiscal Year
    |--------------------------------------------------------------------------
    */

    if (fiscalYear) {

      values.push(fiscalYear);

      conditions.push(`
        EXTRACT(
          YEAR
          FROM rh.generated_at
        ) = $${values.length}
      `);

    }

    /*
    |--------------------------------------------------------------------------
    | Status
    |--------------------------------------------------------------------------
    */

    if (status) {

      values.push(status);

      conditions.push(`
        rh.status = $${values.length}
      `);

    }

    const result =
      await pool.query(
        `
        SELECT

            rh.id,
            rh.rat_no,
            rh.status,
            rh.generated_at,

            rr.ris_no,

            requester.full_name
                AS accountable_officer,

            COUNT(ri.id)
                AS booklet_count

        FROM rat_headers rh

        INNER JOIN ris_requests rr
            ON rr.id =
                rh.ris_id

        INNER JOIN users requester
            ON requester.id =
                rr.requested_by

        LEFT JOIN rat_items ri
            ON ri.rat_id =
                rh.id

        WHERE

            rh.is_active = TRUE

            AND
            ${conditions.join(" AND ")}

        GROUP BY

            rh.id,
            rh.rat_no,
            rh.status,
            rh.generated_at,
            rr.ris_no,
            requester.full_name

        ORDER BY

            rh.generated_at DESC,
            rh.rat_no DESC
        `,
        values
      );


      const fiscalYears = await pool.query(`
        SELECT DISTINCT
            EXTRACT(YEAR FROM generated_at)::INT AS fiscal_year
        FROM rat_headers
        WHERE
            generated_at IS NOT NULL
            AND is_active = TRUE
        ORDER BY
            fiscal_year DESC
      `);

    return NextResponse.json({
      success: true,
      data: result.rows,
      fiscalYears: fiscalYears.rows,
    });

  } catch (err: any) {

    console.error(err);

    return NextResponse.json(
      {
        success: false,
        message: err.message,
      },
      {
        status: 500,
      }
    );

  }
}