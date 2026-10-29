"use client";

import { useEffect } from "react";
import {
  X,
  Building2,
  CreditCard,
  Hash,
  CalendarDays,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  ClipboardList,
  Wallet,
  UserRound,
} from "lucide-react";

interface Booklet {
  id: string;
  bookNo?: string | number | null;
  bookletNumber?: string | number | null;

  registeredAt?: string | null;
  dateReceived?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;

  fundSourceId?: string | null;
  fundSourceName?: string | null;
  fund_source_name?: string | null;
  fund_source_id?: string | null;

  bankId?: string | null;
  bank?: string | null;
  bankName?: string | null;
  bankCode?: string | null;

  bankAccountId?: string | null;
  accountNumber?: string | null;
  accountName?: string | null;

  beginningCheckNo?: string | number | null;
  endingCheckNo?: string | number | null;
  currentCheckNo?: string | number | null;
  current_check_no?: string | number | null;

  totalChecks?: number | string | null;
  total_checks?: number | string | null;

  issuedChecks?: number | string | null;
  issued_checks?: number | string | null;

  remainingChecks?: number | string | null;
  remaining_checks?: number | string | null;

  remarks?: string | null;
  status?: string | null;

  bankDetails?: Record<string, unknown> | null;
  bankAccountDetails?: Record<string, unknown> | null;
  fundSourceDetails?: Record<string, unknown> | null;

  [key: string]: unknown;
}

interface BookletDetailsModalProps {
  booklet: Booklet | null;
  onClose: () => void;
}

function getValue(
  ...values: (string | number | null | undefined)[]
): string {
  for (const value of values) {
    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
    ) {
      return String(value).trim();
    }
  }

  return "";
}

function getRecordValue(
  record: Record<string, unknown> | null | undefined,
  ...keys: string[]
): string {
  if (!record) return "";

  for (const key of keys) {
    const value = record[key];

    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
    ) {
      return String(value).trim();
    }
  }

  return "";
}

function formatDate(value?: string | null): string {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatCount(value: number): string {
  return Math.max(0, value).toLocaleString("en-PH");
}

function DetailItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2">
      <div className="mb-1 flex items-center gap-1.5 text-slate-500">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-wide">
          {label}
        </span>
      </div>

      <p className="break-words text-xs font-semibold text-slate-800">
        {value || "Not available"}
      </p>
    </div>
  );
}

function parseCheckNumber(value: string): number | null {
  if (!/^\d+$/.test(value)) return null;

  const number = Number(value);

  return Number.isSafeInteger(number) ? number : null;
}

export default function BookletDetailsModal({
  booklet,
  onClose,
}: BookletDetailsModalProps) {
  useEffect(() => {
    if (!booklet) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [booklet, onClose]);

  if (!booklet) return null;

  // Bank information
  const bankName =
    getValue(booklet.bankName, booklet.bank) ||
    getRecordValue(booklet.bankDetails, "bank_name", "name") ||
    "Not available";

  const bankCode =
    getValue(booklet.bankCode) ||
    getRecordValue(booklet.bankDetails, "bank_code", "code");

  const accountName =
    getValue(booklet.accountName) ||
    getRecordValue(
      booklet.bankAccountDetails,
      "account_name",
      "account_holder_name",
      "account_holder",
      "name"
    );

  const accountNumber =
    getRecordValue(
      booklet.bankAccountDetails,
      "account_number",
      "account_no"
    ) ||
    getValue(booklet.accountNumber) ||
    "Not available";

  const accountStatus = getRecordValue(
    booklet.bankAccountDetails,
    "account_status",
    "status"
  );

  // Fund source
  const fundSourceName =
    getValue(
      booklet.fundSourceName,
      booklet.fund_source_name
    ) ||
    getRecordValue(
      booklet.fundSourceDetails,
      "fund_name",
      "fund_source_name",
      "name"
    ) ||
    "Not available";

  // Check number range
  const beginningCheckNo = getValue(
    booklet.beginningCheckNo,
    booklet["beginning_check_no"] as string | number | null | undefined
  );

  const endingCheckNo = getValue(
    booklet.endingCheckNo,
    booklet["ending_check_no"] as string | number | null | undefined
  );

  const currentCheckNo = getValue(
    booklet.currentCheckNo,
    booklet.current_check_no,
    booklet["current_check_no"] as string | number | null | undefined
  ) || beginningCheckNo;

  const beginningNumber = parseCheckNumber(beginningCheckNo);
  const endingNumber = parseCheckNumber(endingCheckNo);
  const currentNumber = parseCheckNumber(currentCheckNo);

  /*
   * CHECK COUNT CALCULATION
   *
   * Example:
   * Beginning: 4716801
   * Ending:    4716850
   * Current:   4716835
   *
   * Total:     50
   * Used:      34
   * Remaining: 16
   * Progress:  68%
   *
   * Assumption: current_check_no is the NEXT check to issue.
   */

  const calculatedTotal =
    beginningNumber !== null &&
    endingNumber !== null &&
    endingNumber >= beginningNumber
      ? endingNumber - beginningNumber + 1
      : 0;

  const storedTotal = Number(
    booklet.totalChecks ?? booklet.total_checks
  );

  const totalChecks =
    Number.isFinite(storedTotal) && storedTotal > 0
      ? storedTotal
      : calculatedTotal;

  const validCurrentNumber =
    beginningNumber !== null &&
    endingNumber !== null &&
    currentNumber !== null &&
    currentNumber >= beginningNumber &&
    currentNumber <= endingNumber + 1;

  // Current number points to the next check to issue.
  const calculatedUsed = validCurrentNumber
    ? currentNumber! - beginningNumber!
    : 0;

  const issuedFromDatabase = Number(
    booklet.issuedChecks ?? booklet.issued_checks
  );

  const hasValidIssuedCount =
    booklet.issuedChecks !== undefined &&
    booklet.issuedChecks !== null &&
    booklet.issuedChecks !== "" &&
    Number.isFinite(issuedFromDatabase) &&
    issuedFromDatabase > 0;

  /*
   * Prefer the current check number as the source of truth.
   * If the current number is invalid/unavailable, use the
   * registered issued count.
   */
  const issuedChecks = Math.min(
    totalChecks,
    Math.max(
      0,
      validCurrentNumber
        ? calculatedUsed
        : hasValidIssuedCount
          ? issuedFromDatabase
          : 0
    )
  );

  const remainingChecks = Math.max(
    0,
    totalChecks - issuedChecks
  );

  const percentage =
    totalChecks > 0
      ? Math.min(100, (issuedChecks / totalChecks) * 100)
      : 0;

  const percentageLabel = `${percentage.toFixed(2)}%`;

  // Status
  const status = booklet.status || "Unknown";
  const normalizedStatus = status.toLowerCase();

  const statusStyle =
    normalizedStatus === "active"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : normalizedStatus === "inactive"
        ? "border-slate-200 bg-slate-100 text-slate-600"
        : normalizedStatus === "closed"
          ? "border-red-200 bg-red-50 text-red-700"
          : normalizedStatus === "exhausted"
            ? "border-amber-200 bg-amber-50 text-amber-700"
            : "border-slate-200 bg-slate-100 text-slate-600";

  const StatusIcon =
    normalizedStatus === "active"
      ? CheckCircle2
      : normalizedStatus === "inactive"
        ? Clock
        : AlertCircle;

  const bookletNumber =
    getValue(booklet.bookletNumber, booklet.bookNo) ||
    "Not available";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-2 backdrop-blur-sm sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="booklet-details-title"
        className="flex max-h-[96vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl bg-slate-50 shadow-2xl"
      >
        {/* Header */}
        <header className="flex shrink-0 items-center justify-between gap-3 bg-blue-900 px-4 py-3 text-white sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15">
              <ClipboardList size={20} />
            </div>

            <div className="min-w-0">
              <h2
                id="booklet-details-title"
                className="truncate text-base font-bold sm:text-lg"
              >
                Check Booklet Details
              </h2>

              <p className="text-xs text-blue-100">
                Booklet No. {bookletNumber}
                {" · "}
                Registered {formatDate(booklet.registeredAt)}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <span
              className={`hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold capitalize sm:inline-flex ${statusStyle}`}
            >
              <StatusIcon size={13} />
              {status}
            </span>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="rounded-lg p-2 transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        {/* Check usage progress bar */}
        <section className="shrink-0 border-b border-slate-200 bg-white px-4 py-3 sm:px-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-5">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2.5">
                <span className="shrink-0 font-mono text-[11px] font-medium text-slate-600">
                  {beginningCheckNo || "—"}
                </span>

                <div
                  className="h-2 min-w-8 flex-1 overflow-hidden rounded-full bg-slate-200"
                  role="progressbar"
                  aria-label="Check booklet usage"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={percentage}
                >
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <span className="shrink-0 font-mono text-[11px] font-medium text-slate-600">
                  {endingCheckNo || "—"}
                </span>

                <div className="hidden shrink-0 items-center gap-1.5 whitespace-nowrap text-[11px] text-slate-500 sm:flex">
                  <span>
                    Used{" "}
                    <strong className="text-slate-700">
                      {formatCount(issuedChecks)}
                    </strong>
                  </span>

                  <span className="text-slate-300">|</span>

                  <span>
                    Remaining{" "}
                    <strong className="text-emerald-600">
                      {formatCount(remainingChecks)}
                    </strong>
                  </span>

                  <span className="text-slate-300">|</span>

                  <strong>{percentageLabel}</strong>
                </div>
              </div>

              <div className="mt-1.5 flex items-center justify-between gap-3">
                <p className="text-[11px] text-slate-500">
                  Issue an Official Receipt for General Collections
                </p>

                <span className="text-[11px] text-slate-500 sm:hidden">
                  Used {formatCount(issuedChecks)} · Remaining{" "}
                  <strong className="text-emerald-600">
                    {formatCount(remainingChecks)}
                  </strong>{" "}
                  · {percentageLabel}
                </span>
              </div>
            </div>

            {/* Current check number */}
            <div className="flex min-w-0 items-center justify-between gap-3 rounded-xl bg-blue-600 px-4 py-2.5 text-white shadow-sm lg:min-w-[230px] lg:justify-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-100 lg:hidden">
                Current Check No.
              </p>

              <div className="min-w-0 text-right lg:text-center">
                <p className="mb-0.5 hidden text-[10px] font-semibold uppercase tracking-wider text-blue-100 lg:block">
                  Current Check No.
                </p>

                <p className="break-all font-mono text-2xl font-extrabold leading-none tracking-tight sm:text-3xl">
                  {currentCheckNo || "—"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Details */}
        <main className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {/* Bank */}
            <section className="rounded-lg border border-slate-200 bg-slate-100/70 p-3">
              <h3 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-700">
                <Building2 size={15} className="text-blue-700" />
                Bank Information
              </h3>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <DetailItem
                  label="Bank Name"
                  value={bankName}
                  icon={<Building2 size={14} />}
                />

                {bankCode && (
                  <DetailItem
                    label="Bank Code"
                    value={bankCode}
                    icon={<Hash size={14} />}
                  />
                )}

                <DetailItem
                  label="Account Name"
                  value={accountName || "Not provided"}
                  icon={<UserRound size={14} />}
                />

                <DetailItem
                  label="Account Number"
                  value={accountNumber}
                  icon={<CreditCard size={14} />}
                />

                {accountStatus && (
                  <DetailItem
                    label="Account Status"
                    value={accountStatus}
                    icon={<CheckCircle2 size={14} />}
                  />
                )}
              </div>
            </section>

            {/* Fund source and range */}
            <section className="rounded-lg border border-slate-200 bg-slate-100/70 p-3">
              <h3 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-700">
                <Wallet size={15} className="text-blue-700" />
                Fund Source & Check Range
              </h3>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <DetailItem
                    label="Fund Source Name"
                    value={fundSourceName}
                    icon={<Wallet size={14} />}
                  />
                </div>

                <DetailItem
                  label="Beginning Check No."
                  value={beginningCheckNo || "Not available"}
                  icon={<Hash size={14} />}
                />

                <DetailItem
                  label="Ending Check No."
                  value={endingCheckNo || "Not available"}
                  icon={<Hash size={14} />}
                />
              </div>
            </section>

            {/* Statistics */}
            <section className="rounded-lg border border-slate-200 bg-slate-100/70 p-3">
              <h3 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-700">
                <ClipboardList size={15} className="text-blue-700" />
                Check Statistics
              </h3>

              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    Total
                  </p>
                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {formatCount(totalChecks)}
                  </p>
                  <p className="text-[10px] text-slate-500">Checks</p>
                </div>

                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-blue-700">
                    Used
                  </p>
                  <p className="mt-1 text-xl font-bold text-blue-800">
                    {formatCount(issuedChecks)}
                  </p>
                  <p className="text-[10px] text-blue-600">
                    {percentageLabel} used
                  </p>
                </div>

                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                    Remaining
                  </p>
                  <p className="mt-1 text-xl font-bold text-emerald-800">
                    {formatCount(remainingChecks)}
                  </p>
                  <p className="text-[10px] text-emerald-600">
                    Checks left
                  </p>
                </div>
              </div>
            </section>

            {/* Registration */}
            <section className="rounded-lg border border-slate-200 bg-slate-100/70 p-3">
              <h3 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-700">
                <CalendarDays size={15} className="text-blue-700" />
                Registration Information
              </h3>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <DetailItem
                  label="Date Received"
                  value={formatDate(booklet.dateReceived)}
                  icon={<CalendarDays size={14} />}
                />

                <DetailItem
                  label="Registered At"
                  value={formatDate(booklet.registeredAt)}
                  icon={<CalendarDays size={14} />}
                />

                <DetailItem
                  label="Created At"
                  value={formatDate(booklet.createdAt)}
                  icon={<Clock size={14} />}
                />

                <DetailItem
                  label="Last Updated"
                  value={formatDate(booklet.updatedAt)}
                  icon={<Clock size={14} />}
                />
              </div>
            </section>

            {/* Remarks */}
            <section className="rounded-lg border border-slate-200 bg-white p-3 lg:col-span-2">
              <h3 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-700">
                <FileText size={15} className="text-blue-700" />
                Remarks
              </h3>

              <p className="whitespace-pre-wrap break-words text-xs leading-5 text-slate-600">
                {booklet.remarks?.trim() || "No remarks provided."}
              </p>
            </section>

            {/* Record ID */}
            <section className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-100 px-3 py-2 lg:col-span-2">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Record ID
                </p>
                <p className="break-all font-mono text-xs text-slate-600">
                  {booklet.id}
                </p>
              </div>

              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusStyle}`}
              >
                <StatusIcon size={13} />
                {status}
              </span>
            </section>
          </div>
        </main>

        {/* Footer */}
        <footer className="flex shrink-0 justify-end border-t border-slate-200 bg-white px-4 py-2.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-blue-900 px-5 py-2 text-xs font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}