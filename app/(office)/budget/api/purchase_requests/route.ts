
import { NextRequest, NextResponse } from "next/server";
import type { PoolClient } from "pg";
import { pool } from "@/lib/db";

type PurchaseRequestItemInput = {
  unit: string;
  quantity: number;
  item_description: string;
  specifications?: string | null;
  estimated_unit_cost: number;
  total_cost?: number;
};

type ObrInput = {
  obr_number: string;
  obr_date: string;
  payee: string;
  office_id: string;
  sub_office_id?: string | null;
  category_id: string;
  account_id: string;
  particulars: string;
  amount: number;
  remarks?: string | null;
};

type PurchaseRequestInput = {
  pr_date: string;
  pr_number?: string;
  rp_number?: string;
  office_id?: string | null;
  sub_office_id?: string | null;
  category_id?: string | null;
  account_id?: string | null;
  purpose?: string | null;
  remarks?: string | null;
  items: PurchaseRequestItemInput[];
  obrs?: ObrInput[];
};

function errorResponse(message: string, status = 400) {
  return NextResponse.json(
    { success: false, message },
    { status }
  );
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function optionalUuid(value: unknown): string | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  return typeof value === "string" ? value : null;
}

function isValidDate(value: unknown): value is string {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

function money(value: unknown): number {
  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? Math.round((parsed + Number.EPSILON) * 100) / 100
    : NaN;
}

/* =========================================================
   PURCHASE REQUEST CLASSIFICATION VALIDATION
========================================================= */

async function validatePurchaseRequestClassification(
  client: PoolClient,
  values: {
    office_id: string | null;
    sub_office_id: string | null;
    category_id: string | null;
    account_id: string | null;
  }
) {
  const {
    office_id,
    sub_office_id,
    category_id,
    account_id,
  } = values;

  if (office_id) {
    const office = await client.query(
      `SELECT 1
       FROM offices
       WHERE id = $1
       LIMIT 1`,
      [office_id]
    );

    if (office.rowCount === 0) {
      throw new Error(
        "The selected purchase request office does not exist."
      );
    }
  }

  if (sub_office_id) {
    const subOffice = await client.query(
      `SELECT 1
       FROM sub_offices
       WHERE id = $1
         AND ($2::uuid IS NULL OR office_id = $2::uuid)
       LIMIT 1`,
      [sub_office_id, office_id]
    );

    if (subOffice.rowCount === 0) {
      throw new Error(
        "The selected purchase request sub-office does not belong to the selected office."
      );
    }
  }

  if (category_id) {
    const category = await client.query(
      `SELECT 1
       FROM expense_account_category
       WHERE id = $1
       LIMIT 1`,
      [category_id]
    );

    if (category.rowCount === 0) {
      throw new Error(
        "The selected purchase request expense category does not exist."
      );
    }
  }

  if (account_id) {
    const account = await client.query(
      `SELECT 1
       FROM expense_accounts ea
       WHERE ea.id = $1
         AND (
           $2::uuid IS NULL
           OR ea.category_id = $2::uuid
         )
       LIMIT 1`,
      [account_id, category_id]
    );

    if (account.rowCount === 0) {
      throw new Error(
        "The selected purchase request expense account does not belong to the selected category."
      );
    }
  }
}

/* =========================================================
   OBR CLASSIFICATION VALIDATION
========================================================= */

async function validateObrClassification(
  client: PoolClient,
  obr: ObrInput
) {
  if (!isNonEmptyString(obr.office_id)) {
    throw new Error(
      `OBR ${obr.obr_number}: office is required.`
    );
  }

  if (!isNonEmptyString(obr.category_id)) {
    throw new Error(
      `OBR ${obr.obr_number}: expense category is required.`
    );
  }

  if (!isNonEmptyString(obr.account_id)) {
    throw new Error(
      `OBR ${obr.obr_number}: expense account is required.`
    );
  }

  const office = await client.query(
    `SELECT 1
     FROM offices
     WHERE id = $1
     LIMIT 1`,
    [obr.office_id]
  );

  if (office.rowCount === 0) {
    throw new Error(
      `OBR ${obr.obr_number}: selected office does not exist.`
    );
  }

  if (obr.sub_office_id) {
    const subOffice = await client.query(
      `SELECT 1
       FROM sub_offices
       WHERE id = $1
       LIMIT 1`,
      [obr.sub_office_id]
    );

    if (subOffice.rowCount === 0) {
      throw new Error(
        `OBR ${obr.obr_number}: selected sub-office does not exist.`
      );
    }
  }

  const category = await client.query(
    `SELECT
       id,
       category_code,
       category_name
     FROM expense_account_category
     WHERE id = $1
     LIMIT 1`,
    [obr.category_id]
  );

  if (category.rowCount === 0) {
    throw new Error(
      `OBR ${obr.obr_number}: selected expense category does not exist.`
    );
  }

  const account = await client.query(
    `SELECT
       ea.id,
       ea.category_id
     FROM expense_accounts ea
     WHERE ea.id = $1
       AND ea.category_id = $2
     LIMIT 1`,
    [
      obr.account_id,
      obr.category_id,
    ]
  );

  if (account.rowCount === 0) {
    throw new Error(
      `OBR ${obr.obr_number}: selected expense account does not belong to the selected expense category.`
    );
  }
}

/* =========================================================
   GET PURCHASE REQUEST LIST
   Supports: year, office_id, status, search
========================================================= */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const yearParam = searchParams.get("year");
    const officeId = searchParams.get("office_id") || "";
    const status = searchParams.get("status") || "";
    const search = (searchParams.get("search") || "").trim();

    let year: number | null = null;

    if (yearParam && yearParam !== "All") {
      year = Number(yearParam);

      if (!Number.isInteger(year) || year < 1900 || year > 9999) {
        return errorResponse("Invalid year parameter.", 400);
      }
    }

    const values: unknown[] = [];
    const where: string[] = [];

    if (year !== null) {
      values.push(year);
      where.push(
        `EXTRACT(YEAR FROM pr.pr_date) = $${values.length}`
      );
    }

    if (officeId && officeId !== "All") {
      values.push(officeId);
      where.push(
        `pr.office_id = $${values.length}::uuid`
      );
    }

    if (status && status !== "All") {
      values.push(status);
      where.push(
        `LOWER(pr.status) = LOWER($${values.length})`
      );
    }

    if (search) {
      values.push(`%${search}%`);
      const p = `$${values.length}`;

      where.push(`(
        pr.pr_number ILIKE ${p}
        OR COALESCE(pr.purpose, '') ILIKE ${p}
        OR COALESCE(pr.remarks, '') ILIKE ${p}
        OR COALESCE(o.office_name, '') ILIKE ${p}
        OR COALESCE(so.sub_office_name, '') ILIKE ${p}
      )`);
    }

    const whereSql = where.length
      ? `WHERE ${where.join(" AND ")}`
      : "";

    const [
      recordsResult,
      officesResult,
      subOfficesResult,
    ] = await Promise.all([
      pool.query(
        `
        SELECT
          pr.*,
          o.office_name,
          so.sub_office_name,
          cat.category_code,
          cat.category_name,
          ea.account_code,
          ea.account_name,

          (
            SELECT COUNT(*)::integer
            FROM purchase_request_items pri
            WHERE pri.purchase_request_id = pr.id
          ) AS item_count,

          (
            SELECT COALESCE(SUM(pri.total_cost), 0)
            FROM purchase_request_items pri
            WHERE pri.purchase_request_id = pr.id
          ) AS items_total,

          (
            SELECT COUNT(*)::integer
            FROM purchase_request_obr_links prol
            WHERE prol.purchase_request_id = pr.id
          ) AS obr_count,

          (
            SELECT COALESCE(SUM(prol.amount), 0)
            FROM purchase_request_obr_links prol
            WHERE prol.purchase_request_id = pr.id
          ) AS obr_total

        FROM purchase_requests pr

        LEFT JOIN offices o
          ON o.id = pr.office_id

        LEFT JOIN sub_offices so
          ON so.id = pr.sub_office_id

        LEFT JOIN expense_account_category cat
          ON cat.id = pr.category_id

        LEFT JOIN expense_accounts ea
          ON ea.id = pr.account_id

        ${whereSql}

        ORDER BY
          pr.pr_date DESC,
          pr.created_at DESC
        `,
        values
      ),

      pool.query(
        `SELECT
           id,
           office_code,
           office_name,
           is_active
         FROM offices
         ORDER BY office_name`
      ),

      pool.query(
        `SELECT
           id,
           office_id,
           sub_office_code,
           sub_office_name,
           is_active
         FROM sub_offices
         ORDER BY sub_office_name`
      ),
    ]);

    return NextResponse.json({
      success: true,
      data: recordsResult.rows,
      offices: officesResult.rows,
      subOffices: subOfficesResult.rows,
    });

  } catch (error) {
    console.error(
      "GET /budget/api/purchase_requests error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to fetch purchase requests.",
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   POST PURCHASE REQUEST
========================================================= */

export async function POST(request: NextRequest) {
  let client: PoolClient | undefined;

  try {
    const body = (await request.json()) as PurchaseRequestInput;

    /* -------------------------------
       BASIC VALIDATION
    -------------------------------- */

    const prNumber = (
      body.pr_number ||
      body.rp_number ||
      ""
    ).trim();

    if (!isValidDate(body.pr_date)) {
      return errorResponse(
        "A valid purchase request date is required."
      );
    }

    if (!isNonEmptyString(prNumber)) {
      return errorResponse("PR number is required.");
    }

    if (
      !Array.isArray(body.items) ||
      body.items.length === 0
    ) {
      return errorResponse(
        "At least one purchase request item is required."
      );
    }

    /* -------------------------------
       NORMALIZE ITEMS
    -------------------------------- */

    const normalizedItems = body.items.map((item) => ({
      unit:
        typeof item.unit === "string"
          ? item.unit.trim()
          : "",

      quantity: Number(item.quantity),

      item_description:
        typeof item.item_description === "string"
          ? item.item_description.trim()
          : "",

      specifications:
        typeof item.specifications === "string"
          ? item.specifications.trim()
          : null,

      estimated_unit_cost: money(
        item.estimated_unit_cost
      ),
    }));

    if (
      normalizedItems.some(
        (item) =>
          !item.unit ||
          !item.item_description ||
          !Number.isFinite(item.quantity) ||
          item.quantity <= 0 ||
          !Number.isFinite(item.estimated_unit_cost) ||
          item.estimated_unit_cost < 0
      )
    ) {
      return errorResponse(
        "One or more purchase request items have invalid details."
      );
    }

    /* -------------------------------
       PR CLASSIFICATION
    -------------------------------- */

    const officeId = optionalUuid(body.office_id);
    const subOfficeId = optionalUuid(body.sub_office_id);
    const categoryId = optionalUuid(body.category_id);
    const accountId = optionalUuid(body.account_id);

    /* -------------------------------
       NORMALIZE OBRs
    -------------------------------- */

    const obrs = Array.isArray(body.obrs)
      ? body.obrs
      : [];

    const normalizedObrs = obrs.map((obr) => ({
      ...obr,

      obr_number:
        typeof obr.obr_number === "string"
          ? obr.obr_number.trim()
          : "",

      payee:
        typeof obr.payee === "string"
          ? obr.payee.trim()
          : "",

      particulars:
        typeof obr.particulars === "string"
          ? obr.particulars.trim()
          : "",

      office_id:
        typeof obr.office_id === "string"
          ? obr.office_id
          : "",

      sub_office_id: optionalUuid(
        obr.sub_office_id
      ),

      category_id:
        typeof obr.category_id === "string"
          ? obr.category_id
          : "",

      account_id:
        typeof obr.account_id === "string"
          ? obr.account_id
          : "",

      amount: money(obr.amount),
    }));

    if (normalizedObrs.length === 0) {
      return errorResponse(
        "At least one OBR is required for every purchase request."
      );
    }

    if (
      normalizedObrs.some(
        (obr) =>
          !obr.obr_number ||
          !isValidDate(obr.obr_date) ||
          !obr.payee ||
          !obr.office_id ||
          !obr.category_id ||
          !obr.account_id ||
          !obr.particulars ||
          !Number.isFinite(obr.amount) ||
          obr.amount <= 0
      )
    ) {
      return errorResponse(
        "One or more OBR records have incomplete or invalid details."
      );
    }

    /* -------------------------------
       DUPLICATE OBR NUMBER CHECK
    -------------------------------- */

    const duplicateObrNumbers = normalizedObrs
      .map((obr) => obr.obr_number.toLowerCase())
      .filter(
        (number, index, all) =>
          all.indexOf(number) !== index
      );

    if (duplicateObrNumbers.length > 0) {
      return errorResponse(
        "The same OBR number cannot be added more than once to this purchase request."
      );
    }

    /* -------------------------------
       COMPUTE ITEM TOTALS
    -------------------------------- */

    const itemRows = normalizedItems.map((item) => ({
      ...item,
      total_cost: money(
        item.quantity * item.estimated_unit_cost
      ),
    }));

    const totalAmount = money(
      itemRows.reduce(
        (sum, item) => sum + item.total_cost,
        0
      )
    );

    const totalObrAllocation = money(
      normalizedObrs.reduce(
        (sum, obr) => sum + obr.amount,
        0
      )
    );

    /* -------------------------------
       EXACT OBR ALLOCATION VALIDATION
    -------------------------------- */

    const prTotalInCents = Math.round(totalAmount * 100);
    const obrTotalInCents = Math.round(
      totalObrAllocation * 100
    );

    if (prTotalInCents !== obrTotalInCents) {
      return errorResponse(
        `Total OBR allocation must exactly match the purchase request total. PR Total: ${totalAmount.toFixed(2)} | OBR Total: ${totalObrAllocation.toFixed(2)}.`
      );
    }

    const purpose =
      (body.purpose || "").trim() ||
      itemRows
        .map((item) => item.item_description)
        .join(", ");

    /* -------------------------------
       START DATABASE TRANSACTION
    -------------------------------- */

    client = await pool.connect();

    await client.query("BEGIN");

    /* -------------------------------
       VALIDATE PR CLASSIFICATION
    -------------------------------- */

    await validatePurchaseRequestClassification(
      client,
      {
        office_id: officeId,
        sub_office_id: subOfficeId,
        category_id: categoryId,
        account_id: accountId,
      }
    );

    /* -------------------------------
       VALIDATE OBR CLASSIFICATIONS
    -------------------------------- */

    for (const obr of normalizedObrs) {
      await validateObrClassification(
        client,
        obr
      );
    }

    /* -------------------------------
       INSERT PURCHASE REQUEST
    -------------------------------- */

    const prResult = await client.query(
      `INSERT INTO purchase_requests (
         pr_number,
         pr_date,
         office_id,
         sub_office_id,
         category_id,
         account_id,
         purpose,
         remarks,
         total_amount,
         status
       )
       VALUES (
         $1, $2, $3, $4, $5,
         $6, $7, $8, $9, 'draft'
       )
       RETURNING
         id,
         pr_number,
         pr_date,
         office_id,
         sub_office_id,
         category_id,
         account_id,
         purpose,
         remarks,
         total_amount,
         status,
         created_at`,
      [
        prNumber,
        body.pr_date,
        officeId,
        subOfficeId,
        categoryId,
        accountId,
        purpose,
        (body.remarks || "").trim() || null,
        totalAmount,
      ]
    );

    const purchaseRequest = prResult.rows[0];

    /* -------------------------------
       INSERT PURCHASE REQUEST ITEMS
    -------------------------------- */

    for (
      let index = 0;
      index < itemRows.length;
      index++
    ) {
      const item = itemRows[index];

      await client.query(
        `INSERT INTO purchase_request_items (
           purchase_request_id,
           item_no,
           unit,
           quantity,
           item_description,
           specifications,
           estimated_unit_cost,
           total_cost
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          purchaseRequest.id,
          index + 1,
          item.unit,
          item.quantity,
          item.item_description,
          item.specifications || null,
          item.estimated_unit_cost,
          item.total_cost,
        ]
      );
    }

    /* -------------------------------
       INSERT OBR DETAILS
       INTO purchase_request_obrs

       THEN INSERT RELATIONSHIP
       INTO purchase_request_obr_links
    -------------------------------- */

    const savedObrs: Array<Record<string, unknown>> = [];

    for (const obr of normalizedObrs) {

      // 1. Save the actual OBR details.
      const obrResult = await client.query(
        `INSERT INTO purchase_request_obrs (
           obr_number,
           obr_date,
           payee,
           particulars,
           office_id,
           sub_office_id,
           category_id,
           account_id,
           remarks
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING
           id,
           obr_number,
           obr_date,
           payee,
           particulars,
           office_id,
           sub_office_id,
           category_id,
           account_id,
           remarks,
           created_by,
           updated_by,
           created_at,
           updated_at`,
        [
          obr.obr_number,
          obr.obr_date,
          obr.payee,
          obr.particulars || null,
          obr.office_id,
          obr.sub_office_id,
          obr.category_id,
          obr.account_id,
          (obr.remarks || "").trim() || null,
        ]
      );

      const savedObr = obrResult.rows[0];

      // 2. Link the OBR to the Purchase Request.
      //    The allocation amount belongs here.
      const linkResult = await client.query(
        `INSERT INTO purchase_request_obr_links (
           purchase_request_id,
           obr_id,
           amount
         )
         VALUES ($1, $2, $3)
         RETURNING
           id,
           purchase_request_id,
           obr_id,
           amount,
           created_at`,
        [
          purchaseRequest.id,
          savedObr.id,
          obr.amount,
        ]
      );

      // 3. Return both OBR details and its PR allocation.
      savedObrs.push({
        ...savedObr,
        allocation: {
          id: linkResult.rows[0].id,
          purchase_request_id:
            linkResult.rows[0].purchase_request_id,
          amount: Number(linkResult.rows[0].amount),
          created_at: linkResult.rows[0].created_at,
        },
      });
    }

    /* -------------------------------
       COMMIT TRANSACTION
    -------------------------------- */

    await client.query("COMMIT");

    return NextResponse.json(
      {
        success: true,
        message: "Purchase request saved successfully.",
        data: {
          ...purchaseRequest,

          items: itemRows.map(
            (item, index) => ({
              ...item,
              item_no: index + 1,
            })
          ),

          obrs: savedObrs,
        },
      },
      { status: 201 }
    );

  } catch (error) {

    /* -------------------------------
       ROLLBACK TRANSACTION
    -------------------------------- */

    if (client) {
      try {
        await client.query("ROLLBACK");
      } catch {
        // Preserve original error.
      }
    }

    const dbError = error as {
      code?: string;
      constraint?: string;
      message?: string;
    };

    const message =
      error instanceof Error
        ? error.message
        : "Unable to save purchase request.";

    /* -------------------------------
       DUPLICATE RECORDS
    -------------------------------- */

    if (dbError.code === "23505") {

      if (
        dbError.constraint === "purchase_requests_pr_number_key" ||
        dbError.constraint === "purchase_requests_rp_number_key"
      ) {
        return errorResponse(
          "That PR number already exists.",
          409
        );
      }

      if (
        dbError.constraint === "purchase_request_obrs_obr_number_key"
      ) {
        return errorResponse(
          "That OBR number already exists.",
          409
        );
      }

      return errorResponse(
        "A duplicate record already exists.",
        409
      );
    }

    /* -------------------------------
       FOREIGN KEY / INVALID UUID
    -------------------------------- */

    if (
      dbError.code === "23503" ||
      dbError.code === "22P02"
    ) {
      return errorResponse(
        "One or more selected records are invalid. Please refresh the form and try again.",
        400
      );
    }

    console.error(
      "POST /budget/api/purchase_requests error:",
      error
    );

    return errorResponse(message, 500);

  } finally {
    client?.release();
  }
}
