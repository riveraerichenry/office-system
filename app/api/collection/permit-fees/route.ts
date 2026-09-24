import {
    NextRequest,
    NextResponse,
} from "next/server";

import { pool } from "@/lib/db";
import { authorize } from "@/lib/authorize";
import { MODULE_PATHS } from "@/lib/module-paths";


/* ============================================================
   ACCOUNT IDS
============================================================ */

/*
 * Mayors Permit
 * Business/Mayors Permit Fees
 * 4-02-01-010-1
 */
const MAYORS_PERMIT_ACCOUNT_ID =
    "e9a9c422-774d-45ec-9b8f-3f6076fa40ec";


/*
 * MTOP
 * Tricycle Operators Permit Fees(MTOP)
 * 4-02-01-010-4
 */
const MTOP_ACCOUNT_ID =
    "58a09c7c-052d-43e6-81a9-d9739ec69828";


/*
 * SANITARY PERMIT
 * 4-02-01-010-5
 */
const SANITARY_PERMIT_ACCOUNT_ID =
    "a75b5c00-ea18-4e25-88ff-572c024f5e6a";


/*
 * BUILDING INS./PERMIT (80%)
 * Building Permit Fees(80%)
 * 4-02-01-010-2
 */
const BUILDING_PERMIT_ACCOUNT_ID =
    "b925fc03-c36e-487c-814d-78add46c0583";


/*
 * DUE TO OTHER FUNDS-MEO (15%)
 * 15% Building Permits-MEO
 * 2-03-01-010-1
 */
const MEO_15_ACCOUNT_ID =
    "282a2483-6a25-4af5-9457-be47ab2669e2";


/*
 * DUE TO NGA (5%)
 * DUE TO NGA (Bldg Permit (5%)
 * 2-02-01-050-2
 */
const NGA_5_ACCOUNT_ID =
    "1ab61593-097e-4f49-9a60-be4cdf8d88ba";


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


        const search =
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
         * ALL = no filter
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


        const yearParam =
            /^\d{4}$/.test(year)
                ? Number(year)
                : null;


        const monthParam =
            /^\d{1,2}$/.test(month)
                ? Number(month)
                : null;


        /* ====================================================
           QUERY
           
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
                   
                   Prevent duplicate counting.
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
                   PERMIT TOTALS
                   
                   SOURCE:
                   dipp_transaction_items
                ================================================== */

                permit_totals AS (

                    SELECT

                        rd.rcd_transaction_id,


                        /* ==========================================
                           MAYORS PERMIT
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
                            AS mayors_permit,


                        /* ==========================================
                           MTOP
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
                            AS mtop,


                        /* ==========================================
                           SANITARY PERMIT
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
                            AS sanitary_permit,


                        /* ==========================================
                           BUILDING PERMIT 80%
                        ========================================== */

                        COALESCE(
                            SUM(
                                CASE

                                    WHEN dti.account_id =
                                         $7::uuid

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
                            AS building_permit_80,


                        /* ==========================================
                           MEO 15%
                        ========================================== */

                        COALESCE(
                            SUM(
                                CASE

                                    WHEN dti.account_id =
                                         $8::uuid

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
                            AS meo_15,


                        /* ==========================================
                           NGA 5%
                        ========================================== */

                        COALESCE(
                            SUM(
                                CASE

                                    WHEN dti.account_id =
                                         $9::uuid

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
                            AS nga_5


                    FROM rcd_dipp rd


                    INNER JOIN dipp_transaction_items dti

                        ON dti.transaction_id =
                           rd.dipp_transaction_id


                    WHERE

                        dti.account_id IN (

                            $4::uuid,

                            $5::uuid,

                            $6::uuid,

                            $7::uuid,

                            $8::uuid,

                            $9::uuid

                        )


                    GROUP BY

                        rd.rcd_transaction_id

                )


                /* ==================================================
                   FINAL
                   
                   ONE ROW PER REMITTANCE
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
                        pt.mayors_permit,
                        0
                    )
                        AS permit_mayors_permit,


                    COALESCE(
                        pt.mtop,
                        0
                    )
                        AS permit_mtop,


                    COALESCE(
                        pt.sanitary_permit,
                        0
                    )
                        AS permit_sanitary_permit,


                    COALESCE(
                        pt.building_permit_80,
                        0
                    )
                        AS permit_building_permit_80,


                    COALESCE(
                        pt.meo_15,
                        0
                    )
                        AS permit_meo_15,


                    COALESCE(
                        pt.nga_5,
                        0
                    )
                        AS permit_nga_5


                FROM remittance_base rb


                LEFT JOIN permit_totals pt

                    ON pt.rcd_transaction_id =
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

                    MAYORS_PERMIT_ACCOUNT_ID,
                    MTOP_ACCOUNT_ID,
                    SANITARY_PERMIT_ACCOUNT_ID,
                    BUILDING_PERMIT_ACCOUNT_ID,
                    MEO_15_ACCOUNT_ID,
                    NGA_5_ACCOUNT_ID,
                ]
            );


        /* ====================================================
           FORMAT RESULT
        ==================================================== */

        const rows =
            result.rows.map(
                (row: any) => {

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

                            permit_mayors_permit:
                                money(
                                    toNumber(
                                        row.permit_mayors_permit
                                    )
                                ),

                            permit_mtop:
                                money(
                                    toNumber(
                                        row.permit_mtop
                                    )
                                ),

                            permit_sanitary_permit:
                                money(
                                    toNumber(
                                        row.permit_sanitary_permit
                                    )
                                ),

                            permit_building_permit_80:
                                money(
                                    toNumber(
                                        row.permit_building_permit_80
                                    )
                                ),

                            permit_meo_15:
                                money(
                                    toNumber(
                                        row.permit_meo_15
                                    )
                                ),

                            permit_nga_5:
                                money(
                                    toNumber(
                                        row.permit_nga_5
                                    )
                                ),

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
                        "permit_mayors_permit",

                    label:
                        "Mayors Permit",

                    account_id:
                        MAYORS_PERMIT_ACCOUNT_ID,

                    account_code:
                        "4-02-01-010-1",
                },


                {
                    id:
                        "permit_mtop",

                    label:
                        "MTOP",

                    account_id:
                        MTOP_ACCOUNT_ID,

                    account_code:
                        "4-02-01-010-4",
                },


                {
                    id:
                        "permit_sanitary_permit",

                    label:
                        "SANITARY PERMIT",

                    account_id:
                        SANITARY_PERMIT_ACCOUNT_ID,

                    account_code:
                        "4-02-01-010-5",
                },


                {
                    id:
                        "permit_building_permit_80",

                    label:
                        "Building Ins./permit (80%)",

                    account_id:
                        BUILDING_PERMIT_ACCOUNT_ID,

                    account_code:
                        "4-02-01-010-2",
                },


                {
                    id:
                        "permit_meo_15",

                    label:
                        "due to other funds-MEO(15%)",

                    account_id:
                        MEO_15_ACCOUNT_ID,

                    account_code:
                        "2-03-01-010-1",
                },


                {
                    id:
                        "permit_nga_5",

                    label:
                        "due to NGA(5%)",

                    account_id:
                        NGA_5_ACCOUNT_ID,

                    account_code:
                        "2-02-01-050-2",
                },

            ],

        });


    } catch (
        error: any
    ) {

        console.error(
            "GET PERMIT FEES ERROR:",
            error
        );


        return NextResponse.json(

            {
                success:
                    false,

                message:
                    error?.message ??
                    "Failed to load PERMIT FEES collection.",
            },

            {
                status:
                    500,
            }

        );

    }

}