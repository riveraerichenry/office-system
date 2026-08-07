import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { MODULE_PATHS } from "@/lib/module-paths";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = verifyToken(token) as any;

    if (
      !hasPermission(
        user.modules,
        MODULE_PATHS.SMI,
        "print"
      )
    ) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);

    const status =
      searchParams.get("status");

    const fiscalYear =
      searchParams.get("year");

    const form =
      searchParams.get("form");

    let sql = `
        SELECT

            b.control_no,

            af.form_code,
            af.form_name,

            b.series,

            b.beginning_or,

            b.ending_or,

            b.receipt_count,

            b.status,

            b.received_date,

            b.supplier

        FROM accountable_form_booklets b

        INNER JOIN accountable_forms af
            ON af.id=b.accountable_form_id

        WHERE b.is_active=true
    `;

    const params: any[] = [];

    if (status) {
      params.push(status);
      sql += ` AND b.status=$${params.length}`;
    }

    if (fiscalYear) {
      params.push(fiscalYear);
      sql += ` AND b.fiscal_year=$${params.length}`;
    }

    if (form) {
      params.push(form);
      sql += ` AND b.accountable_form_id=$${params.length}`;
    }

    sql += `
        ORDER BY
            af.form_code,
            b.series,
            b.beginning_or
    `;

    const result =
      await pool.query(sql, params);

    return NextResponse.json({
      success: true,
      data: result.rows,
    });

  } catch (err) {
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