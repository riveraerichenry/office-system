"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
} from "lucide-react";

import Swal from "sweetalert2";

import ConsolidatedRCDPreviewModal from "@/components/remittance/ConsolidatedRCDPreviewModal";

/* ============================================================
   TYPES
============================================================ */

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

const ITEMS_PER_PAGE = 10;

/* ============================================================
   COMPONENT
============================================================ */

export default function ConsolidatedRCDTable() {
  /* ============================================================
     DATA
  ============================================================ */

  const [data, setData] =
    useState<ConsolidatedRCD[]>([]);

  const [fundSources, setFundSources] =
    useState<FundSource[]>([]);

  /* ============================================================
     FILTERS
  ============================================================ */

  const [fundSource, setFundSource] =
    useState("ALL");

  const [dateFrom, setDateFrom] =
    useState("");

  const [dateTo, setDateTo] =
    useState("");

  /* ============================================================
     PAGINATION
  ============================================================ */

  const [currentPage, setCurrentPage] =
    useState(1);

  /* ============================================================
     LOADING / ERROR
  ============================================================ */

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  /* ============================================================
     CONSOLIDATED RCD PREVIEW

     IMPORTANT:

     We only store the consolidated transaction ID.

     ConsolidatedRCDPreviewModal will call:

     GET /api/remittance/consolidated/[id]
  ============================================================ */

  const [previewId, setPreviewId] =
    useState<string | null>(null);

  /* ============================================================
     MAP API RESULT
  ============================================================ */

  function mapConsolidatedRCDs(
    result: any
  ): ConsolidatedRCD[] {
    return (
      result.transactions ||
      result.consolidatedRCDs ||
      []
    ).map((item: any) => ({
      id:
        item.id,

      consolidatedRCDNo:
        item.consolidatedNo ??
        item.consolidated_no ??
        "",

      consolidatedDate:
        item.consolidatedDate ??
        item.consolidated_date ??
        "",

      fundSourceId:
        item.fundSourceId ??
        item.fund_source_id ??
        "",

      fundCode:
        item.fundCode ??
        item.fund_code ??
        "",

      fundName:
        item.fundName ??
        item.fund_name ??
        "",

      accountable:
        item.accountable ??
        "",

      totalAmount:
        Number(
          item.totalAmount ??
            item.total_amount ??
            0
        ),
    }));
  }

  /* ============================================================
     LOAD CONSOLIDATED RCDs
  ============================================================ */

  const loadConsolidatedRCDs =
    async () => {
      try {
        setError("");

        const params =
          new URLSearchParams();

        if (dateFrom) {
          params.set(
            "date_from",
            dateFrom
          );
        }

        if (dateTo) {
          params.set(
            "date_to",
            dateTo
          );
        }

        if (
          fundSource !== "ALL"
        ) {
          params.set(
            "fund_source_id",
            fundSource
          );
        }

        const query =
          params.toString();

        const response =
          await fetch(
            `/api/remittance/consolidated${
              query
                ? `?${query}`
                : ""
            }`,
            {
              method: "GET",

              credentials:
                "include",

              cache:
                "no-store",
            }
          );

        const result =
          await response.json();

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.error ||
              "Failed to load consolidated RCDs"
          );
        }

        const mapped =
          mapConsolidatedRCDs(
            result
          );

        setData(mapped);

        if (
          Array.isArray(
            result.fundSources
          )
        ) {
          setFundSources(
            result.fundSources
          );
        }

        setCurrentPage(1);
      } catch (err) {
        console.error(
          "Failed to load consolidated RCDs:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load consolidated RCDs"
        );
      } finally {
        setLoading(false);

        setRefreshing(false);
      }
    };

  /* ============================================================
     INITIAL LOAD
  ============================================================ */

  useEffect(() => {
    loadConsolidatedRCDs();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ============================================================
     REFRESH
  ============================================================ */

  const handleRefresh =
    async () => {
      setRefreshing(true);

      await loadConsolidatedRCDs();
    };

  /* ============================================================
     APPLY FILTER
  ============================================================ */

  const handleApplyFilter =
    async () => {
      if (
        dateFrom &&
        dateTo &&
        dateFrom > dateTo
      ) {
        await Swal.fire({
          icon:
            "warning",

          title:
            "Invalid Date Range",

          text:
            "Date From cannot be later than Date To.",
        });

        return;
      }

      setCurrentPage(1);

      setLoading(true);

      await loadConsolidatedRCDs();
    };

  /* ============================================================
     CLEAR FILTER
  ============================================================ */

  const handleClearFilter =
    async () => {
      setDateFrom("");

      setDateTo("");

      setFundSource(
        "ALL"
      );

      setCurrentPage(1);

      setLoading(true);

      try {
        setError("");

        const response =
          await fetch(
            "/api/remittance/consolidated",
            {
              method:
                "GET",

              credentials:
                "include",

              cache:
                "no-store",
            }
          );

        const result =
          await response.json();

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.error ||
              "Failed to load consolidated RCDs"
          );
        }

        const mapped =
          mapConsolidatedRCDs(
            result
          );

        setData(mapped);

        if (
          Array.isArray(
            result.fundSources
          )
        ) {
          setFundSources(
            result.fundSources
          );
        }
      } catch (err) {
        console.error(
          "Failed to load consolidated RCDs:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load consolidated RCDs"
        );
      } finally {
        setLoading(false);
      }
    };

  /* ============================================================
     PAGINATION
  ============================================================ */

  const totalPages =
    Math.max(
      1,

      Math.ceil(
        data.length /
          ITEMS_PER_PAGE
      )
    );

  const paginatedData =
    useMemo(() => {
      const start =
        (currentPage - 1) *
        ITEMS_PER_PAGE;

      return data.slice(
        start,

        start +
          ITEMS_PER_PAGE
      );
    }, [
      data,
      currentPage,
    ]);

  useEffect(() => {
    if (
      currentPage >
      totalPages
    ) {
      setCurrentPage(
        totalPages
      );
    }
  }, [
    currentPage,
    totalPages,
  ]);

  /* ============================================================
     VIEW
  ============================================================ */

  const handleView =
    async (
      item: ConsolidatedRCD
    ) => {
      const result =
        await Swal.fire({
          title:
            "Consolidated RCD",

          html: `
            <div style="text-align:left">

              <p style="margin-bottom:8px">
                <strong>Consolidated RCD No.:</strong>
                ${
                  item.consolidatedRCDNo ||
                  "-"
                }
              </p>

              <p style="margin-bottom:8px">
                <strong>Date:</strong>
                ${formatDate(
                  item.consolidatedDate
                )}
              </p>

              <p style="margin-bottom:8px">
                <strong>Fund Source:</strong>
                ${
                  item.fundCode ||
                  "-"
                }
                ${
                  item.fundName
                    ? ` - ${item.fundName}`
                    : ""
                }
              </p>

              <p style="margin-bottom:8px">
                <strong>Accountable:</strong>
                ${
                  item.accountable ||
                  "-"
                }
              </p>

              <p>
                <strong>Total Amount:</strong>
                ₱${formatAmount(
                  item.totalAmount
                )}
              </p>

            </div>
          `,

          showCancelButton:
            false,

          showDenyButton:
            true,

          confirmButtonText:
            "Close",

          denyButtonText:
            "↻ Reprint",

          customClass: {
            denyButton:
              "bg-blue-600 text-white px-4 py-2 rounded-lg",

            confirmButton:
              "bg-slate-200 text-slate-700 px-4 py-2 rounded-lg",
          },

          buttonsStyling:
            false,
        });

      /* ==========================================================
         REPRINT

         IMPORTANT:

         Pass ONLY the real
         rcd_consolidated_transaction.id

         The preview modal loads the full record itself.
      ========================================================== */

      if (
        result.isDenied
      ) {
        console.log(
          "Opening Consolidated RCD Preview ID:",
          item.id
        );

        setPreviewId(
          item.id
        );
      }
    };

  /* ============================================================
     FORMAT DATE
  ============================================================ */

  const formatDate = (
    value: string
  ) => {
    if (!value) {
      return "-";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return value;
    }

    return date.toLocaleDateString(
      "en-US",
      {
        month:
          "short",

        day:
          "2-digit",

        year:
          "numeric",
      }
    );
  };

  /* ============================================================
     FORMAT AMOUNT
  ============================================================ */

  const formatAmount = (
    value: number
  ) => {
    return Number(
      value || 0
    ).toLocaleString(
      "en-PH",
      {
        minimumFractionDigits:
          2,

        maximumFractionDigits:
          2,
      }
    );
  };

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <>
      <div className="flex min-h-0 flex-col">

        {/* ======================================================
            FILTER TOOLBAR
        ====================================================== */}

        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 px-5 py-3">

          <div className="flex flex-wrap items-end gap-3">

            {/* DATE FROM */}

            <div className="flex flex-col gap-1">

              <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Date From
              </label>

              <input
                type="date"

                value={
                  dateFrom
                }

                onChange={(e) =>
                  setDateFrom(
                    e.target.value
                  )
                }

                className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>

            {/* DATE TO */}

            <div className="flex flex-col gap-1">

              <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Date To
              </label>

              <input
                type="date"

                value={
                  dateTo
                }

                onChange={(e) =>
                  setDateTo(
                    e.target.value
                  )
                }

                className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>

            {/* FUND SOURCE */}

            <div className="flex flex-col gap-1">

              <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Fund Source
              </label>

              <select
                value={
                  fundSource
                }

                onChange={(e) =>
                  setFundSource(
                    e.target.value
                  )
                }

                className="h-9 min-w-[230px] rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >

                <option value="ALL">
                  All Fund Sources
                </option>

                {fundSources.map(
                  (fund) => (

                    <option
                      key={
                        fund.id
                      }

                      value={
                        fund.id
                      }
                    >

                      {fund.fundCode} -{" "}
                      {fund.fundName}

                    </option>

                  )
                )}

              </select>

            </div>

            {/* APPLY */}

            <button
              type="button"

              onClick={
                handleApplyFilter
              }

              disabled={
                loading
              }

              className="h-9 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Apply
            </button>

            {/* CLEAR */}

            <button
              type="button"

              onClick={
                handleClearFilter
              }

              disabled={
                loading
              }

              className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Clear
            </button>

          </div>

          {/* REFRESH */}

          <button
            type="button"

            onClick={
              handleRefresh
            }

            disabled={
              refreshing
            }

            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >

            <RefreshCw
              size={15}

              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh

          </button>

        </div>

        {/* ======================================================
            ERROR
        ====================================================== */}

        {error && (

          <div className="border-b border-red-200 bg-red-50 px-5 py-3 text-sm text-red-600">

            {error}

          </div>

        )}

        {/* ======================================================
            TABLE
        ====================================================== */}

        <div className="min-w-0 overflow-x-auto">

          <table className="w-full min-w-[850px] table-fixed border-collapse text-sm">

            <thead>

              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">

                <th className="w-[23%] px-5 py-3">
                  Consolidated RCD No.
                </th>

                <th className="w-[15%] px-4 py-3">
                  Date
                </th>

                <th className="w-[24%] px-4 py-3">
                  Fund Source
                </th>

                <th className="w-[23%] px-4 py-3">
                  Accountable
                </th>

                <th className="w-[12%] px-4 py-3 text-right">
                  Total Amount
                </th>

                <th className="w-[3%] px-4 py-3 text-center">
                </th>

              </tr>

            </thead>

            <tbody>

              {/* LOADING */}

              {loading && (

                <tr>

                  <td
                    colSpan={6}

                    className="px-5 py-12 text-center text-sm text-slate-400"
                  >

                    <div className="flex items-center justify-center gap-2">

                      <RefreshCw
                        size={16}
                        className="animate-spin"
                      />

                      Loading consolidated RCDs...

                    </div>

                  </td>

                </tr>

              )}

              {/* EMPTY */}

              {!loading &&
                paginatedData.length ===
                  0 && (

                  <tr>

                    <td
                      colSpan={6}

                      className="px-5 py-12 text-center text-sm text-slate-400"
                    >
                      No consolidated RCDs found.
                    </td>

                  </tr>

                )}

              {/* DATA */}

              {!loading &&
                paginatedData.map(
                  (item) => (

                    <tr
                      key={
                        item.id
                      }

                      onClick={() =>
                        handleView(
                          item
                        )
                      }

                      className="cursor-pointer border-b border-slate-100 transition hover:bg-slate-50"
                    >

                      {/* CONSOLIDATED RCD NO */}

                      <td className="truncate px-5 py-3 font-semibold text-slate-700">

                        {item.consolidatedRCDNo ||
                          "-"}

                      </td>

                      {/* DATE */}

                      <td className="px-4 py-3 text-slate-600">

                        {formatDate(
                          item.consolidatedDate
                        )}

                      </td>

                      {/* FUND SOURCE */}

                      <td className="truncate px-4 py-3 text-slate-600">

                        <div className="font-medium">

                          {item.fundCode ||
                            "-"}

                        </div>

                        {item.fundName && (

                          <div className="truncate text-xs text-slate-400">

                            {
                              item.fundName
                            }

                          </div>

                        )}

                      </td>

                      {/* ACCOUNTABLE */}

                      <td className="truncate px-4 py-3 text-slate-600">

                        {item.accountable ||
                          "-"}

                      </td>

                      {/* TOTAL */}

                      <td className="px-4 py-3 text-right font-semibold text-slate-700">

                        ₱{" "}

                        {formatAmount(
                          item.totalAmount
                        )}

                      </td>

                      {/* VIEW */}

                      <td className="px-4 py-3 text-center">

                        <button
                          type="button"

                          onClick={(e) => {
                            e.stopPropagation();

                            handleView(
                              item
                            );
                          }}

                          title="View Consolidated RCD"

                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                        >

                          <Eye
                            size={16}
                          />

                        </button>

                      </td>

                    </tr>

                  )
                )}

            </tbody>

          </table>

        </div>

        {/* ======================================================
            PAGINATION
        ====================================================== */}

        <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3">

          <div className="text-xs text-slate-500">

            {data.length === 0
              ? "0 records"
              : `Showing ${
                  (currentPage -
                    1) *
                    ITEMS_PER_PAGE +
                  1
                }–${Math.min(
                  currentPage *
                    ITEMS_PER_PAGE,

                  data.length
                )} of ${
                  data.length
                }`}

          </div>

          <div className="flex items-center gap-1">

            {/* PREVIOUS */}

            <button
              type="button"

              disabled={
                currentPage <=
                1
              }

              onClick={() =>
                setCurrentPage(
                  (page) =>
                    Math.max(
                      1,
                      page - 1
                    )
                )
              }

              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >

              <ChevronLeft
                size={16}
              />

            </button>

            <span className="px-3 text-xs font-medium text-slate-600">

              Page{" "}
              {currentPage}{" "}
              of{" "}
              {totalPages}

            </span>

            {/* NEXT */}

            <button
              type="button"

              disabled={
                currentPage >=
                totalPages
              }

              onClick={() =>
                setCurrentPage(
                  (page) =>
                    Math.min(
                      totalPages,
                      page + 1
                    )
                )
              }

              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >

              <ChevronRight
                size={16}
              />

            </button>

          </div>

        </div>

      </div>

      {/* ========================================================
          CONSOLIDATED RCD PREVIEW MODAL

          previewId contains:
          rcd_consolidated_transaction.id

          The modal will fetch:
          GET /api/remittance/consolidated/[id]
      ======================================================== */}

      <ConsolidatedRCDPreviewModal
        id={
          previewId
        }

        onClose={() =>
          setPreviewId(
            null
          )
        }
      />

    </>
  );
}