"use client";

import { useEffect, useState } from "react";
import { X, CreditCard } from "lucide-react";

type Property = {
    fullpin?: string;
    tdno?: string;
    taxpayer_name?: string;
    owner_name?: string;
    totalav?: number;
    barangay_name?: string;
};

type Props = {
    open: boolean;
    property: Property | null;
    onClose: () => void;
    onSave?: (data: any) => void;
};

export default function AddPaymentModal({
    open,
    property,
    onClose,
    onSave,
}: Props) {
    const [paymentDate, setPaymentDate] = useState("");
    const [startQuarter, setStartQuarter] = useState("1");
    const [startYear, setStartYear] = useState("");
    const [endQuarter, setEndQuarter] = useState("1");
    const [endYear, setEndYear] = useState("");
    const [billingNumber, setBillingNumber] = useState("");
    const [taxDue, setTaxDue] = useState("");
    const [amount, setAmount] = useState("");

    useEffect(() => {
        if (open) {
            const today = new Date().toISOString().split("T")[0];

            setPaymentDate(today);
            setStartQuarter("1");
            setEndQuarter("1");
            setStartYear("");
            setEndYear("");
            setBillingNumber("");
            setTaxDue("");
            setAmount("");
        }
    }, [open]);

    if (!open || !property) {
        return null;
    }

    const taxpayer =
        property.taxpayer_name ||
        property.owner_name ||
        "";

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const data = {
            property_id: property.fullpin,
            tdno: property.tdno,
            taxpayer_name: taxpayer,
            payment_date: paymentDate,

            start_quarter: Number(startQuarter),
            start_year: Number(startYear),

            end_quarter: Number(endQuarter),
            end_year: Number(endYear),

            billing_number: billingNumber || null,

            tax_due: Number(taxDue),
            amount: Number(amount),

            assessed_value: Number(property.totalav || 0),

            declared_owner: property.owner_name || taxpayer,
            property_location: property.barangay_name || null,
        };

        console.log("PAYMENT DATA:", data);

        onSave?.(data);
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-2xl">

                {/* HEADER */}
                <div className="flex items-center justify-between border-b bg-blue-700 px-6 py-4 text-white">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-white/15 p-2">
                            <CreditCard size={22} />
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold">
                                Add RPT Payment
                            </h2>

                            <p className="text-sm text-blue-100">
                                Record a payment for this property
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 transition hover:bg-white/15"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit}>
                    <div className="space-y-6 p-6">

                        {/* PROPERTY INFORMATION */}
                        <div>
                            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-600">
                                Property Information
                            </h3>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        TD Number
                                    </label>

                                    <input
                                        type="text"
                                        value={property.tdno || ""}
                                        readOnly
                                        className="w-full rounded-lg border bg-gray-100 px-3 py-2.5 text-sm text-gray-700"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Full PIN
                                    </label>

                                    <input
                                        type="text"
                                        value={property.fullpin || ""}
                                        readOnly
                                        className="w-full rounded-lg border bg-gray-100 px-3 py-2.5 text-sm text-gray-700"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Taxpayer
                                    </label>

                                    <input
                                        type="text"
                                        value={taxpayer}
                                        readOnly
                                        className="w-full rounded-lg border bg-gray-100 px-3 py-2.5 text-sm text-gray-700"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Assessed Value
                                    </label>

                                    <input
                                        type="text"
                                        value={Number(
                                            property.totalav || 0
                                        ).toLocaleString("en-PH", {
                                            minimumFractionDigits: 2,
                                        })}
                                        readOnly
                                        className="w-full rounded-lg border bg-gray-100 px-3 py-2.5 text-sm text-gray-700"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Property Location
                                    </label>

                                    <input
                                        type="text"
                                        value={property.barangay_name || ""}
                                        readOnly
                                        className="w-full rounded-lg border bg-gray-100 px-3 py-2.5 text-sm text-gray-700"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* PAYMENT INFORMATION */}
                        <div>
                            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-600">
                                Payment Information
                            </h3>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Payment Date
                                    </label>

                                    <input
                                        type="date"
                                        value={paymentDate}
                                        onChange={(e) =>
                                            setPaymentDate(e.target.value)
                                        }
                                        required
                                        className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Billing Number
                                    </label>

                                    <input
                                        type="text"
                                        value={billingNumber}
                                        onChange={(e) =>
                                            setBillingNumber(e.target.value)
                                        }
                                        placeholder="Optional"
                                        className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>

                            </div>
                        </div>

                        {/* COVERAGE */}
                        <div>
                            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-600">
                                Tax Coverage
                            </h3>

                            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Start Quarter
                                    </label>

                                    <select
                                        value={startQuarter}
                                        onChange={(e) =>
                                            setStartQuarter(e.target.value)
                                        }
                                        className="w-full rounded-lg border px-3 py-2.5 text-sm"
                                    >
                                        <option value="1">1st Quarter</option>
                                        <option value="2">2nd Quarter</option>
                                        <option value="3">3rd Quarter</option>
                                        <option value="4">4th Quarter</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Start Year
                                    </label>

                                    <input
                                        type="number"
                                        value={startYear}
                                        onChange={(e) =>
                                            setStartYear(e.target.value)
                                        }
                                        placeholder="2026"
                                        required
                                        className="w-full rounded-lg border px-3 py-2.5 text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        End Quarter
                                    </label>

                                    <select
                                        value={endQuarter}
                                        onChange={(e) =>
                                            setEndQuarter(e.target.value)
                                        }
                                        className="w-full rounded-lg border px-3 py-2.5 text-sm"
                                    >
                                        <option value="1">1st Quarter</option>
                                        <option value="2">2nd Quarter</option>
                                        <option value="3">3rd Quarter</option>
                                        <option value="4">4th Quarter</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        End Year
                                    </label>

                                    <input
                                        type="number"
                                        value={endYear}
                                        onChange={(e) =>
                                            setEndYear(e.target.value)
                                        }
                                        placeholder="2026"
                                        required
                                        className="w-full rounded-lg border px-3 py-2.5 text-sm"
                                    />
                                </div>

                            </div>
                        </div>

                        {/* AMOUNTS */}
                        <div>
                            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-600">
                                Amount
                            </h3>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Tax Due
                                    </label>

                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={taxDue}
                                        onChange={(e) =>
                                            setTaxDue(e.target.value)
                                        }
                                        placeholder="0.00"
                                        required
                                        className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Amount Paid
                                    </label>

                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={amount}
                                        onChange={(e) =>
                                            setAmount(e.target.value)
                                        }
                                        placeholder="0.00"
                                        required
                                        className="w-full rounded-lg border border-blue-500 px-3 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>

                            </div>
                        </div>

                    </div>

                    {/* FOOTER */}
                    <div className="flex justify-end gap-3 border-t bg-gray-50 px-6 py-4">

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
                        >
                            Save Payment
                        </button>

                    </div>
                </form>
            </div>
        </div>
    );
}