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

// PATCH: Update office
export async function PATCH(
  request: NextRequest,
  { params }: Context
) {
  try {
    const { id } = await params;

    if (!isValidUUID(id)) {
      return errorResponse("Invalid office ID.");
    }

    const body = await request.json();

    const office_code = String(body.office_code ?? "").trim();
    const office_name = String(body.office_name ?? "").trim();
    const office_description =
      body.office_description == null
        ? null
        : String(body.office_description).trim();

    if (!office_code || !office_name) {
      return errorResponse("Office code and office name are required.");
    }

    if (typeof body.is_active !== "boolean") {
      return errorResponse("A valid office status is required.");
    }

    const result = await pool.query(
      `
      UPDATE offices
      SET
        office_code = $1,
        office_name = $2,
        office_description = $3,
        is_active = $4,
        updated_at = NOW()
      WHERE id = $5
      RETURNING *
      `,
      [
        office_code,
        office_name,
        office_description || null,
        body.is_active,
        id,
      ]
    );

    if (result.rowCount === 0) {
      return errorResponse("Office not found.", 404);
    }

    return NextResponse.json({
      success: true,
      message: "Office updated successfully.",
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error("PATCH Office Error:", error);

    if (error.code === "23505") {
      return errorResponse("An office with this code already exists.", 409);
    }

    return errorResponse("Failed to update office.", 500);
  }
}