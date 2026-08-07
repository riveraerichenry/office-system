import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

// =========================
// UPDATE MODULE
// =========================
export async function PUT(
  req: NextRequest,
  { params }: Params
) {
  try {
    const { id } = await params;

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
      UPDATE modules
      SET
        module_name = $1,
        icon = $2,
        path = $3,
        description = $4,
        sort_order = $5,
        background_color = $6
      WHERE id = $7
      RETURNING *
      `,
      [
        module_name,
        icon,
        path,
        description,
        sort_order,
        background_color,
        id,
      ]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Module not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update module.",
      },
      {
        status: 500,
      }
    );
  }
}

// =========================
// SOFT DELETE MODULE
// =========================
export async function DELETE(
  req: NextRequest,
  { params }: Params
) {
  try {
    const { id } = await params;

    const result = await pool.query(
      `
      UPDATE modules
      SET
        is_active = false
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Module not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Module deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete module.",
      },
      {
        status: 500,
      }
    );
  }
}