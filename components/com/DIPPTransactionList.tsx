"use client";

import { useEffect, useMemo, useState } from "react";

import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    PhilippinePeso,
    Receipt,
    Search,
    X,
} from "lucide-react";

type Props = {
    selectedTransaction?: any | null;
    onSelectTransaction: (transaction: any) => void;
};

const MONTHS = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
];

const ROWS_PER_PAGE = 10;

export default function DippTransactionList({
    selectedTransaction,
    onSelectTransaction,
}: Props) {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedYear, setSelectedYear] = useState("");
    const [selectedMonth, setSelectedMonth] = useState("");
    const [search, setSearch] = useState("");

    const [currentPage, setCurrentPage] = useState(1);

    // ============================================================
    // LOAD TRANSACTIONS
    // ============================================================

    useEffect(() => {
        let mounted = true;

        async function loadTransactions() {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    "/api/com/dipp-transactions",
                    {
                        method: "GET",
                        cache: "no-store",
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        `Failed to load transactions (${response.status})`
                    );
                }

                const data = await response.json();

                if (!mounted) return;

                if (Array.isArray(data)) {
                    setTransactions(data);
                } else if (Array.isArray(data?.data)) {
                    setTransactions(data.data);
                } else {
                    setTransactions([]);
                }
            } catch (err: any) {
                if (!mounted) return;

                console.error(
                    "Failed to load DIPP transactions:",
                    err
                );

                setError(
                    err?.message ||
                        "Failed to load DIPP transactions."
                );
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        }

        loadTransactions();

        return () => {
            mounted = false;
        };
    }, []);

    // ============================================================
    // DATE HELPER
    // ============================================================

    function getTransactionDate(transaction: any): Date | null {
        const rawDate =
            transaction?.receipt_date ??
            transaction?.transaction_date ??
            transaction?.date;

        if (!rawDate) {
            return null;
        }

        const date = new Date(rawDate);

        if (Number.isNaN(date.getTime())) {
            return null;
        }

        return date;
    }

    // ============================================================
    // FORMAT DATE
    // ============================================================

    function formatDate(value: any) {
        if (!value) {
            return "—";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "—";
        }

        return date.toLocaleDateString("en-PH", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
        });
    }

    // ============================================================
    // FORMAT AMOUNT
    // ============================================================

    function formatAmount(value: any) {
        const amount = Number(value ?? 0);

        return amount.toLocaleString("en-PH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }

    // ============================================================
    // AVAILABLE YEARS
    // ONLY YEARS THAT EXIST IN DIPP TRANSACTIONS
    // ============================================================

    const availableYears = useMemo(() => {
        const years = new Set<number>();

        transactions.forEach((transaction) => {
            const date = getTransactionDate(transaction);

            if (date) {
                years.add(date.getFullYear());
            }
        });

        return Array.from(years).sort((a, b) => b - a);
    }, [transactions]);

    // ============================================================
    // FILTER TRANSACTIONS
    // ============================================================

    const filteredTransactions = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();

        return transactions.filter((transaction) => {
            // ----------------------------------------------------
            // YEAR FILTER
            // ----------------------------------------------------

            const date = getTransactionDate(transaction);

            if (selectedYear) {
                if (!date) {
                    return false;
                }

                const transactionYear =
                    date.getFullYear().toString();

                if (transactionYear !== selectedYear) {
                    return false;
                }
            }

            // ----------------------------------------------------
            // MONTH FILTER
            // ----------------------------------------------------

            if (selectedMonth) {
                if (!date) {
                    return false;
                }

                const transactionMonth = String(
                    date.getMonth() + 1
                ).padStart(2, "0");

                if (transactionMonth !== selectedMonth) {
                    return false;
                }
            }

            // ----------------------------------------------------
            // SEARCH
            // ----------------------------------------------------

            if (normalizedSearch) {
                const searchableValues = [
                    transaction?.or_number,
                    transaction?.or_no,
                    transaction?.receipt_number,
                    transaction?.receipt_no,

                    transaction?.payor,
                    transaction?.payor_name,

                    transaction?.remarks,

                    transaction?.payment_mode,
                    transaction?.type,

                    transaction?.fund_code,
                    transaction?.fund,

                    transaction?.encoded_by_name,
                    transaction?.encoded_by,
                    transaction?.officer,

                    transaction?.status,

                    transaction?.id,
                ];

                const matchesSearch = searchableValues.some(
                    (value) =>
                        value !== null &&
                        value !== undefined &&
                        String(value)
                            .toLowerCase()
                            .includes(normalizedSearch)
                );

                if (!matchesSearch) {
                    return false;
                }
            }

            return true;
        });
    }, [
        transactions,
        selectedYear,
        selectedMonth,
        search,
    ]);

    // ============================================================
    // TOTALS
    // THESE FOLLOW THE ACTIVE FILTERS
    // ============================================================

    const totalReceipts = filteredTransactions.length;

    const totalAmount = useMemo(() => {
        return filteredTransactions.reduce(
            (total, transaction) => {
                const amount = Number(
                    transaction?.grand_total ??
                        transaction?.amount ??
                        0
                );

                return total + (Number.isNaN(amount) ? 0 : amount);
            },
            0
        );
    }, [filteredTransactions]);

    // ============================================================
    // PAGINATION
    // ============================================================

    const totalPages = Math.max(
        1,
        Math.ceil(
            filteredTransactions.length / ROWS_PER_PAGE
        )
    );

    const paginatedTransactions = useMemo(() => {
        const startIndex =
            (currentPage - 1) * ROWS_PER_PAGE;

        const endIndex =
            startIndex + ROWS_PER_PAGE;

        return filteredTransactions.slice(
            startIndex,
            endIndex
        );
    }, [filteredTransactions, currentPage]);

    const startRow =
        filteredTransactions.length === 0
            ? 0
            : (currentPage - 1) * ROWS_PER_PAGE + 1;

    const endRow = Math.min(
        currentPage * ROWS_PER_PAGE,
        filteredTransactions.length
    );

    // ============================================================
    // RESET PAGE WHEN FILTERS CHANGE
    // ============================================================

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedYear, selectedMonth, search]);

    // ============================================================
    // MAKE SURE CURRENT PAGE IS VALID
    // ============================================================

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    // ============================================================
    // CLEAR FILTERS
    // ============================================================

    function clearFilters() {
        setSelectedYear("");
        setSelectedMonth("");
        setSearch("");
        setCurrentPage(1);
    }

    const hasFilters =
        selectedYear !== "" ||
        selectedMonth !== "" ||
        search.trim() !== "";

    // ============================================================
    // PAGE NUMBERS
    // ============================================================

    const pageNumbers = useMemo(() => {
        const pages: number[] = [];

        /*
         * Keep the pagination compact when there are many pages.
         */

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }

            return pages;
        }

        pages.push(1);

        if (currentPage > 4) {
            pages.push(-1);
        }

        const start = Math.max(2, currentPage - 1);
        const end = Math.min(
            totalPages - 1,
            currentPage + 1
        );

        for (let i = start; i <= end; i++) {
            if (!pages.includes(i)) {
                pages.push(i);
            }
        }

        if (currentPage < totalPages - 3) {
            pages.push(-1);
        }

        if (!pages.includes(totalPages)) {
            pages.push(totalPages);
        }

        return pages;
    }, [currentPage, totalPages]);

    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {
        return (
            <div className="flex min-h-[300px] items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

                    <p className="text-sm text-slate-500">
                        Loading transactions...
                    </p>
                </div>
            </div>
        );
    }

    // ============================================================
    // ERROR
    // ============================================================

    if (error) {
        return (
            <div className="p-6">
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                    <p className="font-semibold text-red-700">
                        Unable to load transactions
                    </p>

                    <p className="mt-1 text-sm text-red-600">
                        {error}
                    </p>
                </div>
            </div>
        );
    }

    // ============================================================
    // MAIN UI
    // ============================================================

    return (
        <div className="flex h-full min-h-0 flex-col bg-white">
            {/* ================================================== */}
            {/* HEADER */}
            {/* ================================================== */}

            <div className="border-b border-slate-200 bg-white p-4">
                <div className="flex flex-col gap-4">

                    {/* ================================================== */}
                    {/* TITLE + TOTALS */}
                    {/* ================================================== */}

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                        {/* TITLE */}
                        <div>
                            <div className="flex items-center gap-2">
                                <Receipt
                                    className="h-5 w-5 text-blue-600"
                                    strokeWidth={2}
                                />

                                <h2 className="text-lg font-bold text-slate-800">
                                    DIPP Transactions
                                </h2>
                            </div>

                            <p className="mt-1 text-sm text-slate-500">
                                Search and filter system transactions.
                            </p>
                        </div>


                        {/* ================================================== */}
                        {/* TOTALS */}
                        {/* ================================================== */}

                        <div className="grid grid-cols-2 gap-3">

                            {/* TOTAL RECEIPTS */}
                            <div className="min-w-[150px] rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5">
                                <div className="flex items-center gap-3">

                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                                        <Receipt className="h-4 w-4" />
                                    </div>

                                    <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                                            Total Receipts
                                        </p>

                                        <p className="text-lg font-bold leading-tight text-slate-800">
                                            {totalReceipts.toLocaleString("en-PH")}
                                        </p>
                                    </div>

                                </div>
                            </div>


                            {/* TOTAL AMOUNT */}
                            <div className="min-w-[170px] rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5">
                                <div className="flex items-center gap-3">

                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                                        <PhilippinePeso className="h-4 w-4" />
                                    </div>

                                    <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                                            Total Amount
                                        </p>

                                        <p className="text-lg font-bold leading-tight text-slate-800">
                                            ₱ {formatAmount(totalAmount)}
                                        </p>
                                    </div>

                                </div>
                            </div>

                        </div>

                    </div>


                    {/* ================================================== */}
                    {/* FILTERS */}
                    {/* ================================================== */}

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-12">

                        {/* YEAR */}
                        <div className="xl:col-span-2">
                            <label
                                htmlFor="transaction-year"
                                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                            >
                                Year
                            </label>

                            <div className="relative">
                                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                <select
                                    id="transaction-year"
                                    value={selectedYear}
                                    onChange={(e) =>
                                        setSelectedYear(e.target.value)
                                    }
                                    className="w-full appearance-none rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                >
                                    <option value="">
                                        All Years
                                    </option>

                                    {availableYears.map((year) => (
                                        <option
                                            key={year}
                                            value={year}
                                        >
                                            {year}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>


                        {/* MONTH */}
                        <div className="xl:col-span-2">
                            <label
                                htmlFor="transaction-month"
                                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                            >
                                Month
                            </label>

                            <select
                                id="transaction-month"
                                value={selectedMonth}
                                onChange={(e) =>
                                    setSelectedMonth(e.target.value)
                                }
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="">
                                    All Months
                                </option>

                                {MONTHS.map((month) => (
                                    <option
                                        key={month.value}
                                        value={month.value}
                                    >
                                        {month.label}
                                    </option>
                                ))}
                            </select>
                        </div>


                        {/* SEARCH */}
                        <div className="md:col-span-2 xl:col-span-5">
                            <label
                                htmlFor="transaction-search"
                                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                            >
                                Search
                            </label>

                            <div className="relative">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                <input
                                    id="transaction-search"
                                    type="text"
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(e.target.value)
                                    }
                                    placeholder="Receipt no., payor, remarks, fund, officer..."
                                    className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-10 text-sm text-slate-700 outline-none placeholder:text-slate-400 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />

                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => setSearch("")}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                        title="Clear search"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>


                        {/* CLEAR */}
                        <div className="flex items-end xl:col-span-3">
                            <button
                                type="button"
                                onClick={clearFilters}
                                disabled={!hasFilters}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <X className="h-4 w-4" />

                                Clear Filters
                            </button>
                        </div>

                    </div>


                    {/* ================================================== */}
                    {/* ACTIVE FILTER INFO */}
                    {/* ================================================== */}

                    {hasFilters && (
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">

                            <span className="font-semibold text-slate-600">
                                Filtered results:
                            </span>

                            {selectedYear && (
                                <span className="rounded-full bg-blue-50 px-2.5 py-1 font-medium text-blue-700">
                                    Year: {selectedYear}
                                </span>
                            )}

                            {selectedMonth && (
                                <span className="rounded-full bg-blue-50 px-2.5 py-1 font-medium text-blue-700">
                                    Month:{" "}
                                    {
                                        MONTHS.find(
                                            (month) =>
                                                month.value === selectedMonth
                                        )?.label
                                    }
                                </span>
                            )}

                            {search.trim() && (
                                <span className="max-w-full truncate rounded-full bg-blue-50 px-2.5 py-1 font-medium text-blue-700">
                                    Search: "{search.trim()}"
                                </span>
                            )}

                        </div>
                    )}

                </div>
            </div>

            {/* ================================================== */}
            {/* TABLE */}
            {/* ================================================== */}

            <div className="min-h-0 flex-1 overflow-auto">
                <table className="w-full min-w-[1050px] border-collapse">
                    <thead className="sticky top-0 z-10 bg-slate-100">
                        <tr className="border-b border-slate-200">
                            <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                                Receipt No.
                            </th>

                            <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                                Receipt Date
                            </th>

                            <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                                Payor
                            </th>

                            <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                                Remarks
                            </th>

                            <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                                Type
                            </th>

                            <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                                Fund
                            </th>

                            <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                                Officer
                            </th>

                            <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                                Status
                            </th>

                            <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-600">
                                Amount
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                        {paginatedTransactions.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={9}
                                    className="px-4 py-16 text-center"
                                >
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                                            <Receipt className="h-6 w-6 text-slate-400" />
                                        </div>

                                        <p className="font-semibold text-slate-700">
                                            No transactions found
                                        </p>

                                        <p className="mt-1 text-sm text-slate-500">
                                            Try changing your
                                            filters or search
                                            criteria.
                                        </p>

                                        {hasFilters && (
                                            <button
                                                type="button"
                                                onClick={
                                                    clearFilters
                                                }
                                                className="mt-3 text-sm font-semibold text-blue-600 hover:text-blue-700"
                                            >
                                                Clear filters
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            paginatedTransactions.map(
                                (transaction, index) => {
                                    const isSelected =
                                        selectedTransaction?.id ===
                                        transaction?.id;

                                    const amount = Number(
                                        transaction?.grand_total ??
                                            transaction?.amount ??
                                            0
                                    );

                                    return (
                                        <tr
                                            key={
                                                transaction?.id ??
                                                `${currentPage}-${index}`
                                            }
                                            onClick={() =>
                                                onSelectTransaction(
                                                    transaction
                                                )
                                            }
                                            className={`cursor-pointer transition ${
                                                isSelected
                                                    ? "bg-blue-50"
                                                    : "bg-white hover:bg-slate-50"
                                            }`}
                                        >
                                            {/* RECEIPT NUMBER */}
                                            <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-slate-800">
                                                {transaction?.or_number ??
                                                    transaction?.or_no ??
                                                    transaction?.receipt_number ??
                                                    transaction?.receipt_no ??
                                                    "—"}
                                            </td>

                                            {/* RECEIPT DATE */}
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                                                {formatDate(
                                                    transaction?.receipt_date ??
                                                        transaction?.transaction_date ??
                                                        transaction?.date
                                                )}
                                            </td>

                                            {/* PAYOR */}
                                            <td className="max-w-[200px] truncate px-4 py-3 text-sm font-medium text-slate-700">
                                                {transaction?.payor ??
                                                    transaction?.payor_name ??
                                                    "—"}
                                            </td>

                                            {/* REMARKS */}
                                            <td className="max-w-[220px] truncate px-4 py-3 text-sm text-slate-600">
                                                {transaction?.remarks ??
                                                    "—"}
                                            </td>

                                            {/* TYPE */}
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                                                {transaction?.payment_mode ??
                                                    transaction?.type ??
                                                    "—"}
                                            </td>

                                            {/* FUND */}
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                                                {transaction?.fund_code ?? "—"}
                                            </td>

                                            {/* OFFICER */}
                                            <td className="max-w-[180px] truncate px-4 py-3 text-sm text-slate-600">
                                                {transaction?.encoded_by_name ??
                                                    transaction?.encoded_by ??
                                                    transaction?.officer ??
                                                    "—"}
                                            </td>

                                            {/* STATUS */}
                                            <td className="whitespace-nowrap px-4 py-3 text-sm">
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                        String(
                                                            transaction?.status ??
                                                                ""
                                                        ).toUpperCase() ===
                                                        "APPROVED"
                                                            ? "bg-emerald-100 text-emerald-700"
                                                            : String(
                                                                  transaction?.status ??
                                                                      ""
                                                              ).toUpperCase() ===
                                                              "CANCELLED"
                                                            ? "bg-red-100 text-red-700"
                                                            : String(
                                                                  transaction?.status ??
                                                                      ""
                                                              ).toUpperCase() ===
                                                              "VOID"
                                                            ? "bg-red-100 text-red-700"
                                                            : "bg-slate-100 text-slate-700"
                                                    }`}
                                                >
                                                    {transaction?.status ??
                                                        "—"}
                                                </span>
                                            </td>

                                            {/* AMOUNT */}
                                            <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-bold text-slate-800">
                                                ₱{" "}
                                                {formatAmount(
                                                    amount
                                                )}
                                            </td>
                                        </tr>
                                    );
                                }
                            )
                        )}
                    </tbody>
                </table>
            </div>

            {/* ================================================== */}
            {/* PAGINATION FOOTER */}
            {/* ================================================== */}

            <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                {/* SHOWING */}
                <div className="text-sm text-slate-600">
                    Showing{" "}
                    <span className="font-semibold text-slate-800">
                        {startRow}
                    </span>{" "}
                    to{" "}
                    <span className="font-semibold text-slate-800">
                        {endRow}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-slate-800">
                        {filteredTransactions.length}
                    </span>{" "}
                    receipts
                </div>

                {/* PAGINATION */}
                <div className="flex items-center gap-1">
                    {/* PREVIOUS */}
                    <button
                        type="button"
                        disabled={currentPage === 1}
                        onClick={() =>
                            setCurrentPage((page) =>
                                Math.max(1, page - 1)
                            )
                        }
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <ChevronLeft className="h-4 w-4" />

                        <span className="hidden sm:inline">
                            Previous
                        </span>
                    </button>

                    {/* PAGE NUMBERS */}
                    <div className="flex items-center gap-1">
                        {pageNumbers.map(
                            (page, index) =>
                                page === -1 ? (
                                    <span
                                        key={`ellipsis-${index}`}
                                        className="px-2 text-sm text-slate-400"
                                    >
                                        ...
                                    </span>
                                ) : (
                                    <button
                                        key={page}
                                        type="button"
                                        onClick={() =>
                                            setCurrentPage(
                                                page
                                            )
                                        }
                                        className={`min-w-[36px] rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                                            currentPage ===
                                            page
                                                ? "border-blue-600 bg-blue-600 text-white"
                                                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                                        }`}
                                    >
                                        {page}
                                    </button>
                                )
                        )}
                    </div>

                    {/* NEXT */}
                    <button
                        type="button"
                        disabled={
                            currentPage === totalPages
                        }
                        onClick={() =>
                            setCurrentPage((page) =>
                                Math.min(
                                    totalPages,
                                    page + 1
                                )
                            )
                        }
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <span className="hidden sm:inline">
                            Next
                        </span>

                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}