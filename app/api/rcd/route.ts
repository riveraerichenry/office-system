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
    beginningFrom: string | null;
    beginningTo: string | null;
    endingFrom: string | null;
    endingTo: string | null;
};

// =============================================================
// POST
// =============================================================

export async function POST(request: NextRequest) {
    const client = await pool.connect();
    let transactionStarted = false;

    try {
        // =====================================================
        // REQUEST BODY
        // =====================================================

        const body = await request.json();

        const {
            fund_source_id,
            date_from,
            date_to,
            transaction_ids,
        } = body;

        // =====================================================
        // VALIDATION
        // =====================================================

        if (!fund_source_id) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Fund source is required.",
                },
                {
                    status: 400,
                }
            );
        }

        if (!date_from || !date_to) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Date range is required.",
                },
                {
                    status: 400,
                }
            );
        }

        if (date_from > date_to) {
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
        // TRANSACTION IDS VALIDATION
        // =====================================================

        if (!Array.isArray(transaction_ids)) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "transaction_ids must be an array.",
                },
                {
                    status: 400,
                }
            );
        }

        if (transaction_ids.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Please select at least one transaction for the RCD.",
                },
                {
                    status: 400,
                }
            );
        }

        // =====================================================
        // CLEAN TRANSACTION IDS
        // =====================================================

        const selectedTransactionIds = Array.from(
            new Set(
                transaction_ids
                    .filter(
                        (id: unknown) =>
                            typeof id === "string" &&
                            id.trim() !== ""
                    )
                    .map(
                        (id: string) => id.trim()
                    )
            )
        );

        if (selectedTransactionIds.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "No valid transactions were selected.",
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
            request.cookies.get("token")?.value;

        if (!token) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Authentication required.",
                },
                {
                    status: 401,
                }
            );
        }

        const jwtSecret = process.env.JWT_SECRET;

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

        // =====================================================
        // VERIFY JWT
        // =====================================================

        let decoded: JwtPayload;

        try {
            decoded = jwt.verify(
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
        // VERIFY LOGGED-IN USER
        // =====================================================

        const userResult = await client.query(
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

        if (userResult.rows.length === 0) {
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
        // VERIFY SELECTED FUND SOURCE
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

        if (fundSourceResult.rows.length === 0) {
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

        await client.query("BEGIN");
        transactionStarted = true;

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
        // GET SELECTED DIPP TRANSACTIONS
        //
        // Cancelled transactions are included with amount zero.
        //
        // Keep existing:
        // - Fund source filtering
        // - Date range filtering
        // - Collector filtering
        // - Selected transaction filtering
        // - Duplicate RCD protection
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

                        CASE
                            WHEN
                                COALESCE(
                                    dt.is_cancelled,
                                    FALSE
                                ) = TRUE

                                OR UPPER(
                                    COALESCE(
                                        dt.status,
                                        ''
                                    )
                                ) IN (
                                    'CANCELLED',
                                    'CANCELED'
                                )

                            THEN 0::numeric

                            ELSE COALESCE(
                                dt.grand_total,
                                0
                            )
                        END AS amount,

                        dt.accountable_form_id,
                        dt.booklet_registration_id,

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

                        af.form_code,
                        af.form_name

                    FROM dipp_transactions dt

                    INNER JOIN lor_releases lr
                        ON lr.id = dt.lor_release_id

                    LEFT JOIN accountable_forms af
                        ON af.id =
                           dt.accountable_form_id

                    LEFT JOIN smi_booklet_registration sbr
                        ON sbr.id =
                           dt.booklet_registration_id

                    WHERE
                        lr.fund_source_id = $1

                        AND dt.receipt_date >= $2::date

                        AND dt.receipt_date <
                            (
                                $3::date
                                + INTERVAL '1 day'
                            )

                        AND dt.collector_id = $4

                        AND dt.id = ANY($5::uuid[])

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
                            WHEN NULLIF(
                                TRIM(dt.or_number),
                                ''
                            ) ~ '^[0-9]+$'

                            THEN NULLIF(
                                TRIM(dt.or_number),
                                ''
                            )::BIGINT

                            ELSE NULL
                        END ASC,

                        dt.or_number ASC
                `,
                [
                    fund_source_id,
                    date_from,
                    date_to,
                    loggedInUser.id,
                    selectedTransactionIds,
                ]
            );

        const transactions =
            transactionsResult.rows;

        // =====================================================
        // VERIFY ALL SELECTED TRANSACTIONS WERE FOUND
        // =====================================================

        const foundIds = new Set(
            transactions.map(
                (transaction: any) =>
                    String(transaction.id)
            )
        );

        const missingIds =
            selectedTransactionIds.filter(
                (id: string) =>
                    !foundIds.has(id)
            );

        if (missingIds.length > 0) {
            await client.query("ROLLBACK");
            transactionStarted = false;

            console.error(
                "RCD SELECTED TRANSACTIONS VALIDATION FAILED",
                {
                    selectedCount:
                        selectedTransactionIds.length,

                    foundCount:
                        transactions.length,

                    missingIds,
                }
            );

            return NextResponse.json(
                {
                    success: false,

                    message:
                        "One or more selected transactions could not be found for this collector, fund source, or date range, or were already added to an RCD. Refresh the list and try again.",

                    missing_transaction_ids:
                        missingIds,
                },
                {
                    status: 409,
                }
            );
        }

        // =====================================================
        // NO TRANSACTIONS
        // =====================================================

        if (transactions.length === 0) {
            await client.query("ROLLBACK");
            transactionStarted = false;

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "No selected DIPP transactions were found for the RCD.",
                },
                {
                    status: 404,
                }
            );
        }

        // =====================================================
        // TOTAL ORIGINAL COLLECTIONS
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
                            transaction.amount ?? 0
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
            new Map<string, any[]>();

        // =====================================================
        // GROUP TRANSACTIONS BY FORM
        // =====================================================

        for (const transaction of transactions) {
            const formCode = String(
                transaction.form_code ?? "—"
            ).trim();

            if (!formGroups.has(formCode)) {
                formGroups.set(formCode, []);
            }

            formGroups
                .get(formCode)!
                .push(transaction);
        }

        // =====================================================
        // BUILD ACCOUNTABILITY ROWS
        // =====================================================

        for (const [
            formCode,
            groupTransactions,
        ] of formGroups.entries()) {

            // =================================================
            // CURRENT RCD ORS
            // =================================================

            const serials =
                groupTransactions
                    .map(
                        (transaction: any) =>
                            String(
                                transaction.or_number ?? ""
                            ).trim()
                    )
                    .filter(
                        (value: string) =>
                            value !== ""
                    );

            const numericSerials =
                serials
                    .map(
                        (value: string) =>
                            Number(value)
                    )
                    .filter(
                        (value: number) =>
                            !Number.isNaN(value)
                    );

            if (numericSerials.length === 0) {
                previousFormRows.push({
                    formCode,
                    beginningFrom: null,
                    beginningTo: null,
                    endingFrom: null,
                    endingTo: null,
                });

                continue;
            }

            // =================================================
            // FIRST OR
            // =================================================

            const currentMin =
                Math.min(...numericSerials);

            // =================================================
            // LAST OR
            // =================================================

            const currentMax =
                Math.max(...numericSerials);

            // =================================================
            // FIND BOOKLET
            // =================================================

            const bookletTransaction =
                groupTransactions.find(
                    (transaction: any) =>
                        transaction.booklet_ending_or !==
                            null &&
                        transaction.booklet_ending_or !==
                            undefined &&
                        String(
                            transaction.booklet_ending_or
                        ).trim() !== ""
                ) ?? groupTransactions[0];

            // =================================================
            // BOOKLET ENDING OR
            // =================================================

            const bookletEndingRaw =
                bookletTransaction?.booklet_ending_or;

            const bookletEnding =
                bookletEndingRaw !== null &&
                bookletEndingRaw !== undefined &&
                String(
                    bookletEndingRaw
                ).trim() !== ""
                    ? Number(bookletEndingRaw)
                    : null;

            // =================================================
            // SERIAL WIDTH
            // =================================================

            const firstSerialString =
                serials[0] ?? String(currentMin);

            const endingSerialString =
                bookletEndingRaw !== null &&
                bookletEndingRaw !== undefined
                    ? String(bookletEndingRaw)
                    : "";

            const serialWidth = Math.max(
                firstSerialString.length,
                endingSerialString.length
            );

            // =================================================
            // BEGINNING BALANCE
            // =================================================

            const beginningFrom =
                String(currentMin).padStart(
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
            // =================================================

            let endingFrom: string | null = null;
            let endingTo: string | null = null;

            if (
                bookletEnding !== null &&
                currentMax < bookletEnding
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
            // SAVE ACCOUNTABILITY ROW
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
            "RCD SELECTED TRANSACTIONS",
            {
                selectedTransactionIds,
                transactionCount:
                    transactions.length,
                totalCollections,
            }
        );

        console.log(
            "RCD PREVIOUS FORM ROWS",
            previousFormRows
        );

        // =====================================================
        // RPT FUND SOURCE CONFIGURATION
        // =====================================================

        const rptGeneralFundSourceId =
            "87dc32f3-418e-4cab-a024-673321df1ef5";

        const basicFundSourceId =
            "a30624dd-f490-424a-984d-fe5f5e93277a";

        const sefFundSourceId =
            "2a29a5c5-01d8-4202-8cf9-8a6659865f01";

        const isRptGeneral =
            String(fund_source_id).toLowerCase() ===
            rptGeneralFundSourceId.toLowerCase();

        // =====================================================
        // DETERMINE TARGET RCD FUND SOURCES
        // =====================================================

        let rcdFundSources: any[] = [
            fundSource,
        ];

        if (isRptGeneral) {
            const targetFundSourcesResult =
                await client.query(
                    `
                        SELECT
                            id,
                            fund_code,
                            fund_name,
                            acronym
                        FROM fund_sources
                        WHERE id = ANY($1::uuid[])
                          AND is_active = TRUE
                    `,
                    [
                        [
                            basicFundSourceId,
                            sefFundSourceId,
                        ],
                    ]
                );

            const targetSourcesById =
                new Map<string, any>(
                    targetFundSourcesResult.rows.map(
                        (source: any) => [
                            String(
                                source.id
                            ).toLowerCase(),
                            source,
                        ]
                    )
                );

            const basicSource =
                targetSourcesById.get(
                    basicFundSourceId.toLowerCase()
                );

            const sefSource =
                targetSourcesById.get(
                    sefFundSourceId.toLowerCase()
                );

            if (!basicSource || !sefSource) {
                throw new Error(
                    "RPT-BASIC or RPT-SEF fund source is missing or inactive."
                );
            }

            // Print order is BASIC first, then SEF.
            rcdFundSources = [
                basicSource,
                sefSource,
            ];
        }

        // =====================================================
        // REPORT NUMBER PREFIX
        // FORMAT: YYMMDDNNNNN-ACRONYM
        // =====================================================

        const reportDate = new Date();

        const yy = String(
            reportDate.getFullYear()
        ).slice(-2);

        const mm = String(
            reportDate.getMonth() + 1
        ).padStart(2, "0");

        const dd = String(
            reportDate.getDate()
        ).padStart(2, "0");

        const datePrefix =
            `${yy}${mm}${dd}`;

        // =====================================================
        // GET NEXT DAILY SEQUENCE
        //
        // The advisory transaction lock above protects this
        // sequence calculation from concurrent RCD generation.
        // =====================================================

        const sequenceResult =
            await client.query(
                `
                    SELECT
                        COUNT(*)::integer AS total
                    FROM rcd_transaction
                    WHERE report_date = CURRENT_DATE
                `
            );

        let nextSequence =
            Number(
                sequenceResult.rows[0].total ?? 0
            ) + 1;

        // =====================================================
        // SPLIT AMOUNTS USING CENTAVOS
        //
        // BASIC receives half rounded to the nearest centavo.
        // SEF receives the remainder.
        //
        // BASIC + SEF always equals the original amount.
        // Cancelled transactions remain zero in both RCDs.
        // =====================================================

        const transactionAmounts =
            transactions.map(
                (transaction: any) => {
                    const originalCents =
                        Math.round(
                            Number(
                                transaction.amount ?? 0
                            ) * 100
                        );

                    const basicCents =
                        Math.round(
                            originalCents / 2
                        );

                    const sefCents =
                        originalCents - basicCents;

                    return {
                        transaction,

                        originalAmount:
                            originalCents / 100,

                        basicAmount:
                            basicCents / 100,

                        sefAmount:
                            sefCents / 100,
                    };
                }
            );

        // =====================================================
        // CREATE RCD RECORDS
        //
        // RPT GENERAL:
        //   First RCD  = RPT-BASIC fund source
        //   Second RCD = RPT-SEF fund source
        //
        // Other fund sources:
        //   One RCD using the selected fund source.
        // =====================================================

        const createdRcds: any[] = [];

        for (
            let index = 0;
            index < rcdFundSources.length;
            index++
        ) {
            const targetFundSource =
                rcdFundSources[index];

            const isBasic =
                isRptGeneral && index === 0;

            const isSef =
                isRptGeneral && index === 1;

            const fundSourceAcronym =
                String(
                    targetFundSource.acronym ?? ""
                )
                    .trim()
                    .toUpperCase();

            const reportSuffix = isBasic
                ? "RPT-BASIC"
                : isSef
                    ? "RPT-SEF"
                    : (
                        fundSourceAcronym || "RPT"
                    );

            const sequence =
                String(
                    nextSequence++
                ).padStart(
                    5,
                    "0"
                );

            const reportNo =
                `${datePrefix}${sequence}-${reportSuffix}`;

            const rcdId = randomUUID();

            // =================================================
            // CALCULATE THIS RCD'S TOTAL
            // =================================================

            const rcdTotalCents =
                transactionAmounts.reduce(
                    (
                        total: number,
                        entry: any
                    ) => {
                        const amount = isBasic
                            ? entry.basicAmount
                            : isSef
                                ? entry.sefAmount
                                : entry.originalAmount;

                        return (
                            total +
                            Math.round(
                                amount * 100
                            )
                        );
                    },
                    0
                );

            const rcdTotal =
                rcdTotalCents / 100;

            // =================================================
            // INSERT RCD HEADER
            // =================================================

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
                            'FOR REMITTANCE',
                            $7,
                            CURRENT_TIMESTAMP,
                            CURRENT_TIMESTAMP
                        )
                        RETURNING *
                    `,
                    [
                        rcdId,
                        reportNo,
                        targetFundSource.id,
                        date_from,
                        date_to,
                        rcdTotal,
                        loggedInUser.id,
                    ]
                );

            const rcd =
                rcdResult.rows[0];

            const formattedItems: any[] = [];

            // =================================================
            // INSERT RCD ITEMS
            // =================================================

            for (const entry of transactionAmounts) {
                const transaction =
                    entry.transaction;

                const itemAmount = isBasic
                    ? entry.basicAmount
                    : isSef
                        ? entry.sefAmount
                        : entry.originalAmount;

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
                        itemAmount,
                    ]
                );

                formattedItems.push({
                    id: transaction.id,

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
                        Number(itemAmount ?? 0),

                    form_code:
                        transaction.form_code,

                    form_name:
                        transaction.form_name,

                    booklet_registration_id:
                        transaction.booklet_registration_id,

                    booklet_beginning_or:
                        transaction.booklet_beginning_or,

                    booklet_ending_or:
                        transaction.booklet_ending_or,

                    booklet_current_or:
                        transaction.booklet_current_or,
                });
            }

            // =================================================
            // FORMAT RCD
            // =================================================

            const formattedRCD = {
                ...rcd,

                total_collections: Number(
                    rcd.total_collections ?? 0
                ),

                total_remittances: Number(
                    rcd.total_remittances ?? 0
                ),

                total_deposits: Number(
                    rcd.total_deposits ?? 0
                ),

                balance: Number(
                    rcd.balance ?? 0
                ),
            };

            // =================================================
            // SAVE THIS RCD'S RESPONSE DATA
            // =================================================

            createdRcds.push({
                rcd: formattedRCD,

                items: formattedItems,

                previous_form_rows:
                    previousFormRows,

                summary: {
                    transaction_count:
                        transactions.length,

                    total_collections:
                        rcdTotal,

                    total_remittances: 0,

                    total_deposits: 0,

                    balance:
                        rcdTotal,
                },

                fund_source: {
                    id:
                        targetFundSource.id,

                    fund_code:
                        targetFundSource.fund_code,

                    fund_name:
                        targetFundSource.fund_name,

                    acronym:
                        targetFundSource.acronym,
                },

                user: {
                    id:
                        loggedInUser.id,

                    username:
                        loggedInUser.username,

                    full_name:
                        loggedInUser.full_name,
                },
            });

            console.log(
                "RCD CREATED",
                {
                    reportNo,
                    rcdId,

                    fundSourceId:
                        targetFundSource.id,

                    itemCount:
                        formattedItems.length,

                    totalCollections:
                        rcdTotal,
                }
            );
        }

        // =====================================================
        // CLEAR DIPP REMITTANCE DETAILS
        //
        // Do this once per original transaction, not once per
        // generated RCD.
        // =====================================================

        for (const transaction of transactions) {
            await client.query(
                `
                    UPDATE dipp_transactions
                    SET
                        remittance_id = NULL,
                        is_remitted = FALSE
                    WHERE id = $1
                `,
                [
                    transaction.id,
                ]
            );
        }

        // =====================================================
        // COMMIT
        // =====================================================

        await client.query("COMMIT");
        transactionStarted = false;

        // =====================================================
        // RESPONSE
        //
        // `rcds` always contains all generated RCDs.
        //
        // For other fund sources, preserve the existing single
        // RCD response properties for compatibility.
        // =====================================================

        const responseBody: any = {
            success: true,

            message: isRptGeneral
                ? "RPT-BASIC and RPT-SEF RCDs generated successfully."
                : "RCD generated successfully.",

            rcds: createdRcds,
        };

        if (
            !isRptGeneral &&
            createdRcds.length > 0
        ) {
            Object.assign(
                responseBody,
                createdRcds[0]
            );
        }

        return NextResponse.json(
            responseBody,
            {
                status: 201,
            }
        );

    } catch (error: any) {
        // =====================================================
        // ROLLBACK
        // =====================================================

        if (transactionStarted) {
            try {
                await client.query("ROLLBACK");
            } catch (rollbackError) {
                console.error(
                    "RCD ROLLBACK ERROR:",
                    rollbackError
                );
            }
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