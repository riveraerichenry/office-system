
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

function errorResponse(message: string, status = 400) {
  return NextResponse.json(
    { success: false, message },
    { status }
  );
}

// =====================================================
// GET: Retrieve all expense account categories
// =====================================================

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        c.id,
        c.category_code,
        c.category_name,
        c.description,
        c.is_active,
        c.created_at,
        c.updated_at

      FROM public.expense_account_category c

      ORDER BY
        c.category_code ASC,
        c.category_name ASC
    `);

    return NextResponse.json({
      success: true,
      count: result.rowCount ?? 0,
      data: result.rows,
    });

  } catch (error) {
    console.error(
      "GET Expense Account Categories Error:",
      error
    );

    return errorResponse(
      "Failed to retrieve expense account categories.",
      500
    );
  }
}

// =====================================================
// POST: Create expense account category
// =====================================================

export async function POST(request: NextRequest) {
  try {
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

    if (!categoryCode || !categoryName) {
      return errorResponse(
        "Category code and category name are required."
      );
    }

    const result = await pool.query(
      `
      INSERT INTO public.expense_account_category (
        category_code,
        category_name,
        description,
        is_active,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING *
      `,
      [
        categoryCode,
        categoryName,
        description,
        isActive,
      ]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Expense account category created successfully.",
        data: result.rows[0],
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error(
      "POST Expense Account Categories Error:",
      error
    );

    if (error.code === "23505") {
      return errorResponse(
        "A category with this code already exists.",
        409
      );
    }

    return errorResponse(
      "Failed to create expense account category.",
      500
    );
  }
}
