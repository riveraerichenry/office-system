import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function getId(context: RouteContext) {
  const { id } = await context.params;
  return id;
}

export async function PUT(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const id = await getId(context);

    if (!UUID_PATTERN.test(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid bank account ID." },
        { status: 400 }
      );
    }

    const body = await req.json();

    const {
      sequence_code,
      bank_id,
      account_number,
      account_code,
      account_name,
      account_status,
      deposit_label,
      remarks,
      fund_source_id,
    } = body;

    if (
      typeof sequence_code !== "string" ||
      !sequence_code.trim() ||
      typeof bank_id !== "string" ||
      !UUID_PATTERN.test(bank_id) ||
      typeof account_number !== "string" ||
      !account_number.trim() ||
      typeof account_name !== "string" ||
      !account_name.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Sequence code, valid bank, account number, and account name are required.",
        },
        { status: 400 }
      );
    }

    if (
      fund_source_id !== undefined &&
      fund_source_id !== null &&
      fund_source_id !== "" &&
      (typeof fund_source_id !== "string" ||
        !UUID_PATTERN.test(fund_source_id))
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid fund source ID." },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const existing = await client.query(
        `SELECT id FROM public.bank_accounts WHERE id = $1`,
        [id]
      );

      if (existing.rowCount === 0) {
        await client.query("ROLLBACK");

        return NextResponse.json(
          { success: false, message: "Bank account not found." },
          { status: 404 }
        );
      }

      const bankResult = await client.query(
        `SELECT id FROM public.banks WHERE id = $1`,
        [bank_id]
      );

      if (bankResult.rowCount === 0) {
        await client.query("ROLLBACK");

        return NextResponse.json(
          { success: false, message: "The selected bank does not exist." },
          { status: 400 }
        );
      }

      if (fund_source_id) {
        const fundResult = await client.query(
          `
            SELECT id
            FROM public.fund_sources
            WHERE id = $1
              AND is_active = TRUE
          `,
          [fund_source_id]
        );

        if (fundResult.rowCount === 0) {
          await client.query("ROLLBACK");

          return NextResponse.json(
            {
              success: false,
              message: "The selected fund source is not active or does not exist.",
            },
            { status: 400 }
          );
        }
      }

      const result = await client.query(
        `
          UPDATE public.bank_accounts
          SET
            sequence_code = $1,
            bank_id = $2,
            account_number = $3,
            account_code = $4,
            account_name = $5,
            account_status = $6,
            deposit_label = $7,
            remarks = $8,
            fund_source_id = $9
          WHERE id = $10
          RETURNING *
        `,
        [
          sequence_code.trim(),
          bank_id,
          account_number.trim(),
          typeof account_code === "string" && account_code.trim()
            ? account_code.trim()
            : null,
          account_name.trim(),
          typeof account_status === "string" && account_status.trim()
            ? account_status.trim()
            : "ACTIVE",
          typeof deposit_label === "string" && deposit_label.trim()
            ? deposit_label.trim()
            : null,
          typeof remarks === "string" && remarks.trim()
            ? remarks.trim()
            : null,
          fund_source_id || null,
          id,
        ]
      );

      await client.query("COMMIT");

      return NextResponse.json({
        success: true,
        message: "Bank account updated successfully.",
        account: result.rows[0],
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("PUT /api/bank_accounts/[id] error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update bank account." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const id = await getId(context);

    if (!UUID_PATTERN.test(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid bank account ID." },
        { status: 400 }
      );
    }

    const body = await req.json();

    if (typeof body.is_active !== "boolean") {
      return NextResponse.json(
        { success: false, message: "is_active must be true or false." },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `
        UPDATE public.bank_accounts
        SET is_active = $1
        WHERE id = $2
        RETURNING id, is_active
      `,
      [body.is_active, id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: "Bank account not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: body.is_active
        ? "Bank account activated successfully."
        : "Bank account deactivated successfully.",
      account: result.rows[0],
    });
  } catch (error) {
    console.error("PATCH /api/bank_accounts/[id] error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update bank account status." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  context: RouteContext
) {
  try {
    const id = await getId(context);

    if (!UUID_PATTERN.test(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid bank account ID." },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `
        DELETE FROM public.bank_accounts
        WHERE id = $1
        RETURNING id
      `,
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: "Bank account not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Bank account deleted successfully.",
      id: result.rows[0].id,
    });
  } catch (error) {
    console.error("DELETE /api/bank_accounts/[id] error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to delete bank account. It may be referenced by other records.",
      },
      { status: 500 }
    );
  }
}