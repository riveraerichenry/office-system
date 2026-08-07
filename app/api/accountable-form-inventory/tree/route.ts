import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const result =
      await pool.query(`
        SELECT DISTINCT
          afi.fiscal_year,
          af.id,
          af.af_code,
          af.form_name
        FROM accountable_form_inventory afi
        INNER JOIN accountable_forms af
          ON af.id = afi.accountable_form_id
        ORDER BY
          afi.fiscal_year DESC,
          af.af_code ASC
      `);

    const grouped =
      result.rows.reduce(
        (
          acc: any[],
          row: any
        ) => {
          let yearGroup =
            acc.find(
              (item) =>
                item.fiscal_year ===
                row.fiscal_year
            );

          if (!yearGroup) {
            yearGroup = {
              fiscal_year:
                row.fiscal_year,
              forms: [],
            };

            acc.push(
              yearGroup
            );
          }

          yearGroup.forms.push({
            id: row.id,
            af_code:
              row.af_code,
            form_name:
              row.form_name,
          });

          return acc;
        },
        []
      );

    return NextResponse.json({
      success: true,
      data: grouped,
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