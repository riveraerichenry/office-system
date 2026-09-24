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


/* ============================================================
   POST
============================================================ */

export async function POST(
    req: NextRequest
) {

    let client: any = null;


    try {

        /* ========================================================
           AUTHORIZATION
        ======================================================== */

        const user =
            await authorize(
                req,
                MODULE_PATHS.DIPP,
                "view"
            );


        /* ========================================================
           REQUEST BODY
        ======================================================== */

        const body =
            await req.json();


        const {

            booklet_registration_id,

            receipt_date,

            municipality,
            province,

            owner_name,
            owner_gender,
            owner_municipality,
            owner_province,

            animal_type,
            description,
            sex,
            years,

            brand_municipality,
            brand_owner,

            payment_mode,

            grand_total,

        } = body;


        /* ========================================================
           BASIC VALIDATION
        ======================================================== */

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
            !owner_name ||
            !String(
                owner_name
            ).trim()
        ) {

            return NextResponse.json(
                {
                    success: false,

                    message:
                        "Owner name is required.",
                },
                {
                    status: 400,
                }
            );

        }


        if (
            !description ||
            !String(
                description
            ).trim()
        ) {

            return NextResponse.json(
                {
                    success: false,

                    message:
                        "Description is required.",
                },
                {
                    status: 400,
                }
            );

        }


        /* ========================================================
           GRAND TOTAL

           This is the actual AF53 charge.

           IMPORTANT:
           Payment Received is NOT accepted/stored here.
           Change is NOT accepted/stored here.

           They are UI-only values.
        ======================================================== */

        const finalGrandTotal =
            Number(
                grand_total
            );


        if (
            !Number.isFinite(
                finalGrandTotal
            ) ||
            finalGrandTotal < 0
        ) {

            return NextResponse.json(
                {
                    success: false,

                    message:
                        "Invalid grand total.",
                },
                {
                    status: 400,
                }
            );

        }


        /* ========================================================
           ANIMAL TYPE
        ======================================================== */

        const finalAnimalType =
            String(
                animal_type ||
                "Cow"
            ).trim();


        const allowedAnimalTypes = [
            "Cow",
            "Carabao",
            "Horse",
        ];


        if (
            !allowedAnimalTypes.includes(
                finalAnimalType
            )
        ) {

            return NextResponse.json(
                {
                    success: false,

                    message:
                        "Invalid animal type.",
                },
                {
                    status: 400,
                }
            );

        }


        /* ========================================================
           PAYMENT MODE
        ======================================================== */

        const finalPaymentMode =
            String(
                payment_mode ||
                "Cash"
            ).trim();


        const allowedPaymentModes = [
            "Cash",
            "Check",
            "Cash + Check",
        ];


        if (
            !allowedPaymentModes.includes(
                finalPaymentMode
            )
        ) {

            return NextResponse.json(
                {
                    success: false,

                    message:
                        "Invalid payment mode.",
                },
                {
                    status: 400,
                }
            );

        }


        /* ========================================================
           YEARS
        ======================================================== */

        let finalYears:
            number | null = null;


        if (
            years !== undefined &&
            years !== null &&
            years !== ""
        ) {

            finalYears =
                Number(
                    years
                );


            if (
                !Number.isInteger(
                    finalYears
                ) ||
                finalYears < 0
            ) {

                return NextResponse.json(
                    {
                        success: false,

                        message:
                            "Invalid age in years.",
                    },
                    {
                        status: 400,
                    }
                );

            }

        }


        /* ========================================================
           DATABASE CONNECTION
        ======================================================== */

        client =
            await pool.connect();


        /* ========================================================
           BEGIN TRANSACTION
        ======================================================== */

        await client.query(
            "BEGIN"
        );


        /* ========================================================
           LOCK BOOKLET

           smi_booklet_registration
                    ↓
              lor_releases
                    ↓
            accountable_forms
        ======================================================== */

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


        /* ========================================================
           VERIFY BOOKLET
        ======================================================== */

        if (
            bookletResult.rows.length === 0
        ) {

            throw new Error(
                "The selected booklet is not assigned to the current user."
            );

        }


        const booklet =
            bookletResult.rows[0];


        /* ========================================================
           VERIFY AF53
        ======================================================== */

        const formCode =
            String(
                booklet.form_code ||
                ""
            )
                .trim()
                .toUpperCase();


        if (
            formCode !== "AF53"
        ) {

            throw new Error(
                `Selected booklet is ${formCode}, not AF53.`
            );

        }


        /* ========================================================
           VERIFY CURRENT OR
        ======================================================== */

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
            !Number.isFinite(
                endingOR
            )
        ) {

            throw new Error(
                "Invalid ending O.R. number."
            );

        }


        if (
            currentOR > endingOR
        ) {

            throw new Error(
                "This AF53 booklet has no remaining O.R. numbers."
            );

        }


        /* ========================================================
           INSERT DIPP TRANSACTION
        ======================================================== */

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

                    'AF53'

                )

                RETURNING
                    id,
                    or_number

                `,
                [

                    /* $1 - OR NUMBER */
                    String(
                        currentOR
                    ),

                    /* $2 - RECEIPT DATE */
                    receipt_date,

                    /* $3 - BOOKLET */
                    booklet.booklet_registration_id,

                    /* $4 - LOR */
                    booklet.lor_release_id,

                    /* $5 - ACCOUNTABLE FORM */
                    booklet.accountable_form_id,

                    /* $6 - COLLECTOR */
                    booklet.accountable_officer_id,

                    /* $7 - PAYOR / OWNER */
                    String(
                        owner_name
                    ).trim(),

                    /* $8 - GENDER */
                    owner_gender ||
                        null,

                    /* $9 - PAYMENT MODE */
                    finalPaymentMode,

                    /* $10 - REMARKS */
                    null,

                    /* $11 - GRAND TOTAL */
                    Number(
                        finalGrandTotal.toFixed(2)
                    ),

                    /* $12 - ENCODED BY */
                    user.id,

                ]
            );


        /* ========================================================
           TRANSACTION ID
        ======================================================== */

        const transactionId =
            transactionResult
                .rows[0]
                .id;


        const orNumber =
            transactionResult
                .rows[0]
                .or_number;


        /* ========================================================
           INSERT AF53 DETAIL
        ======================================================== */

        await client.query(
            `

            INSERT INTO dipp_af53_items (

                transaction_id,

                user_id,

                accountable_officer,

                municipality,

                province,

                owner_name,

                owner_gender,

                owner_municipality,

                owner_province,

                description,

                animal_type,

                sex,

                years,

                brand_municipality,

                brand_owner,

                payment_mode

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

                /* $1 */
                transactionId,

                /* $2 */
                user.id,

                /* $3 */
                booklet.accountable_officer_id,

                /* $4 */
                municipality ||
                    "TAYTAY",

                /* $5 */
                province ||
                    "PALAWAN",

                /* $6 */
                String(
                    owner_name
                ).trim(),

                /* $7 */
                owner_gender ||
                    null,

                /* $8 */
                owner_municipality ||
                    null,

                /* $9 */
                owner_province ||
                    null,

                /* $10 */
                String(
                    description
                ).trim(),

                /* $11 */
                finalAnimalType,

                /* $12 */
                sex ||
                    null,

                /* $13 */
                finalYears,

                /* $14 */
                brand_municipality ||
                    null,

                /* $15 */
                brand_owner ||
                    null,

                /* $16 */
                finalPaymentMode,

            ]
        );


        /* ========================================================
           ADVANCE BOOKLET
        ======================================================== */

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

            WHERE
                id = $3

            `,
            [

                nextOR,

                bookletStatus,

                booklet.booklet_registration_id,

            ]
        );


        /* ========================================================
           COMMIT
        ======================================================== */

        await client.query(
            "COMMIT"
        );


        /* ========================================================
           RESPONSE
        ======================================================== */

        return NextResponse.json(
            {

                success:
                    true,

                message:
                    "AF53 certificate successfully issued.",

                transaction_id:
                    transactionId,

                or_number:
                    orNumber,

                next_or:
                    nextOR,

                grand_total:
                    Number(
                        finalGrandTotal.toFixed(2)
                    ),

                booklet_status:
                    bookletStatus,

            },
            {
                status: 201,
            }
        );


    } catch (error: any) {

        /* ========================================================
           ROLLBACK
        ======================================================== */

        if (client) {

            try {

                await client.query(
                    "ROLLBACK"
                );

            } catch {
                // Ignore rollback errors
            }

        }


        /* ========================================================
           ERROR LOG
        ======================================================== */

        console.error(
            "===================================="
        );

        console.error(
            "AF53 TRANSACTION API ERROR"
        );

        console.error(
            error
        );

        console.error(
            "===================================="
        );


        /* ========================================================
           ERROR RESPONSE
        ======================================================== */

        return NextResponse.json(
            {

                success:
                    false,

                message:
                    error?.message ||
                    "Unable to process AF53 transaction.",

            },
            {
                status: 500,
            }
        );


    } finally {

        /* ========================================================
           RELEASE CONNECTION
        ======================================================== */

        if (client) {

            client.release();

        }

    }

}