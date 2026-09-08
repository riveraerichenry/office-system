import {
    NextRequest,
    NextResponse,
} from "next/server";

import {
    PoolClient,
} from "pg";

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

    let client:
        | PoolClient
        | null = null;


    try {

        /* =====================================================
           AUTHORIZATION
        ===================================================== */

        const user =
            await authorize(
                req,
                MODULE_PATHS.DIPP,
                "add"
            );


        /* =====================================================
           REQUEST BODY
        ===================================================== */

        const body =
            await req.json();


        const {

            booklet_registration_id,

            receipt_date,

            payor,

            gender,

            payment_mode,

            remarks,


            /* =================================================
               CTC-I INFORMATION
            ================================================= */

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


            /* =================================================
               CTC-I TAX INFORMATION
            ================================================= */

            place_issued,

            issue_date,

            tax_mode,

            taxable_amount,

            basic_tax,

            salary_tax,

            income_tax,

            additional_tax,

            penalty,

            interest,

            total_amount,

            grand_total,

        } = body;


        /* =====================================================
           VALIDATION
        ===================================================== */

        if (
            !booklet_registration_id
        ) {

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Booklet is required.",
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
                        "Payor is required.",
                },
                {
                    status: 400,
                }
            );

        }


        if (
            !payment_mode
        ) {

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Payment mode is required.",
                },
                {
                    status: 400,
                }
            );

        }


        if (
            !full_name ||
            !String(
                full_name
            ).trim()
        ) {

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Full name is required.",
                },
                {
                    status: 400,
                }
            );

        }


        /* =====================================================
           AMOUNTS
        ===================================================== */

        const grandTotal =
            Number(
                total_amount ??
                grand_total ??
                0
            );


        if (
            !Number.isFinite(
                grandTotal
            ) ||
            grandTotal <= 0
        ) {

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Invalid CTC-I amount.",
                },
                {
                    status: 400,
                }
            );

        }


        let taxableAmount =
            Number(
                taxable_amount ??
                0
            );


        if (
            !Number.isFinite(
                taxableAmount
            ) ||
            taxableAmount < 0
        ) {

            taxableAmount =
                0;

        }


        const basicTax =
            Number(
                basic_tax ??
                0
            );


        const salaryTax =
            Number(
                salary_tax ??
                income_tax ??
                0
            );


        const additionalTax =
            Number(
                additional_tax ??
                0
            );


        const penaltyAmount =
            Number(
                penalty ??
                0
            );


        const interestAmount =
            Number(
                interest ??
                0
            );


        /* =====================================================
           DATABASE CONNECTION
        ===================================================== */

        client =
            await pool.connect();


        await client.query(
            "BEGIN"
        );


        /* =====================================================
           GET AND LOCK BOOKLET
        ===================================================== */

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
            bookletResult.rows.length ===
            0
        ) {

            throw new Error(
                "Booklet not found or is inactive."
            );

        }


        const booklet =
            bookletResult.rows[0];


        /* =====================================================
           GET ACCOUNTABLE FORM
        ===================================================== */

        const formResult =
            await client.query(
                `
                SELECT

                    id,

                    form_code,

                    form_name

                FROM accountable_forms

                WHERE id = $1

                AND is_active = TRUE
                `,
                [
                    booklet.accountable_form_id,
                ]
            );


        if (
            formResult.rows.length ===
            0
        ) {

            throw new Error(
                "Accountable form not found."
            );

        }


        const form =
            formResult.rows[0];


        /* =====================================================
           VALIDATE CTC-I FORM
        ===================================================== */

        if (
            form.form_code !==
            "CTC-I"
        ) {

            throw new Error(
                "The selected booklet is not assigned to CTC-I."
            );

        }


        /* =====================================================
           VALIDATE OR RANGE
        ===================================================== */

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
                "This booklet has already been consumed."
            );

        }


        /* =====================================================
           BUILD REMARKS
        ===================================================== */

        const remarksParts:
            string[] = [];


        if (
            remarks &&
            String(
                remarks
            ).trim()
        ) {

            remarksParts.push(
                String(
                    remarks
                ).trim()
            );

        }


        const finalRemarks =
            remarksParts.join(
                " - "
            );


        /* =====================================================
           INSERT MAIN TRANSACTION
        ===================================================== */

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

                    $12,

                    $13,

                    $14

                )

                RETURNING id
                `,
                [

                    String(
                        currentOR
                    ),

                    receipt_date,

                    booklet_registration_id,

                    booklet.lor_release_id,

                    booklet.accountable_form_id,

                    booklet.accountable_officer_id,

                    String(
                        payor
                    ).trim(),

                    gender ??
                    sex ??
                    null,

                    payment_mode,

                    finalRemarks ||
                    null,

                    grandTotal,

                    "ISSUED",

                    user.id,

                    "CTC-I",

                ]
            );


        const transactionId =
            transactionResult
                .rows[0]
                .id;


        /* =====================================================
           INSERT CTC-I DETAILS
        ===================================================== */

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

                transactionId,

                "CTC-I",

                String(
                    full_name
                ).trim(),

                address
                    ? String(
                        address
                    ).trim()
                    : null,

                tin ??
                null,

                cr_number ??
                null,

                citizenship ??
                null,

                sex ??
                null,

                height ??
                null,

                weight ??
                null,

                place_of_birth ??
                null,

                birth_date ||
                null,

                civil_status ??
                null,

                occupation ??
                null,


                /* =============================================
                   CORPORATION FIELDS
                   NOT USED FOR CTC-I
                ============================================= */

                null,

                null,

                null,


                /* =============================================
                   ISSUE INFORMATION
                ============================================= */

                place_issued ??
                null,

                issue_date ||
                receipt_date,

                tax_mode ??
                null,


                /* =============================================
                   TAX COMPUTATION
                ============================================= */

                taxableAmount,

                basicTax,

                salaryTax,

                additionalTax,

                penaltyAmount,

                interestAmount,

                grandTotal,

            ]
        );


        /* =====================================================
           NEXT OR NUMBER
        ===================================================== */

        const nextOR =
            currentOR + 1;


        const bookletStatus =
            nextOR >
            endingOR

                ? "CONSUMED"

                : "IN USE";


        /* =====================================================
           UPDATE BOOKLET
        ===================================================== */

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


        /* =====================================================
           COMMIT
        ===================================================== */

        await client.query(
            "COMMIT"
        );


        /* =====================================================
           SUCCESS RESPONSE
        ===================================================== */

        return NextResponse.json(
            {

                success: true,

                message:
                    "CTC-I successfully issued.",

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

                taxable_amount:
                    taxableAmount,

                remarks:
                    finalRemarks,

                booklet_status:
                    bookletStatus,

                transaction_type:
                    "CTC-I",

            },
            {
                status: 201,
            }
        );

    }
    catch (
        err: any
    ) {

        if (
            client
        ) {

            try {

                await client.query(
                    "ROLLBACK"
                );

            }
            catch (
                rollbackError
            ) {

                console.error(
                    "CTC-I rollback error:",
                    rollbackError
                );

            }

        }


        console.error(
            "===================================="
        );

        console.error(
            "CTC-I API ERROR"
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

                    err?.message ??

                    "Unable to process CTC-I transaction.",

            },
            {

                status:
                    500,

            }
        );

    }
    finally {

        client?.release();

    }

}