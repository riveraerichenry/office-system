import { NextRequest, NextResponse } from "next/server";

import {
    authorize,
} from "@/lib/authorize";

import {
    pool,
} from "@/lib/db";

import {
    MODULE_PATHS,
} from "@/lib/module-paths";


export async function POST(
    req: NextRequest
) {

    let client: any = null;

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
                "view"
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
            gender,
            payment_mode,
            remarks,
            af58,
        } = body;


        /*
        |--------------------------------------------------------------------------
        | Basic Validation
        |--------------------------------------------------------------------------
        */

        if (
            !booklet_registration_id
        ) {

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Booklet registration is required.",
                },
                {
                    status: 400,
                }
            );

        }


        if (!receipt_date) {

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Receipt date is required.",
                },
                {
                    status: 400,
                }
            );

        }


        if (
            !payor ||
            !String(payor).trim()
        ) {

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Payor name is required.",
                },
                {
                    status: 400,
                }
            );

        }


        if (!af58) {

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "AF58 information is required.",
                },
                {
                    status: 400,
                }
            );

        }


        if (
            !af58.deceased_name ||
            !String(
                af58.deceased_name
            ).trim()
        ) {

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Name of the deceased is required.",
                },
                {
                    status: 400,
                }
            );

        }


        /*
        |--------------------------------------------------------------------------
        | Fee
        |--------------------------------------------------------------------------
        */

        const feeAmount =
            Number(
                af58.fee_amount || 0
            );


        if (
            !Number.isFinite(
                feeAmount
            ) ||
            feeAmount < 0
        ) {

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Invalid fee amount.",
                },
                {
                    status: 400,
                }
            );

        }


        /*
        |--------------------------------------------------------------------------
        | Database Transaction
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
        |
        | This prevents two users from receiving
        | the same O.R. number at the same time.
        |
        */

        const bookletResult =
            await client.query(
                `

                SELECT

                    sbr.id
                        AS booklet_registration_id,

                    sbr.current_or,

                    sbr.beginning_or,

                    sbr.ending_or,

                    sbr.status
                        AS booklet_status,

                    lr.id
                        AS lor_release_id,

                    lr.status
                        AS lor_status,

                    lr.is_active,

                    lr.accountable_officer_id,

                    af.id
                        AS accountable_form_id,

                    af.form_code,

                    af.form_name

                FROM smi_booklet_registration sbr

                INNER JOIN lor_releases lr
                    ON lr.booklet_registration_id =
                       sbr.id

                INNER JOIN accountable_forms af
                    ON af.id =
                       lr.accountable_form_id

                WHERE

                    sbr.id = $1

                    AND
                    lr.accountable_officer_id = $2

                    AND
                    lr.is_active = TRUE

                    AND
                    lr.status = 'ACTIVE'

                FOR UPDATE

                `,
                [
                    booklet_registration_id,
                    user.id,
                ]
            );


        if (
            bookletResult.rows.length === 0
        ) {

            throw new Error(
                "The selected booklet is not assigned to the current user."
            );

        }


        const booklet =
            bookletResult.rows[0];


        /*
        |--------------------------------------------------------------------------
        | Verify AF58
        |--------------------------------------------------------------------------
        */

        const formCode =
            String(
                booklet.form_code || ""
            )
                .trim()
                .toUpperCase();


        if (
            formCode !== "AF58"
        ) {

            throw new Error(
                `Selected booklet is ${formCode}, not AF58.`
            );

        }


        /*
        |--------------------------------------------------------------------------
        | Verify Available OR
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
            )
        ) {

            throw new Error(
                "Invalid current O.R. number."
            );

        }


        if (
            currentOR > endingOR
        ) {

            throw new Error(
                "This AF58 booklet has no remaining O.R. numbers."
            );

        }


        /*
        |--------------------------------------------------------------------------
        | Grand Total
        |--------------------------------------------------------------------------
        */

        const grandTotal =
            feeAmount;


        /*
        |--------------------------------------------------------------------------
        | Insert DIPP Transaction
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

                    payor,

                    gender,

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

                    'ISSUED',

                    $12,

                    'AF58'

                )

                RETURNING id

                `,
                [

                    String(
                        currentOR
                    ),

                    receipt_date,

                    booklet.booklet_registration_id,

                    booklet.lor_release_id,

                    booklet.accountable_form_id,

                    booklet.accountable_officer_id,

                    String(
                        payor
                    ).trim(),

                    gender ||
                        null,

                    payment_mode ||
                        "Cash",

                    remarks ||
                        null,

                    grandTotal,

                    user.id,

                ]
            );


        const transactionId =
            transactionResult
                .rows[0]
                .id;


        /*
        |--------------------------------------------------------------------------
        | Insert AF58 Detail
        |--------------------------------------------------------------------------
        */

        await client.query(
            `

            INSERT INTO dipp_af58_items (

                transaction_id,

                payor_name,

                city_municipality,

                province,

                permit_action,

                remains_of,

                deceased_name,

                nationality,

                age,

                sex,

                date_of_death,

                cause_of_death,

                cemetery_name,

                infectious_status,

                embalmed_status,

                disposition_of_remains,

                fee_amount,

                certification_city_municipality,

                certification_province,

                certification_date

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

                $20

            )

            `,
            [

                transactionId,

                String(
                    payor
                ).trim(),

                af58.city_municipality ||
                    null,

                af58.province ||
                    null,

                af58.permit_action ||
                    null,

                af58.remains_of ||
                    null,

                af58.deceased_name ||
                    null,

                af58.nationality ||
                    null,

                af58.age ||
                    null,

                af58.sex ||
                    null,

                af58.date_of_death ||
                    null,

                af58.cause_of_death ||
                    null,

                af58.cemetery_name ||
                    null,

                af58.infectious_status ||
                    null,

                af58.embalmed_status ||
                    null,

                af58.disposition_of_remains ||
                    null,

                feeAmount,

                af58.certification_city_municipality ||
                    null,

                af58.certification_province ||
                    null,

                af58.certification_date ||
                    receipt_date,

            ]
        );


        /*
        |--------------------------------------------------------------------------
        | Advance Booklet
        |--------------------------------------------------------------------------
        */

        const nextOR =
            currentOR + 1;


        const bookletStatus =
            nextOR > endingOR
                ? "CONSUMED"
                : "IN USE";


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

            message:
                "AF58 burial permit successfully issued.",

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

        });

    }
    catch (err: any) {

        if (client) {

            await client.query(
                "ROLLBACK"
            );

        }


        console.error(
            "===================================="
        );

        console.error(
            "AF58 TRANSACTION API ERROR"
        );

        console.error(err);

        console.error(
            "===================================="
        );


        return NextResponse.json(
            {
                success: false,

                message:
                    err?.message ||
                    "Unable to process AF58 transaction.",
            },
            {
                status: 500,
            }
        );

    }
    finally {

        client?.release();

    }

}