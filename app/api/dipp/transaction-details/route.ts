import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/authorize";
import { pool } from "@/lib/db";
import { MODULE_PATHS } from "@/lib/module-paths";

export async function GET(req: NextRequest) {
    try {
        await authorize(
            req,
            MODULE_PATHS.DIPP,
            "view"
        );

        const id = req.nextUrl.searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Transaction ID is required.",
                },
                {
                    status: 400,
                }
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Transaction Header
        |--------------------------------------------------------------------------
        */

        const headerResult = await pool.query(
            `
            SELECT

                dt.id,
                dt.or_number,
                dt.receipt_date,
                dt.payor,
                dt.payment_mode,
                dt.remarks,
                dt.grand_total,
                dt.status,

                af.form_code,
                af.form_name,

                u.full_name AS encoded_by,

                sbr.control_no AS booklet_number,
                sbr.fiscal_year,
                sbr.series,
                sbr.beginning_or,
                sbr.ending_or,
                sbr.current_or,
                sbr.receipt_count,
                sbr.received_date,
                sbr.issued_date

            FROM dipp_transactions dt

            INNER JOIN accountable_forms af
                ON af.id = dt.accountable_form_id

            LEFT JOIN users u
                ON u.id = dt.encoded_by

            LEFT JOIN smi_booklet_registration sbr
                ON sbr.id = dt.booklet_registration_id

            WHERE dt.id = $1
            `,
            [id]
        );

        if (headerResult.rows.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Transaction not found.",
                },
                {
                    status: 404,
                }
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Transaction Items
        |--------------------------------------------------------------------------
        */

        const itemsResult = await pool.query(
            `
            SELECT

                a.account_code,
                a.account_name,
                dti.amount,
                dti.remarks

            FROM dipp_transaction_items dti

            INNER JOIN accounts a
                ON a.id = dti.account_id

            WHERE dti.transaction_id = $1

            ORDER BY a.account_code
            `,
            [id]
        );

        /*
        |--------------------------------------------------------------------------
        | Response
        |--------------------------------------------------------------------------
        */

        return NextResponse.json({
            success: true,
            header: headerResult.rows[0],
            items: itemsResult.rows,
        });
    } catch (err: any) {
        console.error("====================================");
        console.error("TRANSACTION DETAILS");
        console.error(err);
        console.error("====================================");

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