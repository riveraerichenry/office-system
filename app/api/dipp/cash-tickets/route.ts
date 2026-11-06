
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { authorize } from "@/lib/authorize";
import { MODULE_PATHS } from "@/lib/module-paths";

export async function GET(req: NextRequest) {
    try {
        const user = await authorize(req, MODULE_PATHS.DIPP, "view");
        const fullName = String(user.full_name ?? "").trim();

        if (!fullName) {
            return NextResponse.json(
                {
                    success: false,
                    message: "The logged-in user does not have a full_name value.",
                    data: [],
                },
                { status: 400 }
            );
        }

        const diagnostic = await pool.query(
            `
            SELECT
                COUNT(*)::int AS matching_assignments,
                COUNT(ct.id)::int AS matching_ticket_records
            FROM smi_cash_ticket_assignments a
            LEFT JOIN smi_cash_tickets ct
                ON ct.id = a.cash_ticket_id
            WHERE
                a.assigned_to IS NOT NULL
                AND TRIM(a.assigned_to) <> ''
                AND LOWER(TRIM(a.assigned_to)) = LOWER(TRIM($1))
            `,
            [fullName]
        );

        const result = await pool.query(
            `
            SELECT
                a.id AS assignment_id,
                a.cash_ticket_id,
                a.assigned_to,
                a.office_name,
                a.assignment_date,
                a.quantity_assigned,
                a.remarks,
                a.assigned_by,
                a.status,

                ct.ticket_number,
                ct.ticket_date,
                ct.number_of_tickets,
                ct.price_per_ticket,
                ct.amount,
                ct.remaining,

                (
                    a.quantity_assigned * ct.price_per_ticket
                ) AS assigned_amount,

                COALESCE(issued.total_issued, 0)::int
                    AS total_issued,

                GREATEST(
                    a.quantity_assigned -
                    COALESCE(issued.total_issued, 0),
                    0
                )::int AS available_quantity

            FROM smi_cash_ticket_assignments a

            INNER JOIN smi_cash_tickets ct
                ON ct.id = a.cash_ticket_id

            LEFT JOIN LATERAL (
                SELECT
                    COALESCE(SUM(i.quantity_issued), 0)::int
                        AS total_issued

                FROM dipp_cashticket_transaction t

                INNER JOIN dipp_cashticket_transaction_items i
                    ON i.transaction_id = t.id

                WHERE t.assignment_id = a.id
            ) issued ON TRUE

            WHERE
                a.assigned_to IS NOT NULL
                AND TRIM(a.assigned_to) <> ''
                AND LOWER(TRIM(a.assigned_to)) = LOWER(TRIM($1))

            ORDER BY
                a.assignment_date DESC NULLS LAST,
                a.id DESC
            `,
            [fullName]
        );

        return NextResponse.json({
            success: true,
            data: result.rows,
            debug: {
                logged_in_full_name: fullName,
                matching_assignments:
                    diagnostic.rows[0]?.matching_assignments ?? 0,
                matching_ticket_records:
                    diagnostic.rows[0]?.matching_ticket_records ?? 0,
            },
        });
    } catch (error: any) {
        console.error("GET DIPP Cash Tickets Error:", error);

        const forbidden = error?.message === "FORBIDDEN";

        return NextResponse.json(
            {
                success: false,
                message: forbidden
                    ? "You are not authorized to access this resource."
                    : "Failed to retrieve assigned cash tickets.",
                data: [],
            },
            { status: forbidden ? 403 : 500 }
        );
    }
}
