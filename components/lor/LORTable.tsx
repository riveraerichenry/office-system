"use client";

import {
  Search,
  Receipt,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";

type Props = {
  data: any[];
  loading: boolean;
  selected: any;

  search: string;
  yearFilter: string;
  officerFilter: string;

  years: number[];
  officers: any[];

  onSearch: (value: string) => void;
  onYearFilter: (value: string) => void;
  onOfficerFilter: (value: string) => void;

  onRefresh: () => void;
  onSelect: (item: any) => void;
};

export default function LORTable({
  data,
  loading,
  selected,

  search,
  yearFilter,
  officerFilter,

  years,
  officers,

  onSearch,
  onYearFilter,
  onOfficerFilter,

  onRefresh,
  onSelect,
}: Props) {
  /*
  |--------------------------------------------------------------------------
  | Pagination
  |--------------------------------------------------------------------------
  */

  const ROWS_PER_PAGE = 10;

  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(
    1,
    Math.ceil(data.length / ROWS_PER_PAGE)
  );

  const paginatedData = useMemo(() => {
    const startIndex =
      (currentPage - 1) * ROWS_PER_PAGE;

    const endIndex =
      startIndex + ROWS_PER_PAGE;

    return data.slice(
      startIndex,
      endIndex
    );
  }, [data, currentPage]);

  /*
  |--------------------------------------------------------------------------
  | Reset Pagination When Filters/Data Change
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    yearFilter,
    officerFilter,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Keep Current Page Valid
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [
    currentPage,
    totalPages,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Pagination Navigation
  |--------------------------------------------------------------------------
  */

  const goToPreviousPage = () => {
    setCurrentPage((page) =>
      Math.max(1, page - 1)
    );
  };

  const goToNextPage = () => {
    setCurrentPage((page) =>
      Math.min(
        totalPages,
        page + 1
      )
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Display Range
  |--------------------------------------------------------------------------
  */

  const startRecord =
    data.length === 0
      ? 0
      : (currentPage - 1) *
          ROWS_PER_PAGE +
        1;

  const endRecord =
    Math.min(
      currentPage * ROWS_PER_PAGE,
      data.length
    );

  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">

      {/* ============================================================
          HEADER
      ============================================================ */}

      <div className="flex items-center justify-between border-b bg-slate-50 p-4">

        <div>

          <h2 className="text-lg font-semibold text-slate-800">
            Released Booklets
          </h2>

          <p className="text-sm text-slate-500">
            Booklets released to accountable officers
          </p>

        </div>

        <button
          onClick={onRefresh}
          className="rounded-lg border bg-white px-4 py-2 text-sm hover:bg-slate-50"
        >
          Refresh
        </button>

      </div>

      {/* ============================================================
          FILTERS
      ============================================================ */}

      <div className="grid grid-cols-3 gap-3 border-b p-4">

        {/* Search */}

        <div className="relative">

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
            placeholder="Search LOR, RAT, RIS, Form or Booklet..."
            className="w-full rounded-lg border py-2 pl-10 pr-3"
          />

        </div>

        {/* Year */}

        <select
          value={yearFilter}
          onChange={(e) =>
            onYearFilter(
              e.target.value
            )
          }
          className="rounded-lg border px-3 py-2"
        >

          <option value="">
            All Years
          </option>

          {years.map((year) => (

            <option
              key={year}
              value={year}
            >
              {year}
            </option>

          ))}

        </select>

        {/* Officer */}

        <select
          value={officerFilter}
          onChange={(e) =>
            onOfficerFilter(
              e.target.value
            )
          }
          className="rounded-lg border px-3 py-2"
        >

          <option value="">
            All Accountable Officers
          </option>

          {officers.map(
            (officer) => (

              <option
                key={officer.id}
                value={officer.id}
              >
                {officer.full_name}
              </option>

            )
          )}

        </select>

      </div>

      {/* ============================================================
          TABLE
      ============================================================ */}

      <div className="max-h-[700px] overflow-auto">

        <table className="w-full">

          <thead className="sticky top-0 z-10 bg-slate-50">

            <tr>

              <th className="px-4 py-3 text-left">
                LOR
              </th>

              <th className="px-4 py-3 text-left">
                Booklet
              </th>

              <th className="px-4 py-3 text-left">
                Accountable Officer
              </th>

              <th className="px-4 py-3 text-left">
                Fund Source
              </th>

              <th className="px-4 py-3 text-center">
                Status
              </th>

            </tr>

          </thead>

          <tbody>

            {/* Loading */}

            {loading && (

              <tr>

                <td
                  colSpan={5}
                  className="py-10 text-center text-slate-500"
                >
                  Loading released booklets...
                </td>

              </tr>

            )}

            {/* Empty */}

            {!loading &&
              data.length === 0 && (

                <tr>

                  <td
                    colSpan={5}
                    className="py-10 text-center text-slate-500"
                  >
                    No released booklets found.
                  </td>

                </tr>

              )}

            {/* Data */}

            {!loading &&
              paginatedData.map(
                (item: any) => (

                  <tr
                    key={item.id}
                    onClick={() =>
                      onSelect(item)
                    }
                    className={`cursor-pointer border-t transition hover:bg-blue-50 ${
                      selected?.id === item.id
                        ? "bg-blue-100"
                        : ""
                    }`}
                  >

                    {/* ==================================================
                        LOR
                    ================================================== */}

                    <td className="px-4 py-4">

                      <div className="font-semibold text-blue-700">
                        {item.lor_no}
                      </div>

                      <div className="text-xs text-slate-500">

                        {item.released_at
                          ? new Date(
                              item.released_at
                            ).toLocaleString()
                          : "-"}

                      </div>

                    </td>

                    {/* ==================================================
                        BOOKLET
                    ================================================== */}

                    <td className="px-4 py-4">

                      <div className="flex items-start gap-2">

                        <Receipt
                          size={16}
                          className="mt-1 text-blue-600"
                        />

                        <div>

                          <div className="font-medium">
                            {item.form_code}
                          </div>

                          <div className="text-xs text-slate-500">
                            {item.control_no}
                          </div>

                          <div className="text-xs text-slate-500">
                            OR {item.beginning_or} -{" "}
                            {item.ending_or}
                          </div>

                        </div>

                      </div>

                    </td>

                    {/* ==================================================
                        OFFICER
                    ================================================== */}

                    <td className="px-4 py-4">

                      <div>
                        {item.accountable_officer}
                      </div>

                      <div className="text-xs text-slate-500">
                        {item.rat_no}
                      </div>

                    </td>

                    {/* ==================================================
                        FUND
                    ================================================== */}

                    <td className="px-4 py-4">

                      <div className="font-medium">
                        {item.fund_code}
                      </div>

                      <div className="text-xs text-slate-500">
                        {item.fund_name}
                      </div>

                    </td>

                    {/* ==================================================
                        STATUS
                    ================================================== */}

                    <td className="px-4 py-4 text-center">

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          item.status ===
                          "ISSUED"
                            ? "bg-amber-100 text-amber-700"
                            : item.status ===
                              "CONSUMED"
                            ? "bg-green-100 text-green-700"
                            : item.status ===
                              "CANCELLED"
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {item.status}
                      </span>

                    </td>

                  </tr>

                )
              )}

          </tbody>

        </table>

      </div>

      {/* ============================================================
          PAGINATION
      ============================================================ */}

      {!loading &&
        data.length > 0 && (

          <div className="flex items-center justify-between border-t bg-white px-4 py-3">

            {/* Record Count */}

            <div className="text-sm text-slate-500">

              Showing{" "}

              <span className="font-medium text-slate-700">
                {startRecord}
              </span>

              {" - "}

              <span className="font-medium text-slate-700">
                {endRecord}
              </span>

              {" of "}

              <span className="font-medium text-slate-700">
                {data.length}
              </span>

            </div>

            {/* Pagination Buttons */}

            <div className="flex items-center gap-2">

              {/* Previous */}

              <button
                type="button"
                onClick={
                  goToPreviousPage
                }
                disabled={
                  currentPage === 1
                }
                className="flex items-center gap-1 rounded-lg border px-3 py-2 text-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >

                <ChevronLeft
                  size={16}
                />

                Previous

              </button>

              {/* Page Numbers */}

              <div className="flex items-center gap-1">

                {Array.from(
                  {
                    length:
                      totalPages,
                  },
                  (_, index) =>
                    index + 1
                ).map(
                  (page) => (

                    <button
                      key={page}
                      type="button"
                      onClick={() =>
                        setCurrentPage(
                          page
                        )
                      }
                      className={`min-w-9 rounded-lg px-3 py-2 text-sm transition ${
                        currentPage ===
                        page
                          ? "bg-blue-600 text-white"
                          : "border hover:bg-slate-50"
                      }`}
                    >
                      {page}
                    </button>

                  )
                )}

              </div>

              {/* Next */}

              <button
                type="button"
                onClick={
                  goToNextPage
                }
                disabled={
                  currentPage ===
                  totalPages
                }
                className="flex items-center gap-1 rounded-lg border px-3 py-2 text-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >

                Next

                <ChevronRight
                  size={16}
                />

              </button>

            </div>

          </div>

        )}

    </div>
  );
}