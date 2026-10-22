
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { pool } from "@/lib/db";

export async function POST(request: NextRequest) {
  const client = await pool.connect();
  let transactionStarted = false;

  try {
    // Authenticate
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured.");
    }

    let decoded: { id: string };

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      ) as { id: string };
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid or expired token." },
        { status: 401 }
      );
    }

    const userResult = await client.query(
      `
      SELECT id, full_name, username
      FROM public.users
      WHERE id = $1
      LIMIT 1
      `,
      [decoded.id]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "User not found." },
        { status: 401 }
      );
    }

    const user = userResult.rows[0];

    // Parse request
    let body: {
      rcd_transaction_id?: string;
      remittance_no?: string;
      remarks?: string | null;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const rcdTransactionId = String(
      body.rcd_transaction_id ?? ""
    ).trim();

    const remittanceNo = String(
      body.remittance_no ?? ""
    ).trim();

    const remarks =
      body.remarks == null
        ? null
        : String(body.remarks).trim() || null;

    if (!rcdTransactionId) {
      return NextResponse.json(
        {
          success: false,
          error: "RCD transaction ID is required.",
        },
        { status: 400 }
      );
    }

    if (!remittanceNo) {
      return NextResponse.json(
        {
          success: false,
          error: "Remittance number is required.",
        },
        { status: 400 }
      );
    }

    await client.query("BEGIN");
    transactionStarted = true;

    // Lock original RCD
    const rcdResult = await client.query(
      `
      SELECT
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
        rcd_by
      FROM public.rcd_transaction
      WHERE id = $1
      FOR UPDATE
      `,
      [rcdTransactionId]
    );

    if (rcdResult.rows.length === 0) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return NextResponse.json(
        { success: false, error: "RCD transaction not found." },
        { status: 404 }
      );
    }

    const rcd = rcdResult.rows[0];

    if (
      String(rcd.status ?? "").trim().toUpperCase() !==
      "FOR REMITTANCE"
    ) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return NextResponse.json(
        {
          success: false,
          error: `RCD cannot be remitted because its status is "${rcd.status}".`,
        },
        { status: 400 }
      );
    }

    // Prevent duplicate remittance for the same RCD
    const existingRCD = await client.query(
      `
      SELECT id, remittance_no
      FROM public.rcd_remittance_transactions
      WHERE rcd_transaction_id = $1
      LIMIT 1
      `,
      [rcdTransactionId]
    );

    if (existingRCD.rows.length > 0) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return NextResponse.json(
        {
          success: false,
          error: "This RCD has already been added to a remittance.",
          remittance: existingRCD.rows[0],
        },
        { status: 409 }
      );
    }

    // Prevent duplicate remittance number
    const existingNumber = await client.query(
      `
      SELECT id
      FROM public.rcd_remittance_transactions
      WHERE remittance_no = $1
      LIMIT 1
      `,
      [remittanceNo]
    );

    if (existingNumber.rows.length > 0) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return NextResponse.json(
        {
          success: false,
          error: "Remittance number already exists.",
        },
        { status: 409 }
      );
    }

    const totalCollections = Number(
      rcd.total_collections ?? 0
    );

    const totalRemittances = Number(
      rcd.total_remittances ?? 0
    );

    const totalDeposits = Number(
      rcd.total_deposits ?? 0
    );

    const balance = Number(rcd.balance ?? 0);

    if (
      !Number.isFinite(totalCollections) ||
      !Number.isFinite(totalRemittances) ||
      !Number.isFinite(totalDeposits) ||
      !Number.isFinite(balance)
    ) {
      throw new Error("The RCD contains an invalid amount.");
    }

    // Insert remittance snapshot
    const insertResult = await client.query(
      `
      INSERT INTO public.rcd_remittance_transactions (
        id,
        remittance_no,
        remittance_date,
        rcd_transaction_id,
        report_no,
        report_date,
        fund_source_id,
        date_from,
        date_to,
        total_collections,
        total_remittances,
        total_deposits,
        balance,
        rcd_status,
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
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11,
        $12,
        $13,
        'APPROVED',
        $14,
        $15,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
      RETURNING *
      `,
      [
        remittanceNo,
        rcd.id,
        rcd.report_no,
        rcd.report_date,
        rcd.fund_source_id,
        rcd.date_from,
        rcd.date_to,
        totalCollections,
        totalRemittances,
        totalDeposits,
        balance,
        rcd.status,
        totalCollections,
        remarks,
        user.id,
      ]
    );

    const remittance = insertResult.rows[0];

    // Apply remittance to original RCD
    await client.query(
      `
      UPDATE public.rcd_transaction
      SET
        total_remittances =
          COALESCE(total_remittances, 0)
          + COALESCE(total_collections, 0),
        balance =
          COALESCE(balance, 0)
          - COALESCE(total_collections, 0),
        status = 'REMITTED',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      `,
      [rcd.id]
    );

    await client.query("COMMIT");
    transactionStarted = false;

    return NextResponse.json(
      {
        success: true,
        message: "Remittance successfully created.",
        remittance: {
          id: remittance.id,
          remittanceNo: remittance.remittance_no,
          remittanceDate: remittance.remittance_date,
          rcdTransactionId: remittance.rcd_transaction_id,
          rcd: {
            reportNo: remittance.report_no,
            reportDate: remittance.report_date,
            fundSourceId: remittance.fund_source_id,
            coverageFrom: remittance.date_from,
            coverageTo: remittance.date_to,
            totalCollections: Number(
              remittance.total_collections
            ),
            totalRemittances: Number(
              remittance.total_remittances
            ),
            totalDeposits: Number(
              remittance.total_deposits
            ),
            balance: Number(remittance.balance),
            status: remittance.rcd_status,
          },
          amount: Number(remittance.total_amount),
          status: remittance.status,
          remarks: remittance.remarks,
          preparedBy: remittance.prepared_by,
          createdAt: remittance.created_at,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Remittance rollback error:", rollbackError);
      }
    }

    console.error("POST /api/remittance error:", error);

    const dbError = error as { code?: string };

    if (dbError.code === "23505") {
      return NextResponse.json(
        {
          success: false,
          error: "Remittance number or RCD already exists.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error
          ? error.message
          : "Failed to create remittance.",
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
