import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const search = request.nextUrl.searchParams.get("search")?.trim() ?? "";

    const result = await pool.query(
      `
        SELECT
          b.id,
          b.bank_code,
          b.bank_name,
          b.seq_no,
          b.remarks,
          b.is_active,
          b.created_at,
          COUNT(ba.id)::int AS account_count
        FROM banks b
        LEFT JOIN bank_accounts ba
          ON ba.bank_id = b.id
        WHERE
          $1 = ''
          OR b.bank_code ILIKE '%' || $1 || '%'
          OR b.bank_name ILIKE '%' || $1 || '%'
        GROUP BY b.id
        ORDER BY b.seq_no NULLS LAST, b.bank_name ASC
      `,
      [search]
    );

    return NextResponse.json({
      success: true,
      banks: result.rows,
    });
  } catch (error) {
    console.error("GET /api/banks:", error);

    return NextResponse.json(
      { success: false, message: "Failed to retrieve banks." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const bank_code =
      typeof body.bank_code === "string" ? body.bank_code.trim() : "";
    const bank_name =
      typeof body.bank_name === "string" ? body.bank_name.trim() : "";
    const seq_no =
      body.seq_no === null || body.seq_no === undefined
        ? 0
        : Number(body.seq_no);
    const remarks =
      typeof body.remarks === "string" && body.remarks.trim()
        ? body.remarks.trim()
        : null;

    if (!bank_code || !bank_name) {
      return NextResponse.json(
        {
          success: false,
          message: "Bank code and bank name are required.",
        },
        { status: 400 }
      );
    }

    if (!Number.isInteger(seq_no)) {
      return NextResponse.json(
        {
          success: false,
          message: "Sequence number must be an integer.",
        },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `
        INSERT INTO banks (
          id,
          bank_code,
          bank_name,
          seq_no,
          remarks,
          is_active
        )
        VALUES (
          gen_random_uuid(),
          $1,
          $2,
          $3,
          $4,
          TRUE
        )
        RETURNING
          id,
          bank_code,
          bank_name,
          seq_no,
          remarks,
          is_active,
          created_at
      `,
      [bank_code, bank_name, seq_no, remarks]
    );

    return NextResponse.json(
      { success: true, bank: result.rows[0] },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("POST /api/banks:", error);

    const dbError = error as { code?: string };

    if (dbError.code === "23505") {
      return NextResponse.json(
        { success: false, message: "That bank code already exists." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to create bank." },
      { status: 500 }
    );
  }
}