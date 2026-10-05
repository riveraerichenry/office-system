
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET: Retrieve all check booklets and their checks
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        cb.id,
        cb.book_no AS "bookletNumber",
        cb.registered_at AS "registeredAt",
        cb.fund_source_id AS "fundSourceId",
        fs.fund_name AS "fundSourceName",
        cb.bank_id AS "bankId",
        b.bank_name AS bank,
        cb.bank_account_id AS "bankAccountId",
        ba.account_number AS "accountNumber",
        cb.beginning_check_no AS "beginningCheckNo",
        cb.ending_check_no AS "endingCheckNo",
        cb.registered_at::date AS "dateReceived",
        cb.remarks,
        cb.status,
        cb.created_at AS "createdAt",
        COALESCE(
          json_agg(
            json_build_object(
              'id', c.id,
              'checkNumber', c.check_number,
              'status', c.status,
              'payee', c.payee,
              'amount', c.amount,
              'dateIssued', c.date_issued
            )
            ORDER BY c.check_number
          ) FILTER (WHERE c.id IS NOT NULL),
          '[]'::json
        ) AS checks
      FROM check_booklets cb
      LEFT JOIN fund_sources fs
        ON fs.id = cb.fund_source_id
      LEFT JOIN banks b
        ON b.id = cb.bank_id
      LEFT JOIN bank_accounts ba
        ON ba.id = cb.bank_account_id
      LEFT JOIN checks c
        ON c.booklet_id = cb.id
      GROUP BY
        cb.id,
        fs.fund_name,
        b.bank_name,
        ba.account_number
      ORDER BY cb.created_at DESC
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Failed to fetch check booklets:", error);

    return NextResponse.json(
      { message: "Failed to fetch check booklets." },
      { status: 500 }
    );
  }
}

// POST: Register a new check booklet
export async function POST(request: NextRequest) {
  let client;

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
      String(beginningCheckNo).trim() === "" ||
      endingCheckNo === undefined ||
      endingCheckNo === null ||
      String(endingCheckNo).trim() === "" ||
      !status
    ) {
      return NextResponse.json(
        { message: "Please complete all required fields." },
        { status: 400 }
      );
    }

    if (!["Active", "Exhausted"].includes(status)) {
      return NextResponse.json(
        { message: "Invalid booklet status." },
        { status: 400 }
      );
    }

    const date = new Date(registeredAt);

    if (Number.isNaN(date.getTime())) {
      return NextResponse.json(
        { message: "Invalid registration date and time." },
        { status: 400 }
      );
    }

    const beginning = String(beginningCheckNo).trim();
    const ending = String(endingCheckNo).trim();

    if (
      !/^\d+$/.test(beginning) ||
      !/^\d+$/.test(ending) ||
      beginning.length !== ending.length
    ) {
      return NextResponse.json(
        { message: "Invalid check number range." },
        { status: 400 }
      );
    }

    const start = Number(beginning);
    const end = Number(ending);

    if (
      !Number.isSafeInteger(start) ||
      !Number.isSafeInteger(end) ||
      end < start
    ) {
      return NextResponse.json(
        { message: "Invalid check number range." },
        { status: 400 }
      );
    }

    const count = end - start + 1;

    if (count <= 0 || count > 500) {
      return NextResponse.json(
        { message: "A booklet cannot contain more than 500 checks." },
        { status: 400 }
      );
    }

    client = await pool.connect();
    await client.query("BEGIN");

    const [fund, bank, account] = await Promise.all([
      client.query(
        `SELECT id
         FROM fund_sources
         WHERE id = $1
           AND is_active = TRUE`,
        [fundSourceId]
      ),

      client.query(
        `SELECT id, bank_name
         FROM banks
         WHERE id = $1
           AND is_active = TRUE`,
        [bankId]
      ),

      client.query(
        `SELECT id, account_number
         FROM bank_accounts
         WHERE id = $1
           AND bank_id = $2
           AND is_active = TRUE
           AND UPPER(account_status) = 'ACTIVE'`,
        [bankAccountId, bankId]
      ),
    ]);

    if (!fund.rowCount || !bank.rowCount || !account.rowCount) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          message:
            "Invalid fund source, bank, or bank account. Please check your selections.",
        },
        { status: 400 }
      );
    }

    // Generate sequential booklet number.
    const sequenceResult = await client.query(`
      SELECT LPAD(
        nextval('check_book_number_seq')::TEXT,
        4,
        '0'
      ) AS book_no
    `);

    const bookNo = sequenceResult.rows[0].book_no;

    // Create booklet.
    const bookletResult = await client.query(
      `INSERT INTO check_booklets (
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
        date_received,
        remarks,
        status
      )
      VALUES (
        $1, $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12
      )
      RETURNING *`,
      [
        bookNo,
        date.toISOString(),
        fundSourceId,
        bankId,
        bankAccountId,
        bank.rows[0].bank_name,
        account.rows[0].account_number,
        beginning,
        ending,
        date.toISOString().slice(0, 10),
        typeof remarks === "string"
          ? remarks.trim() || null
          : null,
        status,
      ]
    );

    const booklet = bookletResult.rows[0];

    // Generate individual checks in the booklet.
    await client.query(
      `INSERT INTO checks (
        booklet_id,
        check_number,
        status
      )
      SELECT
        $1,
        LPAD(number::TEXT, $2, '0'),
        'Available'
      FROM generate_series(
        $3::BIGINT,
        $4::BIGINT
      ) AS number`,
      [booklet.id, beginning.length, start, end]
    );

    await client.query("COMMIT");

    return NextResponse.json(
      {
        message: "Check booklet registered successfully.",
        booklet: {
          ...booklet,
          bookletNumber: booklet.book_no,
          checks: count,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (client) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Rollback failed:", rollbackError);
      }
    }

    console.error("Check booklet registration error:", error);

    return NextResponse.json(
      { message: "Failed to register check booklet." },
      { status: 500 }
    );
  } finally {
    client?.release();
  }
}
