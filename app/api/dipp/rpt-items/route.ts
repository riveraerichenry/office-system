import {
    NextRequest,
    NextResponse,
} from "next/server";

import {
    authorize,
} from "@/lib/authorize";

import {
    pool,
} from "@/lib/db";

import {
    MODULE_PATHS,
} from "@/lib/module-paths";


export async function GET(
    req: NextRequest
) {

    try {

        await authorize(
            req,
            MODULE_PATHS.DIPP,
            "view"
        );


        const transactionId =
            req.nextUrl.searchParams.get(
                "id"
            );


        if (
            !transactionId
        ) {

            return NextResponse.json(
                {
                    success: false,

                    message:
                        "Transaction ID is required.",
                },
                {
                    status: 400,
                }
            );

        }


        /*
        |--------------------------------------------------------------------------
        | RPT TRANSACTION ITEMS
        |--------------------------------------------------------------------------
        */

        const result =
            await pool.query(
                `
                SELECT

                    dri.id,

                    dri.transaction_id,

                    dri.billing_id,

                    dri.tax_declaration_id,

                    dri.td_number,

                    dri.declared_owner,

                    dri.property_location,

                    dri.assessed_value,

                    dri.start_quarter,

                    dri.start_year,

                    dri.end_quarter,

                    dri.end_year,

                    dri.basic,

                    dri.sef,

                    dri.penalty,

                    dri.discount,

                    dri.amount,

                    dri.tax_due,

                    dri.billing_number,

                    dri.billing_item_id,

                    dri.account_id,

                    a.account_code,

                    a.account_name

                FROM dipp_rpt_items dri

                LEFT JOIN accounts a
                    ON a.id = dri.account_id

                WHERE
                    dri.transaction_id = $1

                ORDER BY

                    dri.td_number,

                    dri.start_year,

                    dri.start_quarter
                `,
                [
                    transactionId,
                ]
            );


        return NextResponse.json(
            {
                success: true,

                items:
                    result.rows,
            }
        );

    }

    catch (
        err: any
    ) {

        console.error(
            "===================================="
        );

        console.error(
            "DIPP RPT ITEMS API ERROR"
        );

        console.error(
            err
        );

        console.error(
            "===================================="
        );


        return NextResponse.json(
            {
                success: false,

                message:

                    err.message ||

                    "Unable to load RPT items.",
            },
            {
                status: 500,
            }
        );

    }

}