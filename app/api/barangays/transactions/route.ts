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
         * =========================================================
         * QUERY PARAMETERS
         * =========================================================
         */

        const searchParams = request.nextUrl.searchParams;

        const search =
            searchParams.get("search")?.trim() || "";

        const dateFrom =
            searchParams.get("dateFrom")?.trim() || "";

        const dateTo =
            searchParams.get("dateTo")?.trim() || "";

        const pageParam =
            Number(
                searchParams.get("page") || "1"
            );

        const limitParam =
            Number(
                searchParams.get("limit") || "10"
            );

        const page =
            Number.isFinite(pageParam) &&
            pageParam > 0
                ? Math.floor(pageParam)
                : 1;

        const limit =
            Number.isFinite(limitParam) &&
            limitParam > 0 &&
            limitParam <= 100
                ? Math.floor(limitParam)
                : 10;

        const offset = (page - 1) * limit;

        /*
         * =========================================================
         * WHERE
         * =========================================================
         */

        const conditions: string[] = [
            `transaction_type = 'CTC-BARANGAY'`,
            `encoded_by = $1`,
            `COALESCE(is_cancelled, FALSE) = FALSE`,
        ];

        const values: unknown[] = [encodedBy];

        let parameterIndex = 2;

        /*
         * SEARCH
         *
         * Search:
         * - OR number
         * - Payor
         */

        if (search) {
            conditions.push(
                `(
                    or_number ILIKE $${parameterIndex}
                    OR payor ILIKE $${parameterIndex}
                )`
            );

            values.push(`%${search}%`);

            parameterIndex++;
        }

        /*
         * DATE FROM
         */

        if (dateFrom) {
            conditions.push(
                `receipt_date >= $${parameterIndex}::date`
            );

            values.push(dateFrom);

            parameterIndex++;
        }

        /*
         * DATE TO
         */

        if (dateTo) {
            conditions.push(
                `receipt_date <= $${parameterIndex}::date`
            );

            values.push(dateTo);

            parameterIndex++;
        }

        const whereClause =
            conditions.join("\nAND ");

        /*
         * =========================================================
         * COUNT
         * =========================================================
         */

        const countQuery = `
            SELECT COUNT(*) AS total
            FROM dipp_transactions
            WHERE ${whereClause}
        `;

        const countResult = await client.query(
            countQuery,
            values
        );

        const total =
            Number(
                countResult.rows[0]?.total || 0
            );

        /*
         * =========================================================
         * TRANSACTIONS
         * =========================================================
         */

        const transactionQuery = `
            SELECT
                id,
                or_number,
                payor,
                transaction_type,
                grand_total,
                receipt_date,
                created_at,
                status,
                is_cancelled
            FROM dipp_transactions
            WHERE ${whereClause}
            ORDER BY
                receipt_date DESC,
                created_at DESC,
                id DESC
            LIMIT $${parameterIndex}
            OFFSET $${parameterIndex + 1}
        `;

        const transactionValues = [
            ...values,
            limit,
            offset,
        ];

        const transactionResult =
            await client.query(
                transactionQuery,
                transactionValues
            );

        const totalPages =
            Math.ceil(total / limit);

        return NextResponse.json({
            success: true,

            transactions:
                transactionResult.rows,

            pagination: {
                page,
                limit,
                total,
                totalPages,
            },
        });
    } catch (error) {
        console.error(
            "Barangay transactions error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to load transactions.",
            },
            {
                status: 500,
            }
        );
    } finally {
        client.release();
    }
}