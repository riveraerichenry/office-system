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

            <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl">

                {/* =================================================
                    HEADER
                ================================================== */}

                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">

                    <div className="flex items-center gap-3">

                        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">

                            <ReceiptText
                                size={20}
                                className="text-orange-700"
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
                        className="
                            w-9
                            h-9
                            rounded-lg
                            flex
                            items-center
                            justify-center
                            text-slate-500
                            hover:bg-slate-100
                            hover:text-slate-700
                            transition
                        "
                    >
                        <X size={20} />
                    </button>

                </div>

                {/* =================================================
                    BODY
                ================================================== */}

                <div className="px-6 py-8">

                    <div className="flex flex-col items-center text-center">

                        <div className="
                            w-16
                            h-16
                            rounded-full
                            bg-orange-50
                            flex
                            items-center
                            justify-center
                            mb-4
                        ">

                            <ReceiptText
                                size={28}
                                className="text-orange-600"
                            />

                        </div>

                        <h3 className="text-lg font-bold text-slate-800">
                            AF51 Transaction Not Available
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-slate-500 max-w-sm">
                            The AF51 transaction feature is
                            currently unavailable. Please try
                            again once this feature has been
                            enabled.
                        </p>

                        <div className="
                            mt-5
                            w-full
                            rounded-lg
                            border
                            border-orange-200
                            bg-orange-50
                            px-4
                            py-3
                            text-sm
                            text-orange-800
                        ">
                            <span className="font-semibold">
                                Status:
                            </span>{" "}
                            Not available at the moment
                        </div>

                    </div>

                </div>

                {/* =================================================
                    FOOTER
                ================================================== */}

                <div className="flex justify-end border-t border-slate-200 px-6 py-4">

                    <button
                        type="button"
                        onClick={onClose}
                        className="
                            px-5
                            py-2.5
                            rounded-lg
                            bg-slate-800
                            text-white
                            text-sm
                            font-semibold
                            hover:bg-slate-900
                            transition
                        "
                    >
                        Close
                    </button>

                </div>

            </div>

        </div>
    );
}