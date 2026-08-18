import {
    NextRequest,
    NextResponse,
} from "next/server";

import jwt from "jsonwebtoken";

import {
    pool,
} from "@/lib/db";


type JwtPayload = {
    id?: string;

    username?: string;

    full_name?: string;
};


export async function GET(
    request: NextRequest
) {

    try {

        // =====================================================
        // PARAMETERS
        // =====================================================

        const {
            searchParams,
        } = new URL(
            request.url
        );


        const fundSourceId =
            searchParams.get(
                "fund_source_id"
            );


        const dateFrom =
            searchParams.get(
                "date_from"
            );


        const dateTo =
            searchParams.get(
                "date_to"
            );


        // =====================================================
        // VALIDATION
        // =====================================================

        if (
            !fundSourceId
        ) {

            return NextResponse.json(
                {
                    success: false,

                    message:
                        "Fund source is required.",
                },
                {
                    status: 400,
                }
            );

        }


        if (
            !dateFrom
        ) {

            return NextResponse.json(
                {
                    success: false,

                    message:
                        "Beginning date is required.",
                },
                {
                    status: 400,
                }
            );

        }


        if (
            !dateTo
        ) {

            return NextResponse.json(
                {
                    success: false,

                    message:
                        "Ending date is required.",
                },
                {
                    status: 400,
                }
            );

        }


        if (
            dateFrom >
            dateTo
        ) {

            return NextResponse.json(
                {
                    success: false,

                    message:
                        "Beginning date cannot be later than ending date.",
                },
                {
                    status: 400,
                }
            );

        }


        // =====================================================
        // AUTHENTICATION
        // =====================================================

        const token =
            request.cookies.get(
                "token"
            )?.value;


        if (
            !token
        ) {

            return NextResponse.json(
                {
                    success: false,

                    message:
                        "Authentication required.",
                },
                {
                    status: 401,
                }
            );

        }


        const jwtSecret =
            process.env.JWT_SECRET;


        if (
            !jwtSecret
        ) {

            console.error(
                "JWT_SECRET is not configured."
            );


            return NextResponse.json(
                {
                    success: false,

                    message:
                        "Authentication configuration error.",
                },
                {
                    status: 500,
                }
            );

        }


        // =====================================================
        // VERIFY JWT
        // =====================================================

        let decoded:
            JwtPayload;


        try {

            decoded =
                jwt.verify(
                    token,
                    jwtSecret
                ) as JwtPayload;

        } catch (
            error
        ) {

            console.error(
                "RCD TRANSACTION JWT ERROR:",
                error
            );


            return NextResponse.json(
                {
                    success: false,

                    message:
                        "Invalid or expired session.",
                },
                {
                    status: 401,
                }
            );

        }


        if (
            !decoded?.id
        ) {

            return NextResponse.json(
                {
                    success: false,

                    message:
                        "Unable to determine logged-in user.",
                },
                {
                    status: 401,
                }
            );

        }


        // =====================================================
        // VERIFY LOGGED-IN USER
        // =====================================================

        const userResult =
            await pool.query(
                `
                SELECT

                    id,

                    username,

                    full_name

                FROM users

                WHERE id = $1

                LIMIT 1
                `,
                [
                    decoded.id,
                ]
            );


        if (
            userResult.rows.length === 0
        ) {

            return NextResponse.json(
                {
                    success: false,

                    message:
                        "Logged-in user was not found.",
                },
                {
                    status: 401,
                }
            );

        }


        const loggedInUser =
            userResult.rows[0];


        // =====================================================
        // VERIFY FUND SOURCE
        // =====================================================

        const fundResult =
            await pool.query(
                `
                SELECT

                    id,

                    fund_code,

                    fund_name,

                    acronym

                FROM fund_sources

                WHERE id = $1

                    AND is_active = TRUE

                LIMIT 1
                `,
                [
                    fundSourceId,
                ]
            );


        if (
            fundResult.rows.length === 0
        ) {

            return NextResponse.json(
                {
                    success: false,

                    message:
                        "Fund source not found or inactive.",
                },
                {
                    status: 404,
                }
            );

        }


        const fundSource =
            fundResult.rows[0];


        // =====================================================
        // GET ELIGIBLE TRANSACTIONS
        //
        // IMPORTANT:
        //
        // DO NOT FILTER:
        //
        //     dt.transaction_type = 'RPT'
        //
        // because accountable forms can have different
        // transaction types.
        //
        // Example:
        //
        // AF51 -> RPT
        // CTC-I -> CTC-I
        //
        // Both can belong in the RCD.
        // =====================================================

        const transactionResult =
            await pool.query(
                `
                SELECT

                    dt.id,

                    dt.or_number,

                    dt.receipt_date,

                    dt.payor,

                    dt.remarks,

                    dt.status,

                    COALESCE(
                        dt.grand_total,
                        0
                    ) AS grand_total,

                    dt.payment_mode,

                    dt.transaction_type,

                    dt.is_cancelled,

                    dt.is_remitted,

                    dt.remittance_id,

                    dt.accountable_form_id,

                    af.form_code,

                    af.form_name,

                    /*
                    =============================================
                    BOOKLET
                    =============================================
                    */

                    dt.booklet_registration_id,

                    sbr.beginning_or
                        AS booklet_beginning_or,

                    sbr.ending_or
                        AS booklet_ending_or,

                    sbr.current_or
                        AS booklet_current_or,

                    dt.lor_release_id,

                    dt.collector_id,

                    dt.encoded_by,

                    dt.created_at

                FROM dipp_transactions dt


                /*
                =================================================
                LOR RELEASE
                =================================================
                */

                INNER JOIN lor_releases lr

                    ON lr.id =
                        dt.lor_release_id


                /*
                =================================================
                ACCOUNTABLE FORM
                =================================================
                */

                LEFT JOIN accountable_forms af

                    ON af.id =
                        dt.accountable_form_id


                /*
                =================================================
                BOOKLET
                =================================================
                */

                LEFT JOIN smi_booklet_registration sbr

                    ON sbr.id =
                        dt.booklet_registration_id


                WHERE

                    /*
                    =============================================
                    FUND SOURCE
                    =============================================
                    */

                    lr.fund_source_id =
                        $1


                    /*
                    =============================================
                    DATE RANGE
                    =============================================
                    */

                    AND dt.receipt_date >=
                        $2::date


                    AND dt.receipt_date <
                        (
                            $3::date
                            + INTERVAL '1 day'
                        )


                    /*
                    =============================================
                    LOGGED-IN COLLECTOR
                    =============================================
                    */

                    AND dt.collector_id =
                        $4


                    /*
                    =============================================
                    IMPORTANT
                    =============================================

                    NO:

                        AND dt.transaction_type = 'RPT'

                    We intentionally allow all transaction
                    types because the accountable form determines
                    what belongs in the RCD.

                    =============================================
                    */


                    /*
                    =============================================
                    ISSUED ONLY
                    =============================================
                    */

                    AND dt.status =
                        'ISSUED'


                    /*
                    =============================================
                    NOT CANCELLED
                    =============================================
                    */

                    AND COALESCE(
                        dt.is_cancelled,
                        FALSE
                    ) = FALSE


                    /*
                    =============================================
                    NOT YET REMITTED
                    =============================================
                    */

                    AND COALESCE(
                        dt.is_remitted,
                        FALSE
                    ) = FALSE


                    /*
                    =============================================
                    NO REMITTANCE ID
                    =============================================
                    */

                    AND dt.remittance_id IS NULL


                ORDER BY

                    /*
                    =============================================
                    FORM FIRST
                    =============================================
                    */

                    af.form_code ASC,


                    /*
                    =============================================
                    DATE
                    =============================================
                    */

                    dt.receipt_date ASC,


                    /*
                    =============================================
                    NUMERIC OR ORDER
                    =============================================
                    */

                    CASE

                        WHEN
                            NULLIF(
                                TRIM(
                                    dt.or_number
                                ),
                                ''
                            ) ~ '^[0-9]+$'

                        THEN

                            NULLIF(
                                TRIM(
                                    dt.or_number
                                ),
                                ''
                            )::BIGINT

                        ELSE
                            NULL

                    END ASC,


                    dt.or_number ASC
                `,
                [

                    fundSourceId,

                    dateFrom,

                    dateTo,

                    decoded.id,

                ]
            );


        // =====================================================
        // FORMAT TRANSACTIONS
        // =====================================================

        const transactions =
            transactionResult.rows.map(
                (
                    row
                ) => ({

                    id:
                        row.id,


                    or_number:
                        row.or_number,


                    receipt_date:
                        row.receipt_date,


                    payor:
                        row.payor,


                    remarks:
                        row.remarks,


                    form_code:
                        row.form_code,


                    form_name:
                        row.form_name,


                    status:
                        row.status,


                    amount:
                        Number(
                            row.grand_total ??
                                0
                        ),


                    payment_mode:
                        row.payment_mode,


                    transaction_type:
                        row.transaction_type,


                    is_cancelled:
                        row.is_cancelled,


                    is_remitted:
                        row.is_remitted,


                    remittance_id:
                        row.remittance_id,


                    accountable_form_id:
                        row.accountable_form_id,


                    // =========================================
                    // BOOKLET
                    // =========================================

                    booklet_registration_id:
                        row.booklet_registration_id,


                    booklet_beginning_or:
                        row.booklet_beginning_or,


                    booklet_ending_or:
                        row.booklet_ending_or,


                    booklet_current_or:
                        row.booklet_current_or,


                    lor_release_id:
                        row.lor_release_id,


                    collector_id:
                        row.collector_id,


                    encoded_by:
                        row.encoded_by,


                    created_at:
                        row.created_at,

                })
            );


        // =====================================================
        // TOTAL
        // =====================================================

        const totalAmount =
            transactions.reduce(
                (
                    total,
                    transaction
                ) =>

                    total +

                    Number(
                        transaction.amount ??
                            0
                    ),

                0
            );


        // =====================================================
        // FORM SUMMARY
        //
        // This lets us verify that AF51, CTC-I, etc. are all
        // actually being returned.
        // =====================================================

        const formSummaryMap =
            new Map<
                string,
                {
                    form_code: string;

                    form_name:
                        | string
                        | null;

                    transaction_count: number;

                    total_amount: number;
                }
            >();


        for (
            const transaction
            of transactions
        ) {

            const formCode =
                String(
                    transaction.form_code ??
                        "—"
                ).trim();


            const existing =
                formSummaryMap.get(
                    formCode
                );


            if (
                existing
            ) {

                existing.transaction_count +=
                    1;


                existing.total_amount +=
                    Number(
                        transaction.amount ??
                            0
                    );

            } else {

                formSummaryMap.set(
                    formCode,
                    {

                        form_code:
                            formCode,

                        form_name:
                            transaction.form_name ??
                            null,

                        transaction_count:
                            1,

                        total_amount:
                            Number(
                                transaction.amount ??
                                    0
                            ),

                    }
                );

            }

        }


        const formSummary =
            Array.from(
                formSummaryMap.values()
            );


        // =====================================================
        // DEBUG
        // =====================================================

        console.log(
            "RCD TRANSACTIONS",

            {

                fundSourceId,

                dateFrom,

                dateTo,

                collectorId:
                    loggedInUser.id,

                transactionCount:
                    transactions.length,

                formSummary,

                forms:
                    transactions.map(
                        transaction => ({

                            form_code:
                                transaction.form_code,

                            form_name:
                                transaction.form_name,

                            or_number:
                                transaction.or_number,

                            transaction_type:
                                transaction.transaction_type,

                            booklet_registration_id:
                                transaction
                                    .booklet_registration_id,

                            booklet_beginning_or:
                                transaction
                                    .booklet_beginning_or,

                            booklet_ending_or:
                                transaction
                                    .booklet_ending_or,

                            booklet_current_or:
                                transaction
                                    .booklet_current_or,

                        })
                    ),

            }
        );


        // =====================================================
        // RESPONSE
        // =====================================================

        return NextResponse.json(
            {

                success: true,


                // =================================================
                // FILTERS
                // =================================================

                filters: {

                    fund_source_id:
                        fundSourceId,

                    date_from:
                        dateFrom,

                    date_to:
                        dateTo,

                    collector_id:
                        loggedInUser.id,

                },


                // =================================================
                // COLLECTOR
                // =================================================

                collector: {

                    id:
                        loggedInUser.id,

                    username:
                        loggedInUser.username,

                    full_name:
                        loggedInUser.full_name,

                },


                // =================================================
                // FUND SOURCE
                // =================================================

                fund_source: {

                    id:
                        fundSource.id,

                    fund_code:
                        fundSource.fund_code,

                    fund_name:
                        fundSource.fund_name,

                    acronym:
                        fundSource.acronym,

                },


                // =================================================
                // TRANSACTIONS
                // =================================================

                transactions,


                // =================================================
                // FORM SUMMARY
                // =================================================

                form_summary:
                    formSummary,


                // =================================================
                // SUMMARY
                // =================================================

                summary: {

                    transaction_count:
                        transactions.length,

                    total_amount:
                        totalAmount,

                },

            }
        );


    } catch (
        error: any
    ) {

        console.error(
            "RCD TRANSACTIONS API ERROR:",
            error
        );


        return NextResponse.json(
            {

                success: false,

                message:
                    error?.message ??
                    "Unable to load RCD transactions.",

            },
            {

                status: 500,

            }
        );

    }

}