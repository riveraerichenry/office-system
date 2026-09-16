import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { pool } from "@/lib/db";


/* ============================================================
   AUTHENTICATION
============================================================ */

async function authenticateUser(
  request: NextRequest
) {
  const token =
    request.cookies.get("token")?.value;

  if (!token) {
    throw new Error("Unauthorized");
  }

  let decoded: {
    id: string;
  };

  try {
    decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as {
      id: string;
    };
  } catch {
    throw new Error(
      "Invalid or expired token"
    );
  }

  const userResult =
    await pool.query(
      `
        SELECT
          id,
          full_name,
          username
        FROM users
        WHERE id = $1
        LIMIT 1
      `,
      [decoded.id]
    );

  if (
    userResult.rows.length === 0
  ) {
    throw new Error(
      "User not found"
    );
  }

  return userResult.rows[0];
}


/* ============================================================
   GET ONE CONSOLIDATED RCD
============================================================ */

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {

    /* ========================================================
       AUTH
    ======================================================== */

    await authenticateUser(
      request
    );


    /* ========================================================
       ID
    ======================================================== */

    const { id } =
      await params;

    console.log(
      "Loading Consolidated RCD ID:",
      id
    );


    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Consolidated RCD ID is required.",
        },
        {
          status: 400,
        }
      );
    }


    /* ========================================================
       HEADER
    ======================================================== */

    const headerResult =
      await pool.query(
        `
          SELECT
            c.id,
            c.consolidated_no,
            c.consolidated_date,

            c.fund_source_id,

            c.total_amount,

            c.status,
            c.remarks,

            c.prepared_by,
            c.approved_by,
            c.approved_at,

            c.created_at,
            c.updated_at,

            fs.fund_code,
            fs.fund_name,
            fs.acronym,

            prepared_user.full_name
              AS accountable,

            approved_user.full_name
              AS approved_by_name

          FROM
            rcd_consolidated_transaction c

          LEFT JOIN fund_sources fs
            ON fs.id =
               c.fund_source_id

          LEFT JOIN users prepared_user
            ON prepared_user.id =
               c.prepared_by

          LEFT JOIN users approved_user
            ON approved_user.id =
               c.approved_by

          WHERE c.id = $1

          LIMIT 1
        `,
        [id]
      );


    /* ========================================================
       NOT FOUND
    ======================================================== */

    if (
      headerResult.rows.length === 0
    ) {

      return NextResponse.json(
        {
          success: false,
          error:
            "Consolidated RCD not found.",
        },
        {
          status: 404,
        }
      );

    }


    const header =
      headerResult.rows[0];


    /* ========================================================
       REMITTANCE ITEMS

       IMPORTANT:

       One consolidated item
       represents one remittance.
    ======================================================== */

    const itemsResult =
      await pool.query(
        `
          SELECT
            cti.id,

            cti.remittance_id,

            cti.rcd_transaction_id,

            cti.amount,

            /* REMITTANCE */

            rmt.remittance_no,

            rmt.remittance_date,

            rmt.total_amount
              AS remittance_amount,

            /* ORIGINAL RCD */

            rt.report_no
              AS rcd_no,

            rt.report_date
              AS rcd_date,

            rt.date_from,

            rt.date_to,

            rt.rcd_by,

            /* COLLECTOR */

            collector.full_name
              AS collector,

            /* OR RANGE */

            MIN(
              ri.or_number
            ) AS or_from,

            MAX(
              ri.or_number
            ) AS or_to

          FROM
            rcd_consolidated_transaction_items cti

          INNER JOIN
            remittance_transactions rmt
            ON rmt.id =
               cti.remittance_id

          INNER JOIN
            rcd_transaction rt
            ON rt.id =
               cti.rcd_transaction_id

          LEFT JOIN
            users collector
            ON collector.id =
               rt.rcd_by

          LEFT JOIN
            rcd_items ri
            ON ri.rcd_transaction_id =
               rt.id

          WHERE
            cti.consolidated_transaction_id =
            $1

          GROUP BY

            cti.id,

            cti.remittance_id,

            cti.rcd_transaction_id,

            cti.amount,

            rmt.remittance_no,

            rmt.remittance_date,

            rmt.total_amount,

            rt.report_no,

            rt.report_date,

            rt.date_from,

            rt.date_to,

            rt.rcd_by,

            collector.full_name

          ORDER BY
            rmt.remittance_date ASC,
            rmt.remittance_no ASC
        `,
        [id]
      );


    /* ========================================================
       MAP ITEMS
    ======================================================== */

    const items =
      itemsResult.rows.map(
        (
          item,
          index
        ) => ({

          id:
            item.id,

          no:
            index + 1,

          collector:
            item.collector ||
            "",

          rcdId:
            item.rcd_transaction_id,

          rcdNo:
            item.rcd_no ||
            "",

          rcdDate:
            item.rcd_date,

          dateFrom:
            item.date_from,

          dateTo:
            item.date_to,

          orFrom:
            item.or_from !== null
              ? String(
                  item.or_from
                )
              : "",

          orTo:
            item.or_to !== null
              ? String(
                  item.or_to
                )
              : "",

          remittanceId:
            item.remittance_id,

          remittanceNo:
            item.remittance_no ||
            "",

          remittanceDate:
            item.remittance_date,

          amount:
            Number(
              item.amount || 0
            ),

          remittanceAmount:
            Number(
              item.remittance_amount ||
                0
            ),

          rcdBy:
            item.rcd_by ||
            "",

        })
      );


    /* ========================================================
       FINAL RESPONSE
    ======================================================== */

    return NextResponse.json({

      success: true,

      consolidated: {

        id:
          header.id,

        consolidatedNo:
          header.consolidated_no,

        consolidatedDate:
          header.consolidated_date,

        fundSourceId:
          header.fund_source_id,

        fundCode:
          header.fund_code ||
          "",

        fundName:
          header.fund_name ||
          "",

        fundAcronym:
          header.acronym ||
          null,

        accountable:
          header.accountable ||
          "",

        preparedBy:
          header.prepared_by,

        approvedBy:
          header.approved_by,

        approvedByName:
          header.approved_by_name ||
          "",

        approvedAt:
          header.approved_at,

        totalAmount:
          Number(
            header.total_amount ||
              0
          ),

        totalRemittances:
          items.length,

        status:
          header.status,

        remarks:
          header.remarks,

        createdAt:
          header.created_at,

        updatedAt:
          header.updated_at,

        items,

      },

      count:
        items.length,

    });

  } catch (error) {

    console.error(
      "GET /api/remittance/consolidated/[id] error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to load Consolidated RCD.";

    const status =
      message === "Unauthorized" ||
      message ===
        "Invalid or expired token"
        ? 401
        : 500;

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      {
        status,
      }
    );
  }
}