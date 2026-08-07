import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { authorize } from "@/lib/authorize";
import { MODULE_PATHS } from "@/lib/module-paths";

type Params = {
  params: Promise<{
    formId: string;
  }>;
};

export async function GET(
  req: NextRequest,
  { params }: Params
) {
  try {
    await authorize(req, MODULE_PATHS.SMI, "view");

    const { formId } = await params;

    const result = await pool.query(
      `
      SELECT
          br.id,
          br.control_no,
          br.series,
          br.beginning_or,
          br.ending_or,
          br.receipt_count,
          br.current_or,
          br.fiscal_year,
          br.status,
          br.received_date,
          br.issued_date,
          br.supplier,
          br.remarks,
          br.created_at,

          af.form_code,
          af.form_name,

          u.full_name AS registered_by

      FROM smi_booklet_registration br

      INNER JOIN accountable_forms af
          ON af.id = br.accountable_form_id

      LEFT JOIN users u
          ON u.id = br.created_by

      WHERE
          br.accountable_form_id = $1
          AND br.is_active = TRUE

      ORDER BY
          br.series;
      `,
      [formId]
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load booklets.",
      },
      {
        status: 500,
      }
    );
  }
}