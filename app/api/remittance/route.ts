import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { pool } from "@/lib/db";

/* ============================================================
   POST REMITTANCE
   Creates one remittance transaction for the whole RCD
============================================================ */

export async function POST(request: NextRequest) {
  const client = await pool.connect();

  try {
    /* ==========================================================
       AUTHENTICATION
    ========================================================== */

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

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as {
      id: string;
    };

    /* ==========================================================
       VERIFY USER
    ========================================================== */

    const userResult = await client.query(
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

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 401 }
      );
    }

    const user = userResult.rows[0];

    /* ==========================================================
       REQUEST BODY
    ========================================================== */

    const body = await request.json();

    const {
      rcd_transaction_id,
      remittance_no,
      remarks,
    } = body;

    /* ==========================================================
       VALIDATION
    ========================================================== */

    if (!rcd_transaction_id) {
      return NextResponse.json(
        {
          success: false,
          error: "RCD transaction ID is required",
        },
        { status: 400 }
      );
    }

    if (
      !remittance_no ||
      !String(remittance_no).trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Remittance number is required",
        },
        { status: 400 }
      );
    }

    /* ==========================================================
       BEGIN TRANSACTION
    ========================================================== */

    await client.query("BEGIN");

    /* ==========================================================
       GET RCD
    ========================================================== */

    const rcdResult = await client.query(
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
        rt.rcd_by
      FROM rcd_transaction rt
      WHERE rt.id = $1
      FOR UPDATE
      `,
      [rcd_transaction_id]
    );

    if (rcdResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,
          error: "RCD transaction not found",
        },
        { status: 404 }
      );
    }

    const rcd = rcdResult.rows[0];

    /* ==========================================================
       CHECK RCD STATUS
    ========================================================== */

    if (rcd.status !== "FOR REMITTANCE") {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,
          error: `RCD cannot be remitted because its status is "${rcd.status}".`,
        },
        { status: 400 }
      );
    }

    /* ==========================================================
       CHECK IF RCD IS ALREADY REMITTED
    ========================================================== */

    const existingRCD = await client.query(
      `
      SELECT
        id,
        remittance_no,
        status
      FROM remittance_transactions
      WHERE rcd_transaction_id = $1
      LIMIT 1
      `,
      [rcd_transaction_id]
    );

    if (existingRCD.rows.length > 0) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,
          error:
            "This RCD has already been added to a remittance.",
          remittance: existingRCD.rows[0],
        },
        { status: 409 }
      );
    }

    /* ==========================================================
       CHECK REMITTANCE NUMBER
    ========================================================== */

    const existingRemittance =
      await client.query(
        `
        SELECT
          id,
          remittance_no,
          status
        FROM remittance_transactions
        WHERE remittance_no = $1
        LIMIT 1
        `,
        [String(remittance_no).trim()]
      );

    if (existingRemittance.rows.length > 0) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,
          error:
            "Remittance number already exists.",
          remittance:
            existingRemittance.rows[0],
        },
        { status: 409 }
      );
    }

    /* ==========================================================
       INSERT REMITTANCE
    ========================================================== */

    const insertResult = await client.query(
      `
      INSERT INTO remittance_transactions (
        id,
        remittance_no,
        remittance_date,
        rcd_transaction_id,
        total_amount,
        status,
        remarks,
        prepared_by,
        created_at,
        updated_at
      )
      VALUES (
        gen_random_uuid(),
        $1,
        CURRENT_DATE,
        $2,
        $3,
        'APPROVED',
        $4,
        $5,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
      RETURNING
        id,
        remittance_no,
        remittance_date,
        rcd_transaction_id,
        total_amount,
        status,
        remarks,
        prepared_by,
        created_at,
        updated_at
      `,
      [
        String(remittance_no).trim(),
        rcd_transaction_id,
        Number(rcd.total_collections || 0),
        remarks || null,
        user.id,
      ]
    );

    const remittance =
      insertResult.rows[0];

    /* ==========================================================
       UPDATE RCD
       
       Whole RCD has now been remitted.
    ========================================================== */

    await client.query(
      `
      UPDATE rcd_transaction
      SET
        total_remittances = COALESCE(total_remittances, 0)
          + COALESCE(total_collections, 0),

        balance = COALESCE(balance, 0)
          - COALESCE(total_collections, 0),

        status = 'REMITTED',

        updated_at = CURRENT_TIMESTAMP

      WHERE id = $1
      `,
      [rcd_transaction_id]
    );

    /* ==========================================================
       COMMIT
    ========================================================== */

    await client.query("COMMIT");

    /* ==========================================================
       RESPONSE
    ========================================================== */

    return NextResponse.json(
      {
        success: true,
        message:
          "Remittance successfully created.",
        remittance: {
          id: remittance.id,
          remittanceNo:
            remittance.remittance_no,
          remittanceDate:
            remittance.remittance_date,
          rcdTransactionId:
            remittance.rcd_transaction_id,
          amount:
            Number(
              remittance.total_amount || 0
            ),
          status:
            remittance.status,
          preparedBy:
            remittance.prepared_by,
          createdAt:
            remittance.created_at,
        },
      },
      { status: 201 }
    );

  } catch (error) {
    /* ==========================================================
       ROLLBACK
    ========================================================== */

    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error(
        "Rollback error:",
        rollbackError
      );
    }

    console.error(
      "POST /api/remittance error:",
      error
    );

    /* ==========================================================
       UNIQUE CONSTRAINT
    ========================================================== */

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: string }).code ===
        "23505"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Remittance number or RCD already exists.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create remittance.",
      },
      { status: 500 }
    );

  } finally {
    client.release();
  }
}