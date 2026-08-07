import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/authorize";
import { pool } from "@/lib/db";
import { MODULE_PATHS } from "@/lib/module-paths";

export async function GET(
  req: NextRequest
) {

  try {

    const user =
      await authorize(
        req,
        MODULE_PATHS.DIPP,
        "view"
      );

    const result =
      await pool.query(
        `
        SELECT

            dab.id,

            li.id
                AS lor_item_id,

            af.form_code,

            af.form_name,

            afb.control_no,

            afb.series,

            li.beginning_or,

            li.current_or,

            li.ending_or,

            fs.fund_name

        FROM dipp_active_booklets dab

        INNER JOIN lor_items li

            ON li.id =
            dab.lor_item_id

        INNER JOIN accountable_form_booklets afb

            ON afb.id =
            li.accountable_form_booklet_id

        INNER JOIN accountable_forms af

            ON af.id =
            afb.accountable_form_id

        LEFT JOIN fund_sources fs

            ON fs.id =
            li.fund_source_id

        WHERE

            dab.user_id = $1

            AND dab.is_active = TRUE

        LIMIT 1
        `,
        [
          user.id
        ]
      );

    return NextResponse.json({

      success:true,

      data:
        result.rows[0] ?? null

    });

  } catch(err:any){

    console.error(err);

    return NextResponse.json(
      {

        success:false,

        message:
          err.message

      },
      {
        status:500
      }
    );

  }

}