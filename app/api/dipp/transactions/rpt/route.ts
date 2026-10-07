import {
    NextRequest,
    NextResponse,
} from "next/server";

import { PoolClient } from "pg";

import { authorize } from "@/lib/authorize";
import { pool } from "@/lib/db";
import { MODULE_PATHS } from "@/lib/module-paths";



export async function POST(
    req: NextRequest
) {

    let client: PoolClient | null = null;


    try {

        /*
        |--------------------------------------------------------------------------
        | AUTHORIZATION
        |--------------------------------------------------------------------------
        */

        const user =
            await authorize(
                req,
                MODULE_PATHS.DIPP,
                "add"
            );



        /*
        |--------------------------------------------------------------------------
        | REQUEST BODY
        |--------------------------------------------------------------------------
        */

        const body =
            await req.json();


        const {

            booklet_registration_id,

            billing_id,

            receipt_date,

            payor,

            gender,

            payment_mode,

            remarks,

        } = body;



        /*
        |--------------------------------------------------------------------------
        | VALIDATION
        |--------------------------------------------------------------------------
        */

        if (!booklet_registration_id) {

            throw new Error(
                "Booklet is required."
            );

        }


        if (!billing_id) {

            throw new Error(
                "Billing is required."
            );

        }


        if (!receipt_date) {

            throw new Error(
                "Receipt date is required."
            );

        }


        if (
            !payor ||
            !String(payor).trim()
        ) {

            throw new Error(
                "Payor is required."
            );

        }


        if (!gender) {

            throw new Error(
                "Gender is required."
            );

        }


        if (!["Male", "Female"].includes(
            String(gender)
        )) {

            throw new Error(
                "Invalid gender."
            );

        }


        if (!payment_mode) {

            throw new Error(
                "Payment mode is required."
            );

        }



        /*
        |--------------------------------------------------------------------------
        | DATABASE CONNECTION
        |--------------------------------------------------------------------------
        */

        client =
            await pool.connect();



        /*
        |--------------------------------------------------------------------------
        | BEGIN TRANSACTION
        |--------------------------------------------------------------------------
        */

        await client.query(
            "BEGIN"
        );



        /*
        |--------------------------------------------------------------------------
        | LOAD LOR RELEASE + BOOKLET
        |--------------------------------------------------------------------------
        */

        const bookletResult =
            await client.query(
                `
                SELECT

                    lr.id
                        AS lor_release_id,

                    lr.accountable_form_id,

                    lr.accountable_officer_id,

                    sbr.id
                        AS booklet_registration_id,

                    sbr.current_or,

                    sbr.ending_or,

                    sbr.status

                FROM lor_releases lr

                INNER JOIN smi_booklet_registration sbr

                    ON sbr.id =
                       lr.booklet_registration_id

                WHERE

                    lr.id = $1

                AND

                    lr.is_active = TRUE

                AND

                    sbr.is_active = TRUE

                FOR UPDATE
                `,
                [
                    booklet_registration_id,
                ]
            );



        if (
            bookletResult.rows.length === 0
        ) {

            throw new Error(
                "Booklet/LOR release not found."
            );

        }



        const booklet =
            bookletResult.rows[0];



        /*
        |--------------------------------------------------------------------------
        | VALIDATE CURRENT OR
        |--------------------------------------------------------------------------
        */

        if (
            Number(booklet.current_or) >
            Number(booklet.ending_or)
        ) {

            throw new Error(
                "The accountable form booklet has already been consumed."
            );

        }



        /*
        |--------------------------------------------------------------------------
        | LOAD BILLING
        |--------------------------------------------------------------------------
        */

        const billingResult =
            await client.query(
                `
                SELECT

                    *

                FROM rpt_billings

                WHERE

                    id = $1

                FOR UPDATE
                `,
                [
                    billing_id,
                ]
            );



        if (
            billingResult.rows.length === 0
        ) {

            throw new Error(
                "Billing not found."
            );

        }



        const billing =
            billingResult.rows[0];



        /*
        |--------------------------------------------------------------------------
        | CHECK BILLING STATUS
        |--------------------------------------------------------------------------
        */

        if (
            String(
                billing.status ?? ""
            ).toUpperCase() === "PAID"
        ) {

            throw new Error(
                "This billing has already been paid."
            );

        }



        /*
        |--------------------------------------------------------------------------
        | LOAD BILLING ITEMS
        |--------------------------------------------------------------------------
        */

        const itemResult =
            await client.query(
                `
                SELECT

                    *

                FROM rpt_billing_items

                WHERE

                    billing_id = $1

                ORDER BY

                    td_number,

                    start_year,

                    start_quarter
                `,
                [
                    billing.id,
                ]
            );



        if (
            itemResult.rows.length === 0
        ) {

            throw new Error(
                "Billing has no billing items."
            );

        }



        const items =
            itemResult.rows;



        /*
        |--------------------------------------------------------------------------
        | COMPUTE GRAND TOTAL
        |--------------------------------------------------------------------------
        */

        let grandTotal = 0;


        for (
            const item of items
        ) {

            grandTotal +=
                Number(
                    item.total ?? 0
                );

        }



        grandTotal =
            Number(
                grandTotal.toFixed(2)
            );



        if (
            !Number.isFinite(
                grandTotal
            ) ||
            grandTotal <= 0
        ) {

            throw new Error(
                "Invalid billing grand total."
            );

        }



        /*
        |--------------------------------------------------------------------------
        | PROPERTY ID
        |--------------------------------------------------------------------------
        |
        | rpt_payment.property_id is VARCHAR.
        |
        | rpt_billings currently provides fullpin.
        |
        | Use FULLPIN as the property identifier.
        |
        */

        const propertyId =
            billing.fullpin
                ? String(
                    billing.fullpin
                ).trim()
                : "";



        if (!propertyId) {

            throw new Error(
                "Billing does not contain a valid property identifier (fullpin)."
            );

        }



        /*
        |--------------------------------------------------------------------------
        | INSERT DIPP TRANSACTION
        |--------------------------------------------------------------------------
        */

        const transactionResult =
            await client.query(
                `
                INSERT INTO dipp_transactions (

                    or_number,

                    receipt_date,

                    booklet_registration_id,

                    lor_release_id,

                    accountable_form_id,

                    collector_id,

                    billing_id,

                    payor,

                    gender,

                    payment_mode,

                    remarks,

                    grand_total,

                    status,

                    encoded_by,

                    created_at

                )

                VALUES (

                    $1,

                    $2,

                    $3,

                    $4,

                    $5,

                    $6,

                    $7,

                    $8,

                    $9,

                    $10,

                    $11,

                    $12,

                    'ISSUED',

                    $13,

                    NOW()

                )

                RETURNING id
                `,
                [

                    /*
                    | OR NUMBER
                    */

                    String(
                        booklet.current_or
                    ),


                    /*
                    | RECEIPT DATE
                    */

                    receipt_date,


                    /*
                    | BOOKLET REGISTRATION
                    */

                    booklet.booklet_registration_id,


                    /*
                    | LOR RELEASE
                    */

                    booklet.lor_release_id,


                    /*
                    | ACCOUNTABLE FORM
                    */

                    booklet.accountable_form_id,


                    /*
                    | COLLECTOR
                    */

                    booklet.accountable_officer_id,


                    /*
                    | BILLING
                    */

                    billing.id,


                    /*
                    | PAYOR
                    */

                    String(
                        payor
                    ).trim(),


                    /*
                    | GENDER
                    */

                    String(
                        gender
                    ),


                    /*
                    | PAYMENT MODE
                    */

                    String(
                        payment_mode
                    ),


                    /*
                    | REMARKS
                    */

                    remarks
                        ? String(
                            remarks
                        ).trim()
                        : null,


                    /*
                    | GRAND TOTAL
                    */

                    grandTotal,


                    /*
                    | ENCODED BY
                    */

                    user.id,

                ]
            );



        const transactionId =
            transactionResult.rows[0].id;



        /*
        |--------------------------------------------------------------------------
        | INSERT DIPP RPT ITEMS
        |--------------------------------------------------------------------------
        */

        for (
            const item of items
        ) {

            await client.query(
                `
                INSERT INTO dipp_rpt_items (

                    transaction_id,

                    billing_id,

                    td_number,

                    declared_owner,

                    property_location,

                    assessed_value,

                    start_quarter,

                    start_year,

                    end_quarter,

                    end_year,

                    basic,

                    sef,

                    penalty,

                    discount,

                    amount,

                    created_at

                )

                VALUES (

                    $1,

                    $2,

                    $3,

                    $4,

                    $5,

                    $6,

                    $7,

                    $8,

                    $9,

                    $10,

                    $11,

                    $12,

                    $13,

                    $14,

                    $15,

                    NOW()

                )
                `,
                [

                    transactionId,

                    billing.id,

                    item.td_number,

                    billing.owner_name,

                    billing.barangay_name,

                    Number(
                        item.assessed_value ?? 0
                    ),

                    item.start_quarter,

                    item.start_year,

                    item.end_quarter,

                    item.end_year,

                    Number(
                        item.basic ?? 0
                    ),

                    Number(
                        item.sef ?? 0
                    ),

                    Number(
                        item.penalty ?? 0
                    ),

                    Number(
                        item.discount ?? 0
                    ),

                    Number(
                        item.total ?? 0
                    ),

                ]
            );

        }



        /*
        |--------------------------------------------------------------------------
        | INSERT RPT PAYMENT HEADER
        |--------------------------------------------------------------------------
        */

        const paymentResult =
            await client.query(
                `
                INSERT INTO rpt_payment (

                    transaction_id,

                    property_id,

                    tdno,

                    taxpayer_name,

                    payment_date,

                    total_amount,

                    status,

                    is_cancelled,

                    created_at,

                    updated_at,

                    created_by,

                    updated_by

                )

                VALUES (

                    $1,

                    $2,

                    $3,

                    $4,

                    $5,

                    $6,

                    'PAID',

                    FALSE,

                    CURRENT_TIMESTAMP,

                    CURRENT_TIMESTAMP,

                    $7,

                    $7

                )

                RETURNING id
                `,
                [

                    /*
                    | DIPP TRANSACTION
                    */

                    transactionId,


                    /*
                    | PROPERTY ID
                    */

                    propertyId,


                    /*
                    | TD NUMBER
                    */

                    billing.td_number
                        ? String(
                            billing.td_number
                        )
                        : null,


                    /*
                    | TAXPAYER
                    */

                    billing.owner_name
                        ? String(
                            billing.owner_name
                        )
                        : String(
                            payor
                        ).trim(),


                    /*
                    | PAYMENT DATE
                    */

                    receipt_date,


                    /*
                    | TOTAL AMOUNT
                    */

                    grandTotal,


                    /*
                    | CREATED BY
                    */

                    user.id,

                ]
            );



        const paymentId =
            paymentResult.rows[0].id;



        /*
        |--------------------------------------------------------------------------
        | INSERT RPT PAYMENT ITEMS
        |--------------------------------------------------------------------------
        |
        | IMPORTANT:
        |
        | rpt_billing_items stores:
        |
        |     start_quarter
        |     start_year
        |     end_quarter
        |     end_year
        |
        | while rpt_payment_items stores:
        |
        |     tax_year
        |     quarter
        |
        | There is currently no start/end range in
        | rpt_payment_items.
        |
        | Therefore we record the START period of each
        | billing item here.
        |
        */

        for (
            const item of items
        ) {

            const taxYear =
                Number(
                    item.start_year
                );


            const quarter =
                Number(
                    item.start_quarter
                );



            if (
                !Number.isInteger(
                    taxYear
                )
            ) {

                throw new Error(
                    `Invalid tax year for TD ${item.td_number}.`
                );

            }



            if (
                !Number.isInteger(
                    quarter
                ) ||
                quarter < 1 ||
                quarter > 4
            ) {

                throw new Error(
                    `Invalid quarter for TD ${item.td_number}.`
                );

            }



            const basicTax =
                Number(
                    item.basic ?? 0
                );


            const penalty =
                Number(
                    item.penalty ?? 0
                );


            const discount =
                Number(
                    item.discount ?? 0
                );


            const amountPaid =
                Number(
                    item.total ?? 0
                );



            await client.query(
                `
                INSERT INTO rpt_payment_items (

                    payment_id,

                    property_id,

                    tdno,

                    tax_year,

                    quarter,

                    basic_tax,

                    penalty,

                    interest,

                    discount,

                    amount_paid,

                    created_at

                )

                VALUES (

                    $1,

                    $2,

                    $3,

                    $4,

                    $5,

                    $6,

                    $7,

                    $8,

                    $9,

                    $10,

                    CURRENT_TIMESTAMP

                )
                `,
                [

                    /*
                    | PAYMENT ID
                    */

                    paymentId,


                    /*
                    | PROPERTY
                    */

                    propertyId,


                    /*
                    | TD NUMBER
                    */

                    item.td_number
                        ? String(
                            item.td_number
                        )
                        : billing.td_number,


                    /*
                    | TAX YEAR
                    */

                    taxYear,


                    /*
                    | QUARTER
                    */

                    quarter,


                    /*
                    | BASIC TAX
                    */

                    basicTax,


                    /*
                    | PENALTY
                    */

                    penalty,


                    /*
                    | INTEREST
                    |
                    | No interest column exists in
                    | rpt_billing_items.
                    |
                    */

                    0,


                    /*
                    | DISCOUNT
                    */

                    discount,


                    /*
                    | AMOUNT PAID
                    */

                    amountPaid,

                ]
            );

        }



        /*
        |--------------------------------------------------------------------------
        | UPDATE BILLING STATUS
        |--------------------------------------------------------------------------
        */

        await client.query(
            `
            UPDATE rpt_billings

            SET

                status = 'PAID',

                updated_at = NOW()

            WHERE

                id = $1
            `,
            [
                billing.id,
            ]
        );



        /*
        |--------------------------------------------------------------------------
        | ADVANCE OR BOOKLET
        |--------------------------------------------------------------------------
        */

        const nextOR =
            Number(
                booklet.current_or
            ) + 1;



        const bookletStatus =
            nextOR >
            Number(
                booklet.ending_or
            )
                ? "CONSUMED"
                : "IN USE";



        await client.query(
            `
            UPDATE smi_booklet_registration

            SET

                current_or = $1,

                status = $2,

                updated_at = NOW()

            WHERE

                id = $3
            `,
            [

                nextOR,

                bookletStatus,

                booklet.booklet_registration_id,

            ]
        );



        /*
        |--------------------------------------------------------------------------
        | COMMIT
        |--------------------------------------------------------------------------
        */

        await client.query(
            "COMMIT"
        );



        /*
        |--------------------------------------------------------------------------
        | SUCCESS
        |--------------------------------------------------------------------------
        */

        return NextResponse.json({

            success: true,

            transaction_id:
                transactionId,

            payment_id:
                paymentId,

            or_number:
                booklet.current_or,

            next_or:
                nextOR,

            grand_total:
                grandTotal,

            message:
                "RPT collection processed successfully."

        });



    } catch (
        err: any
    ) {


        /*
        |--------------------------------------------------------------------------
        | ROLLBACK
        |--------------------------------------------------------------------------
        */

        if (client) {

            try {

                await client.query(
                    "ROLLBACK"
                );

            } catch (
                rollbackError
            ) {

                console.error(
                    "ROLLBACK ERROR:",
                    rollbackError
                );

            }

        }



        /*
        |--------------------------------------------------------------------------
        | LOG ERROR
        |--------------------------------------------------------------------------
        */

        console.error(
            "===================================="
        );

        console.error(
            "RPT COLLECTION API ERROR"
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
                    err?.message ??
                    "Unable to process collection."

            },

            {
                status: 500,
            }

        );



    } finally {

        /*
        |--------------------------------------------------------------------------
        | RELEASE CONNECTION
        |--------------------------------------------------------------------------
        */

        client?.release();

    }

}