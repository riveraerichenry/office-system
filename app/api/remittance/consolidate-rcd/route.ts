
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

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured.");
  }

  let decoded: { id: string };

  try {
    decoded = jwt.verify(token, secret) as { id: string };
  } catch {
    throw new Error("Invalid or expired token");
  }

  const result = await pool.query(
    `
      SELECT id, full_name, username
      FROM public.users
      WHERE id = $1
      LIMIT 1
    `,
    [decoded.id]
  );

  if (result.rows.length === 0) {
    throw new Error("User not found");
  }

  return result.rows[0];
}

/* ============================================================
   POST: CREATE CONSOLIDATED RCD

   Request:
   {
     "remittance_ids": ["uuid", "uuid"],
     "fund_source_id": "uuid",
     "consolidated_rcd_no": "YOUR-RCD-NUMBER"
   }

   The entered number is saved as consolidated_no.
============================================================ */

export async function POST(request: NextRequest) {
  let client;

  try {
    const currentUser = await authenticateUser(request);
    client = await pool.connect();

    let body: {
      remittance_ids?: unknown;
      fund_source_id?: unknown;
      consolidated_rcd_no?: unknown;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid request body." },
        { status: 400 }
      );
    }

    /* ========================================================
       VALIDATE CONSOLIDATED RCD NUMBER
    ======================================================== */

    if (typeof body.consolidated_rcd_no !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Consolidated RCD Number is required.",
        },
        { status: 400 }
      );
    }

    const consolidatedNo = body.consolidated_rcd_no.trim();

    if (!consolidatedNo) {
      return NextResponse.json(
        {
          success: false,
          error: "Please enter the Consolidated RCD Number.",
        },
        { status: 400 }
      );
    }

    if (consolidatedNo.length > 100) {
      return NextResponse.json(
        {
          success: false,
          error: "Consolidated RCD Number cannot exceed 100 characters.",
        },
        { status: 400 }
      );
    }

    /* ========================================================
       VALIDATE REMITTANCE IDS
    ======================================================== */

    if (
      !Array.isArray(body.remittance_ids) ||
      body.remittance_ids.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "No remittance transactions were selected.",
        },
        { status: 400 }
      );
    }

    const ids = body.remittance_ids;

    if (
      !ids.every(
        (id): id is string =>
          typeof id === "string" && id.trim().length > 0
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "One or more remittance IDs are invalid.",
        },
        { status: 400 }
      );
    }

    const remittanceIds = [
      ...new Set(ids.map((id) => id.trim())),
    ];

    if (remittanceIds.length !== ids.length) {
      return NextResponse.json(
        {
          success: false,
          error: "Duplicate remittance IDs were submitted.",
        },
        { status: 400 }
      );
    }

    const requestedFundSourceId =
      typeof body.fund_source_id === "string"
        ? body.fund_source_id.trim()
        : "";

    if (!requestedFundSourceId) {
      return NextResponse.json(
        {
          success: false,
          error: "Fund source is required.",
        },
        { status: 400 }
      );
    }

    /* ========================================================
       BEGIN TRANSACTION
    ======================================================== */

    await client.query("BEGIN");

    /* ========================================================
       CHECK NUMBER UNIQUENESS

       The database should also have a UNIQUE constraint on
       consolidated_no to protect against concurrent requests.
    ======================================================== */

    const numberCheck = await client.query(
      `
        SELECT id
        FROM public.rcd_consolidated_transaction
        WHERE LOWER(TRIM(consolidated_no)) = LOWER(TRIM($1))
        LIMIT 1
      `,
      [consolidatedNo]
    );

    if (numberCheck.rows.length > 0) {
      const error = new Error(
        `Consolidated RCD Number "${consolidatedNo}" already exists. Please enter a different number.`
      );
      Object.assign(error, { statusCode: 409 });
      throw error;
    }

    /* ========================================================
       LOCK SELECTED REMITTANCES

       Use the remittance snapshot table.
       Preserve the user's selected order.
    ======================================================== */

    const remittanceResult = await client.query(
      `
        SELECT
          rmt.id,
          rmt.remittance_no,
          rmt.remittance_date,
          rmt.total_amount,
          rmt.status,
          rmt.rcd_transaction_id,
          rt.fund_source_id,
          fs.fund_code,
          fs.fund_name
        FROM public.rcd_remittance_transactions rmt
        INNER JOIN public.rcd_transaction rt
          ON rt.id = rmt.rcd_transaction_id
        LEFT JOIN public.fund_sources fs
          ON fs.id = rt.fund_source_id
        WHERE rmt.id = ANY($1::uuid[])
        ORDER BY array_position($1::uuid[], rmt.id)
        FOR UPDATE OF rmt
      `,
      [remittanceIds]
    );

    if (remittanceResult.rows.length !== remittanceIds.length) {
      const error = new Error(
        "One or more selected remittances could not be found. Refresh the table and try again."
      );
      Object.assign(error, { statusCode: 404 });
      throw error;
    }

    /* ========================================================
       VALIDATE FUND SOURCE
    ======================================================== */

    const fundSourceIds = remittanceResult.rows.map(
      (row) => row.fund_source_id
    );

    if (
      fundSourceIds.some(
        (id) => id === null || id === undefined || id === ""
      )
    ) {
      const error = new Error(
        "One or more remittances have no fund source."
      );
      Object.assign(error, { statusCode: 400 });
      throw error;
    }

    const uniqueFundSourceIds = [
      ...new Set(fundSourceIds.map(String)),
    ];

    if (uniqueFundSourceIds.length !== 1) {
      const error = new Error(
        "Remittances from different fund sources cannot be consolidated together."
      );
      Object.assign(error, { statusCode: 400 });
      throw error;
    }

    const finalFundSourceId = uniqueFundSourceIds[0];

    if (requestedFundSourceId !== finalFundSourceId) {
      const error = new Error(
        "The selected remittances do not belong to the requested fund source. Refresh and try again."
      );
      Object.assign(error, { statusCode: 400 });
      throw error;
    }

    /* ========================================================
       PREVENT RE-CONSOLIDATION
    ======================================================== */

    const duplicateRemittances = await client.query(
      `
        SELECT
          cti.remittance_id,
          c.consolidated_no
        FROM public.rcd_consolidated_transaction_items cti
        INNER JOIN public.rcd_consolidated_transaction c
          ON c.id = cti.consolidated_transaction_id
        WHERE cti.remittance_id = ANY($1::uuid[])
      `,
      [remittanceIds]
    );

    if (duplicateRemittances.rows.length > 0) {
      const numbers = [
        ...new Set(
          duplicateRemittances.rows
            .map((row) => row.consolidated_no)
            .filter(Boolean)
        ),
      ];

      const error = new Error(
        numbers.length
          ? `One or more remittances have already been consolidated under ${numbers.join(", ")}.`
          : "One or more remittances have already been consolidated."
      );

      Object.assign(error, { statusCode: 409 });
      throw error;
    }

    /* ========================================================
       CALCULATE TOTAL
    ======================================================== */

    const totalAmount = remittanceResult.rows.reduce(
      (total, row) =>
        total + Number(row.total_amount || 0),
      0
    );

    if (!Number.isFinite(totalAmount) || totalAmount < 0) {
      throw new Error("The total remittance amount is invalid.");
    }

    /* ========================================================
       INSERT CONSOLIDATED RCD PARENT

       IMPORTANT:
       consolidated_no = number entered by the user
       prepared_by     = currently logged-in user
       status          = PENDING
    ======================================================== */

    const consolidatedResult = await client.query(
      `
        INSERT INTO public.rcd_consolidated_transaction
        (
          consolidated_no,
          consolidated_date,
          fund_source_id,
          total_amount,
          status,
          prepared_by,
          created_at,
          updated_at
        )
        VALUES
        (
          $1,
          CURRENT_DATE,
          $2,
          $3,
          'PENDING',
          $4,
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        )
        RETURNING
          id,
          consolidated_no,
          consolidated_date,
          fund_source_id,
          total_amount,
          status,
          prepared_by,
          created_at,
          updated_at
      `,
      [
        consolidatedNo,
        finalFundSourceId,
        totalAmount,
        currentUser.id,
      ]
    );

    const consolidated = consolidatedResult.rows[0];

    /* ========================================================
       INSERT CONSOLIDATED ITEMS
    ======================================================== */

    for (const remittance of remittanceResult.rows) {
      await client.query(
        `
          INSERT INTO public.rcd_consolidated_transaction_items
          (
            consolidated_transaction_id,
            rcd_transaction_id,
            remittance_id,
            amount,
            created_at
          )
          VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
        `,
        [
          consolidated.id,
          remittance.rcd_transaction_id,
          remittance.id,
          Number(remittance.total_amount || 0),
        ]
      );
    }

    /* ========================================================
       COMMIT
    ======================================================== */

    await client.query("COMMIT");

    return NextResponse.json(
      {
        success: true,
        message: "Consolidated RCD generated successfully.",
        consolidated: {
          id: consolidated.id,
          consolidatedNo: consolidated.consolidated_no,
          consolidatedDate: consolidated.consolidated_date,
          fundSourceId: consolidated.fund_source_id,
          totalAmount: Number(consolidated.total_amount || 0),
          totalRemittances: remittanceIds.length,
          status: consolidated.status,
          preparedBy: consolidated.prepared_by,
          accountable: currentUser.full_name,
          createdAt: consolidated.created_at,
          updatedAt: consolidated.updated_at,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (client) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Consolidated RCD rollback error:", rollbackError);
      }
    }

    console.error(
      "POST /api/remittance/consolidate-rcd error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to generate Consolidated RCD.";

    const statusCode =
      typeof error === "object" &&
      error !== null &&
      "statusCode" in error &&
      typeof error.statusCode === "number"
        ? error.statusCode
        : message === "Unauthorized" ||
            message === "Invalid or expired token"
          ? 401
          : 500;

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: statusCode }
    );
  } finally {
    client?.release();
  }
}
