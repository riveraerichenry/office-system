"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Landmark,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

type DepositedRCDRecord = {
  id: string;
  consolidatedNo: string;
  consolidatedDate: string;
  fundCode: string;
  fundName: string;
  accountable: string;
  totalAmount: number;
  status: string;
};

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// Update this path to your actual deposited-records API.
const DEPOSITED_API = "/api/deposit/deposited";

function formatDate(value: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10);
  }

  return date.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function formatAmount(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function getStatusClasses(status: string) {
  switch (status.toUpperCase()) {
    case "DEPOSITED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "PENDING":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "REJECTED":
    case "CANCELLED":
      return "border-red-200 bg-red-50 text-red-700";

    default:
      return "border-slate-200 bg-slate-100 text-slate-700";
  }
}

export default function DepositedRCD() {
  const [records, setRecords] = useState<DepositedRCDRecord[]>([]);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(DEPOSITED_API, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(
          data.error || "Failed to load deposited RCD records."
        );
      }

      const rows = Array.isArray(data.transactions)
        ? data.transactions
        : Array.isArray(data.records)
          ? data.records
          : [];

      setRecords(
        rows.map((item: Record<string, unknown>) => ({
          id: String(item.id ?? ""),
          consolidatedNo: String(
            item.consolidatedNo ??
              item.consolidated_no ??
              ""
          ),
          consolidatedDate: String(
            item.createdAt ??
              item.created_at ??
              item.consolidatedDate ??
              item.consolidated_date ??
              ""
          ),
          fundCode: String(item.fundCode ?? item.fund_code ?? ""),
          fundName: String(item.fundName ?? item.fund_name ?? ""),
          accountable: String(item.accountable ?? ""),
          totalAmount: Number(item.totalAmount ?? item.total_amount ?? 0),
          status: String(item.status ?? ""),
        }))
      );
    } catch (err) {
      setRecords([]);
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchRecords();
  }, [fetchRecords]);

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    return records.filter((record) => {
      const matchesSearch =
        !query ||
        record.consolidatedNo.toLowerCase().includes(query) ||
        record.fundCode.toLowerCase().includes(query) ||
        record.fundName.toLowerCase().includes(query) ||
        record.accountable.toLowerCase().includes(query);

      // Compare calendar dates without changing the stored timestamp.
      const recordDate = record.consolidatedDate.slice(0, 10);

      const matchesFrom = !dateFrom || recordDate >= dateFrom;
      const matchesTo = !dateTo || recordDate <= dateTo;

      return matchesSearch && matchesFrom && matchesTo;
    });
  }, [records, search, dateFrom, dateTo]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRecords.length / pageSize)
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalAmount = filteredRecords.reduce(
    (sum, record) => sum + record.totalAmount,
    0
  );

  function resetFilters() {
    setSearch("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  }

  return (
    <section className="overflow-hidden bg-white">
      {/* SUMMARY */}
      <div className="grid grid-cols-1 gap-4 border-b border-slate-200 p-5 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <CheckCircle2 size={22} />
          </div>

          <div>
            <p className="text-xs font-medium text-slate-500">
              Deposited Records
            </p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              {filteredRecords.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <Landmark size={22} />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500">
              Total Amount
            </p>
            <p className="mt-1 truncate text-xl font-bold text-slate-900">
              {formatAmount(totalAmount)}
            </p>
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex flex-col gap-4 border-b border-slate-200 p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="flex-1">
            <label
              htmlFor="deposited-search"
              className="mb-1.5 block text-sm font-semibold text-slate-700"
            >
              Search Records
            </label>

            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="deposited-search"
                type="text"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search RCD number, fund source, accountable..."
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="w-full lg:w-44">
            <label
              htmlFor="deposited-from"
              className="mb-1.5 block text-sm font-semibold text-slate-700"
            >
              Date From
            </label>

            <div className="relative">
              <CalendarDays
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="deposited-from"
                type="date"
                value={dateFrom}
                max={dateTo || undefined}
                onChange={(event) => {
                  setDateFrom(event.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="w-full lg:w-44">
            <label
              htmlFor="deposited-to"
              className="mb-1.5 block text-sm font-semibold text-slate-700"
            >
              Date To
            </label>

            <div className="relative">
              <CalendarDays
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="deposited-to"
                type="date"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={(event) => {
                  setDateTo(event.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Clear Filters
          </button>

          <button
            type="button"
            onClick={() => void fetchRecords()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[1000px] border-collapse text-left">
          <thead>
            <tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
              <th className="px-5 py-4 font-bold">No.</th>
              <th className="px-5 py-4 font-bold">Consolidated RCD No.</th>
              <th className="px-5 py-4 font-bold">Created Date</th>
              <th className="px-5 py-4 font-bold">Fund Source</th>
              <th className="px-5 py-4 font-bold">Accountable</th>
              <th className="px-5 py-4 text-right font-bold">Amount</th>
              <th className="px-5 py-4 font-bold">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-12 text-center text-sm text-slate-500"
                >
                  Loading deposited records...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={7} className="px-5 py-10">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <AlertCircle
                      size={28}
                      className="text-red-500"
                    />
                    <p className="text-sm text-red-600">{error}</p>

                    <button
                      type="button"
                      onClick={() => void fetchRecords()}
                      className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
                    >
                      Try Again
                    </button>
                  </div>
                </td>
              </tr>
            ) : paginatedRecords.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-12 text-center text-sm text-slate-500"
                >
                  No deposited records found.
                </td>
              </tr>
            ) : (
              paginatedRecords.map((record, index) => (
                <tr
                  key={record.id}
                  className="transition hover:bg-slate-50"
                >
                  <td className="px-5 py-4 text-sm text-slate-500">
                    {(currentPage - 1) * pageSize + index + 1}
                  </td>

                  <td className="px-5 py-4">
                    <span className="font-semibold text-slate-900">
                      {record.consolidatedNo || "—"}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700">
                    {formatDate(record.consolidatedDate)}
                  </td>

                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-slate-800">
                      {record.fundCode || "—"}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {record.fundName}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-700">
                    {record.accountable || "—"}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-semibold tabular-nums text-slate-900">
                    {formatAmount(record.totalAmount)}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                        record.status
                      )}`}
                    >
                      {record.status || "Unknown"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex flex-col gap-4 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
          <label htmlFor="deposited-page-size">
            Rows per page:
          </label>

          <select
            id="deposited-page-size"
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value));
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>

          <span>
            Showing{" "}
            {filteredRecords.length === 0
              ? 0
              : (currentPage - 1) * pageSize + 1}
            {"–"}
            {Math.min(currentPage * pageSize, filteredRecords.length)}
            {" of "}
            {filteredRecords.length} records
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPage <= 1 || loading}
            onClick={() => setPage((previous) => previous - 1)}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          <span className="min-w-24 text-center text-sm text-slate-600">
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage >= totalPages || loading}
            onClick={() => setPage((previous) => previous + 1)}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}