"use client";

import { useState } from "react";
import axios from "axios";
import { X, Printer, CheckCircle2 } from "lucide-react";

import RCDGenerateForm from "./rcd/RCDGenerateForm";
import RCDPreview from "./rcd/RCDPreview";

import {
RCD,
RCDItem,
RCDFundSource,
RCDUser,
RCDFormRow,
} from "./rcd/RCDTypes";

type Props = {
open: boolean;
onClose: () => void;
};

type GeneratedRCD = {
rcd: RCD;
items: RCDItem[];
summary: {
transaction_count: number;
total_collections: number;
total_remittances: number;
total_deposits: number;
balance: number;
};
fund_source: RCDFundSource;
user: RCDUser;
previous_form_rows: RCDFormRow[];
};

export default function GenerateRCDModal({
open,
onClose,
}: Props) {
const [fundSourceId, setFundSourceId] = useState("");
const [dateFrom, setDateFrom] = useState("");
const [dateTo, setDateTo] = useState("");

const [selectedTransactionIds, setSelectedTransactionIds] =
useState<string[]>([]);

// Supports one or multiple generated RCDs.
const [generatedRCDs, setGeneratedRCDs] = useState<GeneratedRCD[]>(
[]
);

const [generating, setGenerating] = useState(false);
const [error, setError] = useState("");

if (!open) {
return null;
}

const handleGenerateRCD = async () => {
setError("");

if (!fundSourceId) {
  setError("Please select a fund source.");
  return;
}

if (!dateFrom) {
  setError("Please select the beginning date.");
  return;
}

if (!dateTo) {
  setError("Please select the ending date.");
  return;
}

if (dateFrom > dateTo) {
  setError(
    "Beginning date cannot be later than ending date."
  );
  return;
}

if (selectedTransactionIds.length === 0) {
  setError(
    "Please select at least one transaction to include in the RCD."
  );
  return;
}

setGenerating(true);

// Remove the previous preview while generating a new report.
setGeneratedRCDs([]);

try {
  const response = await axios.post("/api/rcd", {
    fund_source_id: fundSourceId,
    date_from: dateFrom,
    date_to: dateTo,
    transaction_ids: selectedTransactionIds,
  });

  const data = response.data;

  if (!data?.success) {
    throw new Error(
      data?.message || "Failed to generate RCD."
    );
  }

  /*
   * New API response:
   * {
   *   success: true,
   *   rcds: [
   *     { rcd, items, summary, fund_source, user, previous_form_rows },
   *     { rcd, items, summary, fund_source, user, previous_form_rows }
   *   ]
   * }
   *
   * Backward compatibility:
   * The original API response contains a single RCD
   * directly in the response object.
   */
  let reports: GeneratedRCD[] = [];

  if (Array.isArray(data.rcds) && data.rcds.length > 0) {
    reports = data.rcds;
  } else if (data.rcd) {
    reports = [data];
  }

  if (
    reports.length === 0 ||
    reports.some((report) => !report?.rcd)
  ) {
    throw new Error(
      "The API reported success but did not return valid RCD report data."
    );
  }

  // The API should return Basic first and SEF second.
  // Keep that response order for the preview and printing.
  setGeneratedRCDs(reports);
} catch (err: any) {
  console.error("GENERATE RCD ERROR:", err);

  const message =
    err?.response?.data?.message ||
    err?.message ||
    "Failed to generate RCD.";

  setError(message);
} finally {
  setGenerating(false);
}

};

const handlePrint = () => {
if (generatedRCDs.length === 0) {
return;
}

// Both reports are rendered before this single print operation.
window.print();

};

const reportNumbers = generatedRCDs
.map((report) => report.rcd?.report_no)
.filter(Boolean);

return (
<div
   className="
     fixed inset-0 z-[70]
     flex items-center justify-center
     bg-black/50 p-4
   "
 >
<div
     className="
       flex h-[95vh] w-full max-w-[1500px]
       flex-col overflow-hidden rounded-xl
       bg-white shadow-2xl
     "
   >
{/* HEADER */}
<div
       className="
         flex shrink-0 items-center justify-between
         border-b bg-white px-6 py-4
       "
     >
<div>
<h2 className="text-lg font-bold text-slate-900">
Generate RCD
</h2>

        <p className="text-sm text-slate-500">
          Report of Collections and Deposits
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="
          rounded-lg p-2 text-slate-500
          transition hover:bg-slate-100
          hover:text-slate-900
        "
        title="Close"
      >
        <X size={22} />
      </button>
    </div>

    {/* ERROR */}
    {error && (
      <div
        className="
          shrink-0 border-b border-red-200
          bg-red-50 px-6 py-3
          text-sm font-semibold text-red-700
        "
      >
        {error}
      </div>
    )}

    {/* BODY */}
    <div className="min-h-0 flex-1 overflow-hidden">
      <div
        className="
          grid h-full grid-cols-1
          lg:grid-cols-[480px_minmax(0,1fr)]
        "
      >
        {/* LEFT: GENERATION FORM */}
        <div
          className="
            min-h-0 overflow-y-auto border-r
            bg-slate-50 p-5
          "
        >
          <RCDGenerateForm
            fundSourceId={fundSourceId}
            setFundSourceId={setFundSourceId}
            dateFrom={dateFrom}
            setDateFrom={setDateFrom}
            dateTo={dateTo}
            setDateTo={setDateTo}
            selectedTransactionIds={selectedTransactionIds}
            onSelectionChange={setSelectedTransactionIds}
          />
        </div>

        {/* RIGHT: PREVIEW */}
        <div
          className="
            min-h-0 overflow-y-auto
            bg-slate-200
          "
        >
          {generatedRCDs.length > 0 ? (
            <div className="rcd-generated-container">
              {generatedRCDs.map((report, index) => (
                <div
                  key={
                    report.rcd?.id ??
                    report.rcd?.report_no ??
                    `generated-rcd-${index}`
                  }
                  className="rcd-generated-page"
                >
                  <RCDPreview
                    rcd={report.rcd ?? null}
                    items={report.items ?? []}
                    fundSource={report.fund_source ?? null}
                    user={report.user ?? null}
                    previousFormRows={
                      report.previous_form_rows ?? []
                    }
                  />
                </div>
              ))}
            </div>
          ) : (
            <div
              className="
                flex min-h-full items-center
                justify-center p-8 text-center
              "
            >
              <div className="max-w-md">
                <div
                  className="
                    mx-auto mb-4 flex h-16 w-16
                    items-center justify-center
                    rounded-full bg-white
                    text-slate-400 shadow-sm
                  "
                >
                  <Printer size={28} />
                </div>

                <h3 className="text-base font-bold text-slate-700">
                  RCD Preview
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Select a fund source, date range, and
                  transactions, then generate the report
                  to preview it here.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* FOOTER */}
    <div
      className="
        flex shrink-0 items-center justify-between
        gap-4 border-t bg-white px-6 py-4
      "
    >
      {/* STATUS */}
      <div className="min-w-0">
        {generatedRCDs.length > 0 ? (
          <div
            className="
              flex items-start gap-2
              text-sm font-semibold text-green-700
            "
          >
            <CheckCircle2
              size={18}
              className="mt-0.5 shrink-0"
            />

            <div className="min-w-0">
              <div>
                {generatedRCDs.length === 2
                  ? "2 RCD reports generated:"
                  : "RCD generated:"}
              </div>

              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                {reportNumbers.map((reportNo, index) => (
                  <span
                    key={`${reportNo}-${index}`}
                    className="font-bold"
                  >
                    {reportNo}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <span className="text-xs font-medium text-slate-400">
            {selectedTransactionIds.length > 0
              ? `${selectedTransactionIds.length} transaction${
                  selectedTransactionIds.length !== 1
                    ? "s"
                    : ""
                } selected.`
              : "Select the fund source, date range, and transactions."}
          </span>
        )}
      </div>

      {/* ACTIONS */}
      <div className="flex shrink-0 items-center gap-3">
        {generatedRCDs.length > 0 && (
          <button
            type="button"
            onClick={handlePrint}
            className="
              flex items-center gap-2 rounded-lg
              border border-slate-300 bg-white
              px-5 py-2 text-sm font-semibold
              text-slate-700 transition
              hover:bg-slate-50
            "
          >
            <Printer size={17} />
            Print {generatedRCDs.length > 1 ? "Both RCDs" : "RCD"}
          </button>
        )}

        <button
          type="button"
          onClick={handleGenerateRCD}
          disabled={generating}
          className="
            rounded-lg bg-blue-600 px-5 py-2
            text-sm font-semibold text-white
            transition hover:bg-blue-700
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {generating
            ? "Generating..."
            : generatedRCDs.length > 0
              ? "Generate New RCD"
              : "Generate RCD"}
        </button>
      </div>
    </div>
  </div>

  {/* PRINT PAGE BREAKS */}
  <style jsx global>{`
    @media print {
      .rcd-generated-container {
        display: block !important;
        width: 100% !important;
      }

      .rcd-generated-page {
        display: block !important;
        width: 100% !important;
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }

      .rcd-generated-page:not(:first-child) {
        break-before: page !important;
        page-break-before: always !important;
      }
    }
  `}</style>
</div>

);
}