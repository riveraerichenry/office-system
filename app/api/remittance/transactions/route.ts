import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { pool } from "@/lib/db";

/* ============================================================
   GET REMITTANCE TRANSACTIONS
   ============================================================

   Relationship:

   remittance_transactions
            |
            | rcd_transaction_id
            v
      rcd_transaction

   A remittance is considered available when it has NOT yet
   been included in a consolidated RCD.

   IMPORTANT:
   Do NOT use c.remittance_id.
   The consolidated parent does not have remittance_id.

============================================================ */

export async function GET(
  request: NextRequest
) {
  try {
    /* ========================================================
       AUTHENTICATION
    ======================================================== */

    const token =
      request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    let decoded: {
      id: string;
    };

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET!
      ) as {
        id: string;
      };
    } catch (error) {
      console.error(
        "JWT verification error:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          error: "Invalid or expired token",
        },
        {
          status: 401,
        }
      );
    }

    /* ========================================================
       VERIFY USER
    ======================================================== */

    const userResult =
      await pool.query(
        `
        SELECT
          id,
          full_name,
          username
        FROM users
        WHERE id = $1
        LIMIT 1
        `,
        [decoded.id]
      );

    if (
      userResult.rows.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        {
          status: 401,
        }
      );
    }

    const currentUser =
      userResult.rows[0];

    /* ========================================================
       GET REMITTANCE TRANSACTIONS
    ======================================================== */

    /*
      We join:

      rmt = remittance_transactions
      rt  = rcd_transaction
      fs  = fund_sources
      u   = users

      We intentionally DO NOT reference:
        c.remittance_id

      because that column does not exist.
    */

    const result =
      await pool.query(
        `
        SELECT
          rmt.id,
          rmt.remittance_no,
          rmt.remittance_date,
          rmt.total_amount,
          rmt.status,
          rmt.remarks,
          rmt.prepared_by,
          rmt.approved_by,
          rmt.approved_at,
          rmt.created_at,
          rmt.updated_at,

          rmt.rcd_transaction_id,

          rt.report_no AS rcd_no,
          rt.report_date AS rcd_date,
          rt.fund_source_id,
          rt.date_from,
          rt.date_to,
          rt.total_collections,
          rt.total_remittances,
          rt.total_deposits,
          rt.balance,
          rt.status AS rcd_status,
          rt.rcd_by,

          fs.fund_code,
          fs.fund_name,
          fs.acronym AS fund_acronym,

          u.full_name AS collector

        FROM remittance_transactions rmt

        INNER JOIN rcd_transaction rt
          ON rt.id = rmt.rcd_transaction_id

        INNER JOIN fund_sources fs
          ON fs.id = rt.fund_source_id

        LEFT JOIN users u
          ON u.id = rt.rcd_by

        WHERE NOT EXISTS (
          SELECT 1
          FROM rcd_consolidated_transaction_items cti
          WHERE cti.remittance_id = rmt.id
        )

        ORDER BY
          rmt.remittance_date DESC,
          rmt.created_at DESC
        `
      );

    /* ========================================================
       GET FUND SOURCES
    ======================================================== */

    const fundSourceResult =
      await pool.query(
        `
        SELECT
          id,
          fund_code,
          fund_name,
          acronym
        FROM fund_sources
        WHERE COALESCE(
          is_active,
          TRUE
        ) = TRUE
        ORDER BY
          seq_no ASC NULLS LAST,
          fund_code ASC
        `
      );

    /* ========================================================
       FORMAT REMITTANCES
    ======================================================== */

    const transactions =
      result.rows.map(
        (row) => ({
          id: row.id,

          remittance_no:
            row.remittance_no,

          remittance_date:
            row.remittance_date,

          amount: Number(
            row.total_amount || 0
          ),

          total_amount: Number(
            row.total_amount || 0
          ),

          status:
            row.status,

          remarks:
            row.remarks,

          prepared_by:
            row.prepared_by,

          approved_by:
            row.approved_by,

          approved_at:
            row.approved_at,

          created_at:
            row.created_at,

          updated_at:
            row.updated_at,

          /* ==================================================
             RCD INFORMATION
          ================================================== */

          rcd_transaction_id:
            row.rcd_transaction_id,

          rcd_no:
            row.rcd_no,

          rcd_date:
            row.rcd_date,

          date_from:
            row.date_from,

          date_to:
            row.date_to,

          rcd_status:
            row.rcd_status,

          rcd_by:
            row.rcd_by,

          /* ==================================================
             FUND SOURCE
          ================================================== */

          fund_source_id:
            row.fund_source_id,

          fund_code:
            row.fund_code,

          fund_name:
            row.fund_name,

          fund_acronym:
            row.fund_acronym,

          /*
            Keep this field because the current
            RemittanceTable uses fund_source.
          */
          fund_source:
            row.fund_code
              ? `${row.fund_code}${
                  row.fund_name
                    ? ` - ${row.fund_name}`
                    : ""
                }`
              : "",

          /* ==================================================
             COLLECTOR
          ================================================== */

          collector:
            row.collector ||
            "Unknown Collector",

          /* ==================================================
             COLLECTION TOTALS
          ================================================== */

          total_collections:
            Number(
              row.total_collections || 0
            ),

          total_remittances:
            Number(
              row.total_remittances || 0
            ),

          total_deposits:
            Number(
              row.total_deposits || 0
            ),

          balance:
            Number(
              row.balance || 0
            ),
        })
      );

    /* ========================================================
       FORMAT FUND SOURCES
    ======================================================== */

    const fundSources =
      fundSourceResult.rows.map(
        (row) => ({
          id: row.id,

          fundCode:
            row.fund_code,

          fundName:
            row.fund_name,

          acronym:
            row.acronym,
        })
      );

    /* ========================================================
       RESPONSE
    ======================================================== */

    return NextResponse.json({
      success: true,

      count:
        transactions.length,

      transactions,

      fundSources,

      user: {
        id:
          currentUser.id,

        fullName:
          currentUser.full_name,

        username:
          currentUser.username,
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
      {
        status: 500,
      }
    );
  }
}