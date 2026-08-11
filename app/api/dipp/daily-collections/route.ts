import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/authorize";
import { pool } from "@/lib/db";
import { MODULE_PATHS } from "@/lib/module-paths";

export async function GET(req: NextRequest) {
    try {
        const user = await authorize(
            req,
            MODULE_PATHS.DIPP,
            "view"
        );

        const view =
            req.nextUrl.searchParams.get("view") ||
            "daily";

        const page = Math.max(
            1,
            Number(
                req.nextUrl.searchParams.get("page") || 1
            )
        );

        const pageSize = Math.max(
            1,
            Number(
                req.nextUrl.searchParams.get("pageSize") || 5
            )
        );

        const search =
            req.nextUrl.searchParams.get("search") || "";

        const offset =
            (page - 1) * pageSize;

        if (
            view !== "daily" &&
            view !== "monthly"
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Invalid view.",
                },
                {
                    status: 400,
                }
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Base Parameters
        |--------------------------------------------------------------------------
        */

        const params: any[] = [
            user.id,
        ];

        /*
        |--------------------------------------------------------------------------
        | Base WHERE
        |--------------------------------------------------------------------------
        */

        let where = `
            WHERE
                dt.is_cancelled = FALSE

                AND dt.encoded_by = $1
        `;

        /*
        |--------------------------------------------------------------------------
        | DAILY
        |--------------------------------------------------------------------------
        |
        | ONLY TODAY
        |
        */

        if (view === "daily") {
            where += `
                AND dt.receipt_date = (
                    CURRENT_TIMESTAMP
                    AT TIME ZONE 'Asia/Manila'
                )::date
            `;
        }

        /*
        |--------------------------------------------------------------------------
        | MONTHLY
        |--------------------------------------------------------------------------
        |
        | ENTIRE CURRENT MONTH
        |
        | Example:
        |
        | 2026-08-01
        | through
        | 2026-08-31
        |
        */

        if (view === "monthly") {
            where += `
                AND dt.receipt_date >=
                    DATE_TRUNC(
                        'month',
                        (
                            CURRENT_TIMESTAMP
                            AT TIME ZONE 'Asia/Manila'
                        )::date
                    )::date

                AND dt.receipt_date <
                    (
                        DATE_TRUNC(
                            'month',
                            (
                                CURRENT_TIMESTAMP
                                AT TIME ZONE 'Asia/Manila'
                            )::date
                        )
                        + INTERVAL '1 month'
                    )::date
            `;
        }

        /*
        |--------------------------------------------------------------------------
        | Search
        |--------------------------------------------------------------------------
        */

        if (search.trim()) {
            params.push(
                `%${search.trim()}%`
            );

            where += `
                AND (
                    dt.or_number ILIKE $${params.length}

                    OR dt.payor ILIKE $${params.length}

                    OR af.form_code ILIKE $${params.length}

                    OR af.form_name ILIKE $${params.length}
                )
            `;
        }

        /*
        |--------------------------------------------------------------------------
        | COUNT
        |--------------------------------------------------------------------------
        */

        const countResult =
            await pool.query(
                `
                SELECT
                    COUNT(*)::INT AS total

                FROM dipp_transactions dt

                INNER JOIN accountable_forms af
                    ON af.id =
                       dt.accountable_form_id

                ${where}
                `,
                params
            );

        const totalRecords =
            Number(
                countResult.rows[0]?.total || 0
            );

        const totalPages =
            Math.max(
                1,
                Math.ceil(
                    totalRecords /
                    pageSize
                )
            );

        /*
        |--------------------------------------------------------------------------
        | TOTAL AMOUNT
        |--------------------------------------------------------------------------
        */

        const totalResult =
            await pool.query(
                `
                SELECT
                    COALESCE(
                        SUM(
                            dt.grand_total
                        ),
                        0
                    ) AS total_amount

                FROM dipp_transactions dt

                INNER JOIN accountable_forms af
                    ON af.id =
                       dt.accountable_form_id

                ${where}
                `,
                params
            );

        const totalAmount =
            Number(
                totalResult.rows[0]
                    ?.total_amount || 0
            );

        /*
        |--------------------------------------------------------------------------
        | TRANSACTIONS
        |--------------------------------------------------------------------------
        */

        const dataParams = [
            ...params,
            pageSize,
            offset,
        ];

        const limitPosition =
            dataParams.length - 1;

        const offsetPosition =
            dataParams.length;

        const result =
            await pool.query(
                `
                SELECT

                    dt.id,

                    dt.or_number,

                    dt.payor,

                    dt.receipt_date,

                    dt.payment_mode,

                    dt.grand_total,

                    dt.status,

                    dt.transaction_type,

                    af.form_code,

                    af.form_name,

                    u.full_name
                        AS encoded_by

                FROM dipp_transactions dt

                INNER JOIN accountable_forms af
                    ON af.id =
                       dt.accountable_form_id

                LEFT JOIN users u
                    ON u.id =
                       dt.encoded_by

                ${where}

                ORDER BY
                    dt.receipt_date DESC,
                    dt.or_number DESC

                LIMIT $${limitPosition}

                OFFSET $${offsetPosition}
                `,
                dataParams
            );

        /*
        |--------------------------------------------------------------------------
        | RESPONSE
        |--------------------------------------------------------------------------
        */

        return NextResponse.json({
            success: true,

            view,

            rows: result.rows,

            page,

            pageSize,

            totalRecords,

            totalPages,

            totalReceipts:
                totalRecords,

            totalAmount,
        });
    } catch (err: any) {
        console.error(
            "===================================="
        );

        console.error(
            "DIPP COLLECTIONS"
        );

        console.error(err);

        console.error(
            "===================================="
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    err?.message ||
                    "Failed to load collections.",
            },
            {
                status: 500,
            }
        );
    }
}