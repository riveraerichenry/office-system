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

    if (!body.reg_date) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Registration date is required",
        },
        { status: 400 }
      );
    }

    if (!body.fund_source_id) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Fund source required",
        },
        { status: 400 }
      );
    }

    if (!body.bank_id) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Bank required",
        },
        { status: 400 }
      );
    }

    if (!body.bank_account_id) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Bank account required",
        },
        { status: 400 }
      );
    }

    const beginning =
      Number(
        body.beginning_check
      );

    const ending =
      Number(
        body.ending_check
      );

    if (
      Number.isNaN(
        beginning
      ) ||
      Number.isNaN(
        ending
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid check numbers",
        },
        { status: 400 }
      );
    }

    if (ending < beginning) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Ending check cannot be lower than beginning check",
        },
        { status: 400 }
      );
    }

    const noOfChecks =
      ending -
      beginning +
      1;

    await pool.query(
      `
      UPDATE check_registrations
      SET
        fiscal_year = $1,
        reg_date = $2,
        fund_source_id = $3,
        bank_id = $4,
        bank_account_id = $5,
        beginning_check = $6,
        ending_check = $7,
        no_of_checks = $8,
        remarks = $9,
        status = $10,
        last_ref_no = $11
      WHERE id = $12
      `,
      [
        body.fiscal_year,
        body.reg_date,
        body.fund_source_id,
        body.bank_id,
        body.bank_account_id,
        beginning,
        ending,
        noOfChecks,
        body.remarks || null,
        body.status ||
          "ACTIVE",
        body.last_ref_no ||
          null,
        id,
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
      DELETE FROM check_registrations
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