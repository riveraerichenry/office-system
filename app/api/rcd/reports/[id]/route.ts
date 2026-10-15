
import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import jwt from "jsonwebtoken";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

type JwtPayload = {
    id?: string;
    user_id?: string;
};

const RPT_GENERAL_ID =
    "87dc32f3-418e-4cab-a024-673321df1ef5";

const RPT_BASIC_ID =
    "a30624dd-f490-424a-984d-fe5f5e93277a";

const RPT_SEF_ID =
    "2a29a5c5-01d8-4202-8cf9-8a6659865f01";

export async function GET(
    request: NextRequest,
    context: {
        params: Promise<{ id: string }>;
    }
) {
    const client = await pool.connect();

    try {
        // AUTHENTICATION
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
            return NextResponse.json(
                {
                    success: false,
                    message: "JWT_SECRET is not configured.",
                },
                { status: 500 }
            );
        }

        let decoded: JwtPayload;

        try {
            decoded = jwt.verify(
                token,
                jwtSecret
            ) as JwtPayload;
        } catch {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid or expired session.",
                },
                { status: 401 }
            );
        }

        if (!decoded?.id && !decoded?.user_id) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unable to determine logged-in user.",
                },
                { status: 401 }
            );
        }

        const { id } = await context.params;

        if (!id) {
            return NextResponse.json(
                {
                    success: false,
                    message: "RCD ID is required.",
                },
                { status: 400 }
            );
        }

        // GET THE SELECTED RCD
        const rcdResult = await client.query(
            `
            SELECT
                rt.id,
                rt.report_no,
                TO_CHAR(rt.report_date, 'YYYY-MM-DD')
                    AS report_date,
                rt.fund_source_id,
                TO_CHAR(rt.date_from, 'YYYY-MM-DD')
                    AS date_from,
                TO_CHAR(rt.date_to, 'YYYY-MM-DD')
                    AS date_to,
                rt.total_collections,
                rt.total_remittances,
                rt.total_deposits,
                rt.balance,
                rt.status,
                rt.rcd_by,
                rt.created_at,
                rt.updated_at,
                fs.fund_code,
                fs.fund_name,
                fs.acronym,
                u.id AS user_id,
                u.full_name AS user_full_name,
                u.username AS user_username
            FROM public.rcd_transaction rt
            LEFT JOIN public.fund_sources fs
                ON fs.id = rt.fund_source_id
            LEFT JOIN public.users u
                ON u.id = rt.rcd_by
            WHERE rt.id = $1
            LIMIT 1
            `,
            [id]
        );

        if (rcdResult.rows.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "RCD was not found.",
                },
                { status: 404 }
            );
        }

        const rcd = rcdResult.rows[0];

        // FIND THE MATCHING BASIC OR SEF REPORT.
        // Match the opposite fund source and the actual
        // DIPP transactions associated with both reports.
        let pairedRcdId: string | null = null;

        const isBasic =
            String(rcd.fund_source_id) === RPT_BASIC_ID;

        const isSef =
            String(rcd.fund_source_id) === RPT_SEF_ID;

        if (isBasic || isSef) {
            const counterpartFundSourceId = isBasic
                ? RPT_SEF_ID
                : RPT_BASIC_ID;

            const pairedResult = await client.query(
                `
                WITH current_items AS (
                    SELECT dipp_transaction_id
                    FROM public.rcd_items
                    WHERE rcd_transaction_id = $1
                ),
                candidates AS (
                    SELECT
                        sibling.id,
                        sibling.created_at,
                        COUNT(DISTINCT ci.dipp_transaction_id)
                            AS shared_items,
                        (
                            SELECT COUNT(*)
                            FROM public.rcd_items sibling_item
                            WHERE sibling_item.rcd_transaction_id =
                                  sibling.id
                        ) AS sibling_item_count,
                        (
                            SELECT COUNT(*)
                            FROM current_items
                        ) AS current_item_count
                    FROM public.rcd_transaction sibling
                    JOIN public.rcd_items sibling_item
                        ON sibling_item.rcd_transaction_id =
                           sibling.id
                    JOIN current_items ci
                        ON ci.dipp_transaction_id =
                           sibling_item.dipp_transaction_id
                    WHERE sibling.id <> $1
                      AND sibling.fund_source_id = $2
                      AND sibling.rcd_by IS NOT DISTINCT FROM $3
                      AND sibling.report_date = $4
                      AND sibling.date_from IS NOT DISTINCT FROM $5
                      AND sibling.date_to IS NOT DISTINCT FROM $6
                    GROUP BY sibling.id, sibling.created_at
                )
                SELECT id
                FROM candidates
                WHERE shared_items > 0
                  AND shared_items = sibling_item_count
                  AND shared_items = current_item_count
                ORDER BY created_at DESC
                LIMIT 1
                `,
                [
                    rcd.id,
                    counterpartFundSourceId,
                    rcd.rcd_by,
                    rcd.report_date,
                    rcd.date_from,
                    rcd.date_to,
                ]
            );

            pairedRcdId =
                pairedResult.rows[0]?.id ?? null;
        }

        // GET SELECTED RCD ITEMS
        const itemsResult = await client.query(
            `
            SELECT
                ri.id,
                ri.rcd_transaction_id,
                ri.dipp_transaction_id,
                ri.or_number,
                ri.receipt_date,
                ri.collector_id,
                ri.payor,
                ri.payment_mode,
                ri.amount,
                ri.created_at,
                dt.accountable_form_id,
                dt.booklet_registration_id,
                dt.remarks,
                dt.encoded_by,
                dt.status AS transaction_status,
                af.form_code,
                af.form_name,
                sbr.beginning_or AS booklet_beginning_or,
                sbr.ending_or AS booklet_ending_or,
                sbr.current_or AS booklet_current_or
            FROM public.rcd_items ri
            LEFT JOIN public.dipp_transactions dt
                ON dt.id = ri.dipp_transaction_id
            LEFT JOIN public.accountable_forms af
                ON af.id = dt.accountable_form_id
            LEFT JOIN public.smi_booklet_registration sbr
                ON sbr.id = dt.booklet_registration_id
            WHERE ri.rcd_transaction_id = $1
            ORDER BY ri.receipt_date ASC, ri.or_number ASC
            `,
            [id]
        );

        const items = itemsResult.rows;

        // GET COLLECTORS
        const collectorIds = Array.from(
            new Set(
                items
                    .map((item: any) => item.collector_id)
                    .filter(Boolean)
            )
        );

        let collectors: any[] = [];

        if (collectorIds.length > 0) {
            const collectorResult = await client.query(
                `
                SELECT id, username, full_name
                FROM public.users
                WHERE id = ANY($1::uuid[])
                `,
                [collectorIds]
            );

            collectors = collectorResult.rows;
        }

        const collectorMap = new Map<string, any>();

        for (const collector of collectors) {
            collectorMap.set(
                String(collector.id),
                collector
            );
        }

        const detailedItems = items.map((item: any) => ({
            ...item,
            collector: item.collector_id
                ? collectorMap.get(
                    String(item.collector_id)
                ) ?? null
                : null,
        }));

        // GET ACCOUNTABLE OFFICER
        let rcdUser: any = null;

        if (rcd.rcd_by) {
            const userResult = await client.query(
                `
                SELECT id, username, full_name
                FROM public.users
                WHERE id = $1
                LIMIT 1
                `,
                [rcd.rcd_by]
            );

            rcdUser = userResult.rows[0] ?? null;
        }

        // GET REMITTANCE
        const remittanceResult = await client.query(
            `
            SELECT
                rr.id,
                rr.rcd_transaction_id,
                rr.payment_type,
                rr.cash_amount,
                rr.check_amount,
                rr.total_amount,
                rr.report_date,
                rr.remitted_by,
                rr.created_by,
                rr.created_at,
                rr.updated_at
            FROM public.rcd_remittance rr
            WHERE rr.rcd_transaction_id = $1
            ORDER BY rr.created_at DESC
            LIMIT 1
            `,
            [id]
        );

        let remittance =
            remittanceResult.rows[0] ?? null;

        // GET REMITTED BY NAME
        if (remittance?.remitted_by) {
            const result = await client.query(
                `
                SELECT id, username, full_name
                FROM public.users
                WHERE id = $1
                LIMIT 1
                `,
                [remittance.remitted_by]
            );

            const person = result.rows[0] ?? null;

            remittance = {
                ...remittance,
                remitted_by_name:
                    person?.full_name ??
                    person?.username ??
                    "—",
            };
        }

        // GET CREATED BY NAME
        if (remittance?.created_by) {
            const result = await client.query(
                `
                SELECT id, username, full_name
                FROM public.users
                WHERE id = $1
                LIMIT 1
                `,
                [remittance.created_by]
            );

            const person = result.rows[0] ?? null;

            remittance = {
                ...remittance,
                created_by_name:
                    person?.full_name ??
                    person?.username ??
                    "—",
            };
        }

        // GET REMITTANCE DENOMINATIONS
        let denominations: any[] = [];

        if (remittance?.id) {
            try {
                const denominationResult =
                    await client.query(
                        `
                        SELECT
                            id,
                            remittance_id,
                            denomination,
                            quantity,
                            amount,
                            created_at
                        FROM public.rcd_remittance_denominations
                        WHERE remittance_id = $1
                        ORDER BY denomination DESC
                        `,
                        [remittance.id]
                    );

                denominations = denominationResult.rows;
            } catch (error) {
                console.error(
                    "LOAD RCD DENOMINATIONS ERROR:",
                    error
                );

                denominations = [];
            }
        }

        // BUILD ACCOUNTABLE-FORM ROWS
        const previousFormRows =
            buildPreviousFormRows(detailedItems);

        const fundSource = {
            id: rcd.fund_source_id,
            fund_code: rcd.fund_code ?? null,
            fund_name: rcd.fund_name ?? null,
            acronym: rcd.acronym ?? null,
        };

        return NextResponse.json(
            {
                success: true,
                rcd: {
                    ...rcd,
                    fund_source: fundSource,
                    paired_rcd_id: pairedRcdId,
                },
                paired_rcd_id: pairedRcdId,
                items: detailedItems,
                remittance,
                denominations,
                user: rcdUser,
                previousFormRows,
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error(
            "GET COMPLETE RCD REPORT ERROR:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    error?.message ??
                    "Unable to load complete RCD report.",
            },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}

// ================================================================
// BUILD PREVIOUS FORM ROWS
// ================================================================

function buildPreviousFormRows(items: any[]) {
    if (!Array.isArray(items) || items.length === 0) {
        return [];
    }

    const groups = new Map<string, any[]>();

    for (const item of items) {
        const formCode = String(
            item.form_code ??
            item.form_name ??
            "—"
        ).trim();

        if (!groups.has(formCode)) {
            groups.set(formCode, []);
        }

        groups.get(formCode)!.push(item);
    }

    const rows: any[] = [];

    for (const [formCode, groupItems] of groups) {
        const numbers = groupItems
            .map((item: any) => parseORNumber(item.or_number))
            .filter(
                (value): value is number =>
                    value !== null
            )
            .sort((a, b) => a - b);

        if (numbers.length === 0) {
            rows.push({
                formCode,
                beginningFrom: null,
                beginningTo: null,
                endingFrom: null,
                endingTo: null,
            });

            continue;
        }

        const first = numbers[0];
        const last = numbers[numbers.length - 1];

        const bookletItem =
            groupItems.find(
                (item: any) =>
                    item.booklet_registration_id
            ) ?? groupItems[0];

        const bookletEnding = parseORNumber(
            bookletItem?.booklet_ending_or
        );

        const serialWidth = Math.max(
            String(first).length,
            bookletEnding !== null
                ? String(bookletEnding).length
                : 0
        );

        const beginningFrom = String(first).padStart(
            serialWidth,
            "0"
        );

        const beginningTo =
            bookletEnding !== null
                ? String(bookletEnding).padStart(
                    serialWidth,
                    "0"
                )
                : null;

        let endingFrom: string | null = null;
        let endingTo: string | null = null;

        if (
            bookletEnding !== null &&
            last < bookletEnding
        ) {
            endingFrom = String(last + 1).padStart(
                serialWidth,
                "0"
            );

            endingTo = String(bookletEnding).padStart(
                serialWidth,
                "0"
            );
        }

        rows.push({
            formCode,
            beginningFrom,
            beginningTo,
            endingFrom,
            endingTo,
        });
    }

    return rows;
}

// ================================================================
// PARSE OR NUMBER
// ================================================================

function parseORNumber(value: any): number | null {
    if (value === null || value === undefined) {
        return null;
    }

    const stringValue = String(value).trim();

    if (!stringValue) {
        return null;
    }

    const match = stringValue.match(/\d+/);

    if (!match) {
        return null;
    }

    const number = Number(match[0]);

    if (!Number.isFinite(number)) {
        return null;
    }

    return number;
}
