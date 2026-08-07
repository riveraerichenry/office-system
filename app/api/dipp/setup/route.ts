import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/authorize";
import { pool } from "@/lib/db";
import { MODULE_PATHS } from "@/lib/module-paths";

export async function POST(
  req: NextRequest
) {

  const client =
    await pool.connect();

  try {

    const user =
      await authorize(
        req,
        MODULE_PATHS.DIPP,
        "add"
      );

    const {
      lor_item_id
    } = await req.json();

    await client.query(
      "BEGIN"
    );

    /*
    |--------------------------------------------------------------------------
    | Remove Existing Active Booklet
    |--------------------------------------------------------------------------
    */

    await client.query(
      `
      UPDATE
          dipp_active_booklets

      SET

          is_active = FALSE

      WHERE

          user_id = $1
      `,
      [
        user.id
      ]
    );

    /*
    |--------------------------------------------------------------------------
    | Insert New
    |--------------------------------------------------------------------------
    */

    await client.query(
      `
      INSERT INTO
      dipp_active_booklets
      (

        user_id,

        lor_item_id,

        activated_at,

        activated_by,

        is_active

      )

      VALUES
      (

        $1,

        $2,

        NOW(),

        $1,

        TRUE

      )
      `,
      [

        user.id,

        lor_item_id

      ]
    );

    await client.query(
      "COMMIT"
    );

    return NextResponse.json({

      success:true

    });

  } catch(err:any){

    await client.query(
      "ROLLBACK"
    );

    console.error(err);

    return NextResponse.json(
      {

        success:false,

        message:
          err.message

      },
      {
        status:500
      }
    );

  } finally{

    client.release();

  }

}