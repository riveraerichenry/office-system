"use client";

import { useEffect, useState } from "react";

import {
    ArrowRight,
    BookOpen,
    ReceiptText,
} from "lucide-react";

import CTCTransactionForm from "./CTCTransactionForm";
import AF51TransactionForm from "./AF51TransactionForm";

type TransactionType = "ctc" | "af51" | null;

interface TransactionSummary {
    todayCollection: number;
    todayTransactions: number;
    monthlyCollection: number;
    monthlyTransactions: number;
}

interface DashboardSummaryResponse {
    success: boolean;
    ctc?: TransactionSummary;
    message?: string;
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

const emptySummary: TransactionSummary = {
    todayCollection: 0,
    todayTransactions: 0,
    monthlyCollection: 0,
    monthlyTransactions: 0,
};

export default function CreateTransaction() {
    const [transactionType, setTransactionType] =
        useState<TransactionType>(null);

    const [ctcSummary, setCtcSummary] =
        useState<TransactionSummary>(emptySummary);

    const [loadingSummary, setLoadingSummary] =
        useState(true);

    useEffect(() => {
        loadDashboardSummary();
    }, []);

    async function loadDashboardSummary() {
        try {
            setLoadingSummary(true);

            const response = await fetch(
                "/api/barangays/dashboard-summary",
                {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store",
                }
            );

            const data: DashboardSummaryResponse =
                await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                        "Failed to load dashboard summary."
                );
            }

            if (data.ctc) {
                setCtcSummary({
                    todayCollection:
                        Number(
                            data.ctc.todayCollection
                        ) || 0,

                    todayTransactions:
                        Number(
                            data.ctc.todayTransactions
                        ) || 0,

                    monthlyCollection:
                        Number(
                            data.ctc.monthlyCollection
                        ) || 0,

                    monthlyTransactions:
                        Number(
                            data.ctc.monthlyTransactions
                        ) || 0,
                });
            }
        } catch (error) {
            console.error(
                "Failed to load dashboard summary:",
                error
            );

            setCtcSummary(emptySummary);
        } finally {
            setLoadingSummary(false);
        }
    }

    function closeModal() {
        setTransactionType(null);

        /*
         * Refresh the dashboard after closing a transaction
         * so newly recorded transactions can appear in the
         * collection summary.
         */
        loadDashboardSummary();
    }

    return (
        <>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

                {/* =====================================================
                    CTC TRANSACTION
                ====================================================== */}

                <button
                    type="button"
                    onClick={() =>
                        setTransactionType("ctc")
                    }
                    className="
                        group
                        w-full
                        overflow-hidden
                        rounded-2xl
                        bg-white
                        border
                        border-slate-200
                        text-left
                        shadow-sm
                        transition-all
                        duration-200
                        hover:-translate-y-0.5
                        hover:shadow-lg
                        hover:border-blue-300
                        focus:outline-none
                        focus:ring-2
                        focus:ring-blue-300
                        focus:ring-offset-2
                    "
                >
                    {/* HEADER */}

                    <div className="bg-blue-700 p-5 text-white">

                        <div className="flex items-start justify-between gap-4">

                            <div className="flex items-center gap-4">

                                <div
                                    className="
                                        flex
                                        h-12
                                        w-12
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-white/15
                                    "
                                >
                                    <BookOpen className="h-6 w-6" />
                                </div>

                                <div>

                                    <h3 className="text-lg font-bold">
                                        CTC Transaction
                                    </h3>

                                    <p className="mt-0.5 text-sm text-blue-100">
                                        Community Tax Certificate
                                    </p>

                                </div>

                            </div>

                            <div
                                className="
                                    flex
                                    h-10
                                    w-10
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-white/15
                                    transition-transform
                                    duration-200
                                    group-hover:translate-x-1
                                "
                            >
                                <ArrowRight className="h-5 w-5" />
                            </div>

                        </div>

                    </div>

                    {/* COLLECTION SUMMARY */}

                    <div className="p-5">

                        <div className="grid grid-cols-2 gap-5">

                            {/* TODAY */}

                            <div>

                                <p className="text-xs font-medium text-slate-500">
                                    Today's Collection
                                </p>

                                {loadingSummary ? (
                                    <div className="mt-2 h-7 w-28 rounded bg-slate-100 animate-pulse" />
                                ) : (
                                    <p className="mt-1 text-xl font-bold text-slate-800">
                                        {formatCurrency(
                                            ctcSummary.todayCollection
                                        )}
                                    </p>
                                )}

                                <p className="mt-1 text-xs text-slate-400">
                                    {loadingSummary
                                        ? "Loading..."
                                        : `${ctcSummary.todayTransactions} transaction${
                                              ctcSummary.todayTransactions !==
                                              1
                                                  ? "s"
                                                  : ""
                                          }`}
                                </p>

                            </div>

                            {/* THIS MONTH */}

                            <div className="border-l border-slate-200 pl-5">

                                <p className="text-xs font-medium text-slate-500">
                                    This Month
                                </p>

                                {loadingSummary ? (
                                    <div className="mt-2 h-7 w-28 rounded bg-slate-100 animate-pulse" />
                                ) : (
                                    <p className="mt-1 text-xl font-bold text-slate-800">
                                        {formatCurrency(
                                            ctcSummary.monthlyCollection
                                        )}
                                    </p>
                                )}

                                <p className="mt-1 text-xs text-slate-400">
                                    {loadingSummary
                                        ? "Loading..."
                                        : `${ctcSummary.monthlyTransactions} transaction${
                                              ctcSummary.monthlyTransactions !==
                                              1
                                                  ? "s"
                                                  : ""
                                          }`}
                                </p>

                            </div>

                        </div>

                        {/* ACTION */}

                        <div className="mt-5 border-t border-slate-100 pt-4">

                            <div className="flex items-center justify-between">

                                <span className="text-xs font-semibold text-blue-700">
                                    Start CTC Transaction
                                </span>

                                <ArrowRight
                                    className="
                                        h-4
                                        w-4
                                        text-blue-600
                                        transition-transform
                                        duration-200
                                        group-hover:translate-x-1
                                    "
                                />

                            </div>

                        </div>

                    </div>

                </button>

                {/* =====================================================
                    AF51 TRANSACTION
                ====================================================== */}

                <button
                    type="button"
                    onClick={() =>
                        setTransactionType("af51")
                    }
                    className="
                        group
                        w-full
                        overflow-hidden
                        rounded-2xl
                        bg-white
                        border
                        border-slate-200
                        text-left
                        shadow-sm
                        transition-all
                        duration-200
                        hover:-translate-y-0.5
                        hover:shadow-lg
                        hover:border-orange-300
                        focus:outline-none
                        focus:ring-2
                        focus:ring-orange-300
                        focus:ring-offset-2
                    "
                >
                    {/* HEADER */}

                    <div className="bg-orange-600 p-5 text-white">

                        <div className="flex items-start justify-between gap-4">

                            <div className="flex items-center gap-4">

                                <div
                                    className="
                                        flex
                                        h-12
                                        w-12
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-white/15
                                    "
                                >
                                    <ReceiptText className="h-6 w-6" />
                                </div>

                                <div>

                                    <h3 className="text-lg font-bold">
                                        AF51 Transaction
                                    </h3>

                                    <p className="mt-0.5 text-sm text-orange-100">
                                        Accountable Form 51
                                    </p>

                                </div>

                            </div>

                            <div
                                className="
                                    flex
                                    h-10
                                    w-10
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-white/15
                                    transition-transform
                                    duration-200
                                    group-hover:translate-x-1
                                "
                            >
                                <ArrowRight className="h-5 w-5" />
                            </div>

                        </div>

                    </div>

                    {/* COLLECTION SUMMARY */}

                    <div className="p-5">

                        <div className="grid grid-cols-2 gap-5">

                            <div>

                                <p className="text-xs font-medium text-slate-500">
                                    Today's Collection
                                </p>

                                <p className="mt-1 text-xl font-bold text-slate-800">
                                    ₱0.00
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                    0 transactions
                                </p>

                            </div>

                            <div className="border-l border-slate-200 pl-5">

                                <p className="text-xs font-medium text-slate-500">
                                    This Month
                                </p>

                                <p className="mt-1 text-xl font-bold text-slate-800">
                                    ₱0.00
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                    0 transactions
                                </p>

                            </div>

                        </div>

                        {/* ACTION */}

                        <div className="mt-5 border-t border-slate-100 pt-4">

                            <div className="flex items-center justify-between">

                                <span className="text-xs font-semibold text-orange-700">
                                    Start AF51 Transaction
                                </span>

                                <ArrowRight
                                    className="
                                        h-4
                                        w-4
                                        text-orange-600
                                        transition-transform
                                        duration-200
                                        group-hover:translate-x-1
                                    "
                                />

                            </div>

                        </div>

                    </div>

                </button>

            </div>

            {/* =====================================================
                CTC FORM
            ====================================================== */}

            {transactionType === "ctc" && (
                <CTCTransactionForm
                    open={true}
                    onClose={closeModal}
                />
            )}

            {/* =====================================================
                AF51 FORM
            ====================================================== */}

            {transactionType === "af51" && (
                <AF51TransactionForm
                    open={true}
                    onClose={closeModal}
                />
            )}
        </>
    );
}