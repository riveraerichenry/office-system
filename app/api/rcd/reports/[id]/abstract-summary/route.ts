import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(
    request: NextRequest,
    {
        params,
    }: {
        params: Promise<{
            id: string;
        }>;
    }
) {
    const client = await pool.connect();

    try {
        const { id } = await params;

        console.log(
            "ABSTRACT SUMMARY RCD ID:",
            id
        );

        if (!id) {
            return NextResponse.json(
                {
                    success: false,
                    error: "RCD ID is required.",
                },
                {
                    status: 400,
                }
            );
        }

        const result = await client.query(
            `
            SELECT
                a.id AS account_id,
                a.account_code,
                a.account_name,
                COALESCE(
                    SUM(dti.amount),
                    0
                ) AS amount

            FROM rcd_transaction rcd

            INNER JOIN dipp_transactions dt
                ON dt.remittance_id = rcd.id

            INNER JOIN dipp_transaction_items dti
                ON dti.transaction_id = dt.id

            INNER JOIN accounts a
                ON a.id = dti.account_id

            WHERE rcd.id = $1

            GROUP BY
                a.id,
                a.account_code,
                a.account_name

            ORDER BY
                a.account_code
            `,
            [id]
        );

        console.log(
            "ABSTRACT SUMMARY ROWS:",
            result.rows
        );

        const grandTotal: number =
            result.rows.reduce(
                (
                    total: number,
                    row: any
                ) =>
                    total +
                    Number(
                        row?.amount ?? 0
                    ),
                0
            );

        return NextResponse.json({
            success: true,
            rcd_id: id,
            items: result.rows,
            grand_total: grandTotal,
            count: result.rows.length,
        });

    } catch (error) {

        console.error(
            "GET ABSTRACT SUMMARY ERROR:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                error:
                    "Failed to load Abstract Summary.",
            },
            {
                status: 500,
            }
        );

    } finally {

        client.release();

    }
}