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
        | AUTHORIZE
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
        | REQUEST BODY
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
            af54,
        } = body;

        /*
        |--------------------------------------------------------------------------
        | BASIC VALIDATION
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

        if (
            !receipt_date
        ) {

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
            !String(
                payor
            ).trim()
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

        if (!af54) {

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "AF54 information is required.",
                },
                {
                    status: 400,
                }
            );

        }

        /*
        |--------------------------------------------------------------------------
        | PARTY VALIDATION
        |--------------------------------------------------------------------------
        */

        if (
            !af54.first_party_name ||
            !String(
                af54.first_party_name
            ).trim()
        ) {

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "First contracting party name is required.",
                },
                {
                    status: 400,
                }
            );

        }

        if (
            !af54.second_party_name ||
            !String(
                af54.second_party_name
            ).trim()
        ) {

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Second contracting party name is required.",
                },
                {
                    status: 400,
                }
            );

        }

        /*
        |--------------------------------------------------------------------------
        | FIXED AF54 FEE
        |--------------------------------------------------------------------------
        */

        const licenseFee = 2.00;

        /*
        |--------------------------------------------------------------------------
        | DATABASE CONNECTION
        |--------------------------------------------------------------------------
        */

        client =
            await pool.connect();

        await client.query(
            "BEGIN"
        );

        /*
        |--------------------------------------------------------------------------
        | LOCK SELECTED BOOKLET
        |--------------------------------------------------------------------------
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

                    sbr.receipt_count,

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
        | VERIFY FORM
        |--------------------------------------------------------------------------
        */

        const formCode =
            String(
                booklet.form_code || ""
            )
                .trim()
                .toUpperCase();

        if (
            formCode !== "AF54"
        ) {

            throw new Error(
                `Selected booklet is ${formCode}, not AF54.`
            );

        }

        /*
        |--------------------------------------------------------------------------
        | CURRENT O.R.
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
                "This AF54 booklet has no remaining O.R. numbers."
            );

        }

        /*
        |--------------------------------------------------------------------------
        | EXPIRATION DATE
        |--------------------------------------------------------------------------
        |
        | Marriage license is valid for no more than 120 days.
        |
        */

        const issueDate =
            new Date(
                `${receipt_date}T00:00:00`
            );

        const expirationDate =
            new Date(
                issueDate
            );

        expirationDate.setDate(
            expirationDate.getDate() +
            120
        );

        const expirationDateString =
            expirationDate
                .toISOString()
                .substring(
                    0,
                    10
                );

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

                    'ISSUED',

                    $11,

                    'AF54'

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

                    payment_mode ||
                        "Cash",

                    remarks ||
                        null,

                    licenseFee,

                    user.id,

                ]
            );

        const transactionId =
            transactionResult
                .rows[0]
                .id;

        /*
        |--------------------------------------------------------------------------
        | INSERT AF54 DETAILS
        |--------------------------------------------------------------------------
        */

        await client.query(
            `
            INSERT INTO dipp_af54_items (

                transaction_id,

                city_municipality,

                province,

                first_party_name,

                first_party_age_years,

                first_party_age_months,

                first_party_residence,

                second_party_name,

                second_party_age_years,

                second_party_age_months,

                second_party_residence,

                license_fee,

                issue_date,

                expiration_date,

                register_no,

                local_civil_registrar

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

                $16

            )
            `,
            [

                transactionId,

                af54.city_municipality ||
                    null,

                af54.province ||
                    null,

                String(
                    af54.first_party_name
                ).trim(),

                af54.first_party_age_years ||
                    null,

                af54.first_party_age_months ||
                    null,

                af54.first_party_residence ||
                    null,

                String(
                    af54.second_party_name
                ).trim(),

                af54.second_party_age_years ||
                    null,

                af54.second_party_age_months ||
                    null,

                af54.second_party_residence ||
                    null,

                licenseFee,

                receipt_date,

                expirationDateString,

                af54.register_no ||
                    null,

                af54.local_civil_registrar ||
                    null,

            ]
        );

        /*
        |--------------------------------------------------------------------------
        | ADVANCE BOOKLET
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
        | COMMIT
        |--------------------------------------------------------------------------
        */

        await client.query(
            "COMMIT"
        );

        return NextResponse.json({

            success: true,

            message:
                "AF54 marriage license successfully issued.",

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

            license_fee:
                licenseFee,

            expiration_date:
                expirationDateString,

            booklet_status:
                bookletStatus,

        });

    } catch (
        err: any
    ) {

        if (client) {

            await client.query(
                "ROLLBACK"
            );

        }

        console.error(
            "===================================="
        );

        console.error(
            "AF54 TRANSACTION API ERROR"
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
                    err?.message ||
                    "Unable to process AF54 transaction.",
            },
            {
                status: 500,
            }
        );

    } finally {

        client?.release();

    }

}