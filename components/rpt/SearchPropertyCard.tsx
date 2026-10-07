"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
    Search,
    Loader2,
    X,
} from "lucide-react";

import CreateBillingDialog from "./CreateBillingDialog";
import PropertyDetailsCard, {
    Property,
} from "./PropertyDetailsCard";
import PaymentHistoryCard from "./PaymentHistoryCard";

type Props = {
    onBillingCreated: (data: any) => void;
};

export default function SearchPropertyCard({
    onBillingCreated,
}: Props) {
    const [keyword, setKeyword] = useState("");
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<Property[]>([]);
    const [selectedProperty, setSelectedProperty] =
        useState<Property | null>(null);

    const [openBilling, setOpenBilling] = useState(false);

    const wrapperRef = useRef<HTMLDivElement | null>(null);

    /* ================================================================
        SEARCH PROPERTY
    ================================================================ */

    useEffect(() => {
        const trimmedKeyword = keyword.trim();

        if (!trimmedKeyword) {
            setResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                setLoading(true);

                const response = await axios.get(
                    "/api/rpt/faas/search",
                    {
                        params: {
                            q: trimmedKeyword,
                        },
                    }
                );

                if (response.data?.success) {
                    setResults(
                        response.data.results || []
                    );
                } else {
                    setResults([]);
                }
            } catch (error) {
                console.error(
                    "PROPERTY SEARCH ERROR:",
                    error
                );

                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 350);

        return () => clearTimeout(timer);
    }, [keyword]);

    /* ================================================================
        CLOSE SEARCH RESULTS WHEN CLICKING OUTSIDE
    ================================================================ */

    useEffect(() => {
        function handleClickOutside(
            event: MouseEvent
        ) {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(
                    event.target as Node
                )
            ) {
                setResults([]);
            }
        }

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    /* ================================================================
        SELECT PROPERTY
    ================================================================ */

    function handleSelectProperty(
        property: Property
    ) {
        setSelectedProperty(property);
        setResults([]);
    }

    /* ================================================================
        CLEAR SEARCH
    ================================================================ */

    function clearSearch() {
        setKeyword("");
        setResults([]);
        setSelectedProperty(null);
    }

    /* ================================================================
        CREATE BILLING
    ================================================================ */

    function handleCreateBilling() {
        if (!selectedProperty) {
            return;
        }

        setOpenBilling(true);
    }

    /* ================================================================
        BILLING CREATED
    ================================================================ */

    function handleBillingCreated(data: any) {
        setOpenBilling(false);

        onBillingCreated(data);
    }

    return (
        <div className="w-full">

            {/* ========================================================
                SEARCH CARD
            ======================================================== */}

            <div
                className="
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    p-5
                    shadow-[0_10px_35px_rgba(0,0,0,0.06)]
                "
            >
                <div className="mb-4">
                    <h2
                        className="
                            text-lg
                            font-bold
                            text-slate-900
                        "
                    >
                        Search Property
                    </h2>

                    <p
                        className="
                            mt-1
                            text-sm
                            text-slate-500
                        "
                    >
                        Search by owner, TD number,
                        PIN, or barangay.
                    </p>
                </div>

                <div
                    ref={wrapperRef}
                    className="relative"
                >
                    {/* SEARCH INPUT */}

                    <div className="relative">
                        <Search
                            size={19}
                            className="
                                absolute
                                left-4
                                top-1/2
                                -translate-y-1/2
                                text-slate-400
                            "
                        />

                        <input
                            type="text"
                            value={keyword}
                            onChange={(event) =>
                                setKeyword(
                                    event.target.value
                                )
                            }
                            placeholder="
                                Search owner, TD number,
                                PIN, or barangay...
                            "
                            className="
                                h-12
                                w-full
                                rounded-xl
                                border
                                border-slate-200
                                bg-slate-50
                                pl-11
                                pr-12
                                text-sm
                                font-medium
                                text-slate-900
                                outline-none
                                transition-all
                                placeholder:text-slate-400
                                focus:border-blue-500
                                focus:bg-white
                                focus:ring-4
                                focus:ring-blue-500/10
                            "
                        />

                        {/* LOADING */}

                        {loading && (
                            <Loader2
                                size={18}
                                className="
                                    absolute
                                    right-4
                                    top-1/2
                                    -translate-y-1/2
                                    animate-spin
                                    text-blue-500
                                "
                            />
                        )}

                        {/* CLEAR */}

                        {!loading &&
                            keyword && (
                                <button
                                    type="button"
                                    onClick={
                                        clearSearch
                                    }
                                    className="
                                        absolute
                                        right-3
                                        top-1/2
                                        flex
                                        h-7
                                        w-7
                                        -translate-y-1/2
                                        items-center
                                        justify-center
                                        rounded-lg
                                        text-slate-400
                                        transition
                                        hover:bg-slate-200
                                        hover:text-slate-700
                                    "
                                >
                                    <X size={16} />
                                </button>
                            )}
                    </div>

                    {/* =================================================
                        SEARCH RESULTS
                    ================================================= */}

                    {results.length > 0 && (
                        <div
                            className="
                                absolute
                                left-0
                                right-0
                                z-40
                                mt-2
                                max-h-[420px]
                                overflow-y-auto
                                rounded-2xl
                                border
                                border-slate-200
                                bg-white
                                p-2
                                shadow-[0_20px_50px_rgba(0,0,0,0.12)]
                            "
                        >
                            {results.map(
                                (property) => (
                                    <button
                                        key={
                                            property.objid
                                        }
                                        type="button"
                                        onClick={() =>
                                            handleSelectProperty(
                                                property
                                            )
                                        }
                                        className="
                                            w-full
                                            rounded-xl
                                            p-4
                                            text-left
                                            transition-all
                                            hover:bg-blue-50
                                        "
                                    >
                                        <div
                                            className="
                                                flex
                                                items-start
                                                justify-between
                                                gap-4
                                            "
                                        >
                                            <div className="min-w-0">
                                                <p
                                                    className="
                                                        truncate
                                                        text-sm
                                                        font-bold
                                                        text-slate-900
                                                    "
                                                >
                                                    {property.owner_name ||
                                                        "Unknown Owner"}
                                                </p>

                                                <div
                                                    className="
                                                        mt-2
                                                        flex
                                                        flex-wrap
                                                        gap-x-4
                                                        gap-y-1
                                                    "
                                                >
                                                    <span
                                                        className="
                                                            text-xs
                                                            font-semibold
                                                            text-blue-600
                                                        "
                                                    >
                                                        TD:{" "}
                                                        {property.tdno ||
                                                            "-"}
                                                    </span>

                                                    <span
                                                        className="
                                                            text-xs
                                                            text-slate-500
                                                        "
                                                    >
                                                        PIN:{" "}
                                                        {property.fullpin ||
                                                            "-"}
                                                    </span>
                                                </div>

                                                <p
                                                    className="
                                                        mt-1.5
                                                        truncate
                                                        text-xs
                                                        text-slate-500
                                                    "
                                                >
                                                    {property.barangay_name ||
                                                        "-"}
                                                </p>
                                            </div>

                                            <span
                                                className="
                                                    shrink-0
                                                    rounded-lg
                                                    bg-blue-50
                                                    px-2.5
                                                    py-1
                                                    text-[10px]
                                                    font-bold
                                                    uppercase
                                                    tracking-wide
                                                    text-blue-600
                                                "
                                            >
                                                Select
                                            </span>
                                        </div>
                                    </button>
                                )
                            )}
                        </div>
                    )}

                    {/* NO RESULTS */}

                    {!loading &&
                        keyword.trim() &&
                        results.length === 0 &&
                        !selectedProperty && (
                            <div
                                className="
                                    mt-2
                                    rounded-xl
                                    border
                                    border-slate-200
                                    bg-slate-50
                                    px-4
                                    py-3
                                    text-sm
                                    text-slate-500
                                "
                            >
                                No property found.
                            </div>
                        )}
                </div>
            </div>

            {/* ========================================================
                SELECTED PROPERTY
            ======================================================== */}

            {selectedProperty && (
                <div
                    className="
                        mt-6
                        grid
                        grid-cols-1
                        gap-6
                        xl:grid-cols-12
                    "
                >
                    {/* =================================================
                        PROPERTY DETAILS
                    ================================================= */}

                    <div className="xl:col-span-8">
                        <PropertyDetailsCard
                            property={
                                selectedProperty
                            }
                            onClear={() =>
                                setSelectedProperty(
                                    null
                                )
                            }
                        />
                    </div>

                    {/* =================================================
                        PAYMENT HISTORY
                    ================================================= */}

                    <div className="xl:col-span-4">
                        <PaymentHistoryCard
                            property={
                                selectedProperty
                            }
                            onCreateBilling={
                                handleCreateBilling
                            }
                            onAddPayment={() => {
                                // Add Payment dialog will be
                                // connected here next.
                                console.log(
                                    "Add Payment:",
                                    selectedProperty
                                );
                            }}
                        />
                    </div>
                </div>
            )}

            {/* ========================================================
                EXISTING CREATE BILLING DIALOG
                DO NOT CHANGE
            ======================================================== */}

            <CreateBillingDialog
                open={openBilling}
                property={selectedProperty}
                onClose={() =>
                    setOpenBilling(false)
                }
                onBillingCreated={
                    handleBillingCreated
                }
            />
        </div>
    );
}