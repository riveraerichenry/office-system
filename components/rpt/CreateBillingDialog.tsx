"use client";

import { useState } from "react";

type Props = {
    open: boolean;
    onClose: () => void;
    property: any;
    onBillingCreated: (data: any) => void;
};

const quarters = [
    "1st Quarter",
    "2nd Quarter",
    "3rd Quarter",
    "4th Quarter",
];

const currentYear = new Date().getFullYear();

export default function CreateBillingDialog({
    open,
    onClose,
    property,
    onBillingCreated,
}: Props) {
    const [fromQuarter, setFromQuarter] = useState(1);
    const [fromYear, setFromYear] = useState(currentYear);

    const [toQuarter, setToQuarter] = useState(4);
    const [toYear, setToYear] = useState(currentYear);

    if (!open || !property) return null;

    function createBilling() {
        const start =
            fromYear * 10 + fromQuarter;

        const end =
            toYear * 10 + toQuarter;

        if (start > end) {
            alert(
                "Coverage From cannot be greater than Coverage To."
            );

            return;
        }

        onBillingCreated({
            property,

            fromQuarter,
            fromYear,

            toQuarter,
            toYear,
        });

        onClose();
    }

    return (
        <div
            className="
                fixed
                inset-0
                z-50
                flex
                items-center
                justify-center
                bg-black/50
                p-2
                sm:p-4
            "
        >
            <div
                className="
                    flex
                    w-full
                    max-w-5xl
                    max-h-[calc(100vh-1rem)]
                    sm:max-h-[calc(100vh-2rem)]
                    flex-col
                    overflow-hidden
                    rounded-lg
                    sm:rounded-xl
                    bg-white
                    shadow-2xl
                "
            >

                {/* =====================================================
                    HEADER
                ====================================================== */}

                <div
                    className="
                        flex
                        shrink-0
                        items-start
                        justify-between
                        gap-4
                        border-b
                        border-slate-200
                        px-4
                        py-3
                        sm:px-6
                        sm:py-3.5
                    "
                >

                    <div className="min-w-0 flex-1">

                        {/* =================================================
                            PROPERTY SUMMARY
                        ================================================== */}

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">

                            <h2
                                className="
                                    text-base
                                    font-semibold
                                    leading-5
                                    text-slate-900
                                    sm:text-lg
                                "
                            >
                                 {property.owner_name || "-"}
                            </h2>

                            <span className="hidden text-slate-300 sm:inline">
                                |
                            </span>

                            <span className="text-xs text-slate-500">
                                PIN:
                                <span className="ml-1 font-semibold text-slate-800">
                                    {property.fullpin || "-"}
                                </span>
                            </span>

                            <span className="hidden text-slate-300 sm:inline">
                                |
                            </span>

                            <span className="text-xs text-slate-500">
                                TD:
                                <span className="ml-1 font-semibold text-slate-800">
                                    {property.tdno || "-"}
                                </span>
                            </span>

                        </div>


                        {/* =================================================
                            PROPERTY DETAILS
                        ================================================== */}

                        <div
                            className="
                                mt-1.5
                                flex
                                flex-wrap
                                items-center
                                gap-x-3
                                gap-y-1
                                text-xs
                            "
                        >

                            {/* OWNER */}

                           

                            <span className="text-slate-300">
                                |
                            </span>


                            {/* PREVIOUS TD */}

                            <div className="min-w-0">

                                <span className="text-[9px] font-medium uppercase tracking-wide text-slate-400">
                                    Previous TD
                                </span>{" "}

                                <span className="font-medium text-slate-600">
                                    {property.prevtdno || "-"}
                                </span>

                            </div>

                            <span className="text-slate-300">
                                |
                            </span>


                            {/* BARANGAY */}

                            <div className="min-w-0">

                                <span className="text-[9px] font-medium uppercase tracking-wide text-slate-400">
                                    Barangay
                                </span>{" "}

                                <span className="font-medium text-slate-700">
                                    {property.barangay_name || "-"}
                                </span>

                            </div>

                            <span className="text-slate-300">
                                |
                            </span>


                            {/* CLASSIFICATION */}

                            <div className="min-w-0">

                                <span className="text-[9px] font-medium uppercase tracking-wide text-slate-400">
                                    Classification
                                </span>{" "}

                                <span className="font-medium text-slate-700">
                                    {property.classification_name || "-"}
                                </span>

                            </div>

                            <span className="text-slate-300">
                                |
                            </span>


                            {/* TYPE */}

                            <div className="min-w-0">

                                <span className="text-[9px] font-medium uppercase tracking-wide text-slate-400">
                                    Type
                                </span>{" "}

                                <span className="font-medium text-slate-700">
                                    {property.rputype || "-"}
                                </span>

                            </div>

                            <span className="text-slate-300">
                                |
                            </span>


                            {/* ASSESSED VALUE */}

                            <div>

                                <span className="text-[9px] font-medium uppercase tracking-wide text-slate-400">
                                    AV
                                </span>{" "}

                                <span className="font-bold text-blue-700">
                                    ₱
                                    {Number(
                                        property.totalav || 0
                                    ).toLocaleString(
                                        "en-PH",
                                        {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        }
                                    )}
                                </span>

                            </div>

                        </div>

                    </div>


                    {/* =================================================
                        CLOSE
                    ================================================== */}

                    <button
                        type="button"
                        onClick={onClose}
                        className="
                            shrink-0
                            rounded-md
                            px-2
                            py-1
                            text-2xl
                            leading-none
                            text-slate-400
                            transition
                            hover:bg-slate-100
                            hover:text-slate-700
                        "
                        aria-label="Close"
                    >
                        ×
                    </button>

                </div>


                {/* =====================================================
                    BODY
                ====================================================== */}

                <div
                    className="
                        min-h-0
                        flex-1
                        overflow-y-auto
                    "
                >

                    <div
                        className="
                            space-y-4
                            p-4
                            sm:p-5
                        "
                    >

                        {/* =================================================
                            BILLING COVERAGE
                        ================================================= */}

                        <div className="px-1 py-2">

                            {/* HEADER */}

                            <div className="flex items-center justify-between">

                                <div>

                                    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                                        Billing Coverage
                                    </h3>

                                    <p className="mt-0.5 text-[10px] text-slate-400">
                                        Select assessment period
                                    </p>

                                </div>

                            </div>


                            {/* COVERAGE */}

                            <div
                                className="
                                    mt-3
                                    grid
                                    grid-cols-1
                                    gap-4
                                    sm:grid-cols-2
                                    sm:gap-6
                                "
                            >

                                {/* FROM */}

                                <div className="min-w-0">

                                    <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                                        From
                                    </label>

                                    <div className="flex gap-2">

                                        <select
                                            value={fromQuarter}
                                            onChange={(e) =>
                                                setFromQuarter(
                                                    Number(e.target.value)
                                                )
                                            }
                                            className="
                                                min-w-0
                                                flex-1
                                                border-0
                                                border-b
                                                border-slate-300
                                                bg-transparent
                                                px-0
                                                py-1.5
                                                text-sm
                                                font-medium
                                                text-slate-800
                                                outline-none
                                                focus:border-blue-600
                                                focus:ring-0
                                            "
                                        >

                                            {quarters.map((q, i) => (
                                                <option
                                                    key={q}
                                                    value={i + 1}
                                                >
                                                    {q}
                                                </option>
                                            ))}

                                        </select>


                                        <input
                                            type="number"
                                            value={fromYear}
                                            onChange={(e) =>
                                                setFromYear(
                                                    Number(e.target.value)
                                                )
                                            }
                                            min={1900}
                                            max={9999}
                                            className="
                                                w-24
                                                border-0
                                                border-b
                                                border-slate-300
                                                bg-transparent
                                                px-0
                                                py-1.5
                                                text-sm
                                                font-medium
                                                text-slate-800
                                                outline-none
                                                focus:border-blue-600
                                                focus:ring-0
                                            "
                                        />

                                    </div>

                                </div>


                                {/* TO */}

                                <div className="min-w-0">

                                    <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                                        To
                                    </label>

                                    <div className="flex gap-2">

                                        <select
                                            value={toQuarter}
                                            onChange={(e) =>
                                                setToQuarter(
                                                    Number(e.target.value)
                                                )
                                            }
                                            className="
                                                min-w-0
                                                flex-1
                                                border-0
                                                border-b
                                                border-slate-300
                                                bg-transparent
                                                px-0
                                                py-1.5
                                                text-sm
                                                font-medium
                                                text-slate-800
                                                outline-none
                                                focus:border-blue-600
                                                focus:ring-0
                                            "
                                        >

                                            {quarters.map((q, i) => (
                                                <option
                                                    key={q}
                                                    value={i + 1}
                                                >
                                                    {q}
                                                </option>
                                            ))}

                                        </select>


                                        <input
                                            type="number"
                                            value={toYear}
                                            onChange={(e) =>
                                                setToYear(
                                                    Number(e.target.value)
                                                )
                                            }
                                            min={1900}
                                            max={9999}
                                            className="
                                                w-24
                                                border-0
                                                border-b
                                                border-slate-300
                                                bg-transparent
                                                px-0
                                                py-1.5
                                                text-sm
                                                font-medium
                                                text-slate-800
                                                outline-none
                                                focus:border-blue-600
                                                focus:ring-0
                                            "
                                        />

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>


                {/* =====================================================
                    FOOTER
                ====================================================== */}

                <div
                    className="
                        flex
                        shrink-0
                        flex-col-reverse
                        gap-2
                        border-t
                        border-slate-200
                        bg-white
                        px-4
                        py-2.5
                        sm:flex-row
                        sm:justify-end
                        sm:gap-2
                        sm:px-6
                    "
                >

                    <button
                        type="button"
                        onClick={onClose}
                        className="
                            w-full
                            rounded-md
                            border
                            border-slate-300
                            px-5
                            py-2
                            text-sm
                            font-medium
                            text-slate-700
                            transition
                            hover:bg-slate-50
                            sm:w-auto
                        "
                    >
                        Cancel
                    </button>


                    <button
                        type="button"
                        onClick={createBilling}
                        className="
                            w-full
                            rounded-md
                            bg-blue-600
                            px-5
                            py-2
                            text-sm
                            font-semibold
                            text-white
                            transition
                            hover:bg-blue-700
                            sm:w-auto
                        "
                    >
                        Create Assessment
                    </button>

                </div>

            </div>

        </div>
    );
}