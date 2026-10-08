import {
    NextRequest,
    NextResponse,
} from "next/server";

import {
    pool,
} from "@/lib/db";


type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};


export async function GET(
    _request: NextRequest,
    context: RouteContext
) {

    try {

        const {
            id,
        } = await context.params;


        if (!id) {

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "CTC-I transaction ID is required.",
                },
                {
                    status: 400,
                }
            );

        }


        const result =
            await pool.query(
                `
                SELECT

                    /* =========================
                       TRANSACTION
                    ========================= */

                    dt.id,

                    dt.or_number,

                    dt.receipt_date,

                    dt.booklet_registration_id,

                    dt.lor_release_id,

                    dt.accountable_form_id,

                    dt.collector_id,

                    collector_user.full_name
                        AS collector,

                    dt.payor,

                    dt.payment_mode,

                    dt.remarks,

                    dt.grand_total,

                    dt.status,

                    dt.is_cancelled,

                    dt.cancelled_at,

                    dt.cancelled_by,

                    dt.created_at,

                    dt.updated_at,

                    dt.remittance_id,

                    dt.encoded_by,

                    encoder_user.full_name
                        AS encoded_by_name,

                    encoder_user.username
                        AS encoded_by_username,

                    dt.updated_by,

                    dt.posted_by,

                    dt.posted_at,

                    dt.billing_id,

                    dt.transaction_type,

                    dt.is_remitted,

                    dt.gender,


                    /* =========================
                       CTC DETAILS
                    ========================= */

                    ci.id
                        AS ctc_item_id,

                    ci.ctc_type,

                    ci.full_name,

                    ci.address,

                    ci.tin,

                    ci.cr_number,

                    ci.citizenship,

                    ci.sex,

                    ci.height,

                    ci.weight,

                    ci.place_of_birth,

                    ci.birth_date,

                    ci.civil_status,

                    ci.occupation,

                    ci.corporation_name,

                    ci.sec_registration,

                    ci.representative,

                    ci.place_issued,

                    ci.issue_date,

                    ci.tax_mode,

                    ci.taxable_amount,

                    ci.basic_tax,

                    ci.salary_tax,

                    ci.additional_tax,

                    ci.penalty,

                    ci.interest,

                    ci.total_amount,

                    ci.account_id


                FROM
                    dipp_transactions dt


                LEFT JOIN
                    users collector_user

                ON
                    collector_user.id =
                    dt.collector_id


                LEFT JOIN
                    users encoder_user

                ON
                    encoder_user.id =
                    dt.encoded_by


                INNER JOIN
                    dipp_ctc_items ci

                ON
                    ci.transaction_id =
                    dt.id


                WHERE
                    dt.id = $1

                    AND dt.transaction_type = 'CTC'

                    AND ci.ctc_type = 'INDIVIDUAL'


                LIMIT 1
                `,
                [
                    id,
                ]
            );


        if (
            result.rows.length === 0
        ) {

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "CTC-I transaction not found.",
                },
                {
                    status: 404,
                }
            );

        }


        const transaction =
            result.rows[0];


        return NextResponse.json(
            {
                success: true,

                transaction,
            },
            {
                status: 200,
            }
        );


    } catch (
        err: any
    ) {

        console.error(
            "GET CTC-I ERROR:",
            err
        );


        return NextResponse.json(
            {
                success: false,

                message:
                    err?.message ??
                    "Failed to retrieve CTC-I transaction.",
            },
            {
                status: 500,
            }
        );

    }

}