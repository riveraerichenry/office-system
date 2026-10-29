import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { randomUUID } from "crypto";
import type { PoolClient } from "pg";

type DepositCheckInput = {
  checkType?: string;
  checkNumber?: string;
  checkDate?: string;
  bankName?: string;
  amount?: number | string;
  remarks?: string | null;
};

type CashDenominationInput = {
  denomination?: number | string;
  quantity?: number | string;
};

type DepositRequest = {
  consolidated_rcd_id?: string;
  rcd_number?: string;
  bank_id?: string;
  bank_account_id?: string;
  fund_source_id?: string | null;
  deposit_date?: string;
  reference_number?: string | null;
  total_cash?: number | string;
  total_amount?: number | string;
  cash_denominations?: CashDenominationInput[];
  checks?: DepositCheckInput[];
  remarks?: string | null;
};

const toCents = (value: unknown) => Math.round(Number(value ?? 0) * 100);

export async function GET(req: NextRequest) {
  try {
    const consolidatedRcdId = req.nextUrl.searchParams.get("consolidated_rcd_id")?.trim();

    // Detailed lookup used by the deposited-row View / Reprint action.
    if (consolidatedRcdId) {
      const headerResult = await pool.query(
        `
          SELECT
            dt.id,
            dt.consolidated_rcd_id,
            dt.rcd_number,
            dt.bank_id,
            dt.bank_account_id,
            dt.fund_source_id,
            dt.deposit_date,
            dt.reference_number,
            dt.total_amount,
            dt.status,
            dt.remarks,
            dt.created_at,
            b.bank_name,
            ba.account_name,
            ba.account_number,
            ba.account_code
          FROM deposit_transaction dt
          LEFT JOIN banks b ON b.id = dt.bank_id
          LEFT JOIN bank_accounts ba ON ba.id = dt.bank_account_id
          WHERE dt.consolidated_rcd_id = $1
          ORDER BY dt.created_at DESC
          LIMIT 1
        `,
        [consolidatedRcdId]
      );

      if (headerResult.rowCount === 0) {
        return NextResponse.json(
          { success: false, error: "No deposit record was found for this Consolidated RCD." },
          { status: 404 }
        );
      }

      const deposit = headerResult.rows[0];
      const itemsResult = await pool.query(
        `
          SELECT id, item_type, amount, check_type, check_number, check_date,
                 issuing_bank, check_remarks, remarks
          FROM deposit_transaction_items
          WHERE deposit_transaction_id = $1
          ORDER BY created_at ASC, id ASC
        `,
        [deposit.id]
      );

      const denominationResult = await pool.query(
        `
          SELECT denomination, quantity, subtotal
          FROM deposit_cash_denominations
          WHERE deposit_transaction_id = $1
          ORDER BY denomination DESC
        `,
        [deposit.id]
      );

      const cashDenominations = denominationResult.rows;
      const items = itemsResult.rows;
      const totalCash = items
        .filter((item) => String(item.item_type).toUpperCase() === "CASH")
        .reduce((sum, item) => sum + Number(item.amount || 0), 0);
      const totalChecks = items
        .filter((item) => String(item.item_type).toUpperCase() === "CHECK")
        .reduce((sum, item) => sum + Number(item.amount || 0), 0);

      return NextResponse.json({
        success: true,
        deposit: {
          ...deposit,
          total_cash: totalCash,
          total_checks: totalChecks,
          cash_denominations: cashDenominations,
          items,
        },
      });
    }

    const result = await pool.query(`
      SELECT
        dt.id,
        dt.consolidated_rcd_id,
        dt.rcd_number,
        dt.bank_id,
        dt.bank_account_id,
        dt.fund_source_id,
        dt.deposit_date,
        dt.reference_number,
        dt.total_amount,
        dt.status,
        dt.remarks,
        dt.created_at,
        COALESCE(items.item_count, 0)::int AS item_count,
        COALESCE(items.total_cash, 0)::numeric AS total_cash,
        COALESCE(items.total_checks, 0)::numeric AS total_checks
      FROM deposit_transaction dt
      LEFT JOIN (
        SELECT
          deposit_transaction_id,
          COUNT(*) AS item_count,
          COALESCE(SUM(amount) FILTER (WHERE item_type = 'CASH'), 0) AS total_cash,
          COALESCE(SUM(amount) FILTER (WHERE item_type = 'CHECK'), 0) AS total_checks
        FROM deposit_transaction_items
        GROUP BY deposit_transaction_id
      ) items ON items.deposit_transaction_id = dt.id
      ORDER BY dt.created_at DESC
    `);

    return NextResponse.json({ success: true, data: result.rows });
  } catch (error: unknown) {
    console.error("GET deposit transactions error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to load deposit transactions.",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  let client: PoolClient | null = null;
  let transactionStarted = false;

  try {
    const body = (await req.json()) as DepositRequest;

    const consolidatedRcdId = body.consolidated_rcd_id?.trim();
    const requestedRcdNumber = body.rcd_number?.trim();
    const bankId = body.bank_id?.trim();
    const bankAccountId = body.bank_account_id?.trim();
    const depositDate = body.deposit_date?.trim();
    const totalCashCents = toCents(body.total_cash);
    const requestedTotalCents = toCents(body.total_amount);
    const checks = Array.isArray(body.checks) ? body.checks : [];
    const cashDenominations = Array.isArray(body.cash_denominations)
      ? body.cash_denominations
      : [];

    // Only denominations supported by the DepositFormModal are accepted.
    const allowedDenominationsCents = new Set([100000, 50000, 20000, 10000, 5000, 2000, 1000, 500, 100, 25]);
    const seenDenominations = new Set<number>();
    let denominationTotalCents = 0;

    for (let index = 0; index < cashDenominations.length; index += 1) {
      const item = cashDenominations[index];
      const denominationCents = toCents(item.denomination);
      const quantity = Number(item.quantity);

      if (
        !allowedDenominationsCents.has(denominationCents) ||
        !Number.isSafeInteger(quantity) ||
        quantity < 0 ||
        seenDenominations.has(denominationCents)
      ) {
        return NextResponse.json(
          { success: false, error: `Cash denomination row #${index + 1} is invalid or duplicated.` },
          { status: 400 }
        );
      }

      seenDenominations.add(denominationCents);
      denominationTotalCents += denominationCents * quantity;
    }

    if (totalCashCents > 0 && cashDenominations.length === 0) {
      return NextResponse.json(
        { success: false, error: "Cash denomination quantities are required when a cash amount is entered." },
        { status: 400 }
      );
    }

    if (denominationTotalCents !== totalCashCents) {
      return NextResponse.json(
        { success: false, error: "The cash denomination total does not match total_cash. Please review the denomination quantities." },
        { status: 400 }
      );
    }

    if (!consolidatedRcdId) {
      return NextResponse.json(
        { success: false, error: "Consolidated RCD ID is required." },
        { status: 400 }
      );
    }
    if (!requestedRcdNumber) {
      return NextResponse.json(
        { success: false, error: "RCD number is required." },
        { status: 400 }
      );
    }
    if (!bankId) {
      return NextResponse.json(
        { success: false, error: "Please select a bank." },
        { status: 400 }
      );
    }
    if (!bankAccountId) {
      return NextResponse.json(
        { success: false, error: "Please select a bank account." },
        { status: 400 }
      );
    }
    if (!depositDate || !/^\d{4}-\d{2}-\d{2}$/.test(depositDate)) {
      return NextResponse.json(
        { success: false, error: "A valid deposit date is required." },
        { status: 400 }
      );
    }
    if (totalCashCents < 0 || requestedTotalCents <= 0) {
      return NextResponse.json(
        { success: false, error: "Deposit amounts must be valid and greater than zero." },
        { status: 400 }
      );
    }

    let totalChecksCents = 0;
    for (let index = 0; index < checks.length; index += 1) {
      const check = checks[index];
      const checkType = String(check.checkType ?? "").trim().toUpperCase();
      const checkNumber = String(check.checkNumber ?? "").trim();
      const checkDate = String(check.checkDate ?? "").trim();
      const issuingBank = String(check.bankName ?? "").trim();
      const amountCents = toCents(check.amount);

      if (
        !["ON_US", "LOCAL"].includes(checkType) ||
        !checkNumber ||
        !checkDate ||
        !/^\d{4}-\d{2}-\d{2}$/.test(checkDate) ||
        !issuingBank ||
        amountCents <= 0
      ) {
        return NextResponse.json(
          {
            success: false,
            error: `Check #${index + 1} is incomplete or has an invalid amount.`,
          },
          { status: 400 }
        );
      }

      totalChecksCents += amountCents;
    }

    const computedTotalCents = totalCashCents + totalChecksCents;
    if (computedTotalCents !== requestedTotalCents) {
      return NextResponse.json(
        {
          success: false,
          error: "The total deposit amount does not equal cash plus checks. Please review the amounts.",
        },
        { status: 400 }
      );
    }

    if (totalCashCents === 0 && totalChecksCents === 0) {
      return NextResponse.json(
        { success: false, error: "Enter cash or at least one valid check." },
        { status: 400 }
      );
    }

    client = await pool.connect();
    await client.query("BEGIN");
    transactionStarted = true;

    // Lock the Consolidated RCD and read its authoritative data.
    const rcdResult = await client.query(
      `
      SELECT id, consolidated_no, status, fund_source_id, total_amount
      FROM rcd_consolidated_transaction
      WHERE id = $1
      FOR UPDATE
      `,
      [consolidatedRcdId]
    );

    if (rcdResult.rowCount === 0) {
      await client.query("ROLLBACK");
      transactionStarted = false;
      return NextResponse.json(
        { success: false, error: "Consolidated RCD not found." },
        { status: 404 }
      );
    }

    const rcd = rcdResult.rows[0];
    const authoritativeRcdNumber = String(rcd.consolidated_no ?? "").trim();
    const fundSourceId = rcd.fund_source_id ?? body.fund_source_id ?? null;
    const expectedAmountCents = toCents(rcd.total_amount);
    const excessCents = requestedTotalCents - expectedAmountCents;

    if (
      authoritativeRcdNumber &&
      requestedRcdNumber !== authoritativeRcdNumber
    ) {
      await client.query("ROLLBACK");
      transactionStarted = false;
      return NextResponse.json(
        {
          success: false,
          error: "The RCD number does not match the selected Consolidated RCD.",
        },
        { status: 400 }
      );
    }

    if (!fundSourceId) {
      await client.query("ROLLBACK");
      transactionStarted = false;
      return NextResponse.json(
        {
          success: false,
          error: "Fund source is missing for this Consolidated RCD.",
        },
        { status: 400 }
      );
    }

    if (expectedAmountCents <= 0) {
      await client.query("ROLLBACK");
      transactionStarted = false;
      return NextResponse.json(
        {
          success: false,
          error: "The Consolidated RCD amount must be greater than zero.",
        },
        { status: 400 }
      );
    }

    if (requestedTotalCents < expectedAmountCents) {
      await client.query("ROLLBACK");
      transactionStarted = false;
      return NextResponse.json(
        {
          success: false,
          error: `Insufficient deposit amount. The deposit must cover the Consolidated RCD amount of ${(expectedAmountCents / 100).toLocaleString("en-PH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}.`,
        },
        { status: 400 }
      );
    }

    // Allow an excess below ₱2.00; reject an excess of ₱2.00 or more.
    if (excessCents >= 200) {
      await client.query("ROLLBACK");
      transactionStarted = false;
      return NextResponse.json(
        {
          success: false,
          error: "The deposit exceeds the Consolidated RCD amount by ₱2.00 or more. Please adjust the cash or checks.",
        },
        { status: 400 }
      );
    }

    // Prevent duplicate deposits for the same Consolidated RCD.
    const existingDeposit = await client.query(
      `
      SELECT id
      FROM deposit_transaction
      WHERE consolidated_rcd_id = $1
      LIMIT 1
      `,
      [consolidatedRcdId]
    );

    if ((existingDeposit.rowCount ?? 0) > 0) {
      await client.query("ROLLBACK");
      transactionStarted = false;
      return NextResponse.json(
        {
          success: false,
          error: "This consolidated RCD already has a deposit transaction.",
        },
        { status: 409 }
      );
    }

    const depositId = randomUUID();

    const depositResult = await client.query(
      `
      INSERT INTO deposit_transaction (
        id,
        consolidated_rcd_id,
        rcd_number,
        bank_id,
        bank_account_id,
        fund_source_id,
        deposit_date,
        reference_number,
        total_amount,
        status,
        remarks,
        created_at,
        updated_at
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, 'DRAFT', $10, NOW(), NOW()
      )
      RETURNING *
      `,
      [
        depositId,
        consolidatedRcdId,
        authoritativeRcdNumber || requestedRcdNumber,
        bankId,
        bankAccountId,
        fundSourceId,
        depositDate,
        body.reference_number?.trim() || null,
        (requestedTotalCents / 100).toFixed(2),
        body.remarks?.trim() || null,
      ]
    );

    // Store the cash total as one CASH item; each check gets its own CHECK item.
    if (totalCashCents > 0) {
      await client.query(
        `
        INSERT INTO deposit_transaction_items (
          id,
          deposit_transaction_id,
          item_type,
          amount,
          check_type,
          check_number,
          check_date,
          issuing_bank,
          check_remarks,
          remarks,
          created_at
        )
        VALUES ($1, $2, 'CASH', $3, NULL, NULL, NULL, NULL, NULL, NULL, NOW())
        `,
        [randomUUID(), depositId, (totalCashCents / 100).toFixed(2)]
      );
    }

    // Persist denomination rows linked to the newly created deposit transaction.
    for (const item of cashDenominations) {
      const quantity = Number(item.quantity);
      if (quantity <= 0) continue;

      await client.query(
        `
        INSERT INTO deposit_cash_denominations (
          id,
          deposit_transaction_id,
          denomination,
          quantity,
          created_at
        )
        VALUES ($1, $2, $3, $4, NOW())
        `,
        [
          randomUUID(),
          depositId,
          Number(item.denomination).toFixed(2),
          quantity,
        ]
      );
    }

    for (const check of checks) {
      await client.query(
        `
        INSERT INTO deposit_transaction_items (
          id,
          deposit_transaction_id,
          item_type,
          amount,
          check_type,
          check_number,
          check_date,
          issuing_bank,
          check_remarks,
          remarks,
          created_at
        )
        VALUES ($1, $2, 'CHECK', $3, $4, $5, $6, $7, $8, NULL, NOW())
        `,
        [
          randomUUID(),
          depositId,
          (toCents(check.amount) / 100).toFixed(2),
          String(check.checkType).trim().toUpperCase(),
          String(check.checkNumber).trim(),
          String(check.checkDate).trim(),
          String(check.bankName).trim(),
          check.remarks?.trim() || null,
        ]
      );
    }

    // Update the exact Consolidated RCD row selected above. RETURNING verifies
    // that PostgreSQL actually changed the status before the transaction commits.
    const updatedRcdResult = await client.query(
      `
      UPDATE rcd_consolidated_transaction
      SET status = 'Deposited'
      WHERE id = $1
      RETURNING id, consolidated_no, status
      `,
      [consolidatedRcdId]
    );

    if (updatedRcdResult.rowCount !== 1) {
      throw new Error(
        `Deposit was not finalized: Consolidated RCD ${consolidatedRcdId} was not updated to Deposited.`
      );
    }

    const updatedRcd = updatedRcdResult.rows[0];
    if (String(updatedRcd.status).trim() !== "Deposited") {
      throw new Error(
        `Deposit was not finalized: expected RCD status 'Deposited' but PostgreSQL returned '${String(updatedRcd.status)}'.`
      );
    }

    // Commit deposit header, items, denominations, and RCD status together.
    await client.query("COMMIT");
    transactionStarted = false;

    return NextResponse.json(
      {
        success: true,
        message: "Deposit, items, and cash denominations saved. Consolidated RCD marked as Deposited.",
        data: {
          ...depositResult.rows[0],
          item_count: (totalCashCents > 0 ? 1 : 0) + checks.length,
          total_cash: (totalCashCents / 100).toFixed(2),
          total_checks: (totalChecksCents / 100).toFixed(2),
          consolidated_rcd_status: updatedRcd.status,
        },
        consolidated_rcd: updatedRcd,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (client && transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Deposit transaction rollback error:", rollbackError);
      }
    }

    console.error("POST deposit transaction error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create deposit transaction.",
      },
      { status: 500 }
    );
  } finally {
    client?.release();
  }
}
