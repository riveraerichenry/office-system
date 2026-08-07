import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/authorize";
import { pool } from "@/lib/db";
import { MODULE_PATHS } from "@/lib/module-paths";

export async function GET(
  req: NextRequest
) {
  try {

    await authorize(
      req,
      MODULE_PATHS.LOR,
      "view"
    );

    const search =
      req.nextUrl.searchParams.get("search") || "";

    const year =
      req.nextUrl.searchParams.get("year") || "";

    const officer =
      req.nextUrl.searchParams.get("officer") || "";

    const params: any[] = [];

    let where = `
      WHERE
          lr.is_active = TRUE
    `;

    /*
    |--------------------------------------------------------------------------
    | Search
    |--------------------------------------------------------------------------
    */

    if (search) {

      params.push(`%${search}%`);

      where += `

      AND (

          lr.lor_no ILIKE $${params.length}

          OR rh.rat_no ILIKE $${params.length}

          OR rr.ris_no ILIKE $${params.length}

          OR af.form_code ILIKE $${params.length}

          OR af.form_name ILIKE $${params.length}

          OR sbr.control_no ILIKE $${params.length}

      )

      `;

    }

    /*
    |--------------------------------------------------------------------------
    | Year Filter
    |--------------------------------------------------------------------------
    */

    if (year) {

      params.push(Number(year));

      where += `

      AND

      EXTRACT(
          YEAR
          FROM lr.released_at
      ) = $${params.length}

      `;

    }

    /*
    |--------------------------------------------------------------------------
    | Accountable Officer Filter
    |--------------------------------------------------------------------------
    */

    if (officer) {

      params.push(officer);

      where += `

      AND

      lr.accountable_officer_id = $${params.length}

      `;

    }

    /*
    |--------------------------------------------------------------------------
    | LOR Records
    |--------------------------------------------------------------------------
    */

    const result =
      await pool.query(
        `

        SELECT

            lr.id,

            lr.lor_no,

            lr.released_at,

            lr.status,

            rh.rat_no,

            rr.ris_no,

            af.id
                AS accountable_form_id,

            af.form_code,

            af.form_name,

            sbr.id
                AS booklet_registration_id,

            sbr.control_no,

            sbr.beginning_or,

            sbr.ending_or,

            sbr.current_or,

            sbr.status
                AS booklet_status,

            fs.id
                AS fund_source_id,

            fs.fund_code,

            fs.fund_name,

            officer.id
                AS accountable_officer_id,

            officer.full_name
                AS accountable_officer,

            releaser.id
                AS released_by_id,

            releaser.full_name
                AS released_by,

            lr.remarks

        FROM lor_releases lr

        INNER JOIN rat_headers rh
            ON rh.id =
                lr.rat_id

        INNER JOIN ris_requests rr
            ON rr.id =
                lr.ris_id

        INNER JOIN smi_booklet_registration sbr
            ON sbr.id =
                lr.booklet_registration_id

        INNER JOIN accountable_forms af
            ON af.id =
                lr.accountable_form_id

        INNER JOIN fund_sources fs
            ON fs.id =
                lr.fund_source_id

        INNER JOIN users officer
            ON officer.id =
                lr.accountable_officer_id

        INNER JOIN users releaser
            ON releaser.id =
                lr.released_by

        ${where}

        ORDER BY

            lr.released_at DESC,

            lr.lor_no DESC

        `,
        params
      );

    /*
    |--------------------------------------------------------------------------
    | Accountable Officers
    |--------------------------------------------------------------------------
    */

    const officers =
      await pool.query(
        `
        SELECT DISTINCT

            u.id,

            u.full_name

        FROM lor_releases lr

        INNER JOIN users u
            ON u.id =
                lr.accountable_officer_id

        WHERE

            lr.is_active = TRUE

        ORDER BY

            u.full_name
        `
      );

    return NextResponse.json({

      success: true,

      data: result.rows,

      officers: officers.rows,

    });

  } catch (err: any) {

    console.error("================================");
    console.error("LOR API Error");
    console.error(err);
    console.error("================================");

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