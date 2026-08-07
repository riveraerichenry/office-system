import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT *
      FROM modules
      WHERE is_active = true
      ORDER BY sort_order,module_name
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
        message: "Failed to load modules.",
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
      module_name,
      icon,
      path,
      description,
      sort_order,
      background_color,
    } = await req.json();

    const result = await pool.query(
      `
      INSERT INTO modules
      (
        module_name,
        icon,
        path,
        description,
        sort_order,
        background_color,
        is_active
      )
      VALUES
      ($1,$2,$3,$4,$5,$6,true)
      RETURNING *
      `,
      [
        module_name,
        icon,
        path,
        description,
        sort_order,
        background_color,
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
        message: "Failed to save module.",
      },
      {
        status: 500,
      }
    );
  }
}