
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { pool } from "@/lib/db";

type JwtPayload = {
  id?: string;
  username?: string;
  full_name?: string;
};

type ManualItem = {
  or_number?: string;
  receipt_date?: string;
  payor?: string;
  payment_mode?: string;
  amount?: number | string;
};

type ManualRCDBody = {
  report_date?: string;
  reportDate?: string;
  fund_source_id?: string;
  date_from?: string;
  dateFrom?: string;
  date_to?: string;
  dateTo?: string;
  items?: ManualItem[];
};

/* ============================================================
   DATE VALIDATION

   Avoid local timezone conversion.
   This prevents Philippines UTC+8 from changing the date.
============================================================ */

function normalizeDate(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const date = value.trim();

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);

  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const parsed = new Date(Date.UTC(year, month - 1, day));

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

/* ============================================================
   MONEY VALIDATION
============================================================ */

function moneyToCents(value: unknown): number | null {
  const amount = Number(value);

  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  const cents = Math.round(amount * 100);

  if (Math.abs(amount * 100 - cents) > 0.000001) {
    return null;
  }

  return cents;
}

/* ============================================================
   POST: CREATE MANUAL RCD
============================================================ */

export async function POST(request: NextRequest) {
  /* ==========================================================
     AUTHENTICATION
  ========================================================== */

  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json(
      {
        success: false,
        message: "Authentication required.",
      },
      { status: 401 }
    );
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    console.error("JWT_SECRET is not configured.");

    return NextResponse.json(
      {
        success: false,
        message: "Authentication configuration error.",
      },
      { status: 500 }
    );
  }

  let decoded: JwtPayload;

  try {
    decoded = jwt.verify(token, jwtSecret) as JwtPayload;
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid or expired session.",
      },
      { status: 401 }
    );
  }

  if (!decoded?.id) {
    return NextResponse.json(
      {
        success: false,
        message: "Unable to determine logged-in user.",
      },
      { status: 401 }
    );
  }

  /* ==========================================================
     READ REQUEST BODY
  ========================================================== */

  let body: ManualRCDBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid request body.",
      },
      { status: 400 }
    );
  }

  /* ==========================================================
     NORMALIZE INPUTS

     Accept snake_case and camelCase date properties.
  ========================================================== */

  const reportDate = normalizeDate(
    body.report_date ?? body.reportDate
  );

  const fundSourceId = String(
    body.fund_source_id ?? ""
  ).trim();

  const dateFrom = normalizeDate(
    body.date_from ?? body.dateFrom
  );

  const dateTo = normalizeDate(
    body.date_to ?? body.dateTo
  );

  const items = body.items;

  /* ==========================================================
     VALIDATE FUND SOURCE
  ========================================================== */

  if (!fundSourceId) {
    return NextResponse.json(
      {
        success: false,
        message: "Fund source is required.",
      },
      { status: 400 }
    );
  }

  /* ==========================================================
     VALIDATE DATES
  ========================================================== */

  if (!reportDate || !dateFrom || !dateTo) {
    return NextResponse.json(
      {
        success: false,
        message: "Please provide valid dates.",
        received: {
          report_date: body.report_date ?? body.reportDate ?? null,
          date_from: body.date_from ?? body.dateFrom ?? null,
          date_to: body.date_to ?? body.dateTo ?? null,
        },
      },
      { status: 400 }
    );
  }

  if (dateFrom > dateTo) {
    return NextResponse.json(
      {
        success: false,
        message: "Date From cannot be later than Date To.",
      },
      { status: 400 }
    );
  }

  /* ==========================================================
     VALIDATE COLLECTION ITEMS
  ========================================================== */

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json(
      {
        success: false,
        message: "Add at least one collection item.",
      },
      { status: 400 }
    );
  }

  if (items.length > 500) {
    return NextResponse.json(
      {
        success: false,
        message: "A maximum of 500 items is allowed per RCD.",
      },
      { status: 400 }
    );
  }

  const normalizedItems: {
    orNumber: string;
    receiptDate: string;
    payor: string | null;
    paymentMode: string;
    amount: number;
  }[] = [];

  let totalCents = 0;

  for (let index = 0; index < items.length; index++) {
    const item = items[index];

    const orNumber = String(
      item.or_number ?? ""
    ).trim();

    const receiptDate = normalizeDate(
      item.receipt_date
    );

    const payor = String(
      item.payor ?? ""
    ).trim();

    const paymentMode = String(
      item.payment_mode ?? ""
    ).trim();

    const amountCents = moneyToCents(item.amount);

    if (!orNumber) {
      return NextResponse.json(
        {
          success: false,
          message: `OR Number is required on item ${index + 1}.`,
        },
        { status: 400 }
      );
    }

    if (!receiptDate) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid receipt date on item ${index + 1}.`,
        },
        { status: 400 }
      );
    }

    if (
      receiptDate < dateFrom ||
      receiptDate > dateTo
    ) {
      return NextResponse.json(
        {
          success: false,
          message: `Receipt date on item ${index + 1} must be within the RCD coverage dates.`,
        },
        { status: 400 }
      );
    }

    if (!paymentMode) {
      return NextResponse.json(
        {
          success: false,
          message: `Payment mode is required on item ${index + 1}.`,
        },
        { status: 400 }
      );
    }

    if (amountCents === null) {
      return NextResponse.json(
        {
          success: false,
          message: `Enter a valid amount greater than zero with no more than two decimal places on item ${index + 1}.`,
        },
        { status: 400 }
      );
    }

    totalCents += amountCents;

    normalizedItems.push({
      orNumber,
      receiptDate,
      payor: payor || null,
      paymentMode,
      amount: amountCents / 100,
    });
  }

  if (!Number.isSafeInteger(totalCents)) {
    return NextResponse.json(
      {
        success: false,
        message: "The total collection amount is too large.",
      },
      { status: 400 }
    );
  }

  const totalCollections = totalCents / 100;

  /* ==========================================================
     DATABASE CONNECTION
  ========================================================== */

  const client = await pool.connect();

  let transactionStarted = false;

  try {
    /* ========================================================
       GET LOGGED-IN USER
    ======================================================== */

    const userResult = await client.query(
      `
        SELECT
          id,
          username,
          full_name
        FROM users
        WHERE id = $1
        LIMIT 1
      `,
      [decoded.id]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Logged-in user was not found.",
        },
        { status: 401 }
      );
    }

    const loggedInUser = userResult.rows[0];

    /* ========================================================
       GET FUND SOURCE
    ======================================================== */

    const fundResult = await client.query(
      `
        SELECT
          id,
          fund_code,
          fund_name,
          acronym
        FROM fund_sources
        WHERE id = $1
          AND is_active = TRUE
        LIMIT 1
      `,
      [fundSourceId]
    );

    if (fundResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Fund source not found or inactive.",
        },
        { status: 404 }
      );
    }

    const fundSource = fundResult.rows[0];

    /* ========================================================
       START DATABASE TRANSACTION
    ======================================================== */

    await client.query("BEGIN");

    transactionStarted = true;

    /* ========================================================
       RCD REPORT NUMBER LOCK

       Same advisory lock used by automatic RCD generation.
    ======================================================== */

    await client.query(`
      SELECT pg_advisory_xact_lock(
        hashtext('RCD_REPORT_NUMBER_GENERATION')
      )
    `);

    /* ========================================================
       GENERATE REPORT NUMBER

       Format:
       YYMMDD + 5-digit sequence + FUND ACRONYM

       Example:
       26112400001-GF
    ======================================================== */

    const now = new Date();

    const yy = String(
      now.getFullYear()
    ).slice(-2);

    const mm = String(
      now.getMonth() + 1
    ).padStart(2, "0");

    const dd = String(
      now.getDate()
    ).padStart(2, "0");

    const datePrefix = `${yy}${mm}${dd}`;

    const sequenceResult = await client.query(
      `
        SELECT
          COALESCE(
            MAX(
              SUBSTRING(report_no FROM 7 FOR 5)::INTEGER
            ),
            0
          ) AS last_sequence
        FROM rcd_transaction
        WHERE report_no ~ ('^' || $1 || '[0-9]{5}-')
      `,
      [datePrefix]
    );

    const nextSequence =
      Number(
        sequenceResult.rows[0]?.last_sequence ?? 0
      ) + 1;

    const suffix =
      String(fundSource.acronym ?? "")
        .trim()
        .toUpperCase() || "RPT";

    const reportNo =
      `${datePrefix}${String(nextSequence).padStart(5, "0")}-${suffix}`;

    /* ========================================================
       CREATE RCD TRANSACTION
    ======================================================== */

    const rcdId = randomUUID();

    const rcdResult = await client.query(
      `
        INSERT INTO rcd_transaction (
          id,
          report_no,
          report_date,
          fund_source_id,
          date_from,
          date_to,
          total_collections,
          total_remittances,
          total_deposits,
          balance,
          status,
          created_at,
          updated_at,
          rcd_by
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          0,
          0,
          $7,
          'FOR REMITTANCE',
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP,
          $8
        )
        RETURNING *
      `,
      [
        rcdId,
        reportNo,
        reportDate,
        fundSource.id,
        dateFrom,
        dateTo,
        totalCollections,
        loggedInUser.id,
      ]
    );

    /* ========================================================
       INSERT RCD ITEMS

       Manual entries are not linked to DIPP transactions
       or Cash Ticket transactions.
    ======================================================== */

    const insertedItems = [];

    for (const item of normalizedItems) {
      const itemId = randomUUID();

      const itemResult = await client.query(
        `
          INSERT INTO rcd_items (
            id,
            rcd_transaction_id,
            dipp_transaction_id,
            or_number,
            receipt_date,
            collector_id,
            payor,
            payment_mode,
            amount,
            created_at,
            cash_ticket_transaction_id
          )
          VALUES (
            $1,
            $2,
            NULL,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8,
            CURRENT_TIMESTAMP,
            NULL
          )
          RETURNING *
        `,
        [
          itemId,
          rcdId,
          item.orNumber,
          item.receiptDate,
          loggedInUser.id,
          item.payor,
          item.paymentMode,
          item.amount,
        ]
      );

      insertedItems.push(itemResult.rows[0]);
    }

    /* ========================================================
       COMMIT
    ======================================================== */

    await client.query("COMMIT");

    transactionStarted = false;

    const rcd = rcdResult.rows[0];

    return NextResponse.json(
      {
        success: true,
        message: "Manual RCD created successfully.",

        rcd: {
          ...rcd,
          total_collections: Number(rcd.total_collections),
          total_remittances: Number(rcd.total_remittances),
          total_deposits: Number(rcd.total_deposits),
          balance: Number(rcd.balance),
        },

        items: insertedItems.map((item: any) => ({
          ...item,
          amount: Number(item.amount),
        })),

        fund_source: fundSource,

        collector: {
          id: loggedInUser.id,
          username: loggedInUser.username,
          full_name: loggedInUser.full_name,
        },
      },
      { status: 201 }
    );

  } catch (error) {
    /* ========================================================
       ROLLBACK
    ======================================================== */

    if (transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error(
          "Manual RCD rollback error:",
          rollbackError
        );
      }
    }

    console.error(
      "MANUAL RCD API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to create manual RCD.",
      },
      { status: 500 }
    );

  } finally {
    client.release();
  }
}
