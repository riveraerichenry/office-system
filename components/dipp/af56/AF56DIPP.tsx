"use client";

import { useState } from "react";
import axios from "axios";
import BillingInformation from "./BillingInformation";
import BillingItems from "./BillingItems";
import CollectionSummary from "./CollectionSummary";
import { AssignedBooklet } from "@/lib/types/booklet";

import BookletToolbar from "../BookletToolbar";

import BillingSearch, {
    BillingSearchResult,
} from "./BillingSearch";

import {
    Billing,
    BillingItem,
    BillingResponse,
} from "@/lib/types/billing";



type Props = {
    selectedBooklet: AssignedBooklet | null;
    reloadBooklets: () => Promise<void>;
};

export default function AF56DIPP({
    selectedBooklet,
    reloadBooklets,
}: Props) {
    const [loading, setLoading] = useState(false);

    const [billing, setBilling] = useState<Billing | null>(null);

    const [items, setItems] = useState<BillingItem[]>([]);

    async function handleBillingSelect(
        selected: BillingSearchResult
    ) {
        try {
            setLoading(true);

            const res = await axios.get<BillingResponse>(
                `/api/rpt/billing/${selected.id}`
            );

            setBilling(res.data.billing);
            setItems(res.data.items);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            <BookletToolbar
                booklet={selectedBooklet}
            />

            <BillingSearch
                onSelect={handleBillingSelect}
            />

            <BillingInformation billing={billing} />

            <BillingItems items={items} />
            <CollectionSummary billing={billing} />


        </div>
    );
}

type FieldProps = {
    label: string;
    value: string | number | null | undefined;
};

function Field({
    label,
    value,
}: FieldProps) {
    return (
        <div>

            <label className="mb-1 block text-sm font-medium text-gray-600">
                {label}
            </label>

            <input
                readOnly
                value={value ?? ""}
                className="w-full rounded-lg border bg-gray-50 px-3 py-2"
            />

           

        </div>
    );
}

function formatCurrency(value: number | null | undefined) {
    return Number(value ?? 0).toLocaleString("en-PH", {
        style: "currency",
        currency: "PHP",
    });
}