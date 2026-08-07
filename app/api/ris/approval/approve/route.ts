import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { authorize } from "@/lib/authorize";
import { MODULE_PATHS } from "@/lib/module-paths";

export async function PATCH(req: NextRequest) {
  const client = await pool.connect();

  try {
    const user = await authorize(
      req,
      MODULE_PATHS.RIS_APPROVAL,
      "approve"
    );

    const { ids } = await req.json();

    if (!ids || ids.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No RIS selected.",
        },
        {
          status: 400,
        }
      );
    }

    await client.query("BEGIN");

    await client.query(
      `
      UPDATE ris_requests
      SET
          status = 'Approved',
          approved_by = $1,
          approved_date = NOW(),
          updated_by = $1,
          updated_at = NOW()

      WHERE id = ANY($2::uuid[])
      `,
      [
        user.id,
        ids,
      ]
    );

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      message: "RIS approved successfully.",
    });

  } catch (err: any) {

    await client.query("ROLLBACK");

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

  } finally {

    client.release();

  }
}