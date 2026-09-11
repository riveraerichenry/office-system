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
    await authorize(req, MODULE_PATHS.LOR, "view");

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
     * IMPORTANT:
     * Prevent /api/lor/fund-sources from being treated
     * as /api/lor/[id].
     */
    if (id === "fund-sources") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid LOR ID.",
        },
        { status: 400 }
      );
    }

    const header = await pool.query(
      `
      SELECT
        lr.id,
        lr.lor_no,
        lr.released_at,
        lr.status,
        lr.remarks,

        rh.rat_no,

        rr.id AS ris_id,
        rr.ris_no,
        rr.request_date,

        af.id AS accountable_form_id,
        af.form_code,
        af.form_name,

        sbr.id AS booklet_registration_id,
        sbr.control_no,
        sbr.series,
        sbr.beginning_or,
        sbr.ending_or,
        sbr.current_or,
        sbr.status AS booklet_status,

        fs.id AS fund_source_id,
        fs.fund_code,
        fs.fund_name,
        fs.acronym,

        officer.id AS accountable_officer_id,
        officer.full_name AS accountable_officer,

        releaser.id AS released_by_id,
        releaser.full_name AS released_by

      FROM lor_releases lr

      INNER JOIN rat_headers rh
        ON rh.id = lr.rat_id

      INNER JOIN ris_requests rr
        ON rr.id = lr.ris_id

      INNER JOIN accountable_forms af
        ON af.id = lr.accountable_form_id

      INNER JOIN smi_booklet_registration sbr
        ON sbr.id = lr.booklet_registration_id

      INNER JOIN fund_sources fs
        ON fs.id = lr.fund_source_id

      INNER JOIN users officer
        ON officer.id = lr.accountable_officer_id

      INNER JOIN users releaser
        ON releaser.id = lr.released_by

      WHERE lr.id = $1

      LIMIT 1
      `,
      [id]
    );

    if (header.rowCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "LOR not found.",
        },
        { status: 404 }
      );
    }

    /*
     * Get LOR transactions/items if your UI needs them later.
     *
     * Currently returning an empty array keeps the API compatible
     * without assuming a transaction table that has not been provided.
     */
    return NextResponse.json({
      success: true,
      header: header.rows[0],
      items: [],
    });
  } catch (err: any) {
    console.error("================================");
    console.error("LOR DETAILS API ERROR");
    console.error(err);
    console.error("================================");

    return NextResponse.json(
      {
        success: false,
        message:
          err?.message ?? "Failed to load LOR details.",
      },
      { status: 500 }
    );
  }
}