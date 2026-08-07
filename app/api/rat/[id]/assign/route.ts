import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/authorize";
import { pool } from "@/lib/db";
import { MODULE_PATHS } from "@/lib/module-paths";
import { randomUUID } from "crypto";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  req: NextRequest,
  { params }: Params
) {
  const client = await pool.connect();

  try {

    const user =
      await authorize(
        req,
        MODULE_PATHS.RAT,
        "edit"
      );

    const { id } =
      await params;

    const {
      ris_request_item_id,
      accountable_form_booklet_id,
      remarks,
    } = await req.json();

    await client.query("BEGIN");

    /*
    |--------------------------------------------------------------------------
    | RAT
    |--------------------------------------------------------------------------
    */

    const rat =
      await client.query(
        `
        SELECT *

        FROM rat_headers

        WHERE id=$1
        `,
        [id]
      );

    if (!rat.rowCount) {
      throw new Error(
        "RAT not found."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | RIS ITEM
    |--------------------------------------------------------------------------
    */

    const risItem =
      await client.query(
        `
        SELECT *

        FROM ris_request_items

        WHERE id=$1
        `,
        [ris_request_item_id]
      );

    if (!risItem.rowCount) {
      throw new Error(
        "RIS Item not found."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | BOOKLET
    |--------------------------------------------------------------------------
    */

    const booklet =
      await client.query(
        `
        SELECT *

        FROM accountable_form_booklets

        WHERE id=$1
        `,
        [
          accountable_form_booklet_id,
        ]
      );

    if (!booklet.rowCount) {
      throw new Error(
        "Booklet not found."
      );
    }

    if (
      booklet.rows[0].status !==
      "AVAILABLE"
    ) {
      throw new Error(
        "Booklet is no longer available."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | DUPLICATE BOOKLET
    |--------------------------------------------------------------------------
    */

    const duplicate =
      await client.query(
        `
        SELECT id

        FROM rat_items

        WHERE
          accountable_form_booklet_id=$1
        `,
        [
          accountable_form_booklet_id,
        ]
      );

    if (duplicate.rowCount) {
      throw new Error(
        "Booklet already assigned."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | INSERT RAT ITEM
    |--------------------------------------------------------------------------
    */

    await client.query(
      `
      INSERT INTO rat_items
      (

        id,

        rat_id,

        ris_request_item_id,

        accountable_form_booklet_id,

        issued_by,

        issued_at,

        remarks,

        created_at,

        created_by,

        is_active

      )

      VALUES
      (

        $1,

        $2,

        $3,

        $4,

        $5,

        NOW(),

        $6,

        NOW(),

        $5,

        TRUE

      )
      `,
      [
        randomUUID(),

        id,

        ris_request_item_id,

        accountable_form_booklet_id,

        user.id,

        remarks ?? null,
      ]
    );

    /*
    |--------------------------------------------------------------------------
    | UPDATE BOOKLET
    |--------------------------------------------------------------------------
    */

    await client.query(
      `
      UPDATE accountable_form_booklets

      SET

        status='ASSIGNED',

        issued_date=NOW(),

        updated_at=NOW(),

        updated_by=$1

      WHERE id=$2
      `,
      [
        user.id,
        accountable_form_booklet_id,
      ]
    );

    /*
    |--------------------------------------------------------------------------
    | UPDATE RAT STATUS
    |--------------------------------------------------------------------------
    */

    const counts =
      await client.query(
        `
        SELECT

          COALESCE(
            SUM(quantity),
            0
          ) requested,

          (
            SELECT COUNT(*)

            FROM rat_items ri

            INNER JOIN ris_request_items rri

            ON rri.id=
               ri.ris_request_item_id

            WHERE
              ri.rat_id=$1

          ) assigned

        FROM ris_request_items

        WHERE
          ris_request_id=
          (
            SELECT ris_id

            FROM rat_headers

            WHERE id=$1
          )
        `,
        [id]
      );

    const requested =
      Number(
        counts.rows[0].requested
      );

    const assigned =
      Number(
        counts.rows[0].assigned
      );

    let status =
      "PENDING";

    if (
      assigned > 0 &&
      assigned < requested
    ) {
      status =
        "PARTIALLY_ASSIGNED";
    }

    if (
      assigned >= requested
    ) {
      status =
        "FULLY_ASSIGNED";
    }

    await client.query(
      `
      UPDATE rat_headers

      SET

        status=$1,

        updated_at=NOW(),

        updated_by=$2

      WHERE id=$3
      `,
      [
        status,
        user.id,
        id,
      ]
    );

    await client.query(
      "COMMIT"
    );

    return NextResponse.json({

      success: true,

      message:
        "Booklet assigned successfully.",

    });

  } catch (err: any) {

    await client.query(
      "ROLLBACK"
    );

    console.error(err);

    return NextResponse.json(
      {
        success: false,
        message:
          err.message,
      },
      {
        status: 500,
      }
    );

  } finally {

    client.release();

  }

}