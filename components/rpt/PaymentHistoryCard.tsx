"use client";

import {
    CreditCard,
    Receipt,
    Plus,
} from "lucide-react";

import type { Property } from "./PropertyDetailsCard";

type Props = {
    property: Property;
    onAddPayment: () => void;
    onCreateBilling: () => void;
};

export default function PaymentHistoryCard({
    property,
    onAddPayment,
    onCreateBilling,
}: Props) {
    return (
        <div
            className="
                h-full
                overflow-hidden
                rounded-2xl
                border
                border-slate-200
                bg-white
                shadow-[0_10px_35px_rgba(0,0,0,0.06)]
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-[0_18px_45px_rgba(0,0,0,0.10)]
            "
        >
            {/* =========================================================
                HEADER
            ========================================================= */}

            <div
                className="
                    relative
                    overflow-hidden
                    border-b
                    border-orange-600
                    bg-orange-500
                    px-5
                    py-5
                    text-white
                "
            >
                {/* Decorative circle */}

                <div
                    className="
                        absolute
                        -right-10
                        -top-12
                        h-32
                        w-32
                        rounded-full
                        bg-white/[0.10]
                    "
                />

                <div
                    className="
                        relative
                        flex
                        flex-col
                        gap-4
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                    "
                >
                    {/* =================================================
                        TITLE
                    ================================================= */}

                    <div
                        className="
                            flex
                            items-center
                            gap-3
                        "
                    >
                        <div
                            className="
                                flex
                                h-10
                                w-10
                                shrink-0
                                items-center
                                justify-center
                                rounded-xl
                                bg-white/15
                                ring-1
                                ring-white/20
                            "
                        >
                            <CreditCard size={19} />
                        </div>

                        <div>
                            <h2
                                className="
                                    text-base
                                    font-bold
                                "
                            >
                                Payment History
                            </h2>

                            <p
                                className="
                                    mt-0.5
                                    text-[11px]
                                    text-orange-100
                                "
                            >
                                RPT payment activity
                            </p>
                        </div>
                    </div>

                    {/* =================================================
                        ACTION BUTTONS
                    ================================================= */}

                    <div
                        className="
                            flex
                            items-center
                            gap-2
                        "
                    >
                        {/* CREATE BILLING */}

                        <button
                            type="button"
                            onClick={onCreateBilling}
                            className="
                                inline-flex
                                items-center
                                justify-center
                                gap-1.5
                                rounded-lg
                                bg-white
                                px-3
                                py-2
                                text-xs
                                font-bold
                                text-blue-600
                                shadow-sm
                                transition-all
                                duration-200
                                hover:-translate-y-0.5
                                hover:bg-blue-50
                                hover:shadow-md
                                active:translate-y-0
                            "
                        >
                            <Receipt size={15} />

                            Create Billing
                        </button>

                        {/* ADD PAYMENT */}

                        <button
                            type="button"
                            onClick={onAddPayment}
                            className="
                                inline-flex
                                items-center
                                justify-center
                                gap-1.5
                                rounded-lg
                                border
                                border-white/30
                                bg-orange-600
                                px-3
                                py-2
                                text-xs
                                font-bold
                                text-white
                                shadow-sm
                                transition-all
                                duration-200
                                hover:-translate-y-0.5
                                hover:bg-orange-700
                                hover:shadow-md
                                active:translate-y-0
                            "
                        >
                            <Plus size={15} />

                            Add Payment
                        </button>
                    </div>
                </div>
            </div>

            {/* =========================================================
                BODY
            ========================================================= */}

            <div className="p-5">

                {/* =====================================================
                    TOTAL PAID
                ===================================================== */}

                <div
                    className="
                        relative
                        overflow-hidden
                        rounded-2xl
                        border
                        border-orange-100
                        bg-orange-50
                        p-5
                    "
                >
                    <div
                        className="
                            absolute
                            -bottom-10
                            -right-10
                            h-28
                            w-28
                            rounded-full
                            bg-white/70
                        "
                    />

                    <div className="relative">
                        <p
                            className="
                                text-[10px]
                                font-bold
                                uppercase
                                tracking-[0.12em]
                                text-orange-600
                            "
                        >
                            Total Paid
                        </p>

                        <p
                            className="
                                mt-2
                                text-2xl
                                font-bold
                                tracking-tight
                                text-slate-900
                            "
                        >
                            —
                        </p>

                        <div
                            className="
                                mt-3
                                flex
                                items-center
                                gap-2
                            "
                        >
                            <span
                                className="
                                    flex
                                    h-5
                                    w-5
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-orange-500
                                    text-white
                                "
                            >
                                <Receipt size={11} />
                            </span>

                            <span
                                className="
                                    text-[10px]
                                    font-medium
                                    text-slate-500
                                "
                            >
                                Payment records will appear here
                            </span>
                        </div>
                    </div>
                </div>

                {/* =====================================================
                    RECENT PAYMENTS
                ===================================================== */}

                <div className="mt-5">
                    <div
                        className="
                            mb-3
                            flex
                            items-center
                            justify-between
                        "
                    >
                        <h3
                            className="
                                text-sm
                                font-bold
                                text-slate-900
                            "
                        >
                            Recent Payments
                        </h3>

                        <span
                            className="
                                rounded-full
                                bg-slate-100
                                px-2.5
                                py-1
                                text-[10px]
                                font-semibold
                                text-slate-500
                            "
                        >
                            0 Records
                        </span>
                    </div>

                    {/* EMPTY STATE */}

                    <div
                        className="
                            rounded-2xl
                            border
                            border-dashed
                            border-slate-300
                            bg-slate-50/70
                            px-5
                            py-10
                            text-center
                            transition-all
                            duration-300
                            hover:border-orange-300
                            hover:bg-orange-50/30
                        "
                    >
                        <div
                            className="
                                mx-auto
                                flex
                                h-12
                                w-12
                                items-center
                                justify-center
                                rounded-2xl
                                bg-white
                                text-orange-500
                                shadow-sm
                            "
                        >
                            <Receipt size={20} />
                        </div>

                        <h4
                            className="
                                mt-3
                                text-sm
                                font-bold
                                text-slate-700
                            "
                        >
                            No payment history
                        </h4>

                        <p
                            className="
                                mx-auto
                                mt-1.5
                                max-w-[240px]
                                text-xs
                                leading-5
                                text-slate-400
                            "
                        >
                            Payment records for this property
                            will appear here once available.
                        </p>
                    </div>
                </div>

                {/* =====================================================
                    PROPERTY REFERENCE
                ===================================================== */}

                <div
                    className="
                        mt-5
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        p-4
                        shadow-sm
                        transition-all
                        hover:border-blue-200
                        hover:shadow-md
                    "
                >
                    <div
                        className="
                            flex
                            items-center
                            justify-between
                            gap-3
                        "
                    >
                        {/* TD NUMBER */}

                        <div>
                            <p
                                className="
                                    text-[10px]
                                    font-bold
                                    uppercase
                                    tracking-[0.1em]
                                    text-slate-400
                                "
                            >
                                Property
                            </p>

                            <p
                                className="
                                    mt-1
                                    text-sm
                                    font-bold
                                    text-slate-900
                                "
                            >
                                {property.tdno || "-"}
                            </p>
                        </div>

                        {/* BARANGAY */}

                        <div className="text-right">
                            <p
                                className="
                                    text-[10px]
                                    font-bold
                                    uppercase
                                    tracking-[0.1em]
                                    text-slate-400
                                "
                            >
                                Barangay
                            </p>

                            <p
                                className="
                                    mt-1
                                    max-w-[140px]
                                    truncate
                                    text-xs
                                    font-semibold
                                    text-slate-700
                                "
                            >
                                {property.barangay_name || "-"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}