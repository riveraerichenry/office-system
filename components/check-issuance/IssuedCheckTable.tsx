"use client";

import { useMemo, useState } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  FileCheck,
  CalendarDays,
  RotateCcw,
  ClipboardList,
  SlidersHorizontal,
} from "lucide-react";

export type IssuedCheck = {
  id: string | number;
  check_number: string;
  issue_date: string | null;
  payee: string;
  fund_source: string;
  bank_name: string;
  bank_code?: string | null;
  account_number: string;
  amount: number | string;
  status: string;
  booklet_number?: string | null;
};

type Props = {
  rows?: IssuedCheck[];
  loading?: boolean;
  onView?: (check: IssuedCheck) => void;
  onGenerateRCI?: () => void;
};

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

function formatCurrency(value: number | string): string {
  const amount = Number(value);

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function formatDate(value: string | null): string {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function getStatusStyle(status: string): string {
  switch ((status || "").toLowerCase()) {
    case "issued":
      return "bg-blue-50 text-blue-700 ring-blue-200";
    case "released":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "cancelled":
      return "bg-red-50 text-red-700 ring-red-200";
    case "void":
      return "bg-slate-100 text-slate-600 ring-slate-200";
    default:
      return "bg-amber-50 text-amber-700 ring-amber-200";
  }
}

export default function IssuedChecksTable({
  rows = [],
  loading = false,
  onView,
  onGenerateRCI,
}: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();

    return rows.filter((check) => {
      const values = [
        check.check_number,
        check.payee,
        check.fund_source,
        check.bank_name,
        check.bank_code ?? "",
        check.account_number,
        check.booklet_number ?? "",
      ];

      const matchesSearch =
        !term ||
        values.some((value) =>
          String(value ?? "").toLowerCase().includes(term)
        );

      const matchesStatus =
        statusFilter === "All" ||
        (check.status || "").toLowerCase() ===
          statusFilter.toLowerCase();

      const issueDate = check.issue_date
        ? check.issue_date.slice(0, 10)
        : "";

      const matchesFrom = !dateFrom || issueDate >= dateFrom;
      const matchesTo = !dateTo || issueDate <= dateTo;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesFrom &&
        matchesTo
      );
    });
  }, [rows, search, statusFilter, dateFrom, dateTo]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRows.length / pageSize)
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedRows = filteredRows.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalAmount = filteredRows.reduce((sum, check) => {
    const amount = Number(check.amount);
    return sum + (Number.isFinite(amount) ? amount : 0);
  }, 0);

  function resetFilters() {
    setSearch("");
    setStatusFilter("All");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  }

  const inputClass =
    "w-full min-w-0 rounded-lg border border-slate-300 bg-white py-2 pl-3 pr-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  return (
    <div className="w-full min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* HEADER */}
      <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-base font-bold text-slate-800">
            Issued Checks
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Monitor checks issued from registered check booklets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <RotateCcw size={15} />
            Reset
          </button>

          <button
            type="button"
            onClick={onGenerateRCI}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800"
          >
            <FileCheck size={16} />
            Generate RCI
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="border-b border-slate-200 bg-slate-50/70 p-4">
        <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
          <SlidersHorizontal size={15} />
          Filter Records
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="relative sm:col-span-2">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search check no., payee, bank, account..."
              className={`${inputClass} pl-9`}
            />
          </div>

          <div className="relative">
            <SlidersHorizontal
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
              className={`${inputClass} appearance-none pl-9`}
            >
              <option value="All">All statuses</option>
              <option value="Issued">Issued</option>
              <option value="Released">Released</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Void">Void</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:col-span-2 xl:col-span-1">
            <div className="relative min-w-0">
              <CalendarDays
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="date"
                aria-label="Issue date from"
                value={dateFrom}
                onChange={(event) => {
                  setDateFrom(event.target.value);
                  setPage(1);
                }}
                className={`${inputClass} pl-9`}
              />
            </div>

            <div className="relative min-w-0">
              <CalendarDays
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="date"
                aria-label="Issue date to"
                min={dateFrom || undefined}
                value={dateTo}
                onChange={(event) => {
                  setDateTo(event.target.value);
                  setPage(1);
                }}
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="flex flex-col justify-between gap-2 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center">
        <p className="text-sm text-slate-600">
          Showing{" "}
          <strong className="text-slate-900">
            {filteredRows.length === 0
              ? 0
              : (currentPage - 1) * pageSize + 1}
          </strong>
          {" – "}
          <strong className="text-slate-900">
            {Math.min(currentPage * pageSize, filteredRows.length)}
          </strong>
          {" of "}
          <strong className="text-slate-900">
            {filteredRows.length}
          </strong>{" "}
          records
        </p>

        <p className="text-sm text-slate-600">
          Filtered amount:{" "}
          <strong className="text-slate-900">
            {formatCurrency(totalAmount)}
          </strong>
        </p>
      </div>

      {/* TABLE */}
      <div className="w-full min-w-0">
        <table className="w-full table-fixed border-collapse text-left text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-100 text-[10px] uppercase tracking-wide text-slate-600 sm:text-[11px]">
              <th className="w-[18%] px-2 py-3 sm:px-3">
                Issue Date
              </th>
              <th className="w-[22%] px-2 py-3 sm:px-3">
                Payee
              </th>
              <th className="w-[18%] px-2 py-3 sm:px-3">
                Fund Source
              </th>
              <th className="w-[19%] px-2 py-3 sm:px-3">
                Bank / Account
              </th>
              <th className="w-[15%] px-2 py-3 text-right sm:px-3">
                Amount
              </th>
              <th className="w-[8%] px-2 py-3 text-center sm:px-3">
                Status
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-14 text-center text-slate-500"
                >
                  Loading issued checks...
                </td>
              </tr>
            ) : paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-14 text-center">
                  <div className="flex flex-col items-center">
                    <ClipboardList
                      size={28}
                      className="mb-3 text-slate-400"
                    />

                    <p className="font-semibold text-slate-700">
                      No issued checks found
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Try adjusting your filters or search terms.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedRows.map((check) => (
                <tr
                  key={check.id}
                  onClick={() => onView?.(check)}
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" ||
                      event.key === " "
                    ) {
                      event.preventDefault();
                      onView?.(check);
                    }
                  }}
                  tabIndex={onView ? 0 : undefined}
                  role={onView ? "button" : undefined}
                  title="Click to view transaction details"
                  className={`transition ${
                    onView
                      ? "cursor-pointer hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                      : ""
                  }`}
                >
                  <td className="break-words px-2 py-3 text-slate-600 sm:px-3">
                    {formatDate(check.issue_date)}
                  </td>

                  <td className="break-words px-2 py-3 sm:px-3">
                    <p className="font-semibold text-slate-800">
                      {check.payee || "—"}
                    </p>

                    <p className="mt-1 text-[10px] text-slate-400">
                      Check No. {check.check_number}
                    </p>
                  </td>

                  <td className="break-words px-2 py-3 text-slate-700 sm:px-3">
                    {check.fund_source || "—"}
                  </td>

                  <td className="break-words px-2 py-3 sm:px-3">
                    <p className="font-semibold text-slate-800">
                      {check.bank_code || check.bank_name || "—"}
                    </p>

                    <p className="mt-1 break-all font-mono text-[10px] text-slate-500">
                      {check.account_number || "—"}
                    </p>
                  </td>

                  <td className="break-words px-2 py-3 text-right font-semibold tabular-nums text-slate-800 sm:px-3">
                    {formatCurrency(check.amount)}
                  </td>

                  <td className="px-2 py-3 text-center sm:px-3">
                    <span
                      className={`inline-flex max-w-full justify-center rounded-full px-2 py-1 text-[9px] font-semibold capitalize ring-1 ring-inset sm:text-[10px] ${getStatusStyle(
                        check.status
                      )}`}
                    >
                      {check.status || "Unknown"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex flex-col gap-3 border-t border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span>Rows per page</span>

          <select
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value));
              setPage(1);
            }}
            className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-blue-500"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <span className="text-xs text-slate-500">
            Page {currentPage} of {totalPages}
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() =>
                setPage((current) => Math.max(1, current - 1))
              }
              disabled={currentPage <= 1}
              aria-label="Previous page"
              className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>

            <button
              type="button"
              onClick={() =>
                setPage((current) =>
                  Math.min(totalPages, current + 1)
                )
              }
              disabled={currentPage >= totalPages}
              aria-label="Next page"
              className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}