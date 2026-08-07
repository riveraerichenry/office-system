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

            booklet_registration_id, // <-- actually the LOR Release ID

            billing_id,

            receipt_date,

            payor,

            payment_mode,

            remarks,

        } = body;

        /*
        |--------------------------------------------------------------------------
        | Validation
        |--------------------------------------------------------------------------
        */

        if (!booklet_registration_id)
            throw new Error("Booklet is required.");

        if (!billing_id)
            throw new Error("Billing is required.");

        if (!receipt_date)
            throw new Error("Receipt date is required.");

        if (!payor)
            throw new Error("Payor is required.");

        if (!payment_mode)
            throw new Error("Payment mode is required.");

        /*
        |--------------------------------------------------------------------------
        | Begin Transaction
        |--------------------------------------------------------------------------
        */

        client =
            await pool.connect();

        await client.query("BEGIN");

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

            Number(booklet.current_or) >

            Number(booklet.ending_or)

        ) {

            throw new Error(
                "Booklet has already been consumed."
            );

        }

        /*
        |--------------------------------------------------------------------------
        | Billing Header
        |--------------------------------------------------------------------------
        */

        const billingResult =
            await client.query(

                `

                SELECT *

                FROM rpt_billings

                WHERE

                    id = $1

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

        if (
            billing.status === "PAID"
        ) {

            throw new Error(
                "Billing has already been paid."
            );

        }

        /*
        |--------------------------------------------------------------------------
        | Billing Items
        |--------------------------------------------------------------------------
        */

        const itemResult =
            await client.query(

                `

                SELECT *

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
                "Billing has no items."
            );

        }

        const items =
            itemResult.rows;

        /*
        |--------------------------------------------------------------------------
        | Grand Total
        |--------------------------------------------------------------------------
        */

        let grandTotal = 0;

        for (const item of items) {

            grandTotal +=
                Number(
                    item.total ?? 0
                );

        }

        // ==========================
        // PART 2 STARTS HERE
        // ==========================


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

                    'ISSUED',

                    $12,

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

                    billing.id,

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

                    item.assessed_value,

                    item.start_quarter,

                    item.start_year,

                    item.end_quarter,

                    item.end_year,

                    item.basic,

                    item.sef,

                    item.penalty,

                    item.discount,

                    item.total,

                ]

            );

        }

        /*
        |--------------------------------------------------------------------------
        | Update Billing
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
                "Collection processed successfully."

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
            "RPT COLLECTION API ERROR"
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
                    "Unable to process collection."

            },

            {

                status: 500

            }

        );

    } finally {

        client?.release();

    }

}