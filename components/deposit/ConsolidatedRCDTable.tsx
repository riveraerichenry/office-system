"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import DepositFormModal from "./DepositFormModal";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  Search,
  X,
  Plus,
} from "lucide-react";

import ConsolidatedRCDPreviewModal from "@/components/remittance/ConsolidatedRCDPreviewModal";

type ConsolidatedRCD = {
  id: string;
  consolidatedRCDNo: string;
  consolidatedDate: string;
  fundSourceId: string;
  fundCode: string;
  fundName: string;
  accountable: string;
  totalAmount: number;
};

type FundSource = {
  id: string;
  fundCode: string;
  fundName: string;
  acronym: string | null;
};

type ConsolidatedRCDApiItem = {
  id: string;
  consolidatedNo?: string;
  consolidated_no?: string;
  consolidatedDate?: string;
  consolidated_date?: string;
  fundSourceId?: string;
  fund_source_id?: string;
  fundCode?: string;
  fund_code?: string;
  fundName?: string;
  fund_name?: string;
  accountable?: string | null;
  totalAmount?: number | string;
  total_amount?: number | string;
};

type FundSourceApiItem = {
  id: string;
  fundCode?: string;
  fund_code?: string;
  fundName?: string;
  fund_name?: string;
  acronym?: string | null;
};

type ApiResponse = {
  success: boolean;
  error?: string;
  transactions?: ConsolidatedRCDApiItem[];
  consolidatedRCDs?: ConsolidatedRCDApiItem[];
  fundSources?: FundSourceApiItem[];
};

const ITEMS_PER_PAGE = 10;

const inputClassName =
  "h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export default function ConsolidatedRCDTable() {
  const [data, setData] = useState<ConsolidatedRCD[]>([]);
  const [fundSources, setFundSources] = useState<FundSource[]>([]);

  const [depositModalOpen, setDepositModalOpen] = useState(false);
  

  const [fundSource, setFundSource] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // A non-null ID means the preview modal is open.
  const [previewId, setPreviewId] = useState<string | null>(null);

  const mapConsolidatedRCDs = (
    result: ApiResponse
  ): ConsolidatedRCD[] => {
    const items =
      result.transactions ?? result.consolidatedRCDs ?? [];

    return items.map((item) => ({
      id: item.id,
      consolidatedRCDNo:
        item.consolidatedNo ?? item.consolidated_no ?? "",
      consolidatedDate:
        item.consolidatedDate ?? item.consolidated_date ?? "",
      fundSourceId:
        item.fundSourceId ?? item.fund_source_id ?? "",
      fundCode: item.fundCode ?? item.fund_code ?? "",
      fundName: item.fundName ?? item.fund_name ?? "",
      accountable: item.accountable ?? "",
      totalAmount: Number(
        item.totalAmount ?? item.total_amount ?? 0
      ),
    }));
  };

  const mapFundSources = (
    items: FundSourceApiItem[]
  ): FundSource[] =>
    items.map((item) => ({
      id: item.id,
      fundCode: item.fundCode ?? item.fund_code ?? "",
      fundName: item.fundName ?? item.fund_name ?? "",
      acronym: item.acronym ?? null,
    }));

  // Load consolidated RCD records.
  const loadConsolidatedRCDs = useCallback(
    async (
      options?: {
        dateFrom?: string;
        dateTo?: string;
        fundSource?: string;
      }
    ) => {
      const effectiveDateFrom = options?.dateFrom ?? dateFrom;
      const effectiveDateTo = options?.dateTo ?? dateTo;
      const effectiveFundSource =
        options?.fundSource ?? fundSource;

      const params = new URLSearchParams();

      if (effectiveDateFrom) {
        params.set("date_from", effectiveDateFrom);
      }

      if (effectiveDateTo) {
        params.set("date_to", effectiveDateTo);
      }

      if (effectiveFundSource !== "ALL") {
        params.set("fund_source_id", effectiveFundSource);
      }

      const query = params.toString();

      try {
        setError("");

        const response = await fetch(
          `/api/remittance/consolidated${query ? `?${query}` : ""}`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        const result = (await response.json()) as ApiResponse;

        if (!response.ok || !result.success) {
          throw new Error(
            result.error ||
              "Failed to load consolidated RCD records."
          );
        }

        setData(mapConsolidatedRCDs(result));

        if (Array.isArray(result.fundSources)) {
          setFundSources(mapFundSources(result.fundSources));
        }

        setCurrentPage(1);
      } catch (err) {
        console.error("Load consolidated RCDs error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load consolidated RCD records."
        );
      }
    },
    [dateFrom, dateTo, fundSource]
  );

  // Initial load.
  useEffect(() => {
    let cancelled = false;

    async function initialLoad() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/remittance/consolidated",
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        const result = (await response.json()) as ApiResponse;

        if (!response.ok || !result.success) {
          throw new Error(
            result.error ||
              "Failed to load consolidated RCD records."
          );
        }

        if (cancelled) return;

        setData(mapConsolidatedRCDs(result));

        if (Array.isArray(result.fundSources)) {
          setFundSources(mapFundSources(result.fundSources));
        }
      } catch (err) {
        if (cancelled) return;

        console.error("Initial consolidated RCD load error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load consolidated RCD records."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void initialLoad();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      await loadConsolidatedRCDs();
    } finally {
      setRefreshing(false);
    }
  };

  const handleApplyFilter = async () => {
    if (dateFrom && dateTo && dateFrom > dateTo) {
      const Swal = (await import("sweetalert2")).default;

      await Swal.fire({
        icon: "warning",
        title: "Invalid Date Range",
        text: "Date From cannot be later than Date To.",
        confirmButtonColor: "#2563eb",
      });

      return;
    }

    setLoading(true);

    try {
      await loadConsolidatedRCDs({
        dateFrom,
        dateTo,
        fundSource,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilter = async () => {
    setDateFrom("");
    setDateTo("");
    setFundSource("ALL");
    setLoading(true);

    try {
      await loadConsolidatedRCDs({
        dateFrom: "",
        dateTo: "",
        fundSource: "ALL",
      });
    } finally {
      setLoading(false);
    }
  };

  // Pagination.
  const totalPages = Math.max(
    1,
    Math.ceil(data.length / ITEMS_PER_PAGE)
  );

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return data.slice(start, start + ITEMS_PER_PAGE);
  }, [data, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Open preview modal.
  const handleView = (item: ConsolidatedRCD) => {
    if (!item.id) {
      setError("The selected Consolidated RCD has no record ID.");
      return;
    }

    setPreviewId(item.id);
  };

  // Close preview modal and hide the floating button.
  const handleClosePreview = () => {
    setPreviewId(null);
  };

  // Format database dates without timezone shifting.
  const formatDate = (value: string) => {
    if (!value) return "—";

    const dateOnly = String(value).trim().substring(0, 10);
    const match = dateOnly.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (!match) return dateOnly;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    const date = new Date(year, month - 1, day);

    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return dateOnly;
    }

    return date.toLocaleDateString("en-PH", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const formatAmount = (value: number) =>
    Number(value || 0).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const hasFilters =
    Boolean(dateFrom) ||
    Boolean(dateTo) ||
    fundSource !== "ALL";

  return (
    <>
      <div className="flex min-h-0 flex-col">
        {/* FILTER TOOLBAR */}
        <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="consolidated-date-from"
                  className="text-xs font-semibold text-slate-600"
                >
                  Date From
                </label>

                <input
                  id="consolidated-date-from"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className={inputClassName}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="consolidated-date-to"
                  className="text-xs font-semibold text-slate-600"
                >
                  Date To
                </label>

                <input
                  id="consolidated-date-to"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className={inputClassName}
                />
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-2 xl:col-span-1">
                <label
                  htmlFor="consolidated-fund-source"
                  className="text-xs font-semibold text-slate-600"
                >
                  Fund Source
                </label>

                <select
                  id="consolidated-fund-source"
                  value={fundSource}
                  onChange={(e) => setFundSource(e.target.value)}
                  className={`${inputClassName} min-w-0`}
                >
                  <option value="ALL">All Fund Sources</option>

                  {fundSources.map((fund) => (
                    <option key={fund.id} value={fund.id}>
                      {fund.fundCode} - {fund.fundName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end gap-2">
                <button
                  type="button"
                  onClick={handleApplyFilter}
                  disabled={loading}
                  className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Search size={15} />
                  Apply
                </button>

                <button
                  type="button"
                  onClick={handleClearFilter}
                  disabled={loading || !hasFilters}
                  title="Clear filters"
                  aria-label="Clear filters"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X size={15} />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={15}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-slate-500">
              {hasFilters
                ? "Showing records matching the selected filters."
                : "Showing all consolidated RCD records."}
            </p>

            <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              {data.length} {data.length === 1 ? "record" : "records"}
            </span>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div
            role="alert"
            className="flex flex-col gap-3 border-b border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"
          >
            <span>{error}</span>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="font-semibold underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        )}

        {/* TABLE */}
        <div className="min-w-0 overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                <th className="w-[22%] px-5 py-4">
                  Consolidated RCD No.
                </th>
                <th className="w-[15%] px-4 py-4">Date</th>
                <th className="w-[23%] px-4 py-4">Fund Source</th>
                <th className="w-[20%] px-4 py-4">Accountable</th>
                <th className="w-[15%] px-4 py-4 text-right">
                  Total Amount
                </th>
                <th className="w-[5%] px-4 py-4 text-center">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-14 text-center text-slate-400"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw size={17} className="animate-spin" />
                      Loading consolidated RCD records...
                    </div>
                  </td>
                </tr>
              )}

              {!loading && !error && paginatedData.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-14 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                        <Search size={21} className="text-slate-400" />
                      </div>

                      <p className="font-semibold text-slate-700">
                        No consolidated RCD records found
                      </p>

                      <p className="text-xs text-slate-500">
                        Try changing your filters or refreshing the table.
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {!loading &&
                paginatedData.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => handleView(item)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleView(item);
                      }
                    }}
                    tabIndex={0}
                    title="Open Consolidated RCD"
                    className="cursor-pointer border-b border-slate-100 transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                  >
                    <td className="px-5 py-4">
                      <span className="font-semibold text-slate-800">
                        {item.consolidatedRCDNo || "—"}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                      {formatDate(item.consolidatedDate)}
                    </td>

                    <td className="px-4 py-4">
                      <div className="font-semibold text-slate-700">
                        {item.fundCode || "—"}
                      </div>

                      {item.fundName && (
                        <div className="mt-0.5 max-w-[260px] truncate text-xs text-slate-500">
                          {item.fundName}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-4 text-slate-600">
                      <span className="block max-w-[220px] truncate">
                        {item.accountable || "—"}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-right font-semibold tabular-nums text-slate-800">
                      ₱ {formatAmount(item.totalAmount)}
                    </td>

                    <td className="px-4 py-4 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleView(item);
                        }}
                        title="View or reprint Consolidated RCD"
                        aria-label={`View or reprint ${item.consolidatedRCDNo}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            {data.length === 0
              ? "Showing 0 records"
              : `Showing ${
                  (currentPage - 1) * ITEMS_PER_PAGE + 1
                }–${Math.min(
                  currentPage * ITEMS_PER_PAGE,
                  data.length
                )} of ${data.length} records`}
          </p>

          <div className="flex items-center justify-between gap-2 sm:justify-end">
            <button
              type="button"
              disabled={currentPage <= 1 || loading}
              onClick={() =>
                setCurrentPage((page) => Math.max(1, page - 1))
              }
              aria-label="Previous page"
              className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <span className="whitespace-nowrap px-2 text-xs font-medium text-slate-600">
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages || loading}
              onClick={() =>
                setCurrentPage((page) =>
                  Math.min(totalPages, page + 1)
                )
              }
              aria-label="Next page"
              className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* EXISTING PREVIEW MODAL */}
      <ConsolidatedRCDPreviewModal
        id={previewId}
        onClose={handleClosePreview}
      />

      {/* FLOATING TABLE ACTION
          Appears only while the preview modal is open. */}
      {previewId && (
        <button
            type="button"
            onClick={() => setDepositModalOpen(true)}
            className="fixed bottom-6 right-6 z-[100001] inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-4 font-semibold text-white shadow-xl transition hover:bg-blue-700"
        >
            <Plus size={20} />
            Make a Deposit
        </button>
        )}
        <DepositFormModal
        open={depositModalOpen}
        onClose={() => setDepositModalOpen(false)}
        />
    </>
    
  );

}