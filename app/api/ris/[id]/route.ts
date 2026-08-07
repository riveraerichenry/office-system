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
      MODULE_PATHS.RIS,
      "view"
    );

    const { id } = await params;

    // Header
    const headerResult = await pool.query(
      `
      SELECT

          rr.id,
          rr.ris_no,
          rr.request_date,
          rr.status,
          rr.remarks,

          rr.approved_date,

          requester.full_name
              AS requester,

          approver.full_name
              AS approved_by

      FROM ris_requests rr

      LEFT JOIN users requester
          ON requester.id = rr.requested_by

      LEFT JOIN users approver
          ON approver.id = rr.approved_by

      WHERE
          rr.id = $1
      `,
      [id]
    );

    if (headerResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "RIS not found.",
        },
        {
          status: 404,
        }
      );
    }

    // Items
    const itemResult = await pool.query(
      `
      SELECT

          ri.id,

          af.form_code,
          af.form_name,

          ri.quantity,
          ri.remarks

      FROM ris_request_items ri

      INNER JOIN accountable_forms af
          ON af.id = ri.accountable_form_id

      WHERE
          ri.ris_request_id = $1

      ORDER BY
          af.form_code
      `,
      [id]
    );

    return NextResponse.json({
      success: true,

      header:
        headerResult.rows[0],

      items:
        itemResult.rows,
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