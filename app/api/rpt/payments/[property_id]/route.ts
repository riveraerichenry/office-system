import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

type RouteContext = {
  params: Promise<{
    property_id: string;
  }>;
};

export async function GET(
  _req: NextRequest,
  context: RouteContext
) {
  const client = await pool.connect();

  try {
    const { property_id } = await context.params;
    const propertyPin = decodeURIComponent(property_id || "").trim();

    if (!propertyPin) {
      return NextResponse.json(
        {
          success: false,
          message: "Property PIN is required.",
        },
        { status: 400 }
      );
    }

    console.log("==========================================");
    console.log("RPT PAYMENT HISTORY");
    console.log("PROPERTY PIN:", propertyPin);
    console.log("==========================================");

    const result = await client.query(
      `
      SELECT
        rpi.id,
        rpi.payment_id,
        rpi.transaction_id,
        rpi.billing_id,
        rpi.tax_declaration_id,
        rpi.td_number,
        rpi.declared_owner,
        rpi.property_location,
        rpi.assessed_value,
        rpi.start_quarter,
        rpi.start_year,
        rpi.end_quarter,
        rpi.end_year,
        rpi.basic,
        rpi.sef,
        rpi.penalty,
        rpi.discount,
        rpi.amount,
        rpi.tax_due,
        rpi.billing_number,
        rpi.billing_item_id,
        rpi.account_id,
        rpi.created_at AS item_created_at,

        rp.id AS rpt_payment_id,
        rp.property_id,
        rp.tdno,
        rp.payment_date,
        rp.taxpayer_name,
        rp.payor,
        rp.total_amount,
        rp.status

      FROM rpt_payment_items rpi

      INNER JOIN LATERAL (
        SELECT
          p.id,
          p.property_id,
          p.transaction_id,
          p.tdno,
          p.payment_date,
          p.taxpayer_name,
          p.payor,
          p.total_amount,
          p.status,
          p.is_cancelled

        FROM rpt_payment p

        WHERE
          p.property_id = $1
          AND p.is_cancelled = FALSE
          AND UPPER(COALESCE(p.status, 'PAID')) = 'PAID'
          AND (
            p.id = rpi.payment_id
            OR (
              p.transaction_id IS NOT NULL
              AND p.transaction_id = rpi.transaction_id
            )
          )

        ORDER BY
          CASE
            WHEN p.id = rpi.payment_id THEN 1
            ELSE 2
          END,
          p.payment_date DESC

        LIMIT 1
      ) rp ON TRUE

      ORDER BY
    rpi.start_year DESC NULLS LAST,
    rpi.start_quarter DESC NULLS LAST,
    rp.payment_date DESC,
    rpi.created_at DESC;
      `,
      [propertyPin]
    );

    const payments = result.rows;

    const totalPaid = payments.reduce(
      (total, payment) =>
        total + Number(payment.amount || 0),
      0
    );

    console.log("PAYMENT ITEMS FOUND:", payments.length);
    console.log("TOTAL PAID:", totalPaid);
    console.log("==========================================");

    return NextResponse.json(
      {
        success: true,
        property_id: propertyPin,
        count: payments.length,
        total_paid: totalPaid,
        data: payments,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("RPT PAYMENT HISTORY ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to retrieve RPT payment history.",
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}