import {
    NextRequest,
    NextResponse,
} from "next/server";

import jwt from "jsonwebtoken";

import {
    pool,
} from "@/lib/db";

import {
    randomUUID,
} from "crypto";


// =============================================================
// JWT PAYLOAD
// =============================================================

type JwtPayload = {
    id?: string;

    username?: string;

    full_name?: string;
};


// =============================================================
// PREVIOUS FORM ROW
// =============================================================

type PreviousFormRow = {

    formCode: string;

    beginningFrom:
        | string
        | null;

    beginningTo:
        | string
        | null;

    endingFrom:
        | string
        | null;

    endingTo:
        | string
        | null;

};


// =============================================================
// POST
// =============================================================

export async function POST(
    request: NextRequest
) {

    const client =
        await pool.connect();


    try {

        // =====================================================
        // REQUEST BODY
        // =====================================================

        const body =
            await request.json();


        const {
            fund_source_id,
            date_from,
            date_to,
        } = body;


        // =====================================================
        // VALIDATION
        // =====================================================

        if (
            !fund_source_id
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
            !date_from ||
            !date_to
        ) {

            return NextResponse.json(
                {
                    success: false,

                    message:
                        "Date range is required.",
                },
                {
                    status: 400,
                }
            );

        }


        if (
            date_from >
            date_to
        ) {

            return NextResponse.json(
                {
                    success: false,

                    message:
                        "Date From cannot be later than Date To.",
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
            await client.query(
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

        const fundSourceResult =
            await client.query(
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
                    fund_source_id,
                ]
            );


        if (
            fundSourceResult.rows.length === 0
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
            fundSourceResult.rows[0];


        // =====================================================
        // BEGIN DATABASE TRANSACTION
        // =====================================================

        await client.query(
            "BEGIN"
        );


        // =====================================================
        // LOCK RCD NUMBER GENERATION
        // =====================================================

        await client.query(
            `
            SELECT pg_advisory_xact_lock(
                hashtext(
                    'RCD_REPORT_NUMBER_GENERATION'
                )
            )
            `
        );


        // =====================================================
        // GET ELIGIBLE DIPP TRANSACTIONS
        //
        // NO transaction_type = 'RPT' FILTER.
        //
        // AF51 can be RPT.
        // CTC-I can be CTC-I.
        // Both are valid accountable forms.
        // =====================================================

        const transactionsResult =
            await client.query(
                `
                SELECT

                    dt.id,

                    dt.or_number,

                    dt.receipt_date,

                    dt.collector_id,

                    dt.payor,

                    dt.payment_mode,

                    dt.remarks,

                    COALESCE(
                        dt.grand_total,
                        0
                    ) AS amount,

                    dt.accountable_form_id,

                    dt.booklet_registration_id,


                    /*
                    =================================================
                    BOOKLET
                    =================================================
                    */

                    sbr.beginning_or
                        AS booklet_beginning_or,

                    sbr.ending_or
                        AS booklet_ending_or,

                    sbr.current_or
                        AS booklet_current_or,


                    dt.lor_release_id,

                    dt.encoded_by,

                    dt.status,

                    dt.transaction_type,

                    dt.is_cancelled,

                    dt.is_remitted,

                    dt.remittance_id,


                    /*
                    =================================================
                    ACCOUNTABLE FORM
                    =================================================
                    */

                    af.form_code,

                    af.form_name

                FROM dipp_transactions dt


                /*
                =====================================================
                LOR RELEASE
                =====================================================
                */

                INNER JOIN lor_releases lr

                    ON lr.id =
                        dt.lor_release_id


                /*
                =====================================================
                ACCOUNTABLE FORM
                =====================================================
                */

                LEFT JOIN accountable_forms af

                    ON af.id =
                        dt.accountable_form_id


                /*
                =====================================================
                BOOKLET
                =====================================================
                */

                LEFT JOIN smi_booklet_registration sbr

                    ON sbr.id =
                        dt.booklet_registration_id


                WHERE


                    /*
                    =================================================
                    FUND SOURCE
                    =================================================
                    */

                    lr.fund_source_id =
                        $1


                    /*
                    =================================================
                    DATE FROM
                    =================================================
                    */

                    AND dt.receipt_date >=
                        $2::date


                    /*
                    =================================================
                    DATE TO
                    =================================================
                    */

                    AND dt.receipt_date <
                        (
                            $3::date
                            + INTERVAL '1 day'
                        )


                    /*
                    =================================================
                    LOGGED-IN USER
                    =================================================
                    */

                    AND dt.encoded_by =
                        $4


                    /*
                    =================================================
                    ISSUED ONLY
                    =================================================
                    */

                    AND dt.status =
                        'ISSUED'


                    /*
                    =================================================
                    NOT CANCELLED
                    =================================================
                    */

                    AND COALESCE(
                        dt.is_cancelled,
                        FALSE
                    ) = FALSE


                    /*
                    =================================================
                    NOT REMITTED
                    =================================================
                    */

                    AND COALESCE(
                        dt.is_remitted,
                        FALSE
                    ) = FALSE


                    /*
                    =================================================
                    NO REMITTANCE ID
                    =================================================
                    */

                    AND dt.remittance_id IS NULL


                    /*
                    =================================================
                    NOT ALREADY IN RCD
                    =================================================
                    */

                    AND NOT EXISTS (

                        SELECT 1

                        FROM rcd_items ri

                        WHERE
                            ri.dipp_transaction_id =
                                dt.id

                    )


                ORDER BY

                    af.form_code ASC,

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
                    fund_source_id,

                    date_from,

                    date_to,

                    loggedInUser.id,
                ]
            );


        const transactions =
            transactionsResult.rows;


        // =====================================================
        // NO TRANSACTIONS
        // =====================================================

        if (
            transactions.length === 0
        ) {

            await client.query(
                "ROLLBACK"
            );


            return NextResponse.json(
                {
                    success: false,

                    message:
                        "No eligible DIPP transactions were found for the selected fund source, date range, and logged-in user.",
                },
                {
                    status: 404,
                }
            );

        }


        // =====================================================
        // TOTAL COLLECTIONS
        // =====================================================

        const totalCollections =
            transactions.reduce(
                (
                    total: number,

                    transaction: any
                ) => {

                    return (

                        total +

                        Number(
                            transaction.amount ??
                                0
                        )

                    );

                },
                0
            );


        // =====================================================
        // BUILD ACCOUNTABILITY DATA
        // =====================================================

        const previousFormRows:
            PreviousFormRow[] = [];


        const formGroups =
            new Map<
                string,
                any[]
            >();


        // =====================================================
        // GROUP TRANSACTIONS BY FORM
        // =====================================================

        for (
            const transaction
            of transactions
        ) {

            const formCode =
                String(
                    transaction.form_code ??
                        "—"
                ).trim();


            if (
                !formGroups.has(
                    formCode
                )
            ) {

                formGroups.set(
                    formCode,
                    []
                );

            }


            formGroups
                .get(
                    formCode
                )!
                .push(
                    transaction
                );

        }


        // =====================================================
        // BUILD ACCOUNTABILITY ROWS
        // =====================================================

        for (
            const [
                formCode,
                groupTransactions,
            ]
            of formGroups.entries()
        ) {

            // =================================================
            // CURRENT RCD ORs
            // =================================================

            const serials =
                groupTransactions
                    .map(
                        transaction =>
                            String(
                                transaction.or_number ??
                                    ""
                            ).trim()
                    )
                    .filter(
                        value =>
                            value !== ""
                    );


            const numericSerials =
                serials
                    .map(
                        value =>
                            Number(
                                value
                            )
                    )
                    .filter(
                        value =>
                            !Number.isNaN(
                                value
                            )
                    );


            if (
                numericSerials.length === 0
            ) {

                previousFormRows.push({

                    formCode,

                    beginningFrom:
                        null,

                    beginningTo:
                        null,

                    endingFrom:
                        null,

                    endingTo:
                        null,

                });


                continue;

            }


            // =================================================
            // FIRST OR
            // =================================================

            const currentMin =
                Math.min(
                    ...numericSerials
                );


            // =================================================
            // LAST OR
            // =================================================

            const currentMax =
                Math.max(
                    ...numericSerials
                );


            // =================================================
            // FIND BOOKLET
            // =================================================

            const bookletTransaction =
                groupTransactions.find(
                    transaction =>

                        transaction
                            .booklet_ending_or !==
                            null &&

                        transaction
                            .booklet_ending_or !==
                            undefined &&

                        String(
                            transaction
                                .booklet_ending_or
                        ).trim() !== ""

                ) ??
                groupTransactions[0];


            // =================================================
            // BOOKLET ENDING OR
            // =================================================

            const bookletEndingRaw =
                bookletTransaction
                    ?.booklet_ending_or;


            const bookletEnding =
                bookletEndingRaw !==
                    null &&

                bookletEndingRaw !==
                    undefined &&

                String(
                    bookletEndingRaw
                ).trim() !== ""

                    ? Number(
                        bookletEndingRaw
                    )

                    : null;


            // =================================================
            // SERIAL WIDTH
            // =================================================

            const firstSerialString =
                serials[0] ??
                String(
                    currentMin
                );


            const endingSerialString =
                bookletEndingRaw !==
                    null &&
                bookletEndingRaw !==
                    undefined

                    ? String(
                        bookletEndingRaw
                    )

                    : "";


            const serialWidth =
                Math.max(

                    firstSerialString.length,

                    endingSerialString.length

                );


            // =================================================
            // BEGINNING BALANCE
            //
            // Example:
            //
            // Current RCD starts at 103
            // Booklet ends at 150
            //
            // Beginning:
            //
            // 103 - 150
            // =================================================

            const beginningFrom =
                String(
                    currentMin
                ).padStart(
                    serialWidth,
                    "0"
                );


            const beginningTo =
                bookletEnding !== null

                    ? String(
                        bookletEnding
                    ).padStart(
                        serialWidth,
                        "0"
                    )

                    : null;


            // =================================================
            // ENDING BALANCE
            //
            // Example:
            //
            // Issued: 103
            //
            // Ending:
            //
            // 104 - 150
            // =================================================

            let endingFrom:
                string | null =
                null;


            let endingTo:
                string | null =
                null;


            if (
                bookletEnding !== null &&

                currentMax <
                    bookletEnding
            ) {

                endingFrom =
                    String(
                        currentMax + 1
                    ).padStart(
                        serialWidth,
                        "0"
                    );


                endingTo =
                    String(
                        bookletEnding
                    ).padStart(
                        serialWidth,
                        "0"
                    );

            }


            // =================================================
            // DEBUG
            // =================================================

            console.log(
                "RCD BOOKLET ACCOUNTABILITY",
                {

                    formCode,

                    transactionCount:
                        groupTransactions.length,

                    bookletId:
                        bookletTransaction
                            ?.booklet_registration_id,

                    bookletBeginningOR:
                        bookletTransaction
                            ?.booklet_beginning_or,

                    bookletEndingOR:
                        bookletEnding,

                    bookletCurrentOR:
                        bookletTransaction
                            ?.booklet_current_or,

                    currentRCDFirstOR:
                        currentMin,

                    currentRCDLastOR:
                        currentMax,

                    beginningFrom,

                    beginningTo,

                    endingFrom,

                    endingTo,

                }
            );


            // =================================================
            // SAVE
            // =================================================

            previousFormRows.push({

                formCode,

                beginningFrom,

                beginningTo,

                endingFrom,

                endingTo,

            });

        }


        // =====================================================
        // DEBUG
        // =====================================================

        console.log(
            "RCD PREVIOUS FORM ROWS",
            previousFormRows
        );


        // =====================================================
        // REPORT NUMBER
        //
        // FORMAT:
        //
        // YYMMDDNNNNN-ACRONYM
        //
        // Example:
        //
        // 26081700001-GF
        //
        // Instead of:
        //
        // 26081700001-RPT
        // =====================================================

        const reportDate =
            new Date();


        const yy =
            String(
                reportDate.getFullYear()
            ).slice(-2);


        const mm =
            String(
                reportDate.getMonth() + 1
            ).padStart(
                2,
                "0"
            );


        const dd =
            String(
                reportDate.getDate()
            ).padStart(
                2,
                "0"
            );


        const datePrefix =
            `${yy}${mm}${dd}`;


        // =====================================================
        // GET NEXT DAILY SEQUENCE
        // =====================================================

        const sequenceResult =
            await client.query(
                `
                SELECT

                    COUNT(*) + 1
                        AS sequence

                FROM rcd_transaction

                WHERE report_date =
                    CURRENT_DATE
                `
            );


        const sequence =
            String(
                sequenceResult
                    .rows[0]
                    .sequence
            ).padStart(
                5,
                "0"
            );


        // =====================================================
        // FUND SOURCE ACRONYM
        // =====================================================

        const fundSourceAcronym =
            String(
                fundSource.acronym ??
                    ""
            )
                .trim()
                .toUpperCase();


        // =====================================================
        // FALLBACK
        //
        // If the selected fund source has no acronym,
        // use RPT so the report number is never malformed.
        // =====================================================

        const reportSuffix =
            fundSourceAcronym ||
            "RPT";


        // =====================================================
        // FINAL REPORT NUMBER
        // =====================================================

        const reportNo =
            `${datePrefix}${sequence}-${reportSuffix}`;


        console.log(
            "RCD REPORT NUMBER",
            {

                reportNo,

                datePrefix,

                sequence,

                fundSourceAcronym,

            }
        );


        // =====================================================
        // CREATE RCD
        // =====================================================

        const rcdId =
            randomUUID();


        const rcdResult =
            await client.query(
                `
                INSERT INTO rcd_transaction (

                    id,

                    report_no,

                    report_date,

                    fund_source_id,

                    date_from,

                    date_to,

                    total_collections,

                    total_remittances,

                    total_deposits,

                    balance,

                    status,

                    rcd_by,

                    created_at,

                    updated_at

                )

                VALUES (

                    $1,

                    $2,

                    CURRENT_DATE,

                    $3,

                    $4,

                    $5,

                    $6,

                    0,

                    0,

                    $6,

                    'DRAFT',

                    $7,

                    CURRENT_TIMESTAMP,

                    CURRENT_TIMESTAMP

                )

                RETURNING *
                `,
                [

                    rcdId,

                    reportNo,

                    fund_source_id,

                    date_from,

                    date_to,

                    totalCollections,

                    loggedInUser.id,

                ]
            );


        const rcd =
            rcdResult.rows[0];


        // =====================================================
        // INSERT ALL RCD ITEMS
        // =====================================================

        for (
            const transaction
            of transactions
        ) {

            await client.query(
                `
                INSERT INTO rcd_items (

                    id,

                    rcd_transaction_id,

                    dipp_transaction_id,

                    or_number,

                    receipt_date,

                    collector_id,

                    payor,

                    payment_mode,

                    amount,

                    created_at

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

                    CURRENT_TIMESTAMP

                )
                `,
                [

                    randomUUID(),

                    rcdId,

                    transaction.id,

                    transaction.or_number,

                    transaction.receipt_date,

                    transaction.collector_id,

                    transaction.payor,

                    transaction.payment_mode,

                    transaction.amount,

                ]
            );

        }


        // =====================================================
        // MARK TRANSACTIONS AS REMITTED
        // =====================================================

        const transactionIds =
            transactions.map(
                (
                    transaction: any
                ) =>
                    transaction.id
            );


        await client.query(
            `
            UPDATE dipp_transactions

            SET

                is_remitted =
                    TRUE,

                remittance_id =
                    $1,

                updated_at =
                    CURRENT_TIMESTAMP

            WHERE

                id =
                    ANY(
                        $2::uuid[]
                    )
            `,
            [

                rcdId,

                transactionIds,

            ]
        );


        // =====================================================
        // COMMIT
        // =====================================================

        await client.query(
            "COMMIT"
        );


        // =====================================================
        // FORMAT RCD
        // =====================================================

        const formattedRCD = {

            ...rcd,

            total_collections:
                Number(
                    rcd.total_collections ??
                        0
                ),

            total_remittances:
                Number(
                    rcd.total_remittances ??
                        0
                ),

            total_deposits:
                Number(
                    rcd.total_deposits ??
                        0
                ),

            balance:
                Number(
                    rcd.balance ??
                        0
                ),

        };


        // =====================================================
        // FORMAT ITEMS FOR PREVIEW
        // =====================================================

        const formattedItems =
            transactions.map(
                (
                    transaction: any
                ) => {

                    return {

                        id:
                            transaction.id,

                        dipp_transaction_id:
                            transaction.id,

                        or_number:
                            transaction.or_number,

                        receipt_date:
                            transaction.receipt_date,

                        collector_id:
                            transaction.collector_id,

                        payor:
                            transaction.payor,

                        payment_mode:
                            transaction.payment_mode,

                        amount:
                            Number(
                                transaction.amount ??
                                    0
                            ),

                        form_code:
                            transaction.form_code,

                        form_name:
                            transaction.form_name,


                        // =====================================
                        // BOOKLET
                        // =====================================

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

                    };

                }
            );


        // =====================================================
        // RESPONSE
        // =====================================================

        return NextResponse.json(
            {

                success: true,

                message:
                    "RCD generated successfully.",


                // =================================================
                // RCD
                // =================================================

                rcd:
                    formattedRCD,


                // =================================================
                // ITEMS
                // =================================================

                items:
                    formattedItems,


                // =================================================
                // ACCOUNTABILITY
                // =================================================

                previous_form_rows:
                    previousFormRows,


                // =================================================
                // SUMMARY
                // =================================================

                summary: {

                    transaction_count:
                        transactions.length,

                    total_collections:
                        totalCollections,

                    total_remittances:
                        0,

                    total_deposits:
                        0,

                    balance:
                        totalCollections,

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
                // USER
                // =================================================

                user: {

                    id:
                        loggedInUser.id,

                    username:
                        loggedInUser.username,

                    full_name:
                        loggedInUser.full_name,

                },

            },
            {
                status: 201,
            }
        );


    } catch (
        error: any
    ) {

        // =====================================================
        // ROLLBACK
        // =====================================================

        try {

            await client.query(
                "ROLLBACK"
            );

        } catch (
            rollbackError
        ) {

            console.error(
                "RCD ROLLBACK ERROR:",
                rollbackError
            );

        }


        // =====================================================
        // ERROR
        // =====================================================

        console.error(
            "RCD GENERATION ERROR:",
            error
        );


        return NextResponse.json(
            {

                success: false,

                message:
                    error?.message ||
                    "Failed to generate RCD.",

            },
            {
                status: 500,
            }
        );


    } finally {

        client.release();

    }

}