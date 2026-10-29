
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export const dynamic = "force-dynamic";

function errorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "An unexpected server error occurred.";
}

// GET: Retrieve registered check booklets.
// Uses check_booklet_registration only; no checks table.
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        cb.id,
        cb.book_no AS "bookNo",
        cb.booklet_number AS "bookletNumber",
        cb.registered_at AS "registeredAt",

        cb.fund_source_id AS "fundSourceId",
        fs.fund_name AS "fundSourceName",
        to_jsonb(fs) AS "fundSourceDetails",

        cb.bank_id AS "bankId",
        b.bank_name AS "bankName",
        cb.bank AS "bank",
        to_jsonb(b) AS "bankDetails",

        cb.bank_account_id AS "bankAccountId",
        ba.account_number AS "accountNumber",
        to_jsonb(ba) AS "bankAccountDetails",

        cb.beginning_check_no AS "beginningCheckNo",
        cb.ending_check_no AS "endingCheckNo",

        COALESCE(
          NULLIF(TRIM(cb.current_check_no::text), ''),
          cb.beginning_check_no::text
        ) AS "currentCheckNo",

        cb.total_checks AS "totalChecks",
        cb.issued_checks AS "issuedChecks",
        cb.remaining_checks AS "remainingChecks",

        cb.date_received AS "dateReceived",
        cb.remarks,
        cb.status,
        cb.created_at AS "createdAt"

      FROM check_booklet_registration cb

      LEFT JOIN fund_sources fs
        ON fs.id = cb.fund_source_id

      LEFT JOIN banks b
        ON b.id = cb.bank_id

      LEFT JOIN bank_accounts ba
        ON ba.id = cb.bank_account_id

      ORDER BY cb.created_at DESC
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("GET /api/checks/booklets error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve check booklets.",
        error: errorMessage(error),
      },
      { status: 500 }
    );
  }
}

// POST: Register a single check booklet.
// Does not insert individual check records.
export async function POST(request: NextRequest) {
  const client = await pool.connect();
  let transactionStarted = false;

  try {
    const body = await request.json();

    const {
      registeredAt,
      fundSourceId,
      bankId,
      bankAccountId,
      beginningCheckNo,
      endingCheckNo,
      remarks,
      status,
    } = body;

    if (
      !registeredAt ||
      !fundSourceId ||
      !bankId ||
      !bankAccountId ||
      beginningCheckNo === undefined ||
      beginningCheckNo === null ||
      endingCheckNo === undefined ||
      endingCheckNo === null
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please complete all required booklet fields.",
        },
        { status: 400 }
      );
    }

    const bookletStatus = status || "Active";

    if (!["Active", "Exhausted"].includes(bookletStatus)) {
      return NextResponse.json(
        {
          success: false,
          message: "Status must be Active or Exhausted.",
        },
        { status: 400 }
      );
    }

    const beginning = String(beginningCheckNo).trim();
    const ending = String(endingCheckNo).trim();

    if (!/^\d+$/.test(beginning) || !/^\d+$/.test(ending)) {
      return NextResponse.json(
        {
          success: false,
          message: "Check numbers must contain digits only.",
        },
        { status: 400 }
      );
    }

    if (beginning.length !== ending.length) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Beginning and ending check numbers must have the same number of digits.",
        },
        { status: 400 }
      );
    }

    const beginningNumber = Number(beginning);
    const endingNumber = Number(ending);

    if (
      !Number.isSafeInteger(beginningNumber) ||
      !Number.isSafeInteger(endingNumber) ||
      endingNumber < beginningNumber
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "The check number range is invalid.",
        },
        { status: 400 }
      );
    }

    const totalChecks = endingNumber - beginningNumber + 1;

    if (totalChecks > 500) {
      return NextResponse.json(
        {
          success: false,
          message: "A booklet cannot contain more than 500 checks.",
        },
        { status: 400 }
      );
    }

    await client.query("BEGIN");
    transactionStarted = true;

    // Validate the fund source.
    const fundSourceResult = await client.query(
      `
        SELECT *
        FROM fund_sources
        WHERE id = $1
        FOR SHARE
      `,
      [fundSourceId]
    );

    if (fundSourceResult.rowCount === 0) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return NextResponse.json(
        {
          success: false,
          message: "The selected fund source does not exist.",
        },
        { status: 400 }
      );
    }

    const fundSource = fundSourceResult.rows[0];

    if (
      fundSource.is_active === false ||
      String(fundSource.status ?? "").toLowerCase() === "inactive"
    ) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return NextResponse.json(
        {
          success: false,
          message: "The selected fund source is inactive.",
        },
        { status: 400 }
      );
    }

    // Validate the bank.
    const bankResult = await client.query(
      `
        SELECT *
        FROM banks
        WHERE id = $1
        FOR SHARE
      `,
      [bankId]
    );

    if (bankResult.rowCount === 0) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return NextResponse.json(
        {
          success: false,
          message: "The selected bank does not exist.",
        },
        { status: 400 }
      );
    }

    const bank = bankResult.rows[0];

    // Validate the account belongs to the selected bank.
    const accountResult = await client.query(
      `
        SELECT *
        FROM bank_accounts
        WHERE id = $1
          AND bank_id = $2
        FOR SHARE
      `,
      [bankAccountId, bankId]
    );

    if (accountResult.rowCount === 0) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return NextResponse.json(
        {
          success: false,
          message:
            "The selected bank account does not belong to the selected bank.",
        },
        { status: 400 }
      );
    }

    const account = accountResult.rows[0];

    if (
      account.is_active === false ||
      String(account.status ?? "").toLowerCase() === "inactive"
    ) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return NextResponse.json(
        {
          success: false,
          message: "The selected bank account is inactive.",
        },
        { status: 400 }
      );
    }

    // Check overlapping registered booklet ranges.
    // This checks booklet registrations, not individual checks.
    const duplicateResult = await client.query(
      `
        SELECT
          id,
          book_no,
          beginning_check_no,
          ending_check_no
        FROM check_booklet_registration
        WHERE beginning_check_no ~ '^[0-9]+$'
          AND ending_check_no ~ '^[0-9]+$'
          AND beginning_check_no::numeric <= $2::numeric
          AND ending_check_no::numeric >= $1::numeric
        LIMIT 1
      `,
      [beginning, ending]
    );

    if (duplicateResult.rowCount && duplicateResult.rowCount > 0) {
      const existing = duplicateResult.rows[0];

      await client.query("ROLLBACK");
      transactionStarted = false;

      return NextResponse.json(
        {
          success: false,
          message:
            `This check-number range overlaps with booklet ${existing.book_no} ` +
            `(${existing.beginning_check_no}–${existing.ending_check_no}).`,
        },
        { status: 409 }
      );
    }

    // Generate the booklet number.
    const sequenceResult = await client.query(`
      SELECT nextval('check_book_number_seq') AS booklet_number
    `);

    const bookletNumber = String(
      sequenceResult.rows[0].booklet_number
    );

    // Insert one registration record only.
    const insertResult = await client.query(
      `
        INSERT INTO check_booklet_registration (
          book_no,
          booklet_number,
          registered_at,
          fund_source_id,
          bank_id,
          bank_account_id,
          bank,
          account_number,
          beginning_check_no,
          ending_check_no,
          current_check_no,
          total_checks,
          issued_checks,
          remaining_checks,
          date_received,
          remarks,
          status
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11, $12, $13,
          $14, $15, $16, $17
        )
        RETURNING id
      `,
      [
        bookletNumber,
        bookletNumber,
        registeredAt,
        fundSourceId,
        bankId,
        bankAccountId,
        bank.bank_name,
        account.account_number,
        beginning,
        ending,
        beginning,
        totalChecks,
        0,
        totalChecks,
        registeredAt,
        typeof remarks === "string" ? remarks.trim() || null : null,
        bookletStatus,
      ]
    );

    const bookletId = insertResult.rows[0].id;

    await client.query("COMMIT");
    transactionStarted = false;

    // Return the saved record with its related names and tracking fields.
    const responseResult = await pool.query(
      `
        SELECT
          cb.id,
          cb.book_no AS "bookNo",
          cb.booklet_number AS "bookletNumber",
          cb.registered_at AS "registeredAt",

          cb.fund_source_id AS "fundSourceId",
          fs.fund_name AS "fundSourceName",
          to_jsonb(fs) AS "fundSourceDetails",

          cb.bank_id AS "bankId",
          b.bank_name AS "bankName",
          cb.bank AS "bank",
          to_jsonb(b) AS "bankDetails",

          cb.bank_account_id AS "bankAccountId",
          ba.account_number AS "accountNumber",
          to_jsonb(ba) AS "bankAccountDetails",

          cb.beginning_check_no AS "beginningCheckNo",
          cb.ending_check_no AS "endingCheckNo",

          COALESCE(
            NULLIF(TRIM(cb.current_check_no::text), ''),
            cb.beginning_check_no::text
          ) AS "currentCheckNo",

          cb.total_checks AS "totalChecks",
          cb.issued_checks AS "issuedChecks",
          cb.remaining_checks AS "remainingChecks",

          cb.date_received AS "dateReceived",
          cb.remarks,
          cb.status,
          cb.created_at AS "createdAt"

        FROM check_booklet_registration cb

        LEFT JOIN fund_sources fs
          ON fs.id = cb.fund_source_id

        LEFT JOIN banks b
          ON b.id = cb.bank_id

        LEFT JOIN bank_accounts ba
          ON ba.id = cb.bank_account_id

        WHERE cb.id = $1
      `,
      [bookletId]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Check booklet registered successfully.",
        booklet: responseResult.rows[0],
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch {
        // Preserve the original error.
      }
    }

    console.error("POST /api/checks/booklets error:", error);

    const dbError = error as {
      code?: string;
      constraint?: string;
      detail?: string;
    };

    if (dbError.code === "23505") {
      return NextResponse.json(
        {
          success: false,
          message:
            "A duplicate booklet number or another unique field already exists.",
          constraint: dbError.constraint,
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to register check booklet.",
        error: errorMessage(error),
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
