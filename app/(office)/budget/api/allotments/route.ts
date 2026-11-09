import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type AllotmentItemInput = {
  appropriation_id: string;
  amount: number;
};

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;

    const year = Number(params.get("fiscal_year"));
    const quarter = Number(params.get("quarter"));
    const fundSourceId = params.get("fund_source_id");
    const search = params.get("search") || "";

    if (
      !Number.isInteger(year) ||
      year < 2000 ||
      year > 2100 ||
      !Number.isInteger(quarter) ||
      quarter < 1 ||
      quarter > 4
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid fiscal year or quarter." },
        { status: 400 }
      );
    }

    if (fundSourceId && !UUID_PATTERN.test(fundSourceId)) {
      return NextResponse.json(
        { success: false, message: "Invalid fund source." },
        { status: 400 }
      );
    }

    const appropriations = await pool.query(
      `
      WITH totals AS (
        SELECT
          ai.appropriation_id,

          COALESCE(
            SUM(ai.amount) FILTER (
              WHERE at.quarter < $2
            ), 0
          ) AS previous_allotment,

          COALESCE(
            SUM(ai.amount) FILTER (
              WHERE at.quarter = $2
                AND at.release_type = 'regular'
            ), 0
          ) AS current_allotment,

          COALESCE(
            SUM(ai.amount) FILTER (
              WHERE at.quarter = $2
                AND at.release_type = 'special'
            ), 0
          ) AS special_release,

          COALESCE(SUM(ai.amount), 0) AS total_release

        FROM public.budget_allotment_items ai

        INNER JOIN public.budget_allotment_transactions at
          ON at.id = ai.allotment_transaction_id

        WHERE at.fiscal_year = $1
          AND at.quarter <= $2
          AND at.status = 'posted'

        GROUP BY ai.appropriation_id
      )

      SELECT
        a.id,
        a.fiscal_year,
        a.fund_source_id,
        fs.fund_code,
        fs.fund_name,

        a.account_id,
        ea.account_code,
        ea.account_name,

        c.id AS category_id,
        c.category_name,

        COALESCE(
          direct_office.id,
          parent_office.id
        ) AS office_id,

        COALESCE(
          direct_office.office_name,
          parent_office.office_name
        ) AS office_name,

        c.sub_office_id,
        so.sub_office_name,

        a.appropriated_amount,

        COALESCE(t.previous_allotment, 0) AS previous_allotment,
        COALESCE(t.current_allotment, 0) AS current_allotment,
        COALESCE(t.special_release, 0) AS special_release,
        COALESCE(t.total_release, 0) AS total_release,

        a.appropriated_amount -
          COALESCE(t.total_release, 0) AS remaining_appropriation

      FROM public.budget_appropriations a

      INNER JOIN public.fund_sources fs
        ON fs.id = a.fund_source_id

      INNER JOIN public.expense_accounts ea
        ON ea.id = a.account_id

      INNER JOIN public.expense_account_category c
        ON c.id = ea.category_id

      LEFT JOIN public.offices direct_office
        ON direct_office.id = c.office_id

      LEFT JOIN public.sub_offices so
        ON so.id = c.sub_office_id

      LEFT JOIN public.offices parent_office
        ON parent_office.id = so.office_id

      LEFT JOIN totals t
        ON t.appropriation_id = a.id

      WHERE a.fiscal_year = $1
        AND a.is_active = TRUE
        AND fs.is_active = TRUE

        AND ($3::uuid IS NULL OR a.fund_source_id = $3)

        AND (
          $4 = ''
          OR ea.account_code ILIKE '%' || $4 || '%'
          OR ea.account_name ILIKE '%' || $4 || '%'
          OR c.category_name ILIKE '%' || $4 || '%'
          OR COALESCE(
            direct_office.office_name,
            parent_office.office_name
          ) ILIKE '%' || $4 || '%'
        )

      ORDER BY office_name, c.category_name, ea.account_code
      `,
      [year, quarter, fundSourceId || null, search]
    );

    // Load the registered account hierarchy independently of appropriations.
    // This keeps every registered office visible even when it has no
    // appropriation under the selected fiscal year or fund source.
    const accounts = await pool.query(
      `
        SELECT
          ea.id AS account_id,
          ea.account_code,
          ea.account_name,
          c.id AS category_id,
          c.category_name,
          COALESCE(direct_office.id, parent_office.id) AS office_id,
          COALESCE(direct_office.office_name, parent_office.office_name) AS office_name,
          c.sub_office_id,
          so.sub_office_name
        FROM public.expense_accounts ea
        INNER JOIN public.expense_account_category c
          ON c.id = ea.category_id
        LEFT JOIN public.offices direct_office
          ON direct_office.id = c.office_id
        LEFT JOIN public.sub_offices so
          ON so.id = c.sub_office_id
        LEFT JOIN public.offices parent_office
          ON parent_office.id = so.office_id
        WHERE COALESCE(direct_office.id, parent_office.id) IS NOT NULL
        ORDER BY office_name, so.sub_office_name NULLS FIRST,
                 c.category_name, ea.account_code
      `
    );

    const transactions = await pool.query(
      `
      SELECT
        at.id,
        at.allotment_no,
        at.allotment_date,
        at.fiscal_year,
        at.quarter,
        at.release_type,
        at.status,
        at.remarks,

        ai.id AS item_id,
        ai.appropriation_id,
        ai.amount,

        ea.account_code,
        ea.account_name,

        fs.fund_code,
        fs.fund_name,

        COALESCE(
          direct_office.office_name,
          parent_office.office_name
        ) AS office_name

      FROM public.budget_allotment_transactions at

      INNER JOIN public.budget_allotment_items ai
        ON ai.allotment_transaction_id = at.id

      INNER JOIN public.budget_appropriations a
        ON a.id = ai.appropriation_id

      INNER JOIN public.expense_accounts ea
        ON ea.id = a.account_id

      INNER JOIN public.expense_account_category c
        ON c.id = ea.category_id

      INNER JOIN public.fund_sources fs
        ON fs.id = a.fund_source_id

      LEFT JOIN public.offices direct_office
        ON direct_office.id = c.office_id

      LEFT JOIN public.sub_offices so
        ON so.id = c.sub_office_id

      LEFT JOIN public.offices parent_office
        ON parent_office.id = so.office_id

      WHERE at.fiscal_year = $1
        AND at.quarter = $2
        AND ($3::uuid IS NULL OR a.fund_source_id = $3)

      ORDER BY at.allotment_date DESC, at.created_at DESC
      `,
      [year, quarter, fundSourceId || null]
    );

    return NextResponse.json({
      success: true,
      appropriations: appropriations.rows,
      accounts: accounts.rows,
      allotments: transactions.rows,
    });
  } catch (error) {
    console.error("GET ALLOTMENTS:", error);

    return NextResponse.json(
      { success: false, message: "Failed to load allotments." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const client = await pool.connect();

  try {
    const body = await request.json();

    const {
      allotment_no,
      allotment_date,
      fiscal_year,
      quarter,
      release_type,
      remarks,
      items,
    } = body;

    const year = Number(fiscal_year);
    const selectedQuarter = Number(quarter);

    if (
      !allotment_no?.trim() ||
      !allotment_date ||
      !Number.isInteger(year) ||
      year < 2000 ||
      year > 2100 ||
      !Number.isInteger(selectedQuarter) ||
      selectedQuarter < 1 ||
      selectedQuarter > 4 ||
      !["regular", "special"].includes(release_type) ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid allotment information." },
        { status: 400 }
      );
    }

    const normalizedItems: AllotmentItemInput[] = items.map(
      (item: AllotmentItemInput) => ({
        appropriation_id: item.appropriation_id,
        amount: Number(item.amount),
      })
    );

    const seen = new Set<string>();

    for (const item of normalizedItems) {
      if (
        !UUID_PATTERN.test(item.appropriation_id || "") ||
        !Number.isFinite(item.amount) ||
        item.amount <= 0 ||
        seen.has(item.appropriation_id)
      ) {
        return NextResponse.json(
          { success: false, message: "Invalid or duplicate allotment item." },
          { status: 400 }
        );
      }

      seen.add(item.appropriation_id);
    }

    await client.query("BEGIN");

    const appropriationIds = normalizedItems
      .map((item) => item.appropriation_id)
      .sort();

    // Lock appropriation records in a consistent order to reduce
    // the chance of concurrent allotment transactions conflicting.
    const locked = await client.query(
      `
      SELECT
        id,
        fiscal_year,
        appropriated_amount

      FROM public.budget_appropriations

      WHERE id = ANY($1::uuid[])
        AND fiscal_year = $2
        AND is_active = TRUE

      ORDER BY id
      FOR UPDATE
      `,
      [appropriationIds, year]
    );

    if (locked.rowCount !== normalizedItems.length) {
      throw new Error(
        "One or more selected appropriations are unavailable."
      );
    }

    for (const item of normalizedItems) {
      const appropriation = locked.rows.find(
        (row) => row.id === item.appropriation_id
      );

      const totalResult = await client.query(
        `
        SELECT COALESCE(SUM(ai.amount), 0) AS total_release

        FROM public.budget_allotment_items ai

        INNER JOIN public.budget_allotment_transactions at
          ON at.id = ai.allotment_transaction_id

        WHERE ai.appropriation_id = $1
          AND at.fiscal_year = $2
          AND at.status = 'posted'
        `,
        [item.appropriation_id, year]
      );

      const totalRelease = Number(
        totalResult.rows[0].total_release
      );

      const remaining =
        Number(appropriation.appropriated_amount) - totalRelease;

      if (item.amount > remaining) {
        throw new Error(
          `Release exceeds remaining appropriation for ${item.appropriation_id}. Available: ${remaining.toFixed(2)}`
        );
      }
    }

    const header = await client.query(
      `
      INSERT INTO public.budget_allotment_transactions (
        fiscal_year,
        quarter,
        release_type,
        allotment_no,
        allotment_date,
        remarks,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'posted')
      RETURNING *
      `,
      [
        year,
        selectedQuarter,
        release_type,
        allotment_no.trim(),
        allotment_date,
        remarks?.trim() || null,
      ]
    );

    const transaction = header.rows[0];

    for (const item of normalizedItems) {
      await client.query(
        `
        INSERT INTO public.budget_allotment_items (
          allotment_transaction_id,
          appropriation_id,
          amount
        )
        VALUES ($1, $2, $3)
        `,
        [
          transaction.id,
          item.appropriation_id,
          item.amount,
        ]
      );
    }

    await client.query("COMMIT");

    return NextResponse.json(
      {
        success: true,
        message: "Release successfully posted.",
        data: transaction,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    await client.query("ROLLBACK");

    console.error("POST ALLOTMENT:", error);

    const pgError = error as { code?: string };

    if (pgError.code === "23505") {
      return NextResponse.json(
        {
          success: false,
          message: "Allotment document number already exists for this fiscal year.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error
          ? error.message
          : "Failed to post allotment.",
      },
      { status: 400 }
    );
  } finally {
    client.release();
  }
}