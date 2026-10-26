
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

type BookletRow = {
  id: string;
  form_code: string;
  beginning_or: string | null;
  ending_or: string | null;
  received_date: string;
};

type Booklet = {
  id: string;
  form_code: string;
  beginning: number;
  ending: number;
  beginningText: string;
  endingText: string;
};

type RangeGroup = {
  id: string;
  quantity: number;
  from: string;
  to: string;
};

type ReportRow = {
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

function parsePositiveInteger(
  value: string | null,
  fallback: number
): number {
  if (!value || !/^\d+$/.test(value)) return fallback;

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0
    ? parsed
    : fallback;
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function groupRanges(booklets: Booklet[]): RangeGroup[] {
  const sorted = [...booklets].sort(
    (a, b) =>
      a.beginning - b.beginning ||
      a.ending - b.ending ||
      a.id.localeCompare(b.id)
  );

  const groups: RangeGroup[] = [];

  for (const booklet of sorted) {
    const previous = groups[groups.length - 1];

    // Merge consecutive OR ranges only.
    if (
      previous &&
      Number(previous.to) + 1 === booklet.beginning
    ) {
      previous.to = booklet.endingText;
      previous.quantity += 1;
    } else {
      groups.push({
        id: booklet.id,
        quantity: 1,
        from: booklet.beginningText,
        to: booklet.endingText,
      });
    }
  }

  return groups;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "An unexpected error occurred.";
}

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const period = params.get("period") ?? "month";
    const now = new Date();

    const year = parsePositiveInteger(
      params.get("year"),
      now.getFullYear()
    );

    const month = parsePositiveInteger(
      params.get("month"),
      now.getMonth() + 1
    );

    if (period !== "month") {
      return NextResponse.json(
        {
          success: false,
          message: "Only monthly reporting is supported.",
        },
        { status: 400 }
      );
    }

    if (month < 1 || month > 12) {
      return NextResponse.json(
        {
          success: false,
          message: "Month must be between 1 and 12.",
        },
        { status: 400 }
      );
    }

    if (year < 1900 || year > 9999) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid reporting year.",
        },
        { status: 400 }
      );
    }

    const startDate = `${year}-${pad(month)}-01`;
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const endDate = `${nextYear}-${pad(nextMonth)}-01`;

    /*
     * Receipts:
     * Include active booklets received during the selected month.
     * Do not exclude booklets merely because they have been issued.
     */
    const result = await pool.query<BookletRow>(
      `
        SELECT
          sbr.id::text AS id,
          af.form_code::text AS form_code,
          sbr.beginning_or::text AS beginning_or,
          sbr.ending_or::text AS ending_or,
          sbr.received_date::text AS received_date
        FROM public.smi_booklet_registration AS sbr
        INNER JOIN public.accountable_forms AS af
          ON af.id = sbr.accountable_form_id
        WHERE
          COALESCE(sbr.is_active, TRUE) = TRUE
          AND sbr.received_date >= $1::date
          AND sbr.received_date < $2::date
        ORDER BY
          af.form_code ASC,
          sbr.beginning_or ASC NULLS LAST,
          sbr.ending_or ASC NULLS LAST,
          sbr.id ASC
      `,
      [startDate, endDate]
    );

    const booklets: Booklet[] = [];

    for (const row of result.rows) {
      const formCode = String(row.form_code ?? "").trim();
      const beginningText = String(row.beginning_or ?? "").trim();
      const endingText = String(row.ending_or ?? "").trim();

      if (
        !formCode ||
        !/^\d+$/.test(beginningText) ||
        !/^\d+$/.test(endingText)
      ) {
        console.warn(
          "Skipping booklet with invalid form or OR range:",
          row.id
        );
        continue;
      }

      const beginning = Number(beginningText);
      const ending = Number(endingText);

      if (
        !Number.isSafeInteger(beginning) ||
        !Number.isSafeInteger(ending) ||
        ending < beginning
      ) {
        console.warn(
          "Skipping booklet with invalid OR numbers:",
          row.id
        );
        continue;
      }

      booklets.push({
        id: row.id,
        form_code: formCode,
        beginning,
        ending,
        beginningText,
        endingText,
      });
    }

    const byForm = new Map<string, Booklet[]>();

    for (const booklet of booklets) {
      const current = byForm.get(booklet.form_code) ?? [];
      current.push(booklet);
      byForm.set(booklet.form_code, current);
    }

    const reportData: ReportRow[] = [];

    const formCodes = [...byForm.keys()].sort((a, b) =>
      a.localeCompare(b)
    );

    for (const formCode of formCodes) {
      const ranges = groupRanges(byForm.get(formCode) ?? []);
      let firstRowForForm = true;

      for (const range of ranges) {
        reportData.push({
          id: `${formCode}-receipts-${range.id}`,
          form_code: firstRowForForm ? formCode : "",

          beginning_quantity: 0,
          beginning_from: null,
          beginning_to: null,

          receipts_quantity: range.quantity,
          receipts_from: range.from,
          receipts_to: range.to,

          issued_quantity: 0,
          issued_from: null,
          issued_to: null,

          ending_quantity: 0,
          ending_from: null,
          ending_to: null,
        });

        firstRowForForm = false;
      }
    }

    return NextResponse.json({
      success: true,
      period,
      year,
      month,
      reportData,
      summary: {
        receipts_booklets: booklets.length,
        receipts_ranges: reportData.length,
      },
    });
  } catch (error) {
    console.error("SMI receipts report error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate the SMI receipts report.",
        error: getErrorMessage(error),
      },
      { status: 500 }
    );
  }
}
