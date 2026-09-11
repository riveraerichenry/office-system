import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/authorize";
import { pool } from "@/lib/db";
import { MODULE_PATHS } from "@/lib/module-paths";

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    await authorize(
      req,
      MODULE_PATHS.RAT,
      "view"
    );

    const { id } = await params;

    /*
    |--------------------------------------------------------------------------
    | RAT Header
    |--------------------------------------------------------------------------
    */

    const header = await pool.query(
      `
      SELECT

          rh.*,

          rr.ris_no,
          rr.request_date,

          requester.full_name
              AS accountable_officer,

          generator.full_name
              AS generated_by_name

      FROM rat_headers rh

      INNER JOIN ris_requests rr
          ON rr.id = rh.ris_id

      INNER JOIN users requester
          ON requester.id = rr.requested_by

      LEFT JOIN users generator
          ON generator.id = rh.generated_by

      WHERE
          rh.id = $1

      LIMIT 1
      `,
      [id]
    );

    /*
    |--------------------------------------------------------------------------
    | RAT Items / Assigned Booklets
    |--------------------------------------------------------------------------
    */

    const items = await pool.query(
      `
      SELECT

          ri.id,

          ri.ris_request_item_id,
          ri.booklet_registration_id,

          af.form_code,
          af.form_name,

          sb.control_no,
          sb.series,

          sb.beginning_or,
          sb.ending_or,

          sb.current_or,

          sb.status,

          sb.issued_date

      FROM rat_items ri

      INNER JOIN smi_booklet_registration sb
          ON sb.id = ri.booklet_registration_id

      INNER JOIN accountable_forms af
          ON af.id = sb.accountable_form_id

      WHERE
          ri.rat_id = $1
          AND ri.is_active = TRUE

      ORDER BY
          af.form_code,
          sb.control_no
      `,
      [id]
    );

    return NextResponse.json({
      success: true,

      header:
        header.rows[0] ?? null,

      items:
        items.rows,
    });

  } catch (err: any) {

    console.error(
      "RAT Details Error:",
      err
    );

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