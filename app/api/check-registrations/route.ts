import {
  NextRequest,
  NextResponse,
} from "next/server";
import { pool } from "@/lib/db";
import { randomUUID } from "crypto";
import jwt from "jsonwebtoken";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        cr.*,
        u.username,
        fs.fund_name,
        b.bank_name,
        ba.account_number
      FROM check_registrations cr
      LEFT JOIN users u
        ON u.id = cr.user_id
      LEFT JOIN fund_sources fs
        ON fs.id = cr.fund_source_id
      LEFT JOIN banks b
        ON b.id = cr.bank_id
      LEFT JOIN bank_accounts ba
        ON ba.id = cr.bank_account_id
      ORDER BY cr.book_no DESC
    `);

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
    const token =
      req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as any;

    const body = await req.json();

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
          error: "Bank required",
        },
        { status: 400 }
      );
    }

    if (!body.bank_account_id) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Account required",
        },
        { status: 400 }
      );
    }

    const countResult =
      await pool.query(`
        SELECT COUNT(*)::int as total
        FROM check_registrations
      `);

    const nextBookNo = String(
      countResult.rows[0].total + 1
    ).padStart(5, "0");

    const beginning = Number(
      body.beginning_check
    );

    const ending = Number(
      body.ending_check
    );

    if (
      Number.isNaN(beginning) ||
      Number.isNaN(ending)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Check numbers required",
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
      ending - beginning + 1;

    await pool.query(
      `
      INSERT INTO check_registrations (
        id,
        book_no,
        fiscal_year,
        reg_date,
        user_id,
        fund_source_id,
        bank_id,
        bank_account_id,
        beginning_check,
        ending_check,
        no_of_checks,
        remarks,
        status,
        last_ref_no
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14
      )
      `,
      [
        randomUUID(),
        nextBookNo,
        body.fiscal_year,
        body.reg_date,
        decoded.id,
        body.fund_source_id,
        body.bank_id,
        body.bank_account_id,
        beginning,
        ending,
        noOfChecks,
        body.remarks,
        body.status || "ACTIVE",
        body.last_ref_no || null,
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