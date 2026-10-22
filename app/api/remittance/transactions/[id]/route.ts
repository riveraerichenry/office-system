
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { pool } from "@/lib/db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type AuthenticatedUser = {
  id: string;
};

async function authenticate(
  request: NextRequest
): Promise<AuthenticatedUser | null> {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return null;
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured.");
  }

  try {
    const decoded = jwt.verify(token, secret) as { id?: string };

    if (!decoded.id) {
      return null;
    }

    const result = await pool.query(
      `SELECT id FROM public.users WHERE id = $1 LIMIT 1`,
      [decoded.id]
    );

    return result.rows[0] ?? null;
  } catch {
    return null;
  }
}

/* ============================================================
   PATCH REMITTANCE
   Editable fields:
   - remittance_no
   - remittance_date
   - remarks
============================================================ */

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  const client = await pool.connect();

  try {
    const user = await authenticate(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Remittance ID is required." },
        { status: 400 }
      );
    }

    let body: {
      remittance_no?: unknown;
      remittance_date?: unknown;
      remarks?: unknown;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const remittanceNo =
      typeof body.remittance_no === "string"
        ? body.remittance_no.trim()
        : "";

    const remittanceDate =
      typeof body.remittance_date === "string"
        ? body.remittance_date.trim()
        : "";

    const remarks =
      typeof body.remarks === "string"
        ? body.remarks.trim()
        : "";

    if (!remittanceNo) {
      return NextResponse.json(
        { success: false, error: "Remittance number is required." },
        { status: 400 }
      );
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(remittanceDate)) {
      return NextResponse.json(
        { success: false, error: "A valid remittance date is required." },
        { status: 400 }
      );
    }

    await client.query("BEGIN");

    const existing = await client.query(
      `
      SELECT id
      FROM public.rcd_remittance_transactions
      WHERE id = $1
      FOR UPDATE
      `,
      [id]
    );

    if (existing.rows.length === 0) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        { success: false, error: "Remittance not found." },
        { status: 404 }
      );
    }

    const consolidated = await client.query(
      `
      SELECT 1
      FROM public.rcd_consolidated_transaction_items
      WHERE remittance_id = $1
      LIMIT 1
      `,
      [id]
    );

    if (consolidated.rows.length > 0) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,
          error:
            "This remittance is already included in a consolidated RCD and cannot be edited.",
        },
        { status: 409 }
      );
    }

    const duplicate = await client.query(
      `
      SELECT id
      FROM public.rcd_remittance_transactions
      WHERE LOWER(TRIM(remittance_no)) = LOWER(TRIM($1))
        AND id <> $2
      LIMIT 1
      `,
      [remittanceNo, id]
    );

    if (duplicate.rows.length > 0) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,
          error: "That remittance number is already in use.",
        },
        { status: 409 }
      );
    }

    const updated = await client.query(
      `
      UPDATE public.rcd_remittance_transactions
      SET
        remittance_no = $1,
        remittance_date = $2::date,
        remarks = $3,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING
        id,
        remittance_no,
        remittance_date,
        remarks,
        total_amount,
        status,
        updated_at
      `,
      [remittanceNo, remittanceDate, remarks || null, id]
    );

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      message: "Remittance updated successfully.",
      transaction: updated.rows[0],
    });
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {}

    console.error("PATCH remittance error:", error);

    const pgError = error as { code?: string };

    return NextResponse.json(
      {
        success: false,
        error:
          pgError.code === "23505"
            ? "That remittance number is already in use."
            : error instanceof Error
              ? error.message
              : "Failed to update remittance.",
      },
      {
        status: pgError.code === "23505" ? 409 : 500,
      }
    );
  } finally {
    client.release();
  }
}

/* ============================================================
   DELETE REMITTANCE

   1. Authenticate the user.
   2. Lock the remittance record.
   3. Prevent deletion if consolidated.
   4. Lock the original RCD.
   5. Reverse the remittance accounting.
   6. Delete the remittance record.
   7. Commit everything together.

   IMPORTANT:
   This assumes each remittance represents the full amount
   posted to the original RCD. Verify the amount field against
   your POST remittance API before using it in production.
============================================================ */

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  const client = await pool.connect();

  try {
    const user = await authenticate(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Remittance ID is required." },
        { status: 400 }
      );
    }

    await client.query("BEGIN");

    // Lock the remittance record.
    const existing = await client.query(
      `
      SELECT
        id,
        rcd_transaction_id,
        total_collections,
        total_amount
      FROM public.rcd_remittance_transactions
      WHERE id = $1
      FOR UPDATE
      `,
      [id]
    );

    if (existing.rows.length === 0) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        { success: false, error: "Remittance not found." },
        { status: 404 }
      );
    }

    const remittance = existing.rows[0];

    // Prevent reversal if already included in a consolidated RCD.
    const consolidated = await client.query(
      `
      SELECT 1
      FROM public.rcd_consolidated_transaction_items
      WHERE remittance_id = $1
      LIMIT 1
      `,
      [id]
    );

    if (consolidated.rows.length > 0) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,
          error:
            "This remittance is already included in a consolidated RCD and cannot be deleted.",
        },
        { status: 409 }
      );
    }

    if (!remittance.rcd_transaction_id) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,
          error:
            "The original RCD reference is missing. Nothing was deleted.",
        },
        { status: 409 }
      );
    }

    // Lock the original RCD before modifying accounting fields.
    const rcdResult = await client.query(
      `
      SELECT
        id,
        report_no,
        total_collections,
        total_remittances,
        total_deposits,
        balance,
        status
      FROM public.rcd_transaction
      WHERE id = $1
      FOR UPDATE
      `,
      [remittance.rcd_transaction_id]
    );

    if (rcdResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,
          error:
            "The original RCD was not found. Nothing was deleted.",
        },
        { status: 409 }
      );
    }

    const rcd = rcdResult.rows[0];

    // Only reverse an RCD that is still in the expected state.
    if (
      String(rcd.status ?? "").trim().toUpperCase() !== "REMITTED"
    ) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,
          error:
            `Cannot reverse this remittance because the original RCD status is "${rcd.status}". Expected "REMITTED". No changes were made.`,
        },
        { status: 409 }
      );
    }

    // Use the posted collection amount, falling back to total_amount.
    const rawAmount =
      remittance.total_collections ?? remittance.total_amount;

    const reversalAmount = Number(rawAmount);
    const totalRemittances = Number(rcd.total_remittances ?? 0);

    if (
      rawAmount === null ||
      rawAmount === undefined ||
      !Number.isFinite(reversalAmount) ||
      reversalAmount < 0 ||
      !Number.isFinite(totalRemittances) ||
      totalRemittances < reversalAmount
    ) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,
          error:
            "The remittance amount or RCD totals are invalid for reversal. No changes were made.",
        },
        { status: 409 }
      );
    }

    // Restore the original RCD:
    // - Keep total_collections unchanged.
    // - Reverse total_remittances.
    // - Restore balance.
    // - Return status to FOR REMITTANCE.
    const restored = await client.query(
      `
      UPDATE public.rcd_transaction
      SET
        total_remittances =
          COALESCE(total_remittances, 0) - $1::numeric,
        balance =
          COALESCE(balance, 0) + $1::numeric,
        status = 'FOR REMITTANCE',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING
        id,
        report_no,
        total_collections,
        total_remittances,
        total_deposits,
        balance,
        status
      `,
      [reversalAmount, remittance.rcd_transaction_id]
    );

    if (restored.rows.length === 0) {
      throw new Error("Failed to restore the original RCD.");
    }

    // Delete the remittance only after the reversal succeeds.
    await client.query(
      `
      DELETE FROM public.rcd_remittance_transactions
      WHERE id = $1
      `,
      [id]
    );

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      message:
        "Remittance deleted successfully. The original RCD has been restored to FOR REMITTANCE.",
      restoredRCD: restored.rows[0],
    });
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {}

    console.error("DELETE remittance error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete remittance.",
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
