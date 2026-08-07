import {
  NextRequest,
  NextResponse,
} from "next/server";
import { pool } from "@/lib/db";

export async function PUT(
  req: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const body = await req.json();
    const { id } =
      await context.params;

    const result =
      await pool.query(
        `
        UPDATE fund_sources
        SET
          fund_code = $1,
          acronym = $2,
          seq_no = $3,
          fund_name = $4,
          remarks = $5,
          updated_at = NOW()
        WHERE id = $6
        RETURNING *
      `,
        [
          body.fund_code,
          body.acronym,
          body.seq_no,
          body.fund_name,
          body.remarks,
          id,
        ]
      );

    return NextResponse.json({
      success: true,
      data: result.rows[0],
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
    const { id } =
      await context.params;

    await pool.query(
      `
      UPDATE fund_sources
      SET
        is_active = FALSE,
        updated_at = NOW()
      WHERE id = $1
    `,
      [id]
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