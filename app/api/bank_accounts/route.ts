import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(req: NextRequest) {
  try {
    const bankId = req.nextUrl.searchParams.get("bank_id");
    const search = req.nextUrl.searchParams.get("search")?.trim() ?? "";

    if (!bankId || !UUID_PATTERN.test(bankId)) {
      return NextResponse.json(
        { success: false, message: "A valid bank ID is required." },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `
        SELECT
          ba.id,
          ba.sequence_code,
          ba.bank_id,
          ba.account_number,
          ba.account_code,
          ba.account_name,
          ba.remarks,
          ba.account_status,
          ba.deposit_label,
          ba.fund_source_id,
          ba.is_active,
          ba.created_at,

          fs.fund_code,
          fs.fund_name,
          fs.acronym AS fund_acronym

        FROM public.bank_accounts ba

        LEFT JOIN public.fund_sources fs
          ON fs.id = ba.fund_source_id

        WHERE ba.bank_id = $1
          AND (
            $2 = ''
            OR ba.sequence_code ILIKE '%' || $2 || '%'
            OR ba.account_number ILIKE '%' || $2 || '%'
            OR COALESCE(ba.account_code, '') ILIKE '%' || $2 || '%'
            OR ba.account_name ILIKE '%' || $2 || '%'
            OR COALESCE(fs.fund_code, '') ILIKE '%' || $2 || '%'
            OR COALESCE(fs.fund_name, '') ILIKE '%' || $2 || '%'
          )

        ORDER BY ba.account_name ASC
      `,
      [bankId, search]
    );

    return NextResponse.json({
      success: true,
      accounts: result.rows,
    });
  } catch (error) {
    console.error("GET /api/bank_accounts error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to load bank accounts." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      sequence_code,
      bank_id,
      account_number,
      account_code,
      account_name,
      account_status,
      deposit_label,
      remarks,
      fund_source_id,
    } = body;

    if (
      typeof sequence_code !== "string" ||
      !sequence_code.trim() ||
      typeof bank_id !== "string" ||
      !UUID_PATTERN.test(bank_id) ||
      typeof account_number !== "string" ||
      !account_number.trim() ||
      typeof account_name !== "string" ||
      !account_name.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Sequence code, valid bank, account number, and account name are required.",
        },
        { status: 400 }
      );
    }

    if (
      fund_source_id !== undefined &&
      fund_source_id !== null &&
      fund_source_id !== "" &&
      (typeof fund_source_id !== "string" ||
        !UUID_PATTERN.test(fund_source_id))
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid fund source ID." },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const bankResult = await client.query(
        `
          SELECT id
          FROM public.banks
          WHERE id = $1
        `,
        [bank_id]
      );

      if (bankResult.rowCount === 0) {
        await client.query("ROLLBACK");

        return NextResponse.json(
          { success: false, message: "The selected bank does not exist." },
          { status: 400 }
        );
      }

      if (fund_source_id) {
        const fundResult = await client.query(
          `
            SELECT id
            FROM public.fund_sources
            WHERE id = $1
              AND is_active = TRUE
          `,
          [fund_source_id]
        );

        if (fundResult.rowCount === 0) {
          await client.query("ROLLBACK");

          return NextResponse.json(
            {
              success: false,
              message: "The selected fund source is not active or does not exist.",
            },
            { status: 400 }
          );
        }
      }

      const result = await client.query(
        `
          INSERT INTO public.bank_accounts (
            sequence_code,
            bank_id,
            account_number,
            account_code,
            account_name,
            account_status,
            deposit_label,
            remarks,
            fund_source_id
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING *
        `,
        [
          sequence_code.trim(),
          bank_id,
          account_number.trim(),
          typeof account_code === "string" && account_code.trim()
            ? account_code.trim()
            : null,
          account_name.trim(),
          typeof account_status === "string" && account_status.trim()
            ? account_status.trim()
            : "ACTIVE",
          typeof deposit_label === "string" && deposit_label.trim()
            ? deposit_label.trim()
            : null,
          typeof remarks === "string" && remarks.trim()
            ? remarks.trim()
            : null,
          fund_source_id || null,
        ]
      );

      await client.query("COMMIT");

      return NextResponse.json(
        {
          success: true,
          message: "Bank account created successfully.",
          account: result.rows[0],
        },
        { status: 201 }
      );
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("POST /api/bank_accounts error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to create bank account." },
      { status: 500 }
    );
  }
}