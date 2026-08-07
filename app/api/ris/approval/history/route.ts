import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/authorize";
import { pool } from "@/lib/db";
import { MODULE_PATHS } from "@/lib/module-paths";

export async function GET(req: NextRequest) {
  try {
    await authorize(
      req,
      MODULE_PATHS.RIS_APPROVAL,
      "view"
    );

    const result = await pool.query(`
      SELECT
          rr.id,
          rr.ris_no,
          rr.status,

          requester.full_name
              AS accountable_officer,

          approver.full_name
              AS action_by,

          CASE

              WHEN rr.status='Approved'
                  THEN rr.approved_date

              WHEN rr.status='Rejected'
                  THEN rr.rejected_at

              WHEN rr.status='Returned'
                  THEN rr.returned_at

              WHEN rr.status='Issued'
                  THEN rr.updated_at

          END AS action_date

      FROM ris_requests rr

      LEFT JOIN users requester
          ON requester.id = rr.requested_by

      LEFT JOIN users approver
          ON approver.id = rr.approved_by

      WHERE
          rr.status IN
          (
              'Approved',
              'Rejected',
              'Returned',
              'Issued'
          )

      ORDER BY
          action_date DESC NULLS LAST

      LIMIT 20
    `);

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