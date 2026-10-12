
"use client";

import { useEffect, useState } from "react";
import AssessmentTable from "./AssessmentTable";

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

    const [billingAssessment, setBillingAssessment] =
        useState<any>(null);

    // Reset the assessment when opening the dialog for a new session
    // or when the selected property changes.
    useEffect(() => {
        if (open) {
            setBillingAssessment(null);

            setFromQuarter(1);
            setFromYear(currentYear);
            setToQuarter(4);
            setToYear(currentYear);
        }
    }, [open, property]);

    if (!open || !property) {
        return null;
    }

    function createBilling() {
        const start = fromYear * 10 + fromQuarter;
        const end = toYear * 10 + toQuarter;

        if (
            !Number.isInteger(fromYear) ||
            !Number.isInteger(toYear) ||
            fromYear < 1900 ||
            toYear < 1900
        ) {
            alert("Please enter valid coverage years.");
            return;
        }

        if (start > end) {
            alert(
                "Coverage From cannot be greater than Coverage To."
            );
            return;
        }

        const billingData = {
            property,
            fromQuarter,
            fromYear,
            toQuarter,
            toYear,
        };

        // Notify the existing parent callback.
        onBillingCreated(billingData);

        // Display the assessment below the coverage selectors.
        // Keep the dialog open.
        setBillingAssessment(billingData);
    }

    function changeCoverage() {
        // Re-create the assessment after the user changes the range.
        setBillingAssessment(null);
    }

    return (
        <div
            className="
                fixed inset-0 z-50
                flex items-center justify-center
                bg-black/50 p-2 sm:p-4
            "
        >
            <div
                className="
                    flex w-full max-w-[98vw]
                    max-h-[calc(100vh-1rem)]
                    sm:max-h-[calc(100vh-2rem)]
                    min-h-0 flex-col
                    overflow-hidden rounded-xl
                    bg-white shadow-2xl
                "
            >
                {/* HEADER */}
                <div
                    className="
                        flex shrink-0 items-start
                        justify-between gap-4
                        border-b border-slate-200
                        px-4 py-3 sm:px-6
                    "
                >
                    <div className="min-w-0 flex-1">
                        <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
                            Create Real Property Billing
                        </h2>

                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                            <span className="font-semibold text-slate-800">
                                {property.owner_name || "-"}
                            </span>

                            <span className="text-slate-300">|</span>

                            <span className="text-slate-500">
                                PIN:{" "}
                                <span className="font-semibold text-slate-800">
                                    {property.fullpin || property.pin || "-"}
                                </span>
                            </span>

                            <span className="text-slate-300">|</span>

                            <span className="text-slate-500">
                                TD:{" "}
                                <span className="font-semibold text-slate-800">
                                    {property.tdno || "-"}
                                </span>
                            </span>
                        </div>

                        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 lg:grid-cols-5">
                            <PropertyDetail
                                label="Previous TD"
                                value={property.prevtdno}
                            />

                            <PropertyDetail
                                label="Barangay"
                                value={property.barangay_name}
                            />

                            <PropertyDetail
                                label="Classification"
                                value={property.classification_name}
                            />

                            <PropertyDetail
                                label="Property Type"
                                value={property.rputype}
                            />

                            <div>
                                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                                    Assessed Value
                                </p>

                                <p className="text-sm font-bold text-blue-700">
                                    ₱
                                    {Number(
                                        property.totalav ??
                                        property.assessed_value ??
                                        0
                                    ).toLocaleString("en-PH", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="
                            shrink-0 rounded-md px-2 py-1
                            text-2xl leading-none text-slate-400
                            transition hover:bg-slate-100
                            hover:text-slate-700
                        "
                        aria-label="Close dialog"
                    >
                        ×
                    </button>
                </div>

                {/* SCROLLABLE BODY */}
                <div className="min-h-0 flex-1 overflow-y-auto">
                    <div className="space-y-5 p-4 sm:p-6">
                        {/* BILLING COVERAGE */}
                        <section className="rounded-lg border border-slate-200 p-4">
                            <div className="mb-4">
                                <h3 className="text-sm font-semibold text-slate-800">
                                    Billing Coverage
                                </h3>

                                <p className="mt-1 text-xs text-slate-500">
                                    Select the period to assess.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                {/* FROM */}
                                <div>
                                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        From
                                    </label>

                                    <div className="flex gap-3">
                                        <select
                                            value={fromQuarter}
                                            onChange={(e) => {
                                                setFromQuarter(
                                                    Number(e.target.value)
                                                );
                                                changeCoverage();
                                            }}
                                            className="
                                                min-w-0 flex-1 rounded-md
                                                border border-slate-300
                                                bg-white px-3 py-2 text-sm
                                                text-slate-800 outline-none
                                                focus:border-blue-600
                                                focus:ring-2
                                                focus:ring-blue-100
                                            "
                                        >
                                            {quarters.map((quarter, i) => (
                                                <option
                                                    key={quarter}
                                                    value={i + 1}
                                                >
                                                    {quarter}
                                                </option>
                                            ))}
                                        </select>

                                        <input
                                            type="number"
                                            value={fromYear}
                                            min={1900}
                                            max={9999}
                                            onChange={(e) => {
                                                setFromYear(
                                                    Number(e.target.value)
                                                );
                                                changeCoverage();
                                            }}
                                            className="
                                                w-24 rounded-md border
                                                border-slate-300 px-3 py-2
                                                text-sm outline-none
                                                focus:border-blue-600
                                                focus:ring-2
                                                focus:ring-blue-100
                                            "
                                        />
                                    </div>
                                </div>

                                {/* TO */}
                                <div>
                                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        To
                                    </label>

                                    <div className="flex gap-3">
                                        <select
                                            value={toQuarter}
                                            onChange={(e) => {
                                                setToQuarter(
                                                    Number(e.target.value)
                                                );
                                                changeCoverage();
                                            }}
                                            className="
                                                min-w-0 flex-1 rounded-md
                                                border border-slate-300
                                                bg-white px-3 py-2 text-sm
                                                text-slate-800 outline-none
                                                focus:border-blue-600
                                                focus:ring-2
                                                focus:ring-blue-100
                                            "
                                        >
                                            {quarters.map((quarter, i) => (
                                                <option
                                                    key={quarter}
                                                    value={i + 1}
                                                >
                                                    {quarter}
                                                </option>
                                            ))}
                                        </select>

                                        <input
                                            type="number"
                                            value={toYear}
                                            min={1900}
                                            max={9999}
                                            onChange={(e) => {
                                                setToYear(
                                                    Number(e.target.value)
                                                );
                                                changeCoverage();
                                            }}
                                            className="
                                                w-24 rounded-md border
                                                border-slate-300 px-3 py-2
                                                text-sm outline-none
                                                focus:border-blue-600
                                                focus:ring-2
                                                focus:ring-blue-100
                                            "
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 flex justify-end">
                                <button
                                    type="button"
                                    onClick={createBilling}
                                    className="
                                        rounded-md bg-blue-600
                                        px-5 py-2.5 text-sm
                                        font-semibold text-white
                                        transition hover:bg-blue-700
                                    "
                                >
                                    {billingAssessment
                                        ? "Recreate Assessment"
                                        : "Create Assessment"}
                                </button>
                            </div>
                        </section>

                        {/* ASSESSMENT TABLE INSIDE THE DIALOG */}
                        {billingAssessment && (
                            <section className="min-w-0 overflow-hidden rounded-lg border border-slate-200">
                                <AssessmentTable
                                    assessment={billingAssessment}
                                />
                            </section>
                        )}
                    </div>
                </div>

                {/* FOOTER */}
                <div
                    className="
                        flex shrink-0 justify-end gap-2
                        border-t border-slate-200 bg-white
                        px-4 py-3 sm:px-6
                    "
                >
                    <button
                        type="button"
                        onClick={onClose}
                        className="
                            rounded-md border border-slate-300
                            px-5 py-2 text-sm font-medium
                            text-slate-700 transition
                            hover:bg-slate-50
                        "
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

function PropertyDetail({
    label,
    value,
}: {
    label: string;
    value: string | number | null | undefined;
}) {
    return (
        <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                {label}
            </p>

            <p className="truncate text-xs font-medium text-slate-700">
                {value || "-"}
            </p>
        </div>
    );
}
