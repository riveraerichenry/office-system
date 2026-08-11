import {
    NextRequest,
    NextResponse,
} from "next/server";

import jwt from "jsonwebtoken";

import { pool } from "@/lib/db";

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

        if (!fundSourceId) {

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

        if (!dateFrom) {

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

        if (!dateTo) {

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

        if (!token) {

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

        if (!jwtSecret) {

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

        let decoded: JwtPayload;

        try {

            decoded =
                jwt.verify(
                    token,
                    jwtSecret
                ) as JwtPayload;

        } catch (error) {

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

        if (!decoded?.id) {

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
        // VERIFY USER
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
                        "Fund source not found.",
                },
                {
                    status: 404,
                }
            );
        }

        const fundSource =
            fundResult.rows[0];

        // =====================================================
        // TRANSACTIONS
        //
        // Fund source:
        // dipp_transactions
        //      ↓
        // lor_releases
        //      ↓
        // fund_sources
        //
        // Form code:
        // dipp_transactions
        //      ↓
        // accountable_forms
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
                        dt.grand_total,

                        dt.payment_mode,

                        dt.accountable_form_id,

                        af.form_code,
                        af.form_name,

                        dt.booklet_registration_id,

                        dt.lor_release_id,

                        dt.collector_id,

                        dt.encoded_by,

                        dt.created_at

                    FROM dipp_transactions dt

                    INNER JOIN lor_releases lr
                        ON lr.id =
                            dt.lor_release_id

                    INNER JOIN accountable_forms af
                        ON af.id =
                            dt.accountable_form_id

                    WHERE
                        lr.fund_source_id = $1

                        AND dt.receipt_date >=
                            $2::date

                        AND dt.receipt_date <
                            (
                                $3::date
                                + INTERVAL '1 day'
                            )

                        AND dt.encoded_by = $4

                        AND COALESCE(
                            dt.is_remitted,
                            FALSE
                        ) = FALSE

                    ORDER BY
                        dt.receipt_date ASC,

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

                    receipt_number:
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

                    accountable_form_id:
                        row.accountable_form_id,

                    booklet_registration_id:
                        row.booklet_registration_id,

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
        // RESPONSE
        // =====================================================

        return NextResponse.json(
            {
                success: true,

                filters: {
                    fund_source_id:
                        fundSourceId,

                    date_from:
                        dateFrom,

                    date_to:
                        dateTo,
                },

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

                transactions,

                summary: {
                    transaction_count:
                        transactions.length,

                    total_amount:
                        totalAmount,
                },
            }
        );

    } catch (error: any) {

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