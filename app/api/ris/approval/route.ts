import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/authorize";
import { pool } from "@/lib/db";
import { MODULE_PATHS } from "@/lib/module-paths";

export async function GET(req: NextRequest) {
  try {
    await authorize(
      req,
      MODULE_PATHS.RIS_APPROVAL,
      "view"
    );

    const { searchParams } = new URL(req.url);

    const fiscalYear =
      searchParams.get("fiscal_year") ??
      new Date().getFullYear().toString();

    const search =
      searchParams.get("search") ?? "";

    const params = [
      Number(fiscalYear),
      `%${search}%`,
    ];

    // Pending Requests
    const pending = await pool.query(
      `
      SELECT
          rr.id,
          rr.ris_no,
          rr.request_date,
          rr.status,

          u.full_name AS accountable_officer,

          COALESCE(
              SUM(ri.quantity),
              0
          )::int AS quantity

      FROM ris_requests rr

      INNER JOIN users u
          ON u.id = rr.requested_by

      LEFT JOIN ris_request_items ri
          ON ri.ris_request_id = rr.id

      WHERE
          EXTRACT(YEAR FROM rr.request_date) = $1
          AND rr.status = 'Pending'
          AND (
              rr.ris_no ILIKE $2
              OR u.full_name ILIKE $2
          )

      GROUP BY
          rr.id,
          rr.ris_no,
          rr.request_date,
          rr.status,
          u.full_name

      ORDER BY
          rr.request_date DESC
      `,
      params
    );

    // Approved / Issued
    const processed = await pool.query(
      `
      SELECT
          rr.id,
          rr.ris_no,
          rr.request_date,
          rr.approved_date,
          rr.status,

          u.full_name AS accountable_officer,

          COALESCE(
              SUM(ri.quantity),
              0
          )::int AS quantity

      FROM ris_requests rr

      INNER JOIN users u
          ON u.id = rr.requested_by

      LEFT JOIN ris_request_items ri
          ON ri.ris_request_id = rr.id

      WHERE
          EXTRACT(YEAR FROM rr.request_date) = $1
          AND rr.status IN ('Approved','Issued')
          AND (
              rr.ris_no ILIKE $2
              OR u.full_name ILIKE $2
          )

      GROUP BY
          rr.id,
          rr.ris_no,
          rr.request_date,
          rr.approved_date,
          rr.status,
          u.full_name

      ORDER BY

          CASE
              WHEN rr.status='Approved' THEN 1
              WHEN rr.status='Issued' THEN 2
              ELSE 3
          END,

          rr.approved_date DESC
      `,
      params
    );

    // Summary
    const summaryResult = await pool.query(
      `
      SELECT

          COUNT(*) FILTER (
              WHERE status='Pending'
          )::int AS pending,

          COUNT(*) FILTER (
              WHERE status='Approved'
          )::int AS approved,

          COUNT(*) FILTER (
              WHERE status='Issued'
          )::int AS issued,

          COUNT(*)::int AS total

      FROM ris_requests

      WHERE
          EXTRACT(YEAR FROM request_date)=$1
      `,
      [Number(fiscalYear)]
    );

    return NextResponse.json({
      success: true,

      pending: pending.rows,

      processed: processed.rows,

      summary: summaryResult.rows[0],
    });

  } catch (err: any) {

    console.error(err);

    return NextResponse.json(
      {
        success: false,
        message: err.message,
      },
      {
        status: 500,
      }
    );
  }
}