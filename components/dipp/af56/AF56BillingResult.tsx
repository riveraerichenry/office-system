"use client";

import { useState } from "react";

type Props = {
  loading: boolean;
  results: any[];
  selected: any;
  onSelect: (row: any) => void;
};

export default function AF56BillingResults({
  loading,
  results,
  selected,
  onSelect,
}: Props) {

    const PAYMENT_MODES = [
        "Cash",
        "Check",
        "Cash + Check",
        ];

        const [payor, setPayor] = useState("");
        const [paymentMode, setPaymentMode] = useState("Cash");

  const Field = ({
    label,
    value,
  }: {
    label: string;
    value: any;
  }) => (
    <div className="grid grid-cols-12 border-b last:border-b-0">
      <div className="col-span-3 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </div>

      <div className="col-span-9 px-5 py-3 text-sm font-medium text-slate-800">
        {value || "-"}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Search Results */}
        {(!selected || loading || results.length > 0) && (
        <>
            {loading ? (
            <div className="rounded-lg border border-dashed py-12 text-center text-sm text-slate-500">
                Searching billings...
            </div>
            ) : results.length === 0 ? (
            <div className="rounded-lg border border-dashed py-12 text-center text-sm text-slate-500">
                No billing records found.
            </div>
            ) : (
            <div className="space-y-3">
                {results.map((row) => (
                    <button
                        key={row.id}
                        onClick={() => onSelect(row)}
                        className="flex w-full items-center gap-4 border-b px-4 py-3 text-left transition hover:bg-blue-50 last:border-b-0"
                    >
                        <div className="min-w-0 flex-1">
                        <div className="truncate text-sm">
                            <span className="font-semibold text-blue-700">
                            {row.owner_name}
                            </span>

                            <span className="mx-2 text-slate-300">•</span>

                            <span className="text-slate-600">
                            {row.fullpin}
                            </span>

                            <span className="mx-2 text-slate-300">•</span>

                            <span className="text-slate-600">
                            TD {row.td_number}
                            </span>

                            <span className="mx-2 text-slate-300">•</span>

                            <span className="text-slate-600">
                            {row.location}
                            </span>

                            <span className="mx-2 text-slate-300">•</span>

                            <span className="font-medium text-slate-700">
                            {row.classification_name}
                            </span>
                        </div>
                        </div>

                        <div className="text-right whitespace-nowrap">
                        <div className="font-semibold text-green-700">
                            ₱
                            {Number(row.grand_total ?? 0).toLocaleString(
                            "en-PH",
                            {
                                minimumFractionDigits: 2,
                            }
                            )}
                        </div>
                        </div>
                    </button>
                    ))}
            </div>
            )}
        </>
        )}

      {/* Billing Information */}
        {selected && !loading && results.length === 0 && (
        <div className="overflow-hidden rounded-xl border bg-white">
            {/* Header */}
            <div className="border-b bg-slate-50 px-6 py-5">
            <div className="flex flex-wrap items-start justify-between gap-6">
                <div>
                <h2 className="text-xl font-semibold text-slate-800">
                    {selected.owner_name}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                    Billing No. {selected.billing_number}
                </p>
                </div>

                <div className="text-right">
                <div className="text-xs uppercase tracking-wide text-slate-500">
                    Grand Total
                </div>

                <div className="text-3xl font-bold text-green-700">
                    ₱
                    {Number(selected.grand_total ?? 0).toLocaleString("en-PH", {
                    minimumFractionDigits: 2,
                    })}
                </div>
                </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-3 text-sm lg:grid-cols-4">
                <div>
                <div className="text-xs uppercase text-slate-500">PIN</div>
                <div className="font-medium">{selected.fullpin}</div>
                </div>

                <div>
                <div className="text-xs uppercase text-slate-500">
                    TD Number
                </div>
                <div className="font-medium">{selected.td_number}</div>
                </div>

                <div>
                <div className="text-xs uppercase text-slate-500">
                    Classification
                </div>
                <div className="font-medium">
                    {selected.classification_name}
                </div>
                </div>

                <div>
                <div className="text-xs uppercase text-slate-500">
                    Status
                </div>
                <div className="font-medium">
                    {selected.status}
                </div>
                </div>

                <div className="col-span-2">
                <div className="text-xs uppercase text-slate-500">
                    Property Location
                </div>
                <div className="font-medium">
                    {selected.location}
                </div>
                </div>

                <div>
                <div className="text-xs uppercase text-slate-500">
                    Billing Date
                </div>
                <div className="font-medium">
                    {selected.billing_date
                    ? new Date(selected.billing_date).toLocaleDateString(
                        "en-PH",
                        {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        }
                        )
                    : "-"}
                </div>
                </div>
            </div>
            </div>

            {/* Body */}
            <div className="p-6">
            <div className="grid grid-cols-2 gap-6 p-5">
                {/* Payor */}
                <div>
                    <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Payor
                    </label>

                    <input
                    value={payor}
                    onChange={(e) => setPayor(e.target.value)}
                    placeholder="Enter payor name..."
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                </div>

                {/* Payment Mode */}
                <div>
                    <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Payment Mode
                    </label>

                    <div className="mt-2 flex overflow-hidden rounded-lg border border-slate-300">
                    {PAYMENT_MODES.map((mode) => (
                        <button
                        key={mode}
                        type="button"
                        onClick={() => setPaymentMode(mode)}
                        className={`flex-1 border-l first:border-l-0 px-4 py-3 text-sm font-medium transition ${
                            paymentMode === mode
                            ? "bg-blue-600 text-white"
                            : "bg-white text-slate-700 hover:bg-slate-100"
                        }`}
                        >
                        {mode}
                        </button>
                    ))}
                    </div>
                </div>
                </div>
            </div>
        </div>
        )}
    </div>
  );
}