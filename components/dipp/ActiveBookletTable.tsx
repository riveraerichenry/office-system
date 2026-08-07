"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  FileText,
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

export default function ActiveBookletTable({

  data,
  loading,
  selected,

  search,

  onSearch,

  onRefresh,

  onSelect,


}: Props) {

  const [page, setPage] =
    useState(1);

  const ROWS_PER_PAGE = 10;

  useEffect(() => {

    setPage(1);

  }, [search]);

  const filtered =
    useMemo(() => {

      const keyword =
        search.toLowerCase();

      return data.filter((r) =>

        r.form_code
          ?.toLowerCase()
          .includes(keyword)

        ||

        r.form_name
          ?.toLowerCase()
          .includes(keyword)

        ||

        r.control_no
          ?.toLowerCase()
          .includes(keyword)

        ||

        r.fund_code
          ?.toLowerCase()
          .includes(keyword)

        ||

        r.series
          ?.toLowerCase()
          .includes(keyword)

      );

    }, [data, search]);

  const totalPages =
    Math.max(
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
      page *
        ROWS_PER_PAGE
    );

  return (

    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

      {/* Header */}

      <div className="border-b bg-slate-50 p-4">

        <div className="flex items-center justify-between">

          <div>

            <h2 className="text-lg font-semibold text-slate-800">

              My Active Booklets

            </h2>

            <p className="text-sm text-slate-500">

              Ready for Daily Issuance

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
            onChange={(e)=>
              onSearch(
                e.target.value
              )
            }
            placeholder="Search..."
            className="w-full rounded-lg border py-2 pl-10 pr-3 text-sm focus:border-blue-600 focus:outline-none"
          />

        </div>

      </div>

      {/* Body */}

      <div className="max-h-[690px] overflow-y-auto">

        {

          loading ? (

            <div className="flex h-[690px] items-center justify-center text-slate-500">

              Loading active booklets...

            </div>

          )

          :

          paginated.length === 0 ? (

            <div className="flex h-[690px] flex-col items-center justify-center gap-3 text-slate-500">

              <FileText size={48} />

              <span>

                No active booklets found.

              </span>

            </div>

          )

          :

          paginated.map((row) => {

            const totalReceipts =
                Number(
                    row.total_receipts
                );

            const usedReceipts =
                Number(
                    row.issued_receipts
                );

            const remainingReceipts =
                Number(
                    row.remaining_receipts
                );

            const percent =
                Number(
                    row.consumed_percent
                );

            return (

              <button
                  key={row.id}
                  onClick={() => onSelect(row)}
                  className={`w-full border-b p-3 text-left transition

                  ${
                      selected?.id === row.id
                          ? "border-l-4 border-l-blue-600 bg-blue-50"
                          : "hover:bg-slate-50"
                  }`}
              >

                {/* Header */}

                <div className="flex items-start justify-between">

                  <div>

                    <div className="text-lg font-bold text-blue-700">

                      {row.form_code}

                    </div>

                    <div className="text-xs text-slate-500">

                      {row.form_name}

                    </div>

                  </div>

                  <div className="text-right">

                    <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">

                      Current O.R.

                    </div>

                    <div className="text-4xl font-black leading-none text-blue-700">

                      {row.current_or}

                    </div>

                  </div>

                </div>

                {/* Compact Information */}

                <div className="mt-3 flex items-center justify-between text-xs text-slate-600">

                  <span>

                    {row.fund_code}

                  </span>

                  <span>

                    {row.series}

                  </span>

                  <span>

                    {

                      row.released_at

                      ?

                      new Date(
                        row.released_at
                      ).toLocaleDateString()

                      :

                      "-"

                    }

                  </span>

                </div>

                {/* ---------- PART 2 STARTS HERE ---------- */}

                                {/* OR Range */}

                <div className="mt-4">

                  <div className="mb-1 flex items-center justify-between text-[11px] font-medium text-slate-500">

                    <span>

                      O.R. Range

                    </span>

                    <span>

                      {row.beginning_or} - {row.ending_or}

                    </span>

                  </div>

                  <div className="flex items-center gap-2">

                    <span className="w-10 text-center text-xs font-semibold text-slate-600">

                      {row.beginning_or}

                    </span>

                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">

                      <div

                        className="h-full rounded-full bg-blue-600 transition-all"

                        style={{
                          width: `${percent}%`,
                        }}

                      />

                    </div>

                    <span className="w-10 text-center text-xs font-semibold text-slate-600">

                      {row.ending_or}

                    </span>

                  </div>

                </div>

                {/* Statistics */}

                <div className="mt-3 flex items-center justify-between text-xs">

                  <div>

                    <span className="font-semibold text-red-600">

                      {usedReceipts}

                    </span>

                    <span className="ml-1 text-slate-500">

                      Used

                    </span>

                  </div>

                  <div className="text-center text-slate-400">

                    {totalReceipts} Receipts

                  </div>

                  <div>

                    <span className="font-semibold text-green-600">

                      {remainingReceipts}

                    </span>

                    <span className="ml-1 text-slate-500">

                      Remaining

                    </span>

                  </div>

                </div>

              </button>

            );

          })

        }

      </div>

      {/* Footer */}

      <div className="flex items-center justify-between border-t bg-slate-50 px-3 py-2">

        <button

          onClick={() =>
            setPage((p) =>
              Math.max(
                1,
                p - 1
              )
            )
          }

          disabled={page === 1}

          className="rounded border px-2 py-1 text-xs transition hover:bg-slate-100 disabled:opacity-40"

        >

          Previous

        </button>

        <span className="text-xs text-slate-600">

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

          className="rounded border px-2 py-1 text-xs transition hover:bg-slate-100 disabled:opacity-40"

        >

          Next

        </button>

      </div>

    </div>

  );

}