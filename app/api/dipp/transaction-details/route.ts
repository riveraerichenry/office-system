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

/*
GET
--------------------------------------------------------------------------


GET TRANSACTION DETAILS


TABLES READ:
- dipp_transactions
- dipp_transaction_items
- accountable_forms
- users
- smi_booklet_registration
- accounts


*/

export async function GET(
req: NextRequest
) {

try {

    await authorize(

        req,

        MODULE_PATHS.DIPP,

        "view"

    );


    const id =
        req.nextUrl
            .searchParams
            .get("id");


    if (

        !id

    ) {

        return NextResponse.json(

            {

                success:
                    false,

                message:
                    "Transaction ID is required.",

            },

            {

                status:
                    400,

            }

        );

    }


    /*
    |--------------------------------------------------------------------------
    | Transaction Header
    |--------------------------------------------------------------------------
    */

    const headerResult =
        await pool.query(

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

                ON af.id =
                    dt.accountable_form_id

            LEFT JOIN users u

                ON u.id =
                    dt.encoded_by

            LEFT JOIN smi_booklet_registration sbr

                ON sbr.id =
                    dt.booklet_registration_id

            WHERE

                dt.id = $1
            `,

            [

                id,

            ]

        );


    /*
    |--------------------------------------------------------------------------
    | Transaction Not Found
    |--------------------------------------------------------------------------
    */

    if (

        headerResult.rows.length === 0

    ) {

        return NextResponse.json(

            {

                success:
                    false,

                message:
                    "Transaction not found.",

            },

            {

                status:
                    404,

            }

        );

    }


    /*
    |--------------------------------------------------------------------------
    | General Transaction Items
    |--------------------------------------------------------------------------
    */

    const itemsResult =
        await pool.query(

            `
            SELECT

                dti.id,

                dti.transaction_id,

                dti.account_id,

                a.account_code,

                a.account_name,

                dti.amount,

                dti.remarks

            FROM dipp_transaction_items dti

            INNER JOIN accounts a

                ON a.id =
                    dti.account_id

            WHERE

                dti.transaction_id = $1

            ORDER BY

                a.account_code
            `,

            [

                id,

            ]

        );


    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    return NextResponse.json(

        {

            success:
                true,

            header:
                headerResult.rows[0],

            items:
                itemsResult.rows,

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

        "TRANSACTION DETAILS GET"

    );

    console.error(

        err

    );

    console.error(

        "===================================="

    );


    return NextResponse.json(

        {

            success:
                false,

            message:
                err.message,

        },

        {

            status:
                500,

        }

    );

}

}

/*
PUT
--------------------------------------------------------------------------


UPDATE TRANSACTION DETAILS


ONLY TABLE UPDATED:


dipp_transactions


FIELDS UPDATED:
- payor
- payment_mode
- remarks


NO ITEM TABLE IS TOUCHED.


*/

export async function PUT(
req: NextRequest
) {

try {

    /*
    ============================================================
    AUTHORIZE
    ============================================================
    */

    await authorize(

        req,

        MODULE_PATHS.DIPP,

        "edit"

    );


    /*
    ============================================================
    REQUEST BODY
    ============================================================
    */

    const body =
        await req.json();


    const {

        id,

        payor,

        payment_mode,

        remarks,

    } = body;


    /*
    ============================================================
    VALIDATE ID
    ============================================================
    */

    if (

        !id

    ) {

        return NextResponse.json(

            {

                success:
                    false,

                message:
                    "Transaction ID is required.",

            },

            {

                status:
                    400,

            }

        );

    }


    /*
    ============================================================
    VALIDATE PAYOR
    ============================================================
    */

    if (

        !payor ||

        !String(
            payor
        ).trim()

    ) {

        return NextResponse.json(

            {

                success:
                    false,

                message:
                    "Payor is required.",

            },

            {

                status:
                    400,

            }

        );

    }


    /*
    ============================================================
    VALIDATE PAYMENT MODE
    ============================================================
    */

    if (

        !payment_mode ||

        !String(
            payment_mode
        ).trim()

    ) {

        return NextResponse.json(

            {

                success:
                    false,

                message:
                    "Payment mode is required.",

            },

            {

                status:
                    400,

            }

        );

    }


    /*
    ============================================================
    UPDATE TRANSACTION
    ============================================================

    IMPORTANT:

    THIS ONLY UPDATES dipp_transactions.

    NO dipp_*_items TABLE IS UPDATED HERE.

    ============================================================
    */

    const result =
        await pool.query(

            `
            UPDATE

                dipp_transactions

            SET

                payor = $1,

                payment_mode = $2,

                remarks = $3

            WHERE

                id = $4

            RETURNING

                id,

                payor,

                payment_mode,

                remarks
            `,

            [

                String(
                    payor
                ).trim(),

                String(
                    payment_mode
                ).trim(),

                remarks &&
                String(
                    remarks
                ).trim()

                    ? String(
                        remarks
                    ).trim()

                    : null,

                id,

            ]

        );


    /*
    ============================================================
    TRANSACTION NOT FOUND
    ============================================================
    */

    if (

        result.rowCount === 0

    ) {

        return NextResponse.json(

            {

                success:
                    false,

                message:
                    "Transaction not found.",

            },

            {

                status:
                    404,

            }

        );

    }


    /*
    ============================================================
    SUCCESS
    ============================================================
    */

    return NextResponse.json(

        {

            success:
                true,

            message:
                "Transaction details updated successfully.",

            data:
                result.rows[0],

        },

        {

            status:
                200,

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

        "TRANSACTION DETAILS UPDATE"

    );

    console.error(

        err

    );

    console.error(

        "===================================="

    );


    return NextResponse.json(

        {

            success:
                false,

            message:

                err.message ||

                "Unable to update transaction details.",

        },

        {

            status:
                500,

        }

    );

}

}