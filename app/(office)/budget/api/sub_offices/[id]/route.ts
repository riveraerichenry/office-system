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

// PATCH: Update sub-office
export async function PATCH(
  request: NextRequest,
  { params }: Context
) {
  try {
    const { id } = await params;

    if (!isValidUUID(id)) {
      return errorResponse("Invalid sub-office ID.");
    }

    const body = await request.json();

    const office_id = String(body.office_id ?? "").trim();
    const sub_office_code = String(body.sub_office_code ?? "").trim();
    const sub_office_name = String(body.sub_office_name ?? "").trim();
    const description =
      body.description == null
        ? null
        : String(body.description).trim();

    if (!office_id || !sub_office_code || !sub_office_name) {
      return errorResponse(
        "Office, sub-office code, and sub-office name are required."
      );
    }

    if (!isValidUUID(office_id)) {
      return errorResponse("Invalid office ID.");
    }

    if (typeof body.is_active !== "boolean") {
      return errorResponse("A valid sub-office status is required.");
    }

    // Verify selected parent office.
    const officeResult = await pool.query(
      `
      SELECT id
      FROM offices
      WHERE id = $1
        AND is_active = TRUE
      `,
      [office_id]
    );

    if (officeResult.rowCount === 0) {
      return errorResponse(
        "The selected office does not exist or is inactive.",
        404
      );
    }

    const result = await pool.query(
      `
      UPDATE sub_offices
      SET
        office_id = $1,
        sub_office_code = $2,
        sub_office_name = $3,
        description = $4,
        is_active = $5,
        updated_at = NOW()
      WHERE id = $6
      RETURNING *
      `,
      [
        office_id,
        sub_office_code,
        sub_office_name,
        description || null,
        body.is_active,
        id,
      ]
    );

    if (result.rowCount === 0) {
      return errorResponse("Sub-office not found.", 404);
    }

    return NextResponse.json({
      success: true,
      message: "Sub-office updated successfully.",
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error("PATCH Sub-office Error:", error);

    if (error.code === "23505") {
      return errorResponse(
        "A sub-office with this code already exists.",
        409
      );
    }

    return errorResponse("Failed to update sub-office.", 500);
  }
}