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

    const accountableFormId =
      req.nextUrl.searchParams.get(
        "accountable_form_id"
      );

    if (!accountableFormId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Accountable Form is required.",
        },
        {
          status: 400,
        }
      );
    }

    const result = await pool.query(
      `
      SELECT

          sbr.id,
          sbr.control_no,
          sbr.accountable_form_id,

          af.form_code,
          af.form_name,

          sbr.fiscal_year,
          sbr.series,
          sbr.beginning_or,
          sbr.ending_or,
          sbr.current_or,
          sbr.receipt_count,

          sbr.status,
          sbr.received_date,
          sbr.issued_date,

          sbr.supplier,
          sbr.remarks

      FROM smi_booklet_registration sbr

      INNER JOIN accountable_forms af
          ON af.id = sbr.accountable_form_id

      WHERE

          sbr.accountable_form_id = $1

          AND sbr.is_active = TRUE

          AND UPPER(sbr.status) = 'AVAILABLE'

      ORDER BY

          af.form_code,
          sbr.control_no
      `,
      [accountableFormId]
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
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