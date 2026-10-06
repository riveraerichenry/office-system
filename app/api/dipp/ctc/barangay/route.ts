import {
    NextRequest,
    NextResponse,
} from "next/server";

import {
    pool,
} from "@/lib/db";

import jwt from "jsonwebtoken";


const BARANGAY_CTC_ACCOUNT_ID =
    "e631c8a7-7f46-4b33-8f04-645c26f2b159";


export async function POST(
    request: NextRequest
) {

    const client =
        await pool.connect();


    try {

        /*
        ============================================================
        1. AUTHENTICATION
        ============================================================
        */

        const token =
            request.cookies.get(
                "barangay_token"
            )?.value;


        if (!token) {

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Unauthorized. Barangay login required.",
                },
                {
                    status: 401,
                }
            );

        }


        if (!process.env.JWT_SECRET) {

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "JWT_SECRET is not configured.",
                },
                {
                    status: 500,
                }
            );

        }


        let decoded:
            jwt.JwtPayload;


        try {

            decoded =
                jwt.verify(
                    token,
                    process.env.JWT_SECRET
                ) as jwt.JwtPayload;

        }
        catch (error) {

            console.error(
                "Barangay JWT verification failed:",
                error
            );


            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Invalid or expired Barangay session.",
                },
                {
                    status: 401,
                }
            );

        }


        const barangayUserId =
            String(
                decoded.id ?? ""
            ).trim();


        if (!barangayUserId) {

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Invalid Barangay user ID.",
                },
                {
                    status: 401,
                }
            );

        }


        /*
        ============================================================
        2. VERIFY BARANGAY USER
        ============================================================
        */

        const barangayUserResult =
            await client.query(
                `
                SELECT
                    bu.id,
                    bu.username,
                    bu.first_name,
                    bu.middle_name,
                    bu.last_name,
                    bu.email,
                    bu.barangay_id,
                    bu.role,
                    bu.is_active,

                    b.id AS barangay_uuid,
                    b.barangay_code,
                    b.barangay_name,
                    b.municipality,
                    b.province,
                    b.is_active AS barangay_is_active

                FROM public.barangay_users bu

                LEFT JOIN public.barangays b
                    ON b.id = bu.barangay_id

                WHERE bu.id = $1
                  AND bu.is_active = TRUE

                LIMIT 1
                `,
                [
                    barangayUserId,
                ]
            );


        if (
            barangayUserResult
                .rows.length === 0
        ) {

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Barangay user not found or inactive.",
                },
                {
                    status: 401,
                }
            );

        }


        const barangayUser =
            barangayUserResult
                .rows[0];


        if (!barangayUser.barangay_id) {

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "The Barangay user is not assigned to a Barangay.",
                },
                {
                    status: 400,
                }
            );

        }


        if (
            barangayUser.barangay_is_active ===
            false
        ) {

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "The assigned Barangay is inactive.",
                },
                {
                    status: 403,
                }
            );

        }


        const verifiedBarangayUserId =
            String(
                barangayUser.id
            ).trim();


        const barangayId =
            String(
                barangayUser.barangay_id
            ).trim();


        const barangayName =
            String(
                barangayUser.barangay_name ?? ""
            ).trim();


        /*
        ============================================================
        3. REMARKS
        ============================================================
        */

        const finalRemarks =
            barangayId;


        /*
        ============================================================
        4. REQUEST BODY
        ============================================================
        */

        const body =
            await request.json();


        const {
            booklet_registration_id,
            receipt_date,
            payor,
            payment_mode,
            ctc,
        } = body;


        if (!booklet_registration_id) {

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
                        "Payor is required.",
                },
                {
                    status: 400,
                }
            );

        }


        if (
            !ctc ||
            typeof ctc !== "object"
        ) {

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "CTC information is required.",
                },
                {
                    status: 400,
                }
            );

        }


        /*
        ============================================================
        5. EXISTING CTC FORM DATA
        ============================================================
        */

        const {
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

            /*
            --------------------------------------------------------
            TAX COMPUTATION
            --------------------------------------------------------
            */

            tax_mode,
            taxable_amount,

            basic_tax,

            /*
            Existing TaxComputation calls this incomeTax.
            Database column = salary_tax.
            */

            income_tax,
            salary_tax,

            /*
            Existing TaxComputation calls this otherIncome.
            Database column = additional_tax.
            */

            other_income,
            additional_tax,

            penalty,
            interest,

            total_amount,
            grand_total,

            /*
            --------------------------------------------------------
            ADDITIONAL CTC-I VALUES
            --------------------------------------------------------
            */

            corporation_name,
            sec_registration,
            representative,

            issue_date,

        } = ctc;


        /*
        ============================================================
        6. VALIDATE FULL NAME
        ============================================================
        */

        if (
            !full_name ||
            !String(full_name).trim()
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


        /*
        ============================================================
        7. FIXED CTC TYPE
        ============================================================
        */

        const ctcType =
            "INDIVIDUAL";


        /*
        ============================================================
        8. PLACE ISSUED
        ============================================================
        */

        const placeIssued =
            barangayId;


        /*
        ============================================================
        9. TAX VALUES
        ============================================================
        */

        const taxableAmountValue =
            Number(
                taxable_amount ?? 0
            );


        const basicTaxValue =
            Number(
                basic_tax ?? 0
            );


        const salaryTaxValue =
            Number(
                salary_tax ??
                income_tax ??
                0
            );


        const additionalTaxValue =
            Number(
                additional_tax ??
                other_income ??
                0
            );


        const penaltyValue =
            Number(
                penalty ?? 0
            );


        const interestValue =
            Number(
                interest ?? 0
            );


        const totalAmountValue =
            Number(
                total_amount ??
                grand_total ??
                0
            );


        if (
            !Number.isFinite(
                taxableAmountValue
            ) ||
            !Number.isFinite(
                basicTaxValue
            ) ||
            !Number.isFinite(
                salaryTaxValue
            ) ||
            !Number.isFinite(
                additionalTaxValue
            ) ||
            !Number.isFinite(
                penaltyValue
            ) ||
            !Number.isFinite(
                interestValue
            ) ||
            !Number.isFinite(
                totalAmountValue
            )
        ) {

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Invalid CTC tax amount.",
                },
                {
                    status: 400,
                }
            );

        }


        /*
        ============================================================
        10. BEGIN DATABASE TRANSACTION
        ============================================================
        */

        await client.query(
            "BEGIN"
        );


        /*
        ============================================================
        11. GET BARANGAY RAT + BOOKLET
        ============================================================
        |
        | IMPORTANT:
        |
        | barangay_rat_items uses:
        |
        |     booklet_id
        |     rat_id
        |
        | NOT:
        |
        |     booklet_registration_id
        |     rat_header_id
        |
        ============================================================
        */

        const bookletResult =
            await client.query(
                `
                SELECT

                    sbr.id
                        AS booklet_registration_id,

                    sbr.accountable_form_id,

                    sbr.current_or,

                    sbr.beginning_or,

                    sbr.ending_or,

                    sbr.status
                        AS booklet_status,

                    af.form_code,

                    af.form_name,

                    bri.rat_id
                        AS rat_header_id,

                    bri.id
                        AS rat_item_id,

                    brh.barangay_user_id,

                    brh.id
                        AS barangay_rat_id

                FROM public.barangay_rat_items bri

                INNER JOIN public.barangay_rat_headers brh
                    ON brh.id =
                        bri.rat_id

                INNER JOIN public.smi_booklet_registration sbr
                    ON sbr.id =
                        bri.booklet_id

                INNER JOIN public.accountable_forms af
                    ON af.id =
                        sbr.accountable_form_id

                WHERE
                    bri.booklet_id = $1

                AND
                    bri.is_active = TRUE

                AND
                    brh.is_active = TRUE

                AND
                    brh.barangay_user_id = $2

                AND
                    sbr.is_active = TRUE

                FOR UPDATE OF sbr
                `,
                [
                    booklet_registration_id,
                    verifiedBarangayUserId,
                ]
            );


        if (
            bookletResult.rows.length === 0
        ) {

            await client.query(
                "ROLLBACK"
            );


            return NextResponse.json(
                {
                    success: false,
                    message:
                        "The selected booklet does not belong to the logged-in Barangay user.",
                },
                {
                    status: 403,
                }
            );

        }


        const booklet =
            bookletResult.rows[0];


        /*
        ============================================================
        12. BARANGAY RAT ID
        ============================================================
        */

        const barangayRatId =
            String(
                booklet.barangay_rat_id ??
                booklet.rat_header_id ??
                ""
            ).trim();


        if (!barangayRatId) {

            await client.query(
                "ROLLBACK"
            );


            return NextResponse.json(
                {
                    success: false,
                    message:
                        "No Barangay RAT ID was found for the selected booklet.",
                },
                {
                    status: 400,
                }
            );

        }


        /*
        ============================================================
        13. CURRENT OR
        ============================================================
        */

        if (
            booklet.current_or ===
                null ||
            booklet.current_or ===
                undefined
        ) {

            await client.query(
                "ROLLBACK"
            );


            return NextResponse.json(
                {
                    success: false,
                    message:
                        "No current OR number is available for this booklet.",
                },
                {
                    status: 400,
                }
            );

        }


        const currentOR =
            String(
                booklet.current_or
            ).trim();


        if (!currentOR) {

            await client.query(
                "ROLLBACK"
            );


            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Invalid current OR number.",
                },
                {
                    status: 400,
                }
            );

        }


        /*
        ============================================================
        14. CHECK DUPLICATE OR
        ============================================================
        */

        const existingTransactionResult =
            await client.query(
                `
                SELECT id

                FROM public.dipp_transactions

                WHERE or_number = $1

                LIMIT 1
                `,
                [
                    currentOR,
                ]
            );


        if (
            existingTransactionResult
                .rows.length > 0
        ) {

            await client.query(
                "ROLLBACK"
            );


            return NextResponse.json(
                {
                    success: false,
                    message:
                        `OR number ${currentOR} has already been used.`,
                },
                {
                    status: 409,
                }
            );

        }


        /*
        ============================================================
        15. INSERT MAIN DIPP TRANSACTION
        ============================================================
        |
        | lor_release_id = Barangay RAT ID
        |
        | collector_id = Barangay user ID
        |
        | encoded_by = Barangay user ID
        |
        | remarks = Barangay ID
        |
        | account_id does NOT belong here.
        |
        ============================================================
        */

        const transactionResult =
            await client.query(
                `
                INSERT INTO public.dipp_transactions
                (
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

                VALUES
                (
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

                RETURNING *
                `,
                [

                    /*
                    OR NUMBER
                    */
                    currentOR,

                    /*
                    RECEIPT DATE
                    */
                    receipt_date,

                    /*
                    BOOKLET
                    */
                    booklet_registration_id,

                    /*
                    BARANGAY RAT ID
                    */
                    barangayRatId,

                    /*
                    ACCOUNTABLE FORM
                    */
                    booklet.accountable_form_id,

                    /*
                    COLLECTOR
                    */
                    verifiedBarangayUserId,

                    /*
                    PAYOR
                    */
                    String(
                        payor
                    ).trim(),

                    /*
                    GENDER / SEX
                    */
                    sex ??
                        null,

                    /*
                    PAYMENT MODE
                    */
                    String(
                        payment_mode ??
                        "Cash"
                    ).trim(),

                    /*
                    REMARKS
                    BARANGAY ID ONLY
                    */
                    finalRemarks,

                    /*
                    GRAND TOTAL
                    */
                    totalAmountValue,

                    /*
                    STATUS
                    */
                    "ISSUED",

                    /*
                    ENCODED BY
                    */
                    verifiedBarangayUserId,

                    /*
                    TRANSACTION TYPE
                    */
                    "CTC-BARANGAY",
                ]
            );


        const transaction =
            transactionResult.rows[0];


        /*
        ============================================================
        16. INSERT CTC-I DETAILS
        ============================================================
        |
        | IMPORTANT:
        |
        | NO first_name
        | NO middle_name
        | NO last_name
        | NO suffix
        |
        | The existing form uses FULL NAME.
        |
        ============================================================
        */

        const ctcItemResult =
            await client.query(
                `
                INSERT INTO public.dipp_ctc_items
                (
                    transaction_id,

                    account_id,

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

                VALUES
                (
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
                    $27,
                    $28
                )

                RETURNING *
                `,
                [

                    /*
                    1
                    */
                    transaction.id,

                    /*
                    2
                    */
                    BARANGAY_CTC_ACCOUNT_ID,

                    /*
                    3
                    */
                    ctcType,

                    /*
                    4
                    FULL NAME
                    */
                    String(
                        full_name
                    ).trim(),

                    /*
                    5
                    ADDRESS
                    */
                    address
                        ? String(
                            address
                        ).trim()
                        : null,

                    /*
                    6
                    TIN
                    */
                    tin
                        ? String(
                            tin
                        ).trim()
                        : null,

                    /*
                    7
                    CTC / CR NUMBER
                    */
                    cr_number
                        ? String(
                            cr_number
                        ).trim()
                        : null,

                    /*
                    8
                    CITIZENSHIP
                    */
                    citizenship
                        ? String(
                            citizenship
                        ).trim()
                        : null,

                    /*
                    9
                    SEX
                    */
                    sex ??
                        null,

                    /*
                    10
                    HEIGHT
                    */
                    height
                        ? String(
                            height
                        ).trim()
                        : null,

                    /*
                    11
                    WEIGHT
                    */
                    weight
                        ? String(
                            weight
                        ).trim()
                        : null,

                    /*
                    12
                    PLACE OF BIRTH
                    */
                    place_of_birth
                        ? String(
                            place_of_birth
                        ).trim()
                        : null,

                    /*
                    13
                    BIRTH DATE
                    */
                    birth_date ||
                        null,

                    /*
                    14
                    CIVIL STATUS
                    */
                    civil_status ??
                        null,

                    /*
                    15
                    OCCUPATION
                    */
                    occupation
                        ? String(
                            occupation
                        ).trim()
                        : null,

                    /*
                    16
                    CORPORATION NAME
                    CTC-I = NULL
                    */
                    corporation_name ??
                        null,

                    /*
                    17
                    SEC REGISTRATION
                    CTC-I = NULL
                    */
                    sec_registration ??
                        null,

                    /*
                    18
                    REPRESENTATIVE
                    CTC-I = NULL
                    */
                    representative ??
                        null,

                    /*
                    19
                    PLACE ISSUED
                    = BARANGAY ID
                    */
                    placeIssued,

                    /*
                    20
                    ISSUE DATE
                    */
                    issue_date ||
                        receipt_date,

                    /*
                    21
                    TAX MODE
                    */
                    tax_mode ??
                        null,

                    /*
                    22
                    TAXABLE AMOUNT
                    */
                    taxableAmountValue,

                    /*
                    23
                    BASIC TAX
                    */
                    basicTaxValue,

                    /*
                    24
                    SALARY / INCOME TAX
                    */
                    salaryTaxValue,

                    /*
                    25
                    ADDITIONAL TAX
                    */
                    additionalTaxValue,

                    /*
                    26
                    PENALTY
                    */
                    penaltyValue,

                    /*
                    27
                    INTEREST
                    */
                    interestValue,

                    /*
                    28
                    TOTAL
                    */
                    totalAmountValue,
                ]
            );


        const ctcItem =
            ctcItemResult.rows[0];


        /*
        ============================================================
        17. UPDATE BOOKLET OR
        ============================================================
        */

        const currentORNumber =
            Number(
                currentOR
            );


        if (
            !Number.isFinite(
                currentORNumber
            )
        ) {

            await client.query(
                "ROLLBACK"
            );


            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Current OR number is not numeric.",
                },
                {
                    status: 400,
                }
            );

        }


        const nextOR =
            currentORNumber + 1;


        const endingOR =
            booklet.ending_or !==
                null &&
            booklet.ending_or !==
                undefined
                ? Number(
                    booklet.ending_or
                )
                : null;


        const bookletStatus =
            endingOR !== null &&
            nextOR > endingOR
                ? "CONSUMED"
                : "IN USE";


        await client.query(
            `
            UPDATE public.smi_booklet_registration

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
        ============================================================
        18. COMMIT
        ============================================================
        */

        await client.query(
            "COMMIT"
        );


        /*
        ============================================================
        19. DEBUG
        ============================================================
        */

        console.log(
            "=============================================="
        );

        console.log(
            "BARANGAY CTC-I TRANSACTION"
        );

        console.log(
            "JWT username:",
            decoded.username
        );

        console.log(
            "Barangay User ID:",
            verifiedBarangayUserId
        );

        console.log(
            "Barangay:",
            barangayName
        );

        console.log(
            "Barangay ID:",
            barangayId
        );

        console.log(
            "Barangay RAT ID:",
            barangayRatId
        );

        console.log(
            "OR Number:",
            currentOR
        );

        console.log(
            "Account ID:",
            BARANGAY_CTC_ACCOUNT_ID
        );

        console.log(
            "CTC Type:",
            ctcType
        );

        console.log(
            "Place Issued:",
            placeIssued
        );

        console.log(
            "Full Name:",
            full_name
        );

        console.log(
            "Transaction ID:",
            transaction.id
        );

        console.log(
            "=============================================="
        );


        /*
        ============================================================
        20. SUCCESS RESPONSE
        ============================================================
        */

        return NextResponse.json(
            {
                success: true,

                message:
                    "Barangay CTC-I transaction created successfully.",

                transaction: {

                    id:
                        transaction.id,

                    or_number:
                        transaction.or_number,

                    receipt_date:
                        transaction.receipt_date,

                    booklet_registration_id:
                        transaction.booklet_registration_id,

                    lor_release_id:
                        transaction.lor_release_id,

                    accountable_form_id:
                        transaction.accountable_form_id,

                    collector_id:
                        transaction.collector_id,

                    encoded_by:
                        transaction.encoded_by,

                    payor:
                        transaction.payor,

                    gender:
                        transaction.gender,

                    payment_mode:
                        transaction.payment_mode,

                    remarks:
                        transaction.remarks,

                    grand_total:
                        transaction.grand_total,

                    status:
                        transaction.status,

                    transaction_type:
                        transaction.transaction_type,
                },

                ctc_item: {

                    id:
                        ctcItem.id,

                    transaction_id:
                        ctcItem.transaction_id,

                    account_id:
                        ctcItem.account_id,

                    ctc_type:
                        ctcItem.ctc_type,

                    full_name:
                        ctcItem.full_name,

                    address:
                        ctcItem.address,

                    tin:
                        ctcItem.tin,

                    cr_number:
                        ctcItem.cr_number,

                    citizenship:
                        ctcItem.citizenship,

                    sex:
                        ctcItem.sex,

                    height:
                        ctcItem.height,

                    weight:
                        ctcItem.weight,

                    place_of_birth:
                        ctcItem.place_of_birth,

                    birth_date:
                        ctcItem.birth_date,

                    civil_status:
                        ctcItem.civil_status,

                    occupation:
                        ctcItem.occupation,

                    place_issued:
                        ctcItem.place_issued,

                    issue_date:
                        ctcItem.issue_date,

                    tax_mode:
                        ctcItem.tax_mode,

                    taxable_amount:
                        ctcItem.taxable_amount,

                    basic_tax:
                        ctcItem.basic_tax,

                    salary_tax:
                        ctcItem.salary_tax,

                    additional_tax:
                        ctcItem.additional_tax,

                    penalty:
                        ctcItem.penalty,

                    interest:
                        ctcItem.interest,

                    total_amount:
                        ctcItem.total_amount,
                },

                barangay: {

                    id:
                        barangayId,

                    name:
                        barangayName,

                    code:
                        barangayUser.barangay_code,

                    municipality:
                        barangayUser.municipality,

                    province:
                        barangayUser.province,
                },
            },
            {
                status: 201,
            }
        );


    }
    catch (error) {

        try {

            await client.query(
                "ROLLBACK"
            );

        }
        catch (rollbackError) {

            console.error(
                "Rollback failed:",
                rollbackError
            );

        }


        console.error(
            "Barangay CTC transaction error:",
            error
        );


        return NextResponse.json(
            {
                success: false,

                message:
                    "Failed to create Barangay CTC transaction.",

                error:
                    error instanceof Error
                        ? error.message
                        : "Unknown error",
            },
            {
                status: 500,
            }
        );

    }
    finally {

        client.release();

    }

}