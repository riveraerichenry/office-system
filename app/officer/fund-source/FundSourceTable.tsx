"use client";

import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

export default function FundSourceTable({
  data,
  selected,
  onSelect,
  loading,
  onAdd,
}: {
  data: any[];
  selected: any;
  onSelect: (row: any) => void;
  loading: boolean;
  onAdd: () => void;
}) {
  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(1);

  const ITEMS_PER_PAGE = 10;

  const filtered = data.filter(
    (item) =>
      item.fund_code
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        ) ||
      item.fund_name
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        ) ||
      item.acronym
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )
  );

  const totalPages =
    Math.ceil(
      filtered.length /
        ITEMS_PER_PAGE
    ) || 1;

  const paginatedData =
    filtered.slice(
      (page - 1) *
        ITEMS_PER_PAGE,
      page *
        ITEMS_PER_PAGE
    );

  return (
    <div className="rounded-[40px] bg-white shadow-xl px-6 py-7">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h1
          className="text-4xl font-extrabold"
          style={{
            textShadow:
              "2px 2px 0 rgba(0,0,0,0.15)",
          }}
        >
          Funds
        </h1>

        <button
          onClick={onAdd}
          className="
            flex h-12 w-12
            items-center justify-center
            rounded-full
            bg-gradient-to-r
            from-cyan-400
            via-purple-400
            to-fuchsia-500
            text-white shadow-lg
            hover:scale-105
            transition-all
          "
        >
          <Plus size={22} />
        </button>
      </div>

      {/* Search */}
      <div className="mb-7">
        <div className="flex items-center gap-3 border-b border-gray-300 pb-3">
          <Search
            size={18}
            className="text-gray-400"
          />

          <input
            value={search}
            onChange={(e) => {
              setSearch(
                e.target.value
              );
              setPage(1);
            }}
            placeholder="Search fund source"
            className="w-full outline-none placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 px-4 pb-4 text-xs font-bold uppercase tracking-wider text-gray-400">
        <div className="col-span-3">
          Code
        </div>

        <div className="col-span-3">
          Acronym
        </div>

        <div className="col-span-6">
          Fund Name
        </div>
      </div>

      {/* Rows */}
      <div className="min-h-[560px] space-y-3 pr-2">
        {loading && (
          <div className="py-10 text-center text-gray-400">
            Loading...
          </div>
        )}

        {!loading &&
          paginatedData.map(
            (row) => (
              <button
                key={row.id}
                onClick={() =>
                  onSelect(row)
                }
                className={`
                w-full rounded-[28px]
                px-4 py-5 text-left
                transition-all duration-300
                hover:scale-[1.01]
                ${
                  selected?.id ===
                  row.id
                    ? `
                      bg-gradient-to-r
                      from-cyan-400
                      via-purple-400
                      to-fuchsia-500
                      text-white
                      shadow-lg
                    `
                    : `
                      bg-[#f8f8f8]
                      hover:bg-gray-100
                    `
                }
              `}
              >
                <div className="grid grid-cols-12 items-center">
                  <div className="col-span-3 font-bold">
                    {
                      row.fund_code
                    }
                  </div>

                  <div className="col-span-3 font-medium">
                    {row.acronym ||
                      "-"}
                  </div>

                  <div className="col-span-6 truncate">
                    {
                      row.fund_name
                    }
                  </div>
                </div>
              </button>
            )
          )}

        {!loading &&
          filtered.length ===
            0 && (
            <div className="py-10 text-center text-gray-400">
              No fund source found
            </div>
          )}
      </div>

      {/* Pagination */}
      {filtered.length >
        0 && (
        <div className="mt-6 flex items-center justify-between">
          <button
            disabled={
              page === 1
            }
            onClick={() =>
              setPage(
                page - 1
              )
            }
            className="
              flex items-center gap-2
              rounded-full px-4 py-2
              bg-gray-100
              disabled:opacity-40
            "
          >
            <ChevronLeft
              size={16}
            />
            Prev
          </button>

          <div className="flex gap-2">
            {Array.from(
              {
                length:
                  totalPages,
              },
              (_, i) =>
                i + 1
            ).map(
              (
                pageNum
              ) => (
                <button
                  key={
                    pageNum
                  }
                  onClick={() =>
                    setPage(
                      pageNum
                    )
                  }
                  className={`
                    h-10 w-10 rounded-full
                    font-semibold transition
                    ${
                      page ===
                      pageNum
                        ? `
                          bg-gradient-to-r
                          from-cyan-400
                          via-purple-400
                          to-fuchsia-500
                          text-white shadow-lg
                        `
                        : `
                          bg-gray-100
                          hover:bg-gray-200
                        `
                    }
                  `}
                >
                  {
                    pageNum
                  }
                </button>
              )
            )}
          </div>

          <button
            disabled={
              page ===
              totalPages
            }
            onClick={() =>
              setPage(
                page + 1
              )
            }
            className="
              flex items-center gap-2
              rounded-full px-4 py-2
              bg-gray-100
              disabled:opacity-40
            "
          >
            Next
            <ChevronRight
              size={16}
            />
          </button>
        </div>
      )}
    </div>
  );
}