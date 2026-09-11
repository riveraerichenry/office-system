import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/authorize";
import { pool } from "@/lib/db";
import { MODULE_PATHS } from "@/lib/module-paths";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  req: NextRequest,
  { params }: Params
) {
  const client = await pool.connect();

  try {
    const user = await authorize(
      req,
      MODULE_PATHS.LOR,
      "edit"
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

    const body = await req.json();

    const fundSourceId = body?.fund_source_id;

    if (!fundSourceId) {
      return NextResponse.json(
        {
          success: false,
          message: "Fund source is required.",
        },
        { status: 400 }
      );
    }

    await client.query("BEGIN");

    /*
     * Check LOR
     */
    const lorResult = await client.query(
      `
      SELECT
        id,
        lor_no,
        fund_source_id
      FROM lor_releases
      WHERE id = $1
      LIMIT 1
      `,
      [id]
    );

    if (lorResult.rowCount === 0) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,
          message: "LOR not found.",
        },
        { status: 404 }
      );
    }

    /*
     * Check selected fund source
     */
    const fundResult = await client.query(
      `
      SELECT
        id,
        fund_code,
        fund_name,
        acronym
      FROM fund_sources
      WHERE id = $1
        AND is_active = TRUE
      LIMIT 1
      `,
      [fundSourceId]
    );

    if (fundResult.rowCount === 0) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,
          message:
            "Selected fund source was not found or is inactive.",
        },
        { status: 404 }
      );
    }

    /*
     * Check if the fund source is already assigned
     */
    if (
      String(lorResult.rows[0].fund_source_id) ===
      String(fundSourceId)
    ) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,
          message:
            "This fund source is already assigned to the LOR.",
        },
        { status: 400 }
      );
    }

    const updatedBy =
      user?.id ??
      user?.user_id ??
      null;

    /*
     * Update LOR
     */
    const updateResult = await client.query(
      `
      UPDATE lor_releases
      SET
        fund_source_id = $1,
        updated_by = $2,
        updated_at = NOW()
      WHERE id = $3
      RETURNING
        id,
        lor_no,
        fund_source_id,
        updated_by,
        updated_at
      `,
      [
        fundSourceId,
        updatedBy,
        id,
      ]
    );

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      message:
        "LOR fund source reassigned successfully.",
      data: {
        lor: updateResult.rows[0],
        fund_source: fundResult.rows[0],
      },
    });
  } catch (err: any) {
    try {
      await client.query("ROLLBACK");
    } catch {}

    console.error(
      "LOR FUND SOURCE UPDATE ERROR:",
      err
    );

    return NextResponse.json(
      {
        success: false,
        message:
          err?.message ??
          "Failed to reassign fund source.",
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}