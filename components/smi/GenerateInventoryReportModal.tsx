
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CalendarDays,
  Printer,
  X,
  FileText,
  RefreshCw,
} from "lucide-react";

import InventoryReportPreview, {
  type InventoryReportRow,
} from "./InventoryReportPreview";

export type InventoryReportOptions = {
  month: number;
  year: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  reportData?: InventoryReportRow[];
  loading?: boolean;
  onPeriodChange?: (month: number, year: number) => void;
  onGenerate?: (options: InventoryReportOptions) => void;
};

type ApiResponse = {
  success: boolean;
  message?: string;
  error?: string;
  reportData?: InventoryReportRow[];
};

const MONTHS = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
];

export default function GenerateInventoryReportModal({
  open,
  onClose,
  onPeriodChange,
  onGenerate,
}: Props) {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [reportData, setReportData] = useState<InventoryReportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPrinting, setIsPrinting] = useState(false);

  const years = Array.from(
    { length: 10 },
    (_, index) => new Date().getFullYear() - index
  );

  const fetchReport = useCallback(async () => {
    if (!open) return;

    setLoading(true);
    setError("");

    try {
      const query = new URLSearchParams({
        period: "month",
        month: String(month),
        year: String(year),
      });

      const response = await fetch(
        `/api/smi/report/consolidated?${query.toString()}`,
        {
          method: "GET",
          cache: "no-store",
          headers: { Accept: "application/json" },
        }
      );

      const responseText = await response.text();

      let result: ApiResponse;

      try {
        result = JSON.parse(responseText) as ApiResponse;
      } catch {
        throw new Error(
          `The API returned non-JSON content (HTTP ${response.status}). Check the route and server terminal.`
        );
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.error ||
            result.message ||
            `Request failed with HTTP ${response.status}.`
        );
      }

      setReportData(
        Array.isArray(result.reportData) ? result.reportData : []
      );
    } catch (err) {
      console.error("Consolidated inventory report error:", err);
      setReportData([]);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load the consolidated inventory report."
      );
    } finally {
      setLoading(false);
    }
  }, [open, month, year]);

  useEffect(() => {
    if (!open) return;

    onPeriodChange?.(month, year);
    void fetchReport();
  }, [open, month, year, fetchReport, onPeriodChange]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  const handlePrint = useCallback(async () => {
    if (loading || isPrinting || error || reportData.length === 0) {
      return;
    }

    setIsPrinting(true);

    try {
      onGenerate?.({ month, year });

      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, 300);
      });

      window.print();
    } finally {
      setIsPrinting(false);
    }
  }, [
    loading,
    isPrinting,
    error,
    reportData.length,
    onGenerate,
    month,
    year,
  ]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[95vh] w-full max-w-[1600px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
              <FileText size={22} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Generate Consolidated Inventory Report
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Select a reporting month and year.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close report modal"
            className="self-end rounded-lg p-2 text-slate-500 hover:bg-slate-100 sm:self-auto"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 border-b bg-slate-50 p-5 sm:grid-cols-3">
          <div>
            <label
              htmlFor="inventory-report-month"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Reporting Month
            </label>

            <div className="relative">
              <CalendarDays
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                id="inventory-report-month"
                value={month}
                onChange={(event) => setMonth(Number(event.target.value))}
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {MONTHS.map((name, index) => (
                  <option key={name} value={index + 1}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="inventory-report-year"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Reporting Year
            </label>

            <select
              id="inventory-report-year"
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {years.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => void fetchReport()}
              disabled={loading}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={() => void handlePrint()}
              disabled={
                loading ||
                isPrinting ||
                Boolean(error) ||
                reportData.length === 0
              }
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Printer size={18} />
              {isPrinting ? "Preparing..." : "Print Report"}
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto bg-slate-200 p-4 sm:p-6">
          {error && (
            <div className="mx-auto mb-4 max-w-[1500px] rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              <p className="font-semibold">
                Unable to load inventory report
              </p>
              <p className="mt-1 whitespace-pre-wrap">{error}</p>

              <button
                type="button"
                onClick={() => void fetchReport()}
                className="mt-3 rounded-lg bg-red-700 px-3 py-2 font-semibold text-white hover:bg-red-800"
              >
                Try Again
              </button>
            </div>
          )}

          <div className="mx-auto w-full max-w-[1500px] overflow-x-auto bg-white shadow-lg">
            <InventoryReportPreview
              reportData={reportData}
              month={month}
              year={year}
              loading={loading}
            />
          </div>

          {!loading && !error && (
            <p className="mx-auto mt-3 max-w-[1500px] text-xs text-slate-600">
              Report rows: {reportData.length}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t bg-white px-5 py-3">
          <p className="text-xs text-slate-500">
            Print layout: legal paper, landscape.
          </p>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
