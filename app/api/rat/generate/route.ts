import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/authorize";
import { pool } from "@/lib/db";
import { MODULE_PATHS } from "@/lib/module-paths";

export async function POST(req: NextRequest) {

  const client = await pool.connect();

  try {

    const user = await authorize(
      req,
      MODULE_PATHS.RAT,
      "add"
    );

    const {
      ris_id,
      assignments,
      remarks,
    } = await req.json();

    /*
    |--------------------------------------------------------------------------
    | Validate Assignments
    |--------------------------------------------------------------------------
    */

    await client.query("BEGIN");

    const risItems = await client.query(
      `
      SELECT
          id,
          quantity
      FROM ris_request_items
      WHERE
          ris_request_id = $1
          AND is_active = TRUE
      `,
      [ris_id]
    );

    for (const item of risItems.rows) {

      const assigned =
        assignments[item.id] ?? [];

      if (assigned.length !== Number(item.quantity)) {

        throw new Error(
          `Please assign ${item.quantity} booklet(s) before generating the RAT.`
        );

      }

    }

    /*
    |--------------------------------------------------------------------------
    | Generate RAT Number
    |--------------------------------------------------------------------------
    */

    const year = new Date().getFullYear();

    const latest = await client.query(
      `
      SELECT
          rat_no
      FROM rat_headers
      WHERE
          rat_no LIKE $1
      ORDER BY
          rat_no DESC
      LIMIT 1
      `,
      [`RAT-${year}-%`]
    );

    let next = 1;

    if (latest.rows.length) {

      next =
        parseInt(
          latest.rows[0].rat_no.split("-")[2]
        ) + 1;

    }

    const ratNo =
      `RAT-${year}-${String(next).padStart(6, "0")}`;

    /*
    |--------------------------------------------------------------------------
    | Create RAT Header
    |--------------------------------------------------------------------------
    */

    const ratHeader = await client.query(
      `
      INSERT INTO rat_headers (

          rat_no,
          ris_id,
          status,
          remarks,

          generated_by,
          generated_at,

          created_by,
          is_active

      )

      VALUES (

          $1,
          $2,
          'Assigned',
          $3,

          $4,
          NOW(),

          $4,
          TRUE

      )

      RETURNING id
      `,
      [
        ratNo,
        ris_id,
        remarks ?? null,
        user.id,
      ]
    );

    const ratId =
      ratHeader.rows[0].id;

    /*
    |--------------------------------------------------------------------------
    | Create RAT Items
    |--------------------------------------------------------------------------
    */

    for (const risItemId of Object.keys(assignments)) {

      const booklets =
        assignments[risItemId];

      for (const booklet of booklets) {

        await client.query(
          `
          INSERT INTO rat_items (

              rat_id,
              ris_request_item_id,
              booklet_registration_id,

              issued_by,
              issued_at,

              created_by,
              is_active

          )

          VALUES (

              $1,
              $2,
              $3,

              $4,
              NOW(),

              $4,
              TRUE

          )
          `,
          [
            ratId,
            risItemId,
            booklet.id,
            user.id,
          ]
        );

        /*
        |--------------------------------------------------------------------------
        | Mark Booklet as ISSUED
        |--------------------------------------------------------------------------
        */

        await client.query(
          `
          UPDATE smi_booklet_registration

          SET

              status = 'ISSUED',
              issued_date = NOW(),
              updated_at = NOW()

          WHERE id = $1
          `,
          [
            booklet.id,
          ]
        );

      }

    }

    /*
    |--------------------------------------------------------------------------
    | Update RIS
    |--------------------------------------------------------------------------
    */

    await client.query(
      `
      UPDATE ris_requests

      SET

          status = 'Assigned',
          updated_at = NOW(),
          updated_by = $2

      WHERE id = $1
      `,
      [
        ris_id,
        user.id,
      ]
    );

    /*
    |--------------------------------------------------------------------------
    | Commit
    |--------------------------------------------------------------------------
    */

    await client.query("COMMIT");

    return NextResponse.json({

      success: true,

      message: "RAT generated successfully.",

      data: {

        id: ratId,

        rat_no: ratNo,

      },

    });

  } catch (err: any) {

    try {

      await client.query("ROLLBACK");

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