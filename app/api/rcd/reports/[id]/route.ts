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

export async function GET(
    request: NextRequest,
    context: {
        params: Promise<{
            id: string;
        }>;
    }
) {
    const client = await pool.connect();

    try {
        // ============================================================
        // AUTHENTICATION
        // ============================================================

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

        const jwtSecret =
            process.env.JWT_SECRET;

        if (!jwtSecret) {
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

        let decoded: JwtPayload;

        try {
            decoded =
                jwt.verify(
                    token,
                    jwtSecret
                ) as JwtPayload;
        } catch {
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

        if (!decoded?.id && !decoded?.user_id) {
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

        // ============================================================
        // RCD ID
        // ============================================================

        const { id } =
            await context.params;

        if (!id) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "RCD ID is required.",
                },
                {
                    status: 400,
                }
            );
        }

        // ============================================================
        // RCD
        // ============================================================

        const rcdResult =
            await client.query(
                `
                SELECT
                    rt.id,
                    rt.report_no,
                    rt.report_date,
                    rt.fund_source_id,
                    rt.date_from,
                    rt.date_to,
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

                FROM rcd_transaction rt

                LEFT JOIN fund_sources fs
                    ON fs.id = rt.fund_source_id

                LEFT JOIN users u
                    ON u.id = rt.rcd_by

                WHERE rt.id = $1

                LIMIT 1
                `,
                [id]
            );

        if (
            rcdResult.rows.length === 0
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "RCD was not found.",
                },
                {
                    status: 404,
                }
            );
        }

        const rcd =
            rcdResult.rows[0];

        // ============================================================
        // RCD ITEMS
        // ============================================================

        const itemsResult =
            await client.query(
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

                    sbr.beginning_or
                        AS booklet_beginning_or,

                    sbr.ending_or
                        AS booklet_ending_or,

                    sbr.current_or
                        AS booklet_current_or

                FROM rcd_items ri

                LEFT JOIN dipp_transactions dt
                    ON dt.id =
                        ri.dipp_transaction_id

                LEFT JOIN accountable_forms af
                    ON af.id =
                        dt.accountable_form_id

                LEFT JOIN smi_booklet_registration sbr
                    ON sbr.id =
                        dt.booklet_registration_id

                WHERE
                    ri.rcd_transaction_id = $1

                ORDER BY
                    ri.receipt_date ASC,
                    ri.or_number ASC
                `,
                [id]
            );

        const items =
            itemsResult.rows;

        // ============================================================
        // COLLECTORS
        //
        // IMPORTANT:
        // Your users table uses full_name.
        // Do NOT use first_name/middle_name/last_name/suffix.
        // ============================================================

        const collectorIds =
            Array.from(
                new Set(
                    items
                        .map(
                            (item: any) =>
                                item.collector_id
                        )
                        .filter(Boolean)
                )
            );

        let collectors: any[] = [];

        if (
            collectorIds.length > 0
        ) {
            const collectorResult =
                await client.query(
                    `
                    SELECT
                        id,
                        username,
                        full_name

                    FROM users

                    WHERE id =
                        ANY($1::uuid[])
                    `,
                    [collectorIds]
                );

            collectors =
                collectorResult.rows;
        }

        // ============================================================
        // COLLECTOR MAP
        // ============================================================

        const collectorMap =
            new Map<string, any>();

        for (
            const collector
            of collectors
        ) {
            collectorMap.set(
                String(
                    collector.id
                ),
                collector
            );
        }

        // ============================================================
        // ATTACH COLLECTOR
        // ============================================================

        const detailedItems =
            items.map(
                (item: any) => ({
                    ...item,

                    collector:
                        item.collector_id
                            ? collectorMap.get(
                                String(
                                    item.collector_id
                                )
                            ) ?? null
                            : null,
                })
            );

        // ============================================================
        // RCD USER / ACCOUNTABLE OFFICER
        //
        // IMPORTANT:
        // Use full_name.
        // ============================================================

        let rcdUser: any = null;

        if (rcd.rcd_by) {
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
                    [rcd.rcd_by]
                );

            rcdUser =
                userResult.rows[0] ??
                null;
        }

        // ============================================================
        // REMITTANCE
        // ============================================================

        const remittanceResult =
            await client.query(
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

                FROM rcd_remittance rr

                WHERE
                    rr.rcd_transaction_id = $1

                ORDER BY
                    rr.created_at DESC

                LIMIT 1
                `,
                [id]
            );

        let remittance =
            remittanceResult.rows[0] ??
            null;

        // ============================================================
        // REMITTED BY NAME
        //
        // IMPORTANT:
        // Use full_name.
        // ============================================================

        if (
            remittance?.remitted_by
        ) {
            const remittedByResult =
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
                        remittance.remitted_by,
                    ]
                );

            const remittedBy =
                remittedByResult.rows[0] ??
                null;

            remittance = {
                ...remittance,

                remitted_by_name:
                    remittedBy?.full_name ??
                    remittedBy?.username ??
                    "—",
            };
        }

        // ============================================================
        // CREATED BY NAME
        // ============================================================

        if (
            remittance?.created_by
        ) {
            const createdByResult =
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
                        remittance.created_by,
                    ]
                );

            const createdBy =
                createdByResult.rows[0] ??
                null;

            remittance = {
                ...remittance,

                created_by_name:
                    createdBy?.full_name ??
                    createdBy?.username ??
                    "—",
            };
        }

        // ============================================================
        // DENOMINATIONS
        // ============================================================
        //
        // Keep this query isolated so denomination retrieval
        // remains independent from the main RCD query.
        //
        // If your actual denomination table/columns differ,
        // this is the ONLY section we need to change.
        // ============================================================

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

                        FROM rcd_remittance_denominations

                        WHERE
                            remittance_id = $1

                        ORDER BY
                            denomination DESC
                        `,
                        [
                            remittance.id,
                        ]
                    );

                denominations =
                    denominationResult.rows;

            } catch (error: any) {
                /*
                ====================================================
                IMPORTANT
                ====================================================

                Do NOT make the entire RCD preview fail if the
                denomination table has a different structure.

                The RCD itself can still be displayed.
                ====================================================
                */

                console.error(
                    "LOAD RCD DENOMINATIONS ERROR:",
                    error
                );

                denominations = [];
            }
        }

        // ============================================================
        // PREVIOUS FORM ROWS
        // ============================================================

        const previousFormRows =
            buildPreviousFormRows(
                detailedItems
            );

        // ============================================================
        // FUND SOURCE
        // ============================================================

        const fundSource = {
            id:
                rcd.fund_source_id,

            fund_code:
                rcd.fund_code ??
                null,

            fund_name:
                rcd.fund_name ??
                null,

            acronym:
                rcd.acronym ??
                null,
        };

        // ============================================================
        // FINAL RESPONSE
        // ============================================================

        return NextResponse.json(
            {
                success: true,

                rcd: {
                    ...rcd,

                    fund_source:
                        fundSource,
                },

                items:
                    detailedItems,

                remittance,

                denominations,

                user:
                    rcdUser,

                previousFormRows,
            },
            {
                status: 200,
            }
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
            {
                status: 500,
            }
        );

    } finally {
        client.release();
    }
}


/*
================================================================
BUILD PREVIOUS FORM ROWS
================================================================
*/

function buildPreviousFormRows(
    items: any[]
) {
    if (
        !Array.isArray(items) ||
        items.length === 0
    ) {
        return [];
    }

    const groups =
        new Map<
            string,
            any[]
        >();

    for (
        const item
        of items
    ) {
        const formCode =
            String(
                item.form_code ??
                item.form_name ??
                "—"
            ).trim();

        if (
            !groups.has(
                formCode
            )
        ) {
            groups.set(
                formCode,
                []
            );
        }

        groups
            .get(formCode)!
            .push(item);
    }

    const rows: any[] = [];

    for (
        const [
            formCode,
            groupItems,
        ]
        of groups
    ) {
        const numbers =
            groupItems
                .map(
                    (item: any) =>
                        parseORNumber(
                            item.or_number
                        )
                )
                .filter(
                    (
                        value
                    ): value is number =>
                        value !== null
                )
                .sort(
                    (
                        a,
                        b
                    ) =>
                        a - b
                );

        if (
            numbers.length === 0
        ) {
            rows.push({
                formCode,
                beginningFrom: null,
                beginningTo: null,
                endingFrom: null,
                endingTo: null,
            });

            continue;
        }

        const first =
            numbers[0];

        const last =
            numbers[
                numbers.length - 1
            ];

        const bookletItem =
            groupItems.find(
                (item: any) =>
                    item.booklet_registration_id
            ) ??
            groupItems[0];

        const bookletEnding =
            parseORNumber(
                bookletItem?.booklet_ending_or
            );

        const serialWidth =
            Math.max(
                String(
                    first
                ).length,

                bookletEnding !== null
                    ? String(
                        bookletEnding
                    ).length
                    : 0
            );

        const beginningFrom =
            String(
                first
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

        let endingFrom:
            string | null = null;

        let endingTo:
            string | null = null;

        if (
            bookletEnding !== null &&
            last < bookletEnding
        ) {
            endingFrom =
                String(
                    last + 1
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


/*
================================================================
PARSE OR NUMBER
================================================================
*/

function parseORNumber(
    value: any
): number | null {
    if (
        value === null ||
        value === undefined
    ) {
        return null;
    }

    const stringValue =
        String(
            value
        ).trim();

    if (!stringValue) {
        return null;
    }

    const match =
        stringValue.match(
            /\d+/
        );

    if (!match) {
        return null;
    }

    const number =
        Number(
            match[0]
        );

    if (
        !Number.isFinite(
            number
        )
    ) {
        return null;
    }

    return number;
}