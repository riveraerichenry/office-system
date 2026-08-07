import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/authorize";
import { pool } from "@/lib/db";
import { MODULE_PATHS } from "@/lib/module-paths";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  req: NextRequest,
  { params }: Params
) {
  try {

    await authorize(
      req,
      MODULE_PATHS.RAT,
      "view"
    );

    const { id } =
      await params;

    /*
    |--------------------------------------------------------------------------
    | RIS Header
    |--------------------------------------------------------------------------
    */

    const header =
      await pool.query(
        `
        SELECT

            rr.*,

            requester.full_name
                AS requester,

            approver.full_name
                AS approver

        FROM ris_requests rr

        INNER JOIN users requester

            ON requester.id =
            rr.requested_by

        LEFT JOIN users approver

            ON approver.id =
            rr.approved_by

        WHERE

            rr.id = $1

        LIMIT 1
        `,
        [id]
      );

    if (
      header.rowCount === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "RIS not found."
        },
        {
          status: 404
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Requested Items
    |--------------------------------------------------------------------------
    */

    const items =
      await pool.query(
        `
        SELECT

            rii.id,

            rii.accountable_form_id,

            af.form_code,

            af.form_name,

            rii.quantity,

            rii.remarks

        FROM ris_request_items rii

        INNER JOIN accountable_forms af

            ON af.id =
            rii.accountable_form_id

        WHERE

            rii.ris_request_id = $1

        ORDER BY

            af.form_name
        `,
        [id]
      );

    return NextResponse.json({

      success: true,

      data: {

        ...header.rows[0],

        items:
          items.rows,

      },

    });

  } catch (err: any) {

    console.error(err);

    return NextResponse.json(
      {
        success: false,
        message:
          err.message ??
          "Server Error",
      },
      {
        status: 500,
      }
    );

  }
}