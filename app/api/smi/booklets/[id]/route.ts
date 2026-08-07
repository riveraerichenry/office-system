import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/authorize";
import { pool } from "@/lib/db";
import { MODULE_PATHS } from "@/lib/module-paths";

type Params = Promise<{
  id: string;
}>;

export async function PUT(
  req: NextRequest,
  { params }: { params: Params }
) {
  try {
    const user = await authorize(
      req,
      MODULE_PATHS.SMI,
      "edit"
    );

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const {
      fiscal_year,
      series,
      beginning_or,
      ending_or,
      received_date,
      supplier,
      remarks,
    } = await req.json();

    // Get current values BEFORE update
    const existing = await pool.query(
      `
      SELECT *
      FROM smi_booklet_registration
      WHERE id = $1
      `,
      [id]
    );

    if (existing.rowCount === 0) {
      return NextResponse.json(
        { message: "Booklet not found." },
        { status: 404 }
      );
    }

    const before = existing.rows[0];

    const receipt_count =
      Number(ending_or) - Number(beginning_or) + 1;

    // Update booklet
    const updated = await pool.query(
      `
      UPDATE smi_booklet_registration
      SET
        fiscal_year = $1,
        series = $2,
        beginning_or = $3,
        ending_or = $4,
        receipt_count = $5,
        received_date = $6,
        supplier = $7,
        remarks = $8,
        updated_at = NOW()
      WHERE id = $9
      RETURNING *;
      `,
      [
        fiscal_year,
        series,
        beginning_or,
        ending_or,
        receipt_count,
        received_date,
        supplier,
        remarks,
        id,
      ]
    );

    const after = updated.rows[0];

    // Save history
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
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        NOW()
      )
      `,
      [
        id,
        "UPDATED",
        before.status,
        after.status,
        before.current_or,
        after.current_or,
        "Booklet information updated.",
        user.id,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Booklet updated successfully.",
      data: after,
    });
  } catch (err: any) {
    console.error(err);

    return NextResponse.json(
      {
        message:
          err.message ||
          "Internal server error.",
      },
      {
        status: 500,
      }
    );
  }
}