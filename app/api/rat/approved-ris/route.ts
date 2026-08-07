import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/authorize";
import { pool } from "@/lib/db";
import { MODULE_PATHS } from "@/lib/module-paths";

export async function GET(req: NextRequest) {
  try {
    await authorize(
      req,
      MODULE_PATHS.RAT,
      "view"
    );

    const { searchParams } =
      new URL(req.url);

    const search =
      searchParams.get("search") ?? "";

    const result =
      await pool.query(
        `
        SELECT

            rr.id,
            rr.ris_no,
            rr.request_date,
            rr.approved_date,

            requester.full_name
                AS accountable_officer,

            COALESCE(
                SUM(ri.quantity),
                0
            ) AS quantity

        FROM ris_requests rr

        INNER JOIN users requester
            ON requester.id =
                rr.requested_by

        LEFT JOIN ris_request_items ri
            ON ri.ris_request_id =
                rr.id

        WHERE

            rr.is_active = TRUE

            AND (

                rr.status ILIKE 'APPROVE%'

                OR rr.status ILIKE 'ASSIGN%'

                OR rr.status ILIKE 'ACTIVE%'

            )

            AND rr.id NOT IN (

                SELECT
                    ris_id

                FROM
                    rat_headers

                WHERE
                    is_active = TRUE

            )

            AND rr.ris_no ILIKE $1

        GROUP BY

            rr.id,
            rr.ris_no,
            rr.request_date,
            rr.approved_date,
            requester.full_name

        ORDER BY

            rr.approved_date DESC,
            rr.ris_no DESC
        `,
        [`%${search}%`]
      );

    console.log(result.rows);

    return NextResponse.json({
      success: true,
      data: result.rows,
    });

  } catch (err: any) {

    console.error(err);

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