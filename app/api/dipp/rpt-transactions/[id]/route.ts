import {
    NextRequest,
    NextResponse,
} from "next/server";

import { pool } from "@/lib/db";


export async function GET(
    request: NextRequest,
    {
        params,
    }: {
        params: Promise<{
            id: string;
        }>;
    }
) {

    try {

        const {
            id,
        } = await params;


        /*
        ================================================================
        VALIDATE ID
        ================================================================
        */

        if (!id) {

            return NextResponse.json(
                {
                    error:
                        "Transaction ID is required.",
                },
                {
                    status: 400,
                }
            );

        }


        /*
        ================================================================
        GET TRANSACTION
        ================================================================
        */

        const transactionResult =
            await pool.query(
                `
                SELECT
                    t.id,
                    t.or_number,
                    t.receipt_date,
                    t.booklet_registration_id,
                    t.lor_release_id,
                    t.accountable_form_id,
                    t.collector_id,
                    t.payor,
                    t.payment_mode,
                    t.remarks,
                    t.grand_total,
                    t.status,
                    t.is_cancelled,
                    t.cancelled_at,
                    t.cancelled_by,
                    t.created_at,
                    t.updated_at,
                    t.remittance_id,
                    t.encoded_by,
                    t.updated_by,
                    t.posted_by,
                    t.posted_at,
                    t.billing_id,
                    t.transaction_type,
                    t.is_remitted,

                    u.full_name AS collector_name

                FROM dipp_transactions t

                LEFT JOIN users u
                    ON u.id = t.collector_id

                WHERE t.id = $1

                LIMIT 1
                `,
                [id]
            );


        /*
        ================================================================
        TRANSACTION NOT FOUND
        ================================================================
        */

        if (
            transactionResult.rows.length === 0
        ) {

            return NextResponse.json(
                {
                    error:
                        "RPT transaction not found.",
                },
                {
                    status: 404,
                }
            );

        }


        const transaction =
            transactionResult.rows[0];


        /*
        ================================================================
        GET RPT ITEMS
        ================================================================
        */

        const itemsResult =
            await pool.query(
                `
                SELECT
                    i.id,
                    i.transaction_id,
                    i.billing_id,
                    i.tax_declaration_id,
                    i.td_number,
                    i.declared_owner,
                    i.property_location,
                    i.assessed_value,
                    i.start_quarter,
                    i.start_year,
                    i.end_quarter,
                    i.end_year,
                    i.basic,
                    i.sef,
                    i.penalty,
                    i.discount,
                    i.amount,
                    i.created_at,
                    i.tax_due,
                    i.billing_number,
                    i.billing_item_id,
                    i.account_id,

                    a.account_code,
                    a.account_name

                FROM dipp_rpt_items i

                LEFT JOIN accounts a
                    ON a.id = i.account_id

                WHERE i.transaction_id = $1

                ORDER BY
                    i.created_at ASC,
                    i.id ASC
                `,
                [id]
            );


        /*
        ================================================================
        RETURN
        ================================================================
        */

        return NextResponse.json(
            {
                success: true,

                transaction,

                items:
                    itemsResult.rows,

            },
            {
                status: 200,
            }
        );

    }
    catch (error) {

        console.error(
            "RPT TRANSACTION DETAILS API ERROR:",
            error
        );


        return NextResponse.json(
            {
                error:
                    "Failed to retrieve RPT transaction details.",
            },
            {
                status: 500,
            }
        );

    }

}