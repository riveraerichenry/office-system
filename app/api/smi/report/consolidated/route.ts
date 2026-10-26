
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export const dynamic = "force-dynamic";

type Section = "beginning" | "receipts" | "issued" | "ending";

type Booklet = {
  id: string;
  form_code: string;
  beginning_or: string;
  ending_or: string;
  received_date: string | null;
  issued_at: string | null;
};

type InventoryReportRow = {
  id: string;
  form_code: string;

  beginning_quantity: number;
  beginning_from: string | null;
  beginning_to: string | null;

  receipts_quantity: number;
  receipts_from: string | null;
  receipts_to: string | null;

  issued_quantity: number;
  issued_from: string | null;
  issued_to: string | null;

  ending_quantity: number;
  ending_from: string | null;
  ending_to: string | null;
};

type BookletWithStatus = Booklet & {
  from: number;
  to: number;
  hasBeginning: boolean;
  hasReceipts: boolean;
  hasIssued: boolean;
  hasEnding: boolean;
};

type SectionRange = {
  quantity: number;
  from: number;
  to: number;
};

const SECTIONS: Section[] = [
  "beginning",
  "receipts",
  "issued",
  "ending",
];

function parseInteger(value: string | null): number | null {
  if (!value || !/^\d+$/.test(value)) return null;

  const number = Number(value);
  return Number.isSafeInteger(number) ? number : null;
}

function getMonthDates(year: number, month: number) {
  const start = `${year}-${String(month).padStart(2, "0")}-01`;

  const nextMonth = new Date(Date.UTC(year, month, 1));

  const endExclusive = [
    nextMonth.getUTCFullYear(),
    String(nextMonth.getUTCMonth() + 1).padStart(2, "0"),
    "01",
  ].join("-");

  return { start, endExclusive };
}

function createEmptyRow(
  id: string,
  formCode: string
): InventoryReportRow {
  return {
    id,
    form_code: formCode,

    beginning_quantity: 0,
    beginning_from: null,
    beginning_to: null,

    receipts_quantity: 0,
    receipts_from: null,
    receipts_to: null,

    issued_quantity: 0,
    issued_from: null,
    issued_to: null,

    ending_quantity: 0,
    ending_from: null,
    ending_to: null,
  };
}

function setSectionRange(
  row: InventoryReportRow,
  section: Section,
  range: SectionRange
) {
  switch (section) {
    case "beginning":
      row.beginning_quantity = range.quantity;
      row.beginning_from = String(range.from);
      row.beginning_to = String(range.to);
      break;

    case "receipts":
      row.receipts_quantity = range.quantity;
      row.receipts_from = String(range.from);
      row.receipts_to = String(range.to);
      break;

    case "issued":
      row.issued_quantity = range.quantity;
      row.issued_from = String(range.from);
      row.issued_to = String(range.to);
      break;

    case "ending":
      row.ending_quantity = range.quantity;
      row.ending_from = String(range.from);
      row.ending_to = String(range.to);
      break;
  }
}

function getSectionRange(
  booklets: BookletWithStatus[],
  section: Section
): SectionRange | null {
  const selected = booklets.filter((booklet) => {
    switch (section) {
      case "beginning":
        return booklet.hasBeginning;
      case "receipts":
        return booklet.hasReceipts;
      case "issued":
        return booklet.hasIssued;
      case "ending":
        return booklet.hasEnding;
    }
  });

  if (selected.length === 0) return null;

  return {
    quantity: selected.length,
    from: Math.min(...selected.map((booklet) => booklet.from)),
    to: Math.max(...selected.map((booklet) => booklet.to)),
  };
}

/**
 * Groups consecutive booklet ranges within the same form.
 *
 * Example:
 *  4714551-4714600
 *  4714601-4714650
 *  4714651-4714700
 *
 * All three belong to one group: 4714551-4714700.
 *
 * A gap starts a new group.
 */
function groupConsecutiveBooklets(
  booklets: BookletWithStatus[]
): BookletWithStatus[][] {
  const sorted = [...booklets].sort(
    (a, b) =>
      a.form_code.localeCompare(b.form_code) ||
      a.from - b.from ||
      a.to - b.to
  );

  const groups: BookletWithStatus[][] = [];

  for (const booklet of sorted) {
    const currentGroup = groups[groups.length - 1];
    const previous = currentGroup?.[currentGroup.length - 1];

    const canJoin =
      previous !== undefined &&
      previous.form_code === booklet.form_code &&
      booklet.from === previous.to + 1;

    if (canJoin) {
      currentGroup.push(booklet);
    } else {
      groups.push([booklet]);
    }
  }

  return groups;
}

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;

    const period = params.get("period") ?? "month";
    const month = parseInteger(params.get("month"));
    const year = parseInteger(params.get("year"));

    if (period !== "month") {
      return NextResponse.json(
        {
          success: false,
          error: "Only monthly reports are supported.",
        },
        { status: 400 }
      );
    }

    if (month === null || month < 1 || month > 12) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid month. Use a value from 1 to 12.",
        },
        { status: 400 }
      );
    }

    if (year === null || year < 2000 || year > 2100) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid year.",
        },
        { status: 400 }
      );
    }

    const { start, endExclusive } = getMonthDates(year, month);

    const sql = `
      WITH first_issued AS (
        SELECT
          ri.booklet_registration_id,
          MIN(
            COALESCE(
              ri.issued_at,
              rh.completed_at,
              rh.generated_at,
              rh.created_at
            )
          ) AS first_issued_at
        FROM public.rat_items ri
        INNER JOIN public.rat_headers rh
          ON rh.id = ri.rat_id
        WHERE COALESCE(ri.is_active, TRUE) = TRUE
          AND COALESCE(rh.is_active, TRUE) = TRUE
          AND LOWER(COALESCE(rh.status, '')) = 'assigned'
        GROUP BY ri.booklet_registration_id
      )
      SELECT
        sbr.id::text AS id,
        af.form_code,
        sbr.beginning_or::text AS beginning_or,
        sbr.ending_or::text AS ending_or,
        TO_CHAR(sbr.received_date, 'YYYY-MM-DD') AS received_date,
        TO_CHAR(fi.first_issued_at, 'YYYY-MM-DD') AS issued_at
      FROM public.smi_booklet_registration sbr
      INNER JOIN public.accountable_forms af
        ON af.id = sbr.accountable_form_id
      LEFT JOIN first_issued fi
        ON fi.booklet_registration_id = sbr.id
      WHERE COALESCE(sbr.is_active, TRUE) = TRUE
        AND sbr.received_date < DATE '${endExclusive}'
      ORDER BY
        af.form_code,
        sbr.beginning_or,
        sbr.ending_or,
        sbr.received_date
    `;

    const result = await pool.query<Booklet>(sql);

    const booklets: BookletWithStatus[] = [];

    for (const booklet of result.rows) {
      if (!booklet.received_date) continue;

      const from = Number(booklet.beginning_or);
      const to = Number(booklet.ending_or);

      if (
        !Number.isSafeInteger(from) ||
        !Number.isSafeInteger(to) ||
        from < 0 ||
        to < from
      ) {
        continue;
      }

      const received = booklet.received_date;
      const issued = booklet.issued_at;

      const receivedBeforeMonth = received < start;

      const receivedDuringMonth =
        received >= start && received < endExclusive;

      const issuedBeforeMonth =
        issued !== null && issued < start;

      const issuedDuringMonth =
        issued !== null &&
        issued >= start &&
        issued < endExclusive;

      const issuedByMonthEnd =
        issued !== null && issued < endExclusive;

      const hasBeginning =
        receivedBeforeMonth && !issuedBeforeMonth;

      const hasReceipts = receivedDuringMonth;

      const hasIssued = issuedDuringMonth;

      const hasEnding =
        received < endExclusive && !issuedByMonthEnd;

      if (
        !hasBeginning &&
        !hasReceipts &&
        !hasIssued &&
        !hasEnding
      ) {
        continue;
      }

      booklets.push({
        ...booklet,
        from,
        to,
        hasBeginning,
        hasReceipts,
        hasIssued,
        hasEnding,
      });
    }

    // Group consecutive booklet ranges before calculating report sections.
    const groups = groupConsecutiveBooklets(booklets);

    const reportData: InventoryReportRow[] = [];

    for (const group of groups) {
      const first = group[0];

      const row = createEmptyRow(
        first.id,
        first.form_code
      );

      for (const section of SECTIONS) {
        const range = getSectionRange(group, section);

        if (range) {
          setSectionRange(row, section, range);
        }
      }

      reportData.push(row);
    }

    // Display each form code only once.
    // Keep form_code internally available for grouping, but blank it
    // on subsequent consecutive rows for the same form.
    let previousFormCode = "";

    for (const row of reportData) {
      if (row.form_code === previousFormCode) {
        row.form_code = "";
      } else {
        previousFormCode = row.form_code;
      }
    }

    return NextResponse.json({
      success: true,
      period,
      month,
      year,
      start_date: start,
      end_date: endExclusive,
      reportData,
    });
  } catch (error) {
    console.error("Consolidated SMI report error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate consolidated inventory report.",
      },
      { status: 500 }
    );
  }
}
