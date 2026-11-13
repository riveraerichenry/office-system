
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { pool } from "@/lib/db";

type JwtPayload = jwt.JwtPayload & {
  id?: string;
};

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

// =====================================================
// GET OBRs THAT ARE NOT YET ASSIGNED TO ANY DV
// =====================================================

export async function GET(request: NextRequest) {
  const userId = getUserId(request);

  if (!userId) {
    return errorResponse("Unauthorized.", 401);
  }

  try {
    const result = await pool.query(`
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
          FROM public.purchase_request_obr_links l
          WHERE l.obr_id = obr.id
        ) AS pr_count,

        COALESCE(
          (
            SELECT SUM(l.amount)
            FROM public.purchase_request_obr_links l
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
            FROM public.purchase_request_obr_links l
            INNER JOIN public.purchase_requests pr
              ON pr.id = l.purchase_request_id
            WHERE l.obr_id = obr.id
          ),
          '[]'::json
        ) AS purchase_requests

      FROM public.purchase_request_obrs obr

      LEFT JOIN public.offices o
        ON o.id = obr.office_id

      LEFT JOIN public.sub_offices so
        ON so.id = obr.sub_office_id

      LEFT JOIN public.expense_account_category c
        ON c.id = obr.category_id

      LEFT JOIN public.expense_accounts a
        ON a.id = obr.account_id

      WHERE NOT EXISTS (
        SELECT 1
        FROM public.disbursement_voucher_items dvi
        WHERE dvi.obr_id = obr.id
      )

      ORDER BY
        obr.obr_date DESC,
        obr.created_at DESC
    `);

    return NextResponse.json({
      success: true,
      data: result.rows,
    });

  } catch (error) {
    console.error(
      "GET /budget/api/disbursement-vouchers/available-obrs:",
      error
    );

    return errorResponse(
      "Unable to retrieve available OBR records.",
      500
    );
  }
}
