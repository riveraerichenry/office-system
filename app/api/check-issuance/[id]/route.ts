import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { authorize } from "@/lib/authorize";
import { MODULE_PATHS } from "@/lib/module-paths";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    await authorize(request, MODULE_PATHS.DIPP, "view");

    const { id } = await params;

    const transactionResult = await pool.query(
      `
        SELECT
          t.id,
          t.check_number,
          t.dv_no,
          t.check_date,
          t.payee,
          t.payor,
          t.signatory_1,
          t.signatory_2,

          s1.full_name AS signatory_1_name,
          s1.position AS signatory_1_position,

          s2.full_name AS signatory_2_name,
          s2.position AS signatory_2_position,

          t.fund_source_id,
          COALESCE(fs.fund_name, 'Unassigned Fund Source')
            AS fund_source,

          COALESCE(b.bank_name, cbr.bank, '')
            AS bank_name,

          b.bank_code,
          COALESCE(cbr.account_number, '')
            AS account_number,

          t.total_amount,
          t.status,
          t.particulars,
          t.created_at

        FROM check_issuance_transaction t

        LEFT JOIN check_booklet_registration cbr
          ON cbr.id = t.booklet_id

        LEFT JOIN banks b
          ON b.id = cbr.bank_id

        LEFT JOIN fund_sources fs
          ON fs.id = t.fund_source_id

        LEFT JOIN signatories s1
          ON s1.id = t.signatory_1

        LEFT JOIN signatories s2
          ON s2.id = t.signatory_2

        WHERE t.id = $1
        LIMIT 1
      `,
      [id]
    );

    if (transactionResult.rowCount === 0) {
      return NextResponse.json(
        { success: false, error: "Check transaction not found." },
        { status: 404 }
      );
    }

    const itemsResult = await pool.query(
      `
        SELECT
          obr_no,
          dv_no,
          responsibility_center,
          account_code,
          payee_name,
          nature_of_payment,
          item_date,
          total_debit,
          total_wtax,
          other_deduction,
          retention_10_percent,
          wtax_1_percent,
          wtax_2_percent,
          wtax_3_percent,
          wtax_4_percent,
          excavation_fees,
          advance_payment,
          liquidated_damages,
          accounts_payable,
          others,
          remarks

        FROM check_issuance_transaction_items

        WHERE transaction_id = $1
      `,
      [id]
    );

    return NextResponse.json({
      success: true,
      data: {
        ...transactionResult.rows[0],
        items: itemsResult.rows,
      },
    });
  } catch (error: unknown) {
    console.error("GET Check Issuance Details Error:", error);

    const message =
      error instanceof Error ? error.message : "";

    return NextResponse.json(
      {
        success: false,
        error:
          message === "FORBIDDEN"
            ? "You are not authorized to view this transaction."
            : "Failed to retrieve check details.",
      },
      { status: message === "FORBIDDEN" ? 403 : 500 }
    );
  }
}

// =====================================================
// UPDATE CHECK ISSUANCE
// =====================================================

export async function PUT(
  request: NextRequest,
  { params }: RouteContext
) {
  const client = await pool.connect();
  let transactionStarted = false;

  try {
    await authorize(request, MODULE_PATHS.DIPP, "edit");

    const { id } = await params;
    const body = await request.json();

    const {
      dv_no,
      check_date,
      payee,
      payor,
      signatory_1,
      signatory_2,
      fund_source_id,
      particulars,
      items,
    } = body;

    if (
      !dv_no?.trim() ||
      !check_date ||
      !payee?.trim() ||
      !signatory_1 ||
      !signatory_2 ||
      !fund_source_id ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Please complete all required fields.",
        },
        { status: 400 }
      );
    }

    if (signatory_1 === signatory_2) {
      return NextResponse.json(
        {
          success: false,
          error: "The two signatories must be different.",
        },
        { status: 400 }
      );
    }

    const totalAmount = items.reduce(
      (sum: number, item: Record<string, unknown>) => {
        return sum + Number(item.total_debit || 0);
      },
      0
    );

    if (
      !Number.isFinite(totalAmount) ||
      items.some(
        (item: Record<string, unknown>) =>
          !String(item.account_code || "").trim() ||
          !Number.isFinite(Number(item.total_debit)) ||
          Number(item.total_debit) <= 0
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Please check the account codes and debit amounts.",
        },
        { status: 400 }
      );
    }

    await client.query("BEGIN");
    transactionStarted = true;

    // Verify transaction exists and lock it.
    const existing = await client.query(
      `
        SELECT id
        FROM check_issuance_transaction
        WHERE id = $1
        FOR UPDATE
      `,
      [id]
    );

    if (existing.rowCount === 0) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return NextResponse.json(
        { success: false, error: "Transaction not found." },
        { status: 404 }
      );
    }

    // Verify both signatories.
    const signatoriesResult = await client.query(
      `
        SELECT id
        FROM signatories
        WHERE id = ANY($1::uuid[])
          AND is_active = TRUE
        FOR SHARE
      `,
      [[signatory_1, signatory_2]]
    );

    if (signatoriesResult.rowCount !== 2) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return NextResponse.json(
        {
          success: false,
          error: "One or both signatories are invalid or inactive.",
        },
        { status: 400 }
      );
    }

    // Update editable header fields only.
    await client.query(
      `
        UPDATE check_issuance_transaction
        SET
          dv_no = $2,
          check_date = $3,
          payee = $4,
          payor = $5,
          signatory_1 = $6,
          signatory_2 = $7,
          fund_source_id = $8,
          particulars = $9,
          total_amount = $10

        WHERE id = $1
      `,
      [
        id,
        dv_no.trim(),
        check_date,
        payee.trim(),
        payor?.trim() || null,
        signatory_1,
        signatory_2,
        fund_source_id,
        particulars?.trim() || null,
        totalAmount,
      ]
    );

    // Replace transaction items.
    await client.query(
      `
        DELETE FROM check_issuance_transaction_items
        WHERE transaction_id = $1
      `,
      [id]
    );

    for (const item of items) {
      await client.query(
        `
          INSERT INTO check_issuance_transaction_items (
            transaction_id,
            obr_no,
            dv_no,
            responsibility_center,
            account_code,
            payee_name,
            nature_of_payment,
            item_date,
            total_debit,
            total_wtax,
            other_deduction,
            retention_10_percent,
            wtax_1_percent,
            wtax_2_percent,
            wtax_3_percent,
            wtax_4_percent,
            excavation_fees,
            advance_payment,
            liquidated_damages,
            accounts_payable,
            others,
            remarks
          )
          VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8,
            $9, $10, $11, $12, $13, $14, $15,
            $16, $17, $18, $19, $20, $21, $22
          )
        `,
        [
          id,
          item.obr_no || null,
          dv_no.trim(),
          item.responsibility_center || null,
          item.account_code,
          item.payee_name || null,
          item.nature_of_payment || null,
          item.item_date || null,
          Number(item.total_debit || 0),
          Number(item.total_wtax || 0),
          Number(item.other_deduction || 0),
          Number(item.retention_10_percent || 0),
          Number(item.wtax_1_percent || 0),
          Number(item.wtax_2_percent || 0),
          Number(item.wtax_3_percent || 0),
          Number(item.wtax_4_percent || 0),
          Number(item.excavation_fees || 0),
          Number(item.advance_payment || 0),
          Number(item.liquidated_damages || 0),
          Number(item.accounts_payable || 0),
          Number(item.others || 0),
          item.remarks || null,
        ]
      );
    }

    await client.query("COMMIT");
    transactionStarted = false;

    return NextResponse.json({
      success: true,
      message: "Check issuance updated successfully.",
    });
  } catch (error: unknown) {
    if (transactionStarted) {
      await client.query("ROLLBACK");
    }

    console.error("PUT Check Issuance Error:", error);

    const message =
      error instanceof Error ? error.message : "";

    return NextResponse.json(
      {
        success: false,
        error:
          message === "FORBIDDEN"
            ? "You are not authorized to edit this transaction."
            : "Failed to update check issuance.",
      },
      { status: message === "FORBIDDEN" ? 403 : 500 }
    );
  } finally {
    client.release();
  }
}