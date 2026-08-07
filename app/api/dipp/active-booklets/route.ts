import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/authorize";
import { pool } from "@/lib/db";
import { MODULE_PATHS } from "@/lib/module-paths";

export async function GET(
  req: NextRequest
) {

  try {

    const user =
      await authorize(
        req,
        MODULE_PATHS.DIPP,
        "view"
      );

    const search =
      req.nextUrl.searchParams.get("search") || "";

    const params: any[] = [];

    let where = `

      WHERE

          lr.is_active = TRUE

          AND

          lr.status = 'ACTIVE'

          AND

          lr.accountable_officer_id = $1

          AND

          CAST(sbr.current_or AS BIGINT)
          <=
          CAST(sbr.ending_or AS BIGINT)

    `;

    params.push(user.id);

    if (search) {

      params.push(`%${search}%`);

      where += `

      AND (

          af.form_code ILIKE $${params.length}

          OR

          af.form_name ILIKE $${params.length}

          OR

          sbr.control_no ILIKE $${params.length}

          OR

          fs.fund_code ILIKE $${params.length}

          OR

          fs.fund_name ILIKE $${params.length}

      )

      `;

    }

    const result =
      await pool.query(

        `

        SELECT

          lr.id,

          lr.lor_no,

          lr.status,

          lr.released_at,

          af.id
              AS accountable_form_id,

          af.form_code,

          af.form_name,

          sbr.id
              AS booklet_registration_id,

          sbr.control_no,

          sbr.series,

          sbr.beginning_or,

          sbr.ending_or,

          sbr.current_or,

          sbr.receipt_count,

          COALESCE(
                tx.used_receipts,
                0
            ) AS issued_receipts,

            sbr.receipt_count
                AS total_receipts,

            GREATEST(

                sbr.receipt_count -

                COALESCE(
                    tx.used_receipts,
                    0
                ),

                0

            ) AS remaining_receipts,

            ROUND(

                (

                    COALESCE(
                        tx.used_receipts,
                        0
                    )::numeric

                    /

                    NULLIF(
                        sbr.receipt_count,
                        0
                    )

                ) * 100,

                2

            ) AS consumed_percent,

          CASE

              WHEN sbr.current_or > sbr.ending_or

                  THEN 'CONSUMED'

              WHEN sbr.current_or = sbr.beginning_or

                  THEN 'RELEASED'

              ELSE

                  'IN USE'

          END
              AS booklet_status,

          fs.id
              AS fund_source_id,

          fs.fund_code,

          fs.fund_name,

          officer.id
              AS accountable_officer_id,

          officer.full_name
              AS accountable_officer,

          last_tx.or_number
              AS last_or_issued,

          last_tx.receipt_date
              AS last_receipt_date,

          last_tx.payor
              AS last_payor

      FROM lor_releases lr

      INNER JOIN smi_booklet_registration sbr
          ON sbr.id = lr.booklet_registration_id

      INNER JOIN accountable_forms af
          ON af.id = lr.accountable_form_id

      INNER JOIN fund_sources fs
          ON fs.id = lr.fund_source_id

      INNER JOIN users officer
          ON officer.id = lr.accountable_officer_id

      LEFT JOIN LATERAL (

          SELECT

              dt.or_number,

              dt.receipt_date,

              dt.payor

          FROM dipp_transactions dt

          WHERE

              dt.booklet_registration_id = sbr.id

          ORDER BY

              CAST(dt.or_number AS BIGINT) DESC

          LIMIT 1

      ) last_tx ON TRUE
       LEFT JOIN (

            SELECT

                booklet_registration_id,

                COUNT(*) AS used_receipts

            FROM dipp_transactions

            WHERE status <> 'VOID'

            GROUP BY booklet_registration_id

        ) tx

        ON tx.booklet_registration_id = sbr.id

      ${where}

      ORDER BY

          af.form_code,

          sbr.control_no

        `,

        params

      );

    return NextResponse.json({

      success: true,

      data: result.rows,

    });

  } catch (err: any) {

    console.error("================================");
    console.error("DIPP Active Booklets");
    console.error(err);
    console.error("================================");

    return NextResponse.json(

      {

        success: false,

        message: err.message,

      },

      {

        status: 500,

      }

    );

  }

}