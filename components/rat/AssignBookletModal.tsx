"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
    X,
    BookOpen,
    FileText,
    Search,
    ChevronLeft,
    ChevronRight,
    RotateCcw,
} from "lucide-react";

type Props = {
    open: boolean;
    item: any;
    onClose: () => void;
    onSelect: (booklet: any) => void;
};

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export default function AssignBookletModal({
    open,
    item,
    onClose,
    onSelect,
}: Props) {
    const [loading, setLoading] = useState(false);
    const [booklets, setBooklets] = useState<any[]>([]);

    const [search, setSearch] = useState("");
    const [formCodeFilter, setFormCodeFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        if (open && item) {
            loadBooklets();
        }

        if (!open) {
            setSearch("");
            setFormCodeFilter("");
            setStatusFilter("ALL");
            setPage(1);
        }
    }, [open, item]);

    async function loadBooklets() {
        try {
            setLoading(true);
            setBooklets([]);

            const res = await axios.get("/api/rat/booklets", {
                params: {
                    accountable_form_id: item?.accountable_form_id,
                },
            });

            setBooklets(
                Array.isArray(res.data?.data)
                    ? res.data.data
                    : []
            );
        } catch (err) {
            console.error("Failed to load booklets:", err);
            setBooklets([]);
        } finally {
            setLoading(false);
        }
    }

    const formCodes = useMemo(() => {
        return Array.from(
            new Set(
                booklets
                    .map((booklet) =>
                        String(booklet?.form_code ?? "").trim()
                    )
                    .filter(Boolean)
            )
        ).sort((a, b) => a.localeCompare(b));
    }, [booklets]);

    const filteredBooklets = useMemo(() => {
        const query = search.trim().toLowerCase();

        return booklets.filter((booklet) => {
            const matchesSearch =
                !query ||
                [
                    booklet?.form_code,
                    booklet?.form_name,
                    booklet?.control_no,
                    booklet?.series,
                    booklet?.current_or,
                    booklet?.beginning_or,
                    booklet?.ending_or,
                    booklet?.status,
                ].some((value) =>
                    String(value ?? "")
                        .toLowerCase()
                        .includes(query)
                );

            const matchesFormCode =
                !formCodeFilter ||
                String(booklet?.form_code ?? "").trim() ===
                    formCodeFilter;

            const matchesStatus =
                statusFilter === "ALL" ||
                String(booklet?.status ?? "")
                    .trim()
                    .toUpperCase() === statusFilter;

            return (
                matchesSearch &&
                matchesFormCode &&
                matchesStatus
            );
        });
    }, [
        booklets,
        search,
        formCodeFilter,
        statusFilter,
    ]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredBooklets.length / pageSize)
    );

    const currentPage = Math.min(page, totalPages);

    const pageItems = useMemo(() => {
        const start = (currentPage - 1) * pageSize;

        return filteredBooklets.slice(
            start,
            start + pageSize
        );
    }, [filteredBooklets, currentPage, pageSize]);

    useEffect(() => {
        setPage(1);
    }, [search, formCodeFilter, statusFilter, pageSize]);

    function handleSelect(booklet: any) {
        onSelect(booklet);
        onClose();
    }

    function clearFilters() {
        setSearch("");
        setFormCodeFilter("");
        setStatusFilter("ALL");
        setPage(1);
    }

    if (!open) {
        return null;
    }

    const firstRecord =
        filteredBooklets.length === 0
            ? 0
            : (currentPage - 1) * pageSize + 1;

    const lastRecord = Math.min(
        currentPage * pageSize,
        filteredBooklets.length
    );

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4 sm:p-6">
            <div className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">

                {/* HEADER */}
                <div className="flex items-center justify-between border-b bg-slate-50 px-6 py-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">
                            Assign Booklet
                        </h2>

                        <p className="text-sm text-slate-500">
                            Select an available booklet.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close modal"
                        className="rounded-lg p-2 transition hover:bg-slate-200"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* SCROLLABLE CONTENT */}
                <div className="space-y-6 overflow-y-auto p-4 sm:p-6">

                    {/* REQUESTED FORM */}
                    <div className="rounded-xl border">
                        <div className="border-b bg-slate-50 px-5 py-3">
                            <div className="flex items-center gap-2 font-semibold text-slate-700">
                                <FileText size={18} />
                                Requested Accountable Form
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-3">
                            <div>
                                <div className="text-xs uppercase tracking-wide text-slate-500">
                                    Form Code
                                </div>

                                <div className="mt-1 font-semibold text-blue-700">
                                    {item?.form_code ?? "—"}
                                </div>
                            </div>

                            <div>
                                <div className="text-xs uppercase tracking-wide text-slate-500">
                                    Accountable Form
                                </div>

                                <div className="mt-1 text-slate-800">
                                    {item?.form_name ?? "—"}
                                </div>
                            </div>

                            <div>
                                <div className="text-xs uppercase tracking-wide text-slate-500">
                                    Requested Quantity
                                </div>

                                <div className="mt-1 font-semibold text-slate-800">
                                    {item?.quantity ?? "—"}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AVAILABLE BOOKLETS */}
                    <div className="overflow-hidden rounded-xl border">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-slate-50 px-5 py-3">
                            <div className="flex items-center gap-2 font-semibold text-slate-700">
                                <BookOpen size={18} />
                                Available Booklets
                            </div>

                            <span className="text-sm text-slate-500">
                                {filteredBooklets.length} result
                                {filteredBooklets.length !== 1 ? "s" : ""}
                            </span>
                        </div>

                        {/* SEARCH AND FILTERS */}
                        <div className="grid grid-cols-1 gap-3 border-b bg-white p-4 md:grid-cols-12">

                            {/* SEARCH */}
                            <div className="relative md:col-span-6">
                                <Search
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(e.target.value)
                                    }
                                    placeholder="Search control no., series, OR range..."
                                    className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            

                            

                            {/* CLEAR */}
                            <div className="md:col-span-1">
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    title="Clear filters"
                                    aria-label="Clear filters"
                                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                                >
                                    <RotateCcw size={16} />
                                    <span className="md:hidden">
                                        Clear filters
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* TABLE */}
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px]">
                                <thead className="bg-slate-100">
                                    <tr className="text-left text-sm font-semibold text-slate-700">
                                        <th className="px-4 py-3">
                                            Form Code
                                        </th>
                                        <th className="px-4 py-3">
                                            Control No.
                                        </th>
                                        <th className="px-4 py-3">
                                            Series
                                        </th>
                                        <th className="px-4 py-3 text-center">
                                            Current OR
                                        </th>
                                        <th className="px-4 py-3 text-center">
                                            OR Range
                                        </th>
                                        <th className="px-4 py-3 text-center">
                                            Status
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="py-12 text-center text-slate-500"
                                            >
                                                Loading available booklets...
                                            </td>
                                        </tr>
                                    ) : pageItems.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="py-12 text-center text-slate-500"
                                            >
                                                No matching booklets found.
                                            </td>
                                        </tr>
                                    ) : (
                                        pageItems.map((booklet) => (
                                            <tr
                                                key={booklet.id}
                                                onClick={() =>
                                                    handleSelect(booklet)
                                                }
                                                onKeyDown={(e) => {
                                                    if (
                                                        e.key === "Enter" ||
                                                        e.key === " "
                                                    ) {
                                                        e.preventDefault();
                                                        handleSelect(booklet);
                                                    }
                                                }}
                                                tabIndex={0}
                                                role="button"
                                                aria-label={`Assign booklet ${booklet.control_no ?? ""}`}
                                                className="cursor-pointer border-b transition hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                                            >
                                                <td className="px-4 py-3 font-semibold text-indigo-600">
                                                    {booklet.form_code ?? "—"}
                                                </td>

                                                <td className="px-4 py-3 font-semibold text-blue-700">
                                                    {booklet.control_no ?? "—"}
                                                </td>

                                                <td className="px-4 py-3">
                                                    {booklet.series ?? "—"}
                                                </td>

                                                <td className="px-4 py-3 text-center">
                                                    {booklet.current_or ?? "—"}
                                                </td>

                                                <td className="px-4 py-3 text-center">
                                                    {booklet.beginning_or ?? "—"}
                                                    {" - "}
                                                    {booklet.ending_or ?? "—"}
                                                </td>

                                                <td className="px-4 py-3 text-center">
                                                    <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                                        {booklet.status ?? "—"}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* PAGINATION */}
                        {!loading && filteredBooklets.length > 0 && (
                            <div className="flex flex-col gap-4 border-t bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">

                                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                                    <span>
                                        Showing{" "}
                                        <strong>{firstRecord}</strong>
                                        {" - "}
                                        <strong>{lastRecord}</strong>
                                        {" of "}
                                        <strong>
                                            {filteredBooklets.length}
                                        </strong>
                                    </span>

                                    <label className="flex items-center gap-2">
                                        Rows:
                                        <select
                                            value={pageSize}
                                            onChange={(e) =>
                                                setPageSize(
                                                    Number(e.target.value)
                                                )
                                            }
                                            className="rounded-md border border-slate-300 bg-white px-2 py-1.5 outline-none focus:border-blue-500"
                                        >
                                            {PAGE_SIZE_OPTIONS.map((size) => (
                                                <option
                                                    key={size}
                                                    value={size}
                                                >
                                                    {size}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                </div>

                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setPage(currentPage - 1)
                                        }
                                        disabled={currentPage <= 1}
                                        className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        <ChevronLeft size={16} />
                                        Previous
                                    </button>

                                    <span className="px-2 text-sm font-medium text-slate-700">
                                        Page {currentPage} of {totalPages}
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setPage(currentPage + 1)
                                        }
                                        disabled={currentPage >= totalPages}
                                        className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Next
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* FOOTER */}
                    <div className="flex justify-end gap-3 border-t pt-5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-slate-300 px-5 py-2 font-medium transition hover:bg-slate-100"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}