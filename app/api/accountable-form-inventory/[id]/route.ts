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
      Number(
        body.beginning_or
      );

    const ending =
      Number(
        body.ending_or
      );

    if (
      ending < beginning
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Ending OR cannot be lower than Beginning OR",
        },
        { status: 400 }
      );
    }

    const noOfReceipts =
      ending -
      beginning +
      1;

    await pool.query(
      `
      UPDATE accountable_form_inventory
      SET
        fiscal_year = $1,
        series = $2,
        beginning_or = $3,
        ending_or = $4,
        no_of_receipts = $5,
        status = $6,
        issued_to = $7,
        remarks = $8,
        updated_at = NOW()
      WHERE id = $9
      `,
      [
        body.fiscal_year,
        body.series,
        beginning,
        ending,
        noOfReceipts,
        body.status,
        body.issued_to || null,
        body.remarks,
        id,
      ]
    );

    if (
      body.status ===
        "ISSUED" &&
      body.issued_to
    ) {
      await pool.query(
        `
        UPDATE accountable_form_inventory
        SET issued_date = NOW()
        WHERE id = $1
        `,
        [id]
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        error:
          error.message,
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
      DELETE FROM accountable_form_inventory
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
        error:
          error.message,
      },
      { status: 500 }
    );
  }
}