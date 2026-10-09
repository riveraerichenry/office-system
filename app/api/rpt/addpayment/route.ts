import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { pool } from "@/lib/db";

export async function POST(request: NextRequest) {
    const client = await pool.connect();

    try {
        const body = await request.json();

        const {
            property_id,
            tdno,
            taxpayer_name,
            payment_date,
            start_quarter,
            start_year,
            end_quarter,
            end_year,
            or_number,
            assessed_value,
            amount,
            declared_owner,
            property_location,
            collector_id,
        } = body;

        if (!property_id || !tdno || !payment_date) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Property PIN, TD Number, and Payment Date are required.",
                },
                { status: 400 }
            );
        }

        if (!collector_id) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Please select a collector.",
                },
                { status: 400 }
            );
        }

        const startQ = Number(start_quarter);
        const startY = Number(start_year);
        const endQ = Number(end_quarter);
        const endY = Number(end_year);
        const assessed = Number(assessed_value || 0);
        const paymentAmount = Number(amount);

        if (
            !Number.isInteger(startQ) ||
            startQ < 1 ||
            startQ > 4 ||
            !Number.isInteger(endQ) ||
            endQ < 1 ||
            endQ > 4 ||
            !Number.isInteger(startY) ||
            !Number.isInteger(endY) ||
            startY < 1900 ||
            startY > 2100 ||
            endY < 1900 ||
            endY > 2100 ||
            endY < startY ||
            (endY === startY && endQ < startQ)
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid tax coverage period.",
                },
                { status: 400 }
            );
        }

        if (
            !Number.isFinite(paymentAmount) ||
            paymentAmount <= 0
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Amount must be greater than zero.",
                },
                { status: 400 }
            );
        }

        if (!Number.isFinite(assessed) || assessed < 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Assessed value is invalid.",
                },
                { status: 400 }
            );
        }

        await client.query("BEGIN");

        // Verify the selected collector is active and has an eligible role.
        const collectorResult = await client.query(
            `
            SELECT u.id
            FROM public.users u
            INNER JOIN public.user_roles ur
                ON ur.user_id = u.id
            INNER JOIN public.roles r
                ON r.id = ur.role_id
            WHERE u.id = $1
              AND COALESCE(u.is_active, TRUE) = TRUE
              AND LOWER(TRIM(r.role_name)) IN (
                  'collector',
                  'collector officer'
              )
            LIMIT 1
            `,
            [collector_id]
        );

        if (collectorResult.rowCount === 0) {
            await client.query("ROLLBACK");

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Selected collector is not eligible or active.",
                },
                { status: 400 }
            );
        }

        const paymentId = randomUUID();
        const paymentItemId = randomUUID();

        // Create the historical payment header.
        await client.query(
            `
            INSERT INTO public.rpt_payment (
                id,
                transaction_id,
                property_id,
                tdno,
                taxpayer_name,
                payment_date,
                total_amount,
                status,
                is_cancelled,
                payor,
                created_at,
                updated_at
            )
            VALUES (
                $1, NULL, $2, $3, $4, $5, $6,
                'PAID', FALSE, $7,
                CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            )
            `,
            [
                paymentId,
                String(property_id),
                String(tdno),
                taxpayer_name || declared_owner || null,
                payment_date,
                paymentAmount,
                taxpayer_name || declared_owner || null,
            ]
        );

        // Save the coverage and selected collector.
        await client.query(
            `
            INSERT INTO public.rpt_payment_items (
                id,
                payment_id,
                transaction_id,
                billing_id,
                tax_declaration_id,
                td_number,
                declared_owner,
                property_location,
                assessed_value,
                start_quarter,
                start_year,
                end_quarter,
                end_year,
                basic,
                sef,
                penalty,
                discount,
                amount,
                created_at,
                tax_due,
                billing_number,
                billing_item_id,
                account_id,
                collector_id
            )
            VALUES (
                $1, $2, NULL, NULL, NULL,
                $3, $4, $5, $6,
                $7, $8, $9, $10,
                NULL, NULL, NULL, NULL,
                $11, CURRENT_TIMESTAMP,
                $11, $12, NULL, NULL, $13
            )
            `,
            [
                paymentItemId,
                paymentId,
                String(tdno),
                declared_owner || taxpayer_name || null,
                property_location || null,
                assessed,
                startQ,
                startY,
                endQ,
                endY,
                paymentAmount,
                or_number || null,
                collector_id,
            ]
        );

        await client.query("COMMIT");

        return NextResponse.json(
            {
                success: true,
                message: "Historical RPT payment saved successfully.",
                data: {
                    payment_id: paymentId,
                    payment_item_id: paymentItemId,
                    collector_id,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        await client.query("ROLLBACK");

        console.error("POST RPT ADD PAYMENT ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : "Failed to save RPT payment.",
            },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}