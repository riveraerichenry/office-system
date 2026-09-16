"use client";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ChevronLeft,
  ChevronRight,
  FileText,
  RefreshCw,
} from "lucide-react";

import CollectorRCDModal, {
  CollectorRCD,
} from "./CollectorRCDModal";

/* ============================================================
   FUND SOURCE
============================================================ */

type FundSource = {
  id: string;
  fundCode: string;
  fundName: string;
  acronym: string | null;
};

/* ============================================================
   CURRENCY FORMAT
============================================================ */

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

/* ============================================================
   COMPONENT
============================================================ */

export default function CollectorRCDTable() {
  /* ==========================================================
     DATA
  ========================================================== */

  const [data, setData] =
    useState<CollectorRCD[]>([]);

  /* ==========================================================
     FUND SOURCES
  ========================================================== */

  const [fundSources, setFundSources] =
    useState<FundSource[]>([]);

  const [fundSource, setFundSource] =
    useState("ALL");

  /* ==========================================================
     PAGINATION
  ========================================================== */

  const [currentPage, setCurrentPage] =
    useState(1);

  /* ==========================================================
     SELECTED RCD
  ========================================================== */

  const [selectedRCD, setSelectedRCD] =
    useState<CollectorRCD | null>(null);

  /* ==========================================================
     APPROVED IDS
  ========================================================== */

  const [approvedIds, setApprovedIds] =
    useState<string[]>([]);

  /* ==========================================================
     LOADING
  ========================================================== */

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  /* ==========================================================
     ERROR
  ========================================================== */

  const [error, setError] =
    useState("");

  const rowsPerPage = 10;

  /* ============================================================
     LOAD COLLECTOR RCDs
  ============================================================ */

  const loadRCDs = async (
    showRefresh = false
  ) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch(
        "/api/remittance/collector-rcds",
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
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
            "Failed to load Collector RCDs"
        );
      }

      /* ========================================================
         KEEP FRONTEND NAMES

         reportDate   ← report_date
         coverageFrom ← date_from
         coverageTo   ← date_to
      ======================================================== */

      const transactions: CollectorRCD[] = (
        result.transactions || []
      ).map((item: any) => ({
        id: item.id,

        rcdReportNo:
          item.rcdNumber,

        reportDate:
          item.reportDate,

        collector:
          item.collector ||
          "Unknown Collector",

        fundSource:
          item.fundCode || "",

        coverageFrom:
          item.coverageFrom,

        coverageTo:
          item.coverageTo,

        totalCollections:
          Number(item.amount || 0),

        status:
          item.status || "",
      }));

      setData(transactions);

      setFundSources(
        result.fundSources || []
      );

      setApprovedIds([]);

      setCurrentPage(1);

    } catch (err) {
      console.error(
        "Failed to load Collector RCDs:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load Collector RCDs"
      );

      setData([]);

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* ============================================================
     INITIAL LOAD
  ============================================================ */

  useEffect(() => {
    loadRCDs();
  }, []);

  /* ============================================================
     FUND SOURCE FILTER
  ============================================================ */

  const filteredData =
    useMemo(() => {
      if (fundSource === "ALL") {
        return data;
      }

      return data.filter(
        (item) =>
          item.fundSource ===
          fundSource
      );
    }, [
      data,
      fundSource,
    ]);

  /* ============================================================
     PAGINATION
  ============================================================ */

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredData.length /
          rowsPerPage
      )
    );

  const safeCurrentPage =
    Math.min(
      currentPage,
      totalPages
    );

  const paginatedData =
    filteredData.slice(
      (safeCurrentPage - 1) *
        rowsPerPage,

      safeCurrentPage *
        rowsPerPage
    );

  /* ============================================================
     VIEW RCD
  ============================================================ */

  const handleView = (
    rcd: CollectorRCD
  ) => {
    setSelectedRCD(rcd);
  };

  /* ============================================================
     APPROVE / POST REMITTANCE
  ============================================================ */

  const handleApprove = async (
    id: string,
    remittanceNumber: string
  ) => {
    if (!remittanceNumber.trim()) {
      return;
    }

    const rcd = data.find(
      (item) => item.id === id
    );

    if (!rcd) {
      return;
    }

    /* ========================================================
       CHECK RCD STATUS
    ======================================================== */

    if (
      rcd.status !==
      "FOR REMITTANCE"
    ) {
      window.alert(
        `This RCD cannot be remitted because its status is "${rcd.status}".`
      );

      return;
    }

    /* ========================================================
       CONFIRM
    ======================================================== */

    const confirmed =
      window.confirm(
        `Approve remittance for ${rcd.rcdReportNo}?\n\n` +
        `Remittance Number: ${remittanceNumber.trim()}\n` +
        `Amount: ${formatCurrency(
          rcd.totalCollections
        )}`
      );

    if (!confirmed) {
      return;
    }

    try {
      /* ======================================================
         POST REMITTANCE
      ====================================================== */

      const response = await fetch(
        "/api/remittance",
        {
          method: "POST",
          credentials: "include",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            rcd_transaction_id:
              id,

            remittance_no:
              remittanceNumber.trim(),
          }),
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
            "Failed to create remittance."
        );
      }

      /* ======================================================
         MARK APPROVED LOCALLY
      ====================================================== */

      setApprovedIds(
        (prev) =>
          prev.includes(id)
            ? prev
            : [
                ...prev,
                id,
              ]
      );

      /* ======================================================
         CLOSE MODAL
      ====================================================== */

      setSelectedRCD(null);

      /* ======================================================
         RELOAD RCD LIST

         The API changes the RCD status to REMITTED,
         so it will no longer appear in the Collector RCD
         list.
      ====================================================== */

      await loadRCDs();

      /* ======================================================
         SUCCESS MESSAGE
      ====================================================== */

      window.alert(
        `Remittance ${remittanceNumber.trim()} successfully created.`
      );

    } catch (error) {
      console.error(
        "Failed to create remittance:",
        error
      );

      window.alert(
        error instanceof Error
          ? error.message
          : "Failed to create remittance."
      );
    }
  };

  /* ============================================================
     REFRESH
  ============================================================ */

  const handleRefresh = () => {
    setFundSource("ALL");

    setCurrentPage(1);

    loadRCDs(true);
  };

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div className="w-full">

      {/* ======================================================
          FILTERS
      ====================================================== */}

      <div className="border-b border-slate-200 bg-slate-50/60 px-5 py-4">

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">

          {/* ==================================================
              FUND SOURCE
          ================================================== */}

          <select
            value={fundSource}
            onChange={(e) => {
              setFundSource(
                e.target.value
              );

              setCurrentPage(1);
            }}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="ALL">
              All Fund Sources
            </option>

            {fundSources.map(
              (fund) => (
                <option
                  key={fund.id}
                  value={
                    fund.fundCode
                  }
                >
                  {fund.fundCode} -{" "}
                  {fund.fundName}
                </option>
              )
            )}
          </select>

          {/* ==================================================
              REFRESH
          ================================================== */}

          <button
            type="button"
            onClick={
              handleRefresh
            }
            disabled={
              loading ||
              refreshing
            }
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>

        </div>

      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="border-b border-red-100 bg-red-50 px-5 py-3 text-xs font-medium text-red-600">
          {error}
        </div>
      )}

      {/* ======================================================
          TABLE
      ====================================================== */}

      <div className="overflow-x-auto">

        <table className="w-full min-w-0 table-fixed border-collapse">

          {/* ==================================================
              HEADER
          ================================================== */}

          <thead>

            <tr className="border-b border-slate-200 bg-slate-50">

              <th className="w-[30%] px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                Collector
              </th>

              <th className="w-[25%] px-2 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                RCD Number
              </th>

              <th className="w-[15%] px-2 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                Fund
              </th>

              <th className="w-[30%] px-3 py-2.5 text-right text-[11px] font-bold uppercase tracking-wide text-slate-500">
                Amount
              </th>

            </tr>

          </thead>

          {/* ==================================================
              BODY
          ================================================== */}

          <tbody>

            {/* ==================================================
                LOADING
            ================================================== */}

            {loading ? (

              <tr>

                <td
                  colSpan={4}
                  className="px-3 py-10 text-center"
                >

                  <div className="flex flex-col items-center justify-center">

                    <RefreshCw
                      size={20}
                      className="mb-2 animate-spin text-blue-500"
                    />

                    <p className="text-xs font-semibold text-slate-700">
                      Loading Collector RCDs...
                    </p>

                  </div>

                </td>

              </tr>

            ) : paginatedData.length === 0 ? (

              /* ==================================================
                 EMPTY
              ================================================== */

              <tr>

                <td
                  colSpan={4}
                  className="px-3 py-10 text-center"
                >

                  <div className="flex flex-col items-center justify-center">

                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">

                      <FileText
                        size={19}
                      />

                    </div>

                    <p className="text-xs font-semibold text-slate-700">
                      No Collector RCDs found
                    </p>

                    <p className="mt-1 text-[11px] text-slate-400">
                      Try changing your
                      fund source filter.
                    </p>

                  </div>

                </td>

              </tr>

            ) : (

              /* ==================================================
                 DATA
              ================================================== */

              paginatedData.map(
                (item) => {

                  const isApproved =
                    approvedIds.includes(
                      item.id
                    );

                  return (

                    <tr
                      key={item.id}
                      onClick={() =>
                        handleView(item)
                      }
                      className={`cursor-pointer border-b border-slate-100 transition ${
                        isApproved
                          ? "bg-green-50/40"
                          : "hover:bg-blue-50/60"
                      }`}
                      title="Click to view RCD details"
                    >

                      {/* ========================================
                          COLLECTOR
                      ======================================== */}

                      <td className="px-3 py-3">

                        <div
                          className="truncate text-xs font-semibold text-slate-700"
                          title={
                            item.collector
                          }
                        >
                          {
                            item.collector
                          }
                        </div>

                      </td>

                      {/* ========================================
                          RCD NUMBER
                      ======================================== */}

                      <td className="px-2 py-3">

                        <span className="truncate text-xs font-semibold text-blue-700">
                          {
                            item.rcdReportNo
                          }
                        </span>

                      </td>

                      {/* ========================================
                          FUND
                      ======================================== */}

                      <td className="px-2 py-3">

                        <span className="inline-flex rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-700">
                          {
                            item.fundSource
                          }
                        </span>

                      </td>

                      {/* ========================================
                          AMOUNT
                      ======================================== */}

                      <td className="px-3 py-3 text-right">

                        <span className="text-xs font-bold text-slate-800">
                          {formatCurrency(
                            item.totalCollections
                          )}
                        </span>

                      </td>

                    </tr>

                  );
                }
              )

            )}

          </tbody>

        </table>

      </div>

      {/* ======================================================
          FOOTER / PAGINATION
      ====================================================== */}

      <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

        {/* ====================================================
            RECORD COUNT
        ==================================================== */}

        <div className="text-sm text-slate-500">

          Showing{" "}

          <span className="font-semibold text-slate-700">
            {filteredData.length === 0
              ? 0
              : (safeCurrentPage -
                  1) *
                  rowsPerPage +
                1}
          </span>

          {" "}to{" "}

          <span className="font-semibold text-slate-700">
            {Math.min(
              safeCurrentPage *
                rowsPerPage,
              filteredData.length
            )}
          </span>

          {" "}of{" "}

          <span className="font-semibold text-slate-700">
            {
              filteredData.length
            }
          </span>

          {" "}Records

        </div>

        {/* ====================================================
            PAGINATION
        ==================================================== */}

        <div className="flex items-center gap-2">

          {/* ==================================================
              PREVIOUS
          ================================================== */}

          <button
            type="button"
            disabled={
              safeCurrentPage <= 1
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
            className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft
              size={17}
            />

            <span className="hidden sm:inline">
              Previous
            </span>

          </button>

          {/* ==================================================
              CURRENT PAGE
          ================================================== */}

          <div className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-blue-600 px-3 text-sm font-bold text-white">
            {
              safeCurrentPage
            }
          </div>

          {/* ==================================================
              NEXT
          ================================================== */}

          <button
            type="button"
            disabled={
              safeCurrentPage >=
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
            className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >

            <span className="hidden sm:inline">
              Next
            </span>

            <ChevronRight
              size={17}
            />

          </button>

        </div>

      </div>

      {/* ======================================================
          COLLECTOR RCD MODAL
      ====================================================== */}

      <CollectorRCDModal
        rcd={selectedRCD}
        onClose={() =>
          setSelectedRCD(null)
        }
        onApprove={
          handleApprove
        }
        isApproved={
          selectedRCD
            ? approvedIds.includes(
                selectedRCD.id
              )
            : false
        }
      />

    </div>
  );
}