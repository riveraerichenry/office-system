import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/authorize";
import { pool } from "@/lib/db";
import { MODULE_PATHS } from "@/lib/module-paths";

export async function GET(req: NextRequest) {
  try {
    const user = await authorize(
      req,
      MODULE_PATHS.RIS,
      "view"
    );

    const { searchParams } = new URL(req.url);

    const search =
      searchParams.get("search") ?? "";

    const view =
      searchParams.get("view") ?? "all";

    let whereClause = `
      rr.is_active = TRUE
    `;

    const params: any[] = [];

    if (view === "my") {
      whereClause += `
        AND rr.requested_by = $1
      `;

      params.push(user.id);

      whereClause += `
        AND (
          rr.ris_no ILIKE $2
          OR u.full_name ILIKE $2
          OR rr.status ILIKE $2
        )
      `;

      params.push(`%${search}%`);

    } else {

      whereClause += `
        AND (
          rr.ris_no ILIKE $1
          OR u.full_name ILIKE $1
          OR rr.status ILIKE $1
        )
      `;

      params.push(`%${search}%`);
    }

    const result = await pool.query(
      `
      SELECT
          rr.id,
          rr.ris_no,
          rr.request_date,
          rr.status,
          rr.remarks,

          u.full_name AS accountable_officer,

          COALESCE(
            SUM(ri.quantity),
            0
          ) AS quantity

      FROM ris_requests rr

      LEFT JOIN users u
        ON u.id = rr.requested_by

      LEFT JOIN ris_request_items ri
        ON ri.ris_request_id = rr.id

      WHERE ${whereClause}

      GROUP BY
          rr.id,
          rr.ris_no,
          rr.request_date,
          rr.status,
          rr.remarks,
          u.full_name

      ORDER BY
          rr.request_date DESC,
          rr.ris_no DESC
      `,
      params
    );

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


export async function POST(req: NextRequest) {
  const client = await pool.connect();

  try {
    const user = await authorize(
      req,
      MODULE_PATHS.RIS,
      "add"
    );

    const body = await req.json();

    const {
      request_date,
      remarks,
      items,
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Please add at least one accountable form.",
        },
        { status: 400 }
      );
    }

    await client.query("BEGIN");

    // Generate RIS Number
    const year = new Date().getFullYear();

    const risResult = await client.query(
      `
      SELECT ris_no
      FROM ris_requests
      WHERE ris_no LIKE $1
      ORDER BY ris_no DESC
      LIMIT 1
      `,
      [`RIS-${year}-%`]
    );

    let nextNumber = 1;

    if (risResult.rows.length > 0) {
      const lastRis = risResult.rows[0].ris_no;
      const lastSequence = parseInt(lastRis.split("-")[2]);
      nextNumber = lastSequence + 1;
    }

    const risNo = `RIS-${year}-${String(nextNumber).padStart(6, "0")}`;

    // Insert RIS Header
    const header = await client.query(
      `
      INSERT INTO ris_requests
      (
        ris_no,
        request_date,
        requested_by,
        status,
        remarks,
        created_by,
        updated_by
      )
      VALUES
      (
        $1,$2,$3,$4,$5,$6,$7
      )
      RETURNING id
      `,
      [
        risNo,
        request_date,
        user.id,
        "Pending",
        remarks ?? "",
        user.id,
        user.id,
      ]
    );

    const risRequestId = header.rows[0].id;

    // Insert Items
    for (const item of items) {
      await client.query(
        `
        INSERT INTO ris_request_items
        (
          ris_request_id,
          accountable_form_id,
          quantity,
          remarks,
          created_by,
          updated_by
        )
        VALUES
        (
          $1,$2,$3,$4,$5,$6
        )
        `,
        [
          risRequestId,
          item.accountable_form_id,
          item.quantity,
          item.remarks ?? "",
          user.id,
          user.id,
        ]
      );
    }

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      message: "RIS request created successfully.",
      data: {
        id: risRequestId,
        ris_no: risNo,
      },
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