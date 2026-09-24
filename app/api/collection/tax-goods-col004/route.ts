import {
    NextRequest,
    NextResponse,
} from "next/server";

import { pool } from "@/lib/db";
import { authorize } from "@/lib/authorize";
import { MODULE_PATHS } from "@/lib/module-paths";


/* ============================================================
   ACCOUNT IDs
============================================================ */

/*
 * Business Tax
 * Account Code: 4-01-03-030
 */
const BUSINESS_TAX_ACCOUNT_ID =
    "2c382a8c-803e-48f8-8efe-8bab092e592e";


/*
 * Peddlers
 * Account Code: 4-01-03-030-5
 */
const PEDDLERS_ACCOUNT_ID =
    "54912fc6-02a8-4070-acca-46322d58e073";


/*
 * Fines & Penalties (Business Tax)
 * Account Code: 4-01-05-030
 */
const FINES_PENALTIES_ACCOUNT_ID =
    "65672346-e87e-49ec-9c67-a76a572cdc72";


/* ============================================================
   TYPES
============================================================ */

type TaxGoodsCollectionRow = {
    id: string;

    remittance_no:
        string | null;

    remittance_date:
        string | null;

    total_amount:
        number;

    rcd_transaction_id:
        string | null;

    report_no:
        string | null;

    report_date:
        string | null;

    collector_name:
        string | null;

    fund_code:
        string | null;

    fund_name:
        string | null;

    tax_goods_business_tax_license:
        number | string | null;

    tax_goods_peddlers:
        number | string | null;

    tax_goods_fines_penalties:
        number | string | null;
};


/* ============================================================
   HELPERS
============================================================ */

function toNumber(
    value: unknown
): number {

    const numberValue =
        Number(value ?? 0);

    return Number.isFinite(
        numberValue
    )
        ? numberValue
        : 0;
}


function money(
    value: number
): number {

    return Number(
        value.toFixed(2)
    );
}


/* ============================================================
   GET
============================================================ */

export async function GET(
    req: NextRequest
) {

    try {

        /* ====================================================
           AUTHORIZATION
        ==================================================== */

        await authorize(
            req,
            MODULE_PATHS.DIPP,
            "view"
        );


        /* ====================================================
           QUERY PARAMETERS
        ==================================================== */

        const {
            searchParams,
        } = new URL(
            req.url
        );


        let search =
            searchParams
                .get("search")
                ?.trim() ?? "";


        let year =
            searchParams
                .get("year")
                ?.trim() ?? "";


        let month =
            searchParams
                .get("month")
                ?.trim() ?? "";


        /*
         * Treat ALL as no filter.
         */

        if (
            year.toUpperCase() ===
            "ALL"
        ) {

            year = "";

        }


        if (
            month.toUpperCase() ===
            "ALL"
        ) {

            month = "";

        }


        /*
         * Convert year/month to numbers only
         * when they contain valid values.
         */

        const yearParam =
            /^\d{4}$/.test(year)
                ? Number(year)
                : null;


        const monthParam =
            /^\d{1,2}$/.test(month)
                ? Number(month)
                : null;


        /* ====================================================
           MAIN QUERY

           REMITTANCE
                ↓
           RCD TRANSACTION
                ↓
           RCD ITEMS
                ↓
           DIPP TRANSACTIONS
                ↓
           DIPP TRANSACTION ITEMS
                ↓
           ACCOUNTS
        ==================================================== */

        const result =
            await pool.query(
                `

                /* ==================================================
                   REMITTANCE BASE
                ================================================== */

                WITH remittance_base AS (

                    SELECT

                        rt.id
                            AS remittance_id,

                        rt.remittance_no,

                        rt.remittance_date,

                        rt.total_amount,

                        rt.created_at,

                        rcd.id
                            AS rcd_transaction_id,

                        rcd.report_no,

                        rcd.report_date,

                        fs.fund_code,

                        fs.fund_name,


                        /* ==========================================
                           COLLECTOR
                        ========================================== */

                        COALESCE(

                            (
                                SELECT
                                    STRING_AGG(
                                        DISTINCT
                                        collector.full_name,
                                        ', '
                                        ORDER BY
                                            collector.full_name
                                    )

                                FROM rcd_items ri_collector

                                INNER JOIN users collector

                                    ON collector.id =
                                       ri_collector.collector_id

                                WHERE

                                    ri_collector.rcd_transaction_id =
                                    rcd.id

                                AND

                                    collector.full_name IS NOT NULL
                            ),

                            rcd_user.full_name,

                            '—'

                        )
                            AS collector_name


                    FROM remittance_transactions rt


                    INNER JOIN rcd_transaction rcd

                        ON rcd.id =
                           rt.rcd_transaction_id


                    LEFT JOIN fund_sources fs

                        ON fs.id =
                           rcd.fund_source_id


                    LEFT JOIN users rcd_user

                        ON rcd_user.id =
                           rcd.rcd_by


                    WHERE

                        (
                            $1 = ''

                            OR

                            rt.remittance_no ILIKE
                                '%' || $1 || '%'

                            OR

                            rcd.report_no ILIKE
                                '%' || $1 || '%'

                            OR

                            EXISTS (

                                SELECT 1

                                FROM rcd_items ri_search

                                INNER JOIN users u_search

                                    ON u_search.id =
                                       ri_search.collector_id

                                WHERE

                                    ri_search.rcd_transaction_id =
                                    rcd.id

                                AND

                                    u_search.full_name ILIKE
                                    '%' || $1 || '%'

                            )
                        )


                    AND

                        (
                            $2::int IS NULL

                            OR

                            EXTRACT(
                                YEAR
                                FROM rt.remittance_date
                            )::int =
                            $2::int
                        )


                    AND

                        (
                            $3::int IS NULL

                            OR

                            EXTRACT(
                                MONTH
                                FROM rt.remittance_date
                            )::int =
                            $3::int
                        )

                ),


                /* ==================================================
                   UNIQUE DIPP TRANSACTIONS PER RCD
                   
                   Prevent duplicate counting when the same
                   DIPP transaction appears more than once in
                   rcd_items.
                ================================================== */

                rcd_dipp AS (

                    SELECT DISTINCT

                        ri.rcd_transaction_id,

                        ri.dipp_transaction_id

                    FROM rcd_items ri

                    INNER JOIN dipp_transactions dt

                        ON dt.id =
                           ri.dipp_transaction_id

                    WHERE

                        COALESCE(
                            dt.is_cancelled,
                            FALSE
                        ) = FALSE

                ),


                /* ==================================================
                   TAX GOODS TOTALS
                   
                   SOURCE:
                   dipp_transaction_items
                   
                   ONLY THESE 3 ACCOUNTS ARE INCLUDED.
                ================================================== */

                tax_goods AS (

                    SELECT

                        rd.rcd_transaction_id,


                        /* ==========================================
                           BUSINESS TAX / LICENSE
                        ========================================== */

                        COALESCE(

                            SUM(

                                CASE

                                    WHEN dti.account_id =
                                         $4::uuid

                                    THEN
                                        COALESCE(
                                            dti.amount,
                                            0
                                        )

                                    ELSE
                                        0

                                END

                            ),

                            0

                        )
                            AS business_tax_license,


                        /* ==========================================
                           PEDDLERS
                        ========================================== */

                        COALESCE(

                            SUM(

                                CASE

                                    WHEN dti.account_id =
                                         $5::uuid

                                    THEN
                                        COALESCE(
                                            dti.amount,
                                            0
                                        )

                                    ELSE
                                        0

                                END

                            ),

                            0

                        )
                            AS peddlers,


                        /* ==========================================
                           FINES / PENALTIES
                        ========================================== */

                        COALESCE(

                            SUM(

                                CASE

                                    WHEN dti.account_id =
                                         $6::uuid

                                    THEN
                                        COALESCE(
                                            dti.amount,
                                            0
                                        )

                                    ELSE
                                        0

                                END

                            ),

                            0

                        )
                            AS fines_penalties


                    FROM rcd_dipp rd


                    INNER JOIN dipp_transaction_items dti

                        ON dti.transaction_id =
                           rd.dipp_transaction_id


                    WHERE

                        dti.account_id IN (

                            $4::uuid,

                            $5::uuid,

                            $6::uuid

                        )


                    GROUP BY

                        rd.rcd_transaction_id

                )


                /* ==================================================
                   FINAL RESULT
                   
                   IMPORTANT:
                   
                   NO money_amount() FUNCTION.
                   
                   PostgreSQL returns numeric values directly.
                ================================================== */

                SELECT

                    rb.remittance_id
                        AS id,

                    rb.remittance_no,

                    rb.remittance_date,

                    rb.total_amount,

                    rb.rcd_transaction_id,

                    rb.report_no,

                    rb.report_date,

                    rb.collector_name,

                    rb.fund_code,

                    rb.fund_name,


                    COALESCE(
                        tg.business_tax_license,
                        0
                    )
                        AS tax_goods_business_tax_license,


                    COALESCE(
                        tg.peddlers,
                        0
                    )
                        AS tax_goods_peddlers,


                    COALESCE(
                        tg.fines_penalties,
                        0
                    )
                        AS tax_goods_fines_penalties


                FROM remittance_base rb


                LEFT JOIN tax_goods tg

                    ON tg.rcd_transaction_id =
                       rb.rcd_transaction_id


                ORDER BY

                    rb.remittance_date
                        DESC NULLS LAST,

                    rb.created_at
                        DESC NULLS LAST

                `,
                [
                    search,
                    yearParam,
                    monthParam,

                    BUSINESS_TAX_ACCOUNT_ID,
                    PEDDLERS_ACCOUNT_ID,
                    FINES_PENALTIES_ACCOUNT_ID,
                ]
            );


        /* ====================================================
           FORMAT RESPONSE
        ==================================================== */

        const rows =
            result.rows.map(
                (
                    row: any
                ) => {

                    const businessTaxLicense =
                        money(
                            toNumber(
                                row
                                    .tax_goods_business_tax_license
                            )
                        );


                    const peddlers =
                        money(
                            toNumber(
                                row
                                    .tax_goods_peddlers
                            )
                        );


                    const finesPenalties =
                        money(
                            toNumber(
                                row
                                    .tax_goods_fines_penalties
                            )
                        );


                    return {

                        id:
                            String(
                                row.id
                            ),


                        remittance_no:
                            row.remittance_no ??
                            null,


                        remittance_date:
                            row.remittance_date ??
                            null,


                        total_amount:
                            money(
                                toNumber(
                                    row.total_amount
                                )
                            ),


                        rcd_transaction_id:
                            row.rcd_transaction_id ??
                            null,


                        report_no:
                            row.report_no ??
                            null,


                        report_date:
                            row.report_date ??
                            null,


                        collector_name:
                            row.collector_name ??
                            "—",


                        fund_code:
                            row.fund_code ??
                            null,


                        fund_name:
                            row.fund_name ??
                            null,


                        values: {

                            tax_goods_business_tax_license:
                                businessTaxLicense,

                            tax_goods_peddlers:
                                peddlers,

                            tax_goods_fines_penalties:
                                finesPenalties,

                        },

                    };

                }
            );


        /* ====================================================
           RESPONSE
        ==================================================== */

        return NextResponse.json({

            success:
                true,

            data:
                rows,

            count:
                rows.length,

            columns: [

                {
                    id:
                        "tax_goods_business_tax_license",

                    label:
                        "Business Tax / License",

                    account_id:
                        BUSINESS_TAX_ACCOUNT_ID,

                    account_code:
                        "4-01-03-030",

                },

                {
                    id:
                        "tax_goods_peddlers",

                    label:
                        "Peddlers",

                    account_id:
                        PEDDLERS_ACCOUNT_ID,

                    account_code:
                        "4-01-03-030-5",

                },

                {
                    id:
                        "tax_goods_fines_penalties",

                    label:
                        "Fines / Penalties",

                    account_id:
                        FINES_PENALTIES_ACCOUNT_ID,

                    account_code:
                        "4-01-05-030",

                },

            ],

        });


    } catch (
        error: any
    ) {

        console.error(
            "GET TAX GOODS COL004 ERROR:",
            error
        );


        return NextResponse.json(

            {
                success:
                    false,

                message:
                    error?.message ??
                    "Failed to load TAXES ON GOODS & SERVICES-COL004.",
            },

            {
                status:
                    500,
            }

        );

    }

}