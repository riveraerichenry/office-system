
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  RefreshCw,
  AlertCircle,
  LoaderCircle,
  FileCheck2,
} from "lucide-react";

import CheckBookletTable from "@/components/checks/CheckBooookletTable";
import RegisterCheckBookletModal from "@/components/checks/RegisterCheckBookletModal";
import BookletDetailsModal from "@/components/checks/BookletDetailsModal";

interface Booklet {
  id: string;
  bookletNumber: string;
  bookNo?: string | null;
  registeredAt?: string | null;
  dateReceived?: string | null;

  fundSourceId?: string | null;
  fundSourceName?: string | null;
  fundSourceCode?: string | null;
  fundSourceDetails?: Record<string, unknown> | null;

  bankId?: string | null;
  bank: string;
  bankName?: string | null;
  bankCode?: string | null;
  bankDetails?: Record<string, unknown> | null;

  bankAccountId?: string | null;
  accountName?: string | null;
  accountNumber: string;
  bankAccountDetails?: Record<string, unknown> | null;

  beginningCheckNo: string;
  endingCheckNo: string;
  remarks?: string | null;
  status: string;
  createdAt?: string | null;

  checks?: {
    id: string;
    checkNumber: string;
    status: string;
    payee?: string | null;
    amount?: number | string | null;
    dateIssued?: string | null;
  }[];
}

function firstValue(
  record: Record<string, unknown>,
  ...keys: string[]
): unknown {
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) {
      return record[key];
    }
  }

  return undefined;
}

function textValue(value: unknown, fallback = ""): string {
  if (value === undefined || value === null) {
    return fallback;
  }

  return String(value);
}

function objectValue(
  value: unknown
): Record<string, unknown> | null {
  if (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value as Record<string, unknown>;
  }

  return null;
}

function normalizeBooklet(value: unknown): Booklet {
  const row = objectValue(value) ?? {};

  const rawChecks = firstValue(row, "checks");

  const checks = Array.isArray(rawChecks)
    ? rawChecks.map((item) => {
        const check = objectValue(item) ?? {};

        return {
          id: textValue(firstValue(check, "id")),
          checkNumber: textValue(
            firstValue(check, "checkNumber", "check_number")
          ),
          status: textValue(
            firstValue(check, "status"),
            "Available"
          ),
          payee:
            textValue(firstValue(check, "payee"), "") || null,
          amount:
            (firstValue(check, "amount") as number | string | null) ??
            null,
          dateIssued:
            textValue(
              firstValue(check, "dateIssued", "date_issued"),
              ""
            ) || null,
        };
      })
    : [];

  const bankDetails = objectValue(
    firstValue(row, "bankDetails", "bank_details")
  );

  const bankAccountDetails = objectValue(
    firstValue(row, "bankAccountDetails", "bank_account_details")
  );

  const fundSourceDetails = objectValue(
    firstValue(row, "fundSourceDetails", "fund_source_details")
  );

  const bankName =
    textValue(
      firstValue(row, "bankName", "bank_name", "bank"),
      ""
    ) ||
    textValue(
      firstValue(bankDetails ?? {}, "bank_name", "name"),
      ""
    );

  const accountName =
    textValue(
      firstValue(row, "accountName", "account_name"),
      ""
    ) ||
    textValue(
      firstValue(
        bankAccountDetails ?? {},
        "account_name",
        "account_holder_name",
        "account_holder",
        "name"
      ),
      ""
    );

  const fundSourceName =
    textValue(
      firstValue(row, "fundSourceName", "fund_source_name"),
      ""
    ) ||
    textValue(
      firstValue(
        fundSourceDetails ?? {},
        "fund_name",
        "fund_source_name",
        "name"
      ),
      ""
    );

  return {
    id: textValue(firstValue(row, "id")),

    bookletNumber: textValue(
      firstValue(
        row,
        "bookletNumber",
        "booklet_number",
        "bookNo",
        "book_no"
      )
    ),

    bookNo:
      textValue(firstValue(row, "bookNo", "book_no"), "") || null,

    registeredAt:
      textValue(
        firstValue(row, "registeredAt", "registered_at"),
        ""
      ) || null,

    dateReceived:
      textValue(
        firstValue(row, "dateReceived", "date_received"),
        ""
      ) || null,

    fundSourceId:
      textValue(
        firstValue(row, "fundSourceId", "fund_source_id"),
        ""
      ) || null,

    fundSourceName: fundSourceName || null,

    fundSourceCode:
      textValue(
        firstValue(
          row,
          "fundSourceCode",
          "fund_source_code",
          "fund_code"
        ),
        ""
      ) ||
      textValue(
        firstValue(
          fundSourceDetails ?? {},
          "fund_code",
          "fund_source_code",
          "code"
        ),
        ""
      ) ||
      null,

    fundSourceDetails,

    bankId:
      textValue(firstValue(row, "bankId", "bank_id"), "") || null,

    bank: bankName,
    bankName: bankName || null,

    bankCode:
      textValue(
        firstValue(row, "bankCode", "bank_code"),
        ""
      ) ||
      textValue(
        firstValue(bankDetails ?? {}, "bank_code", "code"),
        ""
      ) ||
      null,

    bankDetails,

    bankAccountId:
      textValue(
        firstValue(row, "bankAccountId", "bank_account_id"),
        ""
      ) || null,

    accountName: accountName || null,

    accountNumber:
      textValue(
        firstValue(row, "accountNumber", "account_number"),
        ""
      ) ||
      textValue(
        firstValue(
          bankAccountDetails ?? {},
          "account_number",
          "account_no"
        ),
        ""
      ),

    bankAccountDetails,

    beginningCheckNo: textValue(
      firstValue(
        row,
        "beginningCheckNo",
        "beginning_check_no"
      )
    ),

    endingCheckNo: textValue(
      firstValue(row, "endingCheckNo", "ending_check_no")
    ),

    remarks:
      textValue(firstValue(row, "remarks"), "") || null,

    status: textValue(firstValue(row, "status"), "Active"),

    createdAt:
      textValue(
        firstValue(row, "createdAt", "created_at"),
        ""
      ) || null,

    checks,
  };
}

export default function ChecksPage() {
  const [booklets, setBooklets] = useState<Booklet[]>([]);

  const [selectedBooklet, setSelectedBooklet] =
    useState<Booklet | null>(null);

  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchBooklets = useCallback(async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError("");

    try {
      const response = await fetch("/api/checks/booklets", {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.message ||
            result?.error ||
            "Failed to load registered check booklets."
        );
      }

      if (result?.success === false) {
        throw new Error(
          result?.message ||
            result?.error ||
            "Failed to load registered check booklets."
        );
      }

      const rows = Array.isArray(result)
        ? result
        : Array.isArray(result?.booklets)
          ? result.booklets
          : Array.isArray(result?.data)
            ? result.data
            : null;

      if (!rows) {
        throw new Error(
          "The API response does not contain a booklet list. Check the GET response from /api/checks/booklets."
        );
      }

      const normalizedBooklets: Booklet[] =
        rows.map((row: unknown) => normalizeBooklet(row));

      setBooklets(normalizedBooklets);

      setSelectedBooklet((current) => {
        if (!current) {
          return null;
        }

        return (
          normalizedBooklets.find(
            (booklet: Booklet) => booklet.id === current.id
          ) ?? null
        );
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while loading booklets."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchBooklets();
  }, [fetchBooklets]);

  const handleRegistrationSuccess = useCallback(() => {
    void fetchBooklets(false);
  }, [fetchBooklets]);

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-700 text-white shadow-sm">
              <FileCheck2 size={27} />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                Treasury Management
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Check Booklet Registration
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Register, monitor, and manage check booklets and their
                assigned check number ranges.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void fetchBooklets(false)}
            disabled={loading || refreshing}
            className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 sm:self-center"
          >
            {refreshing ? (
              <LoaderCircle
                size={17}
                className="animate-spin"
              />
            ) : (
              <RefreshCw size={17} />
            )}
            Refresh
          </button>
        </header>

        {error && (
          <div
            role="alert"
            className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3">
              <AlertCircle
                size={20}
                className="mt-0.5 shrink-0 text-red-600"
              />

              <div>
                <p className="font-semibold text-red-800">
                  Unable to load check booklets
                </p>

                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void fetchBooklets()}
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg border border-red-300 bg-white px-4 text-sm font-semibold text-red-700 hover:bg-red-100"
            >
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <LoaderCircle
              size={32}
              className="animate-spin text-blue-700"
            />

            <p className="mt-4 text-sm font-medium text-slate-600">
              Loading registered booklets...
            </p>
          </div>
        ) : (
          <CheckBookletTable
            booklets={booklets}
            onSelect={(booklet: Booklet) => {
              setSelectedBooklet(booklet);
            }}
            onRegister={() => setRegisterModalOpen(true)}
          />
        )}

        <RegisterCheckBookletModal
          open={registerModalOpen}
          onClose={() => setRegisterModalOpen(false)}
          onSuccess={handleRegistrationSuccess}
        />

        <BookletDetailsModal
          booklet={selectedBooklet}
          onClose={() => setSelectedBooklet(null)}
        />
      </div>
    </main>
  );
}
