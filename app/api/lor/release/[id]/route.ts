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

    const header =
      await pool.query(
        `
        SELECT

            rh.*,

            rr.ris_no,

            requester.full_name
                AS officer

        FROM rat_headers rh

        INNER JOIN ris_requests rr

            ON rr.id =
            rh.ris_id

        INNER JOIN users requester

            ON requester.id =
            rr.requested_by

        WHERE
            rh.id = $1
        `,
        [id]
      );

    const items =
      await pool.query(
        `
        SELECT

            ri.id,

            af.form_code,

            af.form_name,

            afb.id
                AS booklet_id,

            afb.control_no,

            afb.series,

            afb.beginning_or,

            afb.current_or,

            afb.ending_or,

            afb.receipt_count

        FROM rat_items ri

        INNER JOIN accountable_form_booklets afb

            ON afb.id =
            ri.accountable_form_booklet_id

        INNER JOIN accountable_forms af

            ON af.id =
            afb.accountable_form_id

        WHERE

            ri.rat_id = $1

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
          err.message,
      },
      {
        status: 500,
      }
    );

  }

}