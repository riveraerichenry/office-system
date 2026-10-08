import {
    NextRequest,
    NextResponse,
} from "next/server";

import { PoolClient } from "pg";

import { authorize } from "@/lib/authorize";
import { pool } from "@/lib/db";
import { MODULE_PATHS } from "@/lib/module-paths";

export async function POST(req: NextRequest) {
    let client: PoolClient | null = null;

    try {
        // ============================================================
        // 1. AUTHORIZE
        // ============================================================

        const user = await authorize(
            req,
            MODULE_PATHS.DIPP,
            "add"
        );

        // ============================================================
        // 2. REQUEST BODY
        // ============================================================

        const body = await req.json();

        const {
            booklet_registration_id,
            billing_id,
            receipt_date,
            payor,
            gender,
            payment_mode,
            remarks,
        } = body;

        if (!booklet_registration_id) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Booklet registration is required.",
                },
                { status: 400 }
            );
        }

        if (!billing_id) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Billing is required.",
                },
                { status: 400 }
            );
        }

        if (!receipt_date) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Receipt date is required.",
                },
                { status: 400 }
            );
        }

        if (!payor?.trim()) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Payor is required.",
                },
                { status: 400 }
            );
        }

        if (!gender) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Gender is required.",
                },
                { status: 400 }
            );
        }

        if (!payment_mode) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Payment mode is required.",
                },
                { status: 400 }
            );
        }

        // ============================================================
        // 3. DATABASE CONNECTION
        // ============================================================

        client = await pool.connect();

        await client.query("BEGIN");

        // ============================================================
        // 4. GET BOOKLET / LOR RELEASE
        // ============================================================

        const bookletResult = await client.query(
            `
                SELECT
                    lr.id AS lor_release_id,
                    lr.accountable_form_id,
                    lr.accountable_officer_id,

                    sbr.id AS booklet_registration_id,
                    sbr.current_or,
                    sbr.ending_or,
                    sbr.status

                FROM public.lor_releases lr

                INNER JOIN public.smi_booklet_registration sbr
                    ON sbr.id = lr.booklet_registration_id

                WHERE lr.id = $1
                  AND lr.is_active = TRUE
                  AND sbr.is_active = TRUE

                FOR UPDATE
            `,
            [booklet_registration_id]
        );

        if (bookletResult.rows.length === 0) {
            throw new Error(
                "Booklet/LOR release not found or inactive."
            );
        }

        const booklet = bookletResult.rows[0];

        // ============================================================
        // 5. VALIDATE CURRENT OR
        // ============================================================

        const currentOR = Number(booklet.current_or);
        const endingOR = Number(booklet.ending_or);

        if (!Number.isFinite(currentOR)) {
            throw new Error(
                "Invalid current OR number in booklet."
            );
        }

        if (!Number.isFinite(endingOR)) {
            throw new Error(
                "Invalid ending OR number in booklet."
            );
        }

        if (currentOR > endingOR) {
            throw new Error(
                "The booklet has no available OR number."
            );
        }

        const orNumber = String(currentOR);

        // ============================================================
        // 6. PREVENT DUPLICATE OR
        // ============================================================

        const duplicateOR = await client.query(
            `
                SELECT id
                FROM public.dipp_transactions
                WHERE or_number = $1
                LIMIT 1
            `,
            [orNumber]
        );

        if (duplicateOR.rows.length > 0) {
            throw new Error(
                `OR Number ${orNumber} has already been used.`
            );
        }

        // ============================================================
        // 7. GET BILLING
        // ============================================================

        const billingResult = await client.query(
            `
                SELECT *
                FROM public.rpt_billings
                WHERE id = $1
                FOR UPDATE
            `,
            [billing_id]
        );

        if (billingResult.rows.length === 0) {
            throw new Error(
                "RPT billing record not found."
            );
        }

        const billing = billingResult.rows[0];

        // ============================================================
        // 8. PREVENT PAYMENT OF ALREADY PAID BILLING
        // ============================================================

        if (
            String(billing.status || "").toUpperCase() ===
            "PAID"
        ) {
            throw new Error(
                "This RPT billing has already been paid."
            );
        }

        // ============================================================
        // 9. GET BILLING ITEMS
        // ============================================================

        const itemResult = await client.query(
            `
                SELECT *
                FROM public.rpt_billing_items
                WHERE billing_id = $1
                ORDER BY
                    td_number,
                    start_year,
                    start_quarter
            `,
            [billing_id]
        );

        if (itemResult.rows.length === 0) {
            throw new Error(
                "No billing items were found for this billing."
            );
        }

        const billingItems = itemResult.rows;

        // ============================================================
        // 10. CALCULATE GRAND TOTAL
        // ============================================================

        const grandTotal = billingItems.reduce(
            (sum: number, item: any) => {
                return (
                    sum +
                    Number(
                        item.total ??
                        item.amount ??
                        0
                    )
                );
            },
            0
        );

        if (!Number.isFinite(grandTotal)) {
            throw new Error(
                "Invalid billing total."
            );
        }

        // ============================================================
        // 11. INSERT DIPP TRANSACTION
        // ============================================================

        const transactionResult = await client.query(
            `
                INSERT INTO public.dipp_transactions (
                    or_number,
                    receipt_date,
                    booklet_registration_id,
                    lor_release_id,
                    accountable_form_id,
                    collector_id,
                    payor,
                    payment_mode,
                    remarks,
                    grand_total,
                    status,
                    encoded_by,
                    billing_id,
                    transaction_type,
                    gender,
                    payment,
                    created_at
                )
                VALUES (
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
                    'POSTED',
                    $11,
                    $12,
                    'RPT',
                    $13,
                    $14,
                    NOW()
                )
                RETURNING id
            `,
            [
                orNumber,
                receipt_date,
                booklet.booklet_registration_id,
                booklet.lor_release_id,
                booklet.accountable_form_id,
                booklet.accountable_officer_id,

                // Actual person who paid
                payor.trim(),

                payment_mode,
                remarks ?? null,
                grandTotal,

                user.id,
                billing.id,
                gender,
                payment_mode,
            ]
        );

        const transactionId =
            transactionResult.rows[0].id;

        // ============================================================
        // 12. INSERT DIPP RPT ITEMS
        // ============================================================

        for (const item of billingItems) {
            await client.query(
                `
                    INSERT INTO public.dipp_rpt_items (
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
                        account_id
                    )
                    VALUES (
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
                        $16,
                        NOW(),
                        $17,
                        $18,
                        $19,
                        $20
                    )
                `,
                [
                    transactionId,

                    billing.id,

                    item.tax_declaration_id ??
                        null,

                    item.td_number ??
                        billing.td_number ??
                        null,

                    item.declared_owner ??
                        billing.owner_name ??
                        null,

                    item.property_location ??
                        billing.barangay_name ??
                        null,

                    Number(
                        item.assessed_value ??
                        billing.assessed_value ??
                        0
                    ),

                    item.start_quarter ??
                        billing.from_quarter ??
                        null,

                    item.start_year ??
                        billing.from_year ??
                        null,

                    item.end_quarter ??
                        billing.to_quarter ??
                        null,

                    item.end_year ??
                        billing.to_year ??
                        null,

                    Number(item.basic ?? 0),

                    Number(item.sef ?? 0),

                    Number(item.penalty ?? 0),

                    Number(item.discount ?? 0),

                    Number(
                        item.total ??
                        item.amount ??
                        0
                    ),

                    Number(item.tax_due ?? 0),

                    billing.billing_number ??
                        null,

                    item.id ?? null,

                    item.account_id ?? null,
                ]
            );
        }

        // ============================================================
        // 13. INSERT RPT PAYMENT ITEMS
        // ============================================================

        for (const item of billingItems) {
            await client.query(
                `
                    INSERT INTO public.rpt_payment_items (
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
                        account_id
                    )
                    VALUES (
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
                        $16,
                        NOW(),
                        $17,
                        $18,
                        $19,
                        $20
                    )
                `,
                [
                    transactionId,

                    billing.id,

                    item.tax_declaration_id ??
                        null,

                    item.td_number ??
                        billing.td_number ??
                        null,

                    item.declared_owner ??
                        billing.owner_name ??
                        null,

                    item.property_location ??
                        billing.barangay_name ??
                        null,

                    Number(
                        item.assessed_value ??
                        billing.assessed_value ??
                        0
                    ),

                    item.start_quarter ??
                        billing.from_quarter ??
                        null,

                    item.start_year ??
                        billing.from_year ??
                        null,

                    item.end_quarter ??
                        billing.to_quarter ??
                        null,

                    item.end_year ??
                        billing.to_year ??
                        null,

                    Number(item.basic ?? 0),

                    Number(item.sef ?? 0),

                    Number(item.penalty ?? 0),

                    Number(item.discount ?? 0),

                    Number(
                        item.total ??
                        item.amount ??
                        0
                    ),

                    Number(item.tax_due ?? 0),

                    billing.billing_number ??
                        null,

                    item.id ?? null,

                    item.account_id ?? null,
                ]
            );
        }

        // ============================================================
        // 14. INSERT RPT PAYMENT HEADER
        // ============================================================

        /*
         * property_id comes from the RPT property's FULL PIN.
         *
         * rpt_billings.fullpin is the corresponding property
         * identifier used by the RPT billing record.
         */

        const propertyId =
            billing.fullpin ?? null;

        if (!propertyId) {
            throw new Error(
                "RPT billing has no property identifier (fullpin)."
            );
        }

        const rptPaymentResult = await client.query(
            `
                INSERT INTO public.rpt_payment (
                    transaction_id,
                    property_id,
                    tdno,
                    taxpayer_name,
                    payor,
                    payment_date,
                    total_amount,
                    status,
                    is_cancelled,
                    created_at,
                    updated_at,
                    created_by
                )
                VALUES (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    $6,
                    $7,
                    'PAID',
                    FALSE,
                    NOW(),
                    NOW(),
                    $8
                )
                RETURNING id
            `,
            [
                transactionId,

                propertyId,

                // Registered property TD number
                billing.td_number ??
                    null,

                // Registered property owner
                billing.owner_name ??
                    null,

                // ACTUAL PERSON WHO PAID
                payor.trim(),

                receipt_date,

                grandTotal,

                user.id,
            ]
        );

        const rptPaymentId =
            rptPaymentResult.rows[0].id;

        // ============================================================
        // 15. UPDATE BILLING STATUS
        // ============================================================

        await client.query(
            `
                UPDATE public.rpt_billings
                SET
                    status = 'PAID',
                    updated_at = NOW()
                WHERE id = $1
            `,
            [billing.id]
        );

        // ============================================================
        // 16. ADVANCE OR NUMBER
        // ============================================================

        const nextOR = currentOR + 1;

        const nextStatus =
            nextOR > endingOR
                ? "CONSUMED"
                : "IN USE";

        await client.query(
            `
                UPDATE public.smi_booklet_registration
                SET
                    current_or = $1,
                    status = $2
                WHERE id = $3
            `,
            [
                nextOR,
                nextStatus,
                booklet.booklet_registration_id,
            ]
        );

        // ============================================================
        // 17. COMMIT EVERYTHING
        // ============================================================

        await client.query("COMMIT");

        // ============================================================
        // 18. RESPONSE
        // ============================================================

        return NextResponse.json({
            success: true,

            message:
                "AF56 RPT payment processed successfully.",

            transaction_id: transactionId,

            rpt_payment_id: rptPaymentId,

            or_number: orNumber,

            next_or: nextOR,

            grand_total: grandTotal,
        });
    } catch (error: any) {
        // ============================================================
        // ROLLBACK
        // ============================================================

        if (client) {
            try {
                await client.query("ROLLBACK");
            } catch (rollbackError) {
                console.error(
                    "ROLLBACK ERROR:",
                    rollbackError
                );
            }
        }

        console.error(
            "AF56 PAYMENT ERROR:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    error?.message ??
                    "Failed to process AF56 payment.",
            },
            {
                status: 500,
            }
        );
    } finally {
        if (client) {
            client.release();
        }
    }
}