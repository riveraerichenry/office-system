import {
  NextRequest,
  NextResponse,
} from "next/server";
import { pool } from "@/lib/db";
import { randomUUID } from "crypto";

export async function GET() {
  try {
    const result =
      await pool.query(`
        SELECT *
        FROM banks
        ORDER BY seq_no, bank_name
      `);

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest
) {
  try {
    const body =
      await req.json();

    const result =
      await pool.query(
        `
        INSERT INTO banks (
          id,
          bank_code,
          bank_name,
          seq_no,
          remarks,
          is_active
        )
        VALUES ($1,$2,$3,$4,$5,TRUE)
        RETURNING *
      `,
        [
          randomUUID(),
          body.bank_code,
          body.bank_name,
          body.seq_no,
          body.remarks,
        ]
      );

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}