"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ChevronLeft,
  ChevronRight,
  Eye,
  FileCheck2,
  RefreshCw,
} from "lucide-react";

import Swal from "sweetalert2";

import ConsolidatedRCDPreviewModal from "./ConsolidatedRCDPreviewModal";


/* ============================================================
   TYPES
============================================================ */

type Remittance = {
  id: string;

  remittance_no: string;

  rcd_no: string;

  fund_source: string;

  fund_name: string;

  fund_source_id: string;

  amount: number;
};


type FundSource = {
  id: string;

  fundCode: string;

  fundName: string;

  acronym: string | null;
};


/* ============================================================
   COMPONENT
============================================================ */

export default function RemittanceTable() {

  /* ============================================================
     DATA
  ============================================================ */

  const [data, setData] =
    useState<Remittance[]>([]);

  const [fundSources, setFundSources] =
    useState<FundSource[]>([]);


  /* ============================================================
     FILTER
  ============================================================ */

  const [fundSource, setFundSource] =
    useState("ALL");


  /* ============================================================
     PAGINATION
  ============================================================ */

  const [page, setPage] =
    useState(1);

  const rowsPerPage = 10;


  /* ============================================================
     LOADING
  ============================================================ */

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [generating, setGenerating] =
    useState(false);

  const [error, setError] =
    useState("");


  /* ============================================================
     PREVIEW

     IMPORTANT:

     We only store the Consolidated RCD ID.

     The preview modal itself will call:

     GET /api/remittance/consolidated/[id]
  ============================================================ */

  const [previewId, setPreviewId] =
    useState<string | null>(null);


  /* ============================================================
     LOAD REMITTANCES
  ============================================================ */

  const loadRemittances =
    useCallback(async () => {

      try {

        setError("");

        const response =
          await fetch(
            "/api/remittance/transactions",
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
              "Failed to load remittance transactions."
          );

        }


        /* ======================================================
           MAP REMITTANCES
        ====================================================== */

        const mappedData: Remittance[] =
          (
            result.transactions ||
            []
          ).map(
            (item: any) => ({
              id:
                item.id,

              remittance_no:
                item.remittance_no ||
                "",

              rcd_no:
                item.rcd_no ||
                "",

              fund_source:
                item.fund_code ||
                "",

              fund_name:
                item.fund_name ||
                "",

              fund_source_id:
                item.fund_source_id ||
                "",

              amount:
                Number(
                  item.amount || 0
                ),
            })
          );


        setData(mappedData);


        /* ======================================================
           FUND SOURCES
        ====================================================== */

        const mappedFunds: FundSource[] =
          (
            result.fundSources ||
            []
          ).map(
            (fund: any) => ({
              id:
                fund.id,

              fundCode:
                fund.fundCode ||
                "",

              fundName:
                fund.fundName ||
                "",

              acronym:
                fund.acronym ||
                null,
            })
          );


        setFundSources(
          mappedFunds
        );

      } catch (error) {

        console.error(
          "Failed to load remittances:",
          error
        );


        setError(
          error instanceof Error
            ? error.message
            : "Failed to load remittance transactions."
        );


        setData([]);

        setFundSources([]);

      } finally {

        setLoading(false);

        setRefreshing(false);

      }

    }, []);


  /* ============================================================
     INITIAL LOAD
  ============================================================ */

  useEffect(() => {

    loadRemittances();

  }, [
    loadRemittances,
  ]);


  /* ============================================================
     FUND SOURCE FILTER
  ============================================================ */

  const filteredData =
    useMemo(() => {

      if (
        fundSource === "ALL"
      ) {

        return data;

      }


      return data.filter(
        (item) =>
          item.fund_source_id ===
          fundSource
      );

    }, [
      data,
      fundSource,
    ]);


  /* ============================================================
     TOTAL OF FILTERED REMITTANCES
  ============================================================ */

  const filteredTotal =
    useMemo(() => {

      return filteredData.reduce(
        (
          total,
          item
        ) =>
          total +
          Number(
            item.amount || 0
          ),
        0
      );

    }, [
      filteredData,
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


  const currentPage =
    Math.min(
      page,
      totalPages
    );


  const paginatedData =
    filteredData.slice(
      (currentPage - 1) *
        rowsPerPage,

      currentPage *
        rowsPerPage
    );


  /* ============================================================
     FUND SOURCE CHANGE
  ============================================================ */

  function handleFundSourceChange(
    value: string
  ) {

    setFundSource(value);

    setPage(1);

  }


  /* ============================================================
     REFRESH
  ============================================================ */

  async function handleRefresh() {

    setRefreshing(true);

    setFundSource("ALL");

    setPage(1);

    await loadRemittances();

  }


  /* ============================================================
     FORMAT AMOUNT
  ============================================================ */

  function formatAmount(
    amount: number
  ) {

    return `₱${Number(
      amount || 0
    ).toLocaleString(
      "en-PH",
      {
        minimumFractionDigits: 2,

        maximumFractionDigits: 2,
      }
    )}`;

  }


  /* ============================================================
     VIEW REMITTANCE

     NOTE:

     This table contains REMITTANCES.

     The preview API requires a
     CONSOLIDATED RCD ID.

     Therefore this View button is NOT
     used to open the Consolidated RCD preview.

     The Consolidated RCD preview should be
     opened from ConsolidatedRCDTable.

  ============================================================ */

  function handleView(
    row: Remittance
  ) {

    console.log(
      "View remittance:",
      row
    );

  }


  /* ============================================================
     GENERATE CONSOLIDATED RCD
  ============================================================ */

  async function handleGenerateConsolidated() {

    /* ==========================================================
       NO RECORDS
    ========================================================== */

    if (
      filteredData.length === 0
    ) {

      await Swal.fire({

        title:
          "No Remittances",

        text:
          "There are no remittance transactions available for consolidation.",

        icon:
          "info",

        confirmButtonColor:
          "#2563eb",

      });

      return;

    }


    /* ==========================================================
       DETERMINE FUND DISPLAY
    ========================================================== */

    let fundLabel =
      "All Fund Sources";


    if (
      fundSource !== "ALL"
    ) {

      const selectedFund =
        fundSources.find(
          (fund) =>
            fund.id ===
            fundSource
        );


      if (selectedFund) {

        fundLabel =
          `${selectedFund.fundCode} - ${selectedFund.fundName}`;

      }

    }


    /* ==========================================================
       CONFIRMATION
    ========================================================== */

    const confirmation =
      await Swal.fire({

        title:
          "Generate Consolidated RCD?",

        html: `
          <div style="text-align:left; line-height:1.7">

            <div>
              <strong>Fund Source:</strong>
              ${fundLabel}
            </div>

            <div>
              <strong>Remittances:</strong>
              ${filteredData.length}
            </div>

            <div>
              <strong>Total Amount:</strong>
              ${formatAmount(
                filteredTotal
              )}
            </div>

            <div style="margin-top:12px">
              All remittances currently displayed
              will be included in one
              Consolidated RCD.
            </div>

          </div>
        `,

        icon:
          "question",

        showCancelButton:
          true,

        confirmButtonText:
          "Yes, Generate",

        cancelButtonText:
          "Cancel",

        confirmButtonColor:
          "#2563eb",

        cancelButtonColor:
          "#64748b",

        reverseButtons:
          true,

      });


    if (
      !confirmation.isConfirmed
    ) {

      return;

    }


    /* ==========================================================
       GENERATE
    ========================================================== */

    try {

      setGenerating(true);


      /* ========================================================
         GET ALL FILTERED REMITTANCE IDS
      ======================================================== */

      const remittanceIds =
        filteredData.map(
          (item) =>
            item.id
        );


      /* ========================================================
         POST
      ======================================================== */

      const response =
        await fetch(
          "/api/remittance/consolidated",
          {
            method:
              "POST",

            credentials:
              "include",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({

                remittance_ids:
                  remittanceIds,

                fund_source_id:
                  fundSource ===
                  "ALL"
                    ? null
                    : fundSource,

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
            "Failed to generate consolidated RCD."
        );

      }


      /* ========================================================
         SUCCESS MESSAGE
      ======================================================== */

      await Swal.fire({

        title:
          "Consolidated RCD Generated",

        html: `
          <div style="line-height:1.7">

            <div>
              <strong>Consolidated RCD No:</strong>
              ${
                result.consolidated
                  ?.consolidatedNo ||
                ""
              }
            </div>

            <div>
              <strong>Remittances:</strong>
              ${remittanceIds.length}
            </div>

            <div>
              <strong>Total Amount:</strong>
              ${formatAmount(
                result.consolidated
                  ?.totalAmount ??
                  filteredTotal
              )}
            </div>

          </div>
        `,

        icon:
          "success",

        confirmButtonColor:
          "#2563eb",

      });


      /* ========================================================
         OPEN PREVIEW

         IMPORTANT:

         We only save the ID.

         The modal will then call:

         GET /api/remittance/consolidated/[id]
      ======================================================== */

      const consolidatedId =
        result.consolidated?.id;


      if (
        consolidatedId
      ) {

        setPreviewId(
          consolidatedId
        );

      }


      /* ========================================================
         RELOAD TABLE
      ======================================================== */

      await loadRemittances();

    } catch (error) {

      console.error(
        "Generate consolidated RCD error:",
        error
      );


      await Swal.fire({

        title:
          "Generation Failed",

        text:
          error instanceof Error
            ? error.message
            : "Failed to generate consolidated RCD.",

        icon:
          "error",

        confirmButtonColor:
          "#dc2626",

      });

    } finally {

      setGenerating(false);

    }

  }


  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <>

      <div className="flex h-full flex-col bg-white">

        {/* ======================================================
            TOOLBAR
        ====================================================== */}

        <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white p-4">

          {/* ====================================================
              FUND SOURCE FILTER
          ==================================================== */}

          <select
            value={
              fundSource
            }

            onChange={(e) =>
              handleFundSourceChange(
                e.target.value
              )
            }

            disabled={
              loading ||
              generating
            }

            className="h-10 min-w-[240px] rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
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


          {/* ====================================================
              RIGHT BUTTONS
          ==================================================== */}

          <div className="flex items-center gap-2">

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
                refreshing ||
                generating
              }

              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >

              <RefreshCw
                size={15}

                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              {refreshing
                ? "Refreshing..."
                : "Refresh"}

            </button>


            {/* ==================================================
                GENERATE
            ================================================== */}

            <button
              type="button"

              onClick={
                handleGenerateConsolidated
              }

              disabled={
                loading ||
                refreshing ||
                generating ||
                filteredData.length ===
                  0
              }

              className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >

              {generating ? (

                <RefreshCw
                  size={15}
                  className="animate-spin"
                />

              ) : (

                <FileCheck2
                  size={15}
                />

              )}


              {generating
                ? "Generating..."
                : "Generate Consolidated RCD"}

            </button>

          </div>

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
            FILTER SUMMARY
        ====================================================== */}

        {!loading &&
          !error && (

            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-2">

              <div className="text-xs text-slate-500">

                {fundSource ===
                "ALL"
                  ? "All Fund Sources"
                  : (() => {

                      const fund =
                        fundSources.find(
                          (item) =>
                            item.id ===
                            fundSource
                        );

                      return fund
                        ? `${fund.fundCode} - ${fund.fundName}`
                        : "Selected Fund Source";

                    })()}

              </div>


              <div className="text-xs text-slate-500">

                <span className="font-semibold text-slate-700">

                  {
                    filteredData.length
                  }

                </span>{" "}

                remittance
                {filteredData.length !==
                1
                  ? "s"
                  : ""}

                {" • "}

                <span className="font-semibold text-slate-700">

                  {formatAmount(
                    filteredTotal
                  )}

                </span>

              </div>

            </div>

          )}


        {/* ======================================================
            TABLE
        ====================================================== */}

        <div className="min-h-0 flex-1 overflow-auto">

          <table className="w-full min-w-[750px] text-sm">

            <thead className="sticky top-0 z-10 bg-slate-50">

              <tr className="border-b border-slate-200 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">

                <th className="px-5 py-3">
                  Collector RCD Number
                </th>

                <th className="px-5 py-3">
                  Remittance Number
                </th>

                <th className="px-5 py-3">
                  Fund Source Code
                </th>

                <th className="px-5 py-3 text-right">
                  Amount
                </th>

                <th className="px-5 py-3 text-center">
                  Action
                </th>

              </tr>

            </thead>


            <tbody className="divide-y divide-slate-100">

              {/* ==================================================
                  LOADING
              ================================================== */}

              {loading ? (

                <tr>

                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center text-sm text-slate-400"
                  >

                    <div className="flex items-center justify-center gap-2">

                      <RefreshCw
                        size={16}
                        className="animate-spin"
                      />

                      Loading remittance
                      records...

                    </div>

                  </td>

                </tr>

              ) : paginatedData.length ===
                0 ? (

                /* ==================================================
                   EMPTY
                ================================================== */

                <tr>

                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center text-sm text-slate-400"
                  >

                    No remittance records found.

                  </td>

                </tr>

              ) : (

                /* ==================================================
                   DATA
                ================================================== */

                paginatedData.map(
                  (row) => (

                    <tr
                      key={
                        row.id
                      }

                      className="transition hover:bg-slate-50"
                    >

                      {/* ==================================================
                          RCD NUMBER
                      ================================================== */}

                      <td className="px-5 py-4">

                        <span className="font-semibold text-blue-600">

                          {
                            row.rcd_no
                          }

                        </span>

                      </td>


                      {/* ==================================================
                          REMITTANCE NUMBER
                      ================================================== */}

                      <td className="px-5 py-4">

                        <span className="font-semibold text-slate-800">

                          {
                            row.remittance_no
                          }

                        </span>

                      </td>


                      {/* ==================================================
                          FUND SOURCE
                      ================================================== */}

                      <td className="px-5 py-4">

                        <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">

                          {
                            row.fund_source
                          }

                        </span>

                      </td>


                      {/* ==================================================
                          AMOUNT
                      ================================================== */}

                      <td className="px-5 py-4 text-right">

                        <span className="font-bold text-slate-800">

                          {formatAmount(
                            row.amount
                          )}

                        </span>

                      </td>


                      {/* ==================================================
                          ACTION
                      ================================================== */}

                      <td className="px-5 py-4 text-center">

                        <button
                          type="button"

                          onClick={() =>
                            handleView(
                              row
                            )
                          }

                          disabled={
                            generating
                          }

                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:border-blue-200 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >

                          <Eye
                            size={14}
                          />

                          View

                        </button>

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>


        {/* ======================================================
            PAGINATION
        ====================================================== */}

        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-5 py-3">

          {/* ====================================================
              RECORD COUNT
          ==================================================== */}

          <div className="text-xs text-slate-500">

            Showing{" "}

            <span className="font-semibold text-slate-700">

              {filteredData.length ===
              0
                ? 0
                : (currentPage -
                    1) *
                    rowsPerPage +
                  1}

            </span>

            {" "}to{" "}

            <span className="font-semibold text-slate-700">

              {Math.min(
                currentPage *
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

            {" "}records

          </div>


          {/* ====================================================
              PAGINATION
          ==================================================== */}

          <div className="flex items-center gap-1">

            <button
              type="button"

              disabled={
                currentPage ===
                1
              }

              onClick={() =>
                setPage(
                  (value) =>
                    Math.max(
                      1,
                      value - 1
                    )
                )
              }

              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >

              <ChevronLeft
                size={16}
              />

            </button>


            <div className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-blue-600 px-2 text-xs font-semibold text-white">

              {
                currentPage
              }

            </div>


            <button
              type="button"

              disabled={
                currentPage ===
                totalPages
              }

              onClick={() =>
                setPage(
                  (value) =>
                    Math.min(
                      totalPages,
                      value + 1
                    )
                )
              }

              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >

              <ChevronRight
                size={16}
              />

            </button>

          </div>

        </div>

      </div>


      {/* ========================================================
          CONSOLIDATED RCD PREVIEW

          IMPORTANT:

          The modal receives ONLY the ID.

          It will call:

          GET /api/remittance/consolidated/[id]
      ======================================================== */}

      <ConsolidatedRCDPreviewModal
        id={
          previewId
        }

        onClose={() =>
          setPreviewId(null)
        }
      />

    </>
  );
}