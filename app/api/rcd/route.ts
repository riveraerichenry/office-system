import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { pool } from "@/lib/db";
import { randomUUID } from "crypto";

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
// NUMERIC OR HELPERS — NO BIGINT REQUIRED
// =============================================================

function normalizeNumericString(value: string | number): string {
    const digits = String(value).trim();

    if (!/^\d+$/.test(digits)) {
        throw new Error(`Invalid numeric OR number: ${digits}`);
    }

    return digits.replace(/^0+(?=\d)/, "");
}

function compareNumericStrings(
    a: string | number,
    b: string | number
): number {
    const left = normalizeNumericString(a);
    const right = normalizeNumericString(b);

    if (left.length !== right.length) {
        return left.length < right.length ? -1 : 1;
    }

    if (left === right) {
        return 0;
    }

    return left < right ? -1 : 1;
}

function incrementNumericString(value: string | number): string {
    const digits = normalizeNumericString(value).split("");
    let carry = 1;

    for (let i = digits.length - 1; i >= 0 && carry > 0; i--) {
        const next = Number(digits[i]) + carry;

        digits[i] = String(next % 10);
        carry = next >= 10 ? 1 : 0;
    }

    if (carry > 0) {
        digits.unshift("1");
    }

    return digits.join("");
}

// =============================================================
// POST
// =============================================================

export async function POST(request: NextRequest) {
    const client = await pool.connect();

    try {
        // =====================================================
        // REQUEST BODY
        // =====================================================

        const body = await request.json();

        const {
            fund_source_id,
            date_from,
            date_to,
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
                { status: 400 }
            );
        }

        if (!date_from || !date_to) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Date range is required.",
                },
                { status: 400 }
            );
        }

        if (date_from > date_to) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Date From cannot be later than Date To.",
                },
                { status: 400 }
            );
        }

        // =====================================================
        // AUTHENTICATION
        // =====================================================

        const token = request.cookies.get("token")?.value;

        if (!token) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Authentication required.",
                },
                { status: 401 }
            );
        }

        const jwtSecret = process.env.JWT_SECRET;

        if (!jwtSecret) {
            console.error("JWT_SECRET is not configured.");

            return NextResponse.json(
                {
                    success: false,
                    message: "Authentication configuration error.",
                },
                { status: 500 }
            );
        }

        // =====================================================
        // VERIFY JWT
        // =====================================================

        let decoded: JwtPayload;

        try {
            decoded = jwt.verify(token, jwtSecret) as JwtPayload;
        } catch (error) {
            console.error("RCD JWT ERROR:", error);

            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid or expired session.",
                },
                { status: 401 }
            );
        }

        if (!decoded?.id) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unable to determine logged-in user.",
                },
                { status: 401 }
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
            [decoded.id]
        );

        if (userResult.rows.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Logged-in user was not found.",
                },
                { status: 401 }
            );
        }

        const loggedInUser = userResult.rows[0];

        // =====================================================
        // VERIFY FUND SOURCE
        // =====================================================

        const fundSourceResult = await client.query(
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
            [fund_source_id]
        );

        if (fundSourceResult.rows.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Fund source not found or inactive.",
                },
                { status: 404 }
            );
        }

        const fundSource = fundSourceResult.rows[0];

        // =====================================================
        // BEGIN DATABASE TRANSACTION
        // =====================================================

        await client.query("BEGIN");

        // =====================================================
        // LOCK RCD NUMBER GENERATION
        // =====================================================

        await client.query(`
            SELECT pg_advisory_xact_lock(
                hashtext('RCD_REPORT_NUMBER_GENERATION')
            )
        `);

        // =====================================================
        // GET ELIGIBLE DIPP TRANSACTIONS
        // =====================================================

        const transactionsResult = await client.query(
            `
            SELECT
                dt.id,
                dt.or_number,
                dt.receipt_date,
                dt.collector_id,
                dt.payor,
                dt.payment_mode,
                dt.remarks,
                COALESCE(dt.grand_total, 0) AS amount,
                dt.accountable_form_id,
                dt.booklet_registration_id,

                sbr.beginning_or AS booklet_beginning_or,
                sbr.ending_or AS booklet_ending_or,
                sbr.current_or AS booklet_current_or,

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
                ON af.id = dt.accountable_form_id

            LEFT JOIN smi_booklet_registration sbr
                ON sbr.id = dt.booklet_registration_id

            WHERE
                lr.fund_source_id = $1
                AND dt.receipt_date >= $2::date
                AND dt.receipt_date < ($3::date + INTERVAL '1 day')
                AND dt.encoded_by = $4
                AND dt.status = 'ISSUED'
                AND COALESCE(dt.is_cancelled, FALSE) = FALSE

                AND NOT EXISTS (
                    SELECT 1
                    FROM rcd_items ri
                    WHERE ri.dipp_transaction_id = dt.id
                )

            ORDER BY
                af.form_code ASC,
                dt.receipt_date ASC,
                CASE
                    WHEN NULLIF(TRIM(dt.or_number), '') ~ '^[0-9]+$'
                    THEN NULLIF(TRIM(dt.or_number), '')::BIGINT
                    ELSE NULL
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

        const transactions = transactionsResult.rows;

        // =====================================================
        // NO TRANSACTIONS
        // =====================================================

        if (transactions.length === 0) {
            await client.query("ROLLBACK");

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "No eligible DIPP transactions were found for the selected fund source, date range, and logged-in user.",
                },
                { status: 404 }
            );
        }

        // =====================================================
        // BUILD ACCOUNTABILITY DATA
        // =====================================================

        const previousFormRows: PreviousFormRow[] = [];

        const bookletGroups = new Map<string, any[]>();

        for (const transaction of transactions) {
            const formCode =
                String(transaction.form_code ?? "—").trim() || "—";

            const bookletId = String(
                transaction.booklet_registration_id ?? "NO_BOOKLET"
            );

            const key = `${formCode}::${bookletId}`;

            if (!bookletGroups.has(key)) {
                bookletGroups.set(key, []);
            }

            bookletGroups.get(key)!.push(transaction);
        }

        // =====================================================
        // BUILD ACCOUNTABILITY ROWS PER BOOKLET
        // =====================================================

        for (const [, groupTransactions] of bookletGroups.entries()) {
            const formCode =
                String(groupTransactions[0].form_code ?? "—").trim() ||
                "—";

            const sortedTransactions = [...groupTransactions].sort(
                (a, b) => {
                    const orA = String(a.or_number ?? "").trim();
                    const orB = String(b.or_number ?? "").trim();

                    if (/^\d+$/.test(orA) && /^\d+$/.test(orB)) {
                        return compareNumericStrings(orA, orB);
                    }

                    return orA.localeCompare(orB);
                }
            );

            const serials = sortedTransactions
                .map((transaction) =>
                    String(transaction.or_number ?? "").trim()
                )
                .filter((value) => /^\d+$/.test(value));

            if (serials.length === 0) {
                previousFormRows.push({
                    formCode,
                    beginningFrom: null,
                    beginningTo: null,
                    endingFrom: null,
                    endingTo: null,
                });

                continue;
            }

            const currentMin = serials.reduce((min, value) =>
                compareNumericStrings(value, min) < 0 ? value : min
            );

            const currentMax = serials.reduce((max, value) =>
                compareNumericStrings(value, max) > 0 ? value : max
            );

            const booklet = sortedTransactions[0];

            const bookletBeginningRaw = booklet.booklet_beginning_or;
            const bookletEndingRaw = booklet.booklet_ending_or;

            const bookletBeginning =
                bookletBeginningRaw !== null &&
                bookletBeginningRaw !== undefined &&
                String(bookletBeginningRaw).trim() !== ""
                    ? String(bookletBeginningRaw).trim()
                    : null;

            const bookletEnding =
                bookletEndingRaw !== null &&
                bookletEndingRaw !== undefined &&
                String(bookletEndingRaw).trim() !== ""
                    ? String(bookletEndingRaw).trim()
                    : null;

            const serialWidth = Math.max(
                ...serials.map((value) => value.length),
                bookletBeginningRaw != null
                    ? String(bookletBeginningRaw).length
                    : 0,
                bookletEndingRaw != null
                    ? String(bookletEndingRaw).length
                    : 0
            );

            const padOR = (value: string | number): string =>
                String(value).padStart(serialWidth, "0");

            // =================================================
            // VALIDATE BEGINNING OR
            // =================================================

            if (
                bookletBeginning !== null &&
                compareNumericStrings(currentMin, bookletBeginning) < 0
            ) {
                throw new Error(
                    `OR ${currentMin} is before the beginning OR of booklet ` +
                    `${booklet.control_no ?? booklet.booklet_registration_id}.`
                );
            }

            // =================================================
            // VALIDATE ENDING OR
            // =================================================

            if (
                bookletEnding !== null &&
                compareNumericStrings(currentMax, bookletEnding) > 0
            ) {
                throw new Error(
                    `OR ${currentMax} exceeds the ending OR of booklet ` +
                    `${booklet.control_no ?? booklet.booklet_registration_id}.`
                );
            }

            // =================================================
            // BEGINNING BALANCE
            // =================================================

            const beginningFrom = padOR(currentMin);

            const beginningTo =
                bookletEnding !== null
                    ? padOR(bookletEnding)
                    : null;

            // =================================================
            // ENDING BALANCE
            // =================================================

            let endingFrom: string | null = null;
            let endingTo: string | null = null;

            if (
                bookletEnding !== null &&
                compareNumericStrings(currentMax, bookletEnding) < 0
            ) {
                endingFrom = padOR(incrementNumericString(currentMax));
                endingTo = padOR(bookletEnding);
            }

            previousFormRows.push({
                formCode,
                beginningFrom,
                beginningTo,
                endingFrom,
                endingTo,
            });

            console.log("RCD BOOKLET ACCOUNTABILITY", {
                formCode,
                bookletRegistrationId: booklet.booklet_registration_id,
                bookletBeginningOR: bookletBeginningRaw,
                bookletEndingOR: bookletEndingRaw,
                currentFirstOR: padOR(currentMin),
                currentLastOR: padOR(currentMax),
                beginningFrom,
                beginningTo,
                endingFrom,
                endingTo,
            });
        }

        console.log("RCD PREVIOUS FORM ROWS", previousFormRows);

        // =====================================================
        // DETERMINE WHETHER THIS IS AN RPT FUND SOURCE
        // 103 = RPT-SEF
        // 105 = RPT-BASIC
        // 106 = RPT-GENERAL
        // =====================================================

        const normalizedFundCode = String(
            fundSource.fund_code ?? ""
        ).trim().toUpperCase();

        const normalizedAcronym = String(
            fundSource.acronym ?? ""
        ).trim().toUpperCase();

        const isRPTFund =
            ["103", "105", "106"].includes(normalizedFundCode) ||
            ["RPT-SEF", "RPT-BASIC", "RPT-GENERAL"].includes(
                normalizedAcronym
            );

        // =====================================================
        // CURRENCY HELPERS
        // =====================================================

        const toCents = (value: unknown): number => {
            const amount = Number(value ?? 0);

            if (!Number.isFinite(amount)) {
                throw new Error(
                    "A DIPP transaction contains an invalid amount."
                );
            }

            return Math.round((amount + Number.EPSILON) * 100);
        };

        const transactionCents = transactions.map((transaction: any) => ({
            transaction,
            cents: toCents(transaction.amount),
        }));

        const totalCents = transactionCents.reduce(
            (sum, item) => sum + item.cents,
            0
        );

        const totalCollections = totalCents / 100;

        // =====================================================
        // CREATE TRANSACTION GROUPS
        // =====================================================

        let transactionGroups: any[][] = [transactions];

        if (isRPTFund) {
            if (totalCents % 2 !== 0) {
                await client.query("ROLLBACK");

                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "RPT double posting requires an even total in cents. The selected transactions total cannot be divided evenly to the cent.",
                    },
                    { status: 400 }
                );
            }

            if (transactions.length < 2) {
                await client.query("ROLLBACK");

                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "At least two DIPP transactions are required to create two RPT RCDs without duplicating a transaction.",
                    },
                    { status: 400 }
                );
            }

            // Balance groups using whole transactions.
            const sortedForSplit = [...transactionCents].sort(
                (a, b) => b.cents - a.cents
            );

            const groupCents = [0, 0];
            const groups: any[][] = [[], []];

            for (const item of sortedForSplit) {
                const target =
                    groupCents[0] <= groupCents[1] ? 0 : 1;

                groups[target].push(item.transaction);
                groupCents[target] += item.cents;
            }

            // Preserve the original query order inside each RCD.
            const originalIndex = new Map<string, number>(
                transactions.map(
                    (transaction: any, index: number) => [
                        String(transaction.id),
                        index,
                    ]
                )
            );

            transactionGroups = groups.map((group) =>
                group.sort(
                    (a, b) =>
                        (originalIndex.get(String(a.id)) ?? 0) -
                        (originalIndex.get(String(b.id)) ?? 0)
                )
            );

            if (transactionGroups.some((group) => group.length === 0)) {
                await client.query("ROLLBACK");

                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "Unable to divide the selected RPT transactions into two non-empty groups.",
                    },
                    { status: 400 }
                );
            }
        }

        // =====================================================
        // REPORT NUMBER PREFIX AND DAILY SEQUENCE
        // =====================================================

        const reportDate = new Date();

        const yy = String(reportDate.getFullYear()).slice(-2);
        const mm = String(reportDate.getMonth() + 1).padStart(2, "0");
        const dd = String(reportDate.getDate()).padStart(2, "0");

        const datePrefix = `${yy}${mm}${dd}`;

        const sequenceResult = await client.query(`
            SELECT COUNT(*)::integer AS existing_count
            FROM rcd_transaction
            WHERE report_date = CURRENT_DATE
        `);

        const existingCount = Number(
            sequenceResult.rows[0]?.existing_count ?? 0
        );

        const fundSourceAcronym = String(
            fundSource.acronym ?? ""
        ).trim().toUpperCase();

        const reportSuffix = fundSourceAcronym || "RPT";

        // =====================================================
        // CREATE RCDS AND ATTACH EACH TRANSACTION ONCE
        // =====================================================

        const createdRcds: any[] = [];
        const allFormattedItems: any[] = [];

        for (
            let groupIndex = 0;
            groupIndex < transactionGroups.length;
            groupIndex++
        ) {
            const group = transactionGroups[groupIndex];

            const groupTotalCents = group.reduce(
                (sum: number, transaction: any) =>
                    sum + toCents(transaction.amount),
                0
            );

            const groupTotal = groupTotalCents / 100;

            const sequence = String(
                existingCount + groupIndex + 1
            ).padStart(5, "0");

            const reportNo = `${datePrefix}${sequence}-${reportSuffix}`;
            const rcdId = randomUUID();

            const rcdResult = await client.query(
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
                    fund_source_id,
                    date_from,
                    date_to,
                    groupTotal,
                    loggedInUser.id,
                ]
            );

            const rcd = rcdResult.rows[0];

            for (const transaction of group) {
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
                        $1, $2, $3, $4, $5,
                        $6, $7, $8, $9, CURRENT_TIMESTAMP
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

                // Preserve existing remittance behavior.
                await client.query(
                    `
                    UPDATE dipp_transactions
                    SET
                        remittance_id = NULL,
                        is_remitted = FALSE
                    WHERE id = $1
                    `,
                    [transaction.id]
                );

                allFormattedItems.push({
                    id: transaction.id,
                    dipp_transaction_id: transaction.id,
                    rcd_transaction_id: rcdId,
                    report_no: reportNo,
                    rcd_group: groupIndex + 1,
                    or_number: transaction.or_number,
                    receipt_date: transaction.receipt_date,
                    collector_id: transaction.collector_id,
                    payor: transaction.payor,
                    payment_mode: transaction.payment_mode,
                    amount: Number(transaction.amount ?? 0),
                    form_code: transaction.form_code,
                    form_name: transaction.form_name,
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

            createdRcds.push({
                ...rcd,
                total_collections: Number(rcd.total_collections ?? 0),
                total_remittances: Number(rcd.total_remittances ?? 0),
                total_deposits: Number(rcd.total_deposits ?? 0),
                balance: Number(rcd.balance ?? 0),
                rcd_group: groupIndex + 1,
                transaction_count: group.length,
            });
        }

        // =====================================================
        // RESPONSE DATA
        // =====================================================

        const formattedRCD = createdRcds[0];
        const formattedItems = allFormattedItems;

        const responseMessage = isRPTFund
            ? "Two RPT RCDs generated successfully."
            : "RCD generated successfully.";

        // =====================================================
        // COMMIT
        // =====================================================

        await client.query("COMMIT");

        // =====================================================
        // RESPONSE
        // =====================================================

        return NextResponse.json(
            {
                success: true,
                message: responseMessage,

                rcds: createdRcds,
                rcd: formattedRCD,
                items: formattedItems,

                previous_form_rows: previousFormRows,

                summary: {
                    transaction_count: transactions.length,
                    rcd_count: createdRcds.length,
                    total_collections: totalCollections,

                    rcd_totals: createdRcds.map((item: any) => ({
                        rcd_group: item.rcd_group,
                        report_no: item.report_no,
                        transaction_count: item.transaction_count,
                        total_collections: item.total_collections,
                    })),

                    total_remittances: 0,
                    total_deposits: 0,
                    balance: totalCollections,
                },

                fund_source: {
                    id: fundSource.id,
                    fund_code: fundSource.fund_code,
                    fund_name: fundSource.fund_name,
                    acronym: fundSource.acronym,
                },

                user: {
                    id: loggedInUser.id,
                    username: loggedInUser.username,
                    full_name: loggedInUser.full_name,
                },
            },
            { status: 201 }
        );
    } catch (error: any) {
        try {
            await client.query("ROLLBACK");
        } catch (rollbackError) {
            console.error("RCD ROLLBACK ERROR:", rollbackError);
        }

        console.error("RCD GENERATION ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: error?.message || "Failed to generate RCD.",
            },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}