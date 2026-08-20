"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
    Search,
    Loader2,
    X,
} from "lucide-react";
import CreateBillingDialog from "./CreateBillingDialog";

type Property = {
    objid: string;
    tdno: string;
    prevtdno: string | null;
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

    const [selectedProperty, setSelectedProperty] =
        useState<Property | null>(null);

    const [openBilling, setOpenBilling] = useState(false);

    const wrapperRef = useRef<HTMLDivElement>(null);

    /*
     * ============================================================
     * SEARCH PROPERTIES
     * ============================================================
     */

    useEffect(() => {
        const searchKeyword = keyword.trim();

        if (searchKeyword.length < 2) {
            setResults([]);
            setLoading(false);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                setLoading(true);

                const res = await axios.get(
                    "/api/rpt/faas/search",
                    {
                        params: {
                            q: searchKeyword,
                        },
                    }
                );

                setResults(
                    Array.isArray(res.data?.results)
                        ? res.data.results
                        : []
                );
            } catch (error) {
                console.error(
                    "PROPERTY SEARCH ERROR:",
                    error
                );

                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [keyword]);

    /*
     * ============================================================
     * CLOSE RESULTS WHEN CLICKING OUTSIDE
     * ============================================================
     */

    useEffect(() => {
        const handleClickOutside = (
            event: MouseEvent
        ) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(
                    event.target as Node
                )
            ) {
                setResults([]);
            }
        };

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

    /*
     * ============================================================
     * CLEAR SEARCH
     * ============================================================
     */

    const clearSearch = () => {
        setKeyword("");
        setResults([]);
    };

    /*
     * ============================================================
     * SELECT PROPERTY
     * ============================================================
     */

    const handleSelectProperty = (
        property: Property
    ) => {
        setSelectedProperty(property);
        setResults([]);
        setOpenBilling(true);
    };

    /*
     * ============================================================
     * RETURN
     * ============================================================
     */

    return (
        <>
            <section
                ref={wrapperRef}
                className="
                    relative
                    w-full
                "
            >
                {/* =====================================================
                    SEARCH CARD
                ====================================================== */}

                <div
                    className="
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        shadow-sm
                    "
                >
                    {/* =================================================
                        HEADER
                    ================================================== */}

                    <div
                        className="
                            px-4
                            py-5
                            sm:px-6
                            sm:py-6
                        "
                    >
                        {/* =============================================
                            TITLE
                        ============================================== */}

                       

                        {/* =============================================
                            SEARCH BAR
                        ============================================== */}

                        <div className="mx-auto w-full md:w-1/2">
                            <div className="relative">
                                {/* Search icon */}

                                <Search
                                    size={18}
                                    className="
                                        pointer-events-none
                                        absolute
                                        left-3.5
                                        top-1/2
                                        -translate-y-1/2
                                        text-slate-500
                                    "
                                />

                                {/* Input */}

                                <input
                                    id="property-search"
                                    type="text"
                                    value={keyword}
                                    onChange={(e) =>
                                        setKeyword(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Search owner, TD number, PIN, or barangay..."
                                    autoComplete="off"
                                    className="
                                        h-11
                                        w-full
                                        rounded-lg
                                        border
                                        border-slate-300
                                        bg-white
                                        pl-10
                                        pr-10
                                        text-sm
                                        text-slate-900
                                        outline-none
                                        transition
                                        placeholder:text-slate-400
                                        hover:border-slate-400
                                        focus:border-blue-600
                                        focus:ring-2
                                        focus:ring-blue-600/10
                                    "
                                />

                                {/* Loading */}

                                {loading && (
                                    <Loader2
                                        size={18}
                                        className="
                                            absolute
                                            right-3.5
                                            top-1/2
                                            -translate-y-1/2
                                            animate-spin
                                            text-blue-600
                                        "
                                    />
                                )}

                                {/* Clear */}

                                {keyword && !loading && (
                                    <button
                                        type="button"
                                        onClick={clearSearch}
                                        className="
                                            absolute
                                            right-2.5
                                            top-1/2
                                            -translate-y-1/2
                                            rounded-md
                                            p-1.5
                                            text-slate-400
                                            transition
                                            hover:bg-slate-100
                                            hover:text-slate-700
                                        "
                                        aria-label="Clear search"
                                    >
                                        <X size={15} />
                                    </button>
                                )}
                            </div>

                            <p
                                className="
                                    mt-1.5
                                    text-center
                                    text-[11px]
                                    text-slate-400
                                "
                            >
                                Enter at least 2 characters
                                to search.
                            </p>
                        </div>
                    </div>
                </div>

                {/* =====================================================
                    FLOWING / OVERFLOW SEARCH RESULTS
                ====================================================== */}

                {(loading ||
                    results.length > 0 ||
                    (keyword.trim().length >= 2 &&
                        !loading)) && (
                    <div
                        className="
                            absolute
                            left-0
                            right-0
                            top-full
                            z-50
                            mt-2
                        "
                    >
                        <div
                            className="
                                overflow-hidden
                                rounded-xl
                                border
                                border-slate-200
                                bg-white
                                shadow-xl
                            "
                        >
                            {/* =========================================
                                LOADING
                            ========================================== */}

                            {loading && (
                                <div
                                    className="
                                        flex
                                        items-center
                                        justify-center
                                        gap-3
                                        px-5
                                        py-5
                                        text-sm
                                        text-slate-500
                                    "
                                >
                                    <Loader2
                                        size={17}
                                        className="
                                            animate-spin
                                            text-blue-600
                                        "
                                    />

                                    <span>
                                        Searching property
                                        accounts...
                                    </span>
                                </div>
                            )}

                            {/* =========================================
                                RESULTS
                            ========================================== */}

                            {!loading &&
                                results.length > 0 && (
                                    <div
                                        className="
                                            max-h-[420px]
                                            overflow-y-auto
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
                                                        group
                                                        flex
                                                        w-full
                                                        items-center
                                                        gap-3
                                                        border-b
                                                        border-slate-100
                                                        px-4
                                                        py-3
                                                        text-left
                                                        transition
                                                        last:border-b-0
                                                        hover:bg-slate-50
                                                        sm:px-5
                                                    "
                                                >
                                                    {/* Search icon */}

                                                    <Search
                                                        size={
                                                            17
                                                        }
                                                        className="
                                                            shrink-0
                                                            text-slate-400
                                                            transition
                                                            group-hover:text-blue-600
                                                        "
                                                    />

                                                    {/* =================================
                                                        ONE-LINE RESULT
                                                    ================================== */}

                                                    <div
                                                        className="
                                                            min-w-0
                                                            flex-1
                                                            truncate
                                                            whitespace-nowrap
                                                            text-sm
                                                            text-slate-700
                                                        "
                                                    >
                                                        {/* Owner */}

                                                        <span
                                                            className="
                                                                font-semibold
                                                                text-slate-900
                                                            "
                                                        >
                                                            {
                                                                property.owner_name
                                                            }
                                                        </span>

                                                        <span className="mx-2 text-slate-300">
                                                            •
                                                        </span>

                                                        {/* TD */}

                                                        <span>
                                                            TD:{" "}
                                                            {property.tdno ||
                                                                "-"}
                                                        </span>

                                                        {/* Previous TD */}

                                                        {property.prevtdno && (
                                                            <>
                                                                <span className="mx-2 text-slate-300">
                                                                    •
                                                                </span>

                                                                <span>
                                                                    Prev
                                                                    TD:{" "}
                                                                    {
                                                                        property.prevtdno
                                                                    }
                                                                </span>
                                                            </>
                                                        )}

                                                        {/* PIN */}

                                                        <span className="mx-2 text-slate-300">
                                                            •
                                                        </span>

                                                        <span>
                                                            PIN:{" "}
                                                            {property.fullpin ||
                                                                "-"}
                                                        </span>

                                                        {/* Barangay */}

                                                        <span className="mx-2 text-slate-300">
                                                            •
                                                        </span>

                                                        <span>
                                                            {property.barangay_name ||
                                                                "-"}
                                                        </span>
                                                    </div>
                                                </button>
                                            )
                                        )}
                                    </div>
                                )}

                            {/* =========================================
                                NO RESULTS
                            ========================================== */}

                           
                        </div>
                    </div>
                )}
            </section>

            {/* ===========================================================
                BILLING DIALOG
            ============================================================ */}

            <CreateBillingDialog
                open={openBilling}
                property={selectedProperty}
                onClose={() =>
                    setOpenBilling(false)
                }
                onBillingCreated={
                    onBillingCreated
                }
            />
        </>
    );
}