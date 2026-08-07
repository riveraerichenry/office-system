import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
    SELECT
        h.id,
        h.action,
        h.previous_status,
        h.new_status,
        h.previous_current_or,
        h.new_current_or,
        h.remarks,
        h.performed_at,

        b.control_no,
        b.series,
        b.status,

        af.form_code,

        u.full_name AS performed_by_name

    FROM smi_booklet_registration_history h

    LEFT JOIN smi_booklet_registration b
        ON b.id = h.booklet_registration_id

    LEFT JOIN accountable_forms af
        ON af.id = b.accountable_form_id

    LEFT JOIN users u
        ON u.id = h.performed_by

    ORDER BY h.performed_at DESC

    LIMIT 20
`);

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load history.",
      },
      { status: 500 }
    );
  }
}