import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/authorize";
import { pool } from "@/lib/db";
import { MODULE_PATHS } from "@/lib/module-paths";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await authorize(req, MODULE_PATHS.RIS_APPROVAL, "view");

    const { id } = await params;

    const header = await pool.query(
      `
      SELECT
          rr.id,
          rr.ris_no,
          rr.status,
          rr.request_date,
          rr.approved_date,
          rr.remarks,

          requester.full_name AS requested_by,
          approver.full_name AS approved_by

      FROM ris_requests rr

      LEFT JOIN users requester
          ON requester.id = rr.requested_by

      LEFT JOIN users approver
          ON approver.id = rr.approved_by

      WHERE
          rr.id = $1
          AND rr.is_active = TRUE
      `,
      [id]
    );

    if (header.rows.length === 0) {
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

    const items = await pool.query(
      `
      SELECT
          ri.id,
          ri.quantity,
          ri.remarks,

          af.id AS accountable_form_id,
          af.form_code,
          af.form_name

      FROM ris_request_items ri

      INNER JOIN accountable_forms af
          ON af.id = ri.accountable_form_id

      WHERE
          ri.ris_request_id = $1
          AND ri.is_active = TRUE

      ORDER BY
          af.form_code
      `,
      [id]
    );

    return NextResponse.json({
      success: true,
      data: {
        ...header.rows[0],
        items: items.rows,
      },
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