import {
  NextRequest,
  NextResponse,
} from "next/server";
import { pool } from "@/lib/db";
import { randomUUID } from "crypto";

export async function GET(
  req: NextRequest
) {
  try {
    const bankId =
      req.nextUrl.searchParams.get(
        "bank_id"
      );

    let query = `
      SELECT
        ba.*,
        b.bank_name,
        b.bank_code
      FROM bank_accounts ba
      JOIN banks b
        ON b.id = ba.bank_id
    `;

    const params = [];

    if (bankId) {
      query += `
        WHERE ba.bank_id = $1
      `;
      params.push(bankId);
    }

    query += `
      ORDER BY ba.sequence_code
    `;

    const result =
      await pool.query(
        query,
        params
      );

    return NextResponse.json({
      success: true,
      data: result.rows,
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

export async function POST(
  req: NextRequest
) {
  try {
    const body =
      await req.json();

    await pool.query(
      `
      INSERT INTO bank_accounts (
        id,
        sequence_code,
        bank_id,
        account_number,
        account_name,
        remarks,
        account_status,
        deposit_label
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      `,
      [
        randomUUID(),
        body.sequence_code,
        body.bank_id,
        body.account_number,
        body.account_name,
        body.remarks,
        body.account_status,
        body.deposit_label,
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