import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/authorize";
import { pool } from "@/lib/db";
import { MODULE_PATHS } from "@/lib/module-paths";

/*
|--------------------------------------------------------------------------
| GET RAT DETAILS
|--------------------------------------------------------------------------
|
| Workflow:
|
| RIS
|   ↓
| RIS Approval
|   ↓
| RAT
|   ↓
| LOR
|
| At the RAT stage, the accountable officer comes from:
|
| ris_requests.requested_by
|
| LOR is NOT required for viewing or editing the RAT officer.
|
*/

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    await authorize(
      req,
      MODULE_PATHS.RAT,
      "view"
    );

    const { id } = await params;

    /*
    |--------------------------------------------------------------------------
    | RAT Header
    |--------------------------------------------------------------------------
    */

    const header = await pool.query(
      `
      SELECT

          rh.*,

          rr.ris_no,
          rr.request_date,

          /*
          |--------------------------------------------------------------------------
          | Accountable Officer
          |--------------------------------------------------------------------------
          | The RAT officer comes from the original RIS requester.
          |--------------------------------------------------------------------------
          */

          rr.requested_by
              AS accountable_officer_id,

          requester.full_name
              AS accountable_officer,

          generator.full_name
              AS generated_by_name

      FROM rat_headers rh

      INNER JOIN ris_requests rr
          ON rr.id = rh.ris_id

      LEFT JOIN users requester
          ON requester.id = rr.requested_by

      LEFT JOIN users generator
          ON generator.id = rh.generated_by

      WHERE
          rh.id = $1

      LIMIT 1
      `,
      [id]
    );

    /*
    |--------------------------------------------------------------------------
    | RAT Items / Assigned Booklets
    |--------------------------------------------------------------------------
    */

    const items = await pool.query(
      `
      SELECT

          ri.id,

          ri.ris_request_item_id,
          ri.booklet_registration_id,

          af.form_code,
          af.form_name,

          sb.control_no,
          sb.series,

          sb.beginning_or,
          sb.ending_or,

          sb.current_or,

          sb.status,

          sb.issued_date

      FROM rat_items ri

      INNER JOIN smi_booklet_registration sb
          ON sb.id = ri.booklet_registration_id

      INNER JOIN accountable_forms af
          ON af.id = sb.accountable_form_id

      WHERE
          ri.rat_id = $1
          AND ri.is_active = TRUE

      ORDER BY
          af.form_code,
          sb.control_no
      `,
      [id]
    );

    return NextResponse.json({
      success: true,

      header:
        header.rows[0] ?? null,

      items:
        items.rows,
    });

  } catch (err: any) {

    console.error(
      "RAT Details Error:",
      err
    );

    return NextResponse.json(
      {
        success: false,
        message:
          err.message ||
          "Failed to load RAT details.",
      },
      {
        status: 500,
      }
    );
  }
}


/*
|--------------------------------------------------------------------------
| PATCH - EDIT RAT ACCOUNTABLE OFFICER
|--------------------------------------------------------------------------
|
| The officer at the RAT stage comes from:
|
| rat_headers.ris_id
|       ↓
| ris_requests.id
|       ↓
| ris_requests.requested_by
|
| LOR is NOT required.
|
*/

export async function PATCH(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  const client = await pool.connect();

  try {

    await authorize(
      req,
      MODULE_PATHS.RAT,
      "edit"
    );

    const { id } = await params;

    const body = await req.json();

    const accountableOfficerId =
      body.accountableOfficerId;

    /*
    |--------------------------------------------------------------------------
    | Validate Request
    |--------------------------------------------------------------------------
    */

    if (!accountableOfficerId) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Accountable officer is required.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Find RAT and Associated RIS
    |--------------------------------------------------------------------------
    */

    const rat = await client.query(
      `
      SELECT
          rh.id,
          rh.rat_no,
          rh.ris_id
      FROM rat_headers rh
      WHERE
          rh.id = $1
      LIMIT 1
      `,
      [id]
    );

    if (rat.rows.length === 0) {

      return NextResponse.json(
        {
          success: false,
          message:
            "RAT not found.",
        },
        {
          status: 404,
        }
      );
    }

    const risId =
      rat.rows[0].ris_id;

    /*
    |--------------------------------------------------------------------------
    | Validate Accountable Officer
    |--------------------------------------------------------------------------
    */

    const officer = await client.query(
      `
      SELECT
          id,
          full_name
      FROM users
      WHERE
          id = $1
          AND is_active = TRUE
      LIMIT 1
      `,
      [accountableOfficerId]
    );

    if (officer.rows.length === 0) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Selected accountable officer was not found or is inactive.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Start Transaction
    |--------------------------------------------------------------------------
    */

    await client.query("BEGIN");

    /*
    |--------------------------------------------------------------------------
    | Update RIS Requester
    |--------------------------------------------------------------------------
    |
    | This is the source of the Accountable Officer
    | during the RIS → Approval → RAT workflow.
    |
    */

    const updateRIS =
      await client.query(
        `
        UPDATE ris_requests
        SET
            requested_by = $2,
            updated_at = NOW()
        WHERE
            id = $1
        `,
        [
          risId,
          accountableOfficerId,
        ]
      );

    console.log(
      "RAT accountable officer update:",
      {
        ratId: id,
        ratNo: rat.rows[0].rat_no,
        risId,
        accountableOfficerId,
        rowsUpdated:
          updateRIS.rowCount,
      }
    );

    /*
    |--------------------------------------------------------------------------
    | Make Sure RIS Was Actually Updated
    |--------------------------------------------------------------------------
    */

    if (updateRIS.rowCount === 0) {

      await client.query(
        "ROLLBACK"
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "The RIS request associated with this RAT was not found.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Update RAT Timestamp
    |--------------------------------------------------------------------------
    */

    await client.query(
      `
      UPDATE rat_headers
      SET
          updated_at = NOW()
      WHERE
          id = $1
      `,
      [id]
    );

    /*
    |--------------------------------------------------------------------------
    | Commit
    |--------------------------------------------------------------------------
    */

    await client.query(
      "COMMIT"
    );

    return NextResponse.json({
      success: true,

      message:
        "Accountable officer updated successfully.",

      accountableOfficer: {
        id:
          officer.rows[0].id,

        fullName:
          officer.rows[0].full_name,
      },
    });

  } catch (err: any) {

    try {
      await client.query(
        "ROLLBACK"
      );
    } catch {
      // Ignore rollback errors
    }

    console.error(
      "RAT Update Error:",
      err
    );

    return NextResponse.json(
      {
        success: false,
        message:
          err.message ||
          "Failed to update accountable officer.",
      },
      {
        status: 500,
      }
    );

  } finally {

    client.release();

  }
}


/*
|--------------------------------------------------------------------------
| DELETE RAT
|--------------------------------------------------------------------------
|
| Deletion order:
|
| LOR releases
|      ↓
| RAT items
|      ↓
| RAT header
|
| This prevents FK constraint errors for the
| relationships currently defined in the database.
|
*/

export async function DELETE(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  const client = await pool.connect();

  try {

    await authorize(
      req,
      MODULE_PATHS.RAT,
      "delete"
    );

    const { id } = await params;

    /*
    |--------------------------------------------------------------------------
    | Check RAT
    |--------------------------------------------------------------------------
    */

    const rat = await client.query(
      `
      SELECT
          id,
          rat_no
      FROM rat_headers
      WHERE
          id = $1
      LIMIT 1
      `,
      [id]
    );

    if (rat.rows.length === 0) {

      return NextResponse.json(
        {
          success: false,
          message:
            "RAT not found.",
        },
        {
          status: 404,
        }
      );
    }

    await client.query(
      "BEGIN"
    );

    /*
    |--------------------------------------------------------------------------
    | Delete LOR Releases
    |--------------------------------------------------------------------------
    */

    await client.query(
      `
      DELETE FROM lor_releases
      WHERE
          rat_id = $1
      `,
      [id]
    );

    /*
    |--------------------------------------------------------------------------
    | Delete RAT Items
    |--------------------------------------------------------------------------
    */

    await client.query(
      `
      DELETE FROM rat_items
      WHERE
          rat_id = $1
      `,
      [id]
    );

    /*
    |--------------------------------------------------------------------------
    | Delete RAT Header
    |--------------------------------------------------------------------------
    */

    await client.query(
      `
      DELETE FROM rat_headers
      WHERE
          id = $1
      `,
      [id]
    );

    /*
    |--------------------------------------------------------------------------
    | Commit
    |--------------------------------------------------------------------------
    */

    await client.query(
      "COMMIT"
    );

    return NextResponse.json({
      success: true,

      message:
        "RAT deleted successfully.",
    });

  } catch (err: any) {

    try {
      await client.query(
        "ROLLBACK"
      );
    } catch {
      // Ignore rollback errors
    }

    console.error(
      "RAT Delete Error:",
      err
    );

    return NextResponse.json(
      {
        success: false,
        message:
          err.message ||
          "Failed to delete RAT.",
      },
      {
        status: 500,
      }
    );

  } finally {

    client.release();

  }
}