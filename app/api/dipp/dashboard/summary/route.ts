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

        const fiscalYear =
            Number(

                req.nextUrl.searchParams.get(
                    "fiscal_year"
                )

                ||

                new Date().getFullYear()

            );

        /*
        |--------------------------------------------------------------------------
        | Get Collection Summary
        |--------------------------------------------------------------------------
        */

        const result =
            await pool.query(

                `

                SELECT

                    EXTRACT(

                        MONTH FROM dt.receipt_date

                    )::INT

                        AS month,

                    af.form_code,

                    COUNT(*)::INT

                        AS receipts,

                    COALESCE(

                        SUM(dt.grand_total),

                        0

                    )::NUMERIC

                        AS amount

                FROM dipp_transactions dt

                INNER JOIN accountable_forms af

                    ON af.id =
                    dt.accountable_form_id

                WHERE

                    dt.is_cancelled = FALSE

                AND

                    EXTRACT(

                        YEAR FROM dt.receipt_date

                    ) = $1

                GROUP BY

                    EXTRACT(

                        MONTH FROM dt.receipt_date

                    ),

                    af.form_code

                ORDER BY

                    EXTRACT(

                        MONTH FROM dt.receipt_date

                    ),

                    af.form_code

                `,

                [

                    fiscalYear,

                ]

            );

        /*
        
        |--------------------------------------------------------------------------
        | Month Labels
        |--------------------------------------------------------------------------
        */


        const monthNames = [

            "January",

            "February",

            "March",

            "April",

            "May",

            "June",

            "July",

            "August",

            "September",

            "October",

            "November",

            "December",

        ];




        const yearResult =
    await pool.query(

        `

        SELECT DISTINCT

            EXTRACT(
                YEAR FROM receipt_date
            )::INT AS year

        FROM dipp_transactions

        WHERE

            is_cancelled = FALSE

        ORDER BY

            year DESC

        `

    );

        const years =
            yearResult.rows.map(

                (r: any) =>

                    Number(r.year)

            );

                /*
        |--------------------------------------------------------------------------
        | Load All Accountable Forms
        |--------------------------------------------------------------------------
        */


        const formResult =
            await pool.query(

                `

                SELECT

                    form_code

                FROM accountable_forms

                WHERE is_active = TRUE

                ORDER BY form_code

                `

            );

        const forms =
            formResult.rows.map(

                (r: any) =>

                    r.form_code

            );

        /*
        |--------------------------------------------------------------------------
        | Build Monthly Matrix
        |--------------------------------------------------------------------------
        */

        const rows =

            monthNames.map(

                (

                    month,

                    index

                ) => {

                    const row: any = {

                        month,

                    };

                    /*
                    |--------------------------------------------------------------------------
                    | Initialize Every Form to Zero
                    |--------------------------------------------------------------------------
                    */

                    forms.forEach(

                        form =>

                            row[form] = 0

                    );

                    /*
                    |--------------------------------------------------------------------------
                    | Fill Values From Query
                    |--------------------------------------------------------------------------
                    */

                    result.rows

                        .filter(

                            (r: any) =>

                                Number(

                                    r.month

                                ) ===

                                index + 1

                        )

                        .forEach(

                            (r: any) => {

                                row[

                                    r.form_code

                                ] =

                                    Number(

                                        r.amount

                                    );

                            }

                        );

                    return row;

                }

            );

                    /*
        |--------------------------------------------------------------------------
        | Response
        |--------------------------------------------------------------------------
        */

        return NextResponse.json({

            success: true,

            fiscal_year: fiscalYear,

            forms,

            rows,

            years,

        });

    }

    catch (err: any) {

        console.error(

            "===================================="

        );

        console.error(

            "DIPP FISCAL YEAR SUMMARY"

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