"use client";

import { Billing } from "@/lib/types/billing";

type Props = {
    billing: Billing | null;
};

export default function BillingInformation({
    billing,
}: Props) {
    if (!billing) {
        return (
            <div className="rounded-xl border bg-white shadow-sm">
                <div className="border-b bg-blue-600 px-5 py-3">
                    <h2 className="font-semibold text-white">
                        Billing Information
                    </h2>
                </div>

                <div className="p-10 text-center text-gray-500">
                    Search a Billing Reference to load billing information.
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl border bg-white shadow-sm">

            <div className="border-b bg-blue-600 px-5 py-3">
                <h2 className="font-semibold text-white">
                    Billing Information
                </h2>
            </div>

            <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2 lg:grid-cols-3">

                <Field
                    label="Billing Reference"
                    value={billing.billing_number}
                />

                <Field
                    label="Taxpayer"
                    value={billing.owner_name}
                />

                <Field
                    label="Tax Declaration No."
                    value={billing.td_number}
                />

                <Field
                    label="Property Index Number"
                    value={billing.fullpin}
                />

                <Field
                    label="Classification"
                    value={billing.classification_name}
                />

                <Field
                    label="Property Type"
                    value={billing.property_type}
                />

                <Field
                    label="Barangay"
                    value={billing.barangay_name}
                />

                <Field
                    label="Assessed Value"
                    value={currency(billing.assessed_value)}
                />

                <Field
                    label="Coverage"
                    value={`Q${billing.from_quarter} ${billing.from_year} - Q${billing.to_quarter} ${billing.to_year}`}
                />

                <Field
                    label="Status"
                    value={billing.status}
                />

            </div>

        </div>
    );
}

type FieldProps = {
    label: string;
    value?: string | number | null;
};

function Field({
    label,
    value,
}: FieldProps) {
    return (
        <div>

            <label className="mb-2 block text-sm font-medium text-gray-600">
                {label}
            </label>

            <input
                readOnly
                value={value ?? ""}
                className="
                    w-full
                    rounded-lg
                    border
                    bg-gray-50
                    px-3
                    py-2.5
                    text-sm
                    text-gray-800
                "
            />

        </div>
    );
}

function currency(value: number | null | undefined) {
    return Number(value ?? 0).toLocaleString("en-PH", {
        style: "currency",
        currency: "PHP",
    });
}