
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { pool } from "@/lib/db";

/* ============================================================
   GET REMITTANCE TRANSACTIONS

   Main table:
     rcd_remittance_transactions

   Related tables:
     rcd_transaction
     fund_sources
     users

   Excludes remittances already included in a consolidated RCD.
============================================================ */

export async function GET(request: NextRequest) {
  try {
    /* ========================================================
       AUTHENTICATION
    ======================================================== */

    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured.");

      return NextResponse.json(
        {
          success: false,
          error: "Server authentication configuration error.",
        },
        { status: 500 }
      );
    }

    let decoded: { id: string };

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      ) as { id: string };
    } catch (error) {
      console.error("JWT verification error:", error);

      return NextResponse.json(
        {
          success: false,
          error: "Invalid or expired token",
        },
        { status: 401 }
      );
    }

    /* ========================================================
       VERIFY USER
    ======================================================== */

    const userResult = await pool.query(
      `
      SELECT
        id,
        full_name,
        username
      FROM public.users
      WHERE id = $1
      LIMIT 1
      `,
      [decoded.id]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 401 }
      );
    }

    const currentUser = userResult.rows[0];

    /* ========================================================
       GET REMITTANCE TRANSACTIONS

       Use only columns from the rcd_remittance_transactions
       schema previously created.

       LEFT JOIN preserves remittance records even if their
       original RCD record is unavailable.
    ======================================================== */

    const result = await pool.query(
      `
      SELECT
        rmt.id,
        rmt.remittance_no,
        rmt.remittance_date,
        rmt.rcd_transaction_id,

        rmt.report_no,
        rmt.report_date,
        rmt.fund_source_id AS remittance_fund_source_id,
        rmt.date_from,
        rmt.date_to,

        rmt.total_collections,
        rmt.total_remittances,
        rmt.total_deposits,
        rmt.balance,

        rmt.rcd_status,
        rmt.total_amount,
        rmt.status,
        rmt.remarks,
        rmt.prepared_by,
        rmt.created_at,
        rmt.updated_at,

        /* Original RCD details */
        rt.report_no AS original_rcd_no,
        rt.report_date AS original_rcd_date,
        rt.fund_source_id AS original_fund_source_id,
        rt.date_from AS original_date_from,
        rt.date_to AS original_date_to,
        rt.total_collections AS original_total_collections,
        rt.total_remittances AS original_total_remittances,
        rt.total_deposits AS original_total_deposits,
        rt.balance AS original_balance,
        rt.status AS original_rcd_status,
        rt.rcd_by,

        /* Fund source details */
        fs.fund_code,
        fs.fund_name,
        fs.acronym AS fund_acronym,

        /* Collector */
        u.full_name AS collector

      FROM public.rcd_remittance_transactions rmt

      LEFT JOIN public.rcd_transaction rt
        ON rt.id = rmt.rcd_transaction_id

      LEFT JOIN public.fund_sources fs
        ON fs.id = COALESCE(
          rt.fund_source_id,
          rmt.fund_source_id
        )

      LEFT JOIN public.users u
        ON u.id = rt.rcd_by

      WHERE NOT EXISTS (
        SELECT 1
        FROM public.rcd_consolidated_transaction_items cti
        WHERE cti.remittance_id = rmt.id
      )

      ORDER BY
        rmt.remittance_date DESC NULLS LAST,
        rmt.created_at DESC
      `
    );

    /* ========================================================
       GET ACTIVE FUND SOURCES
    ======================================================== */

    const fundSourceResult = await pool.query(
      `
      SELECT
        id,
        fund_code,
        fund_name,
        acronym
      FROM public.fund_sources
      WHERE COALESCE(is_active, TRUE) = TRUE
      ORDER BY
        seq_no ASC NULLS LAST,
        fund_code ASC
      `
    );

    /* ========================================================
       FORMAT REMITTANCE TRANSACTIONS

       Keep the response fields expected by RemittanceTable.
    ======================================================== */

    const transactions = result.rows.map((row) => {
      const totalAmount = Number(row.total_amount ?? 0);

      const fundCode = row.fund_code ?? "";
      const fundName = row.fund_name ?? "";

      return {
        /* Remittance information */
        id: row.id,
        remittance_no: row.remittance_no,
        remittance_date: row.remittance_date,

        amount: totalAmount,
        total_amount: totalAmount,

        status: row.status,
        remarks: row.remarks,
        prepared_by: row.prepared_by,
        created_at: row.created_at,
        updated_at: row.updated_at,

        /* RCD information */
        rcd_transaction_id: row.rcd_transaction_id,

        rcd_no:
          row.original_rcd_no ??
          row.report_no ??
          "",

        rcd_date:
          row.original_rcd_date ??
          row.report_date ??
          null,

        date_from: row.date_from,
        date_to: row.date_to,

        rcd_status:
          row.original_rcd_status ??
          row.rcd_status ??
          null,

        rcd_by: row.rcd_by ?? null,

        /* Fund source */
        fund_source_id:
          row.original_fund_source_id ??
          row.remittance_fund_source_id ??
          null,

        fund_code: fundCode,
        fund_name: fundName,
        fund_acronym: row.fund_acronym ?? "",

        // Maintains compatibility with the existing frontend.
        fund_source: fundCode
          ? `${fundCode}${fundName ? ` - ${fundName}` : ""}`
          : fundName,

        /* Collector */
        collector: row.collector ?? "Unknown Collector",

        /* Collection totals */
        total_collections: Number(
          row.original_total_collections ??
          row.total_collections ??
          0
        ),

        total_remittances: Number(
          row.original_total_remittances ??
          row.total_remittances ??
          0
        ),

        total_deposits: Number(
          row.original_total_deposits ??
          row.total_deposits ??
          0
        ),

        balance: Number(
          row.original_balance ??
          row.balance ??
          0
        ),
      };
    });

    /* ========================================================
       FORMAT FUND SOURCES
    ======================================================== */

    const fundSources = fundSourceResult.rows.map((row) => ({
      id: row.id,
      fundCode: row.fund_code,
      fundName: row.fund_name,
      acronym: row.acronym,
    }));

    /* ========================================================
       RESPONSE
    ======================================================== */

    return NextResponse.json({
      success: true,
      count: transactions.length,
      transactions,
      fundSources,
      user: {
        id: currentUser.id,
        fullName: currentUser.full_name,
        username: currentUser.username,
      },
    });
  } catch (error) {
    console.error(
      "GET /api/remittance/transactions error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch remittance transactions.",
      },
      { status: 500 }
    );
  }
}
