"use client";

import {
  X,
  Receipt,
  Calendar,
  User,
  CreditCard,
  PhilippinePeso,
  FileText,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";

import axios from "axios";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

type Props = {
  open: boolean;
  lor: any;
  onClose: () => void;
};

type Transaction = {
  id: string;

  or_number: string;
  receipt_date: string;

  payor: string;
  payment_mode: string;

  grand_total: string | number;

  status: string | null;

  is_cancelled: boolean;
  is_remitted: boolean;

  transaction_type: string;

  collector_name?: string | null;
  encoded_by_name?: string | null;
  posted_by_name?: string | null;

  remarks?: string | null;

  created_at?: string | null;
  posted_at?: string | null;
};

type Summary = {
  transaction_count: number;
  valid_transaction_count: number;
  cancelled_transaction_count: number;
  remitted_transaction_count: number;
  total_amount: string | number;
};

export default function LORTransactionsModal({
  open,
  lor,
  onClose,
}: Props) {
  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  const [loading, setLoading] =
    useState(false);

  const [transactions, setTransactions] =
    useState<Transaction[]>([]);

  const [summary, setSummary] =
    useState<Summary>({
      transaction_count: 0,
      valid_transaction_count: 0,
      cancelled_transaction_count: 0,
      remitted_transaction_count: 0,
      total_amount: 0,
    });

  const [lorDetails, setLorDetails] =
    useState<any>(null);

  const [search, setSearch] =
    useState("");

  const [error, setError] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | Load
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!open || !lor?.id) {
      return;
    }

    setSearch("");
    setError("");

    loadTransactions();
  }, [open, lor?.id]);

  async function loadTransactions() {
    if (!lor?.id) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await axios.get(
        `/api/lor/${lor.id}/transactions`
      );

      setTransactions(
        res.data?.transactions ?? []
      );

      setSummary(
        res.data?.summary ?? {
          transaction_count: 0,
          valid_transaction_count: 0,
          cancelled_transaction_count: 0,
          remitted_transaction_count: 0,
          total_amount: 0,
        }
      );

      setLorDetails(
        res.data?.lor ?? null
      );
    } catch (error: any) {
      console.error(
        "Failed to load LOR transactions:",
        error
      );

      setTransactions([]);

      setError(
        error?.response?.data?.message ??
          "Failed to load transactions."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Search
  |--------------------------------------------------------------------------
  */

  const filteredTransactions =
    useMemo(() => {
      const keyword =
        search
          .trim()
          .toLowerCase();

      if (!keyword) {
        return transactions;
      }

      return transactions.filter(
        (transaction) => {
          return [
            transaction.or_number,
            transaction.payor,
            transaction.payment_mode,
            transaction.transaction_type,
            transaction.status,
            transaction.collector_name,
          ]
            .filter(Boolean)
            .some((value) =>
              String(value)
                .toLowerCase()
                .includes(keyword)
            );
        }
      );
    }, [transactions, search]);

  /*
  |--------------------------------------------------------------------------
  | Don't Render
  |--------------------------------------------------------------------------
  */

  if (!open || !lor) {
    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-6"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        {/* ============================================================
            HEADER
        ============================================================ */}

        <div className="flex items-center justify-between border-b bg-slate-50 px-6 py-5">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <Receipt size={22} />
            </div>

            <div>

              <h2 className="text-xl font-semibold text-slate-800">
                LOR Transactions
              </h2>

              <p className="text-sm text-slate-500">
                {lorDetails?.lor_no ??
                  lor?.lor_no ??
                  "-"}
                {" • "}
                {lorDetails?.form_code ??
                  lor?.form_code ??
                  "-"}
                {" • "}
                {lorDetails?.control_no ??
                  lor?.control_no ??
                  "-"}
              </p>

            </div>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
          >
            <X size={22} />
          </button>

        </div>

        {/* ============================================================
            BODY
        ============================================================ */}

        <div className="flex-1 overflow-y-auto p-6">

          {/* ==========================================================
              LOR INFORMATION
          ========================================================== */}

          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">

            <InfoBox
              icon={<FileText size={17} />}
              label="LOR Number"
              value={
                lorDetails?.lor_no ??
                lor?.lor_no ??
                "-"
              }
            />

            <InfoBox
              icon={<Receipt size={17} />}
              label="Booklet"
              value={
                `${lorDetails?.form_code ??
                  lor?.form_code ??
                  "-"} / ${
                  lorDetails?.control_no ??
                  lor?.control_no ??
                  "-"
                }`
              }
            />

            <InfoBox
              icon={<User size={17} />}
              label="Accountable Officer"
              value={
                lorDetails?.accountable_officer ??
                lor?.accountable_officer ??
                "-"
              }
            />

          </div>

          {/* ==========================================================
              SUMMARY
          ========================================================== */}

          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">

            <SummaryCard
              label="Transactions"
              value={
                summary.transaction_count
              }
            />

            <SummaryCard
              label="Valid"
              value={
                summary.valid_transaction_count
              }
            />

            <SummaryCard
              label="Cancelled"
              value={
                summary.cancelled_transaction_count
              }
            />

            <SummaryCard
              label="Remitted"
              value={
                summary.remitted_transaction_count
              }
            />

            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">

              <div className="text-xs font-medium uppercase tracking-wide text-blue-600">
                Total Collection
              </div>

              <div className="mt-1 text-xl font-bold text-blue-700">
                {formatCurrency(
                  summary.total_amount
                )}
              </div>

            </div>

          </div>

          {/* ==========================================================
              TOOLBAR
          ========================================================== */}

          <div className="mb-4 flex items-center justify-between gap-4">

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search OR, payor, payment mode..."
              className="w-full max-w-md rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <button
              type="button"
              onClick={
                loadTransactions
              }
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>

          </div>

          {/* ==========================================================
              ERROR
          ========================================================== */}

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* ==========================================================
              TABLE
          ========================================================== */}

          <div className="overflow-hidden rounded-xl border">

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-slate-50">

                  <tr className="border-b">

                    <TableHead>
                      OR Number
                    </TableHead>

                    <TableHead>
                      Date
                    </TableHead>

                    <TableHead>
                      Payor
                    </TableHead>

                    <TableHead>
                      Payment
                    </TableHead>

                    <TableHead>
                      Type
                    </TableHead>

                    <TableHead>
                      Status
                    </TableHead>

                    <TableHead>
                      Remittance
                    </TableHead>

                    <TableHead right>
                      Amount
                    </TableHead>

                  </tr>

                </thead>

                <tbody>

                  {loading ? (
                    <tr>

                      <td
                        colSpan={8}
                        className="py-16 text-center"
                      >

                        <div className="flex items-center justify-center gap-2 text-sm text-slate-500">

                          <Loader2
                            size={19}
                            className="animate-spin"
                          />

                          Loading transactions...

                        </div>

                      </td>

                    </tr>
                  ) : filteredTransactions.length ===
                    0 ? (
                    <tr>

                      <td
                        colSpan={8}
                        className="py-16 text-center"
                      >

                        <Receipt
                          size={34}
                          className="mx-auto mb-3 text-slate-300"
                        />

                        <div className="font-medium text-slate-600">
                          No transactions found
                        </div>

                        <div className="mt-1 text-sm text-slate-400">
                          No DIPP transactions are linked to this LOR.
                        </div>

                      </td>

                    </tr>
                  ) : (
                    filteredTransactions.map(
                      (transaction) => (
                        <tr
                          key={
                            transaction.id
                          }
                          className={`border-b transition last:border-b-0 hover:bg-slate-50 ${
                            transaction.is_cancelled
                              ? "bg-red-50/50"
                              : ""
                          }`}
                        >

                          {/* OR */}

                          <td className="whitespace-nowrap px-4 py-3">

                            <div className="font-semibold text-blue-700">
                              {
                                transaction.or_number
                              }
                            </div>

                          </td>

                          {/* DATE */}

                          <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">

                            <div className="flex items-center gap-1.5">

                              <Calendar
                                size={14}
                              />

                              {formatDate(
                                transaction.receipt_date
                              )}

                            </div>

                          </td>

                          {/* PAYOR */}

                          <td className="px-4 py-3">

                            <div className="font-medium text-slate-800">
                              {transaction.payor ||
                                "-"}
                            </div>

                            {transaction.collector_name && (
                              <div className="mt-0.5 text-xs text-slate-400">
                                Collector:{" "}
                                {
                                  transaction.collector_name
                                }
                              </div>
                            )}

                          </td>

                          {/* PAYMENT */}

                          <td className="whitespace-nowrap px-4 py-3 text-sm">

                            <div className="flex items-center gap-1.5 text-slate-600">

                              <CreditCard
                                size={14}
                              />

                              {transaction.payment_mode ||
                                "-"}

                            </div>

                          </td>

                          {/* TYPE */}

                          <td className="whitespace-nowrap px-4 py-3">

                            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                              {transaction.transaction_type ||
                                "-"}
                            </span>

                          </td>

                          {/* STATUS */}

                          <td className="whitespace-nowrap px-4 py-3">

                            {transaction.is_cancelled ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">

                                <XCircle
                                  size={13}
                                />

                                Cancelled

                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">

                                <CheckCircle2
                                  size={13}
                                />

                                {transaction.status ||
                                  "Posted"}

                              </span>
                            )}

                          </td>

                          {/* REMITTANCE */}

                          <td className="whitespace-nowrap px-4 py-3">

                            {transaction.is_remitted ? (
                              <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                                Remitted
                              </span>
                            ) : (
                              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                                Unremitted
                              </span>
                            )}

                          </td>

                          {/* AMOUNT */}

                          <td className="whitespace-nowrap px-4 py-3 text-right">

                            <div
                              className={`font-semibold ${
                                transaction.is_cancelled
                                  ? "text-red-500 line-through"
                                  : "text-slate-800"
                              }`}
                            >
                              {formatCurrency(
                                transaction.grand_total
                              )}
                            </div>

                          </td>

                        </tr>
                      )
                    )
                  )}

                </tbody>

              </table>

            </div>

          </div>

        </div>

        {/* ============================================================
            FOOTER
        ============================================================ */}

        <div className="flex items-center justify-between border-t bg-slate-50 px-6 py-4">

          <div className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {
                filteredTransactions.length
              }
            </span>{" "}
            transaction(s)
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border bg-white px-5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Close
          </button>

        </div>

      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Info Box
|--------------------------------------------------------------------------
*/

function InfoBox({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: any;
}) {
  return (
    <div className="rounded-xl border bg-white p-4">

      <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
        {icon}
        {label}
      </div>

      <div className="font-semibold text-slate-800">
        {value}
      </div>

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Summary Card
|--------------------------------------------------------------------------
*/

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border bg-white p-4">

      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </div>

      <div className="mt-1 text-xl font-bold text-slate-800">
        {value}
      </div>

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Table Header
|--------------------------------------------------------------------------
*/

function TableHead({
  children,
  right = false,
}: {
  children: React.ReactNode;
  right?: boolean;
}) {
  return (
    <th
      className={`whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 ${
        right
          ? "text-right"
          : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

/*
|--------------------------------------------------------------------------
| Format Currency
|--------------------------------------------------------------------------
*/

function formatCurrency(
  value: string | number | null | undefined
) {
  const amount =
    Number(value ?? 0);

  return new Intl.NumberFormat(
    "en-PH",
    {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  ).format(
    Number.isFinite(amount)
      ? amount
      : 0
  );
}

/*
|--------------------------------------------------------------------------
| Format Date
|--------------------------------------------------------------------------
*/

function formatDate(
  value: string | null | undefined
) {
  if (!value) {
    return "-";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    "en-PH",
    {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }
  );
}