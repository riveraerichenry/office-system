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
        | Lock Booklet
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
                    ON lr.booklet_registration_id = sbr.id

                WHERE

                    sbr.id = $1

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



        const formResult =
            await client.query(

                `
                SELECT

                    form_code

                FROM accountable_forms

                WHERE id = $1
                `,

                [

                    booklet.accountable_form_id,

                ]

            );

        const formCode =
            formResult.rows[0].form_code;

        /*
        |--------------------------------------------------------------------------
        | Validate Available OR
        |--------------------------------------------------------------------------
        */

        if (

            Number(booklet.current_or) >

            Number(booklet.ending_or)

        ) {

            throw new Error(
                "This booklet has already been fully consumed."
            );

        }

        /*
        |--------------------------------------------------------------------------
        | Validate Items & Compute Total
        |--------------------------------------------------------------------------
        */

        /*
|--------------------------------------------------------------------------
| Validate Receipt Data
|--------------------------------------------------------------------------
*/

            let grandTotal = 0;

            if (

                formCode === "CTC-I" ||

                formCode === "CTC-C"

            ) {

                if (!ctc) {

                    throw new Error(
                        "CTC information is required."
                    );

                }

                grandTotal =
                    Number(

                        ctc.grand_total || 0

                    );

                if (grandTotal <= 0) {

                    throw new Error(
                        "Invalid CTC amount."
                    );

                }

            }
            else {

                for (const item of items) {

                    if (!item.account_id) {

                        throw new Error(
                            "Please select an account."
                        );

                    }

                    if (

                        Number(item.amount) <= 0

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
                        Number(item.amount);

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

                    encoded_by

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

                    $12

                )

                RETURNING id
                `,

                [

                    booklet.current_or,

                    receipt_date,

                    booklet_registration_id,

                    booklet.lor_release_id,

                    booklet.accountable_form_id,

                    booklet.accountable_officer_id,

                    payor,

                    payment_mode,

                    remarks,

                    grandTotal,

                    "ISSUED",

                    user.id,

                ]

            );

        const transactionId =
            transaction.rows[0].id;

                    /*
        |--------------------------------------------------------------------------
        | Insert Transaction Items
        |--------------------------------------------------------------------------
        */

        /*
|--------------------------------------------------------------------------
| Insert Receipt Items
|--------------------------------------------------------------------------
*/

if (formCode === "AF56") {

    /*
    AF56
    (We'll replace this in the next part.)
    */

}

else if (

    formCode === "CTC-I" ||

    formCode === "CTC-C"

) {

    await client.query(

        `

        INSERT INTO dipp_ctc_items (

            transaction_id,

            taxpayer_type,

            full_name,

            corporation_name,

            address,

            tin,

            cr_number,

            citizenship,

            sex,

            civil_status,

            occupation,

            birth_date,

            place_of_birth,

            height,

            weight,

            sec_registration,

            representative,

            place_issued,

            issue_date,

            tax_mode,

            taxable_amount,

            basic_tax,

            additional_tax,

            interest,

            penalty,

            grand_total

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

            $26

        )

        `,

        [

            transactionId,

            formCode === "CTC-I"

                ?

                "INDIVIDUAL"

                :

                "CORPORATION",

            ctc.full_name ?? null,

            ctc.corporation_name ?? null,

            ctc.address ?? null,

            ctc.tin ?? null,

            ctc.cr_number ?? null,

            ctc.citizenship ?? null,

            ctc.sex ?? null,

            ctc.civil_status ?? null,

            ctc.occupation ?? null,

            ctc.birth_date || null,

            ctc.place_of_birth ?? null,

            ctc.height || null,

            ctc.weight || null,

            ctc.sec_registration ?? null,

            ctc.representative ?? null,

            ctc.place_issued ?? null,

            ctc.issue_date || null,

            ctc.tax_mode ?? null,

            Number(ctc.taxable_amount || 0),

            Number(ctc.basic_tax || 0),

            Number(ctc.additional_tax || 0),

            Number(ctc.interest || 0),

            Number(ctc.penalty || 0),

            Number(ctc.grand_total || grandTotal),

        ]

    );

}

else {

    /*
    General Receipt
    */

    for (const item of items) {

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

                    Number(item.amount),

                    item.remarks ?? null,

                ]

            );

        }

    }

        /*
        |--------------------------------------------------------------------------
        | Compute Booklet Status
        |--------------------------------------------------------------------------
        */

        const nextOR =
            Number(booklet.current_or) + 1;

        const bookletStatus =
            nextOR > Number(booklet.ending_or)
                ? "CONSUMED"
                : "IN USE";

        /*
        |--------------------------------------------------------------------------
        | Update Booklet Registration
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

                nextOR,

                bookletStatus,

                booklet_registration_id,

            ]

        );

        /*
        |--------------------------------------------------------------------------
        | Update LOR Status
        |--------------------------------------------------------------------------
        */

       

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

            message:
                "Collection successfully processed.",

            transaction_id:
                transactionId,

            or_number:
                booklet.current_or,

            next_or:
                nextOR,

            grand_total:
                grandTotal,

            booklet_status:
                bookletStatus,

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
                    err.message ??
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

        if (search) {

            params.push(`%${search}%`);

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

                    dt.created_at,

                    encoder.full_name
                        AS encoded_by

                FROM dipp_transactions dt

                LEFT JOIN users encoder

                    ON encoder.id =
                    dt.encoded_by

                ${where}

                ORDER BY

                    CAST(dt.or_number AS BIGINT) DESC

                `,

                params

            );

        return NextResponse.json({

            success: true,

            data: result.rows,

        });

    }

    catch (err: any) {

        console.error(err);

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