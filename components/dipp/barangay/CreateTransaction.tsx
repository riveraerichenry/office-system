"use client";

import { useEffect, useState } from "react";

import axios from "axios";

import {
    ChevronDown,
    FilePlus2,
    Loader2,
    BookOpen,
} from "lucide-react";

interface Booklet {
    id: string;

    form_code?: string | null;

    beginning_or?: number | string | null;

    ending_or?: number | string | null;

    current_or?: number | string | null;
}

export default function CreateTransaction() {
    const [booklets, setBooklets] =
        useState<Booklet[]>([]);

    const [selectedBooklet, setSelectedBooklet] =
        useState<Booklet | null>(null);

    const [loadingBooklets, setLoadingBooklets] =
        useState(true);

    const [bookletOpen, setBookletOpen] =
        useState(false);

    const [error, setError] = useState("");

    useEffect(() => {
        loadBooklets();
    }, []);

    async function loadBooklets() {
        try {
            setLoadingBooklets(true);
            setError("");

            const response = await axios.get(
                "/api/barangay-rat/my-booklets"
            );

            if (!response.data?.success) {
                throw new Error(
                    response.data?.message ??
                        "Failed to load booklets."
                );
            }

            const loadedBooklets: Booklet[] =
                response.data.booklets ?? [];

            setBooklets(loadedBooklets);

            if (loadedBooklets.length === 1) {
                setSelectedBooklet(
                    loadedBooklets[0]
                );
            }
        } catch (err: any) {
            console.error(
                "Failed to load CTC booklets:",
                err
            );

            setError(
                err?.response?.data?.message ??
                    err?.message ??
                    "Failed to load assigned booklets."
            );
        } finally {
            setLoadingBooklets(false);
        }
    }

    function formatORRange(booklet: Booklet) {
        const beginning =
            booklet.beginning_or !== null &&
            booklet.beginning_or !== undefined
                ? String(booklet.beginning_or)
                : "—";

        const ending =
            booklet.ending_or !== null &&
            booklet.ending_or !== undefined
                ? String(booklet.ending_or)
                : "—";

        return `${beginning} - ${ending}`;
    }

    function formatCurrentOR(booklet: Booklet) {
        if (
            booklet.current_or === null ||
            booklet.current_or === undefined
        ) {
            return "—";
        }

        return String(booklet.current_or);
    }

    function handleSelectBooklet(
        booklet: Booklet
    ) {
        setSelectedBooklet(booklet);
        setBookletOpen(false);
    }

    return (
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm">

            {/* =====================================================
                HEADER
            ====================================================== */}

            <div className="px-5 py-4 border-b border-slate-200">

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                    {/* =================================================
                        TITLE
                    ================================================== */}

                   
                    {/* =================================================
                        ACCOUNTABLE FORM DROPDOWN

                        FULL WIDTH / ONE LINE
                    ================================================== */}

                    <div className="relative w-full flex-1 min-w-0">

                        <button
                            type="button"
                            onClick={() =>
                                setBookletOpen(
                                    !bookletOpen
                                )
                            }
                            disabled={
                                loadingBooklets ||
                                booklets.length === 0
                            }
                            className="w-full flex items-center justify-between gap-3 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-left hover:border-blue-400 hover:bg-slate-50 transition disabled:cursor-not-allowed disabled:opacity-60"
                        >

                            <div className="flex items-center gap-3 min-w-0 flex-1">

                                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">

                                    {loadingBooklets ? (

                                        <Loader2
                                            className="w-4 h-4 text-blue-600 animate-spin"
                                        />

                                    ) : (

                                        <BookOpen
                                            className="w-4 h-4 text-blue-600"
                                        />

                                    )}

                                </div>

                                <div className="min-w-0 flex-1">

                                    {loadingBooklets ? (

                                        <p className="text-sm text-slate-500 truncate">
                                            Loading...
                                        </p>

                                    ) : selectedBooklet ? (

                                        <p className="text-sm font-semibold text-slate-800 truncate whitespace-nowrap">

                                            {selectedBooklet.form_code ??
                                                "—"}

                                            <span className="mx-2 text-slate-400">
                                                |
                                            </span>

                                            <span className="font-normal text-slate-500">
                                                OR Range:
                                            </span>{" "}

                                            {formatORRange(
                                                selectedBooklet
                                            )}

                                            <span className="mx-2 text-slate-400">
                                                |
                                            </span>

                                            <span className="font-normal text-slate-500">
                                                Current OR:
                                            </span>{" "}

                                            {formatCurrentOR(
                                                selectedBooklet
                                            )}

                                        </p>

                                    ) : (

                                        <p className="text-base font-bold text-slate-700 truncate">
                                            Select CTC Form
                                        </p>

                                    )}

                                </div>

                            </div>

                            <ChevronDown
                                className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${
                                    bookletOpen
                                        ? "rotate-180"
                                        : ""
                                }`}
                            />

                        </button>

                        {/* =================================================
                            DROPDOWN OPTIONS
                        ================================================== */}

                        {bookletOpen &&
                            booklets.length > 0 && (

                                <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-30 overflow-hidden">

                                    <div className="max-h-72 overflow-y-auto">

                                        {booklets.map(
                                            (booklet) => {

                                                const isSelected =
                                                    selectedBooklet?.id ===
                                                    booklet.id;

                                                return (

                                                    <button
                                                        key={
                                                            booklet.id
                                                        }
                                                        type="button"
                                                        onClick={() =>
                                                            handleSelectBooklet(
                                                                booklet
                                                            )
                                                        }
                                                        className={`w-full text-left px-4 py-3 border-b border-slate-100 last:border-b-0 transition ${
                                                            isSelected
                                                                ? "bg-blue-50"
                                                                : "hover:bg-slate-50"
                                                        }`}
                                                    >

                                                        <div className="flex items-center gap-2 min-w-0">

                                                            <BookOpen
                                                                size={16}
                                                                className="text-blue-600 shrink-0"
                                                            />

                                                            <p className="text-sm font-semibold text-slate-800 truncate whitespace-nowrap">

                                                                {
                                                                    booklet.form_code ??
                                                                    "—"
                                                                }

                                                                <span className="mx-2 text-slate-400">
                                                                    |
                                                                </span>

                                                                <span className="font-normal text-slate-500">
                                                                    OR Range:
                                                                </span>{" "}

                                                                {formatORRange(
                                                                    booklet
                                                                )}

                                                                <span className="mx-2 text-slate-400">
                                                                    |
                                                                </span>

                                                                <span className="font-normal text-slate-500">
                                                                    Current OR:
                                                                </span>{" "}

                                                                {formatCurrentOR(
                                                                    booklet
                                                                )}

                                                            </p>

                                                            {isSelected && (

                                                                <span className="ml-auto text-xs font-semibold text-blue-700 shrink-0">
                                                                    Selected
                                                                </span>

                                                            )}

                                                        </div>

                                                    </button>

                                                );

                                            }

                                        )}

                                    </div>

                                </div>

                            )}

                        {/* =================================================
                            NO BOOKLETS
                        ================================================== */}

                        {!loadingBooklets &&
                            booklets.length === 0 && (

                                <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">

                                    <p className="text-xs font-medium text-amber-700">
                                        No assigned accountable
                                        form is available.
                                    </p>

                                </div>

                            )}

                    </div>

                </div>

            </div>

            {/* =====================================================
                CONTENT
            ====================================================== */}

            <div className="p-5">

                {error && (

                    <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">

                        <p className="text-sm font-medium text-red-700">
                            {error}
                        </p>

                    </div>

                )}

                {/* =================================================
                    SELECTED BOOKLET INFORMATION
                ================================================== */}

                {selectedBooklet && (

                    <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50/50 p-4">

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                            {/* FORM CODE */}

                            <div>

                                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                    Form Code
                                </p>

                                <p className="mt-1 text-sm font-bold text-slate-800">
                                    {selectedBooklet.form_code ??
                                        "—"}
                                </p>

                            </div>

                            {/* OR RANGE */}

                            <div>

                                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                    OR Range
                                </p>

                                <p className="mt-1 text-sm font-bold text-slate-800">
                                    {formatORRange(
                                        selectedBooklet
                                    )}
                                </p>

                            </div>

                            {/* CURRENT OR */}

                            <div>

                                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                    Current OR
                                </p>

                                <p className="mt-1 text-sm font-bold text-slate-800">
                                    {formatCurrentOR(
                                        selectedBooklet
                                    )}
                                </p>

                            </div>

                        </div>

                    </div>

                )}

                {/* =================================================
                    CTC FORM
                ================================================== */}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    {/* CTC NO. */}

                    <div>

                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            CTC No.
                        </label>

                        <input
                            type="text"
                            placeholder="Enter CTC number"
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />

                    </div>

                    {/* DATE */}

                    <div>

                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Date
                        </label>

                        <input
                            type="date"
                            defaultValue={
                                new Date()
                                    .toISOString()
                                    .substring(0, 10)
                            }
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />

                    </div>

                </div>

                {/* TAXPAYER NAME */}

                <div className="mt-4">

                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Taxpayer Name
                    </label>

                    <input
                        type="text"
                        placeholder="Enter taxpayer name"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                </div>

                {/* TIN + PLACE OF BIRTH */}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">

                    <div>

                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            TIN
                        </label>

                        <input
                            type="text"
                            placeholder="Enter TIN"
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />

                    </div>

                    <div>

                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Place of Birth
                        </label>

                        <input
                            type="text"
                            placeholder="Enter place of birth"
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />

                    </div>

                </div>

                {/* BASIC + ADDITIONAL COMMUNITY TAX */}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">

                    <div>

                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Basic Community Tax
                        </label>

                        <input
                            type="number"
                            placeholder="0.00"
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />

                    </div>

                    <div>

                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Additional Community Tax
                        </label>

                        <input
                            type="number"
                            placeholder="0.00"
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />

                    </div>

                </div>

                {/* CREATE BUTTON */}

                <div className="flex justify-end pt-5">

                    <button
                        type="button"
                        disabled={!selectedBooklet}
                        className="px-5 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Create CTC
                    </button>

                </div>

            </div>

        </section>
    );
}