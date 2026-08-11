"use client";

import {
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

type Row = {
    id: string;
    or_number: string;
    payor: string;
    form_code: string;
    receipt_date: string;
    grand_total: number | string;
};

type Props = {
    rows: Row[];
    loading: boolean;

    page: number;
    totalPages: number;
    totalRecords: number;

    viewMode: "daily" | "monthly";

    onViewModeChange: (
        mode: "daily" | "monthly"
    ) => void;

    onPageChange: (
        page: number
    ) => void;

    onSelectTransaction: (
        id: string
    ) => void;
};

export default function DailyCollections({
    rows,
    loading,
    page,
    totalPages,
    totalRecords,
    viewMode,
    onViewModeChange,
    onPageChange,
    onSelectTransaction,
}: Props) {
    /*
    |--------------------------------------------------------------------------
    | Currency
    |--------------------------------------------------------------------------
    */

    const formatCurrency = (
        value: number | string
    ) => {
        const amount = Number(value);

        if (Number.isNaN(amount)) {
            return "₱0.00";
        }

        return amount.toLocaleString(
            "en-PH",
            {
                style: "currency",
                currency: "PHP",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Header Description
    |--------------------------------------------------------------------------
    */

    const description =
        viewMode === "daily"
            ? "Transactions made today"
            : "Transactions made within the current month";

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <div className="rounded-xl border bg-white shadow-sm">

            {/* ==============================================================
                HEADER
            ============================================================== */}

            <div className="border-b px-5 py-4">

                <div className="flex items-center justify-between gap-4">

                    {/* ======================================================
                        Title
                    ====================================================== */}

                    <div>

                        <h2 className="text-lg font-bold text-slate-800">
                            Collection History
                        </h2>

                        <p className="text-sm text-slate-500">
                            {description}
                        </p>

                    </div>

                    {/* ======================================================
                        Right Side
                    ====================================================== */}

                    <div className="flex items-center gap-5">

                        {/* ==================================================
                            Daily / Monthly Toggle
                        ================================================== */}

                        <div className="flex rounded-lg border bg-slate-100 p-1">

                            {/* =================================================
                                DAILY
                            ================================================= */}

                            <button
                                type="button"
                                onClick={() =>
                                    onViewModeChange(
                                        "daily"
                                    )
                                }
                                className={`
                                    rounded-md
                                    px-4
                                    py-2
                                    text-sm
                                    font-semibold
                                    transition
                                    ${
                                        viewMode ===
                                        "daily"
                                            ? "bg-white text-blue-700 shadow-sm"
                                            : "text-slate-500 hover:text-slate-700"
                                    }
                                `}
                            >
                                Daily
                            </button>

                            {/* =================================================
                                MONTHLY
                            ================================================= */}

                            <button
                                type="button"
                                onClick={() =>
                                    onViewModeChange(
                                        "monthly"
                                    )
                                }
                                className={`
                                    rounded-md
                                    px-4
                                    py-2
                                    text-sm
                                    font-semibold
                                    transition
                                    ${
                                        viewMode ===
                                        "monthly"
                                            ? "bg-white text-blue-700 shadow-sm"
                                            : "text-slate-500 hover:text-slate-700"
                                    }
                                `}
                            >
                                Monthly
                            </button>

                        </div>

                        {/* ==================================================
                            Total Records
                        ================================================== */}

                        <div className="text-right">

                            <p className="text-xs uppercase text-slate-500">
                                Total Records
                            </p>

                            <p className="text-xl font-bold text-slate-800">
                                {totalRecords}
                            </p>

                        </div>

                    </div>

                </div>

            </div>

            {/* ==============================================================
                TABLE
            ============================================================== */}

            <div className="overflow-hidden">

                <table className="w-full">

                    {/* ======================================================
                        TABLE HEADER
                    ====================================================== */}

                    <thead className="bg-slate-100">

                        <tr>

                            <th className="px-3 py-3 text-left text-xs font-semibold uppercase">
                                OR No.
                            </th>

                            <th className="px-3 py-3 text-left text-xs font-semibold uppercase">
                                Payor
                            </th>

                            <th className="px-3 py-3 text-center text-xs font-semibold uppercase">
                                Form
                            </th>

                            <th className="px-3 py-3 text-right text-xs font-semibold uppercase">
                                Amount
                            </th>

                        </tr>

                    </thead>

                    {/* ======================================================
                        TABLE BODY
                    ====================================================== */}

                    <tbody>

                        {/* ==================================================
                            LOADING
                        ================================================== */}

                        {loading && (
                            <tr>

                                <td
                                    colSpan={4}
                                    className="py-12 text-center text-slate-500"
                                >
                                    Loading collections...
                                </td>

                            </tr>
                        )}

                        {/* ==================================================
                            EMPTY
                        ================================================== */}

                        {!loading &&
                            rows.length === 0 && (
                                <tr>

                                    <td
                                        colSpan={4}
                                        className="py-12 text-center text-slate-500"
                                    >
                                        {viewMode ===
                                        "daily"
                                            ? "No transactions today."
                                            : "No transactions this month."}
                                    </td>

                                </tr>
                            )}

                        {/* ==================================================
                            TRANSACTIONS
                        ================================================== */}

                        {!loading &&
                            rows.map(
                                (row) => (
                                    <tr
                                        key={
                                            row.id
                                        }
                                        onClick={() =>
                                            onSelectTransaction(
                                                row.id
                                            )
                                        }
                                        className="cursor-pointer border-t transition hover:bg-blue-50"
                                    >

                                        {/* ==================================
                                            OR NUMBER
                                        ================================== */}

                                        <td className="px-3 py-3 font-semibold text-slate-800">
                                            {row.or_number}
                                        </td>

                                        {/* ==================================
                                            PAYOR
                                        ================================== */}

                                        <td className="max-w-[220px] truncate px-3 py-3">
                                            {row.payor}
                                        </td>

                                        {/* ==================================
                                            FORM
                                        ================================== */}

                                        <td className="px-3 py-3 text-center">

                                            <span className="rounded bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                                                {row.form_code}
                                            </span>

                                        </td>

                                        {/* ==================================
                                            AMOUNT
                                        ================================== */}

                                        <td className="px-3 py-3 text-right font-semibold text-green-700">
                                            {formatCurrency(
                                                row.grand_total
                                            )}
                                        </td>

                                    </tr>
                                )
                            )}

                    </tbody>

                </table>

            </div>

            {/* ==============================================================
                PAGINATION
            ============================================================== */}

            <div className="flex items-center justify-between border-t bg-slate-50 px-4 py-3">

                {/* ==========================================================
                    PREVIOUS
                ========================================================== */}

                <button
                    type="button"
                    disabled={
                        page <= 1 ||
                        loading
                    }
                    onClick={() =>
                        onPageChange(
                            page - 1
                        )
                    }
                    className="
                        inline-flex
                        items-center
                        gap-2
                        rounded-lg
                        border
                        px-3
                        py-2
                        text-sm
                        font-medium
                        transition
                        hover:bg-slate-100
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                    "
                >
                    <ChevronLeft
                        size={16}
                    />

                    Previous
                </button>

                {/* ==========================================================
                    PAGE
                ========================================================== */}

                <div className="text-sm text-slate-600">

                    Page

                    <span className="mx-1 font-bold">
                        {page}
                    </span>

                    of

                    <span className="mx-1 font-bold">
                        {Math.max(
                            1,
                            totalPages
                        )}
                    </span>

                </div>

                {/* ==========================================================
                    NEXT
                ========================================================== */}

                <button
                    type="button"
                    disabled={
                        page >=
                            Math.max(
                                1,
                                totalPages
                            ) ||
                        loading
                    }
                    onClick={() =>
                        onPageChange(
                            page + 1
                        )
                    }
                    className="
                        inline-flex
                        items-center
                        gap-2
                        rounded-lg
                        border
                        px-3
                        py-2
                        text-sm
                        font-medium
                        transition
                        hover:bg-slate-100
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                    "
                >
                    Next

                    <ChevronRight
                        size={16}
                    />
                </button>

            </div>

        </div>
    );
}