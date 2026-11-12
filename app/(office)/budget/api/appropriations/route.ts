
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { PoolClient } from "pg";

export const dynamic = "force-dynamic";

type ActionType = "appropriation" | "adjustment" | "realignment";

function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Unexpected server error.";
}

// =========================================================
// GET ACCOUNT DETAILS
// =========================================================

async function getAccount(client: PoolClient, accountId: string) {
  const result = await client.query(
    `SELECT ea.id AS account_id, ea.account_code, ea.account_name,
            c.id AS category_id, c.category_code, c.category_name
     FROM public.expense_accounts ea
     INNER JOIN public.expense_account_category c ON c.id = ea.category_id
     WHERE ea.id = $1 AND ea.is_active = TRUE AND c.is_active = TRUE`,
    [accountId]
  );
  return result.rows[0] ?? null;
}

// =========================================================
// GET APPROPRIATION BALANCE
// =========================================================

async function getAppropriationBalance(
  client: PoolClient,
  appropriationId: string
) {
  const result = await client.query(
    `
    SELECT
      a.id,
      a.fiscal_year,
      a.fund_source_id,
      a.account_id,
      a.appropriated_amount,

      a.appropriated_amount
      + COALESCE(adj.increases, 0)
      - COALESCE(adj.decreases, 0)
      + COALESCE(ri.amount_in, 0)
      - COALESCE(ro.amount_out, 0) AS adjusted_amount

    FROM public.budget_appropriations a

    LEFT JOIN (
      SELECT
        appropriation_id,
        SUM(amount) FILTER (
          WHERE adjustment_type = 'increase'
        ) AS increases,
        SUM(amount) FILTER (
          WHERE adjustment_type = 'decrease'
        ) AS decreases
      FROM public.budget_appropriation_adjustments
      GROUP BY appropriation_id
    ) adj ON adj.appropriation_id = a.id

    LEFT JOIN (
      SELECT
        destination_appropriation_id AS appropriation_id,
        SUM(amount) AS amount_in
      FROM public.budget_appropriation_realignment_items
      GROUP BY destination_appropriation_id
    ) ri ON ri.appropriation_id = a.id

    LEFT JOIN (
      SELECT
        source_appropriation_id AS appropriation_id,
        SUM(amount) AS amount_out
      FROM public.budget_appropriation_realignment_items
      GROUP BY source_appropriation_id
    ) ro ON ro.appropriation_id = a.id

    WHERE a.id = $1
      AND a.is_active = TRUE
    `,
    [appropriationId]
  );

  return result.rows[0] ?? null;
}

// =========================================================
// GET
// =========================================================

export async function GET(request: NextRequest) {
  let client: PoolClient | null = null;

  try {
    const fiscalYear =
      request.nextUrl.searchParams.get("fiscal_year");

    client = await pool.connect();

    // -----------------------------------------------------
    // REGISTERED EXPENSE ACCOUNTS
    // -----------------------------------------------------

    const accountsResult = await client.query(`
      SELECT ea.id AS account_id, ea.account_code, ea.account_name,
             c.id AS category_id, c.category_code, c.category_name
      FROM public.expense_accounts ea
      INNER JOIN public.expense_account_category c ON c.id = ea.category_id
      WHERE ea.is_active = TRUE AND c.is_active = TRUE
      ORDER BY c.category_code, ea.account_code
    `);

    const officesResult = await client.query(`
      SELECT id, office_code, office_name
      FROM public.offices WHERE is_active = TRUE
      ORDER BY office_code, office_name
    `);

    const subOfficesResult = await client.query(`
      SELECT id, office_id, sub_office_code, sub_office_name
      FROM public.sub_offices WHERE is_active = TRUE
      ORDER BY sub_office_code NULLS LAST, sub_office_name
    `);

    const categoriesResult = await client.query(`
      SELECT id, category_code, category_name
      FROM public.expense_account_category WHERE is_active = TRUE
      ORDER BY category_code, category_name
    `);

    // -----------------------------------------------------
    // FUND SOURCES
    // -----------------------------------------------------

    const fundsResult = await client.query(`
      SELECT
        id,
        fund_code,
        fund_name,
        acronym
      FROM public.fund_sources
      WHERE is_active = TRUE
      ORDER BY seq_no NULLS LAST, fund_name
    `);

    // -----------------------------------------------------
    // FISCAL YEAR FILTER
    // -----------------------------------------------------

    const values: unknown[] = [];
    let yearCondition = "";

    if (fiscalYear) {
      const year = Number(fiscalYear);

      if (
        !Number.isInteger(year) ||
        year < 1900 ||
        year > 2200
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid fiscal year.",
          },
          { status: 400 }
        );
      }

      values.push(year);
      yearCondition = "AND a.fiscal_year = $1";
    }

    // -----------------------------------------------------
    // APPROPRIATIONS
    // -----------------------------------------------------

    const appropriationsResult = await client.query(
      `
      SELECT
        a.id,
        a.fiscal_year,
        a.appropriation_type,
        a.ordinance_no,
        a.ordinance_date,

        a.fund_source_id,
        fs.fund_code,
        fs.fund_name,
        fs.acronym,

        a.account_id,
        ea.account_code,
        ea.account_name,

        a.office_id,
        o.office_code,
        o.office_name,

        a.sub_office_id,
        so.sub_office_code,
        so.sub_office_name,

        a.category_id,
        c.category_code,
        c.category_name,

        a.appropriated_amount,

        COALESCE(adj.increases, 0) AS adjustment_in,
        COALESCE(adj.decreases, 0) AS adjustment_out,

        COALESCE(ri.amount_in, 0) AS realignment_in,
        COALESCE(ro.amount_out, 0) AS realignment_out,

        (
          a.appropriated_amount
          + COALESCE(adj.increases, 0)
          - COALESCE(adj.decreases, 0)
          + COALESCE(ri.amount_in, 0)
          - COALESCE(ro.amount_out, 0)
        ) AS adjusted_amount,

        a.remarks,
        a.is_active,
        a.created_at,
        a.updated_at

      FROM public.budget_appropriations a

      INNER JOIN public.fund_sources fs
        ON fs.id = a.fund_source_id

      INNER JOIN public.expense_accounts ea
        ON ea.id = a.account_id

      LEFT JOIN public.expense_account_category c
        ON c.id = a.category_id

      LEFT JOIN public.sub_offices so
        ON so.id = a.sub_office_id

      LEFT JOIN public.offices o
        ON o.id = a.office_id

      LEFT JOIN (
        SELECT
          appropriation_id,
          SUM(amount) FILTER (
            WHERE adjustment_type = 'increase'
          ) AS increases,
          SUM(amount) FILTER (
            WHERE adjustment_type = 'decrease'
          ) AS decreases
        FROM public.budget_appropriation_adjustments
        GROUP BY appropriation_id
      ) adj ON adj.appropriation_id = a.id

      LEFT JOIN (
        SELECT
          destination_appropriation_id AS appropriation_id,
          SUM(amount) AS amount_in
        FROM public.budget_appropriation_realignment_items
        GROUP BY destination_appropriation_id
      ) ri ON ri.appropriation_id = a.id

      LEFT JOIN (
        SELECT
          source_appropriation_id AS appropriation_id,
          SUM(amount) AS amount_out
        FROM public.budget_appropriation_realignment_items
        GROUP BY source_appropriation_id
      ) ro ON ro.appropriation_id = a.id

      WHERE a.is_active = TRUE
        ${yearCondition}

      ORDER BY
        a.fiscal_year DESC,
        fs.fund_name,
        o.office_name,
        so.sub_office_name NULLS FIRST,
        c.category_name,
        ea.account_code,
        a.ordinance_no
      `,
      values
    );

    return NextResponse.json({
      success: true,
      data: appropriationsResult.rows,
      accounts: accountsResult.rows,
      offices: officesResult.rows,
      subOffices: subOfficesResult.rows,
      categories: categoriesResult.rows,
      fundSources: fundsResult.rows,
    });
  } catch (error) {
    console.error("GET Appropriations Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: errorMessage(error),
      },
      { status: 500 }
    );
  } finally {
    client?.release();
  }
}

// =========================================================
// POST
// =========================================================

export async function POST(request: NextRequest) {
  let client: PoolClient | null = null;
  let transactionStarted = false;

  try {
    const body = await request.json();
    const action = body.action as ActionType;

    client = await pool.connect();

    await client.query("BEGIN");
    transactionStarted = true;

    // =====================================================
    // CREATE APPROPRIATION
    // =====================================================

    if (action === "appropriation") {
      const {
        fiscal_year,
        appropriation_type,
        ordinance_no,
        ordinance_date,
        fund_source_id,
        office_id,
        sub_office_id,
        category_id,
        account_id,
        appropriated_amount,
        remarks,
      } = body;

      const year = Number(fiscal_year);
      const amount = Number(appropriated_amount);

      // Ordinance number and date are optional.
      const normalizedOrdinanceNo =
        typeof ordinance_no === "string" && ordinance_no.trim()
          ? ordinance_no.trim()
          : null;

      const normalizedOrdinanceDate =
        typeof ordinance_date === "string" && ordinance_date.trim()
          ? ordinance_date.trim()
          : null;

      if (
        !Number.isInteger(year) ||
        year < 1900 ||
        year > 2200 ||
        !["annual", "supplemental"].includes(appropriation_type) ||
        !fund_source_id ||
        !office_id ||
        !category_id ||
        !account_id ||
        !Number.isFinite(amount) ||
        amount <= 0
      ) {
        throw new Error(
          "Please provide all required appropriation details."
        );
      }

      // Validate fund source.
      const fundResult = await client.query(
        `
        SELECT id
        FROM public.fund_sources
        WHERE id = $1
          AND is_active = TRUE
        `,
        [fund_source_id]
      );

      if (!fundResult.rowCount) {
        throw new Error(
          "Selected fund source is inactive or unavailable."
        );
      }

      // Validate expense account.
      const account = await getAccount(client, account_id);

      if (!account) {
        throw new Error(
          "Selected expense account is inactive or unavailable."
        );
      }

      if (String(account.category_id) !== String(category_id)) {
        throw new Error("The selected expense account does not belong to the selected category.");
      }

      const officeResult = await client.query(
        `SELECT id FROM public.offices WHERE id = $1 AND is_active = TRUE`,
        [office_id]
      );
      if (!officeResult.rowCount) throw new Error("Selected office is inactive or unavailable.");

      if (sub_office_id) {
        const subOfficeResult = await client.query(
          `SELECT id FROM public.sub_offices WHERE id = $1 AND office_id = $2 AND is_active = TRUE`,
          [sub_office_id, office_id]
        );
        if (!subOfficeResult.rowCount) throw new Error("Selected sub-office is inactive, unavailable, or does not belong to the selected office.");
      }

      const categoryResult = await client.query(
        `SELECT id FROM public.expense_account_category WHERE id = $1 AND is_active = TRUE`,
        [category_id]
      );
      if (!categoryResult.rowCount) throw new Error("Selected category is inactive or unavailable.");

      // Check duplicate ordinance only if supplied.
      if (normalizedOrdinanceNo) {
        const duplicate = await client.query(
          `
          SELECT id
          FROM public.budget_appropriations
          WHERE fiscal_year = $1
            AND appropriation_type = $2
            AND fund_source_id = $3
            AND account_id = $4
            AND LOWER(ordinance_no) = LOWER($5)
            AND is_active = TRUE
          `,
          [
            year,
            appropriation_type,
            fund_source_id,
            account_id,
            normalizedOrdinanceNo,
          ]
        );

        if (duplicate.rowCount) {
          throw new Error(
            "An appropriation with this ordinance number, fund source, and account already exists."
          );
        }
      }

      const result = await client.query(
        `
        INSERT INTO public.budget_appropriations (
          fiscal_year,
          appropriation_type,
          ordinance_no,
          ordinance_date,
          fund_source_id,
          office_id,
          sub_office_id,
          category_id,
          account_id,
          appropriated_amount,
          remarks
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
        RETURNING *
        `,
        [
          year,
          appropriation_type,
          normalizedOrdinanceNo,
          normalizedOrdinanceDate,
          fund_source_id,
          office_id,
          sub_office_id,
          category_id,
          account_id,
          amount,
          remarks?.trim() || null,
        ]
      );

      await client.query("COMMIT");
      transactionStarted = false;

      return NextResponse.json({
        success: true,
        message: "Appropriation created successfully.",
        data: result.rows[0],
      });
    }

    // =====================================================
    // CREATE ADJUSTMENT
    // =====================================================

    if (action === "adjustment") {
      const {
        appropriation_id,
        adjustment_type,
        reference_no,
        reference_date,
        amount,
        justification,
      } = body;

      const adjustmentAmount = Number(amount);

      if (
        !appropriation_id ||
        !["increase", "decrease"].includes(adjustment_type) ||
        !reference_no?.trim() ||
        !reference_date ||
        !Number.isFinite(adjustmentAmount) ||
        adjustmentAmount <= 0 ||
        !justification?.trim()
      ) {
        throw new Error(
          "Please provide all required adjustment details."
        );
      }

      // Lock appropriation.
      const locked = await client.query(
        `
        SELECT id
        FROM public.budget_appropriations
        WHERE id = $1
          AND is_active = TRUE
        FOR UPDATE
        `,
        [appropriation_id]
      );

      if (!locked.rowCount) {
        throw new Error("Appropriation record not found.");
      }

      const balance = await getAppropriationBalance(
        client,
        appropriation_id
      );

      const currentBalance = Number(balance?.adjusted_amount ?? 0);

      if (
        adjustment_type === "decrease" &&
        adjustmentAmount > currentBalance
      ) {
        throw new Error(
          `Insufficient appropriation balance. Available: ${currentBalance.toFixed(2)}`
        );
      }

      await client.query(
        `
        INSERT INTO public.budget_appropriation_adjustments (
          appropriation_id,
          adjustment_type,
          reference_no,
          reference_date,
          amount,
          justification
        )
        VALUES ($1,$2,$3,$4,$5,$6)
        `,
        [
          appropriation_id,
          adjustment_type,
          reference_no.trim(),
          reference_date,
          adjustmentAmount,
          justification.trim(),
        ]
      );

      await client.query("COMMIT");
      transactionStarted = false;

      return NextResponse.json({
        success: true,
        message: "Appropriation adjustment recorded successfully.",
      });
    }

    // =====================================================
    // CREATE REALIGNMENT
    // =====================================================

    if (action === "realignment") {
      const {
        realignment_no,
        fiscal_year,
        fund_source_id,
        authority_reference,
        authority_date,
        justification,
        source_appropriation_id,
        destination_appropriation_id,
        amount,
        remarks,
      } = body;

      const year = Number(fiscal_year);
      const transferAmount = Number(amount);

      // Realignment number, authority reference, and authority date
      // are optional. The remaining transaction details are required.
      if (
        !Number.isInteger(year) ||
        year < 1900 ||
        year > 2200 ||
        !fund_source_id ||
        !justification?.trim() ||
        !source_appropriation_id ||
        !destination_appropriation_id ||
        source_appropriation_id === destination_appropriation_id ||
        !Number.isFinite(transferAmount) ||
        transferAmount <= 0
      ) {
        throw new Error(
          "Please provide all required realignment details."
        );
      }

      // ---------------------------------------------------
      // LOCK BOTH APPROPRIATION RECORDS
      // ---------------------------------------------------

      const ids = [
        source_appropriation_id,
        destination_appropriation_id,
      ].sort();

      const locked = await client.query(
        `
        SELECT
          a.id,
          a.fiscal_year,
          a.fund_source_id,
          a.account_id,

          c.id AS category_id,
          c.category_code,
          c.category_name

        FROM public.budget_appropriations a

        INNER JOIN public.expense_accounts ea
          ON ea.id = a.account_id

        INNER JOIN public.expense_account_category c
          ON c.id = ea.category_id

        WHERE a.id = ANY($1::uuid[])
          AND a.is_active = TRUE

        ORDER BY a.id
        FOR UPDATE OF a
        `,
        [ids]
      );

      if (locked.rowCount !== 2) {
        throw new Error(
          "Source or destination appropriation was not found."
        );
      }

      const source = locked.rows.find(
        (row) => row.id === source_appropriation_id
      );

      const destination = locked.rows.find(
        (row) => row.id === destination_appropriation_id
      );

      if (!source || !destination) {
        throw new Error(
          "Source or destination appropriation was not found."
        );
      }

      // ---------------------------------------------------
      // VALIDATE FISCAL YEAR
      // ---------------------------------------------------

      if (
        Number(source.fiscal_year) !== year ||
        Number(destination.fiscal_year) !== year
      ) {
        throw new Error(
          "Source and destination must belong to the selected fiscal year."
        );
      }

      // ---------------------------------------------------
      // VALIDATE FUND SOURCE
      // ---------------------------------------------------

      if (
        source.fund_source_id !== fund_source_id ||
        destination.fund_source_id !== fund_source_id
      ) {
        throw new Error(
          "Realignment between different fund sources is not allowed."
        );
      }

      // ---------------------------------------------------
      // VALIDATE EXPENSE ACCOUNT CATEGORY
      // ---------------------------------------------------

      if (
        String(source.category_id) !==
        String(destination.category_id)
      ) {
        throw new Error(
          `Realignment is only allowed within the same Expense Account Category. Source: ${source.category_code} - ${source.category_name}; Destination: ${destination.category_code} - ${destination.category_name}.`
        );
      }

      // ---------------------------------------------------
      // CHECK SOURCE BALANCE
      // ---------------------------------------------------

      const sourceBalance = await getAppropriationBalance(
        client,
        source_appropriation_id
      );

      if (!sourceBalance) {
        throw new Error(
          "Unable to retrieve source appropriation balance."
        );
      }

      const available = Number(sourceBalance.adjusted_amount);

      if (transferAmount > available) {
        throw new Error(
          `Insufficient source appropriation. Available: ${available.toFixed(2)}`
        );
      }

      // ---------------------------------------------------
      // CREATE REALIGNMENT HEADER
      // ---------------------------------------------------

      const header = await client.query(
        `
        INSERT INTO public.budget_appropriation_realignment_transactions (
          realignment_no,
          fiscal_year,
          fund_source_id,
          authority_reference,
          authority_date,
          justification,
          remarks
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7)
        RETURNING id
        `,
        [
          typeof realignment_no === "string" && realignment_no.trim()
            ? realignment_no.trim()
            : null,
          year,
          fund_source_id,
          typeof authority_reference === "string" && authority_reference.trim()
            ? authority_reference.trim()
            : null,
          authority_date || null,
          justification.trim(),
          remarks?.trim() || null,
        ]
      );

      // ---------------------------------------------------
      // CREATE REALIGNMENT ITEM
      // ---------------------------------------------------

      await client.query(
        `
        INSERT INTO public.budget_appropriation_realignment_items (
          realignment_transaction_id,
          source_appropriation_id,
          destination_appropriation_id,
          amount,
          remarks
        )
        VALUES ($1,$2,$3,$4,$5)
        `,
        [
          header.rows[0].id,
          source_appropriation_id,
          destination_appropriation_id,
          transferAmount,
          remarks?.trim() || null,
        ]
      );

      await client.query("COMMIT");
      transactionStarted = false;

      return NextResponse.json({
        success: true,
        message: "Appropriation realignment recorded successfully.",
        data: {
          id: header.rows[0].id,
        },
      });
    }

    throw new Error("Invalid action.");
  } catch (error) {
    if (client && transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error(
          "Appropriations Rollback Error:",
          rollbackError
        );
      }
    }

    console.error("POST Appropriations Error:", error);

    const message = errorMessage(error);

    const status =
      message.includes("duplicate key") ||
      message.includes("unique constraint")
        ? 409
        : 400;

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status }
    );
  } finally {
    client?.release();
  }
}
