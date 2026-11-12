
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { pool } from "@/lib/db";
import type { PoolClient } from "pg";

type JwtPayload = jwt.JwtPayload & {
  id?: string;
};

type PRAllocationInput = {
  purchase_request_id: string;
  amount: number;
};

class ValidationError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "ValidationError";
    this.status = status;
  }
}

function errorResponse(message: string, status = 400) {
  return NextResponse.json(
    { success: false, message },
    { status }
  );
}

function getUserId(request: NextRequest): string | null {
  const token = request.cookies.get("token")?.value;
  const secret = process.env.JWT_SECRET;

  if (!token || !secret) return null;

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;

    return typeof decoded.id === "string"
      ? decoded.id
      : null;
  } catch {
    return null;
  }
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value
  );
}

function money(value: unknown): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) return NaN;

  return Math.round((parsed + Number.EPSILON) * 100) / 100;
}

// =====================================================
// VALIDATE PR ALLOCATIONS
// Locks PR rows to prevent concurrent over-allocation.
// =====================================================

async function validatePRAllocations(
  client: PoolClient,
  allocations: PRAllocationInput[]
) {
  const prIds = allocations
    .map((item) => item.purchase_request_id)
    .sort();

  const prResult = await client.query(
    `
      SELECT
        id,
        pr_number,
        total_amount
      FROM purchase_requests
      WHERE id = ANY($1::uuid[])
      ORDER BY id
      FOR UPDATE
    `,
    [prIds]
  );

  if (prResult.rows.length !== prIds.length) {
    throw new ValidationError(
      "One or more selected Purchase Requests do not exist."
    );
  }

  const prMap = new Map<
    string,
    {
      pr_number: string;
      total_amount: number;
    }
  >();

  for (const pr of prResult.rows) {
    prMap.set(pr.id, {
      pr_number: pr.pr_number,
      total_amount: money(pr.total_amount),
    });
  }

  // Get all existing allocations for the selected PRs.
  const allocatedResult = await client.query(
    `
      SELECT
        purchase_request_id,
        COALESCE(SUM(amount), 0) AS allocated_amount
      FROM purchase_request_obr_links
      WHERE purchase_request_id = ANY($1::uuid[])
      GROUP BY purchase_request_id
    `,
    [prIds]
  );

  const allocatedMap = new Map<string, number>();

  for (const row of allocatedResult.rows) {
    allocatedMap.set(
      row.purchase_request_id,
      money(row.allocated_amount)
    );
  }

  // Validate each allocation.
  for (const item of allocations) {
    const pr = prMap.get(item.purchase_request_id);

    if (!pr) {
      throw new ValidationError(
        "A selected Purchase Request does not exist."
      );
    }

    const currentAllocated =
      allocatedMap.get(item.purchase_request_id) || 0;

    const remaining = money(
      pr.total_amount - currentAllocated
    );

    if (item.amount > remaining) {
      throw new ValidationError(
        `PR ${pr.pr_number} has only ₱${remaining.toLocaleString(
          "en-PH",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        )} remaining. You cannot allocate ₱${item.amount.toLocaleString(
          "en-PH",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        )}.`
      );
    }
  }
}

// =====================================================
// GET OBR RECORDS AND FORM OPTIONS
// =====================================================

export async function GET(request: NextRequest) {
  const userId = getUserId(request);

  if (!userId) {
    return errorResponse("Unauthorized.", 401);
  }

  try {
    const [
      obrsResult,
      prsResult,
      officesResult,
      subOfficesResult,
      categoriesResult,
      accountsResult,
    ] = await Promise.all([
      // -----------------------------------------------
      // OBR RECORDS
      // -----------------------------------------------

      pool.query(`
        SELECT
          obr.*,

          o.office_name,
          so.sub_office_name,

          c.category_code,
          c.category_name,

          a.account_code,
          a.account_name,

          (
            SELECT COUNT(*)::integer
            FROM purchase_request_obr_links l
            WHERE l.obr_id = obr.id
          ) AS pr_count,

          COALESCE(
            (
              SELECT SUM(l.amount)
              FROM purchase_request_obr_links l
              WHERE l.obr_id = obr.id
            ),
            0
          ) AS total_allocation,

          COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'id', pr.id,
                  'pr_number', pr.pr_number,
                  'pr_date', pr.pr_date,
                  'purpose', pr.purpose,
                  'amount', l.amount
                )
                ORDER BY pr.pr_number
              )
              FROM purchase_request_obr_links l
              INNER JOIN purchase_requests pr
                ON pr.id = l.purchase_request_id
              WHERE l.obr_id = obr.id
            ),
            '[]'::json
          ) AS purchase_requests

        FROM purchase_request_obrs obr

        LEFT JOIN offices o
          ON o.id = obr.office_id

        LEFT JOIN sub_offices so
          ON so.id = obr.sub_office_id

        LEFT JOIN expense_account_category c
          ON c.id = obr.category_id

        LEFT JOIN expense_accounts a
          ON a.id = obr.account_id

        ORDER BY
          obr.obr_date DESC,
          obr.created_at DESC
      `),

      // -----------------------------------------------
      // PURCHASE REQUESTS WITH ALLOCATION BALANCES
      // -----------------------------------------------

      pool.query(`
        SELECT
          pr.id,
          pr.pr_number,
          pr.pr_date,
          pr.purpose,
          pr.total_amount,
          pr.office_id,
          o.office_name,

          COALESCE(
            allocation.allocated_amount,
            0
          ) AS allocated_amount,

          GREATEST(
            pr.total_amount -
            COALESCE(allocation.allocated_amount, 0),
            0
          ) AS remaining_amount

        FROM purchase_requests pr

        LEFT JOIN offices o
          ON o.id = pr.office_id

        LEFT JOIN (
          SELECT
            purchase_request_id,
            SUM(amount) AS allocated_amount
          FROM purchase_request_obr_links
          GROUP BY purchase_request_id
        ) allocation
          ON allocation.purchase_request_id = pr.id

        ORDER BY
          pr.pr_date DESC,
          pr.pr_number DESC
      `),

      // -----------------------------------------------
      // OFFICES
      // -----------------------------------------------

      pool.query(`
        SELECT
          id,
          office_name
        FROM offices
        ORDER BY office_name
      `),

      // -----------------------------------------------
      // SUB-OFFICES
      // -----------------------------------------------

      pool.query(`
        SELECT
          id,
          office_id,
          sub_office_name
        FROM sub_offices
        ORDER BY sub_office_name
      `),

      // -----------------------------------------------
      // EXPENSE ACCOUNT CATEGORIES
      // Categories are independent of offices.
      // -----------------------------------------------

      pool.query(`
        SELECT
          id,
          category_code,
          category_name
        FROM expense_account_category
        ORDER BY category_code
      `),

      // -----------------------------------------------
      // EXPENSE ACCOUNTS
      // -----------------------------------------------

      pool.query(`
        SELECT
          id,
          category_id,
          account_code,
          account_name
        FROM expense_accounts
        ORDER BY account_code
      `),
    ]);

    return NextResponse.json({
      success: true,
      data: obrsResult.rows,
      purchaseRequests: prsResult.rows,
      offices: officesResult.rows,
      subOffices: subOfficesResult.rows,
      categories: categoriesResult.rows,
      accounts: accountsResult.rows,
    });
  } catch (error) {
    console.error(
      "GET /budget/api/obrs:",
      error
    );

    return errorResponse(
      error instanceof Error
        ? error.message
        : "Unable to load OBR records.",
      500
    );
  }
}

// =====================================================
// CREATE OBR AND LINK PURCHASE REQUESTS
// =====================================================

export async function POST(request: NextRequest) {
  const userId = getUserId(request);

  if (!userId) {
    return errorResponse("Unauthorized.", 401);
  }

  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return errorResponse("Invalid request body.");
  }

  const {
    obr_number,
    obr_date,
    payee,
    particulars,
    office_id,
    sub_office_id,
    category_id,
    account_id,
    remarks,
    purchase_requests,
  } = body;

  // -----------------------------------------------
  // REQUIRED OBR FIELDS
  // -----------------------------------------------

  if (
    !String(obr_number || "").trim() ||
    !String(obr_date || "").trim() ||
    !String(payee || "").trim() ||
    !String(particulars || "").trim() ||
    !office_id ||
    !category_id ||
    !account_id
  ) {
    return errorResponse(
      "Complete all required OBR fields."
    );
  }

  // -----------------------------------------------
  // VALIDATE PURCHASE REQUEST ARRAY
  // -----------------------------------------------

  if (
    !Array.isArray(purchase_requests) ||
    purchase_requests.length === 0
  ) {
    return errorResponse(
      "Add at least one Purchase Request."
    );
  }

  const normalizedAllocations: PRAllocationInput[] = [];
  const seen = new Set<string>();

  for (const item of purchase_requests) {
    const prId = String(
      item?.purchase_request_id || ""
    ).trim();

    const amount = money(item?.amount);

    if (!prId || !isUuid(prId)) {
      return errorResponse(
        "Each linked PR must have a valid ID."
      );
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return errorResponse(
        "Each PR allocation must be greater than zero."
      );
    }

    if (seen.has(prId)) {
      return errorResponse(
        "A Purchase Request cannot be added more than once to the same OBR."
      );
    }

    seen.add(prId);

    normalizedAllocations.push({
      purchase_request_id: prId,
      amount,
    });
  }

  // -----------------------------------------------
  // VALIDATE OBR DATE
  // -----------------------------------------------

  if (
    typeof obr_date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(obr_date)
  ) {
    return errorResponse("Invalid OBR date.");
  }

  const parsedDate = new Date(
    `${obr_date}T00:00:00.000Z`
  );

  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== obr_date
  ) {
    return errorResponse("Invalid OBR date.");
  }

  // -----------------------------------------------
  // COMPUTE TOTAL OBR OBLIGATION AMOUNT
  // -----------------------------------------------

  const obligationAmount = money(
    normalizedAllocations.reduce(
      (total, item) => total + item.amount,
      0
    )
  );

  if (
    !Number.isFinite(obligationAmount) ||
    obligationAmount <= 0
  ) {
    return errorResponse(
      "The OBR obligation amount must be greater than zero."
    );
  }

  // -----------------------------------------------
  // DATABASE TRANSACTION
  // -----------------------------------------------

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Lock and validate PR balances before inserting.
    await validatePRAllocations(
      client,
      normalizedAllocations
    );

    // ---------------------------------------------
    // INSERT OBR MASTER
    // ---------------------------------------------

    const obrResult = await client.query(
      `
        INSERT INTO purchase_request_obrs (
          obr_number,
          obr_date,
          payee,
          particulars,
          office_id,
          sub_office_id,
          category_id,
          account_id,
          obligation_amount,
          remarks,
          created_by,
          updated_by,
          created_at,
          updated_at
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11, $11, NOW(), NOW()
        )
        RETURNING *
      `,
      [
        String(obr_number).trim(),
        obr_date,
        String(payee).trim(),
        String(particulars).trim(),
        office_id,
        sub_office_id || null,
        category_id,
        account_id,
        obligationAmount,
        remarks ? String(remarks).trim() : null,
        userId,
      ]
    );

    const obr = obrResult.rows[0];

    // ---------------------------------------------
    // INSERT PR-OBR LINKS
    // ---------------------------------------------

    const savedLinks = [];

    for (const item of normalizedAllocations) {
      const linkResult = await client.query(
        `
          INSERT INTO purchase_request_obr_links (
            purchase_request_id,
            obr_id,
            amount,
            created_at
          )
          VALUES ($1, $2, $3, NOW())
          RETURNING
            id,
            purchase_request_id,
            obr_id,
            amount,
            created_at
        `,
        [
          item.purchase_request_id,
          obr.id,
          item.amount,
        ]
      );

      savedLinks.push(linkResult.rows[0]);
    }

    // ---------------------------------------------
    // COMMIT
    // ---------------------------------------------

    await client.query("COMMIT");

    return NextResponse.json(
      {
        success: true,
        message: "OBR created successfully.",
        data: {
          ...obr,
          obligation_amount: Number(obr.obligation_amount),
          purchase_requests: savedLinks,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // Preserve the original error.
    }

    const dbError = error as {
      code?: string;
      message?: string;
    };

    console.error(
      "POST /budget/api/obrs:",
      error
    );

    if (error instanceof ValidationError) {
      return errorResponse(
        error.message,
        error.status
      );
    }

    if (dbError.code === "23505") {
      return errorResponse(
        "The OBR number already exists.",
        409
      );
    }

    if (dbError.code === "23503") {
      return errorResponse(
        "One of the selected office, category, account, or Purchase Request records is invalid.",
        400
      );
    }

    return errorResponse(
      error instanceof Error
        ? error.message
        : "Unable to save OBR.",
      500
    );
  } finally {
    client.release();
  }
}
