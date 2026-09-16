import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { pool } from "@/lib/db";

/* ============================================================
   AUTHENTICATION
============================================================ */

async function authenticateUser(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

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
  } catch (error) {
    console.error("JWT verification error:", error);

    throw new Error("Invalid or expired token");
  }

  const userResult = await pool.query(
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

  if (userResult.rows.length === 0) {
    throw new Error("User not found");
  }

  return userResult.rows[0];
}

/* ============================================================
   GET
   CONSOLIDATED RCD LIST

   ACCOUNTABLE:
   rcd_consolidated_transaction.prepared_by
        ↓
   users.id
        ↓
   users.full_name
============================================================ */

export async function GET(request: NextRequest) {
  try {
    await authenticateUser(request);

    const { searchParams } = new URL(request.url);

    const dateFrom = searchParams.get("date_from");

    const dateTo = searchParams.get("date_to");

    const fundSourceId = searchParams.get("fund_source_id");

    /* ========================================================
       FILTERS
    ======================================================== */

    const conditions: string[] = [];

    const values: string[] = [];

    let parameterIndex = 1;

    if (dateFrom) {
      conditions.push(
        `c.consolidated_date >= $${parameterIndex}::date`
      );

      values.push(dateFrom);

      parameterIndex++;
    }

    if (dateTo) {
      conditions.push(
        `c.consolidated_date <= $${parameterIndex}::date`
      );

      values.push(dateTo);

      parameterIndex++;
    }

    if (fundSourceId) {
      conditions.push(
        `c.fund_source_id = $${parameterIndex}`
      );

      values.push(fundSourceId);

      parameterIndex++;
    }

    const whereClause =
      conditions.length > 0
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    /* ========================================================
       GET CONSOLIDATED RCDs

       IMPORTANT:
       Accountable is NOT taken from rcd_transaction.rcd_by.

       It comes from:

       c.prepared_by
           ↓
       users.id
           ↓
       users.full_name
    ======================================================== */

    const result = await pool.query(
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

          /* ==================================================
             ACCOUNTABLE

             The person who PREPARED / CREATED
             the Consolidated RCD.
          ================================================== */

          prepared_user.full_name AS accountable

        FROM rcd_consolidated_transaction c

        LEFT JOIN fund_sources fs
          ON fs.id = c.fund_source_id

        /* ==================================================
           IMPORTANT:

           prepared_by belongs to the
           CONSOLIDATED RCD.

           Therefore this user is the
           ACCOUNTABLE person.
        ================================================== */

        LEFT JOIN users prepared_user
          ON prepared_user.id = c.prepared_by

        ${whereClause}

        ORDER BY
          c.consolidated_date DESC,
          c.created_at DESC
      `,
      values
    );

    /* ========================================================
       FUND SOURCES
    ======================================================== */

    const fundSourceResult = await pool.query(
      `
        SELECT
          id,
          fund_code,
          fund_name,
          acronym
        FROM fund_sources
        WHERE COALESCE(
          is_active,
          TRUE
        ) = TRUE
        ORDER BY
          fund_code ASC
      `
    );

    /* ========================================================
       MAP CONSOLIDATED RCDs
    ======================================================== */

    const transactions = result.rows.map((row) => ({
      id: row.id,

      consolidatedNo: row.consolidated_no,

      consolidatedDate: row.consolidated_date,

      fundSourceId: row.fund_source_id,

      fundCode: row.fund_code || "",

      fundName: row.fund_name || "",

      fundAcronym: row.acronym || null,

      /* ======================================================
         THIS IS THE IMPORTANT PART

         Accountable = prepared_by user's full_name
      ====================================================== */

      accountable: row.accountable || "",

      totalAmount: Number(
        row.total_amount || 0
      ),

      status: row.status,

      remarks: row.remarks,

      preparedBy: row.prepared_by,

      approvedBy: row.approved_by,

      approvedAt: row.approved_at,

      createdAt: row.created_at,

      updatedAt: row.updated_at,
    }));

    /* ========================================================
       FUND SOURCE MAP
    ======================================================== */

    const fundSources = fundSourceResult.rows.map(
      (row) => ({
        id: row.id,

        fundCode: row.fund_code,

        fundName: row.fund_name,

        acronym: row.acronym,
      })
    );

    /* ========================================================
       RESPONSE
    ======================================================== */

    return NextResponse.json({
      success: true,

      count: transactions.length,

      transactions,

      fundSources,
    });
  } catch (error) {
    console.error(
      "GET /api/remittance/consolidated error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to load consolidated RCDs";

    const status =
      message === "Unauthorized" ||
      message === "Invalid or expired token"
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

/* ============================================================
   POST
   CREATE CONSOLIDATED RCD

   IMPORTANT:

   currentUser.id
        ↓
   rcd_consolidated_transaction.prepared_by
        ↓
   users.full_name
        ↓
   ACCOUNTABLE
============================================================ */

export async function POST(request: NextRequest) {
  const client = await pool.connect();

  try {
    /* ========================================================
       AUTHENTICATION

       The logged-in user is the person preparing
       / creating the Consolidated RCD.

       Therefore:

       currentUser.id
           ↓
       prepared_by
           ↓
       Accountable
    ======================================================== */

    const currentUser =
      await authenticateUser(request);

    /* ========================================================
       REQUEST BODY
    ======================================================== */

    const body = await request.json();

    const remittanceIds =
      Array.isArray(body.remittance_ids)
        ? body.remittance_ids
        : [];

    const requestedFundSourceId =
      body.fund_source_id || null;

    /* ========================================================
       VALIDATE REMITTANCE IDS
    ======================================================== */

    if (remittanceIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No remittance transactions were selected.",
        },
        {
          status: 400,
        }
      );
    }

    /* ========================================================
       REMOVE DUPLICATES
    ======================================================== */

    const uniqueRemittanceIds = [
      ...new Set(
        remittanceIds.filter(
          (
            id: unknown
          ): id is string =>
            typeof id === "string" &&
            id.trim() !== ""
        )
      ),
    ];

    if (
      uniqueRemittanceIds.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid remittance IDs.",
        },
        {
          status: 400,
        }
      );
    }

    /* ========================================================
       BEGIN TRANSACTION
    ======================================================== */

    await client.query("BEGIN");

    /* ========================================================
       LOCK SELECTED REMITTANCES

       IMPORTANT:
       FOR UPDATE OF rmt

       This avoids the PostgreSQL error:

       "FOR UPDATE cannot be applied to the
       nullable side of an outer join"
    ======================================================== */

    const remittanceResult =
      await client.query(
        `
          SELECT
            rmt.id,
            rmt.remittance_no,
            rmt.remittance_date,
            rmt.total_amount,
            rmt.status,
            rmt.rcd_transaction_id,

            rt.fund_source_id,

            fs.fund_code,
            fs.fund_name

          FROM remittance_transactions rmt

          INNER JOIN rcd_transaction rt
            ON rt.id =
               rmt.rcd_transaction_id

          LEFT JOIN fund_sources fs
            ON fs.id =
               rt.fund_source_id

          WHERE rmt.id =
                ANY($1::uuid[])

          FOR UPDATE OF rmt
        `,
        [
          uniqueRemittanceIds,
        ]
      );

    /* ========================================================
       VERIFY ALL REMITTANCES EXIST
    ======================================================== */

    if (
      remittanceResult.rows.length !==
      uniqueRemittanceIds.length
    ) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,
          error:
            "One or more selected remittance transactions could not be found.",
        },
        {
          status: 404,
        }
      );
    }

    /* ========================================================
       FUND SOURCE VALIDATION
    ======================================================== */

    const actualFundSourceIds = [
      ...new Set(
        remittanceResult.rows
          .map(
            (row) =>
              row.fund_source_id
          )
          .filter(Boolean)
      ),
    ];

    if (
      requestedFundSourceId &&
      actualFundSourceIds.some(
        (id) =>
          id !==
          requestedFundSourceId
      )
    ) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,
          error:
            "The selected remittances do not all belong to the selected fund source.",
        },
        {
          status: 400,
        }
      );
    }

    let finalFundSourceId =
      requestedFundSourceId;

    if (
      !finalFundSourceId &&
      actualFundSourceIds.length === 1
    ) {
      finalFundSourceId =
        actualFundSourceIds[0];
    }

    /* ========================================================
       CHECK IF ALREADY CONSOLIDATED
    ======================================================== */

    const duplicateResult =
      await client.query(
        `
          SELECT
            cti.remittance_id,
            c.consolidated_no

          FROM rcd_consolidated_transaction_items cti

          INNER JOIN rcd_consolidated_transaction c
            ON c.id =
               cti.consolidated_transaction_id

          WHERE cti.remittance_id =
                ANY($1::uuid[])
        `,
        [
          uniqueRemittanceIds,
        ]
      );

    if (
      duplicateResult.rows.length > 0
    ) {
      const consolidatedNumbers = [
        ...new Set(
          duplicateResult.rows.map(
            (row) =>
              row.consolidated_no
          )
        ),
      ];

      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,

          error:
            consolidatedNumbers.length > 0
              ? `One or more remittances have already been consolidated under ${consolidatedNumbers.join(
                  ", "
                )}.`
              : "One or more remittances have already been consolidated.",
        },
        {
          status: 400,
        }
      );
    }

    /* ========================================================
       CALCULATE TOTAL
    ======================================================== */

    const totalAmount =
      remittanceResult.rows.reduce(
        (
          total,
          row
        ) =>
          total +
          Number(
            row.total_amount ||
              0
          ),
        0
      );

    /* ========================================================
       GENERATE CONSOLIDATED RCD NUMBER

       NEW LOGIC:

       We NO LONGER use MAX() + 1.

       The Consolidated RCD number is based directly
       on the selected remittance number.

       Example:

       remittance_no:
       REM-2026-000002

       consolidated_no:
       CRCD-REM-2026-000002

       If multiple remittances are selected,
       the first remittance's number is used.
    ======================================================== */

    const primaryRemittanceNo =
      remittanceResult.rows[0]
        ?.remittance_no;

    if (
      !primaryRemittanceNo ||
      String(primaryRemittanceNo).trim() === ""
    ) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,
          error:
            "The selected remittance has no remittance number.",
        },
        {
          status: 400,
        }
      );
    }

    const consolidatedNo =
      `CRCD-${String(
        primaryRemittanceNo
      ).trim()}`;

    /* ========================================================
       INSERT CONSOLIDATED PARENT

       IMPORTANT:

       prepared_by = currentUser.id

       This means the user who creates the
       Consolidated RCD becomes the Accountable.

       It does NOT use:

       rcd_transaction.rcd_by
       collector
       encoded_by
       RCD preparer

       It specifically uses the current logged-in
       user creating this Consolidated RCD.
    ======================================================== */

    const consolidatedResult =
      await client.query(
        `
          INSERT INTO
            rcd_consolidated_transaction
          (
            consolidated_no,
            consolidated_date,
            fund_source_id,
            total_amount,
            status,
            prepared_by,
            created_at,
            updated_at
          )
          VALUES
          (
            $1,
            CURRENT_DATE,
            $2,
            $3,
            'PENDING',
            $4,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          )

          RETURNING
            id,
            consolidated_no,
            consolidated_date,
            fund_source_id,
            total_amount,
            status,
            prepared_by,
            created_at,
            updated_at
        `,
        [
          consolidatedNo,

          finalFundSourceId,

          totalAmount,

          /* ==================================================
             THIS IS THE ACCOUNTABLE USER
          ================================================== */

          currentUser.id,
        ]
      );

    const consolidated =
      consolidatedResult.rows[0];

    /* ========================================================
       INSERT CONSOLIDATED ITEMS

       ONE ITEM = ONE REMITTANCE TRANSACTION

       Relationship:

       remittance_transactions.id
                ↓
       rcd_consolidated_transaction_items.remittance_id

       rcd_transaction_id is also retained.
    ======================================================== */

    for (
      const remittance
      of remittanceResult.rows
    ) {
      await client.query(
        `
          INSERT INTO
            rcd_consolidated_transaction_items
          (
            consolidated_transaction_id,
            rcd_transaction_id,
            remittance_id,
            amount,
            created_at
          )
          VALUES
          (
            $1,
            $2,
            $3,
            $4,
            CURRENT_TIMESTAMP
          )
        `,
        [
          consolidated.id,

          remittance.rcd_transaction_id,

          remittance.id,

          Number(
            remittance.total_amount ||
              0
          ),
        ]
      );
    }

    /* ========================================================
       COMMIT
    ======================================================== */

    await client.query("COMMIT");

    /* ========================================================
       RESPONSE

       Accountable is the current logged-in user's
       full name because currentUser.id was stored
       in prepared_by.
    ======================================================== */

    return NextResponse.json(
      {
        success: true,

        message:
          "Consolidated RCD generated successfully.",

        consolidated: {
          id:
            consolidated.id,

          consolidatedNo:
            consolidated.consolidated_no,

          consolidatedDate:
            consolidated.consolidated_date,

          fundSourceId:
            consolidated.fund_source_id,

          totalAmount:
            Number(
              consolidated.total_amount ||
                0
            ),

          totalRemittances:
            uniqueRemittanceIds.length,

          status:
            consolidated.status,

          preparedBy:
            consolidated.prepared_by,

          accountable:
            currentUser.full_name,

          createdAt:
            consolidated.created_at,

          updatedAt:
            consolidated.updated_at,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    /* ========================================================
       ROLLBACK
    ======================================================== */

    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error(
        "Rollback error:",
        rollbackError
      );
    }

    console.error(
      "POST /api/remittance/consolidated error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to generate consolidated RCD.";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      {
        status: 500,
      }
    );
  } finally {
    client.release();
  }
}