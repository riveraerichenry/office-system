
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function getId(context: RouteContext): Promise<string> {
  const { id } = await context.params;
  return id;
}

// GET: Retrieve one bank
export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const id = await getId(context);

    if (!UUID_PATTERN.test(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid bank ID." },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `
        SELECT
          b.id,
          b.bank_code,
          b.bank_name,
          b.seq_no,
          b.remarks,
          b.is_active,
          b.created_at,
          COUNT(ba.id)::int AS account_count
        FROM banks b
        LEFT JOIN bank_accounts ba
          ON ba.bank_id = b.id
        WHERE b.id = $1
        GROUP BY b.id
      `,
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: "Bank not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      bank: result.rows[0],
    });
  } catch (error: unknown) {
    console.error("GET /api/banks/[id]:", error);

    return NextResponse.json(
      { success: false, message: "Failed to retrieve bank." },
      { status: 500 }
    );
  }
}

// PUT: Update bank information
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const id = await getId(context);

    if (!UUID_PATTERN.test(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid bank ID." },
        { status: 400 }
      );
    }

    const body = await request.json();

    const bankCode =
      typeof body.bank_code === "string"
        ? body.bank_code.trim()
        : "";

    const bankName =
      typeof body.bank_name === "string"
        ? body.bank_name.trim()
        : "";

    const seqNo =
      body.seq_no === null ||
      body.seq_no === undefined ||
      body.seq_no === ""
        ? 0
        : Number(body.seq_no);

    const remarks =
      typeof body.remarks === "string"
        ? body.remarks.trim()
        : null;

    const isActive =
      typeof body.is_active === "boolean"
        ? body.is_active
        : true;

    if (!bankCode || !bankName) {
      return NextResponse.json(
        {
          success: false,
          message: "Bank code and bank name are required.",
        },
        { status: 400 }
      );
    }

    if (!Number.isInteger(seqNo)) {
      return NextResponse.json(
        {
          success: false,
          message: "Sequence number must be a whole number.",
        },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `
        UPDATE banks
        SET
          bank_code = $1,
          bank_name = $2,
          seq_no = $3,
          remarks = $4,
          is_active = $5
        WHERE id = $6
        RETURNING
          id,
          bank_code,
          bank_name,
          seq_no,
          remarks,
          is_active,
          created_at
      `,
      [
        bankCode,
        bankName,
        seqNo,
        remarks,
        isActive,
        id,
      ]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: "Bank not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Bank updated successfully.",
      bank: result.rows[0],
    });
  } catch (error: unknown) {
    console.error("PUT /api/banks/[id]:", error);

    const dbError = error as { code?: string };

    if (dbError.code === "23505") {
      return NextResponse.json(
        {
          success: false,
          message: "A bank with this code already exists.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to update bank." },
      { status: 500 }
    );
  }
}

// PATCH: Activate or deactivate a bank
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const id = await getId(context);

    if (!UUID_PATTERN.test(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid bank ID." },
        { status: 400 }
      );
    }

    const body = await request.json();

    if (typeof body.is_active !== "boolean") {
      return NextResponse.json(
        {
          success: false,
          message: "is_active must be true or false.",
        },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `
        UPDATE banks
        SET is_active = $1
        WHERE id = $2
        RETURNING
          id,
          bank_code,
          bank_name,
          is_active
      `,
      [body.is_active, id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: "Bank not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: body.is_active
        ? "Bank activated successfully."
        : "Bank deactivated successfully.",
      bank: result.rows[0],
    });
  } catch (error: unknown) {
    console.error("PATCH /api/banks/[id]:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update bank status." },
      { status: 500 }
    );
  }
}

// DELETE: Permanently delete a bank
export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const id = await getId(context);

    if (!UUID_PATTERN.test(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid bank ID." },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `
        DELETE FROM banks
        WHERE id = $1
        RETURNING id, bank_code, bank_name
      `,
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: "Bank not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Bank deleted successfully.",
      bank: result.rows[0],
    });
  } catch (error: unknown) {
    console.error("DELETE /api/banks/[id]:", error);

    const dbError = error as { code?: string };

    // PostgreSQL foreign-key constraint violation
    if (dbError.code === "23503") {
      return NextResponse.json(
        {
          success: false,
          message:
            "This bank cannot be deleted because it is referenced by other records or has associated bank accounts.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to delete bank." },
      { status: 500 }
    );
  }
}
