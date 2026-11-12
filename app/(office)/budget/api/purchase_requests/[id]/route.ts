
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type AuthResult = {
  userId: string;
};

type PurchaseItemInput = {
  id?: string;
  item_no?: number;
  unit?: string;
  quantity?: number | string;
  item_description?: string;
  specifications?: string;
  estimated_unit_cost?: number | string;
  total_cost?: number | string;
};

type OBRInput = {
  id?: string;
  obr_id?: string;
  obr_number?: string;
  obr_date?: string;
  payee?: string;
  particulars?: string | null;
  remarks?: string | null;
  amount?: number | string;
  office_id?: string;
  sub_office_id?: string | null;
  category_id?: string;
  account_id?: string;
};

function jsonError(message: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status }
  );
}

function isUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      value
    )
  );
}

function toNumber(value: unknown): number {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
}

function toCents(value: number): number {
  return Math.round(value * 100);
}

function normalizeDate(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  return value.trim().slice(0, 10);
}

async function authenticate(): Promise<AuthResult | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const secret = process.env.JWT_SECRET;

    if (!token || !secret) {
      return null;
    }

    const decoded = jwt.verify(token, secret) as jwt.JwtPayload;

    if (!decoded.id || !isUuid(decoded.id)) {
      return null;
    }

    return {
      userId: decoded.id,
    };
  } catch {
    return null;
  }
}

/* =========================================================
   GET PURCHASE REQUEST DETAILS
========================================================= */

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const auth = await authenticate();

    if (!auth) {
      return jsonError("Unauthorized.", 401);
    }

    const { id } = await context.params;

    if (!isUuid(id)) {
      return jsonError("A valid purchase request ID is required.", 400);
    }

    /*
      IMPORTANT:
      The correct database column is pr.pr_number.
      Do not use pr.rp_number.
    */

    const prResult = await pool.query(
      `
      SELECT
        pr.*
      FROM purchase_requests pr
      WHERE pr.id = $1
      LIMIT 1
      `,
      [id]
    );

    if (prResult.rows.length === 0) {
      return jsonError("Purchase request not found.", 404);
    }

    const purchaseRequest = prResult.rows[0];

    const itemsResult = await pool.query(
      `
      SELECT
        id,
        purchase_request_id,
        item_no,
        unit,
        quantity,
        item_description,
        specifications,
        estimated_unit_cost,
        total_cost
      FROM purchase_request_items
      WHERE purchase_request_id = $1
      ORDER BY item_no ASC
      `,
      [id]
    );

    const obrsResult = await pool.query(
      `
      SELECT
        obr.id,
        obr.obr_number,
        obr.obr_date,
        obr.payee,
        obr.particulars,
        obr.remarks,
        obr.office_id,
        obr.sub_office_id,
        obr.category_id,
        obr.account_id,
        links.amount,
        links.id AS link_id
      FROM purchase_request_obr_links links
      INNER JOIN purchase_request_obrs obr
        ON obr.id = links.obr_id
      WHERE links.purchase_request_id = $1
      ORDER BY obr.obr_date DESC, obr.obr_number ASC
      `,
      [id]
    );

    const items = itemsResult.rows.map((item) => ({
      ...item,
      quantity: Number(item.quantity),
      estimated_unit_cost: Number(item.estimated_unit_cost),
      total_cost: Number(item.total_cost),
    }));

    const obrs = obrsResult.rows.map((obr) => ({
      ...obr,
      amount: Number(obr.amount),
    }));

    return NextResponse.json({
      success: true,
      data: {
        ...purchaseRequest,
        pr_number: purchaseRequest.pr_number,
        total_amount: Number(purchaseRequest.total_amount ?? 0),
        items,
        obrs,
      },
    });
  } catch (error) {
    console.error("GET Purchase Request Details Error:", error);

    return jsonError(
      error instanceof Error
        ? error.message
        : "Failed to retrieve purchase request details.",
      500
    );
  }
}

/* =========================================================
   UPDATE PURCHASE REQUEST
========================================================= */

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  const client = await pool.connect();

  try {
    const auth = await authenticate();

    if (!auth) {
      return jsonError("Unauthorized.", 401);
    }

    const { id } = await context.params;

    if (!isUuid(id)) {
      return jsonError("A valid purchase request ID is required.", 400);
    }

    const body = await request.json();

    const prNumber = String(
      body.pr_number ?? body.rp_number ?? ""
    ).trim();

    const prDate = normalizeDate(body.pr_date);
    const purpose = String(body.purpose ?? "").trim();
    const remarks = body.remarks
      ? String(body.remarks).trim()
      : null;

    const items: PurchaseItemInput[] = Array.isArray(body.items)
      ? body.items
      : [];

    const obrs: OBRInput[] = Array.isArray(body.obrs)
      ? body.obrs
      : [];

    if (!prNumber) {
      return jsonError("Purchase request number is required.");
    }

    if (!prDate) {
      return jsonError("Purchase request date is required.");
    }

    if (!purpose) {
      return jsonError("Purchase request purpose is required.");
    }

    if (items.length === 0) {
      return jsonError("At least one purchase request item is required.");
    }

    if (obrs.length === 0) {
      return jsonError("At least one OBR is required.");
    }

    /*
      Validate purchase request items and calculate total.
    */

    let purchaseTotalCents = 0;

    const normalizedItems = items.map((item, index) => {
      const quantity = toNumber(item.quantity);
      const unitCost = toNumber(item.estimated_unit_cost);

      if (quantity <= 0) {
        throw new Error(
          `Item ${index + 1}: Quantity must be greater than zero.`
        );
      }

      if (unitCost < 0) {
        throw new Error(
          `Item ${index + 1}: Unit cost cannot be negative.`
        );
      }

      const totalCostCents = toCents(quantity * unitCost);

      purchaseTotalCents += totalCostCents;

      const description = String(
        item.item_description ?? ""
      ).trim();

      if (!description) {
        throw new Error(
          `Item ${index + 1}: Item description is required.`
        );
      }

      return {
        item_no: index + 1,
        unit: String(item.unit ?? "").trim(),
        quantity,
        item_description: description,
        specifications: String(
          item.specifications ?? ""
        ).trim(),
        estimated_unit_cost: unitCost,
        total_cost: totalCostCents / 100,
      };
    });

    /*
      Validate OBR allocations.
      Total OBR allocation must exactly equal PR total.
    */

    let obrTotalCents = 0;

    const normalizedOBRs = obrs.map((obr, index) => {
      const obrId = obr.obr_id || obr.id || "";
      const amount = toNumber(obr.amount);

      if (amount <= 0) {
        throw new Error(
          `OBR ${index + 1}: Allocation amount must be greater than zero.`
        );
      }

      if (!obrId && !String(obr.obr_number ?? "").trim()) {
        throw new Error(
          `OBR ${index + 1}: OBR number is required.`
        );
      }

      const amountCents = toCents(amount);
      obrTotalCents += amountCents;

      return {
        id: obrId,
        obr_number: String(obr.obr_number ?? "").trim(),
        obr_date: normalizeDate(obr.obr_date),
        payee: String(obr.payee ?? "").trim(),
        particulars: obr.particulars
          ? String(obr.particulars).trim()
          : null,
        remarks: obr.remarks
          ? String(obr.remarks).trim()
          : null,
        amount: amountCents / 100,
        office_id: obr.office_id,
        sub_office_id: obr.sub_office_id || null,
        category_id: obr.category_id,
        account_id: obr.account_id,
      };
    });

    if (purchaseTotalCents !== obrTotalCents) {
      return jsonError(
        `OBR allocation total must exactly equal the purchase request total. PR Total: ₱${(
          purchaseTotalCents / 100
        ).toLocaleString("en-PH", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}; OBR Total: ₱${(obrTotalCents / 100).toLocaleString(
          "en-PH",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        )}.`
      );
    }

    /*
      Check duplicate OBR IDs.
    */

    const obrIds = normalizedOBRs
      .filter((obr) => obr.id && isUuid(obr.id))
      .map((obr) => obr.id);

    if (new Set(obrIds).size !== obrIds.length) {
      return jsonError("The same OBR cannot be added more than once.");
    }

    await client.query("BEGIN");

    /*
      Lock and verify purchase request.
    */

    const existingPR = await client.query(
      `
      SELECT
        id,
        pr_number,
        total_amount,
        office_id,
        sub_office_id,
        category_id,
        account_id
      FROM purchase_requests
      WHERE id = $1
      FOR UPDATE
      `,
      [id]
    );

    if (existingPR.rows.length === 0) {
      await client.query("ROLLBACK");
      return jsonError("Purchase request not found.", 404);
    }

    const currentPR = existingPR.rows[0];

    /*
      Update purchase request master.
      Correct column: pr_number.
    */

    await client.query(
      `
      UPDATE purchase_requests
      SET
        pr_number = $1,
        pr_date = $2,
        purpose = $3,
        remarks = $4,
        total_amount = $5
      WHERE id = $6
      `,
      [
        prNumber,
        prDate,
        purpose,
        remarks,
        purchaseTotalCents / 100,
        id,
      ]
    );

    /*
      Replace purchase request items.
    */

    await client.query(
      `
      DELETE FROM purchase_request_items
      WHERE purchase_request_id = $1
      `,
      [id]
    );

    for (const item of normalizedItems) {
      await client.query(
        `
        INSERT INTO purchase_request_items (
          purchase_request_id,
          item_no,
          unit,
          quantity,
          item_description,
          specifications,
          estimated_unit_cost,
          total_cost
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        `,
        [
          id,
          item.item_no,
          item.unit,
          item.quantity,
          item.item_description,
          item.specifications || null,
          item.estimated_unit_cost,
          item.total_cost,
        ]
      );
    }

    /*
      Process OBR records.

      Existing OBR:
        Update the OBR master record.

      New OBR:
        Insert into purchase_request_obrs.

      The junction table stores the allocation.
    */

    const finalOBRLinks: {
      obr_id: string;
      amount: number;
    }[] = [];

    for (let index = 0; index < normalizedOBRs.length; index++) {
      const obr = normalizedOBRs[index];

      let obrId: string;

      if (obr.id) {
        if (!isUuid(obr.id)) {
          throw new Error(`OBR ${index + 1}: Invalid OBR ID.`);
        }

        const existingOBR = await client.query(
          `
          SELECT id
          FROM purchase_request_obrs
          WHERE id = $1
          FOR UPDATE
          `,
          [obr.id]
        );

        if (existingOBR.rows.length === 0) {
          throw new Error(
            `OBR ${index + 1}: The selected OBR does not exist.`
          );
        }

        /*
          Update shared OBR master details.
          This affects every PR linked to this OBR.
        */

        await client.query(
          `
          UPDATE purchase_request_obrs
          SET
            obr_number = $1,
            obr_date = $2,
            payee = $3,
            particulars = $4,
            remarks = $5,
            updated_at = NOW(),
            updated_by = $6
          WHERE id = $7
          `,
          [
            obr.obr_number,
            obr.obr_date,
            obr.payee,
            obr.particulars,
            obr.remarks,
            auth.userId,
            obr.id,
          ]
        );

        obrId = obr.id;
      } else {
        if (!obr.obr_number) {
          throw new Error(
            `OBR ${index + 1}: OBR number is required.`
          );
        }

        if (!obr.obr_date) {
          throw new Error(
            `OBR ${index + 1}: OBR date is required.`
          );
        }

        if (!obr.payee) {
          throw new Error(
            `OBR ${index + 1}: Payee is required.`
          );
        }

        const officeId = obr.office_id || currentPR.office_id;
        const subOfficeId =
          obr.sub_office_id ?? currentPR.sub_office_id;
        const categoryId = obr.category_id || currentPR.category_id;
        const accountId = obr.account_id || currentPR.account_id;

        if (
          !isUuid(officeId) ||
          !isUuid(categoryId) ||
          !isUuid(accountId)
        ) {
          throw new Error(
            `OBR ${index + 1}: Valid office, category, and account are required for a new OBR.`
          );
        }

        if (subOfficeId && !isUuid(subOfficeId)) {
          throw new Error(
            `OBR ${index + 1}: Invalid sub-office ID.`
          );
        }

        const newOBR = await client.query(
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
            remarks,
            created_at,
            updated_at,
            created_by,
            updated_by
          )
          VALUES (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,NOW(),NOW(),$10,$10
          )
          RETURNING id
          `,
          [
            obr.obr_number,
            obr.obr_date,
            obr.payee,
            obr.particulars,
            officeId,
            subOfficeId,
            categoryId,
            accountId,
            obr.remarks,
            auth.userId,
          ]
        );

        obrId = newOBR.rows[0].id;
      }

      finalOBRLinks.push({
        obr_id: obrId,
        amount: obr.amount,
      });
    }

    /*
      Replace only the PR-to-OBR relationships.
      Do not delete OBR master records.
    */

    await client.query(
      `
      DELETE FROM purchase_request_obr_links
      WHERE purchase_request_id = $1
      `,
      [id]
    );

    for (const link of finalOBRLinks) {
      await client.query(
        `
        INSERT INTO purchase_request_obr_links (
          purchase_request_id,
          obr_id,
          amount
        )
        VALUES ($1,$2,$3)
        `,
        [id, link.obr_id, link.amount]
      );
    }

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      message: "Purchase request updated successfully.",
      data: {
        id,
        pr_number: prNumber,
        total_amount: purchaseTotalCents / 100,
        obr_total: obrTotalCents / 100,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("PUT Purchase Request Error:", error);

    return jsonError(
      error instanceof Error
        ? error.message
        : "Failed to update purchase request.",
      500
    );
  } finally {
    client.release();
  }
}

/* =========================================================
   DELETE PURCHASE REQUEST
========================================================= */

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  const client = await pool.connect();

  try {
    const auth = await authenticate();

    if (!auth) {
      return jsonError("Unauthorized.", 401);
    }

    const { id } = await context.params;

    if (!isUuid(id)) {
      return jsonError("A valid purchase request ID is required.", 400);
    }

    await client.query("BEGIN");

    const existing = await client.query(
      `
      SELECT id
      FROM purchase_requests
      WHERE id = $1
      FOR UPDATE
      `,
      [id]
    );

    if (existing.rows.length === 0) {
      await client.query("ROLLBACK");
      return jsonError("Purchase request not found.", 404);
    }

    /*
      Delete relationship records only.
      OBR master records remain untouched.
    */

    await client.query(
      `
      DELETE FROM purchase_request_obr_links
      WHERE purchase_request_id = $1
      `,
      [id]
    );

    await client.query(
      `
      DELETE FROM purchase_request_items
      WHERE purchase_request_id = $1
      `,
      [id]
    );

    await client.query(
      `
      DELETE FROM purchase_requests
      WHERE id = $1
      `,
      [id]
    );

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      message: "Purchase request deleted successfully.",
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("DELETE Purchase Request Error:", error);

    return jsonError(
      error instanceof Error
        ? error.message
        : "Failed to delete purchase request.",
      500
    );
  } finally {
    client.release();
  }
}
