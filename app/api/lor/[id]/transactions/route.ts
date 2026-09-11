import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/authorize";
import { pool } from "@/lib/db";
import { MODULE_PATHS } from "@/lib/module-paths";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  req: NextRequest,
  { params }: Params
) {
  try {
    await authorize(
      req,
      MODULE_PATHS.LOR,
      "view"
    );

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "LOR ID is required.",
        },
        { status: 400 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Check LOR
    |--------------------------------------------------------------------------
    */

    const lorResult = await pool.query(
      `
      SELECT
        lr.id,
        lr.lor_no,
        lr.booklet_registration_id,
        lr.accountable_form_id,
        lr.accountable_officer_id,

        af.form_code,
        af.form_name,

        sbr.control_no,
        sbr.beginning_or,
        sbr.ending_or,

        officer.full_name AS accountable_officer

      FROM lor_releases lr

      INNER JOIN accountable_forms af
        ON af.id = lr.accountable_form_id

      INNER JOIN smi_booklet_registration sbr
        ON sbr.id = lr.booklet_registration_id

      INNER JOIN users officer
        ON officer.id = lr.accountable_officer_id

      WHERE lr.id = $1
        AND lr.is_active = TRUE

      LIMIT 1
      `,
      [id]
    );

    if (lorResult.rowCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "LOR not found.",
        },
        { status: 404 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Transactions
    |--------------------------------------------------------------------------
    |
    | Direct relationship:
    |
    | lor_releases.id
    |       ↓
    | dipp_transactions.lor_release_id
    |
    */

    const transactionResult =
      await pool.query(
        `
        SELECT
          dt.id,
          dt.or_number,
          dt.receipt_date,

          dt.booklet_registration_id,
          dt.lor_release_id,
          dt.accountable_form_id,
          dt.collector_id,

          dt.payor,
          dt.payment_mode,
          dt.remarks,

          COALESCE(
            dt.grand_total,
            0
          ) AS grand_total,

          dt.status,

          COALESCE(
            dt.is_cancelled,
            FALSE
          ) AS is_cancelled,

          dt.cancelled_at,
          dt.cancelled_by,

          dt.remittance_id,
          dt.billing_id,

          dt.transaction_type,

          COALESCE(
            dt.is_remitted,
            FALSE
          ) AS is_remitted,

          dt.gender,
          dt.payment,

          dt.created_at,
          dt.updated_at,
          dt.posted_at,

          collector.full_name AS collector_name,

          encoder.full_name AS encoded_by_name,

          poster.full_name AS posted_by_name

        FROM dipp_transactions dt

        LEFT JOIN users collector
          ON collector.id = dt.collector_id

        LEFT JOIN users encoder
          ON encoder.id = dt.encoded_by

        LEFT JOIN users poster
          ON poster.id = dt.posted_by

        WHERE dt.lor_release_id = $1

        ORDER BY
          dt.receipt_date DESC,
          dt.or_number DESC
        `,
        [id]
      );

    /*
    |--------------------------------------------------------------------------
    | Summary
    |--------------------------------------------------------------------------
    */

    const summaryResult =
      await pool.query(
        `
        SELECT

          COUNT(*)::INTEGER
            AS transaction_count,

          COUNT(*) FILTER (
            WHERE COALESCE(
              is_cancelled,
              FALSE
            ) = FALSE
          )::INTEGER
            AS valid_transaction_count,

          COUNT(*) FILTER (
            WHERE COALESCE(
              is_cancelled,
              FALSE
            ) = TRUE
          )::INTEGER
            AS cancelled_transaction_count,

          COUNT(*) FILTER (
            WHERE COALESCE(
              is_remitted,
              FALSE
            ) = TRUE
          )::INTEGER
            AS remitted_transaction_count,

          COALESCE(
            SUM(
              CASE
                WHEN COALESCE(
                  is_cancelled,
                  FALSE
                ) = FALSE
                THEN grand_total
                ELSE 0
              END
            ),
            0
          ) AS total_amount

        FROM dipp_transactions

        WHERE lor_release_id = $1
        `,
        [id]
      );

    return NextResponse.json({
      success: true,

      lor: lorResult.rows[0],

      transactions:
        transactionResult.rows,

      summary:
        summaryResult.rows[0],
    });

  } catch (err: any) {
    console.error(
      "LOR TRANSACTIONS ERROR:",
      err
    );

    return NextResponse.json(
      {
        success: false,
        message:
          err?.message ??
          "Failed to load LOR transactions.",
      },
      { status: 500 }
    );
  }
}