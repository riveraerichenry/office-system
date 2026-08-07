"use client";

import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { formatDate } from "@/lib/format";

const PAGE_SIZE = 12;

const MONTHS = [
  { label: "All Months", value: "" },
  { label: "January", value: "1" },
  { label: "February", value: "2" },
  { label: "March", value: "3" },
  { label: "April", value: "4" },
  { label: "May", value: "5" },
  { label: "June", value: "6" },
  { label: "July", value: "7" },
  { label: "August", value: "8" },
  { label: "September", value: "9" },
  { label: "October", value: "10" },
  { label: "November", value: "11" },
  { label: "December", value: "12" },
];

type Props = {
  data: any[];
  selected: any;
  loading: boolean;

  years: any[];

  selectedYear: number | null;
  selectedMonth: string;

  view: "my" | "all";

  onYearChange: (
    year: number
  ) => void;

  onMonthChange: (
    month: string
  ) => void;

  onViewChange: (
    view: "my" | "all"
  ) => void;

  onSelect: (
    row: any
  ) => void;

  onAdd: () => void;
};

export default function RISTable({
  data,
  selected,
  loading,

  years,

  selectedYear,
  selectedMonth,

  view,
  onViewChange,

  onYearChange,
  onMonthChange,

  onSelect,
  onAdd,
}: Props) {
  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(1);

  const filtered =
    data.filter(
      (row) =>
        row.ris_no
          ?.toLowerCase()
          ?.includes(
            search.toLowerCase()
          ) ||
        row.officer_name
          ?.toLowerCase()
          ?.includes(
            search.toLowerCase()
          ) ||
        row.status
          ?.toLowerCase()
          ?.includes(
            search.toLowerCase()
          )
    );

  const totalPages =
    Math.ceil(
      filtered.length /
        PAGE_SIZE
    ) || 1;

  const paginated =
    filtered.slice(
      (page - 1) *
        PAGE_SIZE,
      page * PAGE_SIZE
    );

  function statusClass(
    status: string
  ) {
    switch (status) {
      case "ACT":
        return "bg-green-100 text-green-700";

      case "APP":
        return "bg-yellow-100 text-yellow-700";

      case "ISS":
        return "bg-blue-100 text-blue-700";

      case "CAN":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  return (
    <div className="rounded-[40px] bg-white px-6 py-7 shadow-xl">
      {/* Header */}
      <div className="mb-7 flex items-center justify-between">
        <div>
          <h1
            className="text-3xl font-extrabold"
            style={{
              textShadow:
                "2px 2px 0 rgba(0,0,0,0.15)",
            }}
          >
            RIS
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Requisition &
            Issuance Slip
          </p>
        </div>

        <button
          onClick={onAdd}
          className="
            flex h-14 w-14 items-center justify-center
            rounded-full
            bg-gradient-to-r
            from-cyan-400
            via-purple-400
            to-fuchsia-500
            text-white shadow-lg
          "
        >
          <Plus size={22} />
        </button>
      </div>

      {/* Search + Filters */}
<div className="mb-7 flex items-center gap-3">
  {/* Search */}
  <div
    className="
      flex flex-1 items-center gap-3
      rounded-full border border-gray-200
      bg-[#fafafa]
      px-5 py-3 shadow-sm
    "
  >
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
      placeholder="Search RIS..."
      className="w-full bg-transparent outline-none"
    />
  </div>

  {/* Fiscal Year */}
  <select
    value={selectedYear || ""}
    onChange={(e) =>
      onYearChange(
        Number(e.target.value)
      )
    }
    className="
      h-[52px]
      min-w-[140px]
      rounded-full
      border border-gray-200
      bg-white
      px-5
      shadow-sm
      font-medium
      outline-none
      hover:border-cyan-400
      transition
    "
  >
    <option value="">
      Fiscal Year
    </option>

    {years.map((year) => (
      <option
        key={year.fiscal_year}
        value={year.fiscal_year}
      >
        {year.fiscal_year}
      </option>
    ))}
  </select>

  {/* Month */}
  <select
    value={selectedMonth}
    onChange={(e) =>
      onMonthChange(
        e.target.value
      )
    }
    className="
      h-[52px]
      min-w-[170px]
      rounded-full
      border border-gray-200
      bg-white
      px-5
      shadow-sm
      font-medium
      outline-none
      hover:border-cyan-400
      transition
    "
  >
    {MONTHS.map((month) => (
      <option
        key={month.value}
        value={month.value}
      >
        {month.label}
      </option>
    ))}
  </select>

  {/* View */}
  <select
    value={view}
    onChange={(e) =>
      onViewChange(
        e.target.value as
          "my" | "all"
      )
    }
    className="
      h-[52px]
      min-w-[170px]
      rounded-full
      border border-gray-200
      bg-white
      px-5
      shadow-sm
      font-medium
      outline-none
      hover:border-cyan-400
      transition
    "
  >
    <option value="my">
      My Requests
    </option>

    <option value="all">
      All Requests
    </option>
  </select>
</div>

      {/* Table Header */}
      <div className="grid grid-cols-14 px-4 pb-4 text-xs font-bold uppercase tracking-wider text-gray-400">
        <div className="col-span-2">
          RIS No
        </div>

        <div className="col-span-2">
          Date
        </div>

        <div className="col-span-5">
          Officer
        </div>

        <div className="col-span-2">
          Status
        </div>

        <div className="col-span-3">
          Qty
        </div>
      </div>

      {/* Rows */}
      <div className="min-h-[580px] space-y-3">
        {loading && (
          <div className="py-10 text-center text-gray-400">
            Loading...
          </div>
        )}

        {!loading &&
          paginated.map(
            (row) => (
              <button
                key={row.id}
                onClick={() =>
                  onSelect(row)
                }
                className={`w-full rounded-[24px] px-4 py-5 text-left transition-all ${
                  selected?.id ===
                  row.id
                    ? `
                    bg-gradient-to-r
                    from-cyan-400
                    via-purple-400
                    to-fuchsia-500
                    text-white shadow-lg
                  `
                    : `
                    bg-[#f8f8f8]
                    hover:bg-gray-100
                  `
                }`}
              >
                <div className="grid grid-cols-14 items-center">
                  <div className="col-span-2 font-bold">
                    {row.ris_no}
                  </div>

                  <div className="col-span-2">
                    {formatDate(
                      row.ris_date
                    )}
                  </div>

                  <div className="col-span-5 truncate">
                    {
                      row.officer_name
                    }
                  </div>

                  <div className="col-span-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(
                        row.status
                      )}`}
                    >
                      {
                        row.status
                      }
                    </span>
                  </div>

                  <div className="col-span-3 font-semibold">
                    {
                      row.total_quantity
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
              No RIS found
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
            className="rounded-full bg-gray-100 px-4 py-2 disabled:opacity-40"
          >
            <ChevronLeft size={16} />
          </button>

          <span className="text-sm font-medium">
            Page {page} of{" "}
            {totalPages}
          </span>

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
            className="rounded-full bg-gray-100 px-4 py-2 disabled:opacity-40"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}