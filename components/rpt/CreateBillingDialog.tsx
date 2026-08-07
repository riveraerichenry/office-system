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

const years = Array.from(
    { length: 10 },
    (_, i) => currentYear - 2 + i
);

function Field({
    label,
    value,
}: {
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div>
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                {label}
            </div>

            <div className="rounded-lg border bg-white px-3 py-2 font-medium">
                {value || "-"}
            </div>
        </div>
    );
}

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

            <div className="w-full max-w-4xl rounded-xl bg-white shadow-2xl">

                {/* Header */}

                <div className="flex items-center justify-between border-b px-6 py-4">

                    <div>

                        <h2 className="text-2xl font-bold">
                            Create RPT Billing
                        </h2>

                        <p className="text-sm text-gray-500">
                            Select the billing coverage.
                        </p>

                    </div>

                    <button
                        onClick={onClose}
                        className="text-2xl text-gray-500 hover:text-red-600"
                    >
                        ×
                    </button>

                </div>

                {/* Body */}

                <div className="space-y-6 p-6">

                    {/* Property */}

                    <div className="rounded-xl border bg-gray-50">

                        <div className="border-b bg-gray-100 px-6 py-3">

                            <h3 className="font-semibold uppercase tracking-wide text-gray-700">
                                Property Information
                            </h3>

                        </div>

                        <div className="grid grid-cols-2 gap-x-8 gap-y-5 p-6">

                            <Field
                                label="Declared Owner"
                                value={property.owner_name}
                            />

                            <Field
                                label="Tax Declaration No."
                                value={property.tdno}
                            />

                            <Field
                                label="Property Index No."
                                value={property.fullpin}
                            />

                            <Field
                                label="Barangay"
                                value={property.barangay_name}
                            />

                            <Field
                                label="Classification"
                                value={property.classification_name}
                            />

                            <Field
                                label="Property Type"
                                value={property.rputype}
                            />

                            <Field
                                label="Market Value"
                                value={`₱${Number(
                                    property.totalmv
                                ).toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}`}
                            />

                            <Field
                                label="Assessed Value"
                                value={`₱${Number(
                                    property.totalav
                                ).toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}`}
                            />

                        </div>

                    </div>

                    {/* Coverage */}

                    <div className="rounded-xl border">

                        <div className="border-b bg-blue-50 px-6 py-3">

                            <h3 className="font-semibold uppercase tracking-wide text-blue-700">
                                Billing Coverage
                            </h3>

                        </div>

                        <div className="grid grid-cols-2 gap-8 p-6">

                            {/* FROM */}

                            <div>

                                <label className="mb-2 block font-semibold">
                                    From
                                </label>

                                <div className="flex gap-3">

                                    <select
                                        value={fromQuarter}
                                        onChange={(e) =>
                                            setFromQuarter(
                                                Number(e.target.value)
                                            )
                                        }
                                        className="w-full rounded-lg border p-3"
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
                                            setFromYear(Number(e.target.value))
                                        }
                                        min={1900}
                                        max={9999}
                                        placeholder="Year"
                                        className="w-full rounded-lg border p-3"
                                    />

                                </div>

                            </div>

                            {/* TO */}

                            <div>

                                <label className="mb-2 block font-semibold">
                                    To
                                </label>

                                <div className="flex gap-3">

                                    <select
                                        value={toQuarter}
                                        onChange={(e) =>
                                            setToQuarter(
                                                Number(e.target.value)
                                            )
                                        }
                                        className="w-full rounded-lg border p-3"
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
                                            setToYear(Number(e.target.value))
                                        }
                                        min={1900}
                                        max={9999}
                                        placeholder="Year"
                                        className="w-full rounded-lg border p-3"
                                    />

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

                {/* Footer */}

                <div className="flex justify-end gap-3 border-t px-6 py-4">

                    <button
                        onClick={onClose}
                        className="rounded-lg border px-6 py-2 hover:bg-gray-100"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={createBilling}
                        className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700"
                    >
                        Create Billing
                    </button>

                </div>

            </div>

        </div>
    );
}