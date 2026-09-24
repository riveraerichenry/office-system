import {
    NextRequest,
    NextResponse,
} from "next/server";

import { pool } from "@/lib/db";
import { authorize } from "@/lib/authorize";
import { MODULE_PATHS } from "@/lib/module-paths";


/* ============================================================
   TYPES
============================================================ */

type CollectionRow = {
    id: string;

    remittance_no: string | null;

    remittance_date: string | null;

    total_amount: number;

    rcd_transaction_id: string | null;

    report_no: string | null;

    report_date: string | null;

    collector_name: string | null;

    fund_code: string | null;

    fund_name: string | null;

    values: {
        ctc_corporation: number;
        ctc_individual: number;
        ctc_penalty: number;
    };
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
        /* ========================================================
           AUTHORIZATION
        ======================================================== */

        await authorize(
            req,
            MODULE_PATHS.DIPP,
            "view"
        );


        /* ========================================================
           STEP 1
           
           START FROM REMITTANCE TRANSACTIONS

           remittance_transactions
                    ↓
           rcd_transaction_id
                    ↓
           rcd_transaction
        ======================================================== */

        const remittanceResult =
            await pool.query(
                `
                SELECT
                    rt.id
                        AS remittance_id,

                    rt.remittance_no,

                    rt.remittance_date,

                    rt.total_amount,

                    rt.rcd_transaction_id,

                    rcd.report_no,

                    rcd.report_date,

                    rcd.fund_source_id,

                    fs.fund_code,

                    fs.fund_name,

                    COALESCE(
                        STRING_AGG(
                            DISTINCT
                            collector.full_name,
                            ', '
                        )
                        FILTER (
                            WHERE
                                collector.full_name
                                IS NOT NULL
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

                LEFT JOIN rcd_items ri
                    ON ri.rcd_transaction_id =
                       rcd.id

                LEFT JOIN users collector
                    ON collector.id =
                       ri.collector_id

                LEFT JOIN users rcd_user
                    ON rcd_user.id =
                       rcd.rcd_by

                GROUP BY
                    rt.id,
                    rt.remittance_no,
                    rt.remittance_date,
                    rt.total_amount,
                    rt.rcd_transaction_id,
                    rt.created_at,
                    rcd.id,
                    rcd.report_no,
                    rcd.report_date,
                    rcd.fund_source_id,
                    fs.fund_code,
                    fs.fund_name,
                    rcd_user.full_name

                ORDER BY
                    rt.remittance_date DESC,
                    rt.created_at DESC,
                    rt.id DESC
                `
            );


        /* ========================================================
           BUILD ONE ROW PER REMITTANCE
        ======================================================== */

        const rows: CollectionRow[] = [];


        /* ========================================================
           STEP 2
           
           FOLLOW EXACT RELATIONSHIP:

           remittance_transactions
                    ↓
           rcd_transaction
                    ↓
           rcd_items
                    ↓
           dipp_transactions
                    ↓
           dipp_ctc_items
        ======================================================== */

        for (
            const remittance
            of remittanceResult.rows
        ) {

            let corporationAmount = 0;

            let individualAmount = 0;

            let penaltyAmount = 0;


            /* ====================================================
               GET CTC ITEMS FOR THIS REMITTANCE
            ==================================================== */

            const ctcResult =
                await pool.query(
                    `
                    SELECT
                        dt.id
                            AS dipp_transaction_id,

                        dt.or_number,

                        dt.receipt_date,

                        dci.id
                            AS ctc_item_id,

                        dci.ctc_type,

                        dci.basic_tax,

                        dci.salary_tax,

                        dci.additional_tax,

                        dci.penalty,

                        dci.interest,

                        dci.total_amount

                    FROM rcd_items ri

                    INNER JOIN dipp_transactions dt
                        ON dt.id =
                           ri.dipp_transaction_id

                    INNER JOIN dipp_ctc_items dci
                        ON dci.transaction_id =
                           dt.id

                    WHERE
                        ri.rcd_transaction_id =
                        $1

                    AND
                        COALESCE(
                            dt.is_cancelled,
                            FALSE
                        ) = FALSE

                    AND
                        UPPER(
                            TRIM(
                                dci.ctc_type
                            )
                        ) IN (
                            'CORPORATION',
                            'INDIVIDUAL'
                        )

                    ORDER BY
                        dt.or_number,
                        dci.id
                    `,
                    [
                        remittance.rcd_transaction_id,
                    ]
                );


            /* ====================================================
               PROCESS CTC ITEMS
            ==================================================== */

            for (
                const item
                of ctcResult.rows
            ) {

                const ctcType =
                    String(
                        item.ctc_type ?? ""
                    )
                        .trim()
                        .toUpperCase();


                /* ==================================================
                   CTC TAX VALUE

                   BASIC TAX
                   + SALARY TAX
                   + ADDITIONAL TAX
                ================================================== */

                const ctcValue =
                    money(
                        toNumber(
                            item.basic_tax
                        ) +
                        toNumber(
                            item.salary_tax
                        ) +
                        toNumber(
                            item.additional_tax
                        )
                    );


                /* ==================================================
                   CTC PENALTY

                   PENALTY
                   + INTEREST
                ================================================== */

                const ctcPenalty =
                    money(
                        toNumber(
                            item.penalty
                        ) +
                        toNumber(
                            item.interest
                        )
                    );


                /* ==================================================
                   CORPORATION
                ================================================== */

                if (
                    ctcType ===
                    "CORPORATION"
                ) {

                    corporationAmount =
                        money(
                            corporationAmount +
                            ctcValue
                        );

                    penaltyAmount =
                        money(
                            penaltyAmount +
                            ctcPenalty
                        );

                    continue;
                }


                /* ==================================================
                   INDIVIDUAL
                ================================================== */

                if (
                    ctcType ===
                    "INDIVIDUAL"
                ) {

                    individualAmount =
                        money(
                            individualAmount +
                            ctcValue
                        );

                    penaltyAmount =
                        money(
                            penaltyAmount +
                            ctcPenalty
                        );
                }
            }


            /* ====================================================
               BUILD ROW
            ==================================================== */

            rows.push({
                id:
                    String(
                        remittance.remittance_id
                    ),

                remittance_no:
                    remittance.remittance_no ??
                    null,

                remittance_date:
                    remittance.remittance_date ??
                    null,

                total_amount:
                    money(
                        toNumber(
                            remittance.total_amount
                        )
                    ),

                rcd_transaction_id:
                    remittance.rcd_transaction_id ??
                    null,

                report_no:
                    remittance.report_no ??
                    null,

                report_date:
                    remittance.report_date ??
                    null,

                collector_name:
                    remittance.collector_name ??
                    null,

                fund_code:
                    remittance.fund_code ??
                    null,

                fund_name:
                    remittance.fund_name ??
                    null,

                values: {
                    ctc_corporation:
                        corporationAmount,

                    ctc_individual:
                        individualAmount,

                    ctc_penalty:
                        penaltyAmount,
                },
            });
        }


        /* ========================================================
           RESPONSE
        ======================================================== */

        return NextResponse.json({
            success: true,

            data: rows,

            columns: [
                {
                    id:
                        "ctc_corporation",

                    code:
                        "4 01 01 050",

                    label:
                        "CTC-corp.",
                },

                {
                    id:
                        "ctc_individual",

                    code:
                        "4 01 01 050",

                    label:
                        "CTC-indv.",
                },

                {
                    id:
                        "ctc_penalty",

                    code:
                        null,

                    label:
                        "CTC-PEN.",
                },
            ],

            count:
                rows.length,
        });


    } catch (
        error: any
    ) {

        console.error(
            "GET TAX REVENUE-COL002 ERROR:",
            error
        );


        return NextResponse.json(
            {
                success: false,

                message:
                    error?.message ??
                    "Failed to load Tax Revenue-COL002.",
            },
            {
                status: 500,
            }
        );
    }
}