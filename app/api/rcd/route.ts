import { NextRequest, NextResponse } from "next/server";
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

        const { searchParams } =
            new URL(request.url);

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

        if (dateFrom > dateTo) {
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
                "RCD JWT ERROR:",
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
        // LOGGED-IN USER
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
        // FUND SOURCE
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
        // A. COLLECTIONS
        //
        // Only actual DIPP transactions.
        //
        // Fund source:
        // lor_releases.fund_source_id
        //
        // Date:
        // dipp_transactions.receipt_date
        // =====================================================

        const collectionsResult =
            await pool.query(
                `
                SELECT
                    dt.booklet_registration_id,

                    sbr.control_no,
                    sbr.fiscal_year,
                    sbr.series,

                    af.id AS accountable_form_id,
                    af.form_code,
                    af.form_name,

                    MIN(
                        NULLIF(
                            TRIM(
                                dt.or_number
                            ),
                            ''
                        )::BIGINT
                    ) AS from_or,

                    MAX(
                        NULLIF(
                            TRIM(
                                dt.or_number
                            ),
                            ''
                        )::BIGINT
                    ) AS to_or,

                    COUNT(
                        DISTINCT dt.or_number
                    ) AS used_count,

                    COUNT(
                        dt.id
                    ) AS transaction_count,

                    COALESCE(
                        SUM(
                            COALESCE(
                                dt.grand_total,
                                0
                            )
                        ),
                        0
                    ) AS collection_amount

                FROM dipp_transactions dt

                INNER JOIN lor_releases lr
                    ON lr.id =
                        dt.lor_release_id

                INNER JOIN smi_booklet_registration sbr
                    ON sbr.id =
                        dt.booklet_registration_id

                INNER JOIN accountable_forms af
                    ON af.id =
                        dt.accountable_form_id

                WHERE
                    lr.fund_source_id =
                        $1

                    AND lr.accountable_officer_id =
                        $2

                    AND lr.is_active =
                        TRUE

                    AND dt.booklet_registration_id
                        IS NOT NULL

                    AND dt.receipt_date >=
                        $3::date

                    AND dt.receipt_date <
                        (
                            $4::date
                            + INTERVAL '1 day'
                        )

                    AND COALESCE(
                        dt.is_cancelled,
                        FALSE
                    ) = FALSE

                    AND dt.or_number
                        IS NOT NULL

                    AND TRIM(
                        dt.or_number
                    ) <> ''

                GROUP BY
                    dt.booklet_registration_id,

                    sbr.control_no,
                    sbr.fiscal_year,
                    sbr.series,

                    af.id,
                    af.form_code,
                    af.form_name

                ORDER BY
                    af.form_code ASC,

                    MIN(
                        NULLIF(
                            TRIM(
                                dt.or_number
                            ),
                            ''
                        )::BIGINT
                    ) ASC
                `,
                [
                    fundSourceId,
                    loggedInUser.id,
                    dateFrom,
                    dateTo,
                ]
            );

        // =====================================================
        // FORMAT COLLECTIONS
        // =====================================================

        const collections =
            collectionsResult.rows.map(
                (
                    row: any
                ) => ({
                    booklet_registration_id:
                        row.booklet_registration_id,

                    control_no:
                        row.control_no,

                    fiscal_year:
                        row.fiscal_year,

                    series:
                        row.series,

                    accountable_form_id:
                        row.accountable_form_id,

                    form_code:
                        row.form_code,

                    form_name:
                        row.form_name,

                    from_or:
                        row.from_or !== null
                            ? Number(
                                row.from_or
                            )
                            : null,

                    to_or:
                        row.to_or !== null
                            ? Number(
                                row.to_or
                            )
                            : null,

                    used_count:
                        Number(
                            row.used_count ??
                            0
                        ),

                    transaction_count:
                        Number(
                            row.transaction_count ??
                            0
                        ),

                    collection_amount:
                        Number(
                            row.collection_amount ??
                            0
                        ),
                })
            );

        // =====================================================
        // TOTAL COLLECTIONS
        // =====================================================

        const totalCollections =
            collections.reduce(
                (
                    total: number,
                    item: any
                ) =>
                    total +
                    Number(
                        item.collection_amount ??
                        0
                    ),
                0
            );

        const totalUsedORs =
            collections.reduce(
                (
                    total: number,
                    item: any
                ) =>
                    total +
                    Number(
                        item.used_count ??
                        0
                    ),
                0
            );

        // =====================================================
        // C. ACCOUNTABILITY FOR ACCOUNTABLE FORMS
        //
        // IMPORTANT:
        //
        // Start from dipp_transactions.
        //
        // Therefore:
        //
        // NO TRANSACTION
        //      =
        // UNUSED FORM
        //      =
        // NOT INCLUDED
        //
        // Only forms with actual used ORs appear.
        // =====================================================

        const formsResult =
            await pool.query(
                `
                SELECT
                    sbr.id AS booklet_registration_id,

                    lr.id AS lor_id,
                    lr.lor_no,

                    lr.fund_source_id,
                    lr.accountable_form_id,

                    af.form_code,
                    af.form_name,

                    sbr.control_no,
                    sbr.fiscal_year,
                    sbr.series,

                    sbr.beginning_or,
                    sbr.ending_or,
                    sbr.receipt_count,

                    MIN(
                        NULLIF(
                            TRIM(
                                dt.or_number
                            ),
                            ''
                        )::BIGINT
                    ) AS issued_beginning_or,

                    MAX(
                        NULLIF(
                            TRIM(
                                dt.or_number
                            ),
                            ''
                        )::BIGINT
                    ) AS issued_ending_or,

                    COUNT(
                        DISTINCT dt.or_number
                    ) AS issued_count,

                    COALESCE(
                        SUM(
                            COALESCE(
                                dt.grand_total,
                                0
                            )
                        ),
                        0
                    ) AS collection_total

                FROM dipp_transactions dt

                INNER JOIN lor_releases lr
                    ON lr.id =
                        dt.lor_release_id

                INNER JOIN smi_booklet_registration sbr
                    ON sbr.id =
                        dt.booklet_registration_id

                INNER JOIN accountable_forms af
                    ON af.id =
                        dt.accountable_form_id

                WHERE
                    lr.fund_source_id =
                        $1

                    AND lr.accountable_officer_id =
                        $2

                    AND lr.is_active =
                        TRUE

                    AND dt.booklet_registration_id
                        IS NOT NULL

                    AND dt.receipt_date >=
                        $3::date

                    AND dt.receipt_date <
                        (
                            $4::date
                            + INTERVAL '1 day'
                        )

                    AND COALESCE(
                        dt.is_cancelled,
                        FALSE
                    ) = FALSE

                    AND dt.or_number
                        IS NOT NULL

                    AND TRIM(
                        dt.or_number
                    ) <> ''

                GROUP BY
                    sbr.id,

                    lr.id,
                    lr.lor_no,

                    lr.fund_source_id,
                    lr.accountable_form_id,

                    af.form_code,
                    af.form_name,

                    sbr.control_no,
                    sbr.fiscal_year,
                    sbr.series,

                    sbr.beginning_or,
                    sbr.ending_or,
                    sbr.receipt_count

                ORDER BY
                    af.form_code ASC,
                    sbr.beginning_or ASC
                `,
                [
                    fundSourceId,
                    loggedInUser.id,
                    dateFrom,
                    dateTo,
                ]
            );

        // =====================================================
        // GROUP TABLE C BY ACCOUNTABLE FORM
        // =====================================================

        const formsMap =
            new Map<string, any>();

        for (
            const row of
                formsResult.rows
        ) {

            const formId =
                row.accountable_form_id;

            if (
                !formsMap.has(
                    formId
                )
            ) {

                formsMap.set(
                    formId,
                    {
                        accountable_form_id:
                            formId,

                        form_code:
                            row.form_code,

                        form_name:
                            row.form_name,

                        booklets: [],

                        booklet_count:
                            0,

                        beginning_or:
                            null,

                        ending_or:
                            null,

                        receipt_count:
                            0,

                        issued_count:
                            0,

                        ending_balance_count:
                            0,

                        collection_total:
                            0,
                    }
                );
            }

            const form =
                formsMap.get(
                    formId
                );

            const beginningOR =
                row.beginning_or !== null
                    ? Number(
                        row.beginning_or
                    )
                    : null;

            const endingOR =
                row.ending_or !== null
                    ? Number(
                        row.ending_or
                    )
                    : null;

            const receiptCount =
                Number(
                    row.receipt_count ??
                    0
                );

            const issuedCount =
                Number(
                    row.issued_count ??
                    0
                );

            const issuedFrom =
                row.issued_beginning_or !==
                null
                    ? Number(
                        row.issued_beginning_or
                    )
                    : null;

            const issuedTo =
                row.issued_ending_or !==
                null
                    ? Number(
                        row.issued_ending_or
                    )
                    : null;

            // =================================================
            // ENDING BALANCE
            //
            // Remaining ORs after the last used OR.
            //
            // Example:
            //
            // Booklet:
            // 10001 - 10050
            //
            // Used:
            // 10001 - 10005
            //
            // Remaining:
            // 10006 - 10050
            // =================================================

            const endingBalanceFrom =
                issuedTo !== null
                    ? issuedTo + 1
                    : beginningOR;

            const endingBalanceTo =
                endingOR;

            const endingBalanceCount =
                endingBalanceFrom !== null &&
                endingBalanceTo !== null &&
                endingBalanceTo >=
                    endingBalanceFrom
                    ? endingBalanceTo -
                      endingBalanceFrom +
                      1
                    : 0;

            const booklet = {

                booklet_registration_id:
                    row.booklet_registration_id,

                lor_id:
                    row.lor_id,

                lor_no:
                    row.lor_no,

                fund_source_id:
                    row.fund_source_id,

                accountable_form_id:
                    formId,

                form_code:
                    row.form_code,

                form_name:
                    row.form_name,

                control_no:
                    row.control_no,

                fiscal_year:
                    row.fiscal_year,

                series:
                    row.series,

                beginning_or:
                    beginningOR,

                ending_or:
                    endingOR,

                receipt_count:
                    receiptCount,

                issued_count:
                    issuedCount,

                issued_beginning_or:
                    issuedFrom,

                issued_ending_or:
                    issuedTo,

                ending_balance_count:
                    endingBalanceCount,

                ending_balance_beginning_or:
                    endingBalanceFrom,

                ending_balance_ending_or:
                    endingBalanceTo,

                collection_total:
                    Number(
                        row.collection_total ??
                        0
                    ),
            };

            form.booklets.push(
                booklet
            );

            form.booklet_count =
                form.booklets.length;

            form.receipt_count +=
                receiptCount;

            form.issued_count +=
                issuedCount;

            form.ending_balance_count +=
                endingBalanceCount;

            form.collection_total +=
                Number(
                    row.collection_total ??
                    0
                );

            // =================================================
            // FORM BEGINNING RANGE
            // =================================================

            if (
                form.beginning_or ===
                    null ||
                (
                    beginningOR !==
                        null &&
                    beginningOR <
                        form.beginning_or
                )
            ) {
                form.beginning_or =
                    beginningOR;
            }

            // =================================================
            // FORM ENDING RANGE
            // =================================================

            if (
                form.ending_or ===
                    null ||
                (
                    endingOR !==
                        null &&
                    endingOR >
                        form.ending_or
                )
            ) {
                form.ending_or =
                    endingOR;
            }
        }

        // =====================================================
        // ONLY USED FORMS
        //
        // Since formsResult starts from dipp_transactions,
        // this already excludes unused forms.
        //
        // The extra filter guarantees that no empty form
        // reaches the printable.
        // =====================================================

        const forms =
            Array.from(
                formsMap.values()
            ).filter(
                (
                    form: any
                ) =>
                    form.booklets.length >
                    0 &&
                    form.issued_count >
                    0
            );

        // =====================================================
        // RESPONSE
        // =====================================================

        return NextResponse.json({

            success: true,

            // =================================================
            // LOGGED-IN USER
            // =================================================

            user: {
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
            // FILTERS
            // =================================================

            filters: {
                fund_source_id:
                    fundSourceId,

                date_from:
                    dateFrom,

                date_to:
                    dateTo,
            },

            // =================================================
            // A. COLLECTIONS
            // =================================================

            collections,

            // =================================================
            // C. ACCOUNTABILITY
            // =================================================

            forms,

            // =================================================
            // B.
            //
            // Keep your existing remittance/deposit query
            // here if you already have one.
            // =================================================

            remittances: [],

            deposits: [],

            // =================================================
            // SUMMARY
            // =================================================

            summary: {

                total_collections:
                    totalCollections,

                total_used_ors:
                    totalUsedORs,

                total_booklets:
                    forms.reduce(
                        (
                            total: number,
                            form: any
                        ) =>
                            total +
                            Number(
                                form.booklet_count ??
                                0
                            ),
                        0
                    ),

                total_remittances:
                    0,

                total_deposits:
                    0,

                balance:
                    totalCollections,
            },
        });

    } catch (
        error: any
    ) {

        console.error(
            "RCD API ERROR:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    error?.message ??
                    "Unable to generate RCD.",
            },
            {
                status: 500,
            }
        );
    }
}