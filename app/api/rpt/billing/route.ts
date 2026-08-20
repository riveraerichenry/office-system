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
        // Determine TD Number
        //
        // Use property.tdno first.
        // If blank, use the latest non-blank TD from rows.
        //--------------------------------------------------

        let tdNumber =
            property?.tdno?.trim() || null;

        if (!tdNumber && Array.isArray(rows)) {
            const validRows = rows
                .filter((row: any) => {
                    return (
                        row?.arp &&
                        String(row.arp).trim()
                    );
                })
                .sort((a: any, b: any) => {
                    const aYear =
                        Number(
                            a.endYear ??
                                a.startYear ??
                                0
                        );

                    const bYear =
                        Number(
                            b.endYear ??
                                b.startYear ??
                                0
                        );

                    if (aYear !== bYear) {
                        return bYear - aYear;
                    }

                    const aQuarter =
                        Number(
                            a.endQuarter ??
                                a.startQuarter ??
                                0
                        );

                    const bQuarter =
                        Number(
                            b.endQuarter ??
                                b.startQuarter ??
                                0
                        );

                    return (
                        bQuarter -
                        aQuarter
                    );
                });

            if (validRows.length > 0) {
                tdNumber =
                    String(
                        validRows[0].arp
                    ).trim();
            }
        }

        //--------------------------------------------------
        // Final validation
        //--------------------------------------------------

        if (!tdNumber) {
            throw new Error(
                "TD Number is required. No valid TD number was found in the property or billing rows."
            );
        }

        //--------------------------------------------------
        // Lock Sequence
        //--------------------------------------------------

        const seq = await client.query(
            `
            SELECT *
            FROM rpt_billing_sequences
            WHERE billing_period = $1
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
                Number(
                    seq.rows[0].last_number
                ) + 1;

            await client.query(
                `
                UPDATE rpt_billing_sequences
                SET
                    last_number = $1,
                    updated_at = NOW()
                WHERE billing_period = $2
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

        const billing =
            await client.query(
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

                    // USE LATEST TD
                    tdNumber,

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

        const billingId =
            billing.rows[0].id;

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

                    // If this row has no TD,
                    // use the latest TD.
                    row.arp?.trim() ||
                        tdNumber,

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
            tdNumber,
        });

    } catch (error: any) {
        await client.query("ROLLBACK");

        console.error(
            "POST /api/rpt/billing:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    error?.message ||
                    "Unable to save billing.",
            },
            {
                status: 500,
            }
        );

    } finally {
        client.release();
    }
}