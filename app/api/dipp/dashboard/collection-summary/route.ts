import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/authorize";
import { pool } from "@/lib/db";
import { MODULE_PATHS } from "@/lib/module-paths";

export async function GET(
    req: NextRequest
) {

    try {

        await authorize(
            req,
            MODULE_PATHS.DIPP,
            "view"
        );

        const month = Number(

            req.nextUrl.searchParams.get("month") ||

            new Date().getMonth() + 1

        );

        const year = Number(

            req.nextUrl.searchParams.get("year") ||

            new Date().getFullYear()

        );

        const result =
            await pool.query(

                `

                SELECT

                    af.form_code,

                    af.form_name,

                    COUNT(dt.id)::INT
                        AS receipts,

                    COALESCE(

                        SUM(dt.grand_total),

                        0

                    )::NUMERIC
                        AS amount

                FROM accountable_forms af

                LEFT JOIN dipp_transactions dt

                    ON dt.accountable_form_id = af.id

                    AND dt.is_cancelled = FALSE

                    AND EXTRACT(
                        MONTH FROM dt.receipt_date
                    ) = $1

                    AND EXTRACT(
                        YEAR FROM dt.receipt_date
                    ) = $2

                GROUP BY

                    af.id,

                    af.form_code,

                    af.form_name

                ORDER BY

                    af.form_code

                `,

                [

                    month,

                    year,

                ]

            );

        const totalReceipts =
            result.rows.reduce(

                (

                    sum,

                    row

                ) =>

                    sum +

                    Number(

                        row.receipts

                    ),

                0

            );

        const totalAmount =
            result.rows.reduce(

                (

                    sum,

                    row

                ) =>

                    sum +

                    Number(

                        row.amount

                    ),

                0

            );

        return NextResponse.json({

            success: true,

            rows: result.rows,

            totalReceipts,

            totalAmount,

        });

    }

    catch (err: any) {

        console.error(err);

        return NextResponse.json(

            {

                success: false,

                message: err.message,

            },

            {

                status: 500,

            }

        );

    }

}