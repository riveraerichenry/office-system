import {
  NextRequest,
  NextResponse,
} from "next/server";
import { pool } from "@/lib/db";

export async function PUT(
  req: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const { id } =
      await context.params;

    const body =
      await req.json();

    const beginning =
      Number(body.beginning_or);

    const ending =
      Number(body.ending_or);

    const qty =
      ending -
      beginning +
      1;

    await pool.query(
      `
      UPDATE accountable_form_inventory
      SET
        fiscal_year=$1,
        accountable_form_id=$2,
        series=$3,
        no_of_receipts=$4,
        beginning_or=$5,
        ending_or=$6,
        status=$7,
        issued_date=$8,
        officer_id=$9,
        updated_at=NOW()
      WHERE id=$10
      `,
      [
        body.fiscal_year,
        body.accountable_form_id,
        body.series,
        qty,
        beginning,
        ending,
        body.status,
        body.issued_date,
        body.officer_id,
        id,
      ]
    );

    return NextResponse.json({
      success: true,
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

export async function DELETE(
  req: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const { id } =
      await context.params;

    await pool.query(
      `
      UPDATE accountable_form_inventory
      SET is_active = FALSE
      WHERE id=$1
      `,
      [id]
    );

    return NextResponse.json({
      success: true,
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