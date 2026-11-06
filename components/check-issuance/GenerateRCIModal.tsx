"use client";

import { useEffect, useMemo, useState } from "react";
import {
  X,
  FileText,
  Printer,
  Search,
  Loader2,
  CalendarDays,
  Building2,
  FileCheck,
} from "lucide-react";

type BankAccount = {
  id: string;
  bank_id: string;
  bank_name: string;
  bank_code: string;
  account_number: string;
  account_name: string;
};

type RCITransaction = {
  id: string;
  check_number: string;
  check_date: string;
  dv_no: string | null;
  payee: string;
  particulars: string | null;
  total_amount: number | string;
  status: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
  accounts?: T;
};

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });
}

function formatDateInput(value: string) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10);
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function GenerateRCIModal({
  open,
  onClose,
}: Props) {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState("");

  const [selectedDate, setSelectedDate] = useState(
    formatDateInput(new Date().toISOString())
  );

  const [transactions, setTransactions] = useState<
    RCITransaction[]
  >([]);

  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [loadingTransactions, setLoadingTransactions] =
    useState(false);

  const [generated, setGenerated] = useState(false);
  const [error, setError] = useState("");

  const selectedBankAccount = useMemo(
    () => accounts.find((account) => account.id === selectedAccount),
    [accounts, selectedAccount]
  );

  const totalAmount = useMemo(
    () =>
      transactions.reduce(
        (sum, transaction) =>
          sum + (Number(transaction.total_amount) || 0),
        0
      ),
    [transactions]
  );

  // LOAD BANK ACCOUNTS
  useEffect(() => {
    if (!open) return;

    let active = true;

    async function loadAccounts() {
      setLoadingAccounts(true);
      setError("");

      try {
        const response = await fetch(
          "/api/check-issuance/rci",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const result: ApiResponse<BankAccount[]> =
          await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.error || "Failed to load bank accounts."
          );
        }

        if (active) {
          const accountList = Array.isArray(result.accounts)
            ? result.accounts
            : [];

          setAccounts(accountList);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load bank accounts."
          );
        }
      } finally {
        if (active) setLoadingAccounts(false);
      }
    }

    void loadAccounts();

    return () => {
      active = false;
    };
  }, [open]);

  // RESET WHEN MODAL OPENS
  useEffect(() => {
    if (!open) return;

    setSelectedAccount("");
    setSelectedDate(formatDateInput(new Date().toISOString()));
    setTransactions([]);
    setGenerated(false);
    setError("");
  }, [open]);

  // FETCH CHECK ISSUANCE TRANSACTIONS
  async function handleLoadTransactions() {
    if (!selectedAccount) {
      setError("Please select a bank account.");
      return;
    }

    if (!selectedDate) {
      setError("Please select a check date.");
      return;
    }

    setLoadingTransactions(true);
    setError("");
    setGenerated(false);
    setTransactions([]);

    try {
      const params = new URLSearchParams({
        bank_account_id: selectedAccount,
        date: selectedDate,
      });

      const response = await fetch(
        `/api/check-issuance/rci?${params.toString()}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const result: ApiResponse<RCITransaction[]> =
        await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Failed to retrieve check transactions."
        );
      }

      setTransactions(
        Array.isArray(result.data) ? result.data : []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load check transactions."
      );
    } finally {
      setLoadingTransactions(false);
    }
  }

  function handleGenerateRCI() {
    if (!selectedAccount || !selectedDate) {
      setError("Select a bank account and date first.");
      return;
    }

    if (transactions.length === 0) {
      setError("There are no check transactions to generate.");
      return;
    }

    setGenerated(true);
    setError("");
  }

  function handlePrint() {
    if (!generated || transactions.length === 0) return;

    window.print();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9000] flex items-center justify-center bg-black/50 p-2 sm:p-4">
      <div className="flex max-h-[95vh] w-full max-w-[1500px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl">

        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-900 text-white">
              <FileCheck size={21} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Generate RCI
              </h2>

              <p className="text-xs text-slate-500">
                Report of Checks Issued
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            aria-label="Close modal"
          >
            <X size={21} />
          </button>
        </div>

        {/* BODY */}
        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-[390px_minmax(0,1fr)]">

          {/* LEFT PANEL */}
          <div className="border-b border-slate-200 bg-slate-50 p-4 lg:overflow-y-auto lg:border-b-0 lg:border-r">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-slate-800">
                RCI Parameters
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Select the bank account and check date.
              </p>
            </div>

            {/* BANK ACCOUNT */}
            <div className="mb-4">
              <label className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-700">
                <Building2 size={15} />
                Bank Account
              </label>

              <select
                value={selectedAccount}
                onChange={(event) => {
                  setSelectedAccount(event.target.value);
                  setTransactions([]);
                  setGenerated(false);
                  setError("");
                }}
                disabled={loadingAccounts}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
              >
                <option value="">
                  {loadingAccounts
                    ? "Loading bank accounts..."
                    : "Select bank account"}
                </option>

                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.bank_code || account.bank_name}
                    {" - "}
                    {account.account_number}
                    {" - "}
                    {account.account_name}
                  </option>
                ))}
              </select>
            </div>

            {/* DATE */}
            <div className="mb-4">
              <label className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-700">
                <CalendarDays size={15} />
                Check Date
              </label>

              <input
                type="date"
                value={selectedDate}
                onChange={(event) => {
                  setSelectedDate(event.target.value);
                  setTransactions([]);
                  setGenerated(false);
                  setError("");
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* LOAD BUTTON */}
            <button
              type="button"
              onClick={handleLoadTransactions}
              disabled={
                loadingTransactions ||
                loadingAccounts ||
                !selectedAccount ||
                !selectedDate
              }
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingTransactions ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Search size={16} />
              )}

              {loadingTransactions
                ? "Loading Transactions..."
                : "Load Transactions"}
            </button>

            {/* ERROR */}
            {error && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
              </div>
            )}

            {/* TRANSACTION LIST */}
            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-600">
                  Check Issuance Transactions
                </h3>

                <span className="rounded-full bg-blue-100 px-2 py-1 text-[10px] font-bold text-blue-800">
                  {transactions.length} records
                </span>
              </div>

              {loadingTransactions ? (
                <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
                  <Loader2
                    size={24}
                    className="mx-auto animate-spin text-blue-700"
                  />

                  <p className="mt-2 text-xs text-slate-500">
                    Retrieving check transactions...
                  </p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
                  <FileText
                    size={25}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-2 text-xs font-semibold text-slate-600">
                    No transactions loaded
                  </p>

                  <p className="mt-1 text-[11px] text-slate-400">
                    Select an account and date, then load transactions.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="rounded-lg border border-slate-200 bg-white p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="break-words text-xs font-bold text-slate-800">
                            {transaction.payee}
                          </p>

                          <p className="mt-1 text-[11px] text-slate-500">
                            Check No. {transaction.check_number}
                          </p>

                          <p className="text-[11px] text-slate-500">
                            DV No. {transaction.dv_no || "—"}
                          </p>
                        </div>

                        <p className="shrink-0 text-xs font-bold text-slate-800">
                          {formatCurrency(transaction.total_amount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* GENERATE BUTTON */}
            <div className="mt-5 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={handleGenerateRCI}
                disabled={
                  transactions.length === 0 ||
                  loadingTransactions ||
                  generated
                }
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FileCheck size={17} />
                Generate RCI
              </button>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="min-w-0 bg-slate-100 p-4 lg:overflow-y-auto lg:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  RCI Preview
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Preview the report before printing.
                </p>
              </div>

              <button
                type="button"
                onClick={handlePrint}
                disabled={!generated}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Printer size={16} />
                Print RCI
              </button>
            </div>

            {!generated ? (
              <div className="flex min-h-[450px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
                <div>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-300">
                    <FileText size={32} />
                  </div>

                  <h3 className="mt-4 text-sm font-bold text-slate-700">
                    RCI Preview
                  </h3>

                  <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-slate-500">
                    Select a bank account and check date, load the
                    transactions, then click Generate RCI to display
                    the report here.
                  </p>
                </div>
              </div>
            ) : (
              <div
                id="rci-print-area"
                className="rci-paper mx-auto min-h-[500px] w-full max-w-[950px] bg-white p-6 shadow-sm sm:p-10"
              >
                {/* REPORT HEADER */}
                <div className="text-center">
                  <p className="text-xs">
                    Republic of the Philippines
                  </p>

                  <p className="text-xs font-semibold">
                    MUNICIPALITY OF TAYTAY
                  </p>

                  <p className="mt-4 text-sm font-bold uppercase tracking-wide">
                    Report of Checks Issued
                  </p>
                </div>

                {/* REPORT DETAILS */}
                <div className="mt-8 grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
                  <div>
                    <span className="font-semibold">Bank:</span>{" "}
                    {selectedBankAccount?.bank_name || "—"}
                  </div>

                  <div>
                    <span className="font-semibold">
                      Bank Account:
                    </span>{" "}
                    {selectedBankAccount?.account_number || "—"}
                  </div>

                  <div>
                    <span className="font-semibold">
                      Account Name:
                    </span>{" "}
                    {selectedBankAccount?.account_name || "—"}
                  </div>

                  <div>
                    <span className="font-semibold">Date:</span>{" "}
                    {formatDate(selectedDate)}
                  </div>
                </div>

                {/* REPORT TABLE */}
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full border-collapse text-[10px] sm:text-xs">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="border border-slate-400 px-2 py-2 text-center">
                          No.
                        </th>

                        <th className="border border-slate-400 px-2 py-2 text-left">
                          Check No.
                        </th>

                        <th className="border border-slate-400 px-2 py-2 text-left">
                          DV No.
                        </th>

                        <th className="border border-slate-400 px-2 py-2 text-left">
                          Payee
                        </th>

                        <th className="border border-slate-400 px-2 py-2 text-left">
                          Particulars
                        </th>

                        <th className="border border-slate-400 px-2 py-2 text-right">
                          Amount
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {transactions.map((transaction, index) => (
                        <tr key={transaction.id}>
                          <td className="border border-slate-400 px-2 py-2 text-center">
                            {index + 1}
                          </td>

                          <td className="border border-slate-400 px-2 py-2">
                            {transaction.check_number}
                          </td>

                          <td className="border border-slate-400 px-2 py-2">
                            {transaction.dv_no || "—"}
                          </td>

                          <td className="border border-slate-400 px-2 py-2">
                            {transaction.payee}
                          </td>

                          <td className="border border-slate-400 px-2 py-2">
                            {transaction.particulars || "—"}
                          </td>

                          <td className="border border-slate-400 px-2 py-2 text-right">
                            {formatCurrency(transaction.total_amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>

                    <tfoot>
                      <tr className="font-bold">
                        <td
                          colSpan={5}
                          className="border border-slate-400 px-2 py-3 text-right"
                        >
                          TOTAL
                        </td>

                        <td className="border border-slate-400 px-2 py-3 text-right">
                          {formatCurrency(totalAmount)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* REPORT FOOTER */}
                <div className="mt-10 grid grid-cols-2 gap-8 text-xs">
                  <div>
                    <p className="mb-10">Prepared by:</p>
                    <div className="border-t border-slate-700 pt-1">
                      <p className="font-semibold">
                        Prepared By
                      </p>
                      <p className="text-[10px]">
                        Designation
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="mb-10">Certified correct:</p>
                    <div className="border-t border-slate-700 pt-1">
                      <p className="font-semibold">
                        Certified Correct By
                      </p>
                      <p className="text-[10px]">
                        Designation
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 text-center text-[9px] text-slate-400">
                  End of Report
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end border-t border-slate-200 bg-white px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>

      {/* PRINT STYLES */}
      <style jsx global>{`
        @media print {
          @page {
            size: landscape;
            margin: 12mm;
          }

          body * {
            visibility: hidden !important;
          }

          #rci-print-area,
          #rci-print-area * {
            visibility: visible !important;
          }

          #rci-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: none !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            background: white !important;
          }

          #rci-print-area table {
            page-break-inside: auto;
          }

          #rci-print-area tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
        }
      `}</style>
    </div>
  );
}