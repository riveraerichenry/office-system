import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(req: NextRequest) {

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        const body = await req.json();

        const {
            property,
            paymentDate,
            fromQuarter,
            fromYear,
            toQuarter,
            toYear,
            totals,
            rows,
        } = body;

        //--------------------------------------------------
        // Billing Period (YYYYMM)
        //--------------------------------------------------

        const billDate = new Date(paymentDate);

        const billingPeriod =
            `${billDate.getFullYear()}${String(
                billDate.getMonth() + 1
            ).padStart(2, "0")}`;

        //--------------------------------------------------
        // Lock Sequence
        //--------------------------------------------------

        const seq = await client.query(
            `
            SELECT *
            FROM rpt_billing_sequences
            WHERE billing_period=$1
            FOR UPDATE
            `,
            [billingPeriod]
        );

        let nextNumber = 1;

        if (seq.rows.length === 0) {

            await client.query(
                `
                INSERT INTO rpt_billing_sequences
                (
                    billing_period,
                    last_number
                )
                VALUES
                (
                    $1,
                    1
                )
                `,
                [billingPeriod]
            );

        } else {

            nextNumber =
                Number(seq.rows[0].last_number) + 1;

            await client.query(
                `
                UPDATE rpt_billing_sequences
                SET
                    last_number=$1,
                    updated_at=NOW()
                WHERE billing_period=$2
                `,
                [
                    nextNumber,
                    billingPeriod,
                ]
            );

        }

        //--------------------------------------------------
        // Billing Number
        //--------------------------------------------------

        const billingNumber =
            `RPT-BILLING-${billingPeriod}-${String(
                nextNumber
            ).padStart(5, "0")}`;

        //--------------------------------------------------
        // Insert Billing Header
        //--------------------------------------------------

        const billing = await client.query(
            `
            INSERT INTO rpt_billings
            (
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

                status
            )
            VALUES
            (
                $1,$2,
                $3,$4,$5,$6,$7,$8,$9,
                $10,$11,$12,$13,
                $14,$15,$16,$17,$18,$19,
                'UNPAID'
            )
            RETURNING id
            `,
            [
                billingNumber,
                paymentDate,

                property.owner_name,
                property.tdno,
                property.fullpin,
                property.classification_name,
                property.barangay_name,
                property.rputype,
                property.totalav,

                fromQuarter,
                fromYear,
                toQuarter,
                toYear,

                totals.taxDue,
                totals.basic,
                totals.sef,
                totals.penalty,
                totals.discount,
                totals.total,
            ]
        );

        const billingId = billing.rows[0].id;

        //--------------------------------------------------
        // Insert Billing Items
        //--------------------------------------------------

        for (const row of rows) {

            await client.query(
                `
                INSERT INTO rpt_billing_items
                (
                    billing_id,

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

                    $9,
                    $10,
                    $11,

                    $12,
                    $13,

                    $14,
                    $15,

                    $16
                )
                `,
                [
                    billingId,

                    row.arp,
                    row.coverage,

                    row.startQuarter,
                    row.startYear,

                    row.endQuarter,
                    row.endYear,

                    row.assessed_value,

                    row.tax_due,
                    row.basic,
                    row.sef,

                    row.penalty_percent,
                    row.penalty,

                    row.discount_percent,
                    row.discount,

                    row.total,
                ]
            );

        }

        //--------------------------------------------------
        // Commit
        //--------------------------------------------------

        await client.query("COMMIT");

        return NextResponse.json({

            success: true,

            billingId,

            billingNumber,

        });

    } catch (error) {

        await client.query("ROLLBACK");

        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message: "Unable to save billing."
            },
            {
                status: 500
            }
        );

    } finally {

        client.release();

    }

}