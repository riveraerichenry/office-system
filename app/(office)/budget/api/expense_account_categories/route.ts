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

// GET: Retrieve all expense account categories
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        c.id,
        c.office_id,
        c.sub_office_id,
        c.category_code,
        c.category_name,
        c.description,
        c.is_active,
        c.created_at,
        c.updated_at,

        o.office_code,
        o.office_name,

        so.sub_office_code,
        so.sub_office_name

      FROM public.expense_account_category c

      LEFT JOIN public.offices o
        ON o.id = c.office_id

      LEFT JOIN public.sub_offices so
        ON so.id = c.sub_office_id

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
    console.error("GET Expense Account Categories Error:", error);

    return errorResponse(
      "Failed to retrieve expense account categories.",
      500
    );
  }
}

// POST: Create expense account category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const ownerType = String(body.owner_type ?? "").trim();

    const officeId = String(body.office_id ?? "").trim();
    const subOfficeId = String(body.sub_office_id ?? "").trim();

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

    let office_id: string | null = null;
    let sub_office_id: string | null = null;

    // CATEGORY ASSIGNED TO OFFICE
    if (ownerType === "office") {
      if (!isValidUUID(officeId)) {
        return errorResponse("Please select a valid office.");
      }

      const officeResult = await pool.query(
        `
        SELECT id
        FROM public.offices
        WHERE id = $1
          AND is_active = TRUE
        `,
        [officeId]
      );

      if (!officeResult.rowCount) {
        return errorResponse(
          "Selected office does not exist or is inactive.",
          404
        );
      }

      office_id = officeId;
    }

    // CATEGORY ASSIGNED TO SUB-OFFICE
    else if (ownerType === "sub_office") {
      if (!isValidUUID(subOfficeId)) {
        return errorResponse("Please select a valid sub-office.");
      }

      const subOfficeResult = await pool.query(
        `
        SELECT so.id
        FROM public.sub_offices so
        INNER JOIN public.offices o
          ON o.id = so.office_id
        WHERE so.id = $1
          AND so.is_active = TRUE
          AND o.is_active = TRUE
        `,
        [subOfficeId]
      );

      if (!subOfficeResult.rowCount) {
        return errorResponse(
          "Selected sub-office does not exist or is inactive.",
          404
        );
      }

      sub_office_id = subOfficeId;
    } else {
      return errorResponse(
        "Please select either an office or sub-office."
      );
    }

    const result = await pool.query(
      `
      INSERT INTO public.expense_account_category (
        office_id,
        sub_office_id,
        category_code,
        category_name,
        description,
        is_active,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING *
      `,
      [
        office_id,
        sub_office_id,
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
    console.error("POST Expense Account Categories Error:", error);

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