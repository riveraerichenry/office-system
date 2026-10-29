
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { KeyboardEvent } from "react";
import {
  Search,
  CheckCircle2,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

export type AvailableCheck = {
  id: string;
  booklet_number: string;
  book_no: string;
  check_number: string | null;
  beginning_check_no: string;
  ending_check_no: string;
  bank_name: string;
  bank_code?: string | null;
  account_number: string;
  bank_id: string | null;
  bank_account_id: string | null;
  fund_source_id: string | null;
  fund_source: string;
  fund_code: string | null;
  fund_acronym: string | null;
  total_checks: number;
  issued_checks: number;
  remaining_checks: number;
  date_received: string | null;
  status: string;
};

type FundSource = {
  id: string;
  fund_code: string;
  fund_name: string;
  acronym: string | null;
  is_active: boolean;
};

type Props = {
  onSelect?: (booklet: AvailableCheck) => void;
};

function formatDate(value: string | null) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-PH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Manila",
  }).format(date);
}

export default function AvailableChecks({ onSelect }: Props) {
  const [booklets, setBooklets] = useState<AvailableCheck[]>([]);
  const [fundSources, setFundSources] = useState<FundSource[]>([]);
  const [search, setSearch] = useState("");
  const [selectedFundSource, setSelectedFundSource] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [checksResponse, fundsResponse] = await Promise.all([
        fetch("/api/checks/available", { cache: "no-store" }),
        fetch("/api/fund-sources", { cache: "no-store" }),
      ]);

      const [checksResult, fundsResult] = await Promise.all([
        checksResponse.json(),
        fundsResponse.json(),
      ]);

      if (!checksResponse.ok || !checksResult.success) {
        throw new Error(
          checksResult.message ||
            checksResult.error ||
            "Failed to load available booklets."
        );
      }

      if (!fundsResponse.ok || !fundsResult.success) {
        throw new Error(
          fundsResult.message ||
            fundsResult.error ||
            "Failed to load fund sources."
        );
      }

      setBooklets(
        Array.isArray(checksResult.data) ? checksResult.data : []
      );

      setFundSources(
        Array.isArray(fundsResult.data)
          ? fundsResult.data.filter((fund: FundSource) => fund.is_active)
          : []
      );
    } catch (err) {
      console.error("Available checks error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load available booklets."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const filteredBooklets = useMemo(() => {
    const term = search.trim().toLowerCase();

    return booklets.filter((booklet) => {
      const matchesFund =
        selectedFundSource === "all" ||
        booklet.fund_source_id === selectedFundSource;

      const searchable = [
        booklet.booklet_number,
        booklet.book_no,
        booklet.check_number,
        booklet.bank_code,
        booklet.account_number,
        booklet.fund_source,
        booklet.fund_code,
        booklet.fund_acronym,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesFund && searchable.includes(term);
    });
  }, [booklets, search, selectedFundSource]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredBooklets.length / pageSize)
  );
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;

  const displayedBooklets = filteredBooklets.slice(
    startIndex,
    startIndex + pageSize
  );

  function clearFilters() {
    setSearch("");
    setSelectedFundSource("all");
    setPage(1);
  }

  function handleCardKeyDown(
    event: KeyboardEvent<HTMLElement>,
    booklet: AvailableCheck
  ) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (booklet.remaining_checks > 0 && booklet.check_number) {
        onSelect?.(booklet);
      }
    }
  }

  return (
    <section className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search booklet, bank code, account..."
          className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-blue-500"
        />
      </div>

      {/* Fund Filter */}
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-2">
        <label
          htmlFor="available-fund-source"
          className="shrink-0 text-xs font-semibold text-slate-600"
        >
          Fund:
        </label>

        <select
          id="available-fund-source"
          value={selectedFundSource}
          onChange={(event) => {
            setSelectedFundSource(event.target.value);
            setPage(1);
          }}
          className="h-8 min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-2 text-xs outline-none"
        >
          <option value="all">All Fund Sources</option>
          {fundSources.map((fund) => (
            <option key={fund.id} value={fund.id}>
              {fund.fund_name} ({fund.fund_code})
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={clearFilters}
          title="Clear filters"
          aria-label="Clear filters"
          className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
        >
          <RotateCcw size={14} />
        </button>

        <button
          type="button"
          onClick={() => void fetchData()}
          disabled={loading}
          title="Refresh"
          aria-label="Refresh booklets"
          className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-40"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Heading */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Available Check Booklets
          </h2>
          <p className="text-xs text-slate-500">
            Select a booklet to view its details.
          </p>
        </div>

        <span className="text-xs text-slate-500">
          {filteredBooklets.length} found
        </span>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          <AlertCircle size={16} className="shrink-0" />
          <div>
            <p>{error}</p>
            <button
              type="button"
              onClick={() => void fetchData()}
              className="mt-1 font-semibold underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-center">
          <RefreshCw size={20} className="mx-auto animate-spin text-blue-700" />
          <p className="mt-2 text-xs text-slate-500">Loading booklets...</p>
        </div>
      )}

      {!loading && !error && displayedBooklets.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-8 text-center">
          <BookOpen size={26} className="mx-auto text-slate-400" />
          <p className="mt-2 text-sm font-semibold text-slate-700">
            No Available Booklets
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Try another fund source or search.
          </p>
        </div>
      )}

      {!loading && !error && displayedBooklets.length > 0 && (
        <div className="space-y-2">
          {displayedBooklets.map((booklet) => {
            const total = Math.max(0, Number(booklet.total_checks) || 0);
            const issued = Math.max(0, Number(booklet.issued_checks) || 0);
            const remaining = Math.max(
              0,
              Number(booklet.remaining_checks) || 0
            );
            const percentage =
              total > 0 ? Math.min(100, (issued / total) * 100) : 0;
            const selectable = remaining > 0 && Boolean(booklet.check_number);

            return (
              <article
                key={booklet.id}
                role="button"
                tabIndex={selectable ? 0 : -1}
                aria-label={`View booklet ${booklet.booklet_number}`}
                aria-disabled={!selectable}
                onClick={() => {
                  if (selectable) onSelect?.(booklet);
                }}
                onKeyDown={(event) => handleCardKeyDown(event, booklet)}
                className={`overflow-hidden rounded-lg border border-slate-200 border-l-[3px] border-l-blue-600 bg-white transition ${
                  selectable
                    ? "cursor-pointer hover:border-blue-300 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    : "cursor-not-allowed opacity-60"
                }`}
              >
                <div className="space-y-2 p-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <BookOpen size={14} className="text-blue-700" />
                        <h3 className="text-sm font-bold text-blue-700">
                          Booklet {booklet.booklet_number}
                        </h3>
                        <span className="text-[10px] text-slate-500">
                          Book No. {booklet.book_no || "—"}
                        </span>
                      </div>

                      <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 sm:grid-cols-3">
                        <div className="min-w-0">
                          <p className="text-[9px] text-slate-500">Fund Source</p>
                          <p className="truncate text-[11px] font-semibold text-slate-800">
                            {booklet.fund_acronym ||
                              booklet.fund_code ||
                              booklet.fund_source ||
                              "—"}
                          </p>
                        </div>

                        <div className="min-w-0">
                          <p className="text-[9px] text-slate-500">Bank Code</p>
                          <p className="truncate text-[11px] font-semibold text-slate-800">
                            {booklet.bank_code || "—"}
                          </p>
                        </div>

                        <div className="col-span-2 min-w-0 sm:col-span-1">
                          <p className="text-[9px] text-slate-500">
                            Account Number
                          </p>
                          <p className="truncate text-[11px] font-semibold text-slate-800">
                            {booklet.account_number || "—"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                      <CheckCircle2 size={11} />
                      {selectable ? "Available" : "Unavailable"}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-2">
                    <div>
                      <p className="text-[10px] text-slate-500">Check Range</p>
                      <p className="mt-0.5 text-xs font-semibold text-slate-800">
                        {booklet.beginning_check_no}–{booklet.ending_check_no}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] text-slate-500">Current Check</p>
                      <p className="mt-0.5 text-base font-bold text-blue-700">
                        {booklet.check_number || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] text-slate-500">Date Received</p>
                      <p className="mt-0.5 text-xs font-semibold text-slate-800">
                        {formatDate(booklet.date_received)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <div className="mt-1 flex justify-between gap-2 text-[10px] text-slate-500">
                      <span>
                        <b className="text-red-600">{issued}</b> Used
                      </span>
                      <span>{total} Total</span>
                      <span>
                        <b className="text-emerald-600">{remaining}</b>{" "}
                        Remaining
                      </span>
                    </div>
                  </div>

                  <p className="text-center text-[10px] text-slate-400">
                    {selectable
                      ? "Click card to view check details"
                      : "No checks available"}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {!loading && !error && filteredBooklets.length > 0 && (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-500">Rows</span>
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
              className="h-7 rounded-md border border-slate-200 bg-white px-1.5 text-xs"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <span className="text-[10px] text-slate-500">
            Page {currentPage} of {totalPages}
          </span>

          <div className="flex gap-1">
            <button
              type="button"
              aria-label="Previous page"
              disabled={currentPage <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-600 disabled:opacity-40"
            >
              <ChevronLeft size={14} />
            </button>

            <button
              type="button"
              aria-label="Next page"
              disabled={currentPage >= totalPages}
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
              className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-600 disabled:opacity-40"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
