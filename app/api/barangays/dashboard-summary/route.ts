import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { pool } from "@/lib/db";

interface BarangayTokenPayload {
    id: string;
    username: string;
    role: string;
    barangay_id: string | null;
    system?: string;
}

export async function GET(request: NextRequest) {
    const client = await pool.connect();

    try {
        const token = request.cookies.get("barangay_token")?.value;

        if (!token) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized.",
                },
                {
                    status: 401,
                }
            );
        }

        const secret = process.env.JWT_SECRET;

        if (!secret) {
            console.error("JWT_SECRET is not configured.");

            return NextResponse.json(
                {
                    success: false,
                    message: "Server configuration error.",
                },
                {
                    status: 500,
                }
            );
        }

        let decoded: BarangayTokenPayload;

        try {
            decoded = jwt.verify(
                token,
                secret
            ) as BarangayTokenPayload;
        } catch (error) {
            console.error(
                "Invalid barangay token:",
                error
            );

            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid or expired session.",
                },
                {
                    status: 401,
                }
            );
        }

        /*
         * Current logged-in Barangay user.
         *
         * barangay_token.id corresponds to
         * barangay_users.id.
         */
        const encodedBy = decoded.id;

        if (!encodedBy) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid user information.",
                },
                {
                    status: 401,
                }
            );
        }

        /*
         * Verify that the Barangay user is still active.
         */
        const userResult = await client.query(
            `
            SELECT
                bu.id,
                bu.username,
                bu.first_name,
                bu.middle_name,
                bu.last_name,
                bu.role,
                bu.barangay_id
            FROM barangay_users bu
            WHERE bu.id = $1
              AND bu.is_active = TRUE
            LIMIT 1
            `,
            [encodedBy]
        );

        if (userResult.rows.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Barangay user not found or inactive.",
                },
                {
                    status: 401,
                }
            );
        }

        /*
         * =========================================================
         * CTC-BARANGAY
         * =========================================================
         *
         * transaction_type = CTC-BARANGAY
         * encoded_by       = current Barangay user
         *
         * receipt_date is used for:
         *
         * Today      = CURRENT_DATE
         * This Month = current calendar month
         *
         * Cancelled transactions are excluded.
         */

        const ctcResult = await client.query(
            `
            SELECT
                COALESCE(
                    SUM(
                        CASE
                            WHEN receipt_date = CURRENT_DATE
                            THEN COALESCE(grand_total, 0)
                            ELSE 0
                        END
                    ),
                    0
                ) AS today_collection,

                COUNT(
                    CASE
                        WHEN receipt_date = CURRENT_DATE
                        THEN 1
                    END
                ) AS today_transactions,

                COALESCE(
                    SUM(
                        CASE
                            WHEN receipt_date >= DATE_TRUNC(
                                'month',
                                CURRENT_DATE
                            )::date
                            AND receipt_date < (
                                DATE_TRUNC(
                                    'month',
                                    CURRENT_DATE
                                ) + INTERVAL '1 month'
                            )::date
                            THEN COALESCE(grand_total, 0)
                            ELSE 0
                        END
                    ),
                    0
                ) AS monthly_collection,

                COUNT(
                    CASE
                        WHEN receipt_date >= DATE_TRUNC(
                            'month',
                            CURRENT_DATE
                        )::date
                        AND receipt_date < (
                            DATE_TRUNC(
                                'month',
                                CURRENT_DATE
                            ) + INTERVAL '1 month'
                        )::date
                        THEN 1
                    END
                ) AS monthly_transactions

            FROM dipp_transactions

            WHERE transaction_type = 'CTC-BARANGAY'
              AND encoded_by = $1
              AND COALESCE(is_cancelled, FALSE) = FALSE
            `,
            [encodedBy]
        );

        const ctc = ctcResult.rows[0];

        return NextResponse.json({
            success: true,

            user: {
                id: userResult.rows[0].id,
                username: userResult.rows[0].username,
                first_name: userResult.rows[0].first_name,
                middle_name: userResult.rows[0].middle_name,
                last_name: userResult.rows[0].last_name,
                role: userResult.rows[0].role,
                barangay_id: userResult.rows[0].barangay_id,
            },

            ctc: {
                todayCollection: Number(
                    ctc.today_collection || 0
                ),

                todayTransactions: Number(
                    ctc.today_transactions || 0
                ),

                monthlyCollection: Number(
                    ctc.monthly_collection || 0
                ),

                monthlyTransactions: Number(
                    ctc.monthly_transactions || 0
                ),
            },
        });
    } catch (error) {
        console.error(
            "Barangay dashboard summary error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message: "Failed to load dashboard summary.",
            },
            {
                status: 500,
            }
        );
    } finally {
        client.release();
    }
}