import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { randomUUID } from "crypto";

export async function POST(
  req: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const existing = await pool.query(
      `
      SELECT id
      FROM user_modules
      WHERE user_id=$1
      AND module_id=$2
      `,
      [id, body.module_id]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json({
        success: true,
      });
    }

    await pool.query(
      `
      INSERT INTO user_modules (
        id,
        user_id,
        module_id,
        is_visible,
        sort_order
      )
      VALUES ($1,$2,$3,TRUE,1)
      `,
      [
        randomUUID(),
        id,
        body.module_id,
      ]
    );

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    await pool.query(
      `
      DELETE FROM user_modules
      WHERE user_id=$1
      AND module_id=$2
      `,
      [id, body.module_id]
    );

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}