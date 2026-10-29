
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { authorize } from "@/lib/authorize";
import { MODULE_PATHS } from "@/lib/module-paths";

export async function GET(req: NextRequest) {
  try {
    await authorize(req, MODULE_PATHS.SMI, "view");

    const result = await pool.query(
      `
      SELECT
        ct.id,
        ct.ticket_number,
        ct.ticket_date,
        ct.number_of_tickets,
        ct.remaining,
        ct.price_per_ticket,
        ct.amount,
        ct.created_at,
        (
          ct.number_of_tickets - ct.remaining
        ) AS assigned_quantity
      FROM smi_cash_tickets AS ct
      ORDER BY ct.created_at DESC
      `
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Cash Tickets GET Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load cash tickets.",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await authorize(req, MODULE_PATHS.SMI, "add");

    const body = await req.json();

    const ticket_number = String(body.ticket_number ?? "").trim();
    const ticket_date = body.ticket_date;
    const number_of_tickets = Number(body.number_of_tickets);

    if (!ticket_number) {
      return NextResponse.json(
        { success: false, message: "Ticket number is required." },
        { status: 400 }
      );
    }

    if (
      !ticket_date ||
      Number.isNaN(Date.parse(ticket_date))
    ) {
      return NextResponse.json(
        { success: false, message: "A valid ticket date is required." },
        { status: 400 }
      );
    }

    if (
      !Number.isSafeInteger(number_of_tickets) ||
      number_of_tickets <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Number of tickets must be a positive whole number.",
        },
        { status: 400 }
      );
    }

    const price_per_ticket = 5;
    const amount = number_of_tickets * price_per_ticket;

    const result = await pool.query(
      `
      INSERT INTO smi_cash_tickets (
        ticket_number,
        ticket_date,
        number_of_tickets,
        remaining,
        price_per_ticket,
        amount
      )
      VALUES ($1, $2, $3, $3, $4, $5)
      RETURNING
        id,
        ticket_number,
        ticket_date,
        number_of_tickets,
        remaining,
        price_per_ticket,
        amount,
        created_at
      `,
      [
        ticket_number,
        ticket_date,
        number_of_tickets,
        price_per_ticket,
        amount,
      ]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Cash tickets registered successfully.",
        data: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Cash Tickets POST Error:", error);

    const pgError = error as { code?: string };

    if (pgError.code === "23505") {
      return NextResponse.json(
        {
          success: false,
          message: "This cash ticket number already exists.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to register cash tickets.",
      },
      { status: 500 }
    );
  }
}
