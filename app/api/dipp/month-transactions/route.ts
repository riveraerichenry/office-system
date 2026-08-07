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

        const month =
            Number(
                req.nextUrl.searchParams.get("month")
            );

        const year =
            Number(
                req.nextUrl.searchParams.get("year")
            );

        const formCode =
            req.nextUrl.searchParams.get("form_code");

        const search =
            req.nextUrl.searchParams.get("search") || "";

        const params: any[] = [

            month,

            year,

        ];

        let where = `

            WHERE

                dt.is_cancelled = FALSE

            AND

                EXTRACT(
                    MONTH FROM dt.receipt_date
                ) = $1

            AND

                EXTRACT(
                    YEAR FROM dt.receipt_date
                ) = $2

        `;

        /*
        |--------------------------------------------------------------------------
        | Optional Form Filter
        |--------------------------------------------------------------------------
        */

        if (formCode) {

            params.push(formCode);

            where += `

                AND

                    af.form_code = $${params.length}

            `;

        }

        /*
        |--------------------------------------------------------------------------
        | Search
        |--------------------------------------------------------------------------
        */

        if (search) {

            params.push(`%${search}%`);

            where += `

                AND (

                    dt.or_number ILIKE $${params.length}

                    OR

                    dt.payor ILIKE $${params.length}

                )

            `;

        }

                /*
        |--------------------------------------------------------------------------
        | Transactions
        |--------------------------------------------------------------------------
        */

        const result =
            await pool.query(

                `

                SELECT

                    dt.id,

                    dt.or_number,

                    dt.receipt_date,

                    dt.payor,

                    dt.payment_mode,

                    dt.grand_total,

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

                    CAST(
                        dt.or_number AS BIGINT
                    ) DESC

                `,

                params

            );

        /*
        |--------------------------------------------------------------------------
        | Totals
        |--------------------------------------------------------------------------
        */

        const totalReceipts =
            result.rows.length;

        const grandTotal =
            result.rows.reduce(

                (

                    total,

                    row

                ) =>

                    total +

                    Number(

                        row.grand_total

                    ),

                0

            );

        /*
        |--------------------------------------------------------------------------
        | Response
        |--------------------------------------------------------------------------
        */

        return NextResponse.json({

            success: true,

            rows: result.rows,

            totalReceipts,

            grandTotal,

        });

    }

    catch (err: any) {

        console.error(

            "===================================="

        );

        console.error(

            "MONTH TRANSACTIONS"

        );

        console.error(err);

        console.error(

            "===================================="

        );

        return NextResponse.json(

            {

                success: false,

                message:

                    err.message,

            },

            {

                status: 500,

            }

        );

    }

}