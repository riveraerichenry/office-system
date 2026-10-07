"use client";

import {
    FileText,
    Receipt,
    TrendingUp,
    Wallet,
} from "lucide-react";

interface BarangayDashboardSummaryProps {
    todayCollection?: number;
    monthlyCollection?: number;
    totalCollection?: number;
    transactionsToday?: number;
    ctcIssued?: number;
    af51Transactions?: number;
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

export default function BarangayDashboardSummary({
    todayCollection = 0,
    monthlyCollection = 0,
    totalCollection = 0,
    transactionsToday = 0,
    ctcIssued = 0,
    af51Transactions = 0,
}: BarangayDashboardSummaryProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

            {/* =================================================
                COLLECTION
            ================================================== */}

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">

                <div className="flex items-start justify-between">

                    <div className="flex-1 min-w-0">

                        <p className="text-sm font-medium text-slate-500">
                            Collection
                        </p>

                        <div className="grid grid-cols-3 gap-3 mt-4">

                            {/* TODAY */}

                            <div className="min-w-0">
                                <p className="text-xs text-slate-400">
                                    Today
                                </p>

                                <p className="text-sm font-bold text-slate-800 mt-1 truncate">
                                    {formatCurrency(todayCollection)}
                                </p>
                            </div>

                            {/* THIS MONTH */}

                            <div className="min-w-0">
                                <p className="text-xs text-slate-400">
                                    This Month
                                </p>

                                <p className="text-sm font-bold text-slate-800 mt-1 truncate">
                                    {formatCurrency(monthlyCollection)}
                                </p>
                            </div>

                            {/* TOTAL */}

                            <div className="min-w-0">
                                <p className="text-xs text-slate-400">
                                    Total
                                </p>

                                <p className="text-sm font-bold text-slate-800 mt-1 truncate">
                                    {formatCurrency(totalCollection)}
                                </p>
                            </div>

                        </div>

                    </div>

                    <div className="ml-3 w-11 h-11 shrink-0 rounded-lg bg-emerald-50 flex items-center justify-center">

                        <Wallet className="w-5 h-5 text-emerald-700" />

                    </div>

                </div>

            </div>

            {/* =================================================
                TRANSACTION SUMMARY
            ================================================== */}

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">

                <div className="flex items-start justify-between">

                    <div className="flex-1 min-w-0">

                        <p className="text-sm font-medium text-slate-500">
                            Transactions
                        </p>

                        <div className="grid grid-cols-3 gap-3 mt-4">

                            {/* TODAY */}

                           

                            {/* CTC */}

                            <div className="min-w-0">
                                <p className="text-xs text-slate-400">
                                    CTC
                                </p>

                                <p className="text-xl font-bold text-slate-800 mt-1">
                                    {ctcIssued}
                                </p>
                            </div>

                            {/* AF51 */}

                            <div className="min-w-0">
                                <p className="text-xs text-slate-400">
                                    AF51
                                </p>

                                <p className="text-xl font-bold text-slate-800 mt-1">
                                    {af51Transactions}
                                </p>
                            </div>

                        </div>

                    </div>

                    <div className="ml-3 w-11 h-11 shrink-0 rounded-lg bg-blue-50 flex items-center justify-center">

                        <Receipt className="w-5 h-5 text-blue-700" />

                    </div>

                </div>

            </div>
            {/* =================================================
                CTC
            ================================================== */}

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">

                <div className="flex items-start justify-between">

                    <div>

                        <p className="text-sm font-medium text-slate-500">
                            CTC Issued
                        </p>

                        <p className="text-2xl font-bold text-slate-800 mt-2">
                            {ctcIssued}
                        </p>

                        <p className="text-xs text-slate-400 mt-1">
                            Today's CTC transactions
                        </p>

                    </div>

                    <div className="w-11 h-11 shrink-0 rounded-lg bg-indigo-50 flex items-center justify-center">

                        <FileText className="w-5 h-5 text-indigo-700" />

                    </div>

                </div>

            </div>

            {/* =================================================
                AF51
            ================================================== */}

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">

                <div className="flex items-start justify-between">

                    <div>

                        <p className="text-sm font-medium text-slate-500">
                            AF51 Transactions
                        </p>

                        <p className="text-2xl font-bold text-slate-800 mt-2">
                            {af51Transactions}
                        </p>

                        <p className="text-xs text-slate-400 mt-1">
                            Today's AF51 transactions
                        </p>

                    </div>

                    <div className="w-11 h-11 shrink-0 rounded-lg bg-orange-50 flex items-center justify-center">

                        <TrendingUp className="w-5 h-5 text-orange-700" />

                    </div>

                </div>

            </div>

        </div>
    );
}