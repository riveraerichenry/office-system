import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { authorize } from "@/lib/authorize";
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
    await authorize(req, MODULE_PATHS.SMI, "view");

    const { id } = await params;

    const result = await pool.query(
      `
      SELECT
          h.id,
          h.action,
          h.remarks,
          h.created_at,

          u.full_name

      FROM smi_booklet_registration_history h

      LEFT JOIN users u
          ON u.id = h.user_id

      WHERE
          h.booklet_registration_id = $1

      ORDER BY
          h.created_at DESC
      `,
      [id]
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}