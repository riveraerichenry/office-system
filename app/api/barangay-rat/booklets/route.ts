import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
    try {
        const result = await pool.query(`
            SELECT
                sbr.id,
                sbr.control_no,
                sbr.accountable_form_id,

                af.form_code,

                sbr.fiscal_year,
                sbr.series,
                sbr.beginning_or,
                sbr.ending_or,
                sbr.receipt_count,
                sbr.current_or,
                sbr.status,
                sbr.received_date,
                sbr.issued_date,
                sbr.supplier,
                sbr.remarks,
                sbr.is_active,
                sbr.created_by,
                sbr.created_at,
                sbr.updated_at

            FROM smi_booklet_registration sbr

            LEFT JOIN accountable_forms af
                ON af.id = sbr.accountable_form_id

            WHERE
                sbr.is_active = TRUE

                AND UPPER(sbr.control_no) LIKE 'CTC-I%'

                AND (
                    sbr.status IS NULL
                    OR UPPER(sbr.status) <> 'ISSUED'
                )

            ORDER BY
                sbr.fiscal_year DESC,
                sbr.series ASC,
                sbr.beginning_or ASC
        `);

        return NextResponse.json({
            success: true,
            booklets: result.rows,
        });
    } catch (error) {
        console.error(
            "Barangay RAT booklets error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to load available booklets.",
            },
            {
                status: 500,
            }
        );
    }
}