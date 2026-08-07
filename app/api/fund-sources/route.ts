import {
  NextRequest,
  NextResponse,
} from "next/server";
import { pool } from "@/lib/db";
import { randomUUID } from "crypto";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT *
      FROM fund_sources
      WHERE is_active = TRUE
      ORDER BY fund_code
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
    const body = await req.json();

    const result =
      await pool.query(
        `
        INSERT INTO fund_sources (
          id,
          fund_code,
          acronym,
          seq_no,
          fund_name,
          remarks,
          is_active
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7)
        RETURNING *
      `,
        [
          randomUUID(),
          body.fund_code,
          body.acronym,
          body.seq_no,
          body.fund_name,
          body.remarks,
          true,
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