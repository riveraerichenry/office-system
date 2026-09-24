import {
    NextRequest,
    NextResponse,
} from "next/server";

import { pool } from "@/lib/db";


/* ============================================================
   HELPERS
============================================================ */

function toNumber(
    value: unknown
): number {

    const number =
        Number(
            value ?? 0
        );

    return Number.isFinite(
        number
    )
        ? number
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
   ACCOUNT IDS
============================================================ */


/*
|--------------------------------------------------------------------------
| BURIAL ACCOUNT
|--------------------------------------------------------------------------
|
| *Burial Permit Fees
| Account Code:
| 4-02-01-010-8
|
| IMPORTANT:
| The amount itself comes from:
|
| dipp_af58_items.fee_amount
|
| This account ID is used to make sure the AF58 item is
| the Burial Permit account.
|--------------------------------------------------------------------------
*/

const BURIAL_ACCOUNT_ID =
    "59fc12ae-fae5-47b6-a231-24c138ad50ad";


/*
|--------------------------------------------------------------------------
| LARGE CATTLE
|--------------------------------------------------------------------------
|
| Ownership of Large Cattle
| 4-02-01-020-1
|
| Branding Fee for Large Cattle
| 4-02-01-020-8
|--------------------------------------------------------------------------
*/

const LARGE_CATTLE_ACCOUNT_IDS = [
    "45934064-4d10-4f82-8ede-619d74f88337",
    "9adbd0ef-552a-4fe0-8309-41f0422df348",
];


/*
|--------------------------------------------------------------------------
| CIVIL
|--------------------------------------------------------------------------
|
| There are two Civil Registration Fees accounts:
|
| 4-02-01-020-3
| 4-02-01-020-4
|
| Both are combined.
|--------------------------------------------------------------------------
*/

const CIVIL_ACCOUNT_IDS = [
    "07d7c8e8-b5a0-4a95-b45c-fa14f1afd076",
    "dd19079e-897d-44e4-9dc9-4e172449449d",
];


/*
|--------------------------------------------------------------------------
| BANCA
|--------------------------------------------------------------------------
|
| Motor Banca Registration
| 4-02-01-020-7
|--------------------------------------------------------------------------
*/

const BANCA_ACCOUNT_ID =
    "7942ae58-89dc-424b-a366-7ae98b5e997e";


/* ============================================================
   GET
============================================================ */

export async function GET(
    request: NextRequest
) {

    try {

        const {
            searchParams,
        } = new URL(
            request.url
        );


        /*
        ========================================================
        FILTER PARAMETERS
        ========================================================
        */

        const search =
            searchParams.get(
                "search"
            )?.trim() ?? "";

        const year =
            searchParams.get(
                "year"
            )?.trim() ?? "";

        const month =
            searchParams.get(
                "month"
            )?.trim() ?? "";


        console.log(
            "REGISTRATION COLLECTION API",
            {
                search,
                year,
                month,
            }
        );


        /*
        ========================================================
        REMITTANCES
        ========================================================

        Correct relationship:

        remittance_transactions
                ↓
        rcd_transaction
                ↓
        rcd_items
                ↓
        dipp_transactions
        */

        const result =
            await pool.query(

                `
                WITH remittances AS (

                    SELECT

                        rt.id
                            AS remittance_id,

                        rt.remittance_no,

                        rt.remittance_date,

                        rt.total_amount,

                        rt.rcd_transaction_id,


                        rcd.report_no,

                        rcd.report_date,


                        collector.full_name
                            AS collector_name,


                        fs.fund_code,

                        fs.fund_name


                    FROM remittance_transactions rt


                    INNER JOIN rcd_transaction rcd
                        ON rcd.id =
                           rt.rcd_transaction_id


                    LEFT JOIN fund_sources fs
                        ON fs.id =
                           rcd.fund_source_id


                    /*
                    ------------------------------------------------
                    COLLECTOR
                    ------------------------------------------------
                    */

                    LEFT JOIN rcd_items ri_collector
                        ON ri_collector.rcd_transaction_id =
                           rcd.id


                    LEFT JOIN users collector
                        ON collector.id =
                           ri_collector.collector_id


                    GROUP BY

                        rt.id,

                        rt.remittance_no,

                        rt.remittance_date,

                        rt.total_amount,

                        rt.rcd_transaction_id,

                        rcd.report_no,

                        rcd.report_date,

                        collector.full_name,

                        fs.fund_code,

                        fs.fund_name

                ),


                /*
                ====================================================
                DIPP TRANSACTIONS PER REMITTANCE
                ====================================================
                */

                remittance_dipp AS (

                    SELECT DISTINCT

                        rt.id
                            AS remittance_id,

                        ri.dipp_transaction_id


                    FROM remittance_transactions rt


                    INNER JOIN rcd_transaction rcd
                        ON rcd.id =
                           rt.rcd_transaction_id


                    INNER JOIN rcd_items ri
                        ON ri.rcd_transaction_id =
                           rcd.id


                    WHERE

                        ri.dipp_transaction_id
                            IS NOT NULL

                ),


                /*
                ====================================================
                REGISTRATION TOTALS
                ====================================================
                */

                registration_totals AS (

                    SELECT

                        rd.remittance_id,


                        /* ========================================
                           AF58 / BURIAL
                           ======================================== */

                        COALESCE(
                            SUM(

                                CASE

                                    WHEN
                                        UPPER(
                                            TRIM(
                                                COALESCE(
                                                    af58_form.form_code,
                                                    ''
                                                )
                                            )
                                        ) = 'AF58'

                                        AND

                                        af58.account_id =
                                            $1

                                    THEN

                                        COALESCE(
                                            af58.fee_amount,
                                            0
                                        )

                                    ELSE
                                        0

                                END

                            ),
                            0
                        ) AS burial,


                        /* ========================================
                           AF53
                           ======================================== */

                        COALESCE(
                            SUM(

                                CASE

                                    WHEN
                                        UPPER(
                                            TRIM(
                                                COALESCE(
                                                    af.form_code,
                                                    ''
                                                )
                                            )
                                        ) = 'AF53'

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
                        ) AS af53,


                        /* ========================================
                           LARGE CATTLE
                           ======================================== */

                        COALESCE(
                            SUM(

                                CASE

                                    WHEN
                                        dti.account_id =
                                        ANY(
                                            $2::uuid[]
                                        )

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
                        ) AS large_cattle,


                        /* ========================================
                           CIVIL
                           ======================================== */

                        COALESCE(
                            SUM(

                                CASE

                                    WHEN
                                        dti.account_id =
                                        ANY(
                                            $3::uuid[]
                                        )

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
                        ) AS civil,


                        /* ========================================
                           BANCA
                           ======================================== */

                        COALESCE(
                            SUM(

                                CASE

                                    WHEN
                                        dti.account_id =
                                            $4

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
                        ) AS banca_registration_id


                    FROM remittance_dipp rd


                    INNER JOIN dipp_transactions dt
                        ON dt.id =
                           rd.dipp_transaction_id


                    /*
                    =================================================
                    NORMAL DIPP ITEMS
                    =================================================

                    Used for:

                    AF53
                    Large Cattle
                    Civil
                    Banca
                    */

                    LEFT JOIN dipp_transaction_items dti
                        ON dti.transaction_id =
                           dt.id


                    LEFT JOIN accountable_forms af
                        ON af.id =
                           dt.accountable_form_id


                    /*
                    =================================================
                    AF58 ITEMS
                    =================================================

                    Burial comes from:

                    dipp_af58_items.fee_amount
                    */

                    LEFT JOIN dipp_af58_items af58
                        ON af58.transaction_id =
                           dt.id


                    LEFT JOIN accountable_forms af58_form
                        ON af58_form.id =
                           dt.accountable_form_id


                    WHERE

                        COALESCE(
                            dt.is_cancelled,
                            FALSE
                        ) = FALSE


                    GROUP BY

                        rd.remittance_id

                )


                /*
                ====================================================
                FINAL
                ====================================================
                */

                SELECT

                    r.remittance_id,

                    r.remittance_no,

                    r.remittance_date,

                    r.total_amount,

                    r.rcd_transaction_id,

                    r.report_no,

                    r.report_date,

                    r.collector_name,

                    r.fund_code,

                    r.fund_name,


                    COALESCE(
                        rt.burial,
                        0
                    ) AS burial,


                    COALESCE(
                        rt.af53,
                        0
                    ) AS af53,


                    COALESCE(
                        rt.large_cattle,
                        0
                    ) AS large_cattle,


                    /*
                    ==================================================
                    CATTLE
                    ==================================================

                    20% of AF53
                    +
                    Large Cattle
                    */

                    (
                        COALESCE(
                            rt.af53,
                            0
                        ) * 0.20
                    )
                    +
                    COALESCE(
                        rt.large_cattle,
                        0
                    )
                    AS cattle,


                    COALESCE(
                        rt.civil,
                        0
                    ) AS civil,


                    COALESCE(
                        rt.banca_registration_id,
                        0
                    ) AS banca_registration_id


                FROM remittances r


                LEFT JOIN registration_totals rt

                    ON rt.remittance_id =
                       r.remittance_id


                ORDER BY

                    r.remittance_date
                        DESC NULLS LAST,

                    r.remittance_id
                        DESC

                `,

                [
                    BURIAL_ACCOUNT_ID,

                    LARGE_CATTLE_ACCOUNT_IDS,

                    CIVIL_ACCOUNT_IDS,

                    BANCA_ACCOUNT_ID,
                ]

            );


        /* ========================================================
           FORMAT
        ======================================================== */

        const rows =
            result.rows.map(
                (
                    row
                ) => {

                    const burial =
                        money(
                            toNumber(
                                row.burial
                            )
                        );


                    const af53 =
                        money(
                            toNumber(
                                row.af53
                            )
                        );


                    const largeCattle =
                        money(
                            toNumber(
                                row.large_cattle
                            )
                        );


                    const cattle =
                        money(
                            (
                                af53 *
                                0.20
                            )
                            +
                            largeCattle
                        );


                    const civil =
                        money(
                            toNumber(
                                row.civil
                            )
                        );


                    const banca =
                        money(
                            toNumber(
                                row.banca_registration_id
                            )
                        );


                    return {

                        id:
                            String(
                                row.remittance_id
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
                            null,


                        fund_code:
                            row.fund_code ??
                            null,


                        fund_name:
                            row.fund_name ??
                            null,


                        values: {

                            registration_burial:
                                burial,

                            registration_af53:
                                af53,

                            registration_large_cattle:
                                largeCattle,

                            registration_cattle:
                                cattle,

                            registration_civil:
                                civil,

                            registration_banca:
                                banca,

                        },

                    };

                }
            );


        return NextResponse.json({

            success:
                true,

            data:
                rows,

            count:
                rows.length,

        });

    }
    catch (
        error: any
    ) {

        console.error(
            "GET REGISTRATION COLLECTION ERROR:",
            error
        );


        return NextResponse.json(

            {
                success:
                    false,

                message:
                    error?.message ??
                    "Failed to load Registration collection.",
            },

            {
                status:
                    500,
            }

        );

    }

}