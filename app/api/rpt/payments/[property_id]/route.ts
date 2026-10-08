import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(
    req: NextRequest,
    context: {
        params: Promise<{
            property_id: string;
        }>;
    }
) {
    try {
        const { property_id } = await context.params;

        if (!property_id) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Property ID is required.",
                },
                {
                    status: 400,
                }
            );
        }

        const propertyId = decodeURIComponent(property_id);

        console.log(
            "========== RPT PAYMENT HISTORY =========="
        );
        console.log("PROPERTY ID:", propertyId);
        console.log("==========================================");

        /*
         * ============================================================
         * RPT PAYMENT HISTORY
         * ============================================================
         *
         * MAIN SOURCE:
         *
         *     rpt_payment_items
         *
         * All payment-history details such as:
         *
         *     TD Number
         *     Owner
         *     Property Location
         *     Assessed Value
         *     Coverage
         *     Basic
         *     SEF
         *     Penalty
         *     Discount
         *     Amount
         *     Tax Due
         *     Billing Number
         *
         * come from rpt_payment_items.
         *
         * rpt_payment is only joined using transaction_id so we can:
         *
         *     1. Identify the payment transaction
         *     2. Filter by property_id
         *     3. Make sure the payment is PAID
         *     4. Exclude cancelled payments
         *     5. Get payment_date
         *     6. Get taxpayer_name
         *
         * Relationship:
         *
         *     rpt_payment.transaction_id
         *              =
         *     rpt_payment_items.transaction_id
         *
         * ============================================================
         */

        const result = await pool.query(
            `
            SELECT
                /* ====================================================
                 * rpt_payment_items
                 * MAIN PAYMENT HISTORY DATA
                 * ====================================================
                 */
                rpi.id,
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

                rpi.created_at,

                rpi.tax_due,
                rpi.billing_number,
                rpi.billing_item_id,
                rpi.account_id,

                /* ====================================================
                 * rpt_payment
                 * PAYMENT HEADER / FILTER DATA ONLY
                 * ====================================================
                 */
                rp.payment_date,
                rp.taxpayer_name,
                rp.status

            FROM rpt_payment_items rpi

            INNER JOIN rpt_payment rp
                ON rp.transaction_id = rpi.transaction_id

            WHERE
                rp.property_id = $1
                AND rp.is_cancelled = FALSE
                AND rp.status = 'PAID'

            ORDER BY
                rpi.start_year DESC,
                rpi.start_quarter DESC,
                rp.payment_date DESC,
                rpi.created_at DESC
            `,
            [propertyId]
        );

        /*
         * ============================================================
         * TOTAL PAID
         * ============================================================
         *
         * Calculate from rpt_payment_items.amount.
         *
         * DO NOT use rpt_payment.total_amount here because the
         * payment-history records are item-based.
         *
         * ============================================================
         */

        const totalPaid = result.rows.reduce(
            (total, item) => {
                return total + Number(item.amount || 0);
            },
            0
        );

        console.log(
            "PAYMENT ITEMS FOUND:",
            result.rows.length
        );

        console.log(
            "TOTAL PAID:",
            totalPaid
        );

        /*
         * ============================================================
         * RESPONSE
         * ============================================================
         */

        return NextResponse.json({
            success: true,
            property_id: propertyId,
            count: result.rows.length,
            total_paid: totalPaid,
            data: result.rows,
        });

    } catch (error) {
        console.error(
            "RPT PAYMENT HISTORY ERROR:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message: "Failed to load payment history.",
            },
            {
                status: 500,
            }
        );
    }
}