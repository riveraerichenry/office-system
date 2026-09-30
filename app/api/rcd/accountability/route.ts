
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import {pool} from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TransactionItem = {
  booklet_registration_id?: string | null;
  or_number?: string | number | null;
};

type Booklet = {
  id: string;
  control_no: string;
  accountable_form_id: string;
  form_code: string;
  form_name: string;
  beginning_or: number;
  ending_or: number;
  current_or: number;
  receipt_count: number;
  status: string;
  issued_beginning_or?: number | null;
  issued_ending_or?: number | null;
  ending_balance_beginning_or?: number | null;
  ending_balance_ending_or?: number | null;
  ending_balance_count: number;
};

type UsedForm = {
  accountable_form_id: string;
  form_code: string;
  form_name: string;
  booklet_count: number;
  beginning_or: number | null;
  ending_or: number | null;
  receipt_count: number;
  issued_count: number;
  booklets: Booklet[];
};

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: "JWT_SECRET is not configured" },
        { status: 500 }
      );
    }

    jwt.verify(token, secret);

    const body = await request.json();
    const items: TransactionItem[] = Array.isArray(body.items)
      ? body.items
      : [];

    if (items.length === 0) {
      return NextResponse.json({
        success: true,
        usedForms: [],
      });
    }

    // Group the OR numbers by booklet registration ID.
    const issuedByBooklet = new Map<string, Set<number>>();

    for (const item of items) {
      const bookletId = item.booklet_registration_id;
      const orNumber = Number(item.or_number);

      if (
        !bookletId ||
        !Number.isSafeInteger(orNumber) ||
        orNumber <= 0
      ) {
        continue;
      }

      if (!issuedByBooklet.has(bookletId)) {
        issuedByBooklet.set(bookletId, new Set<number>());
      }

      issuedByBooklet.get(bookletId)!.add(orNumber);
    }

    const bookletIds = [...issuedByBooklet.keys()];

    if (bookletIds.length === 0) {
      return NextResponse.json({
        success: true,
        usedForms: [],
      });
    }

    // Get the booklet registrations used in the RCD.
    // The primary key is id, not booklet_id.
    const bookletResult = await pool.query(
      `
        SELECT
          b.id,
          b.control_no,
          b.accountable_form_id,
          b.beginning_or,
          b.ending_or,
          b.current_or,
          b.receipt_count,
          b.status,
          af.form_code,
          af.form_name
        FROM smi_booklet_registration b
        INNER JOIN accountable_forms af
          ON af.id = b.accountable_form_id
        WHERE b.id = ANY($1::uuid[])
        ORDER BY
          af.form_code,
          b.beginning_or
      `,
      [bookletIds]
    );

    const booklets: Booklet[] = bookletResult.rows.map(
      (row: any) => {
        const issuedNumbers =
          issuedByBooklet.get(row.id) ?? new Set<number>();

        const validIssued = [...issuedNumbers]
          .filter(
            (number) =>
              number >= Number(row.beginning_or) &&
              number <= Number(row.ending_or)
          )
          .sort((a, b) => a - b);

        const issuedCount = validIssued.length;

        const issuedBeginning =
          issuedCount > 0 ? validIssued[0] : null;

        const issuedEnding =
          issuedCount > 0
            ? validIssued[issuedCount - 1]
            : null;

        // Determine the unused serial numbers after the
        // highest issued OR, without changing the database.
        const nextOR =
          issuedEnding !== null
            ? issuedEnding + 1
            : Number(row.beginning_or);

        const remainingCount = Math.max(
          0,
          Number(row.ending_or) - nextOR + 1
        );

        const remainingBeginning =
          remainingCount > 0 ? nextOR : null;

        const remainingEnding =
          remainingCount > 0
            ? Number(row.ending_or)
            : null;

        return {
          id: row.id,
          control_no: row.control_no,
          accountable_form_id: row.accountable_form_id,
          form_code: row.form_code,
          form_name: row.form_name,
          beginning_or: Number(row.beginning_or),
          ending_or: Number(row.ending_or),
          current_or: Number(row.current_or),
          receipt_count: Number(row.receipt_count),
          status: row.status,
          issued_beginning_or: issuedBeginning,
          issued_ending_or: issuedEnding,
          ending_balance_beginning_or: remainingBeginning,
          ending_balance_ending_or: remainingEnding,
          ending_balance_count: remainingCount,
        };
      }
    );

    // Group booklets by accountable form.
    const formMap = new Map<string, UsedForm>();

    for (const booklet of booklets) {
      let form = formMap.get(booklet.accountable_form_id);

      if (!form) {
        form = {
          accountable_form_id: booklet.accountable_form_id,
          form_code: booklet.form_code,
          form_name: booklet.form_name,
          booklet_count: 0,
          beginning_or: null,
          ending_or: null,
          receipt_count: 0,
          issued_count: 0,
          booklets: [],
        };

        formMap.set(booklet.accountable_form_id, form);
      }

      form.booklets.push(booklet);
      form.booklet_count += 1;

      form.beginning_or =
        form.beginning_or === null
          ? booklet.beginning_or
          : Math.min(form.beginning_or, booklet.beginning_or);

      form.ending_or =
        form.ending_or === null
          ? booklet.ending_or
          : Math.max(form.ending_or, booklet.ending_or);

      const issuedNumbers =
        issuedByBooklet.get(booklet.id) ?? new Set<number>();

      const validIssuedCount = [...issuedNumbers].filter(
        (number) =>
          number >= booklet.beginning_or &&
          number <= booklet.ending_or
      ).length;

      form.issued_count += validIssuedCount;
      form.receipt_count += booklet.receipt_count;
    }

    const usedForms = [...formMap.values()].sort((a, b) =>
      a.form_code.localeCompare(b.form_code)
    );

    return NextResponse.json({
      success: true,
      usedForms,
    });
  } catch (error: any) {
    console.error("RCD ACCOUNTABILITY API ERROR:", error);

    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: error.message ?? "Failed to load accountability.",
      },
      { status: 500 }
    );
  }
}