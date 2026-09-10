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

        const fiscalYear =
            Number(
                req.nextUrl.searchParams.get("fiscal_year")
                || new Date().getFullYear()
            );

        /*
        |--------------------------------------------------------------------------
        | Get Logged-in User
        |--------------------------------------------------------------------------
        |
        | encoded_by contains the ID of the user who encoded the transaction.
        |
        */

        const encodedBy =
            user?.id ||
            user?.user_id;

        if (!encodedBy) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unable to determine logged-in user.",
                },
                {
                    status: 401,
                }
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Get Collection Summary
        |--------------------------------------------------------------------------
        |
        | IMPORTANT:
        | Only transactions encoded by the logged-in user are included.
        |
        */

        const result = await pool.query(
            `
            SELECT

                EXTRACT(
                    MONTH FROM dt.receipt_date
                )::INT AS month,

                af.form_code,

                COUNT(*)::INT AS receipts,

                COALESCE(
                    SUM(dt.grand_total),
                    0
                )::NUMERIC AS amount

            FROM dipp_transactions dt

            INNER JOIN accountable_forms af
                ON af.id = dt.accountable_form_id

            WHERE

                dt.is_cancelled = FALSE

            AND

                EXTRACT(
                    YEAR FROM dt.receipt_date
                ) = $1

            AND

                dt.encoded_by = $2

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
                encodedBy,
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

        /*
        |--------------------------------------------------------------------------
        | Get Available Years
        |--------------------------------------------------------------------------
        |
        | Also filter this by encoded_by so the year dropdown only
        | contains years where THIS USER has transactions.
        |
        */

        const yearResult = await pool.query(
            `
            SELECT DISTINCT

                EXTRACT(
                    YEAR FROM receipt_date
                )::INT AS year

            FROM dipp_transactions

            WHERE

                is_cancelled = FALSE

            AND

                encoded_by = $1

            ORDER BY

                year DESC
            `,
            [
                encodedBy,
            ]
        );

        const years = yearResult.rows.map(
            (r: any) =>
                Number(r.year)
        );

        /*
        |--------------------------------------------------------------------------
        | Load All Active Accountable Forms
        |--------------------------------------------------------------------------
        */

        const formResult = await pool.query(
            `
            SELECT

                form_code

            FROM accountable_forms

            WHERE is_active = TRUE

            ORDER BY form_code
            `
        );

        const forms = formResult.rows.map(
            (r: any) =>
                r.form_code
        );

        /*
        |--------------------------------------------------------------------------
        | Build Monthly Matrix
        |--------------------------------------------------------------------------
        */

        const rows = monthNames.map(
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
                    form => {
                        row[form] = 0;
                    }
                );

                /*
                |--------------------------------------------------------------------------
                | Fill Values From Query
                |--------------------------------------------------------------------------
                */

                result.rows
                    .filter(
                        (r: any) =>
                            Number(r.month) ===
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

            fiscal_year:
                fiscalYear,

            forms,

            rows,

            years,

        });

    } catch (err: any) {

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