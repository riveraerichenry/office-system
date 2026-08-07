"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Search, Loader2, User } from "lucide-react";
import CreateBillingDialog from "./CreateBillingDialog";

type Property = {
    objid: string;
    tdno: string;
    owner_name: string;
    owner_address: string;
    fullpin: string;
    barangay_name: string;
    classification_name: string;
    rputype: string;
    totalareasqm: number;
    totalmv: number;
    totalav: number;
    state: string;
};

type Props = {
    onBillingCreated: (data: any) => void;
};

export default function SearchPropertyCard({
    onBillingCreated,
}: Props) {
    const [keyword, setKeyword] = useState("");
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<Property[]>([]);
    const [open, setOpen] = useState(false);

    const [selectedProperty, setSelectedProperty] =
        useState<Property | null>(null);

    const [openBilling, setOpenBilling] =
        useState(false);

    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () =>
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
    }, []);

    useEffect(() => {
        if (keyword.trim().length < 2) {
            setResults([]);
            setOpen(false);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                setLoading(true);

                const res = await axios.get(
                    "/api/rpt/faas/search",
                    {
                        params: {
                            q: keyword,
                        },
                    }
                );

                setResults(res.data.results || []);
                setOpen(true);

            } catch (err) {

                console.error(err);

            } finally {

                setLoading(false);

            }
        }, 300);

        return () => clearTimeout(timer);

    }, [keyword]);

    return (
        <>
            <div
                ref={wrapperRef}
                className="relative rounded-xl border bg-white shadow-sm"
            >
                <div className="border-b p-6">

                    <div className="mb-4">

                        <h2 className="text-xl font-semibold">
                            RPT Billing
                        </h2>

                      

                    </div>

                    <div className="relative">

                        <Search
                            size={20}
                            className="absolute left-4 top-4 text-gray-400"
                        />

                        <input
                            value={keyword}
                            onChange={(e) =>
                                setKeyword(e.target.value)
                            }
                            placeholder="Search by Owner, Tax Declaration Number, PIN or Barangay..."
                            className="w-full rounded-xl border py-3 pl-12 pr-12 text-lg outline-none focus:border-blue-600"
                        />

                        {loading && (

                            <Loader2
                                size={20}
                                className="absolute right-4 top-4 animate-spin text-blue-600"
                            />

                        )}

                    </div>

                </div>

                {open && results.length > 0 && (

                    <div className="max-h-96 overflow-y-auto divide-y">

                        {results.map((property) => (

                            <button
                                key={property.objid}
                                type="button"
                                onClick={() => {

                                    setSelectedProperty(property);

                                    setOpenBilling(true);

                                    setKeyword(property.owner_name);

                                    setOpen(false);

                                }}
                                className="w-full px-5 py-4 text-left transition hover:bg-blue-50"
                            >

                                <div className="flex items-center gap-2">

                                    <User
                                        size={16}
                                        className="text-blue-600"
                                    />

                                    <span className="font-semibold text-gray-900">
                                        {property.owner_name}
                                    </span>

                                    <span className="text-gray-400">
                                        •
                                    </span>

                                    <span className="text-sm text-gray-600">
                                        <strong>TD:</strong> {property.tdno}
                                    </span>

                                    <span className="text-gray-400">
                                        •
                                    </span>

                                    <span className="text-sm text-gray-600">
                                        <strong>PIN:</strong> {property.fullpin}
                                    </span>

                                </div>

                                <div className="mt-1 flex items-center justify-between">

                                    <div className="truncate text-sm text-gray-500">

                                        {property.classification_name}

                                        {" • "}

                                        {property.barangay_name}

                                    </div>

                                    <div className="font-semibold text-blue-700">

                                        AV ₱
                                        {Number(property.totalav).toLocaleString(
                                            undefined,
                                            {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            }
                                        )}

                                    </div>

                                </div>

                            </button>

                        ))}

                    </div>

                )}

                {open &&
                    !loading &&
                    results.length === 0 &&
                    keyword.length >= 2 && (

                        <div className="p-8 text-center text-gray-500">

                            No property found.

                        </div>

                    )}

            </div>

            <CreateBillingDialog
            open={openBilling}
            property={selectedProperty}
            onClose={() => setOpenBilling(false)}
            onBillingCreated={onBillingCreated}
        />

        </>
    );
}