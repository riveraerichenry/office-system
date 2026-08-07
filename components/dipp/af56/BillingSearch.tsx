"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Search, Loader2 } from "lucide-react";

export type BillingSearchResult = {
    id: string;
    billing_number: string;
};

type Props = {
    onSelect: (billing: BillingSearchResult) => void;
};

export default function BillingSearch({ onSelect }: Props) {
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<BillingSearchResult[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);

    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            search();
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target as Node)
            ) {
                setShowDropdown(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    async function search() {
        if (!query.trim()) {
            setResults([]);
            setShowDropdown(false);
            return;
        }

        try {
            setLoading(true);

            const res = await axios.get("/api/rpt/billing/search", {
                params: {
                    q: query,
                },
            });

            setResults(res.data);
            setShowDropdown(res.data.length > 0);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    function selectBilling(item: BillingSearchResult) {
        setQuery(item.billing_number);
        setShowDropdown(false);
        onSelect(item);
    }

    return (
        <div ref={wrapperRef} className="relative w-full">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
                Billing Reference
            </label>

            <div className="relative">
                <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                />

                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Enter Billing Reference..."
                    autoComplete="off"
                    className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-10 focus:border-blue-500 focus:outline-none"
                />

                {loading && (
                    <Loader2
                        className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-blue-600"
                        size={18}
                    />
                )}
            </div>

            {showDropdown && (
                <div className="absolute z-50 mt-2 max-h-80 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-xl">
                    {results.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => selectBilling(item)}
                            className="w-full border-b border-gray-100 px-4 py-3 text-left transition-colors hover:bg-blue-50 last:border-b-0"
                        >
                            <span className="font-medium text-gray-800">
                                {item.billing_number}
                            </span>
                        </button>
                    ))}

                    {results.length === 0 && !loading && (
                        <div className="px-4 py-3 text-sm text-gray-500">
                            No billing reference found.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}