import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

/* =========================================================
   PUT - UPDATE ACCOUNT
   URL:
   /api/dipp/accounts/:id
========================================================= */

export async function PUT(
    request: NextRequest,
    context: {
        params: Promise<{
            id: string;
        }>;
    }
) {
    try {
        const { id } = await context.params;

        if (!id) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Account ID is required.",
                },
                {
                    status: 400,
                }
            );
        }

        const body = await request.json();

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

        /* =====================================================
           VALIDATE ACCOUNT NAME
        ====================================================== */

        if (
            !account_name ||
            !String(account_name).trim()
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Account name is required.",
                },
                {
                    status: 400,
                }
            );
        }

        /* =====================================================
           CHECK ACCOUNT EXISTS
        ====================================================== */

        const existing = await pool.query(
            `
            SELECT
                id,
                account_code,
                account_name
            FROM accounts
            WHERE id = $1
            LIMIT 1
            `,
            [id]
        );

        if (existing.rows.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Account not found.",
                },
                {
                    status: 404,
                }
            );
        }

        /* =====================================================
           PREVENT SELF AS PARENT
        ====================================================== */

        if (
            parent_id &&
            String(parent_id) === String(id)
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "An account cannot be its own parent.",
                },
                {
                    status: 400,
                }
            );
        }

        /* =====================================================
           CHECK DUPLICATE ACCOUNT CODE
        ====================================================== */

        if (
            account_code &&
            String(account_code).trim()
        ) {
            const duplicate = await pool.query(
                `
                SELECT id
                FROM accounts
                WHERE account_code = $1
                AND id <> $2
                LIMIT 1
                `,
                [
                    String(account_code).trim(),
                    id,
                ]
            );

            if (duplicate.rows.length > 0) {
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

        /* =====================================================
           CHECK PARENT EXISTS
        ====================================================== */

        if (parent_id) {
            const parent = await pool.query(
                `
                SELECT
                    id,
                    account_name,
                    is_active
                FROM accounts
                WHERE id = $1
                LIMIT 1
                `,
                [parent_id]
            );

            if (parent.rows.length === 0) {
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

            if (
                parent.rows[0].is_active === false
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

        /* =====================================================
           UPDATE
        ====================================================== */

        const result = await pool.query(
            `
            UPDATE accounts
            SET
                parent_id = $1,
                account_code = $2,
                account_name = $3,
                class_name = $4,
                title_name = $5,
                type_name = $6,
                account_level = $7,
                sort_order = $8,
                is_postable = $9,
                is_active = $10,
                updated_at = NOW()
            WHERE id = $11
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

                account_level === "" ||
                account_level === null ||
                account_level === undefined
                    ? null
                    : Number(account_level),

                sort_order === "" ||
                sort_order === null ||
                sort_order === undefined
                    ? null
                    : Number(sort_order),

                is_postable ?? false,

                is_active ?? true,

                id,
            ]
        );

        return NextResponse.json({
            success: true,
            message:
                "Account updated successfully.",
            data: result.rows[0],
        });

    } catch (err: any) {

        console.error(
            "PUT /api/dipp/accounts/[id]:",
            err
        );

        /* =====================================================
           DUPLICATE KEY
        ====================================================== */

        if (err?.code === "23505") {
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

        /* =====================================================
           FOREIGN KEY
        ====================================================== */

        if (err?.code === "23503") {
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
                    "Failed to update account.",
            },
            {
                status: 500,
            }
        );
    }
}


/* =========================================================
   DELETE - DEACTIVATE ACCOUNT

   URL:
   DELETE /api/dipp/accounts/:id

   NOTE:
   This does NOT physically delete the account.
   It sets is_active = FALSE.
========================================================= */

export async function DELETE(
    request: NextRequest,
    context: {
        params: Promise<{
            id: string;
        }>;
    }
) {
    try {
        const { id } = await context.params;

        if (!id) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Account ID is required.",
                },
                {
                    status: 400,
                }
            );
        }

        /* =====================================================
           CHECK ACCOUNT EXISTS
        ====================================================== */

        const existing = await pool.query(
            `
            SELECT
                id,
                account_code,
                account_name,
                is_active
            FROM accounts
            WHERE id = $1
            LIMIT 1
            `,
            [id]
        );

        if (existing.rows.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Account not found.",
                },
                {
                    status: 404,
                }
            );
        }

        /* =====================================================
           ALREADY INACTIVE
        ====================================================== */

        if (
            existing.rows[0].is_active === false
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Account is already inactive.",
                },
                {
                    status: 400,
                }
            );
        }

        /* =====================================================
           CHECK CHILD ACCOUNTS
           
           We don't want to deactivate a parent while
           active child accounts still depend on it.
        ====================================================== */

        const children = await pool.query(
            `
            SELECT
                id,
                account_code,
                account_name
            FROM accounts
            WHERE parent_id = $1
            AND is_active = TRUE
            ORDER BY account_code
            `,
            [id]
        );

        if (children.rows.length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "This account cannot be deactivated because it has active child accounts.",
                    children:
                        children.rows,
                },
                {
                    status: 409,
                }
            );
        }

        /* =====================================================
           DEACTIVATE
        ====================================================== */

        const result = await pool.query(
            `
            UPDATE accounts
            SET
                is_active = FALSE,
                updated_at = NOW()
            WHERE id = $1
            RETURNING
                id,
                account_code,
                account_name,
                is_active
            `,
            [id]
        );

        return NextResponse.json({
            success: true,
            message:
                "Account deactivated successfully.",
            data: result.rows[0],
        });

    } catch (err: any) {

        console.error(
            "DELETE /api/dipp/accounts/[id]:",
            err
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    err?.message ||
                    "Failed to deactivate account.",
            },
            {
                status: 500,
            }
        );
    }
}