import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { authorize } from "@/lib/authorize";
import { MODULE_PATHS } from "@/lib/module-paths";

/* =========================================================
   GET - CASH TICKET TRANSACTION HISTORY
========================================================= */
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

        const result = await pool.query(
            `
            SELECT
                t.id AS transaction_id,
                t.assignment_id,
                t.cash_ticket_id,
                t.transaction_date,
                t.issued_by,

                ct.ticket_number AS cash_ticket_number,

                COALESCE(SUM(i.quantity_issued), 0)::int
                    AS total_quantity_issued,

                COALESCE(SUM(i.total_amount), 0)::numeric(14, 2)
                    AS total_amount,

                COALESCE(
                    JSON_AGG(
                        JSON_BUILD_OBJECT(
                            'id', i.id,
                            'quantity_issued', i.quantity_issued,
                            'price_per_ticket', i.price_per_ticket,
                            'total_amount', i.total_amount,
                            'created_at', i.created_at
                        )
                        ORDER BY i.id
                    ) FILTER (WHERE i.id IS NOT NULL),
                    '[]'::json
                ) AS items

            FROM dipp_cashticket_transaction t

            INNER JOIN smi_cash_ticket_assignments a
                ON a.id = t.assignment_id

            INNER JOIN smi_cash_tickets ct
                ON ct.id = t.cash_ticket_id

            LEFT JOIN dipp_cashticket_transaction_items i
                ON i.transaction_id = t.id

            WHERE LOWER(TRIM(COALESCE(t.issued_by, ''))) =
                  LOWER(TRIM($1))

            GROUP BY
                t.id,
                t.assignment_id,
                t.cash_ticket_id,
                t.transaction_date,
                t.issued_by,
                ct.ticket_number

            ORDER BY t.transaction_date DESC, t.id DESC
            `,
            [fullName]
        );

        return NextResponse.json({
            success: true,
            data: result.rows,
        });
    } catch (error: any) {
        console.error("GET DIPP Cash Ticket Transactions Error:", error);

        const forbidden = error?.message === "FORBIDDEN";

        return NextResponse.json(
            {
                success: false,
                message: forbidden
                    ? "You are not authorized to access this resource."
                    : "Failed to retrieve cash ticket transactions.",
                data: [],
            },
            { status: forbidden ? 403 : 500 }
        );
    }
}

/* =========================================================
   POST - ISSUE CASH TICKETS BY QUANTITY
========================================================= */
export async function POST(req: NextRequest) {
    const client = await pool.connect();
    let transactionStarted = false;

    try {
        const user = await authorize(req, MODULE_PATHS.DIPP, "add");
        const fullName = String(user.full_name ?? "").trim();

        if (!fullName) {
            return NextResponse.json(
                {
                    success: false,
                    message: "The logged-in user does not have a full_name value.",
                },
                { status: 400 }
            );
        }

        const body = await req.json();

        const assignmentId = Number(body.assignment_id);
        const quantityIssued = Number(body.quantity_issued);

        if (!Number.isInteger(assignmentId) || assignmentId <= 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "A valid cash ticket assignment is required.",
                },
                { status: 400 }
            );
        }

        if (!Number.isSafeInteger(quantityIssued) || quantityIssued <= 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Quantity issued must be a positive whole number.",
                },
                { status: 400 }
            );
        }

        await client.query("BEGIN");
        transactionStarted = true;

        /*
         * Lock this user's assignment.
         * This prevents concurrent requests from using
         * the same available balance.
         */
        const assignmentResult = await client.query(
            `
            SELECT
                a.id AS assignment_id,
                a.cash_ticket_id,
                a.assigned_to,
                a.quantity_assigned,
                ct.ticket_number,
                ct.price_per_ticket

            FROM smi_cash_ticket_assignments a

            INNER JOIN smi_cash_tickets ct
                ON ct.id = a.cash_ticket_id

            WHERE
                a.id = $1
                AND a.assigned_to IS NOT NULL
                AND TRIM(a.assigned_to) <> ''
                AND LOWER(TRIM(a.assigned_to)) = LOWER(TRIM($2))

            FOR UPDATE OF a
            `,
            [assignmentId, fullName]
        );

        if (assignmentResult.rows.length === 0) {
            await client.query("ROLLBACK");
            transactionStarted = false;

            return NextResponse.json(
                {
                    success: false,
                    message: "Cash ticket assignment not found or not assigned to your account.",
                },
                { status: 404 }
            );
        }

        const assignment = assignmentResult.rows[0];

        const quantityAssigned = Number(
            assignment.quantity_assigned ?? 0
        );

        const pricePerTicket = Number(
            assignment.price_per_ticket ?? 0
        );

        /*
         * Sum previously issued quantities.
         * Do not count item rows because each row can
         * represent multiple tickets.
         */
        const issuedResult = await client.query(
            `
            SELECT
                COALESCE(SUM(i.quantity_issued), 0)::int
                    AS total_issued

            FROM dipp_cashticket_transaction t

            INNER JOIN dipp_cashticket_transaction_items i
                ON i.transaction_id = t.id

            WHERE t.assignment_id = $1
            `,
            [assignmentId]
        );

        const totalIssued = Number(
            issuedResult.rows[0]?.total_issued ?? 0
        );

        const availableQuantity = Math.max(
            quantityAssigned - totalIssued,
            0
        );

        if (quantityIssued > availableQuantity) {
            await client.query("ROLLBACK");
            transactionStarted = false;

            return NextResponse.json(
                {
                    success: false,
                    message: `Insufficient available cash tickets. Available: ${availableQuantity}, Requested: ${quantityIssued}.`,
                    available_quantity: availableQuantity,
                    requested_quantity: quantityIssued,
                },
                { status: 400 }
            );
        }

        /*
         * Calculate amount in PostgreSQL to avoid
         * JavaScript floating-point currency errors.
         */
        const amountResult = await client.query(
            `
            SELECT ROUND(
                $1::numeric * $2::numeric,
                2
            ) AS total_amount
            `,
            [quantityIssued, pricePerTicket]
        );

        const totalAmount = amountResult.rows[0].total_amount;

        /*
         * Insert transaction header.
         */
        const transactionResult = await client.query(
            `
            INSERT INTO dipp_cashticket_transaction (
                assignment_id,
                cash_ticket_id,
                transaction_date,
                issued_by
            )
            VALUES ($1, $2, NOW(), $3)
            RETURNING id, transaction_date
            `,
            [
                assignment.assignment_id,
                assignment.cash_ticket_id,
                fullName,
            ]
        );

        const transaction = transactionResult.rows[0];

        /*
         * Insert exactly ONE transaction item.
         */
        const itemResult = await client.query(
            `
            INSERT INTO dipp_cashticket_transaction_items (
                transaction_id,
                cash_ticket_id,
                quantity_issued,
                price_per_ticket,
                total_amount
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING
                id,
                quantity_issued,
                price_per_ticket,
                total_amount
            `,
            [
                transaction.id,
                assignment.cash_ticket_id,
                quantityIssued,
                pricePerTicket,
                totalAmount,
            ]
        );

        const item = itemResult.rows[0];

        const newAvailableQuantity =
            availableQuantity - quantityIssued;

        await client.query("COMMIT");
        transactionStarted = false;

        return NextResponse.json(
            {
                success: true,
                message: "Cash ticket issuance recorded successfully.",
                data: {
                    transaction_id: transaction.id,
                    transaction_item_id: item.id,
                    assignment_id: assignment.assignment_id,
                    cash_ticket_id: assignment.cash_ticket_id,
                    cash_ticket_number: assignment.ticket_number,
                    transaction_date: transaction.transaction_date,
                    issued_by: fullName,
                    quantity_assigned: quantityAssigned,
                    previously_issued: totalIssued,
                    quantity_issued: Number(item.quantity_issued),
                    available_quantity: newAvailableQuantity,
                    price_per_ticket: item.price_per_ticket,
                    total_amount: item.total_amount,
                },
            },
            { status: 201 }
        );
    } catch (error: any) {
        if (transactionStarted) {
            await client.query("ROLLBACK");
        }

        console.error("POST DIPP Cash Ticket Transaction Error:", error);

        const forbidden = error?.message === "FORBIDDEN";

        return NextResponse.json(
            {
                success: false,
                message: forbidden
                    ? "You are not authorized to issue cash tickets."
                    : "Failed to record cash ticket issuance.",
            },
            { status: forbidden ? 403 : 500 }
        );
    } finally {
        client.release();
    }
}