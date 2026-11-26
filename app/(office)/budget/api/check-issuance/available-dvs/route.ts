import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        dv.id,
        dv.dv_no,
        dv.dv_date,
        dv.payee,
        dv.payor,
        dv.particulars,
        dv.grand_total,
        dv.status,
        dv.created_at,

        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', dvi.id,
                'obr_id', dvi.obr_id,
                'obr_no', COALESCE(dvi.obr_no, pro.obr_number),
                'obr_date', pro.obr_date,
                'payee', pro.payee,
                'particulars', dvi.particulars,
                'amount', dvi.amount,
                'obr_particulars', pro.particulars,
                'obligation_amount', pro.obligation_amount
              )
              ORDER BY pro.obr_date DESC NULLS LAST
            )
            FROM disbursement_voucher_items dvi
            LEFT JOIN purchase_request_obrs pro
              ON pro.id = dvi.obr_id
            WHERE dvi.dv_id = dv.id
          ),
          '[]'::json
        ) AS obrs

      FROM disbursement_vouchers dv

      WHERE NOT EXISTS (
        SELECT 1
        FROM budget_check_issuance bci
        WHERE bci.dv_id = dv.id
      )

      AND LOWER(COALESCE(dv.status, '')) <> 'cancelled'

      ORDER BY dv.dv_date DESC, dv.created_at DESC
    `);

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Available DVs error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch available DVs.",
      },
      { status: 500 }
    );
  }
}