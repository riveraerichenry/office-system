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

// GET: List sub-offices
// Optional: /budget/api/sub_offices?office_id=UUID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const officeId = searchParams.get("office_id");

    const values: string[] = [];
    let whereClause = "";

    if (officeId) {
      if (!isValidUUID(officeId)) {
        return errorResponse("Invalid office ID.");
      }

      values.push(officeId);
      whereClause = "WHERE s.office_id = $1";
    }

    const result = await pool.query(
      `
      SELECT
        s.id,
        s.office_id,
        s.sub_office_code,
        s.sub_office_name,
        s.description,
        s.is_active,
        s.created_at,
        s.updated_at,
        o.office_code,
        o.office_name
      FROM sub_offices s
      INNER JOIN offices o
        ON o.id = s.office_id
      ${whereClause}
      ORDER BY o.office_name ASC, s.sub_office_name ASC
      `,
      values
    );

    return NextResponse.json({
      success: true,
      count: result.rowCount ?? 0,
      data: result.rows,
    });
  } catch (error) {
    console.error("GET Sub-offices Error:", error);
    return errorResponse("Failed to retrieve sub-offices.", 500);
  }
}

// POST: Create sub-office
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const office_id = String(body.office_id ?? "").trim();

    // Sub-office code is optional
    const sub_office_code =
      String(body.sub_office_code ?? "").trim() || null;

    const sub_office_name = String(
      body.sub_office_name ?? ""
    ).trim();

    const description =
      body.description == null
        ? null
        : String(body.description).trim() || null;

    // Only office and sub-office name are required
    if (!office_id || !sub_office_name) {
      return errorResponse(
        "Office and sub-office name are required."
      );
    }

    if (!isValidUUID(office_id)) {
      return errorResponse("Invalid office ID.");
    }

    // Verify that the selected parent office exists and is active
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
      INSERT INTO sub_offices (
        id,
        office_id,
        sub_office_code,
        sub_office_name,
        description,
        is_active,
        created_at,
        updated_at
      )
      VALUES (
        gen_random_uuid(),
        $1,
        $2,
        $3,
        $4,
        TRUE,
        NOW(),
        NOW()
      )
      RETURNING *
      `,
      [
        office_id,
        sub_office_code,
        sub_office_name,
        description,
      ]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Sub-office created successfully.",
        data: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST Sub-offices Error:", error);

    if (error.code === "23505") {
      return errorResponse(
        "A sub-office with this code already exists.",
        409
      );
    }

    return errorResponse("Failed to create sub-office.", 500);
  }
}