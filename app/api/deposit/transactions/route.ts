import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import type { PoolClient } from "pg";
import { pool } from "@/lib/db";

type CheckInput = {
  checkType: "ON_US" | "LOCAL";
  checkNumber: string;
  checkDate: string;
  bankName: string;
  amount: number | string;
  remarks?: string;
};

function toCents(value: unknown): number | null {
  const text = String(value ?? "").trim();

  if (!/^\d+(\.\d{1,2})?$/.test(text)) {
    return null;
  }

  const [whole, fraction = ""] = text.split(".");
  const cents =
    Number(whole) * 100 + Number(fraction.padEnd(2, "0"));

  return Number.isSafeInteger(cents) ? cents : null;
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

export async function POST(req: NextRequest) {
  let client: PoolClient | undefined;
  let transactionStarted = false;

  try {
    const body = await req.json();

    const rcdNumber = String(body.rcd_number ?? "").trim();
    const depositDate = String(body.deposit_date ?? "");
    const bankId = String(body.bank_id ?? "");
    const bankAccountId = String(body.bank_account_id ?? "");

    const referenceNumber =
      String(body.reference_number ?? "").trim() || null;

    const remarks = String(body.remarks ?? "").trim() || null;

    if (!rcdNumber) {
      return NextResponse.json(
        { success: false, message: "RCD number is required." },
        { status: 400 }
      );
    }

    if (!isValidDate(depositDate)) {
      return NextResponse.json(
        { success: false, message: "A valid deposit date is required." },
        { status: 400 }
      );
    }

    if (!bankId || !bankAccountId) {
      return NextResponse.json(
        {
          success: false,
          message: "Select a bank and bank account.",
        },
        { status: 400 }
      );
    }

    const cashCents = toCents(body.total_cash);

    if (cashCents === null) {
      return NextResponse.json(
        { success: false, message: "Invalid cash amount." },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.checks)) {
      return NextResponse.json(
        { success: false, message: "Checks must be an array." },
        { status: 400 }
      );
    }

    const checks: {
      checkType: "ON_US" | "LOCAL";
      checkNumber: string;
      checkDate: string;
      bankName: string;
      amountCents: number;
      remarks: string | null;
    }[] = [];

    for (const check of body.checks as CheckInput[]) {
      const checkType = check.checkType;
      const checkNumber = String(check.checkNumber ?? "").trim();
      const checkDate = String(check.checkDate ?? "");
      const bankName = String(check.bankName ?? "").trim();
      const amountCents = toCents(check.amount);

      const checkRemarks =
        String(check.remarks ?? "").trim() || null;

      if (
        !["ON_US", "LOCAL"].includes(checkType) ||
        !checkNumber ||
        !isValidDate(checkDate) ||
        !bankName ||
        amountCents === null ||
        amountCents <= 0
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Every check must have a valid type, number, date, issuing bank, and positive amount.",
          },
          { status: 400 }
        );
      }

      checks.push({
        checkType,
        checkNumber,
        checkDate,
        bankName,
        amountCents,
        remarks: checkRemarks,
      });
    }

    const totalCents =
      cashCents +
      checks.reduce((sum, check) => sum + check.amountCents, 0);

    if (!Number.isSafeInteger(totalCents) || totalCents <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "The deposit total must be greater than zero.",
        },
        { status: 400 }
      );
    }

    // Acquire a typed PostgreSQL client.
    client = await pool.connect();

    await client.query("BEGIN");
    transactionStarted = true;

    // Verify the selected bank account and obtain its fund source.
    const accountResult = await client.query(
      `
        SELECT
          id,
          bank_id,
          fund_source_id,
          is_active
        FROM bank_accounts
        WHERE id = $1
        FOR UPDATE
      `,
      [bankAccountId]
    );

    const account = accountResult.rows[0];

    if (!account) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return NextResponse.json(
        { success: false, message: "Bank account not found." },
        { status: 404 }
      );
    }

    if (
      account.bank_id !== bankId ||
      !account.is_active ||
      !account.fund_source_id
    ) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return NextResponse.json(
        {
          success: false,
          message:
            "The selected bank account is inactive, belongs to another bank, or has no fund source assigned.",
        },
        { status: 400 }
      );
    }

    const fundResult = await client.query(
      `
        SELECT id
        FROM fund_sources
        WHERE id = $1
          AND is_active = TRUE
      `,
      [account.fund_source_id]
    );

    if (fundResult.rowCount === 0) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return NextResponse.json(
        {
          success: false,
          message:
            "The account's fund source is inactive or unavailable.",
        },
        { status: 400 }
      );
    }

    // 1. Insert the deposit header.
    const transactionId = randomUUID();

    await client.query(
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
          remarks
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
        )
      `,
      [
        transactionId,
        body.consolidated_rcd_id || null,
        rcdNumber,
        bankId,
        bankAccountId,
        account.fund_source_id,
        depositDate,
        referenceNumber,
        (totalCents / 100).toFixed(2),
        "DRAFT",
        remarks,
      ]
    );

    // 2. Insert cash as one item, without denominations.
    let itemCount = 0;

    if (cashCents > 0) {
      await client.query(
        `
          INSERT INTO deposit_transaction_items (
            id,
            deposit_transaction_id,
            item_type,
            amount
          )
          VALUES ($1, $2, $3, $4)
        `,
        [
          randomUUID(),
          transactionId,
          "CASH",
          (cashCents / 100).toFixed(2),
        ]
      );

      itemCount++;
    }

    // 3. Insert each check as a separate item.
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
            check_remarks
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `,
        [
          randomUUID(),
          transactionId,
          "CHECK",
          (check.amountCents / 100).toFixed(2),
          check.checkType,
          check.checkNumber,
          check.checkDate,
          check.bankName,
          check.remarks,
        ]
      );

      itemCount++;
    }

    await client.query("COMMIT");
    transactionStarted = false;

    return NextResponse.json(
      {
        success: true,
        message: "Deposit saved successfully.",
        transaction: {
          id: transactionId,
          rcd_number: rcdNumber,
          total_amount: (totalCents / 100).toFixed(2),
          item_count: itemCount,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (client && transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Deposit rollback failed:", rollbackError);
      }

      transactionStarted = false;
    }

    console.error("POST /api/deposit/transactions:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to save deposit.",
        error:
          error instanceof Error
            ? error.message
            : "An unexpected database error occurred.",
      },
      { status: 500 }
    );
  } finally {
    client?.release();
  }
}