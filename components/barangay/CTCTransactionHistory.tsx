"use client";

import {
    FileText,
    Plus,
    Receipt,
} from "lucide-react";

export default function CTCTransactionHistory() {
    return (
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">

                {/* =====================================================
                    CTC TRANSACTION HISTORY
                ====================================================== */}
                <div className="border-b lg:border-b-0 lg:border-r border-slate-200">

                    {/* HEADER */}
                    <div className="px-5 py-4 border-b border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                                <FileText className="w-5 h-5" />
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-slate-800">
                                    CTC Transaction History
                                </h3>

                                <p className="text-sm text-slate-500 mt-1">
                                    Recently issued Community Tax Certificates.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* CONTENT */}
                    <div className="p-5">

                        {/* SEARCH */}
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Search CTC transaction..."
                                className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        {/* TABLE */}
                        <div className="border border-slate-200 rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[500px] text-sm">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-semibold text-slate-600">
                                                CTC No.
                                            </th>

                                            <th className="px-4 py-3 text-left font-semibold text-slate-600">
                                                Taxpayer
                                            </th>

                                            <th className="px-4 py-3 text-left font-semibold text-slate-600">
                                                Date
                                            </th>

                                            <th className="px-4 py-3 text-right font-semibold text-slate-600">
                                                Amount
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="px-4 py-10 text-center"
                                            >
                                                <div className="flex flex-col items-center">
                                                    <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                                                        <FileText className="w-5 h-5 text-slate-400" />
                                                    </div>

                                                    <p className="text-sm font-medium text-slate-600">
                                                        No CTC transactions
                                                    </p>

                                                    <p className="text-xs text-slate-400 mt-1">
                                                        Issued CTC transactions
                                                        will appear here.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* =====================================================
                    RCD HISTORY
                ====================================================== */}
                <div>

                    {/* HEADER */}
                    <div className="px-5 py-4 border-b border-slate-200">
                        <div className="flex items-center justify-between gap-4">

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                                    <Receipt className="w-5 h-5" />
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">
                                        RCD History
                                    </h3>

                                    <p className="text-sm text-slate-500 mt-1">
                                        Revenue Collection Documents.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="shrink-0 h-10 px-4 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold flex items-center gap-2 transition"
                            >
                                <Plus className="w-4 h-4" />
                                Create RCD
                            </button>

                        </div>
                    </div>

                    {/* CONTENT */}
                    <div className="p-5">

                        {/* SEARCH */}
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Search RCD..."
                                className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        {/* TABLE */}
                        <div className="border border-slate-200 rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[500px] text-sm">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-semibold text-slate-600">
                                                RCD No.
                                            </th>

                                            <th className="px-4 py-3 text-left font-semibold text-slate-600">
                                                Date
                                            </th>

                                            <th className="px-4 py-3 text-right font-semibold text-slate-600">
                                                Amount
                                            </th>

                                            <th className="px-4 py-3 text-center font-semibold text-slate-600">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="px-4 py-10 text-center"
                                            >
                                                <div className="flex flex-col items-center">
                                                    <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                                                        <Receipt className="w-5 h-5 text-slate-400" />
                                                    </div>

                                                    <p className="text-sm font-medium text-slate-600">
                                                        No RCD records
                                                    </p>

                                                    <p className="text-xs text-slate-400 mt-1">
                                                        Created RCDs will
                                                        appear here.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}