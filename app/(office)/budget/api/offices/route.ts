import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

function errorResponse(message: string, status = 400) {
  return NextResponse.json(
    { success: false, message },
    { status }
  );
}

// GET: List offices
export async function GET() {
  try {
    const result = await pool.query(
      `
      SELECT
        o.id,
        o.office_code,
        o.office_name,
        o.office_description,
        o.is_active,
        o.created_at,
        o.updated_at,
        COUNT(s.id)::int AS sub_office_count
      FROM offices o
      LEFT JOIN sub_offices s
        ON s.office_id = o.id
      GROUP BY o.id
      ORDER BY o.office_name ASC
      `
    );

    return NextResponse.json({
      success: true,
      count: result.rowCount ?? 0,
      data: result.rows,
    });
  } catch (error) {
    console.error("GET Offices Error:", error);
    return errorResponse("Failed to retrieve offices.", 500);
  }
}

// POST: Create office
export async function POST(request: NextRequest) {
  try {
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

    const result = await pool.query(
      `
      INSERT INTO offices (
        id,
        office_code,
        office_name,
        office_description,
        is_active,
        created_at,
        updated_at
      )
      VALUES (
        gen_random_uuid(),
        $1,
        $2,
        $3,
        TRUE,
        NOW(),
        NOW()
      )
      RETURNING *
      `,
      [office_code, office_name, office_description || null]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Office created successfully.",
        data: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST Offices Error:", error);

    if (error.code === "23505") {
      return errorResponse("An office with this code already exists.", 409);
    }

    return errorResponse("Failed to create office.", 500);
  }
}