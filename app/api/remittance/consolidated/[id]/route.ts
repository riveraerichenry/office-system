
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { pool } from "@/lib/db";

/* ============================================================
   AUTHENTICATION
============================================================ */

async function authenticateUser(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    throw new Error("Unauthorized");
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not configured.");
  }

  let decoded: { id: string };

  try {
    decoded = jwt.verify(token, jwtSecret) as { id: string };
  } catch {
    throw new Error("Invalid or expired token");
  }

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
    throw new Error("User not found");
  }

  return userResult.rows[0];
}

/* ============================================================
   GET ONE CONSOLIDATED RCD
============================================================ */

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    /* ========================================================
       AUTHENTICATION
    ======================================================== */

    await authenticateUser(request);

    /* ========================================================
       GET ID
    ======================================================== */

    const { id } = await params;

    console.log("Loading Consolidated RCD ID:", id);

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Consolidated RCD ID is required.",
        },
        { status: 400 }
      );
    }

    /* ========================================================
       GET CONSOLIDATED RCD HEADER
    ======================================================== */

    const headerResult = await pool.query(
      `
        SELECT
          c.id,
          c.consolidated_no,
          c.consolidated_date,
          c.fund_source_id,
          c.total_amount,
          c.status,
          c.remarks,
          c.prepared_by,
          c.approved_by,
          c.approved_at,
          c.created_at,
          c.updated_at,

          fs.fund_code,
          fs.fund_name,
          fs.acronym,

          prepared_user.full_name AS accountable,
          approved_user.full_name AS approved_by_name

        FROM public.rcd_consolidated_transaction c

        LEFT JOIN public.fund_sources fs
          ON fs.id = c.fund_source_id

        LEFT JOIN public.users prepared_user
          ON prepared_user.id = c.prepared_by

        LEFT JOIN public.users approved_user
          ON approved_user.id = c.approved_by

        WHERE c.id = $1

        LIMIT 1
      `,
      [id]
    );

    if (headerResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Consolidated RCD not found.",
        },
        { status: 404 }
      );
    }

    const header = headerResult.rows[0];

    /* ========================================================
       GET CONSOLIDATED REMITTANCE ITEMS

       FIX:
       Use public.rcd_remittance_transactions.

       Each consolidated item represents one remittance.
    ======================================================== */

    const itemsResult = await pool.query(
      `
        SELECT
          cti.id,
          cti.remittance_id,
          cti.rcd_transaction_id,
          cti.amount,

          /* REMITTANCE DETAILS */

          rmt.remittance_no,
          rmt.remittance_date,
          rmt.total_amount AS remittance_amount,
          rmt.status AS remittance_status,

          /* ORIGINAL RCD DETAILS */

          rt.report_no AS rcd_no,
          rt.report_date AS rcd_date,
          rt.date_from,
          rt.date_to,
          rt.rcd_by,

          /* COLLECTOR */

          collector.full_name AS collector,

          /* OFFICIAL RECEIPT RANGE */

          MIN(ri.or_number) AS or_from,
          MAX(ri.or_number) AS or_to,
          COUNT(ri.id)::integer AS or_count

        FROM public.rcd_consolidated_transaction_items cti

        INNER JOIN public.rcd_remittance_transactions rmt
          ON rmt.id = cti.remittance_id

        INNER JOIN public.rcd_transaction rt
          ON rt.id = cti.rcd_transaction_id

        LEFT JOIN public.users collector
          ON collector.id = rt.rcd_by

        LEFT JOIN public.rcd_items ri
          ON ri.rcd_transaction_id = rt.id

        WHERE cti.consolidated_transaction_id = $1

        GROUP BY
          cti.id,
          cti.remittance_id,
          cti.rcd_transaction_id,
          cti.amount,

          rmt.remittance_no,
          rmt.remittance_date,
          rmt.total_amount,
          rmt.status,

          rt.report_no,
          rt.report_date,
          rt.date_from,
          rt.date_to,
          rt.rcd_by,

          collector.full_name

        ORDER BY
          rmt.remittance_date ASC NULLS LAST,
          rmt.remittance_no ASC
      `,
      [id]
    );

    console.log(
      "Consolidated RCD items found:",
      itemsResult.rows.length
    );

    /* ========================================================
       MAP ITEMS TO FRONTEND RESPONSE
    ======================================================== */

    const items = itemsResult.rows.map((item, index) => ({
      id: item.id,

      no: index + 1,

      collector: item.collector || "",

      rcdId: item.rcd_transaction_id,
      rcdNo: item.rcd_no || "",
      rcdDate: item.rcd_date ?? null,

      dateFrom: item.date_from ?? null,
      dateTo: item.date_to ?? null,

      rcdBy: item.rcd_by || "",

      orFrom:
        item.or_from !== null && item.or_from !== undefined
          ? String(item.or_from)
          : "",

      orTo:
        item.or_to !== null && item.or_to !== undefined
          ? String(item.or_to)
          : "",

      orCount: Number(item.or_count || 0),

      remittanceId: item.remittance_id,
      remittanceNo: item.remittance_no || "",
      remittanceDate: item.remittance_date ?? null,
      remittanceStatus: item.remittance_status || "",

      amount: Number(item.amount || 0),
      remittanceAmount: Number(item.remittance_amount || 0),
    }));

    /* ========================================================
       FINAL RESPONSE
    ======================================================== */

    const consolidated = {
      id: header.id,

      consolidatedNo: header.consolidated_no,
      consolidatedDate: header.consolidated_date,

      fundSourceId:
        header.fund_source_id !== null
          ? String(header.fund_source_id)
          : null,

      fundCode: header.fund_code || "",
      fundName: header.fund_name || "",
      fundAcronym: header.acronym || null,

      accountable: header.accountable || "",

      preparedBy: header.prepared_by,
      approvedBy: header.approved_by,
      approvedByName: header.approved_by_name || "",
      approvedAt: header.approved_at ?? null,

      totalAmount: Number(header.total_amount || 0),

      totalRemittances: items.length,

      status: header.status,
      remarks: header.remarks ?? null,

      createdAt: header.created_at,
      updatedAt: header.updated_at,

      items,
    };

    console.log(
      "Consolidated RCD loaded successfully:",
      consolidated.consolidatedNo
    );

    return NextResponse.json(
      {
        success: true,
        consolidated,
        count: items.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "GET /api/remittance/consolidated/[id] error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to load Consolidated RCD.";

    let status = 500;

    if (
      message === "Unauthorized" ||
      message === "Invalid or expired token" ||
      message === "User not found"
    ) {
      status = 401;
    } else if (message === "JWT_SECRET is not configured.") {
      status = 500;
    }

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status }
    );
  }
}
