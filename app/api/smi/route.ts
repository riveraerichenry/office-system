import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { authorize } from "@/lib/authorize";
import { MODULE_PATHS } from "@/lib/module-paths";
import { createAudit } from "@/lib/audit";
import { generateDocumentNumber } from "@/lib/document-number";

export async function GET(req: NextRequest) {
  try {
    const user = await authorize(
      req,
      MODULE_PATHS.SMI,
      "view"
    );

    const result = await pool.query(
      `
      SELECT

          b.id,
          b.control_no,
          b.fiscal_year,
          b.series,
          b.beginning_or,
          b.ending_or,
          b.receipt_count,
          b.current_or,
          b.status,
          b.received_date,
          b.issued_date,
          b.supplier,
          b.remarks,
          b.created_at,

          af.id AS accountable_form_id,
          af.form_code,
          af.form_name,

          u.full_name AS registered_by

      FROM smi_booklet_registration b

      INNER JOIN accountable_forms af
          ON af.id = b.accountable_form_id

      LEFT JOIN users u
          ON u.id = b.created_by

      WHERE
          b.is_active = TRUE

      ORDER BY
          b.created_at DESC,
          b.control_no DESC
      `
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
    });

  } catch (err: any) {

    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (err.message === "FORBIDDEN") {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    console.error(err);

    return NextResponse.json(
      {
        success: false,
        message: "Server Error",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(req: NextRequest) {
  try {

    const user = await authorize(
      req,
      MODULE_PATHS.SMI,
      "add"
    );

    const body = await req.json();

    const {
      accountable_form_id,
      fiscal_year,
      series,
      beginning_or,
      ending_or,
      received_date,
      supplier,
      remarks,
    } = body;

    if (
      Number(ending_or) <
      Number(beginning_or)
    ) {
      return NextResponse.json(
        {
          message:
            "Ending OR cannot be less than Beginning OR.",
        },
        {
          status: 400,
        }
      );
    }

    const duplicate =
      await pool.query(
        `
        SELECT id

        FROM smi_booklet_registration

        WHERE

            accountable_form_id = $1

            AND series = $2

            AND is_active = TRUE

            AND
            (
                ($3 BETWEEN beginning_or AND ending_or)

                OR

                ($4 BETWEEN beginning_or AND ending_or)

                OR

                (beginning_or BETWEEN $3 AND $4)
            )
        `,
        [
          accountable_form_id,
          series,
          beginning_or,
          ending_or,
        ]
      );

    if (
      duplicate.rows.length > 0
    ) {
      return NextResponse.json(
        {
          message:
            "The OR range overlaps an existing booklet.",
        },
        {
          status: 400,
        }
      );
    }

    const controlNo =
      await generateDocumentNumber(
        "SMI"
      );

    const receiptCount =
      Number(ending_or) -
      Number(beginning_or) +
      1;

    const result =
      await pool.query(
        `
        INSERT INTO smi_booklet_registration
        (
            control_no,
            accountable_form_id,
            fiscal_year,
            series,
            beginning_or,
            ending_or,
            receipt_count,
            current_or,
            status,
            received_date,
            supplier,
            remarks,
            created_by
        )

        VALUES
        (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $5,
            'AVAILABLE',
            $8,
            $9,
            $10,
            $11
        )

        RETURNING id
        `,
        [
          controlNo,
          accountable_form_id,
          fiscal_year,
          series,
          beginning_or,
          ending_or,
          receiptCount,
          received_date,
          supplier,
          remarks,
          user.id,
        ]
      );

    await pool.query(
      `
      INSERT INTO smi_booklet_registration_history
      (
          booklet_registration_id,
          action,
          previous_status,
          new_status,
          previous_current_or,
          new_current_or,
          remarks,
          performed_by
      )

      VALUES
      (
          $1,
          'REGISTERED',
          NULL,
          'AVAILABLE',
          NULL,
          $2,
          $3,
          $4
      )
      `,
      [
        result.rows[0].id,
        beginning_or,
        remarks || "Booklet registered.",
        user.id,
      ]
    );

        await createAudit({
      module: "SMI",
      recordId: result.rows[0].id,
      action: "CREATE",
      description: `Registered booklet ${controlNo}`,
      userId: user.id,
    });

    return NextResponse.json({
      success: true,
      message: "Booklet successfully registered.",
      id: result.rows[0].id,
    });

  } catch (err: any) {

    if (
      err.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    if (
      err.message === "FORBIDDEN"
    ) {
      return NextResponse.json(
        {
          message: "Forbidden",
        },
        {
          status: 403,
        }
      );
    }

    console.error(err);

    return NextResponse.json(
      {
        success: false,
        message:
          err.message ||
          "Server Error",
      },
      {
        status: 500,
      }
    );
  }
}

  
