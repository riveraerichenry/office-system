"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  FileText,
  Calendar,
  User,
  Package,
} from "lucide-react";

type Props = {
  data: any[];
  loading: boolean;

  selected: any;

  search: string;
  onSearch: (value: string) => void;

  onRefresh: () => void;

  onSelect: (row: any) => void;
};

export default function ApprovedRISTable({
  data,
  loading,
  selected,
  search,
  onSearch,
  onRefresh,
  onSelect,
    }: Props) {

        console.log("Approved RIS:", data);

    const [page, setPage] =
        useState(1);

    const ROWS_PER_PAGE = 10;

    useEffect(() => {
        setPage(1);
    }, [search]);

    const filtered = useMemo(() => {

        const keyword =
        search.toLowerCase();

        return data.filter((r) =>
        r.ris_no
            ?.toLowerCase()
            .includes(keyword)
        );

    }, [data, search]);

    const totalPages = Math.max(
        1,
        Math.ceil(
        filtered.length /
            ROWS_PER_PAGE
        )
    );

    const paginated =
        filtered.slice(
        (page - 1) *
            ROWS_PER_PAGE,
        page * ROWS_PER_PAGE
        );

    
    

    return (

        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

        {/* Header */}

        <div className="border-b bg-slate-50 p-4">

            <div className="flex items-center justify-between">

            <div>

                <h2 className="text-lg font-semibold text-slate-800">

                Approved RIS

                </h2>

                <p className="text-sm text-slate-500">

                Ready for RAT generation

                </p>

            </div>

            <span className="rounded-lg bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">

                {filtered.length}

            </span>

            </div>

            <div className="relative mt-4">

            <Search
                size={18}
                className="absolute left-3 top-3 text-slate-400"
            />

            <input
                value={search}
                onChange={(e) =>
                onSearch(
                    e.target.value
                )
                }
                placeholder="Search RIS Number..."
                className="w-full rounded-lg border py-2 pl-10 pr-3 focus:border-blue-600 focus:outline-none"
            />

            </div>

        </div>

        {/* Body */}

        {/* Body */}

    <div className="max-h-[650px] overflow-y-auto">

    {loading ? (

        <div className="flex h-[650px] items-center justify-center text-slate-500">

        Loading approved RIS...

        </div>

    ) : paginated.length === 0 ? (

        <div className="flex h-[650px] flex-col items-center justify-center gap-3 text-slate-500">

        <FileText size={48} />

        <span>No approved RIS found.</span>

        </div>

    ) : (

        paginated.map((row) => (

            <button
                key={row.id}
                onClick={() => onSelect(row)}
                className={`flex w-full items-center justify-between border-b px-4 py-3 text-left transition

                ${
                selected?.id === row.id
                    ? "border-l-4 border-l-blue-600 bg-blue-50"
                    : "hover:bg-slate-50"
                }`}
            >

                {/* Left */}

                <div className="min-w-0 flex-1">

                <div className="truncate font-semibold text-blue-700">
                    {row.ris_no}
                </div>

                <div className="truncate text-xs text-slate-500">
                    {row.accountable_officer}
                </div>

                </div>

                {/* Right */}

                <div className="ml-3 text-right">

                <div className="text-xs text-slate-500">
                    {row.request_date
                    ? new Date(row.request_date).toLocaleDateString(
                        "en-US",
                        {
                            month: "short",
                            day: "numeric",
                        }
                        )
                    : "-"}
                </div>

                <div className="text-sm font-semibold text-slate-700">
                    Qty {row.quantity}
                </div>

                </div>

            </button>

            ))

    )}

    </div>

    {/* Footer */}

    <div className="flex items-center justify-between border-t bg-slate-50 px-4 py-3">

    <button
        onClick={() =>
        setPage((p) =>
            Math.max(1, p - 1)
        )
        }
        disabled={page === 1}
        className="rounded border px-3 py-1 text-sm disabled:opacity-40"
    >
        Previous
    </button>

    <span className="text-sm text-slate-600">
        Page {page} of {totalPages}
    </span>

    <button
        onClick={() =>
        setPage((p) =>
            Math.min(
            totalPages,
            p + 1
            )
        )
        }
        disabled={page >= totalPages}
        className="rounded border px-3 py-1 text-sm disabled:opacity-40"
    >
        Next
    </button>

    </div>

    </div>
    );
}