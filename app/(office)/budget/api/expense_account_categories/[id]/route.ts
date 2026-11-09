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

// PATCH: Update category
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

    const ownerType = String(
      body.owner_type ??
        (body.sub_office_id ? "sub_office" : "office")
    ).trim();

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

    let officeId: string | null = null;
    let subOfficeId: string | null = null;

    if (ownerType === "office") {
      officeId = String(body.office_id ?? "").trim();

      if (!isValidUUID(officeId)) {
        return errorResponse("Please select a valid office.");
      }

      const result = await pool.query(
        `
        SELECT id
        FROM public.offices
        WHERE id = $1
          AND is_active = TRUE
        `,
        [officeId]
      );

      if (!result.rowCount) {
        return errorResponse(
          "Selected office does not exist or is inactive.",
          404
        );
      }
    } else if (ownerType === "sub_office") {
      subOfficeId = String(
        body.sub_office_id ?? ""
      ).trim();

      if (!isValidUUID(subOfficeId)) {
        return errorResponse("Please select a valid sub-office.");
      }

      const result = await pool.query(
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

      if (!result.rowCount) {
        return errorResponse(
          "Selected sub-office does not exist or is inactive.",
          404
        );
      }
    } else {
      return errorResponse("Invalid category assignment.");
    }

    const result = await pool.query(
      `
      UPDATE public.expense_account_category
      SET
        office_id = $1,
        sub_office_id = $2,
        category_code = $3,
        category_name = $4,
        description = $5,
        is_active = $6,
        updated_at = NOW()
      WHERE id = $7
      RETURNING *
      `,
      [
        officeId,
        subOfficeId,
        categoryCode,
        categoryName,
        description,
        isActive,
        id,
      ]
    );

    if (!result.rowCount) {
      return errorResponse("Category not found.", 404);
    }

    return NextResponse.json({
      success: true,
      message: "Expense account category updated successfully.",
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error("PATCH Expense Account Category Error:", error);

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