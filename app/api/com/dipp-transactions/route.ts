import { NextRequest, NextResponse } from "next/server";

import { authorize } from "@/lib/authorize";
import { pool } from "@/lib/db";
import { MODULE_PATHS } from "@/lib/module-paths";

export async function GET(req: NextRequest) {
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

        dipp_transactions.lor_release_id
                    ↓
        lor_releases.id
                    ↓
        lor_releases.fund_source_id
                    ↓
        fund_sources.id

        OFFICER:

        dipp_transactions.collector_id
                    ↓
        users.id
        ============================================================
        */

        const result = await pool.query(`
            SELECT

                /*
                ====================================================
                DIPP TRANSACTION
                ====================================================
                */

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

                dt.lor_release_id,

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
                LOR RELEASE
                ====================================================
                */

                lr.id
                    AS lor_release_id,

                lr.lor_no
                    AS lor_no,

                lr.fund_source_id
                    AS fund_source_id,


                /*
                ====================================================
                FUND SOURCE

                lor_releases.fund_source_id
                    ↓
                fund_sources.id
                ====================================================
                */

                fs.fund_code
                    AS fund_code,

                fs.fund_name
                    AS fund_name,

                fs.acronym
                    AS fund_acronym


            FROM dipp_transactions dt


            /*
            ========================================================
            ACCOUNTABLE FORM
            ========================================================
            */

            LEFT JOIN accountable_forms af
                ON af.id = dt.accountable_form_id


            /*
            ========================================================
            COLLECTOR / OFFICER
            ========================================================
            */

            LEFT JOIN users collector
                ON collector.id = dt.collector_id


            /*
            ========================================================
            ENCODED BY
            ========================================================
            */

            LEFT JOIN users encoder
                ON encoder.id = dt.encoded_by


            /*
            ========================================================
            LOR RELEASE

            dipp_transactions.lor_release_id
                ↓
            lor_releases.id
            ========================================================
            */

            LEFT JOIN lor_releases lr
                ON lr.id = dt.lor_release_id


            /*
            ========================================================
            FUND SOURCE

            lor_releases.fund_source_id
                ↓
            fund_sources.id
            ========================================================
            */

            LEFT JOIN fund_sources fs
                ON fs.id = lr.fund_source_id


            /*
            ========================================================
            ORDER
            ========================================================
            */

            ORDER BY

                dt.receipt_date DESC NULLS LAST,

                dt.created_at DESC NULLS LAST
        `);

        return NextResponse.json({
            success: true,

            data: result.rows,

            count: result.rows.length,
        });
    } catch (error: any) {
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