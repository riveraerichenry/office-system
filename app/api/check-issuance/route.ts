import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import type { PoolClient } from "pg";

import { authorize } from "@/lib/authorize";
import { MODULE_PATHS } from "@/lib/module-paths";

export const dynamic = "force-dynamic";

/* =========================================================
   GET - ISSUED CHECKS
========================================================= */
export async function GET(request: NextRequest) {
  try {
    await authorize(request, MODULE_PATHS.DIPP, "view");

    const result = await pool.query(`
      SELECT
        t.id,
        t.check_number,
        t.check_date AS issue_date,
        t.payee,
        COALESCE(fs.fund_name, 'Unassigned Fund Source')
          AS fund_source,
        COALESCE(b.bank_name, cbr.bank, '') AS bank_name,
        b.bank_code AS bank_code,
        COALESCE(cbr.account_number, '') AS account_number,
        t.total_amount AS amount,
        t.status,
        t.booklet_number
      FROM check_issuance_transaction t
      LEFT JOIN check_booklet_registration cbr
        ON cbr.id = t.booklet_id
      LEFT JOIN banks b
        ON b.id = cbr.bank_id
      LEFT JOIN fund_sources fs
        ON fs.id = t.fund_source_id
      ORDER BY
        t.check_date DESC NULLS LAST,
        t.created_at DESC NULLS LAST,
        t.id DESC
    `);

    return NextResponse.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error: unknown) {
    console.error("GET /api/check-issuance error:", error);

    if (
      error instanceof Error &&
      error.message === "FORBIDDEN"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "You do not have permission to view issued checks.",
          data: [],
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve issued checks.",
        data: [],
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   TYPES
========================================================= */

type CheckItemInput = {
  obr_no?: string;
  responsibility_center?: string;
  account_code?: string;
  payee_name?: string;
  nature_of_payment?: string;
  item_date?: string;
  total_debit?: number | string;
  total_wtax?: number | string;
  other_deduction?: number | string;
  retention_10_percent?: number | string;
  wtax_1_percent?: number | string;
  wtax_2_percent?: number | string;
  wtax_3_percent?: number | string;
  wtax_4_percent?: number | string;
  excavation_fees?: number | string;
  advance_payment?: number | string;
  liquidated_damages?: number | string;
  accounts_payable?: number | string;
  others?: number | string;
  remarks?: string;
};

type CheckIssuanceInput = {
  booklet_id?: string;
  check_number?: string;
  dv_no?: string;
  check_date?: string;
  payee?: string;
  payor?: string;
  signatory_1?: string;
  signatory_2?: string;
  particulars?: string;
  items?: CheckItemInput[];
};

class ApiError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/* =========================================================
   HELPERS
========================================================= */

const monetaryFields = [
  "total_debit",
  "total_wtax",
  "other_deduction",
  "retention_10_percent",
  "wtax_1_percent",
  "wtax_2_percent",
  "wtax_3_percent",
  "wtax_4_percent",
  "excavation_fees",
  "advance_payment",
  "liquidated_damages",
  "accounts_payable",
  "others",
] as const;

function cleanText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function moneyValue(value: unknown, fieldName: string): number {
  const amount = Number(value ?? 0);

  if (!Number.isFinite(amount) || amount < 0) {
    throw new ApiError(
      `${fieldName} must be a valid nonnegative amount.`
    );
  }

  return amount;
}

function moneyString(value: unknown, fieldName: string): string {
  return moneyValue(value, fieldName).toFixed(2);
}

function getCheckNumberParts(value: string) {
  if (!/^\d+$/.test(value)) {
    throw new ApiError(
      "The booklet's current check number must contain numeric digits only.",
      409
    );
  }

  const normalized = value.replace(/^0+/, "") || "0";

  return {
    number: normalized,
    width: value.length,
  };
}

function incrementNumericString(value: string): string {
  const digits = value.split("");
  let carry = 1;

  for (let i = digits.length - 1; i >= 0 && carry > 0; i--) {
    const digit = Number(digits[i]) + carry;

    if (digit >= 10) {
      digits[i] = "0";
      carry = 1;
    } else {
      digits[i] = String(digit);
      carry = 0;
    }
  }

  if (carry > 0) {
    digits.unshift("1");
  }

  return digits.join("");
}

function nextCheckNumber(value: string): string {
  const current = getCheckNumberParts(value);

  return incrementNumericString(current.number).padStart(
    current.width,
    "0"
  );
}

function compareNumericStrings(a: string, b: string): number {
  const normalizedA = a.replace(/^0+/, "") || "0";
  const normalizedB = b.replace(/^0+/, "") || "0";

  if (normalizedA.length > normalizedB.length) return 1;
  if (normalizedA.length < normalizedB.length) return -1;

  if (normalizedA > normalizedB) return 1;
  if (normalizedA < normalizedB) return -1;

  return 0;
}

function getErrorCode(error: unknown): string | undefined {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error
  ) {
    return String((error as { code?: unknown }).code ?? "");
  }

  return undefined;
}

/* =========================================================
   POST - ISSUE CHECK
========================================================= */

export async function POST(request: NextRequest) {
  let client: PoolClient | null = null;
  let transactionStarted = false;

  try {
    // AUTHORIZATION
    const user = await authorize(
      request,
      MODULE_PATHS.DIPP,
      "add"
    );

    const createdBy = user.id;

    if (!createdBy) {
      throw new ApiError(
        "Unable to identify the currently logged-in user.",
        401
      );
    }

    const body = (await request.json()) as CheckIssuanceInput;

    const bookletId = cleanText(body.booklet_id);
    const requestedCheckNumber = cleanText(body.check_number);
    const dvNo = cleanText(body.dv_no);
    const checkDate = cleanText(body.check_date);
    const payee = cleanText(body.payee);
    const payor = cleanText(body.payor);
    const signatory1 = cleanText(body.signatory_1);
    const signatory2 = cleanText(body.signatory_2);
    const particulars = cleanText(body.particulars);
    const items = Array.isArray(body.items) ? body.items : [];

    // BASIC VALIDATION
    if (!bookletId) {
      throw new ApiError("Please select a check booklet.");
    }

    if (!dvNo) {
      throw new ApiError("DV number is required.");
    }

    if (!checkDate || !/^\d{4}-\d{2}-\d{2}$/.test(checkDate)) {
      throw new ApiError("Please provide a valid check date.");
    }

    if (!payee) {
      throw new ApiError("Payee is required.");
    }

    if (!signatory1 || !signatory2) {
      throw new ApiError("Both signatories are required.");
    }

    if (signatory1 === signatory2) {
      throw new ApiError("The two signatories must be different.");
    }

    if (items.length === 0) {
      throw new ApiError("At least one transaction item is required.");
    }

    // VALIDATE AND NORMALIZE ITEMS
    const normalizedItems = items.map((item, index) => {
      const rowNumber = index + 1;

      const obrNo = cleanText(item.obr_no);
      const responsibilityCenter = cleanText(
        item.responsibility_center
      );
      const accountCode = cleanText(item.account_code);
      const payeeName = cleanText(item.payee_name);
      const natureOfPayment = cleanText(item.nature_of_payment);
      const itemDate = cleanText(item.item_date);

      if (!obrNo) {
        throw new ApiError(
          `Item ${rowNumber}: OBR number is required.`
        );
      }

      if (!accountCode) {
        throw new ApiError(
          `Item ${rowNumber}: Account code is required.`
        );
      }

      if (!itemDate || !/^\d{4}-\d{2}-\d{2}$/.test(itemDate)) {
        throw new ApiError(
          `Item ${rowNumber}: Invalid item date.`
        );
      }

      const totalDebit = moneyValue(
        item.total_debit,
        `Item ${rowNumber} total debit`
      );

      if (totalDebit <= 0) {
        throw new ApiError(
          `Item ${rowNumber}: Total debit must be greater than zero.`
        );
      }

      const amounts = monetaryFields.map((field) =>
        moneyString(item[field], `Item ${rowNumber} ${field}`)
      );

      return {
        obr_no: obrNo,
        responsibility_center: responsibilityCenter || null,
        account_code: accountCode,
        payee_name: payeeName || null,
        nature_of_payment: natureOfPayment || null,
        item_date: itemDate,
        amounts,
        remarks: cleanText(item.remarks) || null,
        total_debit: totalDebit,
      };
    });

    // CALCULATE TOTAL
    const grandTotal = normalizedItems.reduce(
      (sum, item) => sum + item.total_debit,
      0
    );

    if (
      !Number.isFinite(grandTotal) ||
      grandTotal <= 0 ||
      grandTotal >= 10_000_000_000_000_000
    ) {
      throw new ApiError("Invalid grand total.");
    }

    const totalAmount = grandTotal.toFixed(2);

    client = await pool.connect();

    await client.query("BEGIN");
    transactionStarted = true;

    // LOCK BOOKLET
    const bookletResult = await client.query(
      `
        SELECT
          id,
          booklet_number,
          beginning_check_no,
          ending_check_no,
          current_check_no,
          total_checks,
          issued_checks,
          remaining_checks,
          status,
          fund_source_id
        FROM check_booklet_registration
        WHERE id = $1
        FOR UPDATE
      `,
      [bookletId]
    );

    if (bookletResult.rowCount !== 1) {
      throw new ApiError(
        "The selected check booklet was not found.",
        404
      );
    }

    const booklet = bookletResult.rows[0];

    if (String(booklet.status).toLowerCase() !== "active") {
      throw new ApiError(
        "The selected booklet is not active.",
        409
      );
    }

    const remainingChecks = Number(booklet.remaining_checks);
    const issuedChecks = Number(booklet.issued_checks);

    if (
      !Number.isInteger(remainingChecks) ||
      remainingChecks <= 0
    ) {
      throw new ApiError(
        "The selected booklet has no remaining checks.",
        409
      );
    }

    if (!booklet.current_check_no) {
      throw new ApiError(
        "The selected booklet does not have a current check number.",
        409
      );
    }

    const currentCheckNumber = String(
      booklet.current_check_no
    ).trim();

    if (
      requestedCheckNumber &&
      requestedCheckNumber !== currentCheckNumber
    ) {
      throw new ApiError(
        `The check number has changed. The current available check is ${currentCheckNumber}. Please refresh and try again.`,
        409
      );
    }

    const currentParts = getCheckNumberParts(currentCheckNumber);
    const endingParts = getCheckNumberParts(
      String(booklet.ending_check_no).trim()
    );

    if (
      compareNumericStrings(
        currentParts.number,
        endingParts.number
      ) > 0
    ) {
      throw new ApiError(
        "The booklet's current check number is beyond its registered range.",
        409
      );
    }

    // VALIDATE SIGNATORIES
    const signatoryResult = await client.query(
      `
        SELECT id
        FROM signatories
        WHERE id = ANY($1::uuid[])
          AND is_active = TRUE
        FOR SHARE
      `,
      [[signatory1, signatory2]]
    );

    if (signatoryResult.rowCount !== 2) {
      throw new ApiError(
        "One or both selected signatories do not exist or are inactive.",
        400
      );
    }

    // INSERT TRANSACTION HEADER WITH CREATED_BY
    const transactionResult = await client.query(
      `
        INSERT INTO check_issuance_transaction (
          booklet_id,
          booklet_number,
          check_number,
          dv_no,
          check_date,
          payee,
          payor,
          signatory_1,
          signatory_2,
          fund_source_id,
          total_amount,
          status,
          particulars,
          created_by
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11, 'Issued', $12, $13
        )
        RETURNING
          id,
          booklet_id,
          booklet_number,
          check_number,
          dv_no,
          check_date,
          payee,
          total_amount,
          status,
          created_by,
          created_at
      `,
      [
        booklet.id,
        booklet.booklet_number,
        currentCheckNumber,
        dvNo,
        checkDate,
        payee,
        payor || null,
        signatory1,
        signatory2,
        booklet.fund_source_id,
        totalAmount,
        particulars || null,
        createdBy,
      ]
    );

    const transaction = transactionResult.rows[0];

    // INSERT TRANSACTION ITEMS
    for (const item of normalizedItems) {
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
          transaction.id,
          item.obr_no,
          dvNo,
          item.responsibility_center,
          item.account_code,
          item.payee_name,
          item.nature_of_payment,
          item.item_date,
          ...item.amounts,
          item.remarks,
        ]
      );
    }

    // UPDATE BOOKLET COUNTERS
    const newIssuedChecks = issuedChecks + 1;
    const newRemainingChecks = remainingChecks - 1;
    const isExhausted = newRemainingChecks === 0;

    const nextNumber = isExhausted
      ? null
      : nextCheckNumber(currentCheckNumber);

    if (
      !isExhausted &&
      compareNumericStrings(
        nextNumber!,
        endingParts.number
      ) > 0
    ) {
      throw new ApiError(
        "The booklet counters do not match the registered check-number range.",
        409
      );
    }

    const bookletUpdate = await client.query(
      `
        UPDATE check_booklet_registration
        SET
          current_check_no = $2,
          issued_checks = $3,
          remaining_checks = $4,
          status = $5,
          updated_at = NOW()
        WHERE id = $1
        RETURNING
          id,
          booklet_number,
          current_check_no,
          issued_checks,
          remaining_checks,
          status
      `,
      [
        booklet.id,
        nextNumber,
        newIssuedChecks,
        newRemainingChecks,
        isExhausted ? "Exhausted" : "Active",
      ]
    );

    if (bookletUpdate.rowCount !== 1) {
      throw new Error("Failed to update the check booklet.");
    }

    await client.query("COMMIT");
    transactionStarted = false;

    return NextResponse.json(
      {
        success: true,
        message: "Check issuance saved successfully.",
        data: {
          transaction,
          item_count: normalizedItems.length,
          total_amount: totalAmount,
          issued_check_number: currentCheckNumber,
          created_by: createdBy,
          booklet: bookletUpdate.rows[0],
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (client && transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error(
          "Check issuance rollback error:",
          rollbackError
        );
      }
    }

    if (error instanceof ApiError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: error.status }
      );
    }

    if (
      error instanceof Error &&
      error.message === "FORBIDDEN"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "You do not have permission to issue checks.",
        },
        { status: 403 }
      );
    }

    const code = getErrorCode(error);

    if (code === "23505") {
      return NextResponse.json(
        {
          success: false,
          error:
            "This DV number or check number has already been issued.",
        },
        { status: 409 }
      );
    }

    if (code === "23503") {
      return NextResponse.json(
        {
          success: false,
          error:
            "A selected booklet, fund source, signatory, or user reference is invalid.",
        },
        { status: 400 }
      );
    }

    console.error(
      "POST /api/check-issuance error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to save check issuance. Check the server logs.",
      },
      { status: 500 }
    );
  } finally {
    client?.release();
  }
}