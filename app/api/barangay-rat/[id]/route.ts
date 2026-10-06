import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

export async function GET(
    request: NextRequest,
    context: RouteContext
) {
    try {
        const { id } = await context.params;

        if (!id) {
            return NextResponse.json(
                {
                    success: false,
                    message: "RAT ID is required.",
                },
                { status: 400 }
            );
        }

        const headerResult = await pool.query(
            `
            SELECT
                h.id,
                h.rat_no,
                h.barangay_user_id,
                h.status,
                h.remarks,
                h.generated_at,
                h.completed_at,
                h.created_at,

                bu.username,
                bu.first_name,
                bu.middle_name,
                bu.last_name,
                bu.email,

                b.id AS barangay_id,
                b.barangay_code,
                b.barangay_name,
                b.municipality,
                b.province

            FROM barangay_rat_headers h

            INNER JOIN barangay_users bu
                ON bu.id = h.barangay_user_id

            LEFT JOIN barangays b
                ON b.id = bu.barangay_id

            WHERE h.id = $1
                AND h.is_active = TRUE

            LIMIT 1
            `,
            [id]
        );

        if (headerResult.rows.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Barangay RAT not found.",
                },
                { status: 404 }
            );
        }

        const header = headerResult.rows[0];

        const fullName = [
            header.first_name,
            header.middle_name,
            header.last_name,
        ]
            .filter(Boolean)
            .join(" ");

        const itemsResult = await pool.query(
            `
            SELECT
                i.id,
                i.rat_id,
                i.booklet_id,
                i.issued_at,
                i.remarks,
                i.created_at,

                br.control_no,
                br.accountable_form_id,
                br.fiscal_year,
                br.series,
                br.beginning_or,
                br.ending_or,
                br.receipt_count,
                br.current_or,
                br.status,
                br.received_date,
                br.issued_date,
                br.supplier,
                br.is_active

            FROM barangay_rat_items i

            INNER JOIN smi_booklet_registration br
                ON br.id = i.booklet_id

            WHERE i.rat_id = $1
                AND i.is_active = TRUE

            ORDER BY
                i.created_at ASC
            `,
            [id]
        );

        return NextResponse.json({
            success: true,

            rat: {
                id: header.id,
                rat_no: header.rat_no,
                status: header.status,
                remarks: header.remarks,
                generated_at: header.generated_at,
                completed_at: header.completed_at,
                created_at: header.created_at,

                barangay_user: {
                    id: header.barangay_user_id,
                    username: header.username,
                    full_name: fullName,
                    email: header.email,
                },

                barangay: {
                    id: header.barangay_id,
                    code: header.barangay_code,
                    name: header.barangay_name,
                    municipality:
                        header.municipality,
                    province: header.province,
                },
            },

            items: itemsResult.rows,
        });
    } catch (error) {
        console.error(
            "Barangay RAT details error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to load Barangay RAT details.",
            },
            { status: 500 }
        );
    }
}