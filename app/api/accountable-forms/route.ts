import {
  NextRequest,
  NextResponse,
} from "next/server";
import { pool } from "@/lib/db";
import { randomUUID } from "crypto";
import jwt from "jsonwebtoken";

export async function GET() {
  try {
    const result =
      await pool.query(`
        SELECT
          afi.*,
          af.af_code,
          af.form_name,
          ao.first_name,
          ao.last_name
        FROM accountable_form_inventory afi
        LEFT JOIN accountable_forms af
          ON af.id = afi.accountable_form_id
        LEFT JOIN accountable_officers ao
          ON ao.id = afi.officer_id
        WHERE afi.is_active = TRUE
        ORDER BY afi.reference_no DESC
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

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET!
      ) as any;

    const body =
      await req.json();

    const countResult =
      await pool.query(`
        SELECT COUNT(*)::int as total
        FROM accountable_form_inventory
      `);

    const refNo = String(
      countResult.rows[0].total + 1
    ).padStart(5, "0");

    const beginning =
      Number(body.beginning_or);

    const ending =
      Number(body.ending_or);

    if (ending < beginning) {
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
      INSERT INTO accountable_form_inventory (
        id,
        reference_no,
        fiscal_year,
        accountable_form_id,
        series,
        no_of_receipts,
        beginning_or,
        ending_or,
        status,
        issued_date,
        officer_id,
        created_by,
        updated_by,
        is_active
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,TRUE
      )
      `,
      [
        randomUUID(),
        refNo,
        body.fiscal_year,
        body.accountable_form_id,
        body.series,
        noOfReceipts,
        beginning,
        ending,
        body.status || "AVAILABLE",
        body.issued_date || null,
        body.officer_id || null,
        decoded.id,
        decoded.id,
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