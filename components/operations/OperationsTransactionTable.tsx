"use client";

import { useEffect, useMemo, useState } from "react";

import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    PhilippinePeso,
    Receipt,
    RefreshCw,
    Search,
    X,
} from "lucide-react";

/* ============================================================
   TYPE
============================================================ */

type OperationsTransactionItem = {

    /* ============================================================
       ITEM
    ============================================================ */

    item_id: string;

    transaction_id: string;

    account_id: string;

    item_amount:
        | number
        | string
        | null;

    item_remarks:
        | string
        | null;

    item_created_at:
        | string
        | null;


    /* ============================================================
       DIPP
    ============================================================ */

    dipp_transaction_id: string;

    or_number:
        | string
        | null;

    receipt_date:
        | string
        | null;

    payor:
        | string
        | null;

    payment_mode:
        | string
        | null;

    transaction_remarks:
        | string
        | null;

    grand_total:
        | number
        | string
        | null;

    dipp_status:
        | string
        | null;

    transaction_type:
        | string
        | null;

    is_cancelled:
        | boolean
        | null;

    cancelled_at:
        | string
        | null;

    cancelled_by:
        | string
        | null;

    cancelled_by_name:
        | string
        | null;

    is_remitted:
        | boolean
        | null;

    payment:
        | number
        | string
        | null;

    gender:
        | string
        | null;


    /* ============================================================
       USERS
    ============================================================ */

    collector_id:
        | string
        | null;

    collector_name:
        | string
        | null;

    encoded_by:
        | string
        | null;

    encoded_by_name:
        | string
        | null;

    posted_by:
        | string
        | null;

    posted_by_name:
        | string
        | null;

    updated_by:
        | string
        | null;

    updated_by_name:
        | string
        | null;


    /* ============================================================
       ACCOUNTABLE FORM
    ============================================================ */

    accountable_form_id:
        | string
        | null;

    form_code:
        | string
        | null;

    form_name:
        | string
        | null;


    /* ============================================================
       ACCOUNT
    ============================================================ */

    account_code:
        | string
        | null;

    account_name:
        | string
        | null;


    /* ============================================================
       LOR
    ============================================================ */

    lor_release_id:
        | string
        | null;

    lor_no:
        | string
        | null;


    /* ============================================================
       FUND
    ============================================================ */

    fund_source_id:
        | string
        | null;

    fund_code:
        | string
        | null;

    fund_name:
        | string
        | null;

    fund_acronym:
        | string
        | null;


    /* ============================================================
       RCD
    ============================================================ */

    rcd_transaction_id:
        | string
        | null;

    rcd_report_no:
        | string
        | null;

    rcd_report_date:
        | string
        | null;

    rcd_fund_source_id:
        | string
        | null;

    rcd_date_from:
        | string
        | null;

    rcd_date_to:
        | string
        | null;

    rcd_total_collections:
        | number
        | string
        | null;

    rcd_total_remittances:
        | number
        | string
        | null;

    rcd_total_deposits:
        | number
        | string
        | null;

    rcd_balance:
        | number
        | string
        | null;

    rcd_status:
        | string
        | null;

    rcd_by_id:
        | string
        | null;

    rcd_by_name:
        | string
        | null;


    /* ============================================================
       REMITTANCE
    ============================================================ */

    remittance_transaction_id:
        | string
        | null;

    remittance_no:
        | string
        | null;

    remittance_date:
        | string
        | null;

    remittance_total_amount:
        | number
        | string
        | null;

    remittance_status:
        | string
        | null;

    remittance_remarks:
        | string
        | null;

    remittance_prepared_by:
        | string
        | null;

    remittance_approved_by:
        | string
        | null;

    remittance_approved_at:
        | string
        | null;

    remittance_prepared_by_name:
        | string
        | null;

    remittance_approved_by_name:
        | string
        | null;


    /* ============================================================
       CONSOLIDATED RCD
    ============================================================ */

    consolidated_transaction_id:
        | string
        | null;

    consolidated_no:
        | string
        | null;

    consolidated_date:
        | string
        | null;

    consolidated_total_amount:
        | number
        | string
        | null;

    consolidated_status:
        | string
        | null;

    consolidated_remarks:
        | string
        | null;

    consolidated_prepared_by:
        | string
        | null;

    consolidated_approved_by:
        | string
        | null;

    consolidated_approved_at:
        | string
        | null;

    consolidated_prepared_by_name:
        | string
        | null;

    consolidated_approved_by_name:
        | string
        | null;

    consolidated_item_id:
        | string
        | null;

    consolidated_item_amount:
        | number
        | string
        | null;
};


/* ============================================================
   CONSTANTS
============================================================ */

const ROWS_PER_PAGE = 10;


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

    const date =
        new Date(value);

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
   STATUS CLASS

   Used ONLY for the DIPP status column.
============================================================ */

function getStatusClass(
    status?:
        | string
        | null
) {

    switch (
        (
            status ??
            ""
        ).toUpperCase()
    ) {

        case "ISSUED":

            return (
                "border-blue-200 " +
                "bg-blue-50 " +
                "text-blue-700"
            );

        case "POSTED":

            return (
                "border-emerald-200 " +
                "bg-emerald-50 " +
                "text-emerald-700"
            );

        case "REMITTED":

            return (
                "border-purple-200 " +
                "bg-purple-50 " +
                "text-purple-700"
            );

        case "CANCELLED":

            return (
                "border-red-200 " +
                "bg-red-50 " +
                "text-red-700"
            );

        case "APPROVED":

            return (
                "border-emerald-200 " +
                "bg-emerald-50 " +
                "text-emerald-700"
            );

        case "PENDING":

            return (
                "border-amber-200 " +
                "bg-amber-50 " +
                "text-amber-700"
            );

        default:

            return (
                "border-slate-200 " +
                "bg-slate-50 " +
                "text-slate-600"
            );
    }
}


/* ============================================================
   COMPONENT
============================================================ */

export default function OperationsTransactionTable() {

    const [items, setItems] =
        useState<
            OperationsTransactionItem[]
        >([]);


    const [loading, setLoading] =
        useState(true);


    const [refreshing, setRefreshing] =
        useState(false);


    const [error, setError] =
        useState("");


    /* ============================================================
       FILTERS
    ============================================================ */

    const [search, setSearch] =
        useState("");


    const [selectedYear, setSelectedYear] =
        useState("ALL");


    const [selectedMonth, setSelectedMonth] =
        useState("ALL");


    const [selectedStatus, setSelectedStatus] =
        useState("ALL");


    /* ============================================================
       PAGINATION
    ============================================================ */

    const [currentPage, setCurrentPage] =
        useState(1);


    /* ============================================================
       LOAD
    ============================================================ */

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
                    "/api/operations/dipp-transaction-items",
                    {
                        method: "GET",
                        credentials: "include",
                        cache: "no-store",
                    }
                );


            const result =
                await response.json();


            if (
                !response.ok ||
                !result.success
            ) {

                throw new Error(
                    result.message ??
                    "Failed to load operational transactions."
                );
            }


            const data =
                Array.isArray(
                    result.data
                )
                    ? result.data
                    : [];


            setItems(data);

        } catch (err: any) {

            console.error(
                "OPERATIONS LOAD ERROR:",
                err
            );

            setError(
                err?.message ??
                "Failed to load operational transactions."
            );

            setItems([]);

        } finally {

            setLoading(false);
            setRefreshing(false);

        }
    }


    /* ============================================================
       INITIAL LOAD
    ============================================================ */

    useEffect(() => {

        loadData();

    }, []);


    /* ============================================================
       AVAILABLE YEARS
    ============================================================ */

    const availableYears =
        useMemo(() => {

            const years =
                new Set<string>();


            items.forEach(
                item => {

                    if (
                        !item.receipt_date
                    ) {
                        return;
                    }


                    const date =
                        new Date(
                            item.receipt_date
                        );


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
                (
                    a,
                    b
                ) =>
                    Number(b) -
                    Number(a)
            );

        }, [items]);


    /* ============================================================
       FILTER
    ============================================================ */

    const filteredItems =
        useMemo(() => {

            const keyword =
                search
                    .trim()
                    .toLowerCase();


            return items.filter(
                item => {

                    /* ==========================================
                       SEARCH
                    ========================================== */

                    if (keyword) {

                        const searchable =
                            [

                                item.or_number,

                                item.payor,

                                item.account_code,

                                item.account_name,

                                item.item_remarks,

                                item.transaction_remarks,

                                item.fund_code,

                                item.fund_name,

                                item.fund_acronym,

                                item.collector_name,

                                item.encoded_by_name,

                                item.form_code,

                                item.form_name,

                                item.transaction_type,

                                item.dipp_status,

                                item.rcd_report_no,

                                item.rcd_status,

                                item.remittance_no,

                                item.remittance_status,

                                item.consolidated_no,

                                item.consolidated_status,

                                item.lor_no,

                                item.transaction_id,

                                item.item_id,

                            ]
                                .filter(Boolean)
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
                       YEAR
                    ========================================== */

                    if (
                        selectedYear !==
                        "ALL"
                    ) {

                        if (
                            !item.receipt_date
                        ) {
                            return false;
                        }


                        const date =
                            new Date(
                                item.receipt_date
                            );


                        if (
                            Number.isNaN(
                                date.getTime()
                            ) ||
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

                        if (
                            !item.receipt_date
                        ) {
                            return false;
                        }


                        const date =
                            new Date(
                                item.receipt_date
                            );


                        if (
                            Number.isNaN(
                                date.getTime()
                            ) ||
                            String(
                                date.getMonth() + 1
                            ) !==
                            selectedMonth
                        ) {

                            return false;

                        }
                    }


                    /* ==========================================
                       DIPP STATUS
                    ========================================== */

                    if (
                        selectedStatus !==
                        "ALL"
                    ) {

                        const status =
                            item.is_cancelled
                                ? "CANCELLED"
                                : (
                                    item.dipp_status ??
                                    ""
                                ).toUpperCase();


                        if (
                            status !==
                            selectedStatus
                        ) {

                            return false;

                        }
                    }


                    return true;

                }
            );

        }, [
            items,
            search,
            selectedYear,
            selectedMonth,
            selectedStatus,
        ]);


    /* ============================================================
       TOTAL
    ============================================================ */

    const totalAmount =
        useMemo(() => {

            return filteredItems.reduce(
                (
                    total,
                    item
                ) => {

                    const amount =
                        Number(
                            item.item_amount ??
                            0
                        );


                    return (
                        total +
                        (
                            Number.isNaN(
                                amount
                            )
                                ? 0
                                : amount
                        )
                    );

                },
                0
            );

        }, [filteredItems]);


    /* ============================================================
       PAGINATION
    ============================================================ */

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                filteredItems.length /
                ROWS_PER_PAGE
            )
        );


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


    const paginatedItems =
        useMemo(() => {

            const start =
                (
                    currentPage -
                    1
                ) *
                ROWS_PER_PAGE;


            return filteredItems.slice(
                start,
                start +
                ROWS_PER_PAGE
            );

        }, [
            filteredItems,
            currentPage,
        ]);


    /* ============================================================
       CLEAR
    ============================================================ */

    function handleClearFilter() {

        setSearch("");

        setSelectedYear(
            "ALL"
        );

        setSelectedMonth(
            "ALL"
        );

        setSelectedStatus(
            "ALL"
        );

        setCurrentPage(1);
    }


    const hasFilters =
        search.trim() !== "" ||
        selectedYear !== "ALL" ||
        selectedMonth !== "ALL" ||
        selectedStatus !== "ALL";


    /* ============================================================
       RENDER
    ============================================================ */

    return (

        <div className="flex flex-col">


            {/* ====================================================
                HEADER
            ==================================================== */}

            <div className="border-b border-slate-200 px-5 py-4">

                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

                    <div>

                        <h2 className="text-lg font-bold text-slate-800">
                            Operations Transactions
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            DIPP → RCD → Remittance → Consolidated RCD
                        </p>

                    </div>


                    <div className="flex flex-wrap gap-3">


                        {/* ITEMS */}

                        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2">

                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">

                                <Receipt
                                    size={16}
                                />

                            </div>


                            <div>

                                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                                    Items
                                </p>

                                <p className="text-sm font-bold text-slate-700">
                                    {
                                        filteredItems.length.toLocaleString()
                                    }
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
                                    Item Total
                                </p>

                                <p className="text-sm font-bold text-slate-700">
                                    {
                                        formatAmount(
                                            totalAmount
                                        )
                                    }
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

            </div>


            {/* ====================================================
                FILTERS
            ==================================================== */}

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
                            onChange={e => {

                                setSearch(
                                    e.target.value
                                );

                                setCurrentPage(
                                    1
                                );

                            }}
                            placeholder="Search OR, account, payor, RCD, remittance, consolidated..."
                            className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-9 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />


                        {search && (

                            <button
                                type="button"
                                onClick={() => {

                                    setSearch("");

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
                        onChange={e => {

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
                            year => (

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
                        onChange={e => {

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


                    {/* STATUS */}

                    <select
                        value={selectedStatus}
                        onChange={e => {

                            setSelectedStatus(
                                e.target.value
                            );

                            setCurrentPage(
                                1
                            );

                        }}
                        className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >

                        <option value="ALL">
                            All Status
                        </option>

                        <option value="ISSUED">
                            Issued
                        </option>

                        <option value="POSTED">
                            Posted
                        </option>

                        <option value="REMITTED">
                            Remitted
                        </option>

                        <option value="CANCELLED">
                            Cancelled
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


            {/* ====================================================
                ERROR
            ==================================================== */}

            {error && (

                <div className="border-b border-red-100 bg-red-50 px-5 py-3 text-xs font-medium text-red-600">

                    {error}

                </div>

            )}


            {/* ====================================================
                TABLE
            ==================================================== */}

            <div className="overflow-x-auto">

                <table className="min-w-[1750px] w-full border-collapse">

                    <thead>

                        <tr className="border-b border-slate-200 bg-slate-50">


                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                OR / Date
                            </th>


                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Payor
                            </th>


                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Account
                            </th>


                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Fund
                            </th>


                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Item Amount
                            </th>


                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                RCD
                            </th>


                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Remittance
                            </th>


                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Consolidated RCD
                            </th>


                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Collector
                            </th>


                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Status
                            </th>

                        </tr>

                    </thead>


                    <tbody>


                        {/* =================================================
                            LOADING
                        ================================================= */}

                        {loading ? (

                            <tr>

                                <td
                                    colSpan={10}
                                    className="px-4 py-12 text-center"
                                >

                                    <div className="flex flex-col items-center">

                                        <RefreshCw
                                            size={22}
                                            className="mb-2 animate-spin text-blue-500"
                                        />

                                        <p className="text-sm font-medium text-slate-600">
                                            Loading operational transactions...
                                        </p>

                                    </div>

                                </td>

                            </tr>

                        ) : paginatedItems.length === 0 ? (

                            /* =================================================
                               EMPTY
                            ================================================= */

                            <tr>

                                <td
                                    colSpan={10}
                                    className="px-4 py-12 text-center"
                                >

                                    <div className="flex flex-col items-center">

                                        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                            —
                                        </div>

                                        <p className="text-sm font-medium text-slate-600">
                                            No transaction items found
                                        </p>

                                        <p className="mt-1 text-xs text-slate-400">
                                            Try adjusting your filters.
                                        </p>

                                    </div>

                                </td>

                            </tr>

                        ) : (

                            paginatedItems.map(
                                item => {

                                    const status =
                                        item.is_cancelled
                                            ? "CANCELLED"
                                            : (
                                                item.dipp_status ??
                                                ""
                                            ).toUpperCase();


                                    return (

                                        <tr
                                            key={
                                                item.item_id
                                            }
                                            className="border-b border-slate-100 transition hover:bg-blue-50/40"
                                        >


                                            {/* =================================
                                                OR
                                            ================================= */}

                                            <td className="whitespace-nowrap px-4 py-3">

                                                <div className="text-sm font-semibold text-slate-800">

                                                    {
                                                        item.or_number ??
                                                        "—"
                                                    }

                                                </div>


                                                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400">

                                                    <CalendarDays
                                                        size={12}
                                                    />

                                                    {
                                                        formatDate(
                                                            item.receipt_date
                                                        )
                                                    }

                                                </div>


                                                {item.form_code && (

                                                    <div className="mt-0.5 text-[10px] text-slate-400">

                                                        {
                                                            item.form_code
                                                        }

                                                    </div>

                                                )}

                                            </td>


                                            {/* =================================
                                                PAYOR
                                            ================================= */}

                                            <td className="max-w-[200px] px-4 py-3">

                                                <div className="truncate text-sm font-medium text-slate-700">

                                                    {
                                                        item.payor ??
                                                        "—"
                                                    }

                                                </div>


                                                {item.payment_mode && (

                                                    <div className="mt-0.5 text-[11px] text-slate-400">

                                                        {
                                                            item.payment_mode
                                                        }

                                                    </div>

                                                )}

                                            </td>


                                            {/* =================================
                                                ACCOUNT
                                            ================================= */}

                                            <td className="max-w-[260px] px-4 py-3">

                                                <div className="text-sm font-semibold text-slate-700">

                                                    {
                                                        item.account_code ??
                                                        "—"
                                                    }

                                                </div>


                                                <div className="truncate text-[11px] text-slate-400">

                                                    {
                                                        item.account_name ??
                                                        "—"
                                                    }

                                                </div>


                                                {item.item_remarks && (

                                                    <div
                                                        className="mt-1 truncate text-[10px] italic text-slate-400"
                                                        title={
                                                            item.item_remarks
                                                        }
                                                    >

                                                        {
                                                            item.item_remarks
                                                        }

                                                    </div>

                                                )}

                                            </td>


                                            {/* =================================
                                                FUND
                                            ================================= */}

                                            <td className="max-w-[180px] px-4 py-3">

                                                <div className="text-sm font-medium text-slate-700">

                                                    {
                                                        item.fund_code ??
                                                        "—"
                                                    }

                                                </div>


                                                <div className="truncate text-[11px] text-slate-400">

                                                    {
                                                        item.fund_name ??
                                                        item.fund_acronym ??
                                                        "—"
                                                    }

                                                </div>

                                            </td>


                                            {/* =================================
                                                AMOUNT
                                            ================================= */}

                                            <td className="whitespace-nowrap px-4 py-3 text-right">

                                                <span className="text-sm font-bold text-slate-800">

                                                    {
                                                        formatAmount(
                                                            item.item_amount
                                                        )
                                                    }

                                                </span>

                                            </td>


                                            {/* =================================
                                                RCD
                                            ================================= */}

                                            <td className="px-4 py-3">

                                                {item.rcd_transaction_id ? (

                                                    <div>

                                                        <div className="text-sm font-semibold text-slate-700">

                                                            {
                                                                item.rcd_report_no ??
                                                                "RCD"
                                                            }

                                                        </div>


                                                        {item.rcd_report_date && (

                                                            <div className="mt-0.5 text-[11px] text-slate-400">

                                                                {
                                                                    formatDate(
                                                                        item.rcd_report_date
                                                                    )
                                                                }

                                                            </div>

                                                        )}

                                                    </div>

                                                ) : (

                                                    <span className="text-xs text-slate-400">
                                                        Not in RCD
                                                    </span>

                                                )}

                                            </td>


                                            {/* =================================
                                                REMITTANCE
                                            ================================= */}

                                            <td className="px-4 py-3">

                                                {item.remittance_transaction_id ? (

                                                    <div>

                                                        <div className="text-sm font-semibold text-slate-700">

                                                            {
                                                                item.remittance_no ??
                                                                "—"
                                                            }

                                                        </div>


                                                        {item.remittance_date && (

                                                            <div className="mt-0.5 text-[11px] text-slate-400">

                                                                {
                                                                    formatDate(
                                                                        item.remittance_date
                                                                    )
                                                                }

                                                            </div>

                                                        )}

                                                    </div>

                                                ) : (

                                                    <span className="text-xs text-slate-400">
                                                        Not remitted
                                                    </span>

                                                )}

                                            </td>


                                            {/* =================================
                                                CONSOLIDATED RCD
                                            ================================= */}

                                            <td className="px-4 py-3">

                                                {item.consolidated_transaction_id ? (

                                                    <div>

                                                        <div className="text-sm font-semibold text-slate-700">

                                                            {
                                                                item.consolidated_no ??
                                                                "—"
                                                            }

                                                        </div>


                                                        {item.consolidated_date && (

                                                            <div className="mt-0.5 text-[11px] text-slate-400">

                                                                {
                                                                    formatDate(
                                                                        item.consolidated_date
                                                                    )
                                                                }

                                                            </div>

                                                        )}

                                                    </div>

                                                ) : (

                                                    <span className="text-xs text-slate-400">
                                                        Not consolidated
                                                    </span>

                                                )}

                                            </td>


                                            {/* =================================
                                                COLLECTOR
                                            ================================= */}

                                            <td className="max-w-[180px] px-4 py-3">

                                                <div className="truncate text-sm text-slate-600">

                                                    {
                                                        item.collector_name ??
                                                        "—"
                                                    }

                                                </div>

                                            </td>


                                            {/* =================================
                                                DIPP STATUS
                                            ================================= */}

                                            <td className="px-4 py-3">

                                                <span
                                                    className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${getStatusClass(
                                                        status
                                                    )}`}
                                                >

                                                    {
                                                        status ||
                                                        "—"
                                                    }

                                                </span>


                                                {item.is_cancelled && (

                                                    <div className="mt-1 text-[10px] text-red-500">
                                                        Cancelled
                                                    </div>

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


            {/* ====================================================
                PAGINATION
            ==================================================== */}

            <div className="flex flex-col gap-3 border-t border-slate-200 bg-white px-5 py-3 sm:flex-row sm:items-center sm:justify-between">


                <div className="text-xs text-slate-500">

                    {filteredItems.length === 0 ? (

                        "No records"

                    ) : (

                        <>

                            Showing{" "}

                            <span className="font-semibold text-slate-700">

                                {
                                    (
                                        (
                                            currentPage -
                                            1
                                        ) *
                                        ROWS_PER_PAGE
                                    ) + 1
                                }

                            </span>

                            {" "}to{" "}

                            <span className="font-semibold text-slate-700">

                                {
                                    Math.min(
                                        currentPage *
                                        ROWS_PER_PAGE,
                                        filteredItems.length
                                    )
                                }

                            </span>

                            {" "}of{" "}

                            <span className="font-semibold text-slate-700">

                                {
                                    filteredItems.length
                                }

                            </span>

                            {" "}items

                        </>

                    )}

                </div>


                <div className="flex items-center gap-2">


                    <button
                        type="button"
                        disabled={
                            currentPage <= 1
                        }
                        onClick={() =>
                            setCurrentPage(
                                page =>
                                    Math.max(
                                        1,
                                        page - 1
                                    )
                            )
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >

                        <ChevronLeft
                            size={16}
                        />

                    </button>


                    <div className="min-w-[80px] text-center text-xs font-medium text-slate-600">

                        Page{" "}
                        {currentPage}{" "}
                        of{" "}
                        {totalPages}

                    </div>


                    <button
                        type="button"
                        disabled={
                            currentPage >=
                            totalPages
                        }
                        onClick={() =>
                            setCurrentPage(
                                page =>
                                    Math.min(
                                        totalPages,
                                        page + 1
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