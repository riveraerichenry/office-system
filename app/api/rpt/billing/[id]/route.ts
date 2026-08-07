import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const { id } = await params;

    /*
    |--------------------------------------------------------------------------
    | Billing Header
    |--------------------------------------------------------------------------
    */

    const billing = await pool.query(
      `
      SELECT
          id,
          billing_number,
          billing_date,
          owner_name,
          td_number,
          fullpin,
          classification_name,
          barangay_name,
          property_type,
          assessed_value,
          from_quarter,
          from_year,
          to_quarter,
          to_year,
          total_tax_due,
          total_basic,
          total_sef,
          total_penalty,
          total_discount,
          grand_total,
          status,
          remarks
      FROM rpt_billings
      WHERE id = $1
      `,
      [id]
    );

    if (billing.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Billing not found.",
        },
        {
          status: 404,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Billing Items
    |--------------------------------------------------------------------------
    */

    const items = await pool.query(
      `
      SELECT
          id,
          td_number,
          coverage,
          start_quarter,
          start_year,
          end_quarter,
          end_year,
          assessed_value,
          tax_due,
          basic,
          sef,
          penalty_percent,
          penalty,
          discount_percent,
          discount,
          total
      FROM rpt_billing_items
      WHERE billing_id = $1
      ORDER BY
          td_number,
          start_year,
          start_quarter
      `,
      [id]
    );

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    return NextResponse.json({
      success: true,

      billing: {
        ...billing.rows[0],
        items: items.rows,
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to retrieve billing.",
      },
      {
        status: 500,
      }
    );
  }
}