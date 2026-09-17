import { NextRequest, NextResponse } from "next/server";

import { pool } from "@/lib/db";
import { authorize } from "@/lib/authorize";
import { MODULE_PATHS } from "@/lib/module-paths";

/*
============================================================
OPERATIONS - DIPP TRANSACTION ITEMS
============================================================

FULL OPERATIONAL CHAIN

DIPP ITEM
    ↓
dipp_transactions
    ↓
rcd_transaction
    ↓
remittance_transactions
    ↓
rcd_consolidated_transaction_items
    ↓
rcd_consolidated_transaction


IMPORTANT RELATIONSHIPS
------------------------------------------------------------

dipp_transaction_items.transaction_id
    ↓
dipp_transactions.id


dipp_transactions.remittance_id
    ↓
rcd_transaction.id


remittance_transactions.rcd_transaction_id
    ↓
rcd_transaction.id


rcd_consolidated_transaction_items.rcd_transaction_id
    ↓
rcd_transaction.id


rcd_consolidated_transaction_items.remittance_id
    ↓
remittance_transactions.id


rcd_consolidated_transaction_items.consolidated_transaction_id
    ↓
rcd_consolidated_transaction.id


Therefore:

DIPP
  → RCD
  → Remittance
  → Consolidated RCD


============================================================
*/

export async function GET(req: NextRequest) {
    try {

        /*
        ========================================================
        AUTHORIZATION
        ========================================================
        */

        await authorize(
            req,
            MODULE_PATHS.DIPP,
            "view"
        );


        /*
        ========================================================
        MAIN QUERY
        ========================================================

        We use LATERAL queries for RCD / Remittance /
        Consolidated RCD so one DIPP item does not get
        duplicated if historical records exist.
        ========================================================
        */

        const result = await pool.query(`

            SELECT

                /* ==================================================
                   DIPP TRANSACTION ITEM
                ================================================== */

                dti.id
                    AS item_id,

                dti.transaction_id,

                dti.account_id,

                dti.amount
                    AS item_amount,

                dti.remarks
                    AS item_remarks,

                dti.created_at
                    AS item_created_at,


                /* ==================================================
                   DIPP TRANSACTION
                ================================================== */

                dt.id
                    AS dipp_transaction_id,

                dt.or_number,

                dt.receipt_date,

                dt.payor,

                dt.payment_mode,

                dt.remarks
                    AS transaction_remarks,

                dt.grand_total,

                dt.status
                    AS dipp_status,

                dt.transaction_type,

                dt.is_cancelled,

                dt.cancelled_at,

                dt.cancelled_by,

                dt.is_remitted,

                dt.payment,

                dt.gender,

                dt.created_at
                    AS dipp_created_at,

                dt.updated_at
                    AS dipp_updated_at,

                dt.posted_at,


                /* ==================================================
                   DIPP USERS
                ================================================== */

                dt.collector_id,

                collector.full_name
                    AS collector_name,

                dt.encoded_by,

                encoder.full_name
                    AS encoded_by_name,

                dt.posted_by,

                poster.full_name
                    AS posted_by_name,

                dt.updated_by,

                updater.full_name
                    AS updated_by_name,

                cancelled_user.full_name
                    AS cancelled_by_name,


                /* ==================================================
                   ACCOUNTABLE FORM
                ================================================== */

                dt.accountable_form_id,

                af.form_code,

                af.form_name,


                /* ==================================================
                   ACCOUNT
                ================================================== */

                a.account_code,

                a.account_name,


                /* ==================================================
                   LOR
                ================================================== */

                dt.lor_release_id,

                lr.lor_no,

                lr.fund_source_id,


                /* ==================================================
                   FUND SOURCE
                ================================================== */

                fs.fund_code,

                fs.fund_name,

                fs.acronym
                    AS fund_acronym,


                /* ==================================================
                   RCD
                ================================================== */

                rcd.id
                    AS rcd_transaction_id,

                rcd.report_no
                    AS rcd_report_no,

                rcd.report_date
                    AS rcd_report_date,

                rcd.fund_source_id
                    AS rcd_fund_source_id,

                rcd.date_from
                    AS rcd_date_from,

                rcd.date_to
                    AS rcd_date_to,

                rcd.total_collections
                    AS rcd_total_collections,

                rcd.total_remittances
                    AS rcd_total_remittances,

                rcd.total_deposits
                    AS rcd_total_deposits,

                rcd.balance
                    AS rcd_balance,

                rcd.status
                    AS rcd_status,

                rcd.rcd_by
                    AS rcd_by_id,

                rcd_user.full_name
                    AS rcd_by_name,


                /* ==================================================
                   REMITTANCE
                ================================================== */

                remittance.id
                    AS remittance_transaction_id,

                remittance.remittance_no,

                remittance.remittance_date,

                remittance.total_amount
                    AS remittance_total_amount,

                remittance.status
                    AS remittance_status,

                remittance.remarks
                    AS remittance_remarks,

                remittance.prepared_by
                    AS remittance_prepared_by,

                remittance.approved_by
                    AS remittance_approved_by,

                remittance.approved_at
                    AS remittance_approved_at,

                remittance.created_at
                    AS remittance_created_at,

                remittance.updated_at
                    AS remittance_updated_at,

                remittance.prepared_by_name
                    AS remittance_prepared_by_name,

                remittance.approved_by_name
                    AS remittance_approved_by_name,


                /* ==================================================
                   CONSOLIDATED RCD
                ================================================== */

                consolidated.id
                    AS consolidated_transaction_id,

                consolidated.consolidated_no,

                consolidated.consolidated_date,

                consolidated.total_amount
                    AS consolidated_total_amount,

                consolidated.status
                    AS consolidated_status,

                consolidated.remarks
                    AS consolidated_remarks,

                consolidated.prepared_by
                    AS consolidated_prepared_by,

                consolidated.approved_by
                    AS consolidated_approved_by,

                consolidated.approved_at
                    AS consolidated_approved_at,

                consolidated_users.prepared_by_name
                    AS consolidated_prepared_by_name,

                consolidated_users.approved_by_name
                    AS consolidated_approved_by_name,

                consolidated_item.id
                    AS consolidated_item_id,

                consolidated_item.amount
                    AS consolidated_item_amount


            /* ======================================================
               BASE
            ====================================================== */

            FROM dipp_transaction_items dti


            /* ======================================================
               DIPP TRANSACTION
            ====================================================== */

            INNER JOIN dipp_transactions dt
                ON dt.id = dti.transaction_id


            /* ======================================================
               ACCOUNT
            ====================================================== */

            LEFT JOIN accounts a
                ON a.id = dti.account_id


            /* ======================================================
               ACCOUNTABLE FORM
            ====================================================== */

            LEFT JOIN accountable_forms af
                ON af.id = dt.accountable_form_id


            /* ======================================================
               COLLECTOR
            ====================================================== */

            LEFT JOIN users collector
                ON collector.id = dt.collector_id


            /* ======================================================
               ENCODER
            ====================================================== */

            LEFT JOIN users encoder
                ON encoder.id = dt.encoded_by


            /* ======================================================
               POSTED BY
            ====================================================== */

            LEFT JOIN users poster
                ON poster.id = dt.posted_by


            /* ======================================================
               UPDATED BY
            ====================================================== */

            LEFT JOIN users updater
                ON updater.id = dt.updated_by


            /* ======================================================
               CANCELLED BY
            ====================================================== */

            LEFT JOIN users cancelled_user
                ON cancelled_user.id = dt.cancelled_by


            /* ======================================================
               LOR
            ====================================================== */

            LEFT JOIN lor_releases lr
                ON lr.id = dt.lor_release_id


            /* ======================================================
               FUND SOURCE
            ====================================================== */

            LEFT JOIN fund_sources fs
                ON fs.id = lr.fund_source_id


            /* ======================================================
               RCD

               IMPORTANT:

               dt.remittance_id
                       ↓
               rcd_transaction.id
            ====================================================== */

            LEFT JOIN rcd_transaction rcd
                ON rcd.id = dt.remittance_id


            /* ======================================================
               RCD BY
            ====================================================== */

            LEFT JOIN users rcd_user
                ON rcd_user.id = rcd.rcd_by


            /* ======================================================
               REMITTANCE

               We find the remittance using the RCD.

               rcd_transaction.id
                       ↓
               remittance_transactions.rcd_transaction_id
            ====================================================== */

            LEFT JOIN LATERAL (

                SELECT
                    rmt.id,
                    rmt.remittance_no,
                    rmt.remittance_date,
                    rmt.total_amount,
                    rmt.status,
                    rmt.remarks,
                    rmt.prepared_by,
                    rmt.approved_by,
                    rmt.approved_at,
                    rmt.created_at,
                    rmt.updated_at,

                    prepared.full_name
                        AS prepared_by_name,

                    approved.full_name
                        AS approved_by_name

                FROM remittance_transactions rmt

                LEFT JOIN users prepared
                    ON prepared.id =
                       rmt.prepared_by

                LEFT JOIN users approved
                    ON approved.id =
                       rmt.approved_by

                WHERE
                    rmt.rcd_transaction_id =
                    rcd.id

                ORDER BY
                    rmt.remittance_date DESC NULLS LAST,
                    rmt.created_at DESC,
                    rmt.id DESC

                LIMIT 1

            ) remittance
                ON TRUE


            /* ======================================================
               CONSOLIDATED RCD ITEM

               THIS IS THE IMPORTANT FIX.

               A consolidated RCD does NOT directly reference
               rcd_transaction.

               Instead:

               rcd_transaction
                       ↓
               rcd_consolidated_transaction_items
                       ↓
               consolidated_transaction
            ====================================================== */

            LEFT JOIN LATERAL (

                SELECT
                    cti.id,
                    cti.consolidated_transaction_id,
                    cti.rcd_transaction_id,
                    cti.remittance_id,
                    cti.amount

                FROM rcd_consolidated_transaction_items cti

                WHERE

                    (
                        cti.rcd_transaction_id =
                        rcd.id

                        OR

                        (
                            remittance.id IS NOT NULL
                            AND
                            cti.remittance_id =
                            remittance.id
                        )
                    )

                ORDER BY
                    cti.created_at DESC NULLS LAST,
                    cti.id DESC

                LIMIT 1

            ) consolidated_item
                ON TRUE


            /* ======================================================
               CONSOLIDATED RCD
            ====================================================== */

            LEFT JOIN rcd_consolidated_transaction consolidated
                ON consolidated.id =
                   consolidated_item.consolidated_transaction_id


            /* ======================================================
               CONSOLIDATED PREPARED BY
            ====================================================== */

            LEFT JOIN users consolidated_prepared
                ON consolidated_prepared.id =
                   consolidated.prepared_by


            /* ======================================================
               CONSOLIDATED APPROVED BY
            ====================================================== */

            LEFT JOIN users consolidated_approved
                ON consolidated_approved.id =
                   consolidated.approved_by


            /*
            ========================================================
            IMPORTANT:

            PostgreSQL aliases below are mapped through
            the consolidated table joins.

            ========================================================
            */

            LEFT JOIN LATERAL (

                SELECT
                    consolidated_prepared.full_name
                        AS prepared_by_name,
                    consolidated_approved.full_name
                        AS approved_by_name

            ) consolidated_users
                ON TRUE


            /* ======================================================
               ORDER BY OR NUMBER
            ====================================================== */

            ORDER BY

                CASE

                    WHEN
                        dt.or_number ~ '^[0-9]+$'

                    THEN
                        CAST(
                            dt.or_number
                            AS BIGINT
                        )

                    ELSE NULL

                END ASC NULLS LAST,

                dt.or_number ASC,

                dti.id ASC

        `);


        /*
        ========================================================
        RESPONSE
        ========================================================
        */

        return NextResponse.json(
            {
                success: true,
                data: result.rows,
                count: result.rows.length,
            },
            {
                status: 200,
            }
        );

    } catch (error: any) {

        console.error(
            "GET OPERATIONS DIPP TRANSACTION ITEMS ERROR:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    error?.message ??
                    "Failed to load operational transaction items.",
            },
            {
                status: 500,
            }
        );
    }
}