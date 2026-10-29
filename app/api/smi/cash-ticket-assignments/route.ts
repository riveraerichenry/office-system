
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { authorize } from "@/lib/authorize";
import { MODULE_PATHS } from "@/lib/module-paths";

export async function POST(req: NextRequest) {
  const client = await pool.connect();
  let transactionStarted = false;

  try {
    await authorize(req, MODULE_PATHS.SMI, "add");

    const body = await req.json();

    const cash_ticket_id = Number(body.cash_ticket_id);
    const assigned_to = String(body.assigned_to ?? "").trim();
    const office_name = String(body.office_name ?? "").trim();
    const assignment_date = body.assignment_date;
    const quantity_assigned = Number(body.quantity_assigned);
    const remarks = String(body.remarks ?? "").trim();
    const assigned_by = body.assigned_by
      ? String(body.assigned_by).trim()
      : null;

    if (
      !Number.isSafeInteger(cash_ticket_id) ||
      cash_ticket_id <= 0
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid cash ticket record." },
        { status: 400 }
      );
    }

    if (!assigned_to) {
      return NextResponse.json(
        { success: false, message: "Assigned-to name is required." },
        { status: 400 }
      );
    }

    if (
      !Number.isSafeInteger(quantity_assigned) ||
      quantity_assigned <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Quantity must be a positive whole number.",
        },
        { status: 400 }
      );
    }

    if (
      !assignment_date ||
      Number.isNaN(Date.parse(assignment_date))
    ) {
      return NextResponse.json(
        { success: false, message: "A valid assignment date is required." },
        { status: 400 }
      );
    }

    await client.query("BEGIN");
    transactionStarted = true;

    // Lock the ticket record to prevent concurrent over-assignment.
    const ticketResult = await client.query(
      `
      SELECT id, number_of_tickets, remaining
      FROM smi_cash_tickets
      WHERE id = $1
      FOR UPDATE
      `,
      [cash_ticket_id]
    );

    if (ticketResult.rowCount === 0) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return NextResponse.json(
        { success: false, message: "Cash ticket record not found." },
        { status: 404 }
      );
    }

    const ticket = ticketResult.rows[0];
    const remaining = Number(ticket.remaining);

    if (quantity_assigned > remaining) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return NextResponse.json(
        {
          success: false,
          message: `Insufficient remaining tickets. Only ${remaining} ticket(s) remain.`,
          remaining,
        },
        { status: 400 }
      );
    }

    // Save the assignment.
    const assignmentResult = await client.query(
      `
      INSERT INTO smi_cash_ticket_assignments (
        cash_ticket_id,
        assigned_to,
        office_name,
        assignment_date,
        quantity_assigned,
        remarks,
        assigned_by,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'assigned')
      RETURNING *
      `,
      [
        cash_ticket_id,
        assigned_to,
        office_name || null,
        assignment_date,
        quantity_assigned,
        remarks || null,
        assigned_by,
      ]
    );

    // Decrease the stored remaining quantity.
    const updateResult = await client.query(
      `
      UPDATE smi_cash_tickets
      SET remaining = remaining - $1
      WHERE id = $2
        AND remaining >= $1
      RETURNING remaining
      `,
      [quantity_assigned, cash_ticket_id]
    );

    if (updateResult.rowCount !== 1) {
      throw new Error(
        "Unable to update remaining quantity. The transaction will be rolled back."
      );
    }

    await client.query("COMMIT");
    transactionStarted = false;

    return NextResponse.json(
      {
        success: true,
        message: "Cash tickets assigned successfully.",
        data: assignmentResult.rows[0],
        remaining: Number(updateResult.rows[0].remaining),
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Cash Ticket Assignment Rollback Error:", rollbackError);
      }
    }

    console.error("Cash Ticket Assignment Error:", error);

    const message =
      error instanceof Error ? error.message : "Unknown error";

    if (
      message.includes("Insufficient privilege") ||
      message.includes("Unauthorized") ||
      message.includes("Forbidden")
    ) {
      return NextResponse.json(
        { success: false, message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to assign cash tickets.",
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
