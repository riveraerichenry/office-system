"use client";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    PhilippinePeso,
    RefreshCw,
    Search,
    X,
} from "lucide-react";

import RPTGroup, {
    RPTGroupColumns,
} from "@/components/collection/groups/RPTGroup";

import TaxRevenueCOL002Group, {
    TaxRevenueCOL002GroupColumns,
} from "@/components/collection/groups/TaxRevenueCOL002Group";

/* ============================================================
   TYPES
============================================================ */

type CollectionRow = {
    id: string;

    /*
    |--------------------------------------------------------------------------
    | RCD
    |--------------------------------------------------------------------------
    */

    rcd_transaction_id?:
        | string
        | null;

    report_no?:
        | string
        | null;

    report_date?:
        | string
        | null;

    date_from?:
        | string
        | null;

    date_to?:
        | string
        | null;

    /*
    |--------------------------------------------------------------------------
    | REMITTANCE
    |--------------------------------------------------------------------------
    */

    remittance_id?:
        | string
        | null;

    remittance_no?:
        | string
        | null;

    remittance_date?:
        | string
        | null;

    remittance_total_amount?:
        | number
        | string
        | null;

    /*
    |--------------------------------------------------------------------------
    | COLLECTOR
    |--------------------------------------------------------------------------
    */

    collector_name?:
        | string
        | null;

    /*
    |--------------------------------------------------------------------------
    | FUND
    |--------------------------------------------------------------------------
    */

    fund_source_id?:
        | string
        | null;

    fund_code?:
        | string
        | null;

    fund_name?:
        | string
        | null;

    fund_acronym?:
        | string
        | null;

    /*
    |--------------------------------------------------------------------------
    | AMOUNT
    |--------------------------------------------------------------------------
    */

    amount?:
        | number
        | string
        | null;

    total_amount?:
        | number
        | string
        | null;

    /*
    |--------------------------------------------------------------------------
    | DYNAMIC GROUP VALUES
    |--------------------------------------------------------------------------
    */

    values?: Record<
        string,
        number | string | null | undefined
    >;

    /*
    |--------------------------------------------------------------------------
    | ALLOW OTHER API FIELDS
    |--------------------------------------------------------------------------
    */

    [key: string]: any;
};

type CollectionResponse = {
    success: boolean;

    data?: CollectionRow[];

    count?: number;

    message?: string;

    columnGroups?: any[];
};

/* ============================================================
   CONSTANTS
============================================================ */

const ROWS_PER_PAGE = 15;

/* ============================================================
   FORMAT AMOUNT
============================================================ */

function formatAmount(
    value: unknown
) {
    const amount =
        Number(value ?? 0);

    if (
        Number.isNaN(amount)
    ) {
        return "₱0.00";
    }

    return new Intl.NumberFormat(
        "en-PH",
        {
            style: "currency",
            currency: "PHP",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }
    ).format(amount);
}

/* ============================================================
   FORMAT TABLE NUMBER
============================================================ */

function formatTableAmount(
    value: unknown
) {
    const amount =
        Number(value ?? 0);

    if (
        Number.isNaN(amount)
    ) {
        return "0.00";
    }

    return amount.toLocaleString(
        "en-PH",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }
    );
}

/* ============================================================
   FORMAT DATE
============================================================ */

function formatDate(
    value?:
        | string
        | null
) {
    if (!value) {
        return "—";
    }

    /*
    |--------------------------------------------------------------------------
    | DATE-ONLY VALUES
    |--------------------------------------------------------------------------
    |
    | PostgreSQL DATE values are normally returned as:
    |
    | 2026-09-15
    |
    | We append T00:00:00 so the browser does not shift
    | the date because of UTC conversion.
    |
    */

    const date =
        /^\d{4}-\d{2}-\d{2}$/.test(
            value
        )
            ? new Date(
                  `${value}T00:00:00`
              )
            : new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "—";
    }

    return date.toLocaleDateString(
        "en-PH",
        {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
        }
    );
}

/* ============================================================
   GET ROW AMOUNT
============================================================ */

function getRowAmount(
    row: CollectionRow
) {
    /*
    |--------------------------------------------------------------------------
    | Prefer total amount
    |--------------------------------------------------------------------------
    */

    const candidates = [
        row.amount,
        row.total_amount,
        row.remittance_total_amount,
    ];

    for (
        const value of candidates
    ) {
        const number =
            Number(value ?? NaN);

        if (
            Number.isFinite(number)
        ) {
            return number;
        }
    }

    return 0;
}

/* ============================================================
   COMPONENT
============================================================ */

export default function CollectionTable() {
    /* ========================================================
       DATA
    ======================================================== */

    const [
        rows,
        setRows,
    ] = useState<CollectionRow[]>(
        []
    );

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        refreshing,
        setRefreshing,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState("");

    /* ========================================================
       FILTERS
    ======================================================== */

    const [
        search,
        setSearch,
    ] = useState("");

    const [
        selectedYear,
        setSelectedYear,
    ] = useState("ALL");

    const [
        selectedMonth,
        setSelectedMonth,
    ] = useState("ALL");

    /* ========================================================
       GROUP VISIBILITY
    ======================================================== */

    const [
        showRPT,
        setShowRPT,
    ] = useState(true);

    const [
        showTaxRevenueCOL002,
        setShowTaxRevenueCOL002,
    ] = useState(true);

    /* ========================================================
       PAGINATION
    ======================================================== */

    const [
        currentPage,
        setCurrentPage,
    ] = useState(1);

    /* ========================================================
       LOAD DATA
    ======================================================== */

    async function loadData(
        showRefresh = false
    ) {
        try {
            if (showRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const response =
                await fetch(
                    "/api/collection",
                    {
                        method: "GET",
                        credentials: "include",
                        cache: "no-store",
                    }
                );

            const result =
                (await response.json()) as CollectionResponse;

            if (
                !response.ok ||
                !result.success
            ) {
                throw new Error(
                    result.message ??
                        "Failed to load collection data."
                );
            }

            const data =
                Array.isArray(
                    result.data
                )
                    ? result.data
                    : [];

            setRows(data);

            setCurrentPage(1);
        } catch (err: any) {
            console.error(
                "COLLECTION LOAD ERROR:",
                err
            );

            setError(
                err?.message ??
                    "Failed to load collection data."
            );

            setRows([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    /* ========================================================
       INITIAL LOAD
    ======================================================== */

    useEffect(() => {
        loadData();
    }, []);

    /* ========================================================
       AVAILABLE YEARS
    ======================================================== */

    const availableYears =
        useMemo(() => {
            const years =
                new Set<string>();

            rows.forEach(
                (row) => {
                    /*
                    |--------------------------------------------------------------------------
                    | Prefer report date
                    |--------------------------------------------------------------------------
                    */

                    const rawDate =
                        row.report_date ??
                        row.remittance_date;

                    if (!rawDate) {
                        return;
                    }

                    const date =
                        /^\d{4}-\d{2}-\d{2}$/.test(
                            rawDate
                        )
                            ? new Date(
                                  `${rawDate}T00:00:00`
                              )
                            : new Date(rawDate);

                    if (
                        !Number.isNaN(
                            date.getTime()
                        )
                    ) {
                        years.add(
                            String(
                                date.getFullYear()
                            )
                        );
                    }
                }
            );

            return Array.from(
                years
            ).sort(
                (a, b) =>
                    Number(b) -
                    Number(a)
            );
        }, [rows]);

    /* ========================================================
       FILTERED ROWS
    ======================================================== */

    const filteredRows =
        useMemo(() => {
            const keyword =
                search
                    .trim()
                    .toLowerCase();

            return rows.filter(
                (row) => {
                    /* ==========================================
                       SEARCH
                    ========================================== */

                    if (keyword) {
                        const searchable = [
                            row.report_no,

                            row.report_date,

                            row.date_from,

                            row.date_to,

                            row.remittance_no,

                            row.remittance_date,

                            row.collector_name,

                            row.fund_code,

                            row.fund_name,

                            row.fund_acronym,

                            row.amount,

                            row.total_amount,

                            row.remittance_total_amount,

                            row.rcd_transaction_id,

                            row.remittance_id,

                            /*
                            |--------------------------------------------------------------------------
                            | Search dynamic values too
                            |--------------------------------------------------------------------------
                            */

                            ...Object.values(
                                row.values ?? {}
                            ),
                        ]
                            .filter(
                                (value) =>
                                    value !==
                                    null &&
                                    value !==
                                    undefined
                            )
                            .join(" ")
                            .toLowerCase();

                        if (
                            !searchable.includes(
                                keyword
                            )
                        ) {
                            return false;
                        }
                    }

                    /* ==========================================
                       DATE USED FOR FILTERING
                    ========================================== */

                    const rawDate =
                        row.report_date ??
                        row.remittance_date;

                    if (
                        selectedYear !==
                        "ALL"
                    ) {
                        if (!rawDate) {
                            return false;
                        }

                        const date =
                            /^\d{4}-\d{2}-\d{2}$/.test(
                                rawDate
                            )
                                ? new Date(
                                      `${rawDate}T00:00:00`
                                  )
                                : new Date(rawDate);

                        if (
                            Number.isNaN(
                                date.getTime()
                            )
                        ) {
                            return false;
                        }

                        if (
                            String(
                                date.getFullYear()
                            ) !==
                            selectedYear
                        ) {
                            return false;
                        }
                    }

                    /* ==========================================
                       MONTH
                    ========================================== */

                    if (
                        selectedMonth !==
                        "ALL"
                    ) {
                        if (!rawDate) {
                            return false;
                        }

                        const date =
                            /^\d{4}-\d{2}-\d{2}$/.test(
                                rawDate
                            )
                                ? new Date(
                                      `${rawDate}T00:00:00`
                                  )
                                : new Date(rawDate);

                        if (
                            Number.isNaN(
                                date.getTime()
                            )
                        ) {
                            return false;
                        }

                        if (
                            String(
                                date.getMonth() +
                                    1
                            ) !==
                            selectedMonth
                        ) {
                            return false;
                        }
                    }

                    return true;
                }
            );
        }, [
            rows,
            search,
            selectedYear,
            selectedMonth,
        ]);

    /* ========================================================
       TOTAL
    ======================================================== */

    const totalAmount =
        useMemo(() => {
            return filteredRows.reduce(
                (
                    total,
                    row
                ) => {
                    return (
                        total +
                        getRowAmount(row)
                    );
                },
                0
            );
        }, [
            filteredRows,
        ]);

    /* ========================================================
       PAGINATION
    ======================================================== */

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                filteredRows.length /
                    ROWS_PER_PAGE
            )
        );

    /* ========================================================
       KEEP CURRENT PAGE VALID
    ======================================================== */

    useEffect(() => {
        if (
            currentPage >
            totalPages
        ) {
            setCurrentPage(
                totalPages
            );
        }
    }, [
        currentPage,
        totalPages,
    ]);

    /* ========================================================
       PAGINATED ROWS
    ======================================================== */

    const paginatedRows =
        useMemo(() => {
            const start =
                (
                    currentPage -
                    1
                ) *
                ROWS_PER_PAGE;

            return filteredRows.slice(
                start,
                start +
                    ROWS_PER_PAGE
            );
        }, [
            filteredRows,
            currentPage,
        ]);

    /* ========================================================
       CLEAR FILTERS
    ======================================================== */

    function handleClearFilter() {
        setSearch("");

        setSelectedYear(
            "ALL"
        );

        setSelectedMonth(
            "ALL"
        );

        setCurrentPage(1);
    }

    /* ========================================================
       HAS FILTERS
    ======================================================== */

    const hasFilters =
        search.trim() !== "" ||
        selectedYear !== "ALL" ||
        selectedMonth !== "ALL";

    /* ========================================================
       RENDER
    ======================================================== */

    return (
        <div className="flex flex-col">
            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="border-b border-slate-200 px-5 py-4">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    {/* TITLE */}

                    <div>
                        <h2 className="text-lg font-bold text-slate-800">
                            Collection
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            Collection distribution by RCD,
                            collector, and account.
                        </p>
                    </div>

                    {/* SUMMARY */}

                    <div className="flex flex-wrap gap-3">
                        {/* RECORD COUNT */}

                        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                                <CalendarDays
                                    size={16}
                                />
                            </div>

                            <div>
                                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                                    Records
                                </p>

                                <p className="text-sm font-bold text-slate-700">
                                    {filteredRows.length.toLocaleString()}
                                </p>
                            </div>
                        </div>

                        {/* TOTAL */}

                        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-emerald-600 shadow-sm">
                                <PhilippinePeso
                                    size={16}
                                />
                            </div>

                            <div>
                                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                                    Collection Total
                                </p>

                                <p className="text-sm font-bold text-slate-700">
                                    {formatAmount(
                                        totalAmount
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ==================================================
                GROUP CONTROLS
            ================================================== */}

            <div className="border-b border-slate-200 bg-white px-5 py-3">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Groups:
                    </span>

                    {/* RPT */}

                    <button
                        type="button"
                        onClick={() => {
                            setShowRPT(
                                (value) =>
                                    !value
                            );

                            setCurrentPage(1);
                        }}
                        className={`
                            rounded-lg
                            border
                            px-3
                            py-2
                            text-xs
                            font-semibold
                            transition
                            ${
                                showRPT
                                    ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                                    : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                            }
                        `}
                    >
                        RPT
                    </button>

                    {/* TAX REVENUE-COL002 */}

                    <button
                        type="button"
                        onClick={() => {
                            setShowTaxRevenueCOL002(
                                (value) =>
                                    !value
                            );

                            setCurrentPage(1);
                        }}
                        className={`
                            rounded-lg
                            border
                            px-3
                            py-2
                            text-xs
                            font-semibold
                            transition
                            ${
                                showTaxRevenueCOL002
                                    ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                                    : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                            }
                        `}
                    >
                        TAX REVENUE-COL002
                    </button>
                </div>
            </div>

            {/* ==================================================
                FILTERS
            ================================================== */}

            <div className="border-b border-slate-200 bg-slate-50/70 px-5 py-3">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
                    {/* SEARCH */}

                    <div className="relative min-w-0 flex-1">
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => {
                                setSearch(
                                    e.target.value
                                );

                                setCurrentPage(
                                    1
                                );
                            }}
                            placeholder="Search RCD, remittance, collector, fund, account..."
                            className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-9 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />

                        {search && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearch(
                                        ""
                                    );

                                    setCurrentPage(
                                        1
                                    );
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                            >
                                <X
                                    size={15}
                                />
                            </button>
                        )}
                    </div>

                    {/* YEAR */}

                    <select
                        value={selectedYear}
                        onChange={(e) => {
                            setSelectedYear(
                                e.target.value
                            );

                            setCurrentPage(
                                1
                            );
                        }}
                        className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                        <option value="ALL">
                            All Years
                        </option>

                        {availableYears.map(
                            (year) => (
                                <option
                                    key={year}
                                    value={year}
                                >
                                    {year}
                                </option>
                            )
                        )}
                    </select>

                    {/* MONTH */}

                    <select
                        value={selectedMonth}
                        onChange={(e) => {
                            setSelectedMonth(
                                e.target.value
                            );

                            setCurrentPage(
                                1
                            );
                        }}
                        className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                        <option value="ALL">
                            All Months
                        </option>

                        <option value="1">
                            January
                        </option>

                        <option value="2">
                            February
                        </option>

                        <option value="3">
                            March
                        </option>

                        <option value="4">
                            April
                        </option>

                        <option value="5">
                            May
                        </option>

                        <option value="6">
                            June
                        </option>

                        <option value="7">
                            July
                        </option>

                        <option value="8">
                            August
                        </option>

                        <option value="9">
                            September
                        </option>

                        <option value="10">
                            October
                        </option>

                        <option value="11">
                            November
                        </option>

                        <option value="12">
                            December
                        </option>
                    </select>

                    {/* CLEAR */}

                    {hasFilters && (
                        <button
                            type="button"
                            onClick={
                                handleClearFilter
                            }
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                        >
                            <X
                                size={15}
                            />

                            Clear
                        </button>
                    )}

                    {/* REFRESH */}

                    <button
                        type="button"
                        onClick={() =>
                            loadData(true)
                        }
                        disabled={
                            refreshing
                        }
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <RefreshCw
                            size={15}
                            className={
                                refreshing
                                    ? "animate-spin"
                                    : ""
                            }
                        />

                        Refresh
                    </button>
                </div>
            </div>

            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (
                <div className="border-b border-red-100 bg-red-50 px-5 py-3 text-xs font-medium text-red-600">
                    {error}
                </div>
            )}

            {/* ==================================================
                TABLE
            ================================================== */}

            <div className="overflow-x-auto">
                <table className="min-w-[1800px] w-full border-collapse">
                    {/* ==================================================
                        TABLE HEADER
                    ================================================== */}

                    <thead>
                        {/* GROUP HEADER */}

                        <tr>
                            {/* RCD */}

                            <th
                                rowSpan={2}
                                className="border border-black bg-slate-100 px-3 py-2 text-center text-xs font-bold text-slate-800"
                            >
                                RCD NO.
                            </th>

                            {/* COLLECTOR */}

                            <th
                                rowSpan={2}
                                className="border border-black bg-slate-100 px-3 py-2 text-center text-xs font-bold text-slate-800"
                            >
                                COLLECTOR
                            </th>

                            {/* AMOUNT */}

                            <th
                                rowSpan={2}
                                className="border border-black bg-slate-100 px-3 py-2 text-center text-xs font-bold text-slate-800"
                            >
                                AMOUNT
                            </th>

                            {/* RPT */}

                            {showRPT && (
                                <RPTGroup
                                    row={{}}
                                    header
                                />
                            )}

                            {/* TAX REVENUE */}

                            {showTaxRevenueCOL002 && (
                                <TaxRevenueCOL002Group
                                    row={{}}
                                    header
                                />
                            )}
                        </tr>

                        {/* ACCOUNT HEADER */}

                        <tr>
                            {showRPT && (
                                <RPTGroupColumns />
                            )}

                            {showTaxRevenueCOL002 && (
                                <TaxRevenueCOL002GroupColumns />
                            )}
                        </tr>
                    </thead>

                    {/* ==================================================
                        TABLE BODY
                    ================================================== */}

                    <tbody>
                        {/* LOADING */}

                        {loading ? (
                            <tr>
                                <td
                                    colSpan={
                                        3 +
                                        (showRPT
                                            ? 8
                                            : 0) +
                                        (showTaxRevenueCOL002
                                            ? 5
                                            : 0)
                                    }
                                    className="px-4 py-12 text-center"
                                >
                                    <div className="flex flex-col items-center">
                                        <RefreshCw
                                            size={22}
                                            className="mb-2 animate-spin text-blue-500"
                                        />

                                        <p className="text-sm font-medium text-slate-600">
                                            Loading collection data...
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : paginatedRows.length ===
                          0 ? (
                            /* EMPTY */

                            <tr>
                                <td
                                    colSpan={
                                        3 +
                                        (showRPT
                                            ? 8
                                            : 0) +
                                        (showTaxRevenueCOL002
                                            ? 5
                                            : 0)
                                    }
                                    className="px-4 py-12 text-center"
                                >
                                    <div className="flex flex-col items-center">
                                        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                            —
                                        </div>

                                        <p className="text-sm font-medium text-slate-600">
                                            No collection records found
                                        </p>

                                        <p className="mt-1 text-xs text-slate-400">
                                            Try adjusting your filters.
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            /* DATA */

                            paginatedRows.map(
                                (row) => (
                                    <tr
                                        key={
                                            row.id
                                        }
                                        className="transition hover:bg-blue-50/40"
                                    >
                                        {/* ==================================================
                                            REMITTANCE NO.
                                        ================================================== */}

                                        <td className="border border-black px-3 py-2 align-top">
                                            <div className="text-sm font-semibold text-slate-800">
                                                {row.remittance_no ?? "—"}
                                            </div>

                                           
                                        </td>

                                        {/* ==================================================
                                            COLLECTOR
                                        ================================================== */}

                                        <td className="max-w-[200px] border border-black px-3 py-2 align-top">
                                            <div className="truncate text-sm font-medium text-slate-700">
                                                {row.collector_name ??
                                                    "—"}
                                            </div>
                                        </td>

                                        {/* ==================================================
                                            AMOUNT
                                        ================================================== */}

                                        <td className="whitespace-nowrap border border-black px-3 py-2 text-right align-top">
                                            <span className="text-sm font-bold text-slate-800">
                                                {formatTableAmount(
                                                    getRowAmount(
                                                        row
                                                    )
                                                )}
                                            </span>
                                        </td>

                                        {/* ==================================================
                                            RPT GROUP
                                        ================================================== */}

                                        {showRPT && (
                                            <RPTGroup
                                                row={
                                                    row
                                                }
                                            />
                                        )}

                                        {/* ==================================================
                                            TAX REVENUE-COL002 GROUP
                                        ================================================== */}

                                        {showTaxRevenueCOL002 && (
                                            <TaxRevenueCOL002Group
                                                row={
                                                    row
                                                }
                                            />
                                        )}
                                    </tr>
                                )
                            )
                        )}
                    </tbody>
                </table>
            </div>

            {/* ==================================================
                PAGINATION
            ================================================== */}

            <div className="flex flex-col gap-3 border-t border-slate-200 bg-white px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                {/* INFORMATION */}

                <div className="text-xs text-slate-500">
                    {filteredRows.length ===
                    0 ? (
                        "No records"
                    ) : (
                        <>
                            Showing{" "}
                            <span className="font-semibold text-slate-700">
                                {(
                                    (
                                        currentPage -
                                        1
                                    ) *
                                        ROWS_PER_PAGE +
                                    1
                                ).toLocaleString()}
                            </span>

                            {" "}to{" "}

                            <span className="font-semibold text-slate-700">
                                {Math.min(
                                    currentPage *
                                        ROWS_PER_PAGE,
                                    filteredRows.length
                                ).toLocaleString()}
                            </span>

                            {" "}of{" "}

                            <span className="font-semibold text-slate-700">
                                {filteredRows.length.toLocaleString()}
                            </span>

                            {" "}records
                        </>
                    )}
                </div>

                {/* CONTROLS */}

                <div className="flex items-center gap-2">
                    {/* PREVIOUS */}

                    <button
                        type="button"
                        disabled={
                            currentPage <=
                            1
                        }
                        onClick={() =>
                            setCurrentPage(
                                (page) =>
                                    Math.max(
                                        1,
                                        page -
                                            1
                                    )
                            )
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <ChevronLeft
                            size={16}
                        />
                    </button>

                    {/* PAGE */}

                    <div className="min-w-[80px] text-center text-xs font-medium text-slate-600">
                        Page{" "}
                        {
                            currentPage
                        }{" "}
                        of{" "}
                        {
                            totalPages
                        }
                    </div>

                    {/* NEXT */}

                    <button
                        type="button"
                        disabled={
                            currentPage >=
                            totalPages
                        }
                        onClick={() =>
                            setCurrentPage(
                                (page) =>
                                    Math.min(
                                        totalPages,
                                        page +
                                            1
                                    )
                            )
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <ChevronRight
                            size={16}
                        />
                    </button>
                </div>
            </div>
        </div>
    );
}