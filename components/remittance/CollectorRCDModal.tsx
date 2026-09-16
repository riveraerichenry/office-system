"use client";

import React, {
  useEffect,
  useState,
} from "react";

import {
  X,
  Check,
} from "lucide-react";

/* ============================================================
   COLLECTOR RCD TYPE
============================================================ */

export type CollectorRCD = {
  id: string;
  rcdReportNo: string;
  reportDate: string;
  collector: string;
  fundSource: string;
  coverageFrom: string;
  coverageTo: string;
  totalCollections: number;
  status: string;
};

/* ============================================================
   PROPS
============================================================ */

type CollectorRCDModalProps = {
  rcd: CollectorRCD | null;

  onClose: () => void;

  onApprove: (
    id: string,
    remittanceNumber: string
  ) => void;

  isApproved: boolean;
};

/* ============================================================
   DATE FORMAT
============================================================ */

const formatDate = (
  value: string | null | undefined
) => {
  if (!value) {
    return "";
  }

  const dateString =
    String(value).slice(0, 10);

  const parts =
    dateString.split("-");

  if (parts.length !== 3) {
    return dateString;
  }

  const [
    year,
    month,
    day,
  ] = parts;

  if (
    !year ||
    !month ||
    !day ||
    year.length !== 4 ||
    month.length !== 2 ||
    day.length !== 2
  ) {
    return dateString;
  }

  return `${month}/${day}/${year}`;
};

/* ============================================================
   AMOUNT FORMAT
============================================================ */

const formatAmount = (
  value: number
) => {
  return Number(
    value || 0
  ).toLocaleString(
    "en-PH",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  );
};

/* ============================================================
   COMPONENT
============================================================ */

export default function CollectorRCDModal({
  rcd,
  onClose,
  onApprove,
  isApproved,
}: CollectorRCDModalProps) {

  /* ==========================================================
     REMITTANCE NUMBER
  ========================================================== */

  const [
    remittanceNumber,
    setRemittanceNumber,
  ] = useState("");

  /* ==========================================================
     RESET WHEN RCD CHANGES
  ========================================================== */

  useEffect(() => {
    setRemittanceNumber("");
  }, [rcd?.id]);

  /* ==========================================================
     NO SELECTED RCD
  ========================================================== */

  if (!rcd) {
    return null;
  }

  /* ==========================================================
     APPROVE

     The parent component handles the actual API request.
  ========================================================== */

  const handleApprove = () => {
    const value =
      remittanceNumber.trim();

    if (!value) {
      return;
    }

    onApprove(
      rcd.id,
      value
    );
  };

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl"
        onMouseDown={(e) =>
          e.stopPropagation()
        }
      >

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">

          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Collector RCD Details
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Review the RCD information before
              processing the remittance.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close"
          >
            <X size={20} />
          </button>

        </div>

        {/* ====================================================
            BODY
        ==================================================== */}

        <div className="space-y-5 px-6 py-5">

          {/* ==================================================
              RCD INFORMATION
          ================================================== */}

          <div>

            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-700">
              RCD Information
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              {/* ==================================================
                  COLLECTOR
              ================================================== */}

              <div>

                <label className="mb-1 block text-xs font-medium text-gray-500">
                  Collector
                </label>

                <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900">
                  {rcd.collector ||
                    "Unknown Collector"}
                </div>

              </div>

              {/* ==================================================
                  RCD NUMBER
              ================================================== */}

              <div>

                <label className="mb-1 block text-xs font-medium text-gray-500">
                  RCD Number
                </label>

                <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-medium text-gray-900">
                  {rcd.rcdReportNo ||
                    "-"}
                </div>

              </div>

              {/* ==================================================
                  REPORT DATE
              ================================================== */}

              <div>

                <label className="mb-1 block text-xs font-medium text-gray-500">
                  Report Date
                </label>

                <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900">
                  {formatDate(
                    rcd.reportDate
                  ) || "-"}
                </div>

              </div>

              {/* ==================================================
                  FUND SOURCE
              ================================================== */}

              <div>

                <label className="mb-1 block text-xs font-medium text-gray-500">
                  Fund Source
                </label>

                <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900">
                  {rcd.fundSource ||
                    "-"}
                </div>

              </div>

              {/* ==================================================
                  COVERAGE
              ================================================== */}

              <div className="sm:col-span-2">

                <label className="mb-1 block text-xs font-medium text-gray-500">
                  Coverage
                </label>

                <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900">

                  {formatDate(
                    rcd.coverageFrom
                  )}

                  {" — "}

                  {formatDate(
                    rcd.coverageTo
                  )}

                </div>

              </div>

            </div>

          </div>

          {/* ==================================================
              REMITTANCE NUMBER
          ================================================== */}

          <div>

            <label
              htmlFor="remittance-number"
              className="mb-1.5 block text-sm font-semibold text-gray-700"
            >
              Remittance Number
            </label>

            <input
              id="remittance-number"
              type="text"
              value={
                remittanceNumber
              }
              onChange={(e) =>
                setRemittanceNumber(
                  e.target.value
                )
              }
              placeholder="Enter remittance number"
              disabled={isApproved}
              autoComplete="off"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
            />

          </div>

          {/* ==================================================
              TOTAL COLLECTIONS
          ================================================== */}

          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-4">

            <div className="flex items-center justify-between gap-4">

              <span className="text-sm font-medium text-gray-600">
                Total Collections
              </span>

              <span className="text-lg font-bold text-gray-900">
                ₱
                {formatAmount(
                  rcd.totalCollections
                )}
              </span>

            </div>

          </div>

        </div>

        {/* ====================================================
            FOOTER
        ==================================================== */}

        <div className="flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">

          {/* ==================================================
              CLOSE
          ================================================== */}

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Close
          </button>

          {/* ==================================================
              APPROVE
          ================================================== */}

          {!isApproved ? (

            <button
              type="button"
              onClick={
                handleApprove
              }
              disabled={
                !remittanceNumber.trim()
              }
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check size={17} />

              Approve Remittance
            </button>

          ) : (

            <div className="inline-flex items-center gap-2 rounded-lg bg-green-100 px-4 py-2 text-sm font-medium text-green-700">

              <Check size={17} />

              Approved

            </div>

          )}

        </div>

      </div>
    </div>
  );
}