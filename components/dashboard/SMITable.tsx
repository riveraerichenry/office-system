"use client";

import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

const PAGE_SIZE = 12;

type Props = {
  data: any[];
  selected: any;
  onSelect: (row: any) => void;
  loading: boolean;
  onAdd: () => void;

  years: any[];
  forms: any[];
  selectedYear: number | null;
  selectedForm: string | null;
  onYearChange: (
    year: number
  ) => void;
  onFormChange: (
    formId: string
  ) => void;
};

export default function SMITable({
  data,
  selected,
  onSelect,
  loading,
  onAdd,
  years = [],
  forms = [],
  selectedYear,
  selectedForm,
  onYearChange,
  onFormChange,
}: Props) {
  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(1);



  const filtered =
    data.filter(
      (row) =>
        row.reference_no
          ?.toString()
          .toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        row.series
          ?.toString()
          .toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        row.status
          ?.toString()
          .toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        row.beginning_or
          ?.toString()
          .includes(search) ||
        row.ending_or
          ?.toString()
          .includes(search)
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
      case "ISS":
        return "bg-blue-100 text-blue-700";
      case "CON":
        return "bg-gray-100 text-gray-700";
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
            Inventory
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage accountable form inventory
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
            hover:scale-105 transition
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
            placeholder="Search booklet..."
            className="
              w-full bg-transparent
              outline-none
              placeholder:text-gray-400
            "
          />
        </div>

        {/* Fiscal Year */}
        <select
          value={
            selectedYear || ""
          }
          onChange={(e) =>
            onYearChange(
              Number(
                e.target.value
              )
            )
          }
          className="
            h-[52px]
            min-w-[150px]
            rounded-full
            border border-gray-200
            bg-white px-5
            shadow-sm
            outline-none
            font-medium
          "
        >
          <option value="">
            Fiscal Year
          </option>

          {years.map(
            (year) => (
              <option
                key={
                  year.fiscal_year
                }
                value={
                  year.fiscal_year
                }
              >
                {
                  year.fiscal_year
                }
              </option>
            )
          )}
        </select>

        {/* AF */}
        <select
          value={
            selectedForm || ""
          }
          onChange={(e) =>
            onFormChange(
              e.target.value
            )
          }
          className="
            h-[52px]
            min-w-[170px]
            rounded-full
            border border-gray-200
            bg-white px-5
            shadow-sm
            outline-none
            font-medium
          "
        >
          <option value="">
            All AF
          </option>

          {forms.map(
            (form) => (
              <option
                key={form.id}
                value={form.id}
              >
                {form.af_code}
              </option>
            )
          )}
        </select>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-14 px-4 pb-4 text-xs font-bold uppercase tracking-wider text-gray-400">
        <div className="col-span-2">
          Ref No
        </div>

        <div className="col-span-2">
          Series
        </div>

        <div className="col-span-3">
          Begin OR
        </div>

        <div className="col-span-3">
          End OR
        </div>

        <div className="col-span-2">
          Qty
        </div>

        <div className="col-span-2">
          Status
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
                    {
                      row.reference_no
                    }
                  </div>

                  <div className="col-span-2">
                    {
                      row.series
                    }
                  </div>

                  <div className="col-span-3">
                    {
                      row.beginning_or
                    }
                  </div>

                  <div className="col-span-3">
                    {
                      row.ending_or
                    }
                  </div>

                  <div className="col-span-2">
                    {
                      row.no_of_receipts
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
                </div>
              </button>
            )
          )}

        {!loading &&
          filtered.length ===
            0 && (
            <div className="py-10 text-center text-gray-400">
              No inventory found
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
            <ChevronLeft
              size={16}
            />
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
            <ChevronRight
              size={16}
            />
          </button>
        </div>
      )}
    </div>
  );
}