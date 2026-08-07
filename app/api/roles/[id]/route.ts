import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  req: NextRequest,
  { params }: Params
) {
  try {
    const { id } = await params;

    const result = await pool.query(
      `
      SELECT *
      FROM roles
      WHERE id=$1
      `,
      [id]
    );

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: Params
) {
  try {
    const { id } = await params;

    const {
      role_name,
      description,
      is_active,
    } = await req.json();

    const result = await pool.query(
      `
      UPDATE roles
      SET
        role_name=$1,
        description=$2,
        is_active=$3,
        updated_at=NOW()
      WHERE id=$4
      RETURNING *
      `,
      [
        role_name,
        description,
        is_active,
        id,
      ]
    );

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: Params
) {
  try {
    const { id } = await params;

    await pool.query(
      `
      DELETE FROM roles
      WHERE id=$1
      `,
      [id]
    );

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}