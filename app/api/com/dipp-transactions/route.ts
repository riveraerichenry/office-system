import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/authorize";
import { pool } from "@/lib/db";
import { MODULE_PATHS } from "@/lib/module-paths";

export async function GET(req: NextRequest) {
    try {
        // Allow access through COM permissions.
        // Maria does not need the DIPP module assigned.
        await authorize(req, "/com", "view");
        const result = await pool.query(`
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
                dt.lor_release_id,
                dt.remittance_id,
                dt.collector_id,
                dt.encoded_by,
                dt.created_at,

                af.form_code,
                af.form_name,

                collector.full_name AS collector_name,
                encoder.full_name AS encoded_by_name,

                lr.id AS lor_release_id,
                lr.lor_no AS lor_no,
                lr.fund_source_id AS fund_source_id,

                fs.fund_code AS fund_code,
                fs.fund_name AS fund_name,
                fs.acronym AS fund_acronym

            FROM dipp_transactions dt

            LEFT JOIN accountable_forms af
                ON af.id = dt.accountable_form_id

            LEFT JOIN users collector
                ON collector.id = dt.collector_id

            LEFT JOIN users encoder
                ON encoder.id = dt.encoded_by

            LEFT JOIN lor_releases lr
                ON lr.id = dt.lor_release_id

            LEFT JOIN fund_sources fs
                ON fs.id = lr.fund_source_id

            ORDER BY
                dt.receipt_date DESC NULLS LAST,
                dt.created_at DESC NULLS LAST
        `);

        return NextResponse.json({
            success: true,
            data: result.rows,
            count: result.rows.length,
        });

    } catch (error: unknown) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to load DIPP transactions.";

        console.error("GET COM DIPP TRANSACTIONS ERROR:", error);

        if (message === "FORBIDDEN") {
            return NextResponse.json(
                {
                    success: false,
                    message: "You do not have permission to view this list.",
                },
                { status: 403 }
            );
        }

        if (
            message === "UNAUTHORIZED" ||
            message === "Unauthorized"
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Please log in to continue.",
                },
                { status: 401 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: "Failed to load DIPP transactions.",
            },
            { status: 500 }
        );
    }
}