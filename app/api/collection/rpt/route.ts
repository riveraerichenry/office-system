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

type RemittanceRow = {
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
};

/* ============================================================
   HELPERS
============================================================ */

function toNumber(value: unknown): number {
    const numberValue = Number(value ?? 0);

    return Number.isFinite(numberValue)
        ? numberValue
        : 0;
}

function money(value: number): number {
    return Number(value.toFixed(2));
}

/* ============================================================
   GET
   Returns REMITTANCES ONLY.

   No RPT filtering.
   No dipp_rpt_items lookup.
   No RPT amount calculation.

   REMITTANCE
       ↓
   RCD
       ↓
   RCD ITEMS
       ↓
   COLLECTOR
============================================================ */

export async function GET(req: NextRequest) {
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
           QUERY PARAMETERS
        ======================================================== */

        const { searchParams } = new URL(req.url);

        const search =
            searchParams.get("search")?.trim() ?? "";

        const year =
            searchParams.get("year")?.trim() ?? "";

        const month =
            searchParams.get("month")?.trim() ?? "";

        /* ========================================================
           LOAD REMITTANCES ONLY

           This intentionally does NOT join dipp_rpt_items.

           Every remittance linked to an RCD is returned,
           regardless of whether it contains RPT, CTC, AF51,
           AF56, or another collection type.
        ======================================================== */

        const result = await pool.query(
            `
            SELECT
                rt.id AS remittance_id,

                rt.remittance_no,

                rt.remittance_date,

                rt.total_amount,

                rcd.id AS rcd_transaction_id,

                rcd.report_no,

                rcd.report_date,

                fs.fund_code,

                fs.fund_name,

                COALESCE(
                    STRING_AGG(
                        DISTINCT collector.full_name,
                        ', '
                    ) FILTER (
                        WHERE collector.full_name IS NOT NULL
                    ),
                    rcd_user.full_name,
                    '—'
                ) AS collector_name

            FROM remittance_transactions rt

            INNER JOIN rcd_transaction rcd
                ON rcd.id = rt.rcd_transaction_id

            LEFT JOIN fund_sources fs
                ON fs.id = rcd.fund_source_id

            LEFT JOIN rcd_items ri
                ON ri.rcd_transaction_id = rcd.id

            LEFT JOIN users collector
                ON collector.id = ri.collector_id

            LEFT JOIN users rcd_user
                ON rcd_user.id = rcd.rcd_by

            WHERE
                (
                    $1 = ''
                    OR rt.remittance_no ILIKE
                        '%' || $1 || '%'
                    OR collector.full_name ILIKE
                        '%' || $1 || '%'
                    OR rcd.report_no ILIKE
                        '%' || $1 || '%'
                )

            AND
                (
                    $2 = ''
                    OR EXTRACT(
                        YEAR FROM rt.remittance_date
                    )::TEXT = $2
                )

            AND
                (
                    $3 = ''
                    OR EXTRACT(
                        MONTH FROM rt.remittance_date
                    )::TEXT = $3
                )

            GROUP BY
                rt.id,
                rt.remittance_no,
                rt.remittance_date,
                rt.total_amount,
                rt.created_at,
                rcd.id,
                rcd.report_no,
                rcd.report_date,
                rcd.fund_source_id,
                fs.fund_code,
                fs.fund_name,
                rcd_user.full_name

            ORDER BY
                rt.remittance_date DESC NULLS LAST,
                rt.created_at DESC NULLS LAST,
                rt.id DESC
            `,
            [
                search,
                year,
                month,
            ]
        );

        /* ========================================================
           BUILD RESPONSE
        ======================================================== */

        const rows: RemittanceRow[] =
            result.rows.map((row) => ({
                id: String(row.remittance_id),

                remittance_no:
                    row.remittance_no ?? null,

                remittance_date:
                    row.remittance_date ?? null,

                /*
                 * THIS IS THE REMITTANCE AMOUNT.
                 *
                 * It comes directly from:
                 * remittance_transactions.total_amount
                 *
                 * It does NOT come from dipp_rpt_items.amount.
                 */
                total_amount:
                    money(
                        toNumber(
                            row.total_amount
                        )
                    ),

                rcd_transaction_id:
                    row.rcd_transaction_id
                        ? String(
                            row.rcd_transaction_id
                        )
                        : null,

                report_no:
                    row.report_no ?? null,

                report_date:
                    row.report_date ?? null,

                collector_name:
                    row.collector_name ?? null,

                fund_code:
                    row.fund_code ?? null,

                fund_name:
                    row.fund_name ?? null,
            }));

        /* ========================================================
           RESPONSE
        ======================================================== */

        return NextResponse.json({
            success: true,
            data: rows,
            count: rows.length,
        });

    } catch (error: any) {
        console.error(
            "GET COLLECTION REMITTANCES ERROR:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    error?.message ??
                    "Failed to load remittances.",
            },
            {
                status: 500,
            }
        );
    }
}
