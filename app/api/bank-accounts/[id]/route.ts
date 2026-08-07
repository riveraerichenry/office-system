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
  const { id } =
    await context.params;

  const body =
    await req.json();

  await pool.query(
    `
    UPDATE bank_accounts
    SET
      sequence_code=$1,
      bank_id=$2,
      account_number=$3,
      account_name=$4,
      remarks=$5,
      account_status=$6,
      deposit_label=$7
    WHERE id=$8
  `,
    [
      body.sequence_code,
      body.bank_id,
      body.account_number,
      body.account_name,
      body.remarks,
      body.account_status,
      body.deposit_label,
      id,
    ]
  );

  return NextResponse.json({
    success: true,
  });
}

export async function DELETE(
  req: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  const { id } =
    await context.params;

  await pool.query(
    `
    DELETE FROM bank_accounts
    WHERE id=$1
  `,
    [id]
  );

  return NextResponse.json({
    success: true,
  });
}