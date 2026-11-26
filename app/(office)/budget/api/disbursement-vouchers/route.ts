
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import type { PoolClient } from "pg";

type NewOBRInput = {
  obr_number: string;
  obr_date: string;
  payee: string;
  particulars?: string;
  office_id: string;
  sub_office_id?: string | null;
  category_id: string;
  account_id: string;
  obligation_amount: number;
  remarks?: string;
};

type DVItemInput = {
  obr_id: string;
  obr_no?: string;
  account_code?: string;
  particulars?: string;
  total_debit?: number;
  new_obr?: NewOBRInput;
};

type DVRequest = {
  dv_no: string;
  dv_date: string;
  payee: string;
  payor?: string;
  particulars?: string;
  items: DVItemInput[];
};

function errorResponse(message: string, status = 400) {
  return NextResponse.json(
    { success: false, message },
    { status }
  );
}

function isValidUUID(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value
  );
}

function getAmount(value: unknown): number {
  const amount = Number(value);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(
      "Every selected OBR must have a valid obligation amount greater than zero."
    );
  }

  return Number(amount.toFixed(2));
}

function validateNewOBR(obr: NewOBRInput) {
  if (!obr.obr_number?.trim()) {
    throw new Error("New OBR number is required.");
  }

  if (
    !obr.obr_date ||
    !/^\d{4}-\d{2}-\d{2}$/.test(obr.obr_date)
  ) {
    throw new Error("A valid new OBR date is required.");
  }

  if (!obr.payee?.trim()) {
    throw new Error("New OBR payee is required.");
  }

  if (!isValidUUID(obr.office_id)) {
    throw new Error("Invalid office selected for new OBR.");
  }

  if (
    obr.sub_office_id &&
    !isValidUUID(obr.sub_office_id)
  ) {
    throw new Error("Invalid sub-office selected for new OBR.");
  }

  if (!isValidUUID(obr.category_id)) {
    throw new Error("Invalid expense category selected.");
  }

  if (!isValidUUID(obr.account_id)) {
    throw new Error("Invalid expense account selected.");
  }

  getAmount(obr.obligation_amount);
}

// ============================================================
// GET: DV LIST OR INDIVIDUAL DV DETAILS
// ============================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      if (!isValidUUID(id)) {
        return errorResponse(
          "Invalid disbursement voucher ID."
        );
      }

      const dvResult = await pool.query(
        `
        SELECT
          id,
          dv_no,
          dv_date,
          payee,
          payor,
          particulars,
          grand_total,
          status,
          created_by,
          created_at,
          updated_at
        FROM public.disbursement_vouchers
        WHERE id = $1
        LIMIT 1
        `,
        [id]
      );

      if (dvResult.rows.length === 0) {
        return errorResponse(
          "Disbursement voucher not found.",
          404
        );
      }

      const itemsResult = await pool.query(
        `
        SELECT
          dvi.id,
          dvi.dv_id,
          dvi.obr_id,
          dvi.obr_no,
          dvi.account_code,
          dvi.particulars,
          dvi.amount,
          dvi.created_at
        FROM public.disbursement_voucher_items dvi
        WHERE dvi.dv_id = $1
        ORDER BY dvi.created_at ASC, dvi.id ASC
        `,
        [id]
      );

      return NextResponse.json({
        success: true,
        data: {
          ...dvResult.rows[0],
          items: itemsResult.rows,
        },
      });
    }

    const result = await pool.query(
      `
      SELECT
        dv.id,
        dv.dv_no,
        dv.dv_date,
        dv.payee,
        dv.payor,
        dv.particulars,
        dv.grand_total,
        dv.status,
        dv.created_at,
        COUNT(dvi.id)::int AS items_count
      FROM public.disbursement_vouchers dv
      LEFT JOIN public.disbursement_voucher_items dvi
        ON dvi.dv_id = dv.id
      GROUP BY dv.id
      ORDER BY dv.dv_date DESC, dv.created_at DESC
      `
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
    });

  } catch (error) {
    console.error("GET disbursement vouchers:", error);

    return errorResponse(
      "Failed to retrieve disbursement vouchers.",
      500
    );
  }
}

// ============================================================
// POST: CREATE DISBURSEMENT VOUCHER
// Supports existing OBRs and newly created standalone OBRs
// ============================================================

export async function POST(request: NextRequest) {
  let client: PoolClient | null = null;
  let transactionStarted = false;

  try {
    const body = (await request.json()) as DVRequest;

    const dvNo = String(body.dv_no ?? "").trim();
    const dvDate = String(body.dv_date ?? "").trim();
    const payee = String(body.payee ?? "").trim();

    const payor =
      String(
        body.payor ?? "Municipality of Taytay, Palawan"
      ).trim() || "Municipality of Taytay, Palawan";

    if (!dvNo) {
      return errorResponse("DV number is required.");
    }

    if (
      !dvDate ||
      !/^\d{4}-\d{2}-\d{2}$/.test(dvDate)
    ) {
      return errorResponse("A valid DV date is required.");
    }

    if (!payee) {
      return errorResponse("Payee is required.");
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return errorResponse(
        "A disbursement voucher must contain at least one OBR."
      );
    }

    // --------------------------------------------------------
    // 1. VALIDATE ITEM IDs AND NEW OBR PAYLOADS
    // --------------------------------------------------------

    const existingOBRIds: string[] = [];
    const newOBRItems: DVItemInput[] = [];

    const normalizedItemIds = body.items.map((item) =>
      String(item.obr_id ?? "").trim().toLowerCase()
    );

    if (
      new Set(normalizedItemIds).size !==
      normalizedItemIds.length
    ) {
      return errorResponse(
        "The same OBR cannot be added more than once to a DV."
      );
    }

    for (const item of body.items) {
      const obrId = String(item.obr_id ?? "")
        .trim()
        .toLowerCase();

      if (item.new_obr) {
        if (!obrId.startsWith("new-")) {
          return errorResponse(
            "Invalid temporary ID for newly created OBR."
          );
        }

        validateNewOBR(item.new_obr);
        newOBRItems.push(item);
      } else {
        if (!isValidUUID(obrId)) {
          return errorResponse(
            "One or more selected OBR IDs are invalid."
          );
        }

        existingOBRIds.push(obrId);
      }
    }

    client = await pool.connect();

    await client.query("BEGIN");
    transactionStarted = true;

    // --------------------------------------------------------
    // 2. INSERT NEW STANDALONE OBRs
    // No PR link is created here.
    // --------------------------------------------------------

    const resolvedOBRIds = new Map<string, string>();

    for (const item of newOBRItems) {
      const temporaryId = String(item.obr_id)
        .trim()
        .toLowerCase();

      const newOBR = item.new_obr!;

      const insertResult = await client.query(
        `
        INSERT INTO public.purchase_request_obrs (
          obr_number,
          obr_date,
          payee,
          particulars,
          office_id,
          sub_office_id,
          category_id,
          account_id,
          remarks,
          obligation_amount
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
        )
        RETURNING
          id,
          obr_number,
          obligation_amount
        `,
        [
          newOBR.obr_number.trim(),
          newOBR.obr_date,
          newOBR.payee.trim(),
          String(newOBR.particulars ?? "").trim(),
          newOBR.office_id,
          newOBR.sub_office_id || null,
          newOBR.category_id,
          newOBR.account_id,
          String(newOBR.remarks ?? "").trim(),
          getAmount(newOBR.obligation_amount),
        ]
      );

      const insertedOBR = insertResult.rows[0];

      resolvedOBRIds.set(
        temporaryId,
        String(insertedOBR.id)
      );
    }

    // --------------------------------------------------------
    // 3. LOCK EXISTING OBRs
    // --------------------------------------------------------

    let existingOBRMap = new Map<string, any>();

    if (existingOBRIds.length > 0) {
      const obrResult = await client.query(
        `
        SELECT
          id,
          obr_number,
          obligation_amount
        FROM public.purchase_request_obrs
        WHERE id = ANY($1::uuid[])
        ORDER BY id
        FOR UPDATE
        `,
        [existingOBRIds]
      );

      if (obrResult.rows.length !== existingOBRIds.length) {
        throw new Error(
          "One or more selected OBR records do not exist."
        );
      }

      existingOBRMap = new Map(
        obrResult.rows.map((obr) => [
          String(obr.id).toLowerCase(),
          obr,
        ])
      );
    }

    // --------------------------------------------------------
    // 4. RESOLVE ALL OBR IDs
    // --------------------------------------------------------

    for (const item of body.items) {
      const originalId = String(item.obr_id)
        .trim()
        .toLowerCase();

      if (item.new_obr) {
        const resolvedId = resolvedOBRIds.get(originalId);

        if (!resolvedId) {
          throw new Error(
            "Failed to resolve newly created OBR."
          );
        }
      }
    }

    const allResolvedOBRIds = body.items.map((item) => {
      const originalId = String(item.obr_id)
        .trim()
        .toLowerCase();

      if (item.new_obr) {
        return resolvedOBRIds.get(originalId)!;
      }

      return originalId;
    });

    // --------------------------------------------------------
    // 5. CHECK OBR ASSIGNMENTS
    // --------------------------------------------------------

    const assignedResult = await client.query(
      `
      SELECT
        dvi.obr_id,
        dv.dv_no
      FROM public.disbursement_voucher_items dvi
      INNER JOIN public.disbursement_vouchers dv
        ON dv.id = dvi.dv_id
      WHERE dvi.obr_id = ANY($1::uuid[])
      `,
      [allResolvedOBRIds]
    );

    if (assignedResult.rows.length > 0) {
      const assigned = assignedResult.rows
        .map(
          (row) =>
            `OBR ${row.obr_id} (DV ${row.dv_no})`
        )
        .join(", ");

      throw new Error(
        `The following OBRs are already assigned to a voucher: ${assigned}`
      );
    }

    // --------------------------------------------------------
    // 6. PREPARE ITEMS USING DATABASE AMOUNTS
    // --------------------------------------------------------

    const items = body.items.map((item, index) => {
      const originalId = String(item.obr_id)
        .trim()
        .toLowerCase();

      let obr: any;

      if (item.new_obr) {
        const resolvedId = resolvedOBRIds.get(originalId);

        obr = {
          id: resolvedId,
          obr_number: item.new_obr.obr_number,
          obligation_amount:
            item.new_obr.obligation_amount,
        };
      } else {
        obr = existingOBRMap.get(originalId);

        if (!obr) {
          throw new Error(
            `OBR ${item.obr_id} was not found.`
          );
        }
      }

      return {
        obr_id: String(obr.id),
        obr_no: String(obr.obr_number),
        account_code: String(
          item.account_code ?? ""
        ).trim(),
        particulars: String(
          item.particulars ?? ""
        ).trim(),
        amount: getAmount(obr.obligation_amount),
      };
    });

    const grandTotal = Number(
      items
        .reduce((sum, item) => sum + item.amount, 0)
        .toFixed(2)
    );

    if (grandTotal <= 0) {
      throw new Error(
        "The voucher total must be greater than zero."
      );
    }

    // --------------------------------------------------------
    // 7. INSERT DV HEADER
    // --------------------------------------------------------

    const dvResult = await client.query(
      `
      INSERT INTO public.disbursement_vouchers (
        dv_no,
        dv_date,
        payee,
        payor,
        particulars,
        grand_total,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'recorded')
      RETURNING *
      `,
      [
        dvNo,
        dvDate,
        payee,
        payor,
        String(body.particulars ?? "").trim(),
        grandTotal,
      ]
    );

    const dv = dvResult.rows[0];

    // --------------------------------------------------------
    // 8. INSERT DV ITEMS
    // --------------------------------------------------------

    for (const item of items) {
      await client.query(
        `
        INSERT INTO public.disbursement_voucher_items (
          dv_id,
          obr_id,
          obr_no,
          account_code,
          particulars,
          amount
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [
          dv.id,
          item.obr_id,
          item.obr_no,
          item.account_code,
          item.particulars,
          item.amount,
        ]
      );
    }

    // --------------------------------------------------------
    // 9. COMMIT
    // --------------------------------------------------------

    await client.query("COMMIT");
    transactionStarted = false;

    return NextResponse.json(
      {
        success: true,
        message: "Disbursement voucher saved successfully.",
        data: {
          ...dv,
          items,
          grand_total: grandTotal,
        },
      },
      { status: 201 }
    );

  } catch (error: unknown) {
    if (client && transactionStarted) {
      await client.query("ROLLBACK").catch(() => {});
    }

    const message =
      error instanceof Error
        ? error.message
        : "Failed to save disbursement voucher.";

    console.error(
      "POST disbursement voucher:",
      error
    );

    const pgError = error as {
      code?: string;
      constraint?: string;
    };

    if (
      pgError.code === "23505" &&
      pgError.constraint ===
        "disbursement_vouchers_dv_no_key"
    ) {
      return errorResponse(
        "DV number already exists.",
        409
      );
    }

    if (
      pgError.code === "23505" &&
      [
        "uq_disbursement_voucher_items_obr_id",
        "uq_dv_obr",
      ].includes(pgError.constraint ?? "")
    ) {
      return errorResponse(
        "One or more OBRs have already been assigned to another DV.",
        409
      );
    }

    if (pgError.code === "23503") {
      return errorResponse(
        "A selected OBR, office, sub-office, category, account, or voucher reference is invalid.",
        400
      );
    }

    if (pgError.code === "23505") {
      return errorResponse(
        "A duplicate record was detected. Please check the DV number and selected OBRs.",
        409
      );
    }

    return errorResponse(message, 400);

  } finally {
    client?.release();
  }
}
