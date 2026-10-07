"use client";

import {
    ChevronLeft,
    ChevronRight,
    FileText,
    Receipt,
    Search,
    X,
} from "lucide-react";

import {
    useCallback,
    useEffect,
    useState,
} from "react";

interface Transaction {
    id: string;
    or_number: string;
    payor: string;
    transaction_type: string;
    grand_total: number | string;
    receipt_date: string;
    created_at?: string;
    status?: string | null;
    is_cancelled?: boolean;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

interface TransactionsResponse {
    success: boolean;
    transactions?: Transaction[];
    pagination?: Pagination;
    message?: string;
}

function formatCurrency(
    value: number | string
) {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(value) || 0);
}

function formatDate(value: string) {
    if (!value) {
        return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function getTransactionType(type: string) {
    const normalized =
        type?.toUpperCase() || "";

    if (
        normalized === "CTC-BARANGAY" ||
        normalized.includes("CTC")
    ) {
        return {
            label: "CTC",
            className:
                "bg-blue-50 text-blue-700",
        };
    }

    if (
        normalized === "AF51" ||
        normalized.includes("AF51")
    ) {
        return {
            label: "AF51",
            className:
                "bg-orange-50 text-orange-700",
        };
    }

    return {
        label: type || "Other",
        className:
            "bg-slate-100 text-slate-700",
    };
}

export default function BarangayRecentTransactions() {
    const [transactions, setTransactions] =
        useState<Transaction[]>([]);

    const [pagination, setPagination] =
        useState<Pagination>({
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
        });

    const [search, setSearch] =
        useState("");

    const [searchInput, setSearchInput] =
        useState("");

    const [dateFrom, setDateFrom] =
        useState("");

    const [dateTo, setDateTo] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    /*
     * =========================================================
     * LOAD TRANSACTIONS
     * =========================================================
     */

    const loadTransactions =
        useCallback(
            async (
                selectedPage = 1
            ) => {
                try {
                    setLoading(true);
                    setError("");

                    const params =
                        new URLSearchParams();

                    params.set(
                        "page",
                        String(selectedPage)
                    );

                    params.set(
                        "limit",
                        "10"
                    );

                    if (search) {
                        params.set(
                            "search",
                            search
                        );
                    }

                    if (dateFrom) {
                        params.set(
                            "dateFrom",
                            dateFrom
                        );
                    }

                    if (dateTo) {
                        params.set(
                            "dateTo",
                            dateTo
                        );
                    }

                    const response =
                        await fetch(
                            `/api/barangays/transactions?${params.toString()}`,
                            {
                                method: "GET",
                                credentials:
                                    "include",
                                cache: "no-store",
                            }
                        );

                    const data: TransactionsResponse =
                        await response.json();

                    if (
                        !response.ok ||
                        !data.success
                    ) {
                        throw new Error(
                            data.message ||
                                "Failed to load transactions."
                        );
                    }

                    setTransactions(
                        data.transactions || []
                    );

                    if (data.pagination) {
                        setPagination(
                            data.pagination
                        );
                    }
                } catch (err) {
                    console.error(
                        "Failed to load transactions:",
                        err
                    );

                    setError(
                        err instanceof Error
                            ? err.message
                            : "Failed to load transactions."
                    );

                    setTransactions([]);
                } finally {
                    setLoading(false);
                }
            },
            [
                search,
                dateFrom,
                dateTo,
            ]
        );

    /*
     * =========================================================
     * INITIAL LOAD
     * =========================================================
     */

    useEffect(() => {
        loadTransactions(1);
    }, [loadTransactions]);

    /*
     * =========================================================
     * SEARCH
     * =========================================================
     */

    function handleSearch() {
        setSearch(
            searchInput.trim()
        );
    }

    function handleClearFilters() {
        setSearchInput("");
        setSearch("");
        setDateFrom("");
        setDateTo("");
    }

    const hasFilters =
        search !== "" ||
        dateFrom !== "" ||
        dateTo !== "" ||
        searchInput !== "";

    /*
     * =========================================================
     * PAGINATION
     * =========================================================
     */

    function handlePreviousPage() {
        if (pagination.page <= 1) {
            return;
        }

        loadTransactions(
            pagination.page - 1
        );
    }

    function handleNextPage() {
        if (
            pagination.page >=
            pagination.totalPages
        ) {
            return;
        }

        loadTransactions(
            pagination.page + 1
        );
    }

    /*
     * =========================================================
     * RENDER
     * =========================================================
     */

    return (
        <div className="w-full">

            {/* =================================================
                FILTERS
            ================================================== */}

            <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4">

                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">

                    {/* SEARCH */}

                    <div className="md:col-span-5">

                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                            Search
                        </label>

                        <div className="relative">

                            <Search
                                className="
                                    absolute
                                    left-3
                                    top-1/2
                                    -translate-y-1/2
                                    w-4
                                    h-4
                                    text-slate-400
                                "
                            />

                            <input
                                type="text"
                                value={searchInput}
                                onChange={(event) =>
                                    setSearchInput(
                                        event.target.value
                                    )
                                }
                                onKeyDown={(event) => {
                                    if (
                                        event.key ===
                                        "Enter"
                                    ) {
                                        handleSearch();
                                    }
                                }}
                                placeholder="Search OR number or payor..."
                                className="
                                    w-full
                                    rounded-lg
                                    border
                                    border-slate-300
                                    bg-white
                                    pl-9
                                    pr-3
                                    py-2.5
                                    text-sm
                                    text-slate-700
                                    outline-none
                                    focus:border-blue-500
                                    focus:ring-2
                                    focus:ring-blue-100
                                "
                            />

                        </div>

                    </div>

                    {/* DATE FROM */}

                    <div className="md:col-span-3">

                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                            Date From
                        </label>

                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(event) =>
                                setDateFrom(
                                    event.target.value
                                )
                            }
                            className="
                                w-full
                                rounded-lg
                                border
                                border-slate-300
                                bg-white
                                px-3
                                py-2.5
                                text-sm
                                text-slate-700
                                outline-none
                                focus:border-blue-500
                                focus:ring-2
                                focus:ring-blue-100
                            "
                        />

                    </div>

                    {/* DATE TO */}

                    <div className="md:col-span-3">

                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                            Date To
                        </label>

                        <input
                            type="date"
                            value={dateTo}
                            onChange={(event) =>
                                setDateTo(
                                    event.target.value
                                )
                            }
                            className="
                                w-full
                                rounded-lg
                                border
                                border-slate-300
                                bg-white
                                px-3
                                py-2.5
                                text-sm
                                text-slate-700
                                outline-none
                                focus:border-blue-500
                                focus:ring-2
                                focus:ring-blue-100
                            "
                        />

                    </div>

                    {/* SEARCH BUTTON */}

                    <div className="md:col-span-1 flex items-end">

                        <button
                            type="button"
                            onClick={handleSearch}
                            className="
                                w-full
                                h-[42px]
                                rounded-lg
                                bg-blue-700
                                text-white
                                flex
                                items-center
                                justify-center
                                hover:bg-blue-800
                                transition
                            "
                            title="Search"
                        >
                            <Search className="w-4 h-4" />
                        </button>

                    </div>

                </div>

                {/* CLEAR */}

                {hasFilters && (
                    <div className="mt-3 flex justify-end">

                        <button
                            type="button"
                            onClick={handleClearFilters}
                            className="
                                inline-flex
                                items-center
                                gap-1.5
                                text-xs
                                font-semibold
                                text-slate-500
                                hover:text-red-600
                                transition
                            "
                        >
                            <X className="w-3.5 h-3.5" />
                            Clear filters
                        </button>

                    </div>
                )}

            </div>

            {/* =================================================
                TABLE INFO
            ================================================== */}

            <div className="flex items-center justify-between mb-3">

                <div>

                    <p className="text-sm font-semibold text-slate-700">
                        CTC Transactions
                    </p>

                    <p className="text-xs text-slate-400 mt-0.5">
                        {pagination.total} transaction
                        {pagination.total !== 1
                            ? "s"
                            : ""}
                    </p>

                </div>

                {loading && (
                    <div className="flex items-center gap-2 text-xs text-slate-400">

                        <div className="w-3.5 h-3.5 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />

                        Loading...

                    </div>
                )}

            </div>

            {/* =================================================
                ERROR
            ================================================== */}

            {error && !loading && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">

                    <p className="text-sm font-medium text-red-700">
                        {error}
                    </p>

                </div>
            )}

            {/* =================================================
                TABLE
            ================================================== */}

            <div className="overflow-x-auto rounded-lg border border-slate-200">

                <table className="w-full text-sm">

                    <thead>

                        <tr className="bg-slate-50 border-b border-slate-200">

                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 whitespace-nowrap">
                                OR No.
                            </th>

                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 whitespace-nowrap">
                                Payor
                            </th>

                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 whitespace-nowrap">
                                Type
                            </th>

                            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 whitespace-nowrap">
                                Amount
                            </th>

                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 whitespace-nowrap">
                                Date
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {loading ? (

                            <tr>

                                <td
                                    colSpan={5}
                                    className="px-4 py-12 text-center"
                                >

                                    <div className="flex flex-col items-center justify-center">

                                        <div className="w-8 h-8 border-3 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-3" />

                                        <p className="text-sm text-slate-500">
                                            Loading transactions...
                                        </p>

                                    </div>

                                </td>

                            </tr>

                        ) : transactions.length ===
                          0 ? (

                            <tr>

                                <td
                                    colSpan={5}
                                    className="px-4 py-12 text-center"
                                >

                                    <div className="flex flex-col items-center justify-center">

                                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">

                                            <Receipt className="w-5 h-5 text-slate-400" />

                                        </div>

                                        <p className="text-sm font-medium text-slate-600">
                                            No transactions found
                                        </p>

                                        <p className="text-xs text-slate-400 mt-1">
                                            Try changing your search
                                            or date filters.
                                        </p>

                                    </div>

                                </td>

                            </tr>

                        ) : (

                            transactions.map(
                                (transaction) => {

                                    const type =
                                        getTransactionType(
                                            transaction.transaction_type
                                        );

                                    return (
                                        <tr
                                            key={
                                                transaction.id
                                            }
                                            className="
                                                border-b
                                                border-slate-100
                                                last:border-0
                                                hover:bg-slate-50
                                                transition
                                            "
                                        >

                                            {/* OR NUMBER */}

                                            <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">
                                                {
                                                    transaction.or_number
                                                }
                                            </td>

                                            {/* PAYOR */}

                                            <td className="px-4 py-3 text-slate-700">
                                                {
                                                    transaction.payor
                                                }
                                            </td>

                                            {/* TYPE */}

                                            <td className="px-4 py-3">

                                                <span
                                                    className={`
                                                        inline-flex
                                                        items-center
                                                        gap-1.5
                                                        rounded-full
                                                        px-2.5
                                                        py-1
                                                        text-xs
                                                        font-semibold
                                                        ${type.className}
                                                    `}
                                                >
                                                    {
                                                        type.label
                                                    }
                                                </span>

                                            </td>

                                            {/* AMOUNT */}

                                            <td className="px-4 py-3 text-right font-semibold text-slate-800 whitespace-nowrap">
                                                {formatCurrency(
                                                    transaction.grand_total
                                                )}
                                            </td>

                                            {/* DATE */}

                                            <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                                                {formatDate(
                                                    transaction.receipt_date
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

            {/* =================================================
                PAGINATION
            ================================================== */}

            {pagination.total > 0 && (
                <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                    <p className="text-xs text-slate-500">

                        Showing{" "}

                        <span className="font-semibold text-slate-700">
                            {(
                                (pagination.page -
                                    1) *
                                    pagination.limit +
                                1
                            )}
                        </span>

                        {" "}to{" "}

                        <span className="font-semibold text-slate-700">
                            {Math.min(
                                pagination.page *
                                    pagination.limit,
                                pagination.total
                            )}
                        </span>

                        {" "}of{" "}

                        <span className="font-semibold text-slate-700">
                            {pagination.total}
                        </span>

                    </p>

                    <div className="flex items-center gap-2">

                        <button
                            type="button"
                            onClick={
                                handlePreviousPage
                            }
                            disabled={
                                pagination.page <=
                                    1 ||
                                loading
                            }
                            className="
                                w-9
                                h-9
                                rounded-lg
                                border
                                border-slate-300
                                bg-white
                                flex
                                items-center
                                justify-center
                                text-slate-600
                                hover:bg-slate-50
                                disabled:opacity-40
                                disabled:cursor-not-allowed
                            "
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        <div className="min-w-[80px] text-center">

                            <span className="text-xs font-semibold text-slate-600">
                                Page{" "}
                                {pagination.page}
                                {" "}of{" "}
                                {pagination.totalPages}
                            </span>

                        </div>

                        <button
                            type="button"
                            onClick={
                                handleNextPage
                            }
                            disabled={
                                pagination.page >=
                                    pagination.totalPages ||
                                loading
                            }
                            className="
                                w-9
                                h-9
                                rounded-lg
                                border
                                border-slate-300
                                bg-white
                                flex
                                items-center
                                justify-center
                                text-slate-600
                                hover:bg-slate-50
                                disabled:opacity-40
                                disabled:cursor-not-allowed
                            "
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>

                    </div>

                </div>
            )}

        </div>
    );
}