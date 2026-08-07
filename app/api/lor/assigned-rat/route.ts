import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/authorize";
import { pool } from "@/lib/db";
import { MODULE_PATHS } from "@/lib/module-paths";

export async function GET(req: NextRequest) {
  try {

    await authorize(
      req,
      MODULE_PATHS.LOR,
      "view"
    );

    const { searchParams } =
      new URL(req.url);

    const search =
      searchParams.get("search") ?? "";

    const result =
      await pool.query(
        `
        SELECT

            rti.id,

            rh.id
                AS rat_id,

            rh.rat_no,

            rr.id
                AS ris_id,

            rr.ris_no,

            requester.id
                AS accountable_officer_id,

            requester.full_name
                AS accountable_officer,

            generator.id
                AS assigned_by_id,

            generator.full_name
                AS assigned_by,

            af.id
                AS accountable_form_id,

            af.form_code,

            af.form_name,

            sbr.id
                AS booklet_registration_id,

            sbr.control_no,

            sbr.fiscal_year,

            sbr.series,

            sbr.beginning_or,

            sbr.ending_or,

            sbr.current_or,

            sbr.receipt_count,

            sbr.status
                AS booklet_status,

            rh.generated_at

        FROM rat_items rti

        INNER JOIN rat_headers rh
            ON rh.id =
                rti.rat_id

        INNER JOIN ris_requests rr
            ON rr.id =
                rh.ris_id

        INNER JOIN users requester
            ON requester.id =
                rr.requested_by

        INNER JOIN users generator
            ON generator.id =
                rh.generated_by

        INNER JOIN smi_booklet_registration sbr
            ON sbr.id =
                rti.booklet_registration_id

        INNER JOIN accountable_forms af
            ON af.id =
                sbr.accountable_form_id

        LEFT JOIN lor_releases lr
            ON lr.rat_item_id =
                rti.id
            AND lr.is_active = TRUE

        WHERE

            rti.is_active = TRUE

            AND
            rh.is_active = TRUE

            AND
            rh.status = 'Assigned'

            AND
            lr.id IS NULL

            AND (

                rh.rat_no ILIKE $1

                OR rr.ris_no ILIKE $1

                OR requester.full_name ILIKE $1

                OR generator.full_name ILIKE $1

                OR af.form_code ILIKE $1

                OR af.form_name ILIKE $1

                OR sbr.control_no ILIKE $1

            )

        ORDER BY

            rh.generated_at DESC,

            rh.rat_no,

            af.form_code,

            sbr.control_no
        `,
        [`%${search}%`]
      );

    return NextResponse.json({

      success: true,

      data: result.rows,

    });

  } catch (err: any) {

    console.error("================================");
    console.error("LOR Assigned RAT Error");
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