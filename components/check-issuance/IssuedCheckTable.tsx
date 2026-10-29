
"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  CalendarDays,
  RotateCcw,
  ClipboardList,
  SlidersHorizontal,
} from "lucide-react";

type IssuedCheck = {
  id: string | number;
  check_number: string;
  issue_date: string | null;
  payee: string;
  fund_source: string;
  bank_name: string;
  account_number: string;
  amount: number | string;
  status: string;
  booklet_number?: string | null;
};

type Props = {
  rows?: IssuedCheck[];
  loading?: boolean;
  onView?: (check: IssuedCheck) => void;
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
}: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();

    return rows.filter((check: IssuedCheck) => {
      const values = [
        check.check_number,
        check.payee,
        check.fund_source,
        check.bank_name,
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

  const totalAmount = filteredRows.reduce(
    (sum: number, check: IssuedCheck) => {
      const amount = Number(check.amount);
      return sum + (Number.isFinite(amount) ? amount : 0);
    },
    0
  );

  function resetFilters() {
    setSearch("");
    setStatusFilter("All");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  }

  function exportCsv() {
    if (filteredRows.length === 0) return;

    const columns: (keyof IssuedCheck)[] = [
      "check_number",
      "issue_date",
      "payee",
      "fund_source",
      "bank_name",
      "account_number",
      "amount",
      "status",
      "booklet_number",
    ];

    const escapeCsv = (value: unknown): string =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csv = [
      columns.join(","),
      ...filteredRows.map((check: IssuedCheck) =>
        columns.map((column) => escapeCsv(check[column])).join(",")
      ),
    ].join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "issued-checks.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white py-2 pl-3 pr-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Table header and actions */}
      <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center">
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
            Reset Filters
          </button>

          <button
            type="button"
            onClick={exportCsv}
            disabled={filteredRows.length === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FileSpreadsheet size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters placed inside the table header section */}
      <div className="border-b border-slate-200 bg-slate-50/70 p-4">
        <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
          <SlidersHorizontal size={15} />
          Filter Records
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <div className="relative sm:col-span-2 xl:col-span-2">
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

          <div className="relative">
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

          <div className="relative">
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

      {/* Results summary */}
      <div className="flex flex-col justify-between gap-2 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center">
        <p className="text-sm text-slate-600">
          Showing{" "}
          <span className="font-semibold text-slate-900">
            {filteredRows.length === 0
              ? 0
              : (currentPage - 1) * pageSize + 1}
          </span>
          {" – "}
          <span className="font-semibold text-slate-900">
            {Math.min(currentPage * pageSize, filteredRows.length)}
          </span>
          {" of "}
          <span className="font-semibold text-slate-900">
            {filteredRows.length}
          </span>{" "}
          records
        </p>

        <p className="text-sm text-slate-600">
          Filtered amount:{" "}
          <span className="font-bold text-slate-900">
            {formatCurrency(totalAmount)}
          </span>
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1150px] border-collapse text-left text-sm">
          <thead>
            <tr className="bg-slate-100 text-[11px] uppercase tracking-wide text-slate-600">
              <th className="w-14 px-4 py-3 text-center">No.</th>
              <th className="px-4 py-3">Check Number</th>
              <th className="px-4 py-3">Issue Date</th>
              <th className="px-4 py-3">Payee</th>
              <th className="px-4 py-3">Fund Source</th>
              <th className="px-4 py-3">Bank / Account</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-14 text-center text-slate-500"
                >
                  Loading issued checks...
                </td>
              </tr>
            ) : paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-14 text-center">
                  <div className="flex flex-col items-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <ClipboardList size={24} />
                    </div>
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
              paginatedRows.map((check: IssuedCheck, index: number) => (
                <tr
                  key={check.id}
                  className="transition hover:bg-blue-50/40"
                >
                  <td className="px-4 py-3 text-center text-xs text-slate-500">
                    {(currentPage - 1) * pageSize + index + 1}
                  </td>

                  <td className="px-4 py-3">
                    <p className="font-mono font-bold text-blue-900">
                      {check.check_number}
                    </p>
                    {check.booklet_number && (
                      <p className="mt-1 text-[11px] text-slate-500">
                        Booklet: {check.booklet_number}
                      </p>
                    )}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {formatDate(check.issue_date)}
                  </td>

                  <td className="max-w-[220px] px-4 py-3">
                    <p className="truncate font-semibold text-slate-800">
                      {check.payee || "—"}
                    </p>
                  </td>

                  <td className="max-w-[180px] px-4 py-3">
                    <p className="truncate text-slate-700">
                      {check.fund_source || "—"}
                    </p>
                  </td>

                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-700">
                      {check.bank_name || "—"}
                    </p>
                    <p className="mt-1 font-mono text-xs text-slate-500">
                      {check.account_number || "—"}
                    </p>
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums text-slate-800">
                    {formatCurrency(check.amount)}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ring-1 ring-inset ${getStatusStyle(check.status)}`}
                    >
                      {check.status || "Unknown"}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => onView?.(check)}
                      disabled={!onView}
                      title="View check details"
                      aria-label={`View check ${check.check_number}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
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
            {PAGE_SIZE_OPTIONS.map((size: number) => (
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
