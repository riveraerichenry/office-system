import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/authorize";
import { pool } from "@/lib/db";
import { MODULE_PATHS } from "@/lib/module-paths";

export async function GET(
    req: NextRequest
) {

    try {

        const user = await authorize(
            req,
            MODULE_PATHS.DIPP,
            "view"
        );

        /*
        |--------------------------------------------------------------------------
        | Filters
        |--------------------------------------------------------------------------
        */

        const month =
            Number(

                req.nextUrl.searchParams.get("month")

                ||

                new Date().getMonth() + 1

            );

        const year =
            Number(

                req.nextUrl.searchParams.get("year")

                ||

                new Date().getFullYear()

            );

        const page =
            Number(

                req.nextUrl.searchParams.get("page")

                ||

                1

            );

        const pageSize =
            Number(

                req.nextUrl.searchParams.get("pageSize")

                ||

                5

            );

        const search =
            req.nextUrl.searchParams.get("search") || "";

        const offset =
            (page - 1) * pageSize;

        /*
        |--------------------------------------------------------------------------
        | Where Clause
        |--------------------------------------------------------------------------
        */

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

        // Non-admin users only see their own transactions
            params.push(user.id);

            where += `

                AND dt.encoded_by = $${params.length}

            `;

        if (search) {

            params.push(`%${search}%`);

            where += `

                AND (

                    dt.or_number ILIKE $${params.length}

                    OR

                    dt.payor ILIKE $${params.length}

                    OR

                    af.form_code ILIKE $${params.length}

                )

            `;

        }

                /*
        |--------------------------------------------------------------------------
        | Count Total Records
        |--------------------------------------------------------------------------
        */

        const countResult =
            await pool.query(

                `

                SELECT

                    COUNT(*)::INT
                        AS total

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

                countResult.rows[0].total

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
        | Main Query
        |--------------------------------------------------------------------------
        */

        params.push(

            pageSize,

            offset

        );

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

                LIMIT $${params.length - 1}

                OFFSET $${params.length}

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

        const totalAmount =
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

            page,

            pageSize,

            totalRecords,

            totalPages,

            totalReceipts,

            totalAmount,

        });

    }

    catch (err: any) {

        console.error(
            "===================================="
        );

        console.error(
            "DIPP DAILY COLLECTIONS"
        );

        console.error(err);

        console.error(
            "===================================="
        );

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