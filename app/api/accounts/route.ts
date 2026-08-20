import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";



export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;

        const search = searchParams.get("search")?.trim() || "";

        const values: string[] = [];
        const conditions: string[] = [];

        if (search) {
            values.push(`%${search}%`);

            conditions.push(`
                (
                    a.account_code ILIKE $1
                    OR a.account_name ILIKE $1
                    OR COALESCE(p.account_code, '') ILIKE $1
                    OR COALESCE(p.account_name, '') ILIKE $1
                )
            `);
        }

        const where =
            conditions.length > 0
                ? `WHERE ${conditions.join(" AND ")}`
                : "";

        const result = await pool.query(
            `
            SELECT
                a.id,
                a.parent_id,

                a.account_code,
                a.account_name,

                a.class_name,
                a.title_name,
                a.type_name,

                a.account_level,
                a.sort_order,

                a.is_postable,
                a.is_active,

                a.created_by,
                a.created_at,
                a.updated_by,
                a.updated_at,

                /* PARENT ACCOUNT */
                p.account_code AS parent_code,
                p.account_name AS parent_name

            FROM accounts a

            LEFT JOIN accounts p
                ON p.id = a.parent_id

            ${where}

            ORDER BY
                COALESCE(a.sort_order, 999999),
                a.account_code ASC,
                a.account_name ASC
            `,
            values
        );

        return NextResponse.json({
            success: true,
            count: result.rows.length,
            data: result.rows,
        });

    } catch (error: any) {
        console.error(
            "GET /api/accounts error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    error?.message ||
                    "Failed to fetch accounts",
            },
            {
                status: 500,
            }
        );
    }
}


/* =========================================================
   POST - ADD ACCOUNT
========================================================= */

export async function POST(request: NextRequest) {
    try {
        const body =
            await request.json();

        const {
            parent_id,
            account_code,
            account_name,
            class_name,
            title_name,
            type_name,
            account_level,
            sort_order,
            is_postable,
            is_active,
        } = body;

        /* -----------------------------------------------------
           VALIDATION
        ----------------------------------------------------- */

        if (
            !account_name ||
            !String(account_name).trim()
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Account name is required.",
                },
                {
                    status: 400,
                }
            );
        }

        /* -----------------------------------------------------
           CHECK DUPLICATE ACCOUNT CODE
        ----------------------------------------------------- */

        if (
            account_code &&
            String(account_code).trim()
        ) {
            const duplicate =
                await pool.query(
                    `
                    SELECT id
                    FROM accounts
                    WHERE account_code = $1
                    LIMIT 1
                    `,
                    [
                        String(
                            account_code
                        ).trim(),
                    ]
                );

            /*
             * Use rows.length instead of rowCount
             * because pg defines rowCount as possibly null.
             */

            if (
                duplicate.rows.length > 0
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "Account code already exists.",
                    },
                    {
                        status: 409,
                    }
                );
            }
        }

        /* -----------------------------------------------------
           CHECK PARENT ACCOUNT
        ----------------------------------------------------- */

        if (parent_id) {
            const parent =
                await pool.query(
                    `
                    SELECT
                        id,
                        account_name,
                        is_active
                    FROM accounts
                    WHERE id = $1
                    LIMIT 1
                    `,
                    [
                        parent_id,
                    ]
                );

            if (
                parent.rows.length === 0
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "Parent account does not exist.",
                    },
                    {
                        status: 400,
                    }
                );
            }

            /*
             * Parent should normally be active.
             */

            if (
                parent.rows[0]
                    .is_active === false
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "The selected parent account is inactive.",
                    },
                    {
                        status: 400,
                    }
                );
            }
        }

        /* -----------------------------------------------------
           INSERT ACCOUNT
        ----------------------------------------------------- */

        const result =
            await pool.query(
                `
                INSERT INTO accounts (
                    parent_id,
                    account_code,
                    account_name,
                    class_name,
                    title_name,
                    type_name,
                    account_level,
                    sort_order,
                    is_postable,
                    is_active,
                    created_at,
                    updated_at
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
                    $10,
                    NOW(),
                    NOW()
                )

                RETURNING
                    id,
                    parent_id,
                    account_code,
                    account_name,
                    class_name,
                    title_name,
                    type_name,
                    account_level,
                    sort_order,
                    is_postable,
                    is_active,
                    created_at,
                    updated_at
                `,
                [
                    parent_id || null,

                    account_code
                        ? String(
                            account_code
                        ).trim()
                        : null,

                    String(
                        account_name
                    ).trim(),

                    class_name
                        ? String(
                            class_name
                        ).trim()
                        : null,

                    title_name
                        ? String(
                            title_name
                        ).trim()
                        : null,

                    type_name
                        ? String(
                            type_name
                        ).trim()
                        : null,

                    account_level ===
                        "" ||
                    account_level ===
                        null ||
                    account_level ===
                        undefined
                        ? null
                        : Number(
                            account_level
                        ),

                    sort_order ===
                        "" ||
                    sort_order ===
                        null ||
                    sort_order ===
                        undefined
                        ? null
                        : Number(
                            sort_order
                        ),

                    is_postable ??
                        false,

                    is_active ??
                        true,
                ]
            );

        return NextResponse.json(
            {
                success: true,
                message:
                    "Account added successfully.",
                data:
                    result.rows[0],
            },
            {
                status: 201,
            }
        );

    } catch (err: any) {
        console.error(
            "POST /api/accounts:",
            err
        );

        /* -----------------------------------------------------
           PostgreSQL duplicate key
        ----------------------------------------------------- */

        if (
            err?.code === "23505"
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "An account with the same value already exists.",
                },
                {
                    status: 409,
                }
            );
        }

        /* -----------------------------------------------------
           PostgreSQL foreign key
        ----------------------------------------------------- */

        if (
            err?.code === "23503"
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "The selected parent account is invalid.",
                },
                {
                    status: 400,
                }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message:
                    err?.message ||
                    "Failed to add account.",
            },
            {
                status: 500,
            }
        );
    }
}