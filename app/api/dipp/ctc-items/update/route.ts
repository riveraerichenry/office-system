import { NextRequest, NextResponse } from "next/server";

import { authorize } from "@/lib/authorize";
import { pool } from "@/lib/db";
import { MODULE_PATHS } from "@/lib/module-paths";

type CTCItemInput = {
    id?: string | null;
    ctc_type?: string | null;
    full_name?: string | null;
    address?: string | null;
    tin?: string | null;
    cr_number?: string | null;
    citizenship?: string | null;
    sex?: string | null;
    height?: string | number | null;
    weight?: string | number | null;
    place_of_birth?: string | null;
    birth_date?: string | null;
    civil_status?: string | null;
    occupation?: string | null;
    corporation_name?: string | null;
    sec_registration?: string | null;
    representative?: string | null;
    place_issued?: string | null;
    issue_date?: string | null;
    tax_mode?: string | null;
    taxable_amount?: string | number | null;
    basic_tax?: string | number | null;
    salary_tax?: string | number | null;
    additional_tax?: string | number | null;
    penalty?: string | number | null;
    interest?: string | number | null;
    total_amount?: string | number | null;
    account_id?: string | null;
};

function nullableText(value: unknown) {
    const text = String(value ?? "").trim();
    return text ? text : null;
}

function nullableNumber(value: unknown) {
    if (value === null || value === undefined || String(value).trim() === "") {
        return null;
    }

    const number = Number(value);
    if (!Number.isFinite(number)) {
        throw new Error("One of the CTC numeric fields contains an invalid number.");
    }

    return number;
}

function requiredNumber(value: unknown) {
    return nullableNumber(value) ?? 0;
}

function normalizeCTCType(value: unknown) {
    const type = String(value ?? "").trim().toUpperCase();

    if (type === "INDIVIDUAL" || type === "CTC-I" || type === "CTCI") {
        return "INDIVIDUAL";
    }

    if (type === "CORPORATION" || type === "CORPORATE" || type === "CTC-C" || type === "CTCC") {
        return "CORPORATION";
    }

    return type || "INDIVIDUAL";
}

function normalizeDate(value: unknown) {
    const date = nullableText(value);
    return date || null;
}

export async function PUT(req: NextRequest) {
    let client;

    try {
        await authorize(req, MODULE_PATHS.DIPP, "edit");

        const body = await req.json();
        const transactionId = String(body.transaction_id ?? "").trim();
        const items = body.items as CTCItemInput[];

        if (!transactionId) {
            return NextResponse.json(
                { success: false, message: "Transaction ID is required." },
                { status: 400 }
            );
        }

        if (!Array.isArray(items) || items.length === 0) {
            return NextResponse.json(
                { success: false, message: "At least one CTC item is required." },
                { status: 400 }
            );
        }

        client = await pool.connect();
        await client.query("BEGIN");

        const transactionResult = await client.query(
            `
            SELECT
                dt.id,
                af.form_code
            FROM dipp_transactions dt
            INNER JOIN accountable_forms af
                ON af.id = dt.accountable_form_id
            WHERE dt.id = $1
            FOR UPDATE OF dt
            `,
            [transactionId]
        );

        if (transactionResult.rowCount === 0) {
            await client.query("ROLLBACK");
            return NextResponse.json(
                { success: false, message: "Transaction not found." },
                { status: 404 }
            );
        }

        const formCode = String(transactionResult.rows[0].form_code ?? "")
            .trim()
            .toUpperCase();

        const allowedCTCForms = [
            "CTC",
            "CTC-I",
            "CTC-C",
            "CTCI",
            "CTCC",
            "CTC-INDIVIDUAL",
            "CTC-CORPORATION",
            "CTC INDIVIDUAL",
            "CTC CORPORATION",
        ];

        if (!allowedCTCForms.includes(formCode)) {
            await client.query("ROLLBACK");
            return NextResponse.json(
                { success: false, message: "This transaction is not a CTC receipt." },
                { status: 400 }
            );
        }

        const existingResult = await client.query(
            `
            SELECT id, account_id
            FROM dipp_ctc_items
            WHERE transaction_id = $1
            `,
            [transactionId]
        );

        const existingIds = new Set(
            existingResult.rows.map((row: { id: string }) => String(row.id))
        );

        // New CTC rows inherit the transaction's existing account mapping
        // when the editable table does not expose account_id.
        const defaultAccountId =
            existingResult.rows.find((row: any) => row.account_id)?.account_id ?? null;

        const submittedIds = items
            .map((item) => String(item.id ?? "").trim())
            .filter(Boolean);

        for (const submittedId of submittedIds) {
            if (!existingIds.has(submittedId)) {
                throw new Error("A submitted CTC item does not belong to this transaction.");
            }
        }

        // Remove rows deleted from the editable CTC table.
        if (submittedIds.length > 0) {
            await client.query(
                `
                DELETE FROM dipp_ctc_items
                WHERE transaction_id = $1
                  AND NOT (id = ANY($2::uuid[]))
                `,
                [transactionId, submittedIds]
            );
        } else {
            await client.query(
                `DELETE FROM dipp_ctc_items WHERE transaction_id = $1`,
                [transactionId]
            );
        }

        const savedIds: string[] = [];

        for (const item of items) {
            const basicTax = requiredNumber(item.basic_tax);
            const salaryTax = requiredNumber(item.salary_tax);
            const additionalTax = requiredNumber(item.additional_tax);
            const penalty = requiredNumber(item.penalty);
            const interest = requiredNumber(item.interest);

            const totalAmount =
                basicTax +
                salaryTax +
                additionalTax +
                penalty +
                interest;

            const values = [
                normalizeCTCType(item.ctc_type),
                nullableText(item.full_name),
                nullableText(item.address),
                nullableText(item.tin),
                nullableText(item.cr_number),
                nullableText(item.citizenship),
                nullableText(item.sex),
                nullableText(item.height),
                nullableText(item.weight),
                nullableText(item.place_of_birth),
                normalizeDate(item.birth_date),
                nullableText(item.civil_status),
                nullableText(item.occupation),
                nullableText(item.corporation_name),
                nullableText(item.sec_registration),
                nullableText(item.representative),
                nullableText(item.place_issued),
                normalizeDate(item.issue_date),
                nullableText(item.tax_mode),
                nullableNumber(item.taxable_amount),
                basicTax,
                salaryTax,
                additionalTax,
                penalty,
                interest,
                totalAmount,
            ];

            const itemId = String(item.id ?? "").trim();

            if (itemId) {
                const updated = await client.query(
                    `
                    UPDATE dipp_ctc_items
                    SET
                        ctc_type = $1,
                        full_name = $2,
                        address = $3,
                        tin = $4,
                        cr_number = $5,
                        citizenship = $6,
                        sex = $7,
                        height = $8,
                        weight = $9,
                        place_of_birth = $10,
                        birth_date = $11,
                        civil_status = $12,
                        occupation = $13,
                        corporation_name = $14,
                        sec_registration = $15,
                        representative = $16,
                        place_issued = $17,
                        issue_date = $18,
                        tax_mode = $19,
                        taxable_amount = $20,
                        basic_tax = $21,
                        salary_tax = $22,
                        additional_tax = $23,
                        penalty = $24,
                        interest = $25,
                        total_amount = $26,
                        updated_at = NOW()
                    WHERE id = $27
                      AND transaction_id = $28
                    RETURNING id
                    `,
                    [...values, itemId, transactionId]
                );

                if (updated.rowCount === 0) {
                    throw new Error("Unable to update a CTC item. Please refresh and try again.");
                }

                savedIds.push(String(updated.rows[0].id));
            } else {
                const inserted = await client.query(
                    `
                    INSERT INTO dipp_ctc_items (
                        transaction_id,
                        ctc_type,
                        full_name,
                        address,
                        tin,
                        cr_number,
                        citizenship,
                        sex,
                        height,
                        weight,
                        place_of_birth,
                        birth_date,
                        civil_status,
                        occupation,
                        corporation_name,
                        sec_registration,
                        representative,
                        place_issued,
                        issue_date,
                        tax_mode,
                        taxable_amount,
                        basic_tax,
                        salary_tax,
                        additional_tax,
                        penalty,
                        interest,
                        total_amount,
                        account_id
                    )
                    VALUES (
                        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                        $11, $12, $13, $14, $15, $16, $17, $18, $19,
                        $20, $21, $22, $23, $24, $25, $26, $27, $28
                    )
                    RETURNING id
                    `,
                    [transactionId, ...values, item.account_id ?? defaultAccountId]
                );

                savedIds.push(String(inserted.rows[0].id));
            }
        }

        const totalResult = await client.query(
            `
            SELECT COALESCE(SUM(total_amount), 0) AS grand_total
            FROM dipp_ctc_items
            WHERE transaction_id = $1
            `,
            [transactionId]
        );

        const grandTotal = Number(totalResult.rows[0].grand_total ?? 0);

        await client.query(
            `
            UPDATE dipp_transactions
            SET grand_total = $1
            WHERE id = $2
            `,
            [grandTotal, transactionId]
        );

        const refreshedItems = await client.query(
            `
            SELECT *
            FROM dipp_ctc_items
            WHERE transaction_id = $1
            ORDER BY created_at, id
            `,
            [transactionId]
        );

        await client.query("COMMIT");

        return NextResponse.json({
            success: true,
            message: "CTC items updated successfully.",
            items: refreshedItems.rows,
            grand_total: grandTotal,
        });
    } catch (error: any) {
        if (client) {
            try {
                await client.query("ROLLBACK");
            } catch {
                // Ignore rollback errors and return the original error.
            }
        }

        console.error("CTC ITEMS UPDATE ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: error.message || "Unable to update CTC items.",
            },
            { status: 500 }
        );
    } finally {
        client?.release();
    }
}
