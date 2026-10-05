
"use client";

import { ArrowLeft } from "lucide-react";
import type { Booklet } from "./BookletTable";
import CheckTable from "./CheckTable";

interface Props {
  booklet: Booklet;
  onBack?: () => void;
}

export default function BookletDetails({ booklet, onBack }: Props) {
  const formatDate = (value?: string | null) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleString("en-PH", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const checks = booklet.checks ?? [];

  const totalChecks =
    checks.length ||
    (() => {
      const start = Number(booklet.beginningCheckNo);
      const end = Number(booklet.endingCheckNo);

      if (
        !Number.isSafeInteger(start) ||
        !Number.isSafeInteger(end) ||
        end < start
      ) {
        return 0;
      }

      return end - start + 1;
    })();

  return (
    <div className="space-y-5">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 transition hover:text-blue-900"
        >
          <ArrowLeft size={18} />
          Back to booklets
        </button>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Book No. {booklet.bookletNumber || "—"}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Check booklet details
            </p>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              booklet.status === "Active"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {booklet.status || "Unknown"}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Fund Source
            </p>
            <p className="mt-1 text-sm font-medium text-gray-900">
              {booklet.fundSourceName || "—"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Bank
            </p>
            <p className="mt-1 text-sm font-medium text-gray-900">
              {booklet.bank || "—"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Account Number
            </p>
            <p className="mt-1 break-all font-mono text-sm font-medium text-gray-900">
              {booklet.accountNumber || "—"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Check Range
            </p>
            <p className="mt-1 font-mono text-sm font-medium text-gray-900">
              {booklet.beginningCheckNo || "—"} –{" "}
              {booklet.endingCheckNo || "—"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Total Checks
            </p>
            <p className="mt-1 text-sm font-medium text-gray-900">
              {totalChecks.toLocaleString("en-PH")}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Date Registered
            </p>
            <p className="mt-1 text-sm font-medium text-gray-900">
              {formatDate(
                booklet.registeredAt || booklet.dateReceived
              )}
            </p>
          </div>

          {booklet.remarks && (
            <div className="sm:col-span-2 lg:col-span-3">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Remarks
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-gray-900">
                {booklet.remarks}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-semibold text-gray-900">
            Individual Checks
          </h3>
          <span className="text-sm text-gray-500">
            {checks.length.toLocaleString("en-PH")} records
          </span>
        </div>

        <CheckTable checks={checks} />
      </div>
    </div>
  );
}
