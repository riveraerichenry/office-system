import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { authorize } from "@/lib/authorize";
import { MODULE_PATHS } from "@/lib/module-paths";
import { createAudit } from "@/lib/audit";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  req: NextRequest,
  { params }: Params
) {
  try {
    const user = await authorize(
      req,
      MODULE_PATHS.SMI,
      "view"
    );

    const { id } = await params;

    const result = await pool.query(
      `
      SELECT
          b.*,
          af.form_code,
          af.form_name
      FROM smi_booklet_registration b
      LEFT JOIN accountable_forms af
          ON af.id = b.accountable_form_id
      WHERE b.id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          message: "Booklet not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });

  } catch (err: any) {

    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    if (err.message === "FORBIDDEN") {
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
        message: "Server Error",
      },
      {
        status: 500,
      }
    );
  }
}


export async function PUT(
  req: NextRequest,
  { params }: Params
) {
  try {
    const user = await authorize(
      req,
      MODULE_PATHS.SMI,
      "edit"
    );

    const { id } = await params;

    const body = await req.json();

    const {
      accountable_form_id,
      fiscal_year,
      series,
      beginning_or,
      ending_or,
      current_or,
      received_date,
      supplier,
      remarks,
    } = body;

    const existing = await pool.query(
      `
      SELECT *
      FROM smi_booklet_registration
      WHERE id=$1
      `,
      [id]
    );

    if (existing.rows.length === 0) {
      return NextResponse.json(
        {
          message: "Booklet not found.",
        },
        {
          status: 404,
        }
      );
    }

    const old = existing.rows[0];

    if (old.status !== "AVAILABLE") {
      return NextResponse.json(
        {
          message:
            "Only AVAILABLE booklets can be edited.",
        },
        {
          status: 400,
        }
      );
    }

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

    const overlap = await pool.query(
      `
      SELECT id
      FROM smi_booklet_registration
      WHERE
          accountable_form_id=$1
          AND series=$2
          AND id<>$3
          AND is_active=true
          AND
          (
              ($4 BETWEEN beginning_or AND ending_or)
              OR
              ($5 BETWEEN beginning_or AND ending_or)
              OR
              (beginning_or BETWEEN $4 AND $5)
          )
      `,
      [
        accountable_form_id,
        series,
        id,
        beginning_or,
        ending_or,
      ]
    );

    if (overlap.rows.length > 0) {
      return NextResponse.json(
        {
          message:
            "OR range overlaps another booklet.",
        },
        {
          status: 400,
        }
      );
    }

    const receiptCount =
      Number(ending_or) -
      Number(beginning_or) +
      1;

    await pool.query(
      `
      UPDATE smi_booklet_registration
      SET
          accountable_form_id=$1,
          fiscal_year=$2,
          series=$3,
          beginning_or=$4,
          ending_or=$5,
          receipt_count=$6,
          current_or=$7,
          received_date=$8,
          supplier=$9,
          remarks=$10,
          updated_at=NOW()
      WHERE id=$11
      `,
      [
        accountable_form_id,
        fiscal_year,
        series,
        beginning_or,
        ending_or,
        receiptCount,
        current_or,
        received_date,
        supplier,
        remarks,
        id,
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
          performed_by,
          performed_at
      )
      VALUES
      (
          $1,
          'UPDATED',
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          NOW()
      )
      `,
      [
        id,
        old.status,
        old.status,
        old.current_or,
        current_or,
        "Booklet information updated.",
        user.id,
      ]
    );

    await createAudit({
      module: "SMI",
      recordId: id,
      action: "UPDATE",
      description: `Updated booklet ${old.control_no}`,
      userId: user.id,
    });

    return NextResponse.json({
      success: true,
      message: "Booklet successfully updated.",
    });

  } catch (err: any) {

    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    if (err.message === "FORBIDDEN") {
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
        message: "Server Error",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: Params
) {
  try {
    const user = await authorize(
      req,
      MODULE_PATHS.SMI,
      "delete"
    );

    const { id } = await params;

    const existing = await pool.query(
      `
      SELECT *
      FROM smi_booklet_registration
      WHERE id=$1
      `,
      [id]
    );

    if (existing.rows.length === 0) {
      return NextResponse.json(
        {
          message: "Booklet not found.",
        },
        {
          status: 404,
        }
      );
    }

    const booklet = existing.rows[0];

    if (booklet.status !== "AVAILABLE") {
      return NextResponse.json(
        {
          message:
            "Only AVAILABLE booklets can be archived.",
        },
        {
          status: 400,
        }
      );
    }

    await pool.query(
      `
      UPDATE smi_booklet_registration
      SET
          is_active=false,
          updated_at=NOW()
      WHERE id=$1
      `,
      [id]
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
          performed_by,
          performed_at
      )
      VALUES
      (
          $1,
          'ARCHIVED',
          $2,
          'ARCHIVED',
          $3,
          $3,
          $4,
          $5,
          NOW()
      )
      `,
      [
        id,
        booklet.status,
        booklet.current_or,
        "Booklet archived.",
        user.id,
      ]
    );

    await createAudit({
      module: "SMI",
      recordId: id,
      action: "ARCHIVE",
      description: `Archived booklet ${booklet.control_no}`,
      userId: user.id,
    });

    return NextResponse.json({
      success: true,
      message: "Booklet archived successfully.",
    });

  } catch (err: any) {

    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    if (err.message === "FORBIDDEN") {
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
        message: "Server Error",
      },
      {
        status: 500,
      }
    );
  }
}