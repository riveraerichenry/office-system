"use client";

import {
    CreditCard,
    X,
    Save,
    Loader2,
    AlertCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { Property } from "./PropertyDetailsCard";

type Collector = {
    id: string;
    full_name: string;
    username?: string | null;
    role_name?: string | null;
};

type Props = {
    open: boolean;
    onClose: () => void;
    property: Property | null;
    onSuccess?: () => void;
};

const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const labelClass =
    "mb-1 block text-sm font-medium text-gray-700";

const sectionClass =
    "mb-3 text-sm font-semibold uppercase tracking-wide text-gray-600";

export default function AddPaymentModal({
    open,
    onClose,
    property,
    onSuccess,
}: Props) {
    const [paymentDate, setPaymentDate] = useState("");
    const [tdNumber, setTdNumber] = useState("");
    const [orNumber, setOrNumber] = useState("");
    const [startQuarter, setStartQuarter] = useState("1");
    const [startYear, setStartYear] = useState("");
    const [endQuarter, setEndQuarter] = useState("1");
    const [endYear, setEndYear] = useState("");
    const [assessedValue, setAssessedValue] = useState("");
    const [amount, setAmount] = useState("");

    const [collectors, setCollectors] = useState<Collector[]>([]);
    const [collectorId, setCollectorId] = useState("");
    const [loadingCollectors, setLoadingCollectors] = useState(false);
    const [collectorError, setCollectorError] = useState("");

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // Load active collectors.
    useEffect(() => {
        if (!open) return;

        let cancelled = false;

        async function loadCollectors() {
            setLoadingCollectors(true);
            setCollectorError("");

            try {
                const response = await fetch("/api/rpt/collectors", {
                    method: "GET",
                    cache: "no-store",
                });

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(
                        result.message || "Failed to load collectors."
                    );
                }

                if (!cancelled) {
                    setCollectors(
                        Array.isArray(result.data) ? result.data : []
                    );
                }
            } catch (err) {
                if (!cancelled) {
                    setCollectors([]);
                    setCollectorError(
                        err instanceof Error
                            ? err.message
                            : "Failed to load collectors."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoadingCollectors(false);
                }
            }
        }

        void loadCollectors();

        return () => {
            cancelled = true;
        };
    }, [open]);

    // Reset the form when opened for a property.
    useEffect(() => {
        if (!open) return;

        setPaymentDate(new Date().toLocaleDateString("en-CA"));
        setTdNumber(property?.tdno || "");
        setOrNumber("");
        setCollectorId("");
        setStartQuarter("1");
        setStartYear("");
        setEndQuarter("1");
        setEndYear("");

        setAssessedValue(
            property?.totalav != null
                ? String(property.totalav)
                : ""
        );

        setAmount("");
        setError("");
    }, [open, property]);

    function handleClose() {
        if (saving) return;

        setError("");
        onClose();
    }

    function parseNumber(value: string) {
        return Number(value.replace(/,/g, "").trim() || 0);
    }

    async function handleSubmit(
        e: React.FormEvent<HTMLFormElement>
    ) {
        e.preventDefault();
        setError("");

        if (!property) {
            setError("Property information is missing.");
            return;
        }

        if (!tdNumber.trim()) {
            setError("TD Number is required.");
            return;
        }

        if (!paymentDate) {
            setError("Payment Date is required.");
            return;
        }

        if (!collectorId) {
            setError("Please select a collector.");
            return;
        }

        if (collectorError || loadingCollectors) {
            setError("Please ensure the collectors list is loaded.");
            return;
        }

        if (!startYear || !endYear) {
            setError("Start Year and End Year are required.");
            return;
        }

        const startY = Number(startYear);
        const endY = Number(endYear);
        const startQ = Number(startQuarter);
        const endQ = Number(endQuarter);

        if (
            !Number.isInteger(startY) ||
            !Number.isInteger(endY) ||
            startY < 1900 ||
            startY > 2100 ||
            endY < 1900 ||
            endY > 2100
        ) {
            setError("Please enter valid coverage years.");
            return;
        }

        if (
            endY < startY ||
            (endY === startY && endQ < startQ)
        ) {
            setError(
                "End coverage cannot be earlier than start coverage."
            );
            return;
        }

        const assessed = parseNumber(assessedValue);
        const paymentAmount = parseNumber(amount);

        if (!Number.isFinite(assessed) || assessed < 0) {
            setError("Assessed Value must be zero or greater.");
            return;
        }

        if (
            !Number.isFinite(paymentAmount) ||
            paymentAmount <= 0
        ) {
            setError("Amount Paid must be greater than zero.");
            return;
        }

        const paymentData = {
            property_id: property.fullpin,
            tdno: tdNumber.trim(),
            taxpayer_name:
                property.taxpayer_name || property.owner_name || "",
            payment_date: paymentDate,
            collector_id: collectorId,
            start_quarter: startQ,
            start_year: startY,
            end_quarter: endQ,
            end_year: endY,
            or_number: orNumber.trim() || null,
            assessed_value: assessed,
            amount: paymentAmount,
            declared_owner:
                property.owner_name || property.taxpayer_name || "",
            property_location: property.barangay_name || null,
        };

        try {
            setSaving(true);

            const response = await fetch("/api/rpt/addpayment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(paymentData),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || "Failed to save payment."
                );
            }

            onSuccess?.();
            onClose();
        } catch (err) {
            console.error("Failed to save RPT payment:", err);

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to save payment."
            );
        } finally {
            setSaving(false);
        }
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-2xl">
                {/* Header */}
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
                        onClick={handleClose}
                        disabled={saving}
                        className="rounded-lg p-2 transition hover:bg-white/15 disabled:opacity-50"
                    >
                        <X size={22} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="max-h-[75vh] space-y-6 overflow-y-auto p-6">
                        {error && (
                            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                                <AlertCircle
                                    size={19}
                                    className="mt-0.5 shrink-0"
                                />

                                <div>
                                    <p className="text-sm font-semibold">
                                        Unable to save payment
                                    </p>
                                    <p className="mt-1 text-xs">
                                        {error}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Property Information */}
                        <section>
                            <h3 className={sectionClass}>
                                Property Information
                            </h3>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className={labelClass}>
                                        TD Number
                                    </label>

                                    <input
                                        type="text"
                                        value={tdNumber}
                                        onChange={(e) =>
                                            setTdNumber(e.target.value)
                                        }
                                        placeholder="Enter TD Number"
                                        required
                                        disabled={saving}
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Full PIN
                                    </label>

                                    <input
                                        type="text"
                                        value={property?.fullpin || ""}
                                        readOnly
                                        className={`${inputClass} bg-gray-100`}
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className={labelClass}>
                                        Taxpayer
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            property?.taxpayer_name ||
                                            property?.owner_name ||
                                            ""
                                        }
                                        readOnly
                                        className={`${inputClass} bg-gray-100`}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Assessed Value
                                    </label>

                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={assessedValue}
                                        onChange={(e) =>
                                            setAssessedValue(e.target.value)
                                        }
                                        placeholder="0.00"
                                        disabled={saving}
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Property Location
                                    </label>

                                    <input
                                        type="text"
                                        value={property?.barangay_name || ""}
                                        readOnly
                                        className={`${inputClass} bg-gray-100`}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Payment Information */}
                        <section>
                            <h3 className={sectionClass}>
                                Payment Information
                            </h3>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className={labelClass}>
                                        Payment Date
                                    </label>

                                    <input
                                        type="date"
                                        value={paymentDate}
                                        onChange={(e) =>
                                            setPaymentDate(e.target.value)
                                        }
                                        required
                                        disabled={saving}
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        OR Number
                                    </label>

                                    <input
                                        type="text"
                                        value={orNumber}
                                        onChange={(e) =>
                                            setOrNumber(e.target.value)
                                        }
                                        placeholder="Enter OR Number"
                                        disabled={saving}
                                        className={inputClass}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Tax Coverage */}
                        <section>
                            <h3 className={sectionClass}>
                                Tax Coverage
                            </h3>

                            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                <div>
                                    <label className={labelClass}>
                                        Start Quarter
                                    </label>

                                    <select
                                        value={startQuarter}
                                        onChange={(e) =>
                                            setStartQuarter(e.target.value)
                                        }
                                        disabled={saving}
                                        className={inputClass}
                                    >
                                        <option value="1">
                                            1st Quarter
                                        </option>
                                        <option value="2">
                                            2nd Quarter
                                        </option>
                                        <option value="3">
                                            3rd Quarter
                                        </option>
                                        <option value="4">
                                            4th Quarter
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Start Year
                                    </label>

                                    <input
                                        type="number"
                                        value={startYear}
                                        onChange={(e) =>
                                            setStartYear(e.target.value)
                                        }
                                        placeholder="2026"
                                        min="1900"
                                        max="2100"
                                        required
                                        disabled={saving}
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        End Quarter
                                    </label>

                                    <select
                                        value={endQuarter}
                                        onChange={(e) =>
                                            setEndQuarter(e.target.value)
                                        }
                                        disabled={saving}
                                        className={inputClass}
                                    >
                                        <option value="1">
                                            1st Quarter
                                        </option>
                                        <option value="2">
                                            2nd Quarter
                                        </option>
                                        <option value="3">
                                            3rd Quarter
                                        </option>
                                        <option value="4">
                                            4th Quarter
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        End Year
                                    </label>

                                    <input
                                        type="number"
                                        value={endYear}
                                        onChange={(e) =>
                                            setEndYear(e.target.value)
                                        }
                                        placeholder="2026"
                                        min="1900"
                                        max="2100"
                                        required
                                        disabled={saving}
                                        className={inputClass}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Payment Amount and Collector */}
                        <section>
                            <h3 className={sectionClass}>
                                Payment Amount
                            </h3>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {/* Amount Paid */}
                                <div>
                                    <label className={labelClass}>
                                        Amount Paid
                                        <span className="ml-1 text-red-600">
                                            *
                                        </span>
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
                                        disabled={saving}
                                        className={`${inputClass} border-blue-500 font-semibold`}
                                    />
                                </div>

                                {/* Collector Dropdown */}
                                <div>
                                    <label className={labelClass}>
                                        Collector
                                        <span className="ml-1 text-red-600">
                                            *
                                        </span>
                                    </label>

                                    <select
                                        value={collectorId}
                                        onChange={(e) =>
                                            setCollectorId(e.target.value)
                                        }
                                        required
                                        disabled={
                                            loadingCollectors || saving
                                        }
                                        className={inputClass}
                                    >
                                        <option value="">
                                            {loadingCollectors
                                                ? "Loading collectors..."
                                                : "Select collector"}
                                        </option>

                                        {collectors.map((collector) => (
                                            <option
                                                key={collector.id}
                                                value={collector.id}
                                            >
                                                {collector.full_name ||
                                                    collector.username ||
                                                    collector.id}
                                                {collector.role_name
                                                    ? ` — ${collector.role_name}`
                                                    : ""}
                                            </option>
                                        ))}
                                    </select>

                                    {collectorError && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {collectorError}
                                        </p>
                                    )}

                                    {!loadingCollectors &&
                                        !collectorError &&
                                        collectors.length === 0 && (
                                            <p className="mt-1 text-xs text-amber-700">
                                                No active users with Collector
                                                or Collector Officer roles
                                                were found.
                                            </p>
                                        )}
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 border-t bg-gray-50 px-6 py-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={saving}
                            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving || loadingCollectors}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving ? (
                                <>
                                    <Loader2
                                        size={16}
                                        className="animate-spin"
                                    />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={16} />
                                    Save Payment
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}