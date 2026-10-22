
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

type Remittance = {
  id: string;
  remittance_no: string;
  rcd_no: string;
  collector: string;
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

function formatAmount(amount: number) {
  return `₱${Number(amount || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function escapeHtml(value: string | null | undefined): string {
  const entities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };

  return String(value ?? "").replace(
    /[&<>"']/g,
    (character) => entities[character]
  );
}

export default function RemittanceTable() {
  const [data, setData] = useState<Remittance[]>([]);
  const [fundSources, setFundSources] = useState<FundSource[]>([]);
  const [fundSource, setFundSource] = useState("ALL");

  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [previewId, setPreviewId] = useState<string | null>(null);

  /* ============================================================
     LOAD REMITTANCES
  ============================================================ */

  const loadRemittances = useCallback(async () => {
    try {
      setError("");

      const response = await fetch(
        "/api/remittance/transactions",
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Failed to load remittance transactions."
        );
      }

      const mappedData: Remittance[] = (
        result.transactions || []
      ).map((item: any) => ({
        id: String(item.id),
        remittance_no: item.remittance_no || "",
        rcd_no: item.rcd_no || "",
        collector:
          item.collector ||
          item.collector_name ||
          item.collectorName ||
          "Unknown Collector",
        fund_source: item.fund_code || "",
        fund_name: item.fund_name || "",
        fund_source_id: item.fund_source_id
          ? String(item.fund_source_id)
          : "",
        amount: Number(item.amount || 0),
      }));

      const mappedFunds: FundSource[] = (
        result.fundSources || []
      ).map((fund: any) => ({
        id: String(fund.id),
        fundCode: fund.fundCode || "",
        fundName: fund.fundName || "",
        acronym: fund.acronym || null,
      }));

      setData(mappedData);
      setFundSources(mappedFunds);

      const eligibleIds = new Set(
        mappedData.map((item) => item.id)
      );

      setSelectedIds((previous) =>
        previous.filter((id) => eligibleIds.has(id))
      );
    } catch (err) {
      console.error("Failed to load remittances:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load remittance transactions."
      );

      setData([]);
      setFundSources([]);
      setSelectedIds([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadRemittances();
  }, [loadRemittances]);

  /* ============================================================
     FILTER
  ============================================================ */

  const filteredData = useMemo(() => {
    if (fundSource === "ALL") {
      return data;
    }

    return data.filter(
      (item) => item.fund_source_id === fundSource
    );
  }, [data, fundSource]);

  /* ============================================================
     SELECTED REMITTANCES
  ============================================================ */

  const selectedRows = useMemo(() => {
    const selectedSet = new Set(selectedIds);

    return filteredData.filter((item) =>
      selectedSet.has(item.id)
    );
  }, [filteredData, selectedIds]);

  const selectedTotal = useMemo(
    () =>
      selectedRows.reduce(
        (total, item) => total + Number(item.amount || 0),
        0
      ),
    [selectedRows]
  );

  const allFilteredSelected =
    filteredData.length > 0 &&
    filteredData.every((item) => selectedIds.includes(item.id));

  /* ============================================================
     PAGINATION
  ============================================================ */

  const totalPages = Math.max(
    1,
    Math.ceil(filteredData.length / rowsPerPage)
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  /* ============================================================
     SELECT / DESELECT ONE
  ============================================================ */

  function handleSelectOne(id: string, checked: boolean) {
    const selectedRow = filteredData.find(
      (item) => item.id === id
    );

    if (!selectedRow) return;

    setSelectedIds((previous) => {
      if (!checked) {
        return previous.filter(
          (selectedId) => selectedId !== id
        );
      }

      const selectedFundSourceIds = new Set(
        data
          .filter((item) => previous.includes(item.id))
          .map((item) => item.fund_source_id)
      );

      if (
        selectedFundSourceIds.size > 0 &&
        (
          selectedFundSourceIds.size > 1 ||
          !selectedFundSourceIds.has(
            selectedRow.fund_source_id
          )
        )
      ) {
        return [id];
      }

      return previous.includes(id)
        ? previous
        : [...previous, id];
    });
  }

  /* ============================================================
     SELECT / DESELECT ALL FILTERED REMITTANCES
  ============================================================ */

  function handleSelectAll(checked: boolean) {
    const filteredIds = filteredData.map((item) => item.id);
    const filteredIdSet = new Set(filteredIds);

    setSelectedIds((previous) => {
      if (checked) {
        const existingRows = data.filter((item) =>
          previous.includes(item.id)
        );

        const existingFundIds = new Set(
          existingRows.map((item) => item.fund_source_id)
        );

        const newFundIds = new Set(
          filteredData.map((item) => item.fund_source_id)
        );

        const combinedFundIds = new Set([
          ...existingFundIds,
          ...newFundIds,
        ]);

        if (combinedFundIds.size > 1) {
          return filteredIds;
        }

        return Array.from(
          new Set([...previous, ...filteredIds])
        );
      }

      return previous.filter(
        (id) => !filteredIdSet.has(id)
      );
    });
  }

  /* ============================================================
     FUND SOURCE FILTER
  ============================================================ */

  function handleFundSourceChange(value: string) {
    setFundSource(value);
    setPage(1);
    setSelectedIds([]);
  }

  /* ============================================================
     REFRESH
  ============================================================ */

  async function handleRefresh() {
    if (loading || refreshing || generating) {
      return;
    }

    setRefreshing(true);
    setFundSource("ALL");
    setPage(1);
    setSelectedIds([]);

    await loadRemittances();
  }

  /* ============================================================
     VIEW REMITTANCE
  ============================================================ */

  function handleView(row: Remittance) {
    console.log("View remittance:", row);
  }

  /* ============================================================
     GENERATE CONSOLIDATED RCD
  ============================================================ */

  async function handleGenerateConsolidated() {
    if (selectedRows.length === 0) {
      await Swal.fire({
        title: "No Remittances Selected",
        text: "Please select at least one remittance to include in the Consolidated RCD.",
        icon: "warning",
        confirmButtonColor: "#2563eb",
      });

      return;
    }

    const rowsToConsolidate = [...selectedRows];

    const selectedFundSourceIds = [
      ...new Set(
        rowsToConsolidate.map(
          (item) => item.fund_source_id
        )
      ),
    ];

    if (
      selectedFundSourceIds.length !== 1 ||
      !selectedFundSourceIds[0]
    ) {
      await Swal.fire({
        title: "Different Fund Sources",
        text: "You cannot consolidate remittances from different fund sources. Please select remittances belonging to one fund source only.",
        icon: "warning",
        confirmButtonText: "OK",
        confirmButtonColor: "#2563eb",
      });

      return;
    }

    const actualFundSourceId = selectedFundSourceIds[0];

    const selectedFund = fundSources.find(
      (fund) => fund.id === actualFundSourceId
    );

    const fundLabel = selectedFund
      ? `${selectedFund.fundCode} - ${selectedFund.fundName}`
      : rowsToConsolidate[0].fund_source ||
        rowsToConsolidate[0].fund_name ||
        "Selected Fund Source";

    const remittanceIds = rowsToConsolidate.map(
      (item) => item.id
    );

    const amountToConsolidate = rowsToConsolidate.reduce(
      (total, item) => total + Number(item.amount || 0),
      0
    );

    /* ==========================================================
       CONFIRMATION WITH MANUAL CONSOLIDATED RCD NUMBER
    ========================================================== */

    const confirmation = await Swal.fire({
      title: "Generate Consolidated RCD?",
      width: 850,
      html: `
        <div style="text-align:left;line-height:1.7;font-size:13px">

          <label for="consolidated-rcd-no"
            style="display:block;font-weight:700;margin-bottom:6px">
            Consolidated RCD Number
            <span style="color:#dc2626">*</span>
          </label>

          <input
            id="consolidated-rcd-no"
            type="text"
            maxlength="100"
            autocomplete="off"
            placeholder="Enter Consolidated RCD Number"
            style="width:100%;box-sizing:border-box;padding:11px 12px;
              border:1px solid #cbd5e1;border-radius:8px;
              font-size:14px;margin-bottom:16px"
          />

          <div style="margin-bottom:8px">
            <strong>Fund Source:</strong>
            ${escapeHtml(fundLabel)}
          </div>

          <div style="margin-bottom:8px">
            <strong>Selected Remittances:</strong>
            ${remittanceIds.length}
          </div>

          <div style="margin-bottom:14px">
            <strong>Total Amount:</strong>
            <span style="font-weight:700;color:#1d4ed8">
              ${formatAmount(amountToConsolidate)}
            </span>
          </div>

          <div style="margin-bottom:8px;font-weight:700;font-size:14px">
            Remittance Details
          </div>

          <div style="max-height:300px;overflow:auto;
            border:1px solid #e2e8f0;border-radius:8px">

            <table style="width:100%;border-collapse:collapse;font-size:12px">
              <thead>
                <tr style="background:#f1f5f9;position:sticky;top:0">
                  <th style="padding:10px;text-align:left;
                    border-bottom:1px solid #e2e8f0">
                    Collector
                  </th>

                  <th style="padding:10px;text-align:left;
                    border-bottom:1px solid #e2e8f0">
                    Remittance No.
                  </th>

                  <th style="padding:10px;text-align:left;
                    border-bottom:1px solid #e2e8f0">
                    RCD No.
                  </th>

                  <th style="padding:10px;text-align:right;
                    border-bottom:1px solid #e2e8f0">
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody>
                ${rowsToConsolidate
                  .map(
                    (item) => `
                      <tr>
                        <td style="padding:10px;text-align:left;
                          border-bottom:1px solid #e2e8f0">
                          ${escapeHtml(item.collector)}
                        </td>

                        <td style="padding:10px;text-align:left;
                          border-bottom:1px solid #e2e8f0;font-weight:600">
                          ${escapeHtml(item.remittance_no || "—")}
                        </td>

                        <td style="padding:10px;text-align:left;
                          border-bottom:1px solid #e2e8f0">
                          ${escapeHtml(item.rcd_no || "—")}
                        </td>

                        <td style="padding:10px;text-align:right;
                          border-bottom:1px solid #e2e8f0;
                          white-space:nowrap;font-weight:600">
                          ${formatAmount(item.amount)}
                        </td>
                      </tr>
                    `
                  )
                  .join("")}
              </tbody>

              <tfoot>
                <tr style="background:#f8fafc">
                  <td colspan="3"
                    style="padding:10px;text-align:right;font-weight:700">
                    Total
                  </td>

                  <td style="padding:10px;text-align:right;font-weight:700;
                    white-space:nowrap">
                    ${formatAmount(amountToConsolidate)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <p style="margin-top:12px;color:#64748b;font-size:12px">
            Please verify the number, collectors, remittance numbers,
            and amounts before continuing.
          </p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Generate",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#64748b",
      reverseButtons: true,
      focusConfirm: false,

      didOpen: () => {
        const input = document.getElementById(
          "consolidated-rcd-no"
        ) as HTMLInputElement | null;

        input?.focus();
      },

      preConfirm: () => {
        const input = document.getElementById(
          "consolidated-rcd-no"
        ) as HTMLInputElement | null;

        const consolidatedRcdNo = input?.value.trim() || "";

        if (!consolidatedRcdNo) {
          Swal.showValidationMessage(
            "Please enter the Consolidated RCD Number."
          );

          return false;
        }

        if (consolidatedRcdNo.length > 100) {
          Swal.showValidationMessage(
            "The Consolidated RCD Number must not exceed 100 characters."
          );

          return false;
        }

        return consolidatedRcdNo;
      },
    });

    if (!confirmation.isConfirmed || !confirmation.value) {
      return;
    }

    const consolidatedRcdNo = String(
      confirmation.value
    ).trim();

    try {
      setGenerating(true);
      setError("");

      const response = await fetch(
        "/api/remittance/consolidate-rcd",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            remittance_ids: remittanceIds,
            fund_source_id: actualFundSourceId,
            consolidated_rcd_no: consolidatedRcdNo,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error ||
            "Failed to generate Consolidated RCD."
        );
      }

      await Swal.fire({
        title: "Consolidated RCD Generated",
        html: `
          <div style="line-height:1.8;text-align:left">
            <div>
              <strong>Consolidated RCD No:</strong>
              ${escapeHtml(
                result.consolidated?.consolidatedNo ||
                  consolidatedRcdNo
              )}
            </div>

            <div>
              <strong>Fund Source:</strong>
              ${escapeHtml(fundLabel)}
            </div>

            <div>
              <strong>Remittances:</strong>
              ${remittanceIds.length}
            </div>

            <div>
              <strong>Total Amount:</strong>
              ${formatAmount(
                Number(
                  result.consolidated?.totalAmount ??
                    amountToConsolidate
                )
              )}
            </div>
          </div>
        `,
        icon: "success",
        confirmButtonColor: "#2563eb",
      });

      const consolidatedId = result.consolidated?.id;

      if (consolidatedId) {
        setPreviewId(String(consolidatedId));
      }

      setSelectedIds([]);

      await loadRemittances();
    } catch (err) {
      console.error(
        "Generate consolidated RCD error:",
        err
      );

      await Swal.fire({
        title: "Generation Failed",
        text:
          err instanceof Error
            ? err.message
            : "Failed to generate Consolidated RCD.",
        icon: "error",
        confirmButtonColor: "#dc2626",
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
      <div className="flex h-full min-h-0 flex-col bg-white">
        {/* TOOLBAR */}

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white p-4">
          <select
            value={fundSource}
            onChange={(event) =>
              handleFundSourceChange(event.target.value)
            }
            disabled={loading || generating}
            className="h-10 min-w-[240px] rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="ALL">All Fund Sources</option>

            {fundSources.map((fund) => (
              <option key={fund.id} value={fund.id}>
                {fund.fundCode} - {fund.fundName}
              </option>
            ))}
          </select>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading || refreshing || generating}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={refreshing ? "animate-spin" : ""}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

            <button
              type="button"
              onClick={handleGenerateConsolidated}
              disabled={
                loading ||
                refreshing ||
                generating ||
                selectedRows.length === 0
              }
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {generating ? (
                <RefreshCw
                  size={15}
                  className="animate-spin"
                />
              ) : (
                <FileCheck2 size={15} />
              )}

              {generating
                ? "Generating..."
                : `Consolidate Selected (${selectedRows.length})`}
            </button>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="border-b border-red-200 bg-red-50 px-5 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* SUMMARY */}

        {!loading && !error && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-5 py-3">
            <div className="text-xs text-slate-500">
              {fundSource === "ALL"
                ? "All Fund Sources"
                : (() => {
                    const fund = fundSources.find(
                      (item) => item.id === fundSource
                    );

                    return fund
                      ? `${fund.fundCode} - ${fund.fundName}`
                      : "Selected Fund Source";
                  })()}

              {" · "}

              <span className="font-semibold text-slate-700">
                {filteredData.length}
              </span>{" "}
              eligible remittance
              {filteredData.length !== 1 ? "s" : ""}
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
              <div className="text-slate-500">
                Selected:{" "}
                <span className="font-bold text-blue-700">
                  {selectedRows.length}
                </span>
              </div>

              <div className="text-slate-500">
                Selected Total:{" "}
                <span className="font-bold text-slate-900">
                  {formatAmount(selectedTotal)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TABLE */}

        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full min-w-[850px] text-sm">
            <thead className="sticky top-0 z-10 bg-slate-50">
              <tr className="border-b border-slate-200 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <th className="w-14 px-5 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={(event) =>
                      handleSelectAll(event.target.checked)
                    }
                    disabled={
                      loading ||
                      generating ||
                      filteredData.length === 0
                    }
                    aria-label="Select all filtered remittances"
                    title="Select or deselect all filtered remittances"
                    className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-blue-600 disabled:cursor-not-allowed"
                  />
                </th>

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
              {loading ? (
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
                      Loading remittance records...
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-sm text-slate-400"
                  >
                    No eligible remittance records found.
                  </td>
                </tr>
              ) : (
                paginatedData.map((row) => {
                  const isSelected = selectedIds.includes(row.id);

                  return (
                    <tr
                      key={row.id}
                      className={`transition ${
                        isSelected
                          ? "bg-blue-50/60"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <td className="px-5 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(event) =>
                            handleSelectOne(
                              row.id,
                              event.target.checked
                            )
                          }
                          disabled={generating}
                          aria-label={`Select remittance ${row.remittance_no}`}
                          className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-blue-600 disabled:cursor-not-allowed"
                        />
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-semibold text-blue-600">
                          {row.rcd_no || "—"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-semibold text-slate-800">
                          {row.remittance_no || "—"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                          {row.fund_source || "—"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <span className="font-bold text-slate-800">
                          {formatAmount(row.amount)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleView(row)}
                          disabled={generating}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:border-blue-200 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Eye size={14} />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-5 py-3">
          <div className="text-xs text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {filteredData.length === 0
                ? 0
                : (currentPage - 1) * rowsPerPage + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-slate-700">
              {Math.min(
                currentPage * rowsPerPage,
                filteredData.length
              )}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-700">
              {filteredData.length}
            </span>{" "}
            records
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() =>
                setPage((value) => Math.max(1, value - 1))
              }
              aria-label="Previous page"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-blue-600 px-2 text-xs font-semibold text-white">
              {currentPage}
            </div>

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() =>
                setPage((value) =>
                  Math.min(totalPages, value + 1)
                )
              }
              aria-label="Next page"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* CONSOLIDATED RCD PREVIEW */}

      <ConsolidatedRCDPreviewModal
        id={previewId}
        onClose={() => setPreviewId(null)}
      />
    </>
  );
}
