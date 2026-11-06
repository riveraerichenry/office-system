
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET - FETCH OFFICES
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        id,
        office_code,
        office_name,
        office_description,
        is_active,
        created_at,
        updated_at
      FROM offices
      ORDER BY office_code ASC
    `);

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("GET Offices Error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch offices." },
      { status: 500 }
    );
  }
}

// POST - CREATE OFFICE
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      office_code,
      office_name,
      office_description,
    } = body;

    if (!office_code?.trim() || !office_name?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Office code and office name are required.",
        },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `
        INSERT INTO offices (
          office_code,
          office_name,
          office_description
        )
        VALUES ($1, $2, $3)
        RETURNING *
      `,
      [
        office_code.trim(),
        office_name.trim(),
        office_description?.trim() || null,
      ]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Office successfully created.",
        data: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST Offices Error:", error);

    if (error.code === "23505") {
      return NextResponse.json(
        { success: false, message: "Office code already exists." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to create office." },
      { status: 500 }
    );
  }
}

// PATCH - UPDATE OFFICE
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      id,
      office_code,
      office_name,
      office_description,
      is_active,
    } = body;

    if (!id || !office_code?.trim() || !office_name?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Office ID, code, and name are required.",
        },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `
        UPDATE offices
        SET
          office_code = $1,
          office_name = $2,
          office_description = $3,
          is_active = $4,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
        RETURNING *
      `,
      [
        office_code.trim(),
        office_name.trim(),
        office_description?.trim() || null,
        Boolean(is_active),
        id,
      ]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: "Office not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Office successfully updated.",
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error("PATCH Offices Error:", error);

    if (error.code === "23505") {
      return NextResponse.json(
        { success: false, message: "Office code already exists." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to update office." },
      { status: 500 }
    );
  }
}

// DELETE - DELETE OFFICE
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Office ID is required." },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `DELETE FROM offices WHERE id = $1 RETURNING id`,
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: "Office not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Office successfully deleted.",
    });
  } catch (error: any) {
    console.error("DELETE Offices Error:", error);

    if (error.code === "23503") {
      return NextResponse.json(
        {
          success: false,
          message: "This office is being used in other records and cannot be deleted.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to delete office." },
      { status: 500 }
    );
  }
}
