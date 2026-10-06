"use client";

import {
    ReceiptText,
    X,
} from "lucide-react";

interface Props {
    open: boolean;
    onClose: () => void;
}

export default function AF51TransactionForm({
    open,
    onClose,
}: Props) {
    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

            {/* =====================================================
                BACKDROP
            ====================================================== */}

            <div
                className="absolute inset-0 bg-slate-900/50"
                onClick={onClose}
            />

            {/* =====================================================
                MODAL
            ====================================================== */}

            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl">

                {/* =================================================
                    HEADER
                ================================================== */}

                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">

                    <div className="flex items-center gap-3">

                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">

                            <ReceiptText
                                size={20}
                                className="text-blue-700"
                            />

                        </div>

                        <div>

                            <h2 className="text-lg font-bold text-slate-800">
                                AF51 Transaction
                            </h2>

                            <p className="text-sm text-slate-500">
                                Accountable Form 51
                            </p>

                        </div>

                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
                    >
                        <X size={20} />
                    </button>

                </div>

                {/* =================================================
                    BODY
                ================================================== */}

                <div className="max-h-[calc(90vh-140px)] overflow-y-auto p-6">

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        {/* FIELD 1 */}

                        <div>

                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Transaction Date
                            </label>

                            <input
                                type="date"
                                defaultValue={
                                    new Date()
                                        .toISOString()
                                        .substring(
                                            0,
                                            10
                                        )
                                }
                                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />

                        </div>

                        {/* FIELD 2 */}

                        <div>

                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Reference No.
                            </label>

                            <input
                                type="text"
                                placeholder="Enter reference number"
                                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />

                        </div>

                    </div>

                    {/* REMARKS */}

                    <div className="mt-4">

                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Remarks
                        </label>

                        <textarea
                            rows={4}
                            placeholder="Enter remarks"
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />

                    </div>

                </div>

                {/* =================================================
                    FOOTER
                ================================================== */}

                <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">

                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        className="px-5 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold transition"
                    >
                        Create AF51
                    </button>

                </div>

            </div>

        </div>
    );
}