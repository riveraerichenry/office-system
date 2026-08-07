import {
  NextRequest,
  NextResponse,
} from "next/server";

import jwt from "jsonwebtoken";
import { pool } from "@/lib/db";

function getUserId(
  req: NextRequest
) {
  const token =
    req.cookies.get("token")
      ?.value;

  if (!token) return null;

  try {
    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET!
      ) as any;

    return decoded.id;
  } catch {
    return null;
  }
}

/* =========================
   GET INVENTORY
========================= */
export async function GET(
  req: NextRequest
) {
  try {
    const year =
      req.nextUrl.searchParams.get(
        "year"
      );

    const formId =
      req.nextUrl.searchParams.get(
        "form_id"
      );

    let query = `
      SELECT
        afi.*,
        af.af_code,
        af.form_name,

        creator.username AS created_by_name,
        updater.username AS updated_by_name,
        issuer.username AS issued_by_name,

        CONCAT(
          officer.first_name,
          ' ',
          officer.last_name
        ) AS officer_name

      FROM accountable_form_inventory afi

      LEFT JOIN accountable_forms af
        ON af.id = afi.accountable_form_id

      LEFT JOIN users creator
        ON creator.id = afi.created_by

      LEFT JOIN users updater
        ON updater.id = afi.updated_by

      LEFT JOIN users issuer
        ON issuer.id = afi.issued_by

      LEFT JOIN accountable_officers officer
        ON officer.id = afi.issued_to

      WHERE 1=1
    `;

    const params: any[] =
      [];
    let idx = 1;

    if (year) {
      query += ` AND afi.fiscal_year = $${idx}`;
      params.push(
        Number(year)
      );
      idx++;
    }

    if (formId) {
      query += ` AND afi.accountable_form_id = $${idx}`;
      params.push(formId);
      idx++;
    }

    query += `
      ORDER BY afi.reference_no DESC
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
        error:
          error.message,
      },
      { status: 500 }
    );
  }
}

/* =========================
   POST INVENTORY
========================= */
export async function POST(
  req: NextRequest
) {
  try {
    const userId =
      getUserId(req);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Unauthorized",
        },
        { status: 401 }
      );
    }

    const body =
      await req.json();

    if (
      !body.accountable_form_id
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Accountable form required",
        },
        { status: 400 }
      );
    }

    if (!body.series) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Series required",
        },
        { status: 400 }
      );
    }

    if (
      !body.beginning_or ||
      !body.ending_or
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Beginning and Ending OR required",
        },
        { status: 400 }
      );
    }

    const beginningOR =
      Number(
        body.beginning_or
      );

    const endingOR =
      Number(
        body.ending_or
      );

    const noOfReceipts =
      endingOR -
      beginningOR +
      1;

    if (
      noOfReceipts <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid OR range",
        },
        { status: 400 }
      );
    }

    const duplicate =
      await pool.query(
        `
        SELECT id
        FROM accountable_form_inventory
        WHERE accountable_form_id = $1
        AND beginning_or = $2
      `,
        [
          body.accountable_form_id,
          beginningOR,
        ]
      );

    if (
      duplicate.rows.length >
      0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Beginning OR already exists",
        },
        { status: 400 }
      );
    }

    const refResult =
      await pool.query(`
        SELECT LPAD(
          (
            COALESCE(
              MAX(reference_no::int),
              0
            ) + 1
          )::text,
          5,
          '0'
        ) AS reference_no
        FROM accountable_form_inventory
      `);

    const referenceNo =
      refResult.rows[0]
        .reference_no;

    const result =
      await pool.query(
        `
        INSERT INTO accountable_form_inventory (
          id,
          reference_no,
          fiscal_year,
          accountable_form_id,
          series,
          beginning_or,
          ending_or,
          current_or,
          no_of_receipts,
          status,
          remarks,
          created_at,
          updated_at,
          created_by,
          updated_by
        )
        VALUES (
          gen_random_uuid(),
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
          NOW(),
          NOW(),
          $11,
          $12
        )
        RETURNING *
      `,
        [
          referenceNo,
          body.fiscal_year,
          body.accountable_form_id,
          body.series,
          beginningOR,
          endingOR,
          beginningOR, // current_or starts here
          noOfReceipts, // AUTO COMPUTED
          body.status ||
            "ACT",
          body.remarks ||
            null,
          userId,
          userId,
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
        error:
          error.message,
      },
      { status: 500 }
    );
  }
}