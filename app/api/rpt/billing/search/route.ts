import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest) {

    try {

        const search =
            req.nextUrl.searchParams.get("q") ?? "";

        const result =
            await pool.query(

                `
                SELECT
                    id,
                    billing_number,
                    billing_date,
                    owner_name,
                    fullpin,
                    classification_name,
                    barangay_name,
                    td_number,
                    grand_total,
                    status
                FROM rpt_billings
                WHERE
                    billing_number ILIKE '%' || $1 || '%'
                    OR owner_name ILIKE '%' || $1 || '%'
                    OR td_number ILIKE '%' || $1 || '%'
                    OR fullpin ILIKE '%' || $1 || '%'
                ORDER BY
                    billing_date DESC,
                    billing_number DESC
                LIMIT 10
                `,
                [search]

            );

        return NextResponse.json({

            success: true,

            data: result.rows,

        });

    } catch (error) {

        console.error(error);

        return NextResponse.json(

            {

                success: false,

                message: "Unable to search billings.",

            },

            {

                status: 500,

            }

        );

    }

}