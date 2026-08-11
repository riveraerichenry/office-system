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
            payment_mode,
            remarks,
            items,
            ctc,
        } = body;

        /*
        |--------------------------------------------------------------------------
        | Validation
        |--------------------------------------------------------------------------
        */

        if (!booklet_registration_id) {
            throw new Error(
                "Booklet is required."
            );
        }

        if (!receipt_date) {
            throw new Error(
                "Receipt date is required."
            );
        }

        if (!payor) {
            throw new Error(
                "Payor is required."
            );
        }

        if (!payment_mode) {
            throw new Error(
                "Payment mode is required."
            );
        }

        if (
            !items ||
            !Array.isArray(items) ||
            items.length === 0
        ) {
            throw new Error(
                "Please add at least one transaction item."
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Begin PostgreSQL Transaction
        |--------------------------------------------------------------------------
        */

        client =
            await pool.connect();

        await client.query(
            "BEGIN"
        );

        /*
        |--------------------------------------------------------------------------
        | Lock Selected Booklet
        |--------------------------------------------------------------------------
        */

        const bookletResult =
            await client.query(
                `
                SELECT

                    sbr.id,

                    sbr.current_or,

                    sbr.ending_or,

                    lr.id
                        AS lor_release_id,

                    lr.accountable_form_id,

                    lr.accountable_officer_id

                FROM smi_booklet_registration sbr

                INNER JOIN lor_releases lr
                    ON lr.booklet_registration_id =
                        sbr.id

                WHERE

                    sbr.id = $1

                AND

                    sbr.is_active = TRUE

                AND

                    lr.is_active = TRUE

                AND

                    lr.status = 'ACTIVE'

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
        | Get Accountable Form
        |--------------------------------------------------------------------------
        */

        const formResult =
            await client.query(
                `
                SELECT

                    id,

                    form_code,

                    form_name

                FROM accountable_forms

                WHERE id = $1
                `,
                [
                    booklet.accountable_form_id,
                ]
            );

        if (
            formResult.rows.length === 0
        ) {
            throw new Error(
                "Accountable form not found."
            );
        }

        const form =
            formResult.rows[0];

        const formCode =
            form.form_code;

        /*
        |--------------------------------------------------------------------------
        | Validate Available OR
        |--------------------------------------------------------------------------
        */

        const currentOR =
            Number(
                booklet.current_or
            );

        const endingOR =
            Number(
                booklet.ending_or
            );

        if (
            !Number.isFinite(
                currentOR
            ) ||
            !Number.isFinite(
                endingOR
            )
        ) {
            throw new Error(
                "Invalid booklet OR range."
            );
        }

        if (
            currentOR >
            endingOR
        ) {
            throw new Error(
                "This booklet has already been fully consumed."
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Determine Transaction Type
        |--------------------------------------------------------------------------
        */

        const isCTC =
            formCode === "CTC-I" ||
            formCode === "CTC-C";

        /*
        |--------------------------------------------------------------------------
        | Validate CTC
        |--------------------------------------------------------------------------
        */

        let grandTotal = 0;

        if (isCTC) {

            if (!ctc) {
                throw new Error(
                    "CTC information is required."
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Make sure selected form and CTC type agree
            |--------------------------------------------------------------------------
            */

            if (
                formCode === "CTC-I" &&
                ctc.ctc_type &&
                ctc.ctc_type !== "CTC-I"
            ) {
                throw new Error(
                    "The selected accountable form is CTC-I."
                );
            }

            if (
                formCode === "CTC-C" &&
                ctc.ctc_type &&
                ctc.ctc_type !== "CTC-C"
            ) {
                throw new Error(
                    "The selected accountable form is CTC-C."
                );
            }

            /*
            |--------------------------------------------------------------------------
            | CTC Total
            |--------------------------------------------------------------------------
            |
            | Keep compatibility with the existing working CTC
            | modal, which may currently send grand_total.
            |
            */

            grandTotal =
                Number(
                    ctc.total_amount ??
                    ctc.grand_total ??
                    0
                );

            if (
                !Number.isFinite(
                    grandTotal
                ) ||
                grandTotal <= 0
            ) {
                throw new Error(
                    "Invalid CTC amount."
                );
            }

        } else {

            /*
            |--------------------------------------------------------------------------
            | General Receipt
            |--------------------------------------------------------------------------
            */

            for (
                const item
                of items
            ) {

                if (
                    !item.account_id
                ) {
                    throw new Error(
                        "Please select an account."
                    );
                }

                const amount =
                    Number(
                        item.amount
                    );

                if (
                    !Number.isFinite(
                        amount
                    ) ||
                    amount <= 0
                ) {
                    throw new Error(
                        "Invalid transaction amount."
                    );
                }

                const account =
                    await client.query(
                        `
                        SELECT id

                        FROM accounts

                        WHERE

                            id = $1

                        AND

                            is_active = TRUE

                        AND

                            is_postable = TRUE
                        `,
                        [
                            item.account_id,
                        ]
                    );

                if (
                    account.rows.length === 0
                ) {
                    throw new Error(
                        "Selected account is invalid."
                    );
                }

                grandTotal +=
                    amount;
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Insert Transaction Header
        |--------------------------------------------------------------------------
        */

        const transaction =
            await client.query(
                `
                INSERT INTO dipp_transactions (

                    or_number,

                    receipt_date,

                    booklet_registration_id,

                    lor_release_id,

                    accountable_form_id,

                    collector_id,

                    payor,

                    payment_mode,

                    remarks,

                    grand_total,

                    status,

                    encoded_by,

                    transaction_type

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

                    $13

                )

                RETURNING id
                `,
                [

                    /*
                    | OR Number
                    */

                    String(
                        currentOR
                    ),

                    /*
                    | Receipt Date
                    */

                    receipt_date,

                    /*
                    | Booklet
                    */

                    booklet_registration_id,

                    /*
                    | LOR Release
                    */

                    booklet.lor_release_id,

                    /*
                    | Accountable Form
                    */

                    booklet.accountable_form_id,

                    /*
                    | Collector
                    */

                    booklet.accountable_officer_id,

                    /*
                    | Payor
                    */

                    payor,

                    /*
                    | Payment Mode
                    */

                    payment_mode,

                    /*
                    | Remarks
                    */

                    remarks ??
                        null,

                    /*
                    | Grand Total
                    */

                    grandTotal,

                    /*
                    | Status
                    */

                    "ISSUED",

                    /*
                    | Encoder
                    */

                    user.id,

                    /*
                    | Transaction Type
                    */

                    isCTC
                        ? formCode
                        : "RPT",

                ]
            );

        const transactionId =
            transaction.rows[0].id;

        /*
        |--------------------------------------------------------------------------
        | Insert Detail
        |--------------------------------------------------------------------------
        */

        if (
            formCode === "AF56"
        ) {

            /*
            |--------------------------------------------------------------------------
            | AF56
            |--------------------------------------------------------------------------
            */

            for (
                const item
                of items
            ) {

                await client.query(
                    `
                    INSERT INTO dipp_transaction_items (

                        transaction_id,

                        account_id,

                        amount,

                        remarks

                    )

                    VALUES (

                        $1,

                        $2,

                        $3,

                        $4

                    )
                    `,
                    [

                        transactionId,

                        item.account_id,

                        Number(
                            item.amount
                        ),

                        item.remarks ??
                            null,

                    ]
                );
            }

        } else if (
            formCode === "CTC-I" ||
            formCode === "CTC-C"
        ) {

            /*
            |--------------------------------------------------------------------------
            | CTC Detail
            |--------------------------------------------------------------------------
            |
            | IMPORTANT:
            | These column names match the actual
            | dipp_ctc_items table.
            |--------------------------------------------------------------------------
            */

            const salaryTax =
                Number(
                    ctc.salary_tax ??
                    ctc.income_tax ??
                    0
                );

            const totalAmount =
                Number(
                    ctc.total_amount ??
                    ctc.grand_total ??
                    grandTotal
                );

            await client.query(
                `
                INSERT INTO dipp_ctc_items (

                    transaction_id,

                    ctc_type,

                    full_name,

                    address,

                    tin,

                    cr_number,

                    citizenship,

                    sex,

                    height,

                    weight,

                    place_of_birth,

                    birth_date,

                    civil_status,

                    occupation,

                    corporation_name,

                    sec_registration,

                    representative,

                    place_issued,

                    issue_date,

                    tax_mode,

                    taxable_amount,

                    basic_tax,

                    salary_tax,

                    additional_tax,

                    penalty,

                    interest,

                    total_amount

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

                    $16,

                    $17,

                    $18,

                    $19,

                    $20,

                    $21,

                    $22,

                    $23,

                    $24,

                    $25,

                    $26,

                    $27

                )
                `,
                [

                    /*
                    | Transaction
                    */

                    transactionId,

                    /*
                    | CTC Type
                    */

                    formCode,

                    /*
                    | Individual / Common
                    */

                    ctc.full_name ??
                        null,

                    ctc.address ??
                        null,

                    ctc.tin ??
                        null,

                    ctc.cr_number ??
                        null,

                    ctc.citizenship ??
                        null,

                    ctc.sex ??
                        null,

                    ctc.height ??
                        null,

                    ctc.weight ??
                        null,

                    ctc.place_of_birth ??
                        null,

                    ctc.birth_date ||
                        null,

                    ctc.civil_status ??
                        null,

                    ctc.occupation ??
                        null,

                    /*
                    | Corporation
                    */

                    ctc.corporation_name ??
                        null,

                    ctc.sec_registration ??
                        null,

                    ctc.representative ??
                        null,

                    /*
                    | Certificate
                    */

                    ctc.place_issued ??
                        null,

                    ctc.issue_date ||
                        null,

                    /*
                    | Tax
                    */

                    ctc.tax_mode ??
                        null,

                    Number(
                        ctc.taxable_amount ??
                        0
                    ),

                    Number(
                        ctc.basic_tax ??
                        0
                    ),

                    salaryTax,

                    Number(
                        ctc.additional_tax ??
                        0
                    ),

                    Number(
                        ctc.penalty ??
                        0
                    ),

                    Number(
                        ctc.interest ??
                        0
                    ),

                    totalAmount,

                ]
            );

        } else {

            /*
            |--------------------------------------------------------------------------
            | Other General Receipts
            |--------------------------------------------------------------------------
            */

            for (
                const item
                of items
            ) {

                await client.query(
                    `
                    INSERT INTO dipp_transaction_items (

                        transaction_id,

                        account_id,

                        amount,

                        remarks

                    )

                    VALUES (

                        $1,

                        $2,

                        $3,

                        $4

                    )
                    `,
                    [

                        transactionId,

                        item.account_id,

                        Number(
                            item.amount
                        ),

                        item.remarks ??
                            null,

                    ]
                );
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Increment OR
        |--------------------------------------------------------------------------
        */

        const nextOR =
            currentOR + 1;

        const bookletStatus =
            nextOR > endingOR
                ? "CONSUMED"
                : "IN USE";

        /*
        |--------------------------------------------------------------------------
        | Update Booklet
        |--------------------------------------------------------------------------
        */

        await client.query(
            `
            UPDATE smi_booklet_registration

            SET

                current_or = $1,

                status = $2,

                updated_at = NOW()

            WHERE id = $3
            `,
            [

                String(
                    nextOR
                ),

                bookletStatus,

                booklet_registration_id,

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

        /*
        |--------------------------------------------------------------------------
        | Response
        |--------------------------------------------------------------------------
        */

        return NextResponse.json({

            success: true,

            message:
                "Collection successfully processed.",

            transaction_id:
                transactionId,

            or_number:
                String(
                    currentOR
                ),

            next_or:
                String(
                    nextOR
                ),

            grand_total:
                grandTotal,

            booklet_status:
                bookletStatus,

            transaction_type:
                isCTC
                    ? formCode
                    : "RPT",

        });

    } catch (err: any) {

        if (client) {

            try {
                await client.query(
                    "ROLLBACK"
                );
            } catch (
                rollbackError
            ) {
                console.error(
                    "Rollback error:",
                    rollbackError
                );
            }
        }

        console.error(
            "===================================="
        );

        console.error(
            "DIPP TRANSACTION API ERROR"
        );

        console.error(err);

        console.error(
            "===================================="
        );

        return NextResponse.json(
            {
                success: false,

                message:
                    err?.message ??
                    "Unable to process transaction.",
            },
            {
                status: 500,
            }
        );

    } finally {

        client?.release();

    }
}


/*
|--------------------------------------------------------------------------
| GET
|--------------------------------------------------------------------------
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

        const bookletId =
            req.nextUrl.searchParams.get(
                "booklet_registration_id"
            );

        const search =
            req.nextUrl.searchParams.get(
                "search"
            ) || "";

        if (!bookletId) {

            return NextResponse.json(
                {
                    success: false,

                    message:
                        "booklet_registration_id is required.",
                },
                {
                    status: 400,
                }
            );
        }

        const params: any[] = [
            bookletId,
        ];

        let where = `
            WHERE

                dt.booklet_registration_id = $1

            AND

                dt.is_cancelled = FALSE
        `;

        if (
            search
        ) {

            params.push(
                `%${search}%`
            );

            where += `
                AND (

                    dt.or_number ILIKE $${params.length}

                    OR

                    dt.payor ILIKE $${params.length}

                )
            `;
        }

        const result =
            await pool.query(
                `
                SELECT

                    dt.id,

                    dt.or_number,

                    dt.receipt_date,

                    dt.payor,

                    dt.payment_mode,

                    dt.grand_total,

                    dt.status,

                    dt.transaction_type,

                    dt.created_at,

                    encoder.full_name
                        AS encoded_by

                FROM dipp_transactions dt

                LEFT JOIN users encoder
                    ON encoder.id =
                        dt.encoded_by

                ${where}

                ORDER BY

                    CAST(
                        dt.or_number
                        AS BIGINT
                    ) DESC

                `,
                params
            );

        return NextResponse.json({

            success: true,

            data:
                result.rows,

        });

    } catch (err: any) {

        console.error(err);

        return NextResponse.json(
            {
                success: false,

                message:
                    err?.message ||
                    "Failed to load transactions.",
            },
            {
                status: 500,
            }
        );

    }
}