import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        id,
        role_name,
        description,
        is_active,
        created_at,
        updated_at
      FROM roles
      ORDER BY role_name;
    `);

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch roles.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      role_name,
      description,
      is_active,
    } = await req.json();

    const result = await pool.query(
      `
      INSERT INTO roles
      (
        role_name,
        description,
        is_active
      )
      VALUES
      ($1,$2,$3)
      RETURNING *
      `,
      [
        role_name,
        description,
        is_active,
      ]
    );

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create role.",
      },
      {
        status: 500,
      }
    );
  }
}