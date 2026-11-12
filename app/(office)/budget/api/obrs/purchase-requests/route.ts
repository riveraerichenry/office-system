
import { NextRequest, NextResponse } from "next/server";
import type { PoolClient } from "pg";
import { pool } from "@/lib/db";

type PRItemInput = {
  unit: string;
  quantity: number;
  item_description: string;
  specifications?: string | null;
  estimated_unit_cost: number;
};

function errorResponse(message: string, status = 400) {
  return NextResponse.json(
    { success: false, message },
    { status }
  );
}

function isValidDate(value: unknown): value is string {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

function money(value: unknown): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) return NaN;

  return Math.round((parsed + Number.EPSILON) * 100) / 100;
}

function optionalUuid(value: unknown): string | null {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  return typeof value === "string" ? value : null;
}

// =====================================================
// GET AVAILABLE PURCHASE REQUESTS
// =====================================================

export async function GET() {
  try {
    const [prsResult, officesResult] = await Promise.all([
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

        WHERE
          pr.total_amount >
          COALESCE(allocation.allocated_amount, 0)

        ORDER BY
          pr.pr_date DESC,
          pr.pr_number DESC
      `),

      pool.query(`
        SELECT
          id,
          office_code,
          office_name,
          is_active
        FROM offices
        ORDER BY office_name
      `),
    ]);

    return NextResponse.json({
      success: true,
      data: prsResult.rows,
      offices: officesResult.rows,
    });
  } catch (error) {
    console.error(
      "GET /budget/api/obrs/purchase-requests:",
      error
    );

    return errorResponse(
      error instanceof Error
        ? error.message
        : "Unable to load Purchase Requests.",
      500
    );
  }
}

// =====================================================
// CREATE PURCHASE REQUEST WITHOUT OBR
// =====================================================

export async function POST(request: NextRequest) {
  let client: PoolClient | undefined;

  try {
    const body = await request.json();

    const prNumber = String(
      body.pr_number || body.rp_number || ""
    ).trim();

    const prDate = body.pr_date;

    if (!prNumber) {
      return errorResponse("PR number is required.");
    }

    if (!isValidDate(prDate)) {
      return errorResponse(
        "A valid purchase request date is required."
      );
    }

    if (
      !Array.isArray(body.items) ||
      body.items.length === 0
    ) {
      return errorResponse(
        "At least one purchase request item is required."
      );
    }

    const officeId = optionalUuid(body.office_id);

    if (
      body.office_id &&
      !officeId
    ) {
      return errorResponse("Invalid office selection.");
    }

    const items = (body.items as PRItemInput[]).map((item) => {
      const quantity = Number(item.quantity);
      const unitCost = money(item.estimated_unit_cost);

      return {
        unit:
          typeof item.unit === "string"
            ? item.unit.trim()
            : "",

        quantity,

        item_description:
          typeof item.item_description === "string"
            ? item.item_description.trim()
            : "",

        specifications:
          typeof item.specifications === "string"
            ? item.specifications.trim()
            : null,

        estimated_unit_cost: unitCost,

        total_cost: money(quantity * unitCost),
      };
    });

    if (
      items.some(
        (item) =>
          !item.unit ||
          !item.item_description ||
          !Number.isFinite(item.quantity) ||
          item.quantity <= 0 ||
          !Number.isFinite(item.estimated_unit_cost) ||
          item.estimated_unit_cost < 0 ||
          !Number.isFinite(item.total_cost)
      )
    ) {
      return errorResponse(
        "One or more purchase request items have invalid details."
      );
    }

    const totalAmount = money(
      items.reduce(
        (sum, item) => sum + item.total_cost,
        0
      )
    );

    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      return errorResponse(
        "Purchase Request total must be greater than zero."
      );
    }

    const purpose =
      String(body.purpose || "").trim() ||
      items
        .map((item) => item.item_description)
        .join(", ");

    const remarks =
      String(body.remarks || "").trim() || null;

    client = await pool.connect();

    await client.query("BEGIN");

    // Validate optional office.
    if (officeId) {
      const officeResult = await client.query(
        `
        SELECT id
        FROM offices
        WHERE id = $1
        LIMIT 1
        `,
        [officeId]
      );

      if (officeResult.rowCount === 0) {
        throw new Error(
          "The selected purchase request office does not exist."
        );
      }
    }

    // PR classification is optional.
    // This endpoint creates a PR without an OBR.
    const prResult = await client.query(
      `
      INSERT INTO purchase_requests (
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
        $1, $2, $3, NULL, NULL,
        NULL, $4, $5, $6, 'draft'
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
        created_at
      `,
      [
        prNumber,
        prDate,
        officeId,
        purpose,
        remarks,
        totalAmount,
      ]
    );

    const purchaseRequest = prResult.rows[0];

    // Insert PR items.
    const savedItems = [];

    for (let index = 0; index < items.length; index++) {
      const item = items[index];

      const itemResult = await client.query(
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
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
        `,
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

      savedItems.push(itemResult.rows[0]);
    }

    await client.query("COMMIT");

    return NextResponse.json(
      {
        success: true,
        message: "Purchase Request created successfully.",
        data: {
          ...purchaseRequest,
          office_name: null,
          allocated_amount: 0,
          remaining_amount: Number(purchaseRequest.total_amount),
          items: savedItems,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
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

    console.error(
      "POST /budget/api/obrs/purchase-requests:",
      error
    );

    if (dbError.code === "23505") {
      return errorResponse(
        "That PR number already exists.",
        409
      );
    }

    if (
      dbError.code === "23503" ||
      dbError.code === "22P02"
    ) {
      return errorResponse(
        "One or more selected records are invalid.",
        400
      );
    }

    return errorResponse(
      error instanceof Error
        ? error.message
        : "Unable to create Purchase Request.",
      500
    );
  } finally {
    client?.release();
  }
}
