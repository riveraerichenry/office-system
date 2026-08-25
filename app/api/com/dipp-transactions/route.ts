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


        /*
        ============================================================
        DIPP TRANSACTIONS

        FUND SOURCE RELATIONSHIP:

        dipp_transactions.remittance_id
                    ↓
        rcd_transaction.id
                    ↓
        rcd_transaction.fund_source_id
                    ↓
        fund_sources.id


        OFFICER:

        dipp_transactions.collector_id
                    ↓
        users.id
        ============================================================
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

                    dt.remarks,

                    dt.grand_total,

                    dt.status,

                    dt.transaction_type,

                    dt.is_cancelled,

                    dt.is_remitted,

                    dt.accountable_form_id,

                    dt.booklet_registration_id,

                    dt.remittance_id,

                    dt.collector_id,

                    dt.encoded_by,

                    dt.created_at,


                    /*
                    ====================================================
                    ACCOUNTABLE FORM
                    ====================================================
                    */

                    af.form_code,

                    af.form_name,


                    /*
                    ====================================================
                    COLLECTOR / OFFICER
                    ====================================================
                    */

                    collector.full_name
                        AS collector_name,


                    /*
                    ====================================================
                    ENCODED BY
                    ====================================================
                    */

                    encoder.full_name
                        AS encoded_by_name,


                    /*
                    ====================================================
                    RCD
                    ====================================================
                    */

                    rt.report_no
                        AS rcd_report_no,

                    rt.fund_source_id,


                    /*
                    ====================================================
                    FUND SOURCE
                    ====================================================
                    */

                    fs.fund_code,

                    fs.fund_name,

                    fs.acronym

                FROM dipp_transactions dt


                /*
                ========================================================
                ACCOUNTABLE FORM
                ========================================================
                */

                LEFT JOIN accountable_forms af
                    ON af.id =
                        dt.accountable_form_id


                /*
                ========================================================
                COLLECTOR / OFFICER
                ========================================================
                */

                LEFT JOIN users collector
                    ON collector.id =
                        dt.collector_id


                /*
                ========================================================
                ENCODED BY
                ========================================================
                */

                LEFT JOIN users encoder
                    ON encoder.id =
                        dt.encoded_by


                /*
                ========================================================
                RCD / REMITTANCE

                dipp_transactions.remittance_id
                    →
                rcd_transaction.id
                ========================================================
                */

                LEFT JOIN rcd_transaction rt
                    ON rt.id =
                        dt.remittance_id


                /*
                ========================================================
                FUND SOURCE

                rcd_transaction.fund_source_id
                    →
                fund_sources.id
                ========================================================
                */

                LEFT JOIN fund_sources fs
                    ON fs.id =
                        rt.fund_source_id


                ORDER BY

                    dt.receipt_date DESC
                        NULLS LAST,

                    dt.created_at DESC
                        NULLS LAST
                `
            );


        return NextResponse.json({

            success: true,

            data:
                result.rows,

            count:
                result.rows.length,

        });

    }
    catch (
        error: any
    ) {

        console.error(
            "GET COM DIPP TRANSACTIONS ERROR:",
            error
        );


        return NextResponse.json(
            {
                success: false,

                message:
                    error?.message ??
                    "Failed to load DIPP transactions.",
            },
            {
                status: 500,
            }
        );

    }

}