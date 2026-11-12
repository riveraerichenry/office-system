
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import type { PoolClient } from "pg";

type DVItemInput = {
  obr_id: string;
  obr_no?: string;
  account_code?: string;
  particulars?: string;
  total_debit?: number;
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

  return amount;
}

// ============================================================
// GET: DV LIST OR INDIVIDUAL DV DETAILS
// ============================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    // --------------------------------------------------------
    // INDIVIDUAL DV DETAILS
    // --------------------------------------------------------

    if (id) {
      if (!isValidUUID(id)) {
        return errorResponse(
          "Invalid disbursement voucher ID."
        );
      }

      // Fetch DV header
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

      // Fetch attached OBRs
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

    // --------------------------------------------------------
    // DV LIST
    // --------------------------------------------------------

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
    console.error(
      "GET disbursement vouchers:",
      error
    );

    return errorResponse(
      "Failed to retrieve disbursement vouchers.",
      500
    );
  }
}

// ============================================================
// POST: CREATE DISBURSEMENT VOUCHER
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

    if (!dvDate || !/^\d{4}-\d{2}-\d{2}$/.test(dvDate)) {
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

    const obrIds = body.items.map((item) =>
      String(item.obr_id ?? "").trim().toLowerCase()
    );

    if (obrIds.some((id) => !isValidUUID(id))) {
      return errorResponse(
        "One or more selected OBR IDs are invalid."
      );
    }

    if (new Set(obrIds).size !== obrIds.length) {
      return errorResponse(
        "The same OBR cannot be added more than once to a DV."
      );
    }

    client = await pool.connect();

    await client.query("BEGIN");
    transactionStarted = true;

    // --------------------------------------------------------
    // 1. LOCK SELECTED OBR RECORDS
    // --------------------------------------------------------

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
      [obrIds]
    );

    if (obrResult.rows.length !== obrIds.length) {
      throw new Error(
        "One or more selected OBR records do not exist."
      );
    }

    const obrMap = new Map(
      obrResult.rows.map((obr) => [
        String(obr.id).toLowerCase(),
        obr,
      ])
    );

    // --------------------------------------------------------
    // 2. CHECK IF OBR IS ALREADY ASSIGNED
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
      [obrIds]
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
    // 3. PREPARE ITEMS USING DATABASE OBR AMOUNTS
    // --------------------------------------------------------

    const items = body.items.map((item) => {
      const obrId = String(item.obr_id)
        .trim()
        .toLowerCase();

      const obr = obrMap.get(obrId);

      if (!obr) {
        throw new Error(
          `OBR ${item.obr_id} was not found.`
        );
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
    // 4. INSERT DV HEADER
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
    // 5. INSERT DV ITEMS
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
    // 6. COMMIT
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
        "A selected OBR or voucher reference is invalid.",
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
