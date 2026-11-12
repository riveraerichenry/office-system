
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

type Context = {
  params: Promise<{ id: string }>;
};

function errorResponse(message: string, status = 400) {
  return NextResponse.json(
    { success: false, message },
    { status }
  );
}

function isValidUUID(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value
  );
}

// =====================================================
// PATCH: Update expense account
// =====================================================

export async function PATCH(
  request: NextRequest,
  context: Context
) {
  try {
    const { id } = await context.params;

    if (!isValidUUID(id)) {
      return errorResponse("Invalid account ID.");
    }

    const body = await request.json();

    const categoryId = String(
      body.category_id ?? ""
    ).trim();

    const accountCode = String(
      body.account_code ?? ""
    ).trim();

    const accountName = String(
      body.account_name ?? ""
    ).trim();

    const description =
      String(body.description ?? "").trim() || null;

    const isActive = body.is_active !== false;

    if (!isValidUUID(categoryId)) {
      return errorResponse(
        "Please select a valid category."
      );
    }

    if (!accountCode || !accountName) {
      return errorResponse(
        "Account code and account name are required."
      );
    }

    // Verify category exists and is active
    const categoryResult = await pool.query(
      `
      SELECT id
      FROM public.expense_account_category
      WHERE id = $1
        AND is_active = TRUE
      `,
      [categoryId]
    );

    if (!categoryResult.rowCount) {
      return errorResponse(
        "Selected category does not exist or is inactive.",
        404
      );
    }

    const result = await pool.query(
      `
      UPDATE public.expense_accounts
      SET
        category_id = $1,
        account_code = $2,
        account_name = $3,
        description = $4,
        is_active = $5,
        updated_at = NOW()
      WHERE id = $6
      RETURNING *
      `,
      [
        categoryId,
        accountCode,
        accountName,
        description,
        isActive,
        id,
      ]
    );

    if (!result.rowCount) {
      return errorResponse(
        "Expense account not found.",
        404
      );
    }

    return NextResponse.json({
      success: true,
      message: "Expense account updated successfully.",
      data: result.rows[0],
    });

  } catch (error: any) {
    console.error("PATCH Expense Account Error:", error);

    if (error.code === "23505") {
      return errorResponse(
        "An account with this code already exists.",
        409
      );
    }

    if (error.code === "23503") {
      return errorResponse(
        "Invalid account category."
      );
    }

    return errorResponse(
      "Failed to update expense account.",
      500
    );
  }
}
