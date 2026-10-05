"use client";

import {
  Loader2,
  RefreshCw,
  CheckSquare,
  Square,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

type FundSource = {
  id: string;
  fund_code?: string;
  fund_name?: string;
  name?: string;
  description?: string;
};

type DIPPTransaction = {
  id: string;
  or_number: string;
  receipt_date: string;
  payor: string;
  payment_mode: string;
  amount: number;
  collector_id: string | null;
};

type Props = {
  fundSourceId: string;
  setFundSourceId: (value: string) => void;

  dateFrom: string;
  setDateFrom: (value: string) => void;

  dateTo: string;
  setDateTo: (value: string) => void;

  selectedTransactionIds: string[];
  onSelectionChange: (ids: string[]) => void;
};

export default function RCDGenerateForm({
  fundSourceId,
  setFundSourceId,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  selectedTransactionIds,
  onSelectionChange,
}: Props) {
  // ============================================================
  // FUND SOURCES
  // ============================================================

  const [
    fundSources,
    setFundSources,
  ] = useState<FundSource[]>([]);

  const [
    loadingFunds,
    setLoadingFunds,
  ] = useState(false);

  // ============================================================
  // TRANSACTIONS
  // ============================================================

  const [
    transactions,
    setTransactions,
  ] = useState<DIPPTransaction[]>([]);

  const [
    loadingTransactions,
    setLoadingTransactions,
  ] = useState(false);

  const [
    transactionError,
    setTransactionError,
  ] = useState("");

  // ============================================================
  // SELECTED TRANSACTION SET
  // ============================================================

  const selectedTransactionIdSet = useMemo(
    () => new Set(selectedTransactionIds),
    [selectedTransactionIds]
  );

  // ============================================================
  // LOAD FUND SOURCES
  // ============================================================

  useEffect(() => {
    loadFundSources();
  }, []);

  async function loadFundSources() {
    try {
      setLoadingFunds(true);

      const response = await fetch(
        "/api/fund-sources",
        {
          method: "GET",
          credentials: "include",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Failed to load fund sources."
        );
      }

      let data: FundSource[] = [];

      if (Array.isArray(result)) {
        data = result;
      } else if (
        Array.isArray(result?.data)
      ) {
        data = result.data;
      } else if (
        Array.isArray(result?.fundSources)
      ) {
        data = result.fundSources;
      }

      setFundSources(data);
    } catch (error) {
      console.error(
        "Fund source error:",
        error
      );

      setFundSources([]);
    } finally {
      setLoadingFunds(false);
    }
  }

  // ============================================================
  // LOAD TRANSACTIONS WHEN FILTER CHANGES
  // ============================================================

  useEffect(() => {
    if (
      !fundSourceId ||
      !dateFrom ||
      !dateTo
    ) {
      setTransactions([]);
      onSelectionChange([]);
      setTransactionError("");
      return;
    }

    if (dateFrom > dateTo) {
      setTransactions([]);
      onSelectionChange([]);

      setTransactionError(
        "Beginning date cannot be later than ending date."
      );

      return;
    }

    loadTransactions();
  }, [
    fundSourceId,
    dateFrom,
    dateTo,
  ]);

  // ============================================================
  // LOAD TRANSACTIONS
  // ============================================================

  async function loadTransactions() {
    try {
      setLoadingTransactions(true);
      setTransactionError("");

      // Clear previous selections whenever
      // the transaction list is reloaded.
      onSelectionChange([]);

      const params =
        new URLSearchParams();

      params.set(
        "fund_source_id",
        fundSourceId
      );

      params.set(
        "date_from",
        dateFrom
      );

      params.set(
        "date_to",
        dateTo
      );

      const url =
        `/api/rcd/transactions?${params.toString()}`;

      console.log(
        "Loading RCD transactions:",
        url
      );

      const response =
        await fetch(
          url,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

      const result =
        await response.json();

      console.log(
        "RCD transactions response:",
        result
      );

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Unable to load transactions."
        );
      }

      const apiTransactions =
        Array.isArray(
          result?.transactions
        )
          ? result.transactions
          : [];

      // ========================================================
      // MAP API RESULT
      // ========================================================

      const formattedTransactions =
        apiTransactions.map(
          (
            transaction: any
          ) => ({
            id:
              transaction.id,

            or_number:
              transaction.or_number ??
              transaction.receipt_number ??
              "",

            receipt_date:
              transaction.receipt_date,

            payor:
              transaction.payor ??
              "",

            payment_mode:
              transaction.payment_mode ??
              "",

            amount:
              Number(
                transaction.amount ??
                  transaction.grand_total ??
                  0
              ),

            collector_id:
              transaction.collector_id ??
              null,
          })
        );

      setTransactions(
        formattedTransactions
      );
    } catch (error) {
      console.error(
        "RCD transaction error:",
        error
      );

      setTransactions([]);

      onSelectionChange([]);

      setTransactionError(
        error instanceof Error
          ? error.message
          : "Unable to load transactions."
      );
    } finally {
      setLoadingTransactions(false);
    }
  }

  // ============================================================
  // DATE FROM
  // ============================================================

  function handleDateFromChange(
    value: string
  ) {
    setDateFrom(value);

    if (
      dateTo &&
      value &&
      value > dateTo
    ) {
      setDateTo(value);
    }
  }

  // ============================================================
  // DATE TO
  // ============================================================

  function handleDateToChange(
    value: string
  ) {
    if (
      dateFrom &&
      value &&
      value < dateFrom
    ) {
      setDateTo(dateFrom);
      return;
    }

    setDateTo(value);
  }

  // ============================================================
  // FUND SOURCE LABEL
  // ============================================================

  function getFundSourceLabel(
    fund: FundSource
  ) {
    const code =
      fund.fund_code || "";

    const name =
      fund.fund_name ||
      fund.name ||
      fund.description ||
      "";

    if (
      code &&
      name
    ) {
      return `${code} - ${name}`;
    }

    return (
      code ||
      name
    );
  }

  // ============================================================
  // CURRENCY
  // ============================================================

  function formatCurrency(
    value: number | string
  ) {
    return new Intl.NumberFormat(
      "en-PH",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    ).format(
      Number(
        value || 0
      )
    );
  }

  // ============================================================
  // DATE
  // ============================================================

  function formatDate(
    value: string
  ) {
    if (!value) {
      return "-";
    }

    const date =
      new Date(
        `${value}T00:00:00`
      );

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
        month: "2-digit",
        day: "2-digit",
      }
    );
  }

  // ============================================================
  // SELECT / DESELECT ONE TRANSACTION
  // ============================================================

  function toggleTransaction(
    transactionId: string
  ) {
    if (
      selectedTransactionIdSet.has(
        transactionId
      )
    ) {
      onSelectionChange(
        selectedTransactionIds.filter(
          (id) =>
            id !== transactionId
        )
      );
    } else {
      onSelectionChange([
        ...selectedTransactionIds,
        transactionId,
      ]);
    }
  }

  // ============================================================
  // SELECT ALL
  // ============================================================

  function selectAllTransactions() {
    onSelectionChange(
      transactions.map(
        (transaction) =>
          transaction.id
      )
    );
  }

  // ============================================================
  // CLEAR ALL
  // ============================================================

  function clearAllTransactions() {
    onSelectionChange([]);
  }

  // ============================================================
  // SELECT ALL STATE
  // ============================================================

  const allSelected =
    transactions.length > 0 &&
    selectedTransactionIds.length ===
      transactions.length;

  const someSelected =
    selectedTransactionIds.length > 0 &&
    selectedTransactionIds.length <
      transactions.length;

  // ============================================================
  // SELECTED TRANSACTIONS
  // ============================================================

  const selectedTransactions =
    useMemo(() => {
      return transactions.filter(
        (transaction) =>
          selectedTransactionIdSet.has(
            transaction.id
          )
      );
    }, [
      transactions,
      selectedTransactionIdSet,
    ]);

  // ============================================================
  // SELECTED TOTAL
  // ============================================================

  const selectedTotal =
    useMemo(() => {
      return selectedTransactions.reduce(
        (
          sum,
          transaction
        ) =>
          sum +
          Number(
            transaction.amount || 0
          ),
        0
      );
    }, [
      selectedTransactions,
    ]);

  // ============================================================
  // SELECTED FUND SOURCE
  // ============================================================

  const selectedFundSource =
    fundSources.find(
      (fund) =>
        String(
          fund.id
        ) ===
        String(
          fundSourceId
        )
    );

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-6">

      {/* ======================================================
          FORM HEADER
      ====================================================== */}

      <div>
        <h3 className="text-base font-bold text-slate-900">
          RCD Information
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Select the fund source and period
          covered by the RCD.
        </p>
      </div>

      {/* ======================================================
          FUND SOURCE
      ====================================================== */}

      <div className="space-y-2">

        <label
          htmlFor="rcd-fund-source"
          className="block text-sm font-semibold text-slate-700"
        >
          Fund Source

          <span className="ml-1 text-red-500">
            *
          </span>
        </label>

        <select
          id="rcd-fund-source"
          value={fundSourceId}
          onChange={(event) =>
            setFundSourceId(
              event.target.value
            )
          }
          disabled={loadingFunds}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
        >

          <option value="">
            {loadingFunds
              ? "Loading..."
              : "Select Fund Source"}
          </option>

          {fundSources.map(
            (fund) => (
              <option
                key={fund.id}
                value={fund.id}
              >
                {getFundSourceLabel(
                  fund
                )}
              </option>
            )
          )}

        </select>

      </div>

      {/* ======================================================
          DATE RANGE
      ====================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

        {/* FROM */}

        <div className="space-y-2">

          <label
            htmlFor="rcd-date-from"
            className="block text-sm font-semibold text-slate-700"
          >
            From Date

            <span className="ml-1 text-red-500">
              *
            </span>
          </label>

          <input
            id="rcd-date-from"
            type="date"
            value={dateFrom}
            onChange={(event) =>
              handleDateFromChange(
                event.target.value
              )
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

        </div>

        {/* TO */}

        <div className="space-y-2">

          <label
            htmlFor="rcd-date-to"
            className="block text-sm font-semibold text-slate-700"
          >
            To Date

            <span className="ml-1 text-red-500">
              *
            </span>
          </label>

          <input
            id="rcd-date-to"
            type="date"
            value={dateTo}
            min={
              dateFrom ||
              undefined
            }
            onChange={(event) =>
              handleDateToChange(
                event.target.value
              )
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

        </div>

      </div>

      {/* ======================================================
          SELECTED INFORMATION
      ====================================================== */}

      {fundSourceId &&
        dateFrom &&
        dateTo && (

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">

            <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
              Selected RCD Period
            </p>

            <p className="mt-1 text-sm font-semibold text-blue-900">
              {selectedFundSource
                ? getFundSourceLabel(
                    selectedFundSource
                  )
                : "-"}
            </p>

            <p className="mt-1 text-sm text-blue-800">
              {formatDate(
                dateFrom
              )}
              {" — "}
              {formatDate(
                dateTo
              )}
            </p>

          </div>

        )}

      {/* ======================================================
          TRANSACTION ERROR
      ====================================================== */}

      {transactionError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {transactionError}
        </div>
      )}

      {/* ======================================================
          TRANSACTION RESULT
      ====================================================== */}

      <div className="overflow-hidden rounded-xl border bg-white">

        {/* ====================================================
            RESULT HEADER
        ==================================================== */}

        <div className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <h4 className="text-sm font-bold text-slate-900">
              Transactions
            </h4>

            <p className="text-xs text-slate-500">
              Select the transactions to include
              in this RCD.
            </p>

          </div>

          <button
            type="button"
            onClick={
              loadTransactions
            }
            disabled={
              loadingTransactions ||
              !fundSourceId ||
              !dateFrom ||
              !dateTo
            }
            className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            title="Refresh"
          >

            <RefreshCw
              size={15}
              className={
                loadingTransactions
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh

          </button>

        </div>

        {/* ====================================================
            SELECTION SUMMARY
        ==================================================== */}

        {!loadingTransactions &&
          transactions.length > 0 && (

            <div className="flex flex-col gap-3 border-b bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">

              <div className="text-sm">

                <span className="font-bold text-slate-900">
                  {
                    selectedTransactionIds.length
                  }
                </span>

                <span className="text-slate-500">
                  {" "}
                  of{" "}
                </span>

                <span className="font-bold text-slate-900">
                  {
                    transactions.length
                  }
                </span>

                <span className="text-slate-500">
                  {" "}
                  transaction
                  {transactions.length !== 1
                    ? "s"
                    : ""}{" "}
                  selected
                </span>

              </div>

              <div className="flex gap-2">

                <button
                  type="button"
                  onClick={
                    selectAllTransactions
                  }
                  disabled={
                    allSelected
                  }
                  className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Select All
                </button>

                <button
                  type="button"
                  onClick={
                    clearAllTransactions
                  }
                  disabled={
                    selectedTransactionIds.length ===
                    0
                  }
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Clear All
                </button>

              </div>

            </div>
          )}

        {/* ====================================================
            TABLE
        ==================================================== */}

        <div className="max-h-[420px] overflow-auto">

          <table className="w-full min-w-[800px] border-collapse text-xs">

            <thead className="sticky top-0 z-10 bg-slate-100">

              <tr className="border-b">

                {/* SELECT ALL */}

                <th className="w-12 px-3 py-3 text-center">

                  <button
                    type="button"
                    onClick={
                      allSelected
                        ? clearAllTransactions
                        : selectAllTransactions
                    }
                    disabled={
                      transactions.length ===
                      0
                    }
                    className="inline-flex items-center justify-center text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
                    title={
                      allSelected
                        ? "Deselect all"
                        : "Select all"
                    }
                  >

                    {allSelected ? (
                      <CheckSquare
                        size={18}
                      />
                    ) : someSelected ? (
                      <div className="relative flex h-[18px] w-[18px] items-center justify-center rounded border-2 border-blue-600">
                        <div className="h-2 w-2 rounded-sm bg-blue-600" />
                      </div>
                    ) : (
                      <Square
                        size={18}
                      />
                    )}

                  </button>

                </th>

                <th className="px-3 py-3 text-left font-bold">
                  #
                </th>

                <th className="px-3 py-3 text-left font-bold">
                  OR No.
                </th>

                <th className="px-3 py-3 text-left font-bold">
                  Date
                </th>

                <th className="px-3 py-3 text-left font-bold">
                  Payor
                </th>

                <th className="px-3 py-3 text-left font-bold">
                  Mode
                </th>

                <th className="px-3 py-3 text-right font-bold">
                  Amount
                </th>

              </tr>

            </thead>

            <tbody>

              {/* LOADING */}

              {loadingTransactions && (

                <tr>

                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center"
                  >

                    <div className="flex items-center justify-center gap-2 text-slate-500">

                      <Loader2
                        size={18}
                        className="animate-spin"
                      />

                      Loading transactions...

                    </div>

                  </td>

                </tr>

              )}

              {/* NO SELECTION */}

              {!loadingTransactions &&
                (
                  !fundSourceId ||
                  !dateFrom ||
                  !dateTo
                ) && (

                  <tr>

                    <td
                      colSpan={7}
                      className="px-4 py-10 text-center text-slate-400"
                    >
                      Select a fund source
                      and date range.
                    </td>

                  </tr>

                )}

              {/* NO RESULTS */}

              {!loadingTransactions &&
                fundSourceId &&
                dateFrom &&
                dateTo &&
                transactions.length ===
                  0 && (

                  <tr>

                    <td
                      colSpan={7}
                      className="px-4 py-10 text-center"
                    >

                      <p className="font-semibold text-slate-600">
                        No transactions
                        found
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        No unremitted
                        transactions
                        are available
                        for this
                        selection.
                      </p>

                    </td>

                  </tr>

                )}

              {/* RESULTS */}

              {!loadingTransactions &&
                transactions.map(
                  (
                    transaction,
                    index
                  ) => {

                    const isSelected =
                      selectedTransactionIdSet.has(
                        transaction.id
                      );

                    return (
                      <tr
                        key={
                          transaction.id
                        }
                        className={`border-b last:border-b-0 hover:bg-slate-50 ${
                          isSelected
                            ? "bg-blue-50/50"
                            : ""
                        }`}
                      >

                        {/* CHECKBOX */}

                        <td className="px-3 py-2.5 text-center">

                          <button
                            type="button"
                            onClick={() =>
                              toggleTransaction(
                                transaction.id
                              )
                            }
                            className="inline-flex items-center justify-center text-blue-600"
                            aria-label={
                              isSelected
                                ? "Deselect transaction"
                                : "Select transaction"
                            }
                          >

                            {isSelected ? (
                              <CheckSquare
                                size={18}
                              />
                            ) : (
                              <Square
                                size={18}
                              />
                            )}

                          </button>

                        </td>

                        {/* NUMBER */}

                        <td className="px-3 py-2.5 text-slate-500">
                          {index + 1}
                        </td>

                        {/* OR NUMBER */}

                        <td className="px-3 py-2.5 font-semibold text-slate-900">
                          {
                            transaction.or_number
                          }
                        </td>

                        {/* DATE */}

                        <td className="whitespace-nowrap px-3 py-2.5 text-slate-600">
                          {formatDate(
                            transaction.receipt_date
                          )}
                        </td>

                        {/* PAYOR */}

                        <td className="max-w-[180px] truncate px-3 py-2.5 text-slate-700">
                          {
                            transaction.payor
                          }
                        </td>

                        {/* MODE */}

                        <td className="px-3 py-2.5 text-slate-600">
                          {
                            transaction.payment_mode
                          }
                        </td>

                        {/* AMOUNT */}

                        <td className="whitespace-nowrap px-3 py-2.5 text-right font-semibold text-slate-900">
                          ₱{" "}
                          {formatCurrency(
                            transaction.amount
                          )}
                        </td>

                      </tr>
                    );
                  }
                )}

            </tbody>

            {/* TOTAL */}

            {!loadingTransactions &&
              selectedTransactions.length >
                0 && (

                <tfoot>

                  <tr className="border-t-2 border-slate-800 bg-slate-50">

                    <td
                      colSpan={6}
                      className="px-3 py-3 text-right font-bold"
                    >
                      SELECTED TOTAL
                    </td>

                    <td className="px-3 py-3 text-right font-bold">
                      ₱{" "}
                      {formatCurrency(
                        selectedTotal
                      )}
                    </td>

                  </tr>

                </tfoot>

              )}

          </table>

        </div>

        {/* ======================================================
            RESULT COUNT
        ====================================================== */}

        {!loadingTransactions &&
          transactions.length > 0 && (

            <div className="border-t bg-slate-50 px-4 py-3">

              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">

                <p className="text-xs text-slate-500">

                  <span className="font-bold text-slate-800">
                    {
                      transactions.length
                    }
                  </span>{" "}

                  transaction
                  {transactions.length !==
                  1
                    ? "s"
                    : ""}{" "}
                  available

                </p>

                <p className="text-xs text-slate-500">

                  Selected:

                  <span className="ml-1 font-bold text-blue-700">
                    {
                      selectedTransactions.length
                    }
                  </span>

                  <span className="mx-1">
                    |
                  </span>

                  Total:

                  <span className="ml-1 font-bold text-slate-900">
                    ₱{" "}
                    {formatCurrency(
                      selectedTotal
                    )}
                  </span>

                </p>

              </div>

            </div>

          )}

      </div>

      {/* ======================================================
          RCD SELECTION STATUS
      ====================================================== */}

      {transactions.length > 0 && (

        <div
          className={`rounded-lg border p-4 ${
            selectedTransactions.length >
            0
              ? "border-green-200 bg-green-50"
              : "border-amber-200 bg-amber-50"
          }`}
        >

          {selectedTransactions.length >
          0 ? (

            <>

              <p className="text-sm font-bold text-green-800">
                Ready for RCD
              </p>

              <p className="mt-1 text-sm text-green-700">

                {
                  selectedTransactions.length
                }{" "}
                transaction
                {selectedTransactions.length !==
                1
                  ? "s"
                  : ""}{" "}
                selected with a total of{" "}

                <span className="font-bold">
                  ₱{" "}
                  {formatCurrency(
                    selectedTotal
                  )}
                </span>

              </p>

            </>

          ) : (

            <>

              <p className="text-sm font-bold text-amber-800">
                No transactions selected
              </p>

              <p className="mt-1 text-sm text-amber-700">
                Select at least one
                transaction to include
                in the RCD.
              </p>

            </>

          )}

        </div>

      )}

    </div>
  );
}