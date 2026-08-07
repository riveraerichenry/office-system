import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/authorize";
import { pool } from "@/lib/db";
import { MODULE_PATHS } from "@/lib/module-paths";

type Context = {
    params: Promise<{
        id: string;
    }>;
};

export async function GET(
    req: NextRequest,
    { params }: Context
) {

    try {

        await authorize(
            req,
            MODULE_PATHS.DIPP,
            "view"
        );

        const { id } = await params;

        /*
        |--------------------------------------------------------------------------
        | Header
        |--------------------------------------------------------------------------
        */

        const header =
            await pool.query(
                

                

                `

                SELECT

                    dt.id,

                    dt.or_number,

                    dt.receipt_date,

                    dt.payor,

                    dt.payment_mode,

                    dt.remarks,

                    dt.grand_total,

                    dt.status,

                    dt.created_at,

                    af.form_code,

                    af.form_name,

                    sbr.control_no,

                    sbr.series,

                    collector.full_name
                        AS collector,

                    encoder.full_name
                        AS encoded_by,

                    fs.fund_code,

                    fs.fund_name

                FROM dipp_transactions dt

                INNER JOIN accountable_forms af

                    ON af.id =
                    dt.accountable_form_id

                INNER JOIN lor_releases lr
                    ON lr.id = dt.lor_release_id

                INNER JOIN fund_sources fs
                    ON fs.id = lr.fund_source_id

                INNER JOIN smi_booklet_registration sbr

                    ON sbr.id =
                    dt.booklet_registration_id

                INNER JOIN users collector

                    ON collector.id =
                    dt.collector_id

                LEFT JOIN users encoder

                    ON encoder.id =
                    dt.encoded_by

                WHERE

                    dt.id = $1

                `,

                [id]

            );

            console.log("================================");
console.log("HEADER:", header.rows[0]);
console.log("FORM CODE:", header.rows[0]?.form_code);
console.log("================================");

        if (

            header.rows.length === 0

        ) {

            return NextResponse.json(

                {

                    success: false,

                    message:
                        "Transaction not found.",

                },

                {

                    status: 404,

                }

            );

        }


        

        /*

        
|--------------------------------------------------------------------------
| Items
|--------------------------------------------------------------------------
*/

let items: any[] = [];

if (header.rows[0].form_code === "AF56") {

    const rptItems =
        await pool.query(

            `

            SELECT

                id,

                td_number,

                CONCAT(

                    'Q',

                    start_quarter,

                    ' ',

                    start_year,

                    ' - Q',

                    end_quarter,

                    ' ',

                    end_year

                ) AS coverage,

                assessed_value,

                basic,

                sef,

                penalty,

                discount,

                amount

            FROM dipp_rpt_items

            WHERE

                transaction_id = $1

            ORDER BY

                td_number,

                start_year,

                start_quarter

            `,

            [

                id,

            ]

        );


        console.log("================================");
console.log("ENTERED AF56");
console.log("TRANSACTION ID:", id);
console.log("RPT ITEM COUNT:", rptItems.rows.length);
console.log("RPT ITEMS:", rptItems.rows);
console.log("================================");

    items = rptItems.rows;

        } else {

            const generalItems =
                await pool.query(

                    `

                    SELECT

                        dti.id,

                        a.account_code,

                        a.account_name,

                        dti.amount,

                        dti.remarks

                    FROM dipp_transaction_items dti

                    INNER JOIN accounts a

                        ON a.id = dti.account_id

                    WHERE

                        dti.transaction_id = $1

                    ORDER BY

                        a.account_code

                    `,

                    [

                        id,

                    ]

                );

                console.log("================================");
console.log("ENTERED GENERAL");
console.log("GENERAL ITEM COUNT:", generalItems.rows.length);
console.log("================================");

            items = generalItems.rows;

        }

        return NextResponse.json({

            success: true,

            header:
                header.rows[0],

            items,
        });

    }

    catch (err: any) {

        console.error(err);

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