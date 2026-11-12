
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
// PATCH: Update expense account category
// =====================================================

export async function PATCH(
  request: NextRequest,
  context: Context
) {
  try {
    const { id } = await context.params;

    if (!isValidUUID(id)) {
      return errorResponse("Invalid category ID.");
    }

    const body = await request.json();

    const categoryCode = String(
      body.category_code ?? ""
    ).trim();

    const categoryName = String(
      body.category_name ?? ""
    ).trim();

    const description =
      String(body.description ?? "").trim() || null;

    const isActive = body.is_active !== false;

    // Validate required fields
    if (!categoryCode || !categoryName) {
      return errorResponse(
        "Category code and category name are required."
      );
    }

    // Check if category exists
    const existingCategory = await pool.query(
      `
      SELECT id
      FROM public.expense_account_category
      WHERE id = $1
      `,
      [id]
    );

    if (!existingCategory.rowCount) {
      return errorResponse("Category not found.", 404);
    }

    // Update category without office assignments
    const result = await pool.query(
      `
      UPDATE public.expense_account_category
      SET
        category_code = $1,
        category_name = $2,
        description = $3,
        is_active = $4,
        updated_at = NOW()
      WHERE id = $5
      RETURNING *
      `,
      [
        categoryCode,
        categoryName,
        description,
        isActive,
        id,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Expense account category updated successfully.",
      data: result.rows[0],
    });

  } catch (error: any) {
    console.error(
      "PATCH Expense Account Category Error:",
      error
    );

    if (error.code === "23505") {
      return errorResponse(
        "A category with this code already exists.",
        409
      );
    }

    return errorResponse(
      "Failed to update expense account category.",
      500
    );
  }
}
