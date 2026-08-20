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


/*
=========================================================
JWT PAYLOAD
=========================================================
*/

type JwtPayload = {
    id?: string;
    username?: string;
    full_name?: string;
};


/*
=========================================================
HELPERS
=========================================================
*/

function toNumber(
    value: unknown
): number {

    const number =
        Number(
            value ?? 0
        );

    if (
        !Number.isFinite(
            number
        )
    ) {
        return 0;
    }

    return number;
}


function toCents(
    value: unknown
): number {

    return Math.round(
        toNumber(value) * 100
    );
}


/*
=========================================================
GET
=========================================================
*/

export async function GET(
    request: NextRequest
) {

    const client =
        await pool.connect();

    try {

        /*
        =================================================
        AUTHENTICATION
        =================================================
        */

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


        /*
        =================================================
        QUERY PARAMETERS
        =================================================
        */

        const {
            searchParams,
        } = new URL(
            request.url
        );


        const dateFrom =
            searchParams.get(
                "date_from"
            );

        const dateTo =
            searchParams.get(
                "date_to"
            );

        const fundSourceId =
            searchParams.get(
                "fund_source_id"
            );

        const search =
            searchParams.get(
                "search"
            );


        /*
        =================================================
        BUILD QUERY
        =================================================
        */

        const conditions: string[] = [];

        const values: any[] = [];

        let parameterIndex = 1;


        if (dateFrom) {

            conditions.push(
                `
                rt.report_date >=
                $${parameterIndex}::date
                `
            );

            values.push(
                dateFrom
            );

            parameterIndex++;

        }


        if (dateTo) {

            conditions.push(
                `
                rt.report_date <=
                $${parameterIndex}::date
                `
            );

            values.push(
                dateTo
            );

            parameterIndex++;

        }


        if (fundSourceId) {

            conditions.push(
                `
                rt.fund_source_id =
                $${parameterIndex}
                `
            );

            values.push(
                fundSourceId
            );

            parameterIndex++;

        }


        if (search) {

            conditions.push(
                `
                (
                    rt.report_no ILIKE
                    $${parameterIndex}

                    OR

                    COALESCE(
                        fs.fund_code,
                        ''
                    ) ILIKE
                    $${parameterIndex}

                    OR

                    COALESCE(
                        fs.fund_name,
                        ''
                    ) ILIKE
                    $${parameterIndex}

                    OR

                    COALESCE(
                        fs.acronym,
                        ''
                    ) ILIKE
                    $${parameterIndex}
                )
                `
            );

            values.push(
                `%${search}%`
            );

            parameterIndex++;

        }


        const whereClause =
            conditions.length > 0
                ? `
                    WHERE
                    ${conditions.join(
                        " AND "
                    )}
                `
                : "";


        /*
        =================================================
        GET RCDs
        =================================================
        */

        const result =
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

                    fs.fund_code,
                    fs.fund_name,
                    fs.acronym,

                    rr.id
                        AS remittance_id,

                    rr.payment_type,
                    rr.cash_amount,
                    rr.check_amount,

                    rr.total_amount
                        AS remittance_total_amount,

                    rr.report_date
                        AS remittance_report_date,

                    rr.remitted_by
                        AS remittance_remitted_by,

                    remitter.full_name
                        AS remitted_by_name,

                    rr.created_by
                        AS remittance_created_by,

                    rr.created_at
                        AS remittance_created_at,


                    COALESCE(
                        (
                            SELECT
                                jsonb_object_agg(
                                    rd.denomination::text,
                                    rd.quantity
                                )
                            FROM
                                rcd_remittance_denominations rd
                            WHERE
                                rd.remittance_id =
                                rr.id
                        ),
                        '{}'::jsonb
                    )
                        AS remittance_denominations,


                    COALESCE(
                        (
                            SELECT
                                SUM(
                                    rd.amount
                                )
                            FROM
                                rcd_remittance_denominations rd
                            WHERE
                                rd.remittance_id =
                                rr.id
                        ),
                        0
                    )
                        AS remittance_denomination_total


                FROM
                    rcd_transaction rt

                LEFT JOIN fund_sources fs
                    ON fs.id =
                    rt.fund_source_id

                LEFT JOIN rcd_remittance rr
                    ON rr.rcd_transaction_id =
                    rt.id

                LEFT JOIN users remitter
                    ON remitter.id =
                    rr.remitted_by

                ${whereClause}

                ORDER BY
                    rt.report_date DESC,
                    rt.created_at DESC
                `,
                values
            );


        /*
        =================================================
        RESPONSE
        =================================================
        */

        const rcds =
            result.rows.map(
                row => ({

                    id:
                        row.id,

                    report_no:
                        row.report_no,

                    report_date:
                        row.report_date,

                    fund_source_id:
                        row.fund_source_id,

                    date_from:
                        row.date_from,

                    date_to:
                        row.date_to,

                    total_collections:
                        Number(
                            row.total_collections ??
                            0
                        ),

                    total_remittances:
                        Number(
                            row.total_remittances ??
                            0
                        ),

                    total_deposits:
                        Number(
                            row.total_deposits ??
                            0
                        ),

                    balance:
                        Number(
                            row.balance ??
                            0
                        ),

                    status:
                        row.status,

                    rcd_by:
                        row.rcd_by,

                    fund_code:
                        row.fund_code,

                    fund_name:
                        row.fund_name,

                    acronym:
                        row.acronym,

                    has_remittance:
                        !!row.remittance_id,

                    remittance:
                        row.remittance_id
                            ? {

                                id:
                                    row.remittance_id,

                                report_no:
                                    row.report_no,

                                payment_type:
                                    row.payment_type,

                                cash_amount:
                                    Number(
                                        row.cash_amount ??
                                        0
                                    ),

                                check_amount:
                                    Number(
                                        row.check_amount ??
                                        0
                                    ),

                                total_amount:
                                    Number(
                                        row.remittance_total_amount ??
                                        0
                                    ),

                                report_date:
                                    row.remittance_report_date,

                                remitted_by:
                                    row.remittance_remitted_by,

                                remitted_by_name:
                                    row.remitted_by_name,

                                created_by:
                                    row.remittance_created_by,

                                created_at:
                                    row.remittance_created_at,

                                denomination_total:
                                    Number(
                                        row.remittance_denomination_total ??
                                        0
                                    ),

                                denominations:
                                    row.remittance_denominations ??
                                    {},

                            }
                            : null,

                })
            );


        return NextResponse.json(
            {
                success: true,
                data: rcds,
                count: rcds.length,
            }
        );


    } catch (
        error: any
    ) {

        console.error(
            "GET RCD REMITTANCE ERROR:",
            error
        );


        return NextResponse.json(
            {
                success: false,
                message:
                    error?.message ||
                    "Failed to load RCD remittances.",
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
=========================================================
POST
=========================================================
*/

export async function POST(
    request: NextRequest
) {

    const client =
        await pool.connect();


    try {

        /*
        =================================================
        REQUEST BODY
        =================================================
        */

        const body =
            await request.json();


        const {
            rcd_id,
            payment_type,
            cash_amount,
            check_amount,
            denominations,
        } = body;


        /*
        =================================================
        BASIC VALIDATION
        =================================================
        */

        if (!rcd_id) {

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "RCD is required.",
                },
                {
                    status: 400,
                }
            );

        }


        if (
            ![
                "CASH",
                "CHECK",
                "BOTH",
            ].includes(
                payment_type
            )
        ) {

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Invalid payment type.",
                },
                {
                    status: 400,
                }
            );

        }


        /*
        =================================================
        NORMALIZE PAYMENT AMOUNTS
        =================================================
        */

        let cashAmount =
            toNumber(
                cash_amount
            );

        let checkAmount =
            toNumber(
                check_amount
            );


        /*
        =================================================
        PAYMENT TYPE
        =================================================
        */

        if (
            payment_type ===
            "CASH"
        ) {

            checkAmount = 0;

        }


        if (
            payment_type ===
            "CHECK"
        ) {

            cashAmount = 0;

        }


        /*
        =================================================
        TOTAL
        =================================================
        */

        const totalAmount =
            cashAmount +
            checkAmount;


        /*
        =================================================
        AUTHENTICATION
        =================================================
        */

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


        /*
        =================================================
        BEGIN TRANSACTION
        =================================================
        */

        await client.query(
            "BEGIN"
        );


        /*
        =================================================
        LOCK REMITTANCE CREATION
        =================================================
        */

        await client.query(
            `
            SELECT
                pg_advisory_xact_lock(
                    hashtext(
                        'RCD_REMITTANCE_CREATION'
                    )
                )
            `
        );


        /*
        =================================================
        GET RCD
        =================================================
        */

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

                    fs.fund_code,
                    fs.fund_name,
                    fs.acronym

                FROM
                    rcd_transaction rt

                INNER JOIN fund_sources fs
                    ON fs.id =
                    rt.fund_source_id

                WHERE
                    rt.id = $1

                FOR UPDATE
                `,
                [
                    rcd_id,
                ]
            );


        if (
            rcdResult.rows.length ===
            0
        ) {

            await client.query(
                "ROLLBACK"
            );

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


        /*
        =================================================
        CHECK EXISTING REMITTANCE
        =================================================
        */

        const existingResult =
            await client.query(
                `
                SELECT
                    id,
                    rcd_transaction_id,
                    payment_type,
                    cash_amount,
                    check_amount,
                    total_amount,
                    report_date,
                    remitted_by,
                    created_by,
                    created_at

                FROM
                    rcd_remittance

                WHERE
                    rcd_transaction_id =
                    $1

                LIMIT 1

                FOR UPDATE
                `,
                [
                    rcd_id,
                ]
            );


        if (
            existingResult.rows.length >
            0
        ) {

            await client.query(
                "ROLLBACK"
            );

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "This RCD already has a remittance.",

                    remittance: {
                        ...existingResult.rows[0],
                        report_no:
                            rcd.report_no,
                    },
                },
                {
                    status: 409,
                }
            );

        }


        /*
        =================================================
        RCD AMOUNT
        =================================================
        */

        const rcdAmount =
            toNumber(
                rcd.total_collections
            );


        const rcdCents =
            toCents(
                rcdAmount
            );


        /*
        =================================================
        TOTAL VALIDATION
        =================================================
        */

        const cashCents =
            toCents(
                cashAmount
            );

        const checkCents =
            toCents(
                checkAmount
            );

        const totalCents =
            cashCents +
            checkCents;


        if (
            totalCents !==
            rcdCents
        ) {

            await client.query(
                "ROLLBACK"
            );

            return NextResponse.json(
                {
                    success: false,

                    message:
                        "Cash plus check must equal the RCD collection amount.",

                    rcd_amount:
                        rcdAmount,

                    cash_amount:
                        cashAmount,

                    check_amount:
                        checkAmount,

                    total_amount:
                        totalAmount,

                    difference:
                        (
                            rcdCents -
                            totalCents
                        ) / 100,
                },
                {
                    status: 400,
                }
            );

        }


        /*
        =================================================
        NORMALIZE DENOMINATIONS
        =================================================
        */

        const denominationRows: {
            denomination: number;
            quantity: number;
            amount: number;
        }[] = [];


        /*
        =================================================
        ARRAY
        =================================================
        */

        if (
            Array.isArray(
                denominations
            )
        ) {

            for (
                const item
                of denominations
            ) {

                const denomination =
                    toNumber(
                        item?.denomination
                    );

                const quantity =
                    Math.max(
                        0,
                        Math.floor(
                            toNumber(
                                item?.quantity
                            )
                        )
                    );


                if (
                    denomination <= 0 ||
                    quantity <= 0
                ) {
                    continue;
                }


                denominationRows.push({

                    denomination,

                    quantity,

                    amount:
                        denomination *
                        quantity,

                });

            }

        }


        /*
        =================================================
        OBJECT
        =================================================
        */

        else if (
            denominations &&
            typeof denominations ===
            "object"
        ) {

            for (
                const [
                    denominationKey,
                    quantityValue,
                ]
                of Object.entries(
                    denominations
                )
            ) {

                const denomination =
                    toNumber(
                        denominationKey
                    );

                const quantity =
                    Math.max(
                        0,
                        Math.floor(
                            toNumber(
                                quantityValue
                            )
                        )
                    );


                if (
                    denomination <= 0 ||
                    quantity <= 0
                ) {
                    continue;
                }


                denominationRows.push({

                    denomination,

                    quantity,

                    amount:
                        denomination *
                        quantity,

                });

            }

        }


        /*
        =================================================
        DENOMINATION TOTAL
        =================================================
        */

        const denominationTotal =
            denominationRows.reduce(
                (
                    total,
                    item
                ) =>
                    total +
                    item.amount,
                0
            );


        const denominationCents =
            toCents(
                denominationTotal
            );


        /*
        =================================================
        DENOMINATION VALIDATION
        =================================================
        */

        if (
            payment_type !==
            "CHECK"
        ) {

            if (
                denominationCents !==
                cashCents
            ) {

                await client.query(
                    "ROLLBACK"
                );

                return NextResponse.json(
                    {
                        success: false,

                        message:
                            "Cash denominations must equal the cash amount.",

                        payment_type,

                        cash_amount:
                            cashAmount,

                        denomination_total:
                            denominationTotal,

                        difference:
                            (
                                cashCents -
                                denominationCents
                            ) / 100,

                        denominations:
                            denominationRows,
                    },
                    {
                        status: 400,
                    }
                );

            }

        }


        /*
        =================================================
        CREATE REMITTANCE
        =================================================
        */

        const remittanceId =
            randomUUID();


        const remittanceResult =
            await client.query(
                `
                INSERT INTO rcd_remittance
                (
                    id,
                    rcd_transaction_id,

                    payment_type,

                    cash_amount,
                    check_amount,
                    total_amount,

                    report_date,

                    remitted_by,
                    created_by,

                    created_at,
                    updated_at
                )

                VALUES
                (
                    $1,
                    $2,

                    $3,

                    $4,
                    $5,
                    $6,

                    CURRENT_DATE,

                    $7,
                    $8,

                    CURRENT_TIMESTAMP,
                    CURRENT_TIMESTAMP
                )

                RETURNING *
                `,
                [
                    remittanceId,

                    rcd_id,

                    payment_type,

                    cashAmount,
                    checkAmount,
                    totalAmount,

                    decoded.id,
                    decoded.id,
                ]
            );


        const remittance =
            remittanceResult.rows[0];


        /*
        =================================================
        INSERT DENOMINATIONS
        =================================================
        */

        for (
            const item
            of denominationRows
        ) {

            await client.query(
                `
                INSERT INTO
                    rcd_remittance_denominations
                (
                    id,

                    remittance_id,

                    denomination,
                    quantity,
                    amount,

                    created_at
                )

                VALUES
                (
                    $1,
                    $2,

                    $3,
                    $4,
                    $5,

                    CURRENT_TIMESTAMP
                )
                `,
                [
                    randomUUID(),

                    remittanceId,

                    item.denomination,
                    item.quantity,
                    item.amount,
                ]
            );

        }


        /*
        =================================================
        UPDATE RCD
        =================================================
        */

        const newBalanceCents =
            Math.max(
                0,
                rcdCents -
                totalCents
            );


        const newBalance =
            newBalanceCents /
            100;


        await client.query(
            `
            UPDATE rcd_transaction

            SET
                total_remittances = $1,
                balance = $2,
                updated_at =
                    CURRENT_TIMESTAMP

            WHERE
                id = $3
            `,
            [
                totalAmount,
                newBalance,
                rcd_id,
            ]
        );


        /*
        =================================================
        COMMIT
        =================================================
        */

        await client.query(
            "COMMIT"
        );


        /*
        =================================================
        RESPONSE DENOMINATIONS
        =================================================
        */

        const denominationObject =
            denominationRows.reduce(
                (
                    result,
                    item
                ) => {

                    result[
                        item.denomination
                    ] =
                        item.quantity;

                    return result;

                },
                {} as Record<
                    number,
                    number
                >
            );


        /*
        =================================================
        RESPONSE
        =================================================
        */

        return NextResponse.json(
            {
                success: true,

                message:
                    "RCD remittance created successfully.",

                remittance: {

                    ...remittance,

                    report_no:
                        rcd.report_no,

                    cash_amount:
                        Number(
                            remittance.cash_amount
                        ),

                    check_amount:
                        Number(
                            remittance.check_amount
                        ),

                    total_amount:
                        Number(
                            remittance.total_amount
                        ),

                    denomination_total:
                        denominationTotal,

                    denominations:
                        denominationObject,

                },
            },
            {
                status: 201,
            }
        );


    } catch (
        error: any
    ) {

        /*
        =================================================
        ROLLBACK
        =================================================
        */

        try {

            await client.query(
                "ROLLBACK"
            );

        } catch (
            rollbackError
        ) {

            console.error(
                "RCD REMITTANCE ROLLBACK ERROR:",
                rollbackError
            );

        }


        /*
        =================================================
        DUPLICATE
        =================================================
        */

        if (
            error?.code ===
            "23505"
        ) {

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "This RCD already has a remittance.",
                },
                {
                    status: 409,
                }
            );

        }


        console.error(
            "CREATE RCD REMITTANCE ERROR:",
            error
        );


        return NextResponse.json(
            {
                success: false,

                message:
                    error?.message ||
                    "Failed to create RCD remittance.",
            },
            {
                status: 500,
            }
        );


    } finally {

        client.release();

    }

}