"use client";

import { useState } from "react";

import {
    BookOpen,
    ReceiptText,
} from "lucide-react";

import CTCTransactionForm from "./CTCTransactionForm";
import AF51TransactionForm from "./AF51TransactionForm";

type TransactionType = "ctc" | "af51" | null;

export default function CreateTransaction() {
    const [transactionType, setTransactionType] =
        useState<TransactionType>(null);

    function closeModal() {
        setTransactionType(null);
    }

    return (
        <>
            {/* =====================================================
                TRANSACTION TYPE
            ====================================================== */}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* =================================================
                    CTC
                ================================================== */}

                <button
                    type="button"
                    onClick={() =>
                        setTransactionType("ctc")
                    }
                    className="w-full rounded-xl border-2 border-slate-200 bg-white p-4 text-left transition hover:border-blue-400 hover:bg-slate-50 hover:shadow-sm"
                >
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">

                        <BookOpen
                            size={20}
                            className="text-blue-700"
                        />

                    </div>

                    <h4 className="text-sm font-bold text-slate-800">
                        CTC Transaction
                    </h4>

                    <p className="mt-1 text-xs text-slate-500">
                        Community Tax Certificate
                    </p>

                </button>

                {/* =================================================
                    AF51
                ================================================== */}

                <button
                    type="button"
                    onClick={() =>
                        setTransactionType("af51")
                    }
                    className="w-full rounded-xl border-2 border-slate-200 bg-white p-4 text-left transition hover:border-blue-400 hover:bg-slate-50 hover:shadow-sm"
                >
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">

                        <ReceiptText
                            size={20}
                            className="text-blue-700"
                        />

                    </div>

                    <h4 className="text-sm font-bold text-slate-800">
                        AF51 Transaction
                    </h4>

                    <p className="mt-1 text-xs text-slate-500">
                        Accountable Form 51
                    </p>

                </button>

            </div>

            {/* =====================================================
                CTC MODAL
            ====================================================== */}

            {transactionType === "ctc" && (
                <CTCTransactionForm
                    open={true}
                    onClose={closeModal}
                />
            )}

            {/* =====================================================
                AF51 MODAL
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