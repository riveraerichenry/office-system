import {
  NextRequest,
  NextResponse,
} from "next/server";

import jwt from "jsonwebtoken";

import { pool } from "@/lib/db";

export async function GET(
  request: NextRequest
) {
  try {
    // ============================================================
    // AUTHENTICATION
    // ============================================================

    const token =
      request.cookies.get(
        "token"
      )?.value;

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

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET!
      ) as {
        id: string;
      };

    // ============================================================
    // VERIFY USER
    // ============================================================

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
      userResult.rows.length ===
      0
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

    // ============================================================
    // GET COLLECTOR RCDs
    //
    // REPORT DATE:
    //     rcd_transaction.report_date
    //
    // COVERAGE:
    //     rcd_transaction.date_from
    //     rcd_transaction.date_to
    //
    // COLLECTOR:
    //     rcd_transaction.rcd_by
    //         ↓
    //     users.id
    //         ↓
    //     users.full_name
    //
    // REMITTANCE:
    //     remittance_transactions.rcd_transaction_id
    //
    // Only RCDs that have NOT yet been remitted are returned.
    // ============================================================

    const result =
      await pool.query(
        `
        SELECT
          rt.id,
          rt.report_no,

          rt.report_date,

          rt.fund_source_id,

          rt.date_from,
          rt.date_to,

          rt.total_collections,
          rt.total_remittances,
          rt.total_deposits,
          rt.balance,

          rt.status,

          rt.rcd_by,

          rt.created_at,
          rt.updated_at,

          fs.fund_code,
          fs.fund_name,
          fs.acronym,

          u.full_name AS collector

        FROM rcd_transaction rt

        INNER JOIN fund_sources fs
          ON fs.id = rt.fund_source_id

        LEFT JOIN users u
          ON u.id = rt.rcd_by

        WHERE NOT EXISTS (
          SELECT 1
          FROM remittance_transactions rmt
          WHERE rmt.rcd_transaction_id = rt.id
        )

        ORDER BY
          rt.report_date DESC,
          rt.created_at DESC
        `
      );

    // ============================================================
    // GET ACTIVE FUND SOURCES
    // ============================================================

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

    // ============================================================
    // MAP RCDs
    //
    // IMPORTANT:
    //
    // reportDate   = rt.report_date
    // coverageFrom = rt.date_from
    // coverageTo   = rt.date_to
    //
    // Keep the frontend property names unchanged.
    // ============================================================

    const transactions =
      result.rows.map(
        (row) => ({
          id: row.id,

          rcdNumber:
            row.report_no,

          reportDate:
            row.report_date,

          fundSourceId:
            row.fund_source_id,

          fundCode:
            row.fund_code,

          fundName:
            row.fund_name,

          fundAcronym:
            row.acronym,

          collector:
            row.collector ||
            "Unknown Collector",

          coverageFrom:
            row.date_from,

          coverageTo:
            row.date_to,

          amount:
            Number(
              row.total_collections ||
                0
            ),

          totalCollections:
            Number(
              row.total_collections ||
                0
            ),

          totalRemittances:
            Number(
              row.total_remittances ||
                0
            ),

          totalDeposits:
            Number(
              row.total_deposits ||
                0
            ),

          balance:
            Number(
              row.balance || 0
            ),

          status:
            row.status,

          rcdBy:
            row.rcd_by,

          createdAt:
            row.created_at,

          updatedAt:
            row.updated_at,
        })
      );

    // ============================================================
    // FUND SOURCES
    // ============================================================

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

    // ============================================================
    // RESPONSE
    // ============================================================

    return NextResponse.json({
      success: true,

      count:
        transactions.length,

      transactions,

      fundSources,
    });

  } catch (error) {

    console.error(
      "GET /api/remittance/collector-rcds error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch Collector RCDs",
      },
      {
        status: 500,
      }
    );
  }
}