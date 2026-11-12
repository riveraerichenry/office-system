import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import type { PoolClient } from "pg";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type OBRInput = {
  obr_number?: unknown;
  obr_date?: unknown;
  payee?: unknown;
  office_id?: unknown;
  sub_office_id?: unknown;
  category_id?: unknown;
  account_id?: unknown;
  particulars?: unknown;
  amount?: unknown;
  remarks?: unknown;
};

function errorResponse(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

function isUuid(value: unknown): value is string {
  return typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function validDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

async function validateClassification(client: PoolClient, obr: OBRInput) {
  if (!isUuid(obr.office_id)) throw new Error("Select a valid office.");
  if (!isUuid(obr.category_id)) throw new Error("Select a valid expense category.");
  if (!isUuid(obr.account_id)) throw new Error("Select a valid expense account.");

  const office = await client.query(`SELECT 1 FROM offices WHERE id = $1 LIMIT 1`, [obr.office_id]);
  if (!office.rowCount) throw new Error("The selected office does not exist.");

  if (obr.sub_office_id !== null && obr.sub_office_id !== undefined && obr.sub_office_id !== "") {
    if (!isUuid(obr.sub_office_id)) throw new Error("Select a valid sub-office.");
    const subOffice = await client.query(`SELECT 1 FROM sub_offices WHERE id = $1 LIMIT 1`, [obr.sub_office_id]);
    if (!subOffice.rowCount) throw new Error("The selected sub-office does not exist.");
  }

  const category = await client.query(`SELECT 1 FROM expense_account_category WHERE id = $1 LIMIT 1`, [obr.category_id]);
  if (!category.rowCount) throw new Error("The selected expense category does not exist.");

  const account = await client.query(
    `SELECT 1 FROM expense_accounts WHERE id = $1 AND category_id = $2 LIMIT 1`,
    [obr.account_id, obr.category_id]
  );
  if (!account.rowCount) throw new Error("The selected expense account does not belong to the selected category.");
}

export async function POST(request: NextRequest, context: RouteContext) {
  const client = await pool.connect();

  try {
    const { id: purchaseRequestId } = await context.params;
    if (!isUuid(purchaseRequestId)) return errorResponse("Invalid purchase request ID.");

    const body = (await request.json()) as OBRInput;
    const obrNumber = typeof body.obr_number === "string" ? body.obr_number.trim() : "";
    const obrDate = body.obr_date;
    const payee = typeof body.payee === "string" ? body.payee.trim() : "";
    const amount = Number(body.amount);
    const subOfficeId = body.sub_office_id || null;
    const particulars = typeof body.particulars === "string" ? body.particulars.trim() : "";
    const remarks = typeof body.remarks === "string" ? body.remarks.trim() : "";

    if (!obrNumber || !validDate(obrDate) || !payee) {
      return errorResponse("OBR number, date, and payee are required.");
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return errorResponse("Enter a valid positive OBR allocation amount.");
    }

    await client.query("BEGIN");

    const prResult = await client.query(
      `SELECT id FROM purchase_requests WHERE id = $1 FOR UPDATE`,
      [purchaseRequestId]
    );
    if (!prResult.rowCount) {
      await client.query("ROLLBACK");
      return errorResponse("Purchase Request not found.", 404);
    }

    await validateClassification(client, body);

    const duplicate = await client.query(
      `SELECT id FROM purchase_request_obrs WHERE LOWER(obr_number) = LOWER($1) LIMIT 1`,
      [obrNumber]
    );
    if (duplicate.rowCount) {
      await client.query("ROLLBACK");
      return errorResponse("An OBR with this number already exists.", 409);
    }

    const obrResult = await client.query(
      `INSERT INTO purchase_request_obrs (
         created_at,
         updated_at,
         obr_number,
         obr_date,
         payee,
         particulars,
         office_id,
         sub_office_id,
         category_id,
         account_id,
         remarks
       ) VALUES (
         NOW(), NOW(), $1, $2, $3, $4, $5, $6, $7, $8, $9
       )
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
         created_at`,
      [
        obrNumber,
        obrDate,
        payee,
        particulars || null,
        body.office_id,
        subOfficeId,
        body.category_id,
        body.account_id,
        remarks || null,
      ]
    );

    const savedObr = obrResult.rows[0];

    const linkResult = await client.query(
      `INSERT INTO purchase_request_obr_links (
         purchase_request_id,
         obr_id,
         amount
       ) VALUES ($1, $2, $3)
       RETURNING id, purchase_request_id, obr_id, amount, created_at`,
      [purchaseRequestId, savedObr.id, Math.round((amount + Number.EPSILON) * 100) / 100]
    );

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      message: "OBR created and linked to the Purchase Request successfully.",
      data: {
        ...savedObr,
        obr_id: savedObr.id,
        amount: Number(linkResult.rows[0].amount),
        link_id: linkResult.rows[0].id,
      },
    }, { status: 201 });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    console.error("POST purchase request OBR error:", error);
    return errorResponse(error instanceof Error ? error.message : "Unable to create OBR.", 400);
  } finally {
    client.release();
  }
}
