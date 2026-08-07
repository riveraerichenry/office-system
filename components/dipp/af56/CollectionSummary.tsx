"use client";

import { Billing } from "@/lib/types/billing";

type Props = {
    billing: Billing | null;
};

export default function CollectionSummary({
    billing,
}: Props) {
    if (!billing) {
        return (
            <div className="rounded-xl border bg-white shadow-sm">

                <div className="border-b bg-green-700 px-5 py-3">
                    <h2 className="font-semibold text-white">
                        Collection Summary
                    </h2>
                </div>

                <div className="p-10 text-center text-gray-500">
                    Select a Billing Reference first.
                </div>

            </div>
        );
    }

    return (
        <div className="rounded-xl border bg-white shadow-sm">

            <div className="border-b bg-green-700 px-5 py-3">
                <h2 className="font-semibold text-white">
                    Collection Summary
                </h2>
            </div>

            <div className="p-6">

                <SummaryRow
                    label="Tax Due"
                    value={billing.total_tax_due}
                />

                <SummaryRow
                    label="Basic Tax"
                    value={billing.total_basic}
                />

                <SummaryRow
                    label="Special Education Fund (SEF)"
                    value={billing.total_sef}
                />

                <SummaryRow
                    label="Penalty"
                    value={billing.total_penalty}
                />

                <SummaryRow
                    label="Discount"
                    value={billing.total_discount}
                    negative
                />

                <div className="my-4 border-t"></div>

                <div className="flex items-center justify-between rounded-lg bg-blue-700 px-5 py-4 text-lg font-bold text-white">

                    <span>GRAND TOTAL</span>

                    <span>
                        {currency(billing.grand_total)}
                    </span>

                </div>

            </div>

        </div>
    );
}

type SummaryRowProps = {
    label: string;
    value: number | null;
    negative?: boolean;
};

function SummaryRow({
    label,
    value,
    negative = false,
}: SummaryRowProps) {
    return (
        <div className="flex items-center justify-between border-b py-3">

            <span className="text-gray-700">
                {label}
            </span>

            <span
                className={`font-semibold ${
                    negative
                        ? "text-red-600"
                        : "text-gray-900"
                }`}
            >
                {negative && "- "}
                {currency(value)}
            </span>

        </div>
    );
}

function currency(value: number | null | undefined) {
    return Number(value ?? 0).toLocaleString("en-PH", {
        style: "currency",
        currency: "PHP",
    });
}