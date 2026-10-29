
"use client";

import { useEffect, useState } from "react";
import { Banknote, LoaderCircle, Printer, X } from "lucide-react";
import PreviewCash from "./PreviewCash";
import PreviewCheck from "./PreviewCheck";

type DepositItem = {
  id: string;
  item_type: string;
  amount: number | string;
  check_type?: string | null;
  check_number?: string | null;
  check_date?: string | null;
  issuing_bank?: string | null;
  check_remarks?: string | null;
  remarks?: string | null;
};

type CashDenomination = {
  denomination: number | string;
  quantity: number | string;
  subtotal: number | string;
};

type DepositDetail = {
  id: string;
  rcd_number: string;
  deposit_date: string;
  reference_number?: string | null;
  total_amount: number | string;
  total_cash: number | string;
  total_checks: number | string;
  status?: string | null;
  remarks?: string | null;
  bank_name?: string | null;
  account_name?: string | null;
  account_number?: string | null;
  account_code?: string | null;
  cash_denominations: CashDenomination[];
  items: DepositItem[];
};

type Props = {
  open: boolean;
  consolidatedRcdId: string;
  onClose: () => void;
};

const peso = (value: number | string) =>
  `₱${Number(value || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const dateLabel = (value?: string | null) => {
  if (!value) return "—";

  const raw = String(value).slice(0, 10);
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  return match
    ? new Date(
        Number(match[1]),
        Number(match[2]) - 1,
        Number(match[3])
      ).toLocaleDateString("en-PH", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
    : raw;
};

const esc = (value: unknown) =>
  String(value ?? "—").replace(
    /[&<>"']/g,
    (ch) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[ch] || ch
  );

export default function DepositDetailsModal({
  open,
  consolidatedRcdId,
  onClose,
}: Props) {
  const [deposit, setDeposit] = useState<DepositDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewType, setPreviewType] = useState<
    "CASH" | "ON_US" | "LOCAL" | null
  >(null);

  useEffect(() => {
    if (!open || !consolidatedRcdId) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      setDeposit(null);

      try {
        const response = await fetch(
          `/api/deposit/transactions?consolidated_rcd_id=${encodeURIComponent(
            consolidatedRcdId
          )}`,
          {
            cache: "no-store",
            credentials: "include",
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success || !result.deposit) {
          throw new Error(
            result.error || "Failed to load deposit details."
          );
        }

        if (!cancelled) {
          setDeposit(result.deposit as DepositDetail);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error
              ? e.message
              : "Failed to load deposit details."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [open, consolidatedRcdId]);

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKey);

    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  function printSlip(title: string, body: string) {
    const win = window.open("", "_blank", "width=1000,height=750");

    if (!win) {
      setError(
        "The print window was blocked. Allow pop-ups and try again."
      );
      return;
    }

    win.document.open();

    win.document.write(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${esc(title)}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 12mm;
            }

            * {
              box-sizing: border-box;
            }

            body {
              font-family: Arial, Helvetica, sans-serif;
              color: #111827;
              margin: 0;
              font-size: 12px;
            }

            .head {
              text-align: center;
              border-bottom: 2px solid #1e3a8a;
              padding-bottom: 12px;
              margin-bottom: 18px;
            }

            .head h1 {
              font-size: 19px;
              margin: 0 0 6px;
            }

            .details {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px 20px;
              margin-bottom: 18px;
            }

            .details div {
              display: flex;
              flex-direction: column;
              gap: 3px;
              overflow-wrap: anywhere;
            }

            .muted {
              color: #64748b;
              font-size: 10px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin: 12px 0 18px;
            }

            th,
            td {
              border: 1px solid #cbd5e1;
              padding: 8px;
              text-align: left;
            }

            th {
              background: #f1f5f9;
            }

            .num {
              text-align: right;
              white-space: nowrap;
            }

            tfoot {
              font-weight: bold;
              background: #eff6ff;
            }

            .total {
              display: flex;
              justify-content: space-between;
              padding: 14px;
              background: #eff6ff;
              border: 1px solid #bfdbfe;
              font-size: 15px;
              font-weight: bold;
            }

            .total strong {
              color: #1d4ed8;
            }

            @media print {
              table,
              .total {
                break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="head">
            <h1>${esc(title)}</h1>
            <p>Consolidated RCD No.: ${esc(deposit?.rcd_number)}</p>
          </div>

          <div class="details">
            <div>
              <span class="muted">Deposit Date</span>
              <strong>${esc(dateLabel(deposit?.deposit_date))}</strong>
            </div>

            <div>
              <span class="muted">Reference Number</span>
              <strong>${esc(deposit?.reference_number || "—")}</strong>
            </div>

            <div>
              <span class="muted">Bank</span>
              <strong>${esc(deposit?.bank_name || "—")}</strong>
            </div>

            <div>
              <span class="muted">Bank Account</span>
              <strong>${esc(
                [
                  deposit?.account_name,
                  deposit?.account_number,
                ]
                  .filter(Boolean)
                  .join(" · ") || "—"
              )}</strong>
            </div>
          </div>

          ${body}

          <div style="margin-top:16px">
            <span class="muted">Remarks</span>
            <p>${esc(deposit?.remarks || "—")}</p>
          </div>

          <script>
            window.onload = function () {
              window.focus();
              window.print();
            };
          </script>
        </body>
      </html>
    `);

    win.document.close();
  }

  function printCheckSlip(type: "ON_US" | "LOCAL") {
    if (!deposit) return;

    const items = deposit.items.filter(
      (item) =>
        item.item_type.toUpperCase() === "CHECK" &&
        String(item.check_type || "").toUpperCase() === type
    );

    if (!items.length) return;

    const label = type === "ON_US" ? "On Us" : "Local";

    const total = items.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

    const rows = items
      .map(
        (item, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${esc(item.check_number)}</td>
            <td>${esc(dateLabel(item.check_date))}</td>
            <td>${esc(item.issuing_bank)}</td>
            <td class="num">${esc(peso(item.amount))}</td>
            <td>${esc(item.check_remarks || item.remarks || "—")}</td>
          </tr>
        `
      )
      .join("");

    printSlip(
      `${label.toUpperCase()} CHECK DEPOSIT SLIP`,
      `
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Check Number</th>
              <th>Check Date</th>
              <th>Issuing Bank</th>
              <th class="num">Amount</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
          <tfoot>
            <tr>
              <td colspan="4">Total ${label} Checks (${items.length})</td>
              <td class="num">${esc(peso(total))}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>

        <div class="total">
          <span>Total ${label} Checks</span>
          <strong>${esc(peso(total))}</strong>
        </div>
      `
    );
  }

  const onUsCount =
    deposit?.items.filter(
      (item) =>
        item.item_type.toUpperCase() === "CHECK" &&
        String(item.check_type || "").toUpperCase() === "ON_US"
    ).length ?? 0;

  const localCount =
    deposit?.items.filter(
      (item) =>
        item.item_type.toUpperCase() === "CHECK" &&
        String(item.check_type || "").toUpperCase() === "LOCAL"
    ).length ?? 0;

  const previewChecks =
    previewType && previewType !== "CASH"
      ? (deposit?.items ?? []).filter(
          (item) =>
            item.item_type.toUpperCase() === "CHECK" &&
            String(item.check_type || "").toUpperCase() === previewType
        )
      : [];

  function handlePrintPreview() {
    if (previewType === "ON_US") printCheckSlip("ON_US");
    if (previewType === "LOCAL") printCheckSlip("LOCAL");
  }

  return (
    <div
      className="fixed inset-0 z-[100100] flex items-center justify-center bg-slate-950/60 p-1 sm:p-2"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="deposit-details-title"
        className="flex h-[98vh] max-h-[98vh] w-[99vw] max-w-[2000px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="shrink-0 border-b border-slate-200 bg-slate-50 px-4 py-3 sm:px-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2
                  id="deposit-details-title"
                  className="text-lg font-bold text-slate-900"
                >
                  Deposit Details
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  View saved information and reprint deposit slips
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            {deposit && (
              <div className="grid grid-cols-3 gap-2 sm:min-w-[390px] xl:max-w-[540px] xl:flex-1 xl:justify-end">
                <div className="min-w-0 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-2 sm:px-3">
                  <p className="text-[9px] font-bold uppercase tracking-wide text-blue-700 sm:text-[10px]">
                    Cash
                  </p>
                  <p className="mt-1 truncate text-xs font-bold tabular-nums text-blue-950 sm:text-sm">
                    {peso(deposit.total_cash)}
                  </p>
                </div>

                <div className="min-w-0 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-2 sm:px-3">
                  <p className="text-[9px] font-bold uppercase tracking-wide text-indigo-700 sm:text-[10px]">
                    Checks
                  </p>
                  <p className="mt-1 truncate text-xs font-bold tabular-nums text-indigo-950 sm:text-sm">
                    {peso(deposit.total_checks)}
                  </p>
                </div>

                <div className="min-w-0 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-2 sm:px-3">
                  <p className="text-[9px] font-bold uppercase tracking-wide text-emerald-700 sm:text-[10px]">
                    Total Deposit
                  </p>
                  <p className="mt-1 truncate text-xs font-extrabold tabular-nums text-emerald-950 sm:text-sm">
                    {peso(deposit.total_amount)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Details and preview */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
          {/* Deposit details */}
          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5 lg:w-[40%] lg:flex-none">
            {loading && (
              <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
                <LoaderCircle className="animate-spin" size={18} />
                Loading deposit details...
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            {!loading && deposit && (
              <>
                <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {[
                    ["RCD Number", deposit.rcd_number],
                    ["Deposit Date", dateLabel(deposit.deposit_date)],
                    ["Status", deposit.status || "Deposited"],
                    ["Bank", deposit.bank_name || "—"],
                    [
                      "Bank Account",
                      [deposit.account_name, deposit.account_number]
                        .filter(Boolean)
                        .join(" · ") || "—",
                    ],
                    ["Reference Number", deposit.reference_number || "—"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-lg border border-slate-200 bg-white p-3"
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        {label}
                      </p>
                      <p className="mt-1 break-words text-sm font-semibold text-slate-800">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mb-5 rounded-lg border border-slate-200">
                  <div className="border-b border-slate-200 px-4 py-3">
                    <h3 className="text-sm font-bold text-slate-800">
                      Saved Checks
                    </h3>
                  </div>

                  {deposit.items.filter(
                    (item) => item.item_type.toUpperCase() === "CHECK"
                  ).length === 0 ? (
                    <p className="px-4 py-5 text-sm text-slate-500">
                      No checks recorded for this deposit.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[680px] text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500">
                          <tr>
                            <th className="px-3 py-2">Type</th>
                            <th className="px-3 py-2">Check No.</th>
                            <th className="px-3 py-2">Date</th>
                            <th className="px-3 py-2">Issuing Bank</th>
                            <th className="px-3 py-2 text-right">Amount</th>
                            <th className="px-3 py-2">Remarks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {deposit.items
                            .filter(
                              (item) =>
                                item.item_type.toUpperCase() === "CHECK"
                            )
                            .map((item) => (
                              <tr
                                key={item.id}
                                className="border-t border-slate-100"
                              >
                                <td className="px-3 py-2">
                                  {String(item.check_type).toUpperCase() ===
                                  "ON_US"
                                    ? "On Us"
                                    : "Local"}
                                </td>
                                <td className="px-3 py-2">
                                  {item.check_number || "—"}
                                </td>
                                <td className="px-3 py-2">
                                  {dateLabel(item.check_date)}
                                </td>
                                <td className="px-3 py-2">
                                  {item.issuing_bank || "—"}
                                </td>
                                <td className="px-3 py-2 text-right font-semibold">
                                  {peso(item.amount)}
                                </td>
                                <td className="px-3 py-2">
                                  {item.check_remarks || item.remarks || "—"}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {deposit.remarks && (
                  <div className="mb-5 rounded-lg bg-slate-50 p-3">
                    <p className="text-xs font-semibold text-slate-500">
                      Deposit Remarks
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                      {deposit.remarks}
                    </p>
                  </div>
                )}

                <div>
                  <h3 className="mb-3 text-sm font-bold text-slate-800">
                    Reprint Deposit Slips
                  </h3>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <button
                      type="button"
                      disabled={Number(deposit.total_cash) <= 0}
                      onClick={() => setPreviewType("CASH")}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-3 text-sm font-semibold text-blue-800 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Banknote size={17} />
                      Cash Slip
                    </button>

                    <button
                      type="button"
                      disabled={!onUsCount}
                      onClick={() => setPreviewType("ON_US")}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-3 text-sm font-semibold text-indigo-800 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Printer size={17} />
                      On Us Checks ({onUsCount})
                    </button>

                    <button
                      type="button"
                      disabled={!localCount}
                      onClick={() => setPreviewType("LOCAL")}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-3 text-sm font-semibold text-orange-800 hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Printer size={17} />
                      Local Checks ({localCount})
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Slip preview */}
          <aside className="flex min-h-[300px] min-w-0 flex-col border-t border-slate-200 bg-slate-50 lg:min-h-0 lg:w-[60%] lg:border-l lg:border-t-0">
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Slip Preview
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Preview and print the displayed slip.
                </p>
              </div>

              {previewType && (
                <button
                  type="button"
                  onClick={() => setPreviewType(null)}
                  className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
                  aria-label="Clear slip preview"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="min-h-0 flex-1 overflow-auto p-3 sm:p-4">
              {!previewType && (
                <div className="flex h-full min-h-[180px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-5 text-center">
                  <Printer size={28} className="mb-2 text-slate-400" />
                  <p className="text-sm font-semibold text-slate-700">
                    No slip selected
                  </p>
                  <p className="mt-1 max-w-xs text-xs text-slate-500">
                    Select a deposit slip to preview it here.
                  </p>
                </div>
              )}

              {previewType === "CASH" && deposit && (
                <PreviewCash deposit={deposit} />
              )}

              {(previewType === "ON_US" || previewType === "LOCAL") &&
                deposit && (
                  <PreviewCheck
                    deposit={deposit}
                    items={previewChecks}
                    checkType={previewType}
                  />
                )}
            </div>
          </aside>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 justify-end border-t border-slate-200 bg-white px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
