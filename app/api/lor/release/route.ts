import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/authorize";
import { pool } from "@/lib/db";
import { MODULE_PATHS } from "@/lib/module-paths";

export async function POST(req: NextRequest) {

  const client = await pool.connect();

  try {

    const user =
      await authorize(
        req,
        MODULE_PATHS.LOR,
        "add"
      );

    const {
      rat_item_id,
      fund_source_id,
      remarks,
    } = await req.json();

    await client.query("BEGIN");

    /*
    |--------------------------------------------------------------------------
    | Prevent Duplicate Release
    |--------------------------------------------------------------------------
    */

    const existing =
      await client.query(
        `
        SELECT id

        FROM lor_releases

        WHERE

            rat_item_id = $1

            AND
            is_active = TRUE
        `,
        [
          rat_item_id,
        ]
      );

    if (existing.rowCount) {

      throw new Error(
        "This booklet has already been released."
      );

    }

    /*
    |--------------------------------------------------------------------------
    | Get RAT Item Information
    |--------------------------------------------------------------------------
    */

    const rat =
      await client.query(
        `
        SELECT

            rti.id,

            rti.booklet_registration_id,

            rh.id
                AS rat_id,

            rr.id
                AS ris_id,

            rr.requested_by
                AS accountable_officer_id,

            sbr.accountable_form_id

        FROM rat_items rti

        INNER JOIN rat_headers rh
            ON rh.id =
                rti.rat_id

        INNER JOIN ris_requests rr
            ON rr.id =
                rh.ris_id

        INNER JOIN smi_booklet_registration sbr
            ON sbr.id =
                rti.booklet_registration_id

        WHERE

            rti.id = $1

            AND
            rti.is_active = TRUE
        `,
        [
          rat_item_id,
        ]
      );

    if (
      rat.rowCount === 0
    ) {

      throw new Error(
        "Assigned booklet not found."
      );

    }

    const row =
      rat.rows[0];

    /*
    |--------------------------------------------------------------------------
    | Generate LOR Number
    |--------------------------------------------------------------------------
    */

    const year =
      new Date()
        .getFullYear();

    const latest =
      await client.query(
        `
        SELECT
            lor_no

        FROM
            lor_releases

        WHERE
            lor_no LIKE $1

        ORDER BY
            lor_no DESC

        LIMIT 1
        `,
        [
          `LOR-${year}-%`,
        ]
      );

    let next = 1;

    if (
      latest.rowCount
    ) {

      next =
        parseInt(
          latest.rows[0]
            .lor_no
            .split("-")[2]
        ) + 1;

    }

    const lorNo =
      `LOR-${year}-${String(next).padStart(6, "0")}`;

    /*
    |--------------------------------------------------------------------------
    | Insert LOR
    |--------------------------------------------------------------------------
    */

    await client.query(
      `
      INSERT INTO lor_releases (

          lor_no,

          rat_item_id,

          booklet_registration_id,

          rat_id,

          ris_id,

          accountable_form_id,

          fund_source_id,

          accountable_officer_id,

          released_by,

          released_at,

          remarks,

          status,

          is_active,

          created_by,

          created_at

      )

      VALUES (

          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9,
          NOW(),
          $10,
          'ACTIVE',
          TRUE,
          $9,
          NOW()

      )
      `,
      [
        lorNo,

        row.id,

        row.booklet_registration_id,

        row.rat_id,

        row.ris_id,

        row.accountable_form_id,

        fund_source_id,

        row.accountable_officer_id,

        user.id,

        remarks ?? null,
      ]
    );

    /*
    |--------------------------------------------------------------------------
    | Update Booklet Status
    |--------------------------------------------------------------------------
    */

    await client.query(
      `
      UPDATE smi_booklet_registration

      SET

          status = 'ISSUED',

          updated_at = NOW()

      WHERE

          id = $1
      `,
      [
        row.booklet_registration_id,
      ]
    );

    await client.query(
      "COMMIT"
    );

    return NextResponse.json({

      success: true,

      message:
        "Booklet released successfully.",

      lor_no:
        lorNo,

    });

  } catch (err: any) {

    try {

      await client.query(
        "ROLLBACK"
      );

    } catch {}

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