import { NextRequest, NextResponse } from "next/server";
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
        | Authorization
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
        | Request Body
        |--------------------------------------------------------------------------
        */

        const body =
            await req.json();

        const {

            booklet_registration_id,

            receipt_date,

            payor,

            owner,

            barangay,

            classification,

            payment_mode,

            remarks,

            items,

        } = body;

        /*
        |--------------------------------------------------------------------------
        | Validation
        |--------------------------------------------------------------------------
        */

        if (!booklet_registration_id)
            throw new Error(
                "Booklet is required."
            );

        if (!receipt_date)
            throw new Error(
                "Receipt date is required."
            );

        if (!payor)
            throw new Error(
                "Payor is required."
            );

        if (!owner)
            throw new Error(
                "Owner is required."
            );

        if (!barangay)
            throw new Error(
                "Barangay is required."
            );

        if (!classification)
            throw new Error(
                "Classification is required."
            );

        if (!payment_mode)
            throw new Error(
                "Payment mode is required."
            );

        if (
            !items ||
            !Array.isArray(items) ||
            items.length === 0
        ) {
            throw new Error(
                "At least one property item is required."
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Begin Transaction
        |--------------------------------------------------------------------------
        */

        client =
            await pool.connect();

        await client.query(
            "BEGIN"
        );

        /*
        |--------------------------------------------------------------------------
        | Load LOR + Booklet
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
                "Booklet not found."
            );

        }

        const booklet =
            bookletResult.rows[0];

        /*
        |--------------------------------------------------------------------------
        | Validate OR
        |--------------------------------------------------------------------------
        */

        if (

            Number(
                booklet.current_or
            ) >

            Number(
                booklet.ending_or
            )

        ) {

            throw new Error(
                "Booklet has already been consumed."
            );

        }

        /*
        |--------------------------------------------------------------------------
        | PART 2 STARTS HERE
        |--------------------------------------------------------------------------
        */        /*
        |--------------------------------------------------------------------------
        | Grand Total
        |--------------------------------------------------------------------------
        */

        let grandTotal = 0;

        for (const item of items) {

            grandTotal +=

                Number(item.basic ?? 0) +

                Number(item.sef ?? 0) +

                Number(item.penalty ?? 0) -

                Number(item.discount ?? 0);

        }

        /*
        |--------------------------------------------------------------------------
        | Insert Transaction Header
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

                    payment_mode,

                    remarks,

                    grand_total,

                    transaction_type,

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

                    NULL,

                    $7,

                    $8,

                    $9,

                    $10,

                    'UNREVISED',

                    'ISSUED',

                    $11,

                    NOW()

                )

                RETURNING id

                `,

                [

                    booklet.current_or,

                    receipt_date,

                    booklet.booklet_registration_id,

                    booklet.lor_release_id,

                    booklet.accountable_form_id,

                    booklet.accountable_officer_id,

                    payor,

                    payment_mode,

                    remarks ?? null,

                    grandTotal,

                    user.id,

                ]

            );

        const transactionId =
            transactionResult.rows[0].id;

        /*
        |--------------------------------------------------------------------------
        | PART 3 STARTS HERE
        |--------------------------------------------------------------------------
        */
               /*
        |--------------------------------------------------------------------------
        | Insert Transaction Items
        |--------------------------------------------------------------------------
        */

        for (const item of items) {

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

                    NULL,

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

                    NOW()

                )

                `,

                [

                    transactionId,

                    item.td_number,

                    owner,

                    barangay,

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
                        item.basic ?? 0
                    ) +

                    Number(
                        item.sef ?? 0
                    ) +

                    Number(
                        item.penalty ?? 0
                    ) -

                    Number(
                        item.discount ?? 0
                    ),

                ]

            );

        }

        /*
        |--------------------------------------------------------------------------
        | PART 4 STARTS HERE
        |--------------------------------------------------------------------------
        */

                /*
        |--------------------------------------------------------------------------
        | Update Booklet
        |--------------------------------------------------------------------------
        */

        const nextOR =
            Number(booklet.current_or) + 1;


        const bookletStatus =
            nextOR >
            Number(booklet.ending_or)

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
        | Commit
        |--------------------------------------------------------------------------
        */

        await client.query(
            "COMMIT"
        );


        return NextResponse.json({

            success: true,

            transaction_id:
                transactionId,

            or_number:
                booklet.current_or,

            next_or:
                nextOR,

            grand_total:
                grandTotal,

            message:
                "Unrevised property collection processed successfully."

        });


    } catch (err: any) {


        if (client) {

            await client.query(
                "ROLLBACK"
            );

        }


        console.error(
            "===================================="
        );

        console.error(
            "UNREVISED PROPERTY COLLECTION ERROR"
        );

        console.error(err);

        console.error(
            "===================================="
        );


        return NextResponse.json(

            {

                success: false,

                message:
                    err.message ??
                    "Unable to process unrevised collection."

            },

            {

                status: 500

            }

        );


    } finally {


        client?.release();


    }

}