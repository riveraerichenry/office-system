
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

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
// GET: Retrieve all expense accounts with categories
// =====================================================

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        a.id,
        a.category_id,
        a.account_code,
        a.account_name,
        a.description,
        a.is_active,
        a.created_at,
        a.updated_at,

        c.category_code,
        c.category_name

      FROM public.expense_accounts a

      INNER JOIN public.expense_account_category c
        ON c.id = a.category_id

      ORDER BY
        c.category_code ASC,
        a.account_code ASC,
        a.account_name ASC
    `);

    return NextResponse.json({
      success: true,
      count: result.rowCount ?? 0,
      data: result.rows,
    });

  } catch (error) {
    console.error("GET Expense Accounts Error:", error);

    return errorResponse(
      "Failed to retrieve expense accounts.",
      500
    );
  }
}

// =====================================================
// POST: Create expense account
// =====================================================

export async function POST(request: NextRequest) {
  try {
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
      INSERT INTO public.expense_accounts (
        category_id,
        account_code,
        account_name,
        description,
        is_active,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
      `,
      [
        categoryId,
        accountCode,
        accountName,
        description,
        isActive,
      ]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Expense account created successfully.",
        data: result.rows[0],
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("POST Expense Accounts Error:", error);

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
      "Failed to create expense account.",
      500
    );
  }
}
