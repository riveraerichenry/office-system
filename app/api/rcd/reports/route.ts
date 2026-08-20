import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function GET(
    request: NextRequest
) {

    const client = await pool.connect();

    try {

        const searchParams =
            request.nextUrl.searchParams;

        const fundSourceId =
            searchParams.get("fund_source_id")?.trim() || "";

        const dateFrom =
            searchParams.get("date_from")?.trim() || "";

        const dateTo =
            searchParams.get("date_to")?.trim() || "";

        const values: any[] = [];

        const conditions: string[] = [];

        /*
        =========================================================
        FUND SOURCE
        =========================================================
        */

        if (fundSourceId) {

            values.push(
                fundSourceId
            );

            conditions.push(
                `rt.fund_source_id = $${values.length}`
            );

        }

        /*
        =========================================================
        COVERAGE FROM
        =========================================================
        */

        if (dateFrom) {

            values.push(
                dateFrom
            );

            conditions.push(
                `rt.date_from >= $${values.length}::date`
            );

        }

        /*
        =========================================================
        COVERAGE TO
        =========================================================
        */

        if (dateTo) {

            values.push(
                dateTo
            );

            conditions.push(
                `rt.date_to <= $${values.length}::date`
            );

        }

        /*
        =========================================================
        WHERE
        =========================================================
        */

        const whereClause =
            conditions.length > 0
                ? `WHERE ${conditions.join(" AND ")}`
                : "";

        /*
        =========================================================
        GET RCD REPORTS
        =========================================================
        */

        const result =
            await client.query(
                `
                SELECT

                    rt.id,

                    rt.report_no,

                    rt.report_date,

                    rt.fund_source_id,

                    rt.date_from,

                    rt.date_to,

                    rt.total_collections,

                    rt.total_remittances,

                    rt.total_deposits,

                    rt.balance,

                    rt.status,

                    rt.rcd_by,

                    fs.fund_code,

                    fs.fund_name,

                    fs.acronym

                FROM rcd_transaction rt

                LEFT JOIN fund_sources fs
                    ON fs.id =
                        rt.fund_source_id

                ${whereClause}

                ORDER BY
                    rt.report_date DESC,
                    rt.created_at DESC
                `,
                values
            );

        /*
        =========================================================
        FORMAT
        =========================================================
        */

        const rcds =
            result.rows.map(
                row => ({

                    id:
                        row.id,

                    report_no:
                        row.report_no,

                    report_date:
                        row.report_date,

                    fund_source_id:
                        row.fund_source_id,

                    date_from:
                        row.date_from,

                    date_to:
                        row.date_to,

                    total_collections:
                        Number(
                            row.total_collections ??
                                0
                        ),

                    total_remittances:
                        Number(
                            row.total_remittances ??
                                0
                        ),

                    total_deposits:
                        Number(
                            row.total_deposits ??
                                0
                        ),

                    balance:
                        Number(
                            row.balance ??
                                0
                        ),

                    status:
                        row.status,

                    rcd_by:
                        row.rcd_by,

                    fund_code:
                        row.fund_code,

                    fund_name:
                        row.fund_name,

                    acronym:
                        row.acronym,

                })
            );

        return NextResponse.json({

            success: true,

            data:
                rcds,

            count:
                rcds.length,

        });

    }
    catch (
        error: any
    ) {

        console.error(
            "GET RCD REPORTS ERROR:",
            error
        );

        return NextResponse.json(
            {
                success: false,

                message:
                    error?.message ??
                    "Failed to load RCD reports.",
            },
            {
                status: 500,
            }
        );

    }
    finally {

        client.release();

    }

}