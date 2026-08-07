import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { authorize } from "@/lib/authorize";
import { MODULE_PATHS } from "@/lib/module-paths";

export async function GET(req: NextRequest) {
  try {
    await authorize(req, MODULE_PATHS.SMI, "view");

    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") || "";
    const fiscalYear =
      searchParams.get("year") ||
      new Date().getFullYear().toString();

    const values: any[] = [];
    const conditions: string[] = [];

    if (search) {
      values.push(`%${search}%`);

      conditions.push(`
        (
          af.form_code ILIKE $${values.length}
          OR af.form_name ILIKE $${values.length}
        )
      `);
    }

    values.push(Number(fiscalYear));
    const yearParam = values.length;

    const result = await pool.query(
      `
      SELECT
          af.id,
          af.form_code,
          af.form_name,

          COALESCE(COUNT(br.id), 0) AS total_registered,

          COALESCE(
            COUNT(*) FILTER (
              WHERE UPPER(COALESCE(br.status, '')) = 'ISSUED'
            ),
            0
          ) AS total_issued,

          COALESCE(
            COUNT(*) FILTER (
              WHERE UPPER(COALESCE(br.status, '')) = 'AVAILABLE'
            ),
            0
          ) AS total_remaining

      FROM accountable_forms af

      LEFT JOIN smi_booklet_registration br
        ON br.accountable_form_id = af.id
        AND br.is_active = TRUE
        AND br.fiscal_year = $${yearParam}

      ${
        conditions.length
          ? `WHERE ${conditions.join(" AND ")}`
          : ""
      }

      GROUP BY
          af.id,
          af.form_code,
          af.form_name

      ORDER BY
          af.form_code;
      `,
      values
    );

    const yearsResult = await pool.query(`
      SELECT DISTINCT fiscal_year
      FROM smi_booklet_registration
      WHERE is_active = TRUE
      ORDER BY fiscal_year DESC
    `);

    return NextResponse.json({
      success: true,
      data: result.rows,
      years: yearsResult.rows.map(
        (row) => row.fiscal_year
      ),
    });
  } catch (error) {
    console.error("Inventory Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load inventory.",
      },
      {
        status: 500,
      }
    );
  }
}