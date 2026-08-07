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
      MODULE_PATHS.LOR,
      "view"
    );

    const { id } =
      await params;

    /*
    |--------------------------------------------------------------------------
    | Header
    |--------------------------------------------------------------------------
    */

    const header =
      await pool.query(
        `

        SELECT

            lh.*,

            rh.rat_no,

            rr.ris_no,

            officer.full_name
                AS officer,

            releaser.full_name
                AS released_by

        FROM lor_headers lh

        INNER JOIN rat_headers rh

            ON rh.id =
            lh.rat_id

        INNER JOIN ris_requests rr

            ON rr.id =
            rh.ris_id

        INNER JOIN users officer

            ON officer.id =
            lh.officer_id

        INNER JOIN users releaser

            ON releaser.id =
            lh.released_by

        WHERE

            lh.id = $1

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
            "LOR not found."

        },
        {

          status: 404

        }
      );

    }

    /*
    |--------------------------------------------------------------------------
    | Booklets
    |--------------------------------------------------------------------------
    */

    const items =
      await pool.query(
        `

        SELECT

            li.id,

            li.status,

            li.beginning_or,

            li.current_or,

            li.ending_or,

            afb.control_no,

            afb.series,

            af.form_code,

            af.form_name

        FROM lor_items li

        INNER JOIN accountable_form_booklets afb

            ON afb.id =
            li.accountable_form_booklet_id

        INNER JOIN accountable_forms af

            ON af.id =
            afb.accountable_form_id

        WHERE

            li.lor_id = $1

        ORDER BY

            af.form_name,

            afb.control_no

        `,
        [id]
      );

    return NextResponse.json({

      success: true,

      header:
        header.rows[0],

      items:
        items.rows,

    });

  } catch (err: any) {

    console.error(err);

    return NextResponse.json(
      {

        success: false,

        message:
          err.message

      },
      {

        status: 500

      }
    );

  }

}