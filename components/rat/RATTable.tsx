"use client";

import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";



type Props = {
  data: any[];
  loading: boolean;
  selected: any;
  fiscalYears: any[];

  search: string;
  onSearch: (value: string) => void;

  month: string;
  onMonthChange: (value: string) => void;

  fiscalYear: string;
  onFiscalYearChange: (value: string) => void;

  status: string;
  onStatusChange: (value: string) => void;

  onSelect: (row: any) => void;
};

export default function RATTable({
  data,
  loading,
  selected,

  fiscalYears,

  search,
  onSearch,

  month,
  onMonthChange,

  fiscalYear,
  onFiscalYearChange,

  status,
  onStatusChange,

  onSelect,
}: Props) {

  const [page, setPage] =
    useState(1);

  const ROWS_PER_PAGE = 10;


 useEffect(() => {

  setPage(1);

}, [
  search,
  month,
  fiscalYear,
  status,
]);

  const filtered = useMemo(() => {

  const keyword =
    search.toLowerCase();

  return data.filter((r) =>

    r.rat_no
      ?.toLowerCase()
      .includes(keyword)

    ||

    r.ris_no
      ?.toLowerCase()
      .includes(keyword)

    ||

    r.accountable_officer
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
              Requisition and Accountability Tracking
            </h2>

            <p className="text-sm text-slate-500">
              Generated RAT records
            </p>

          </div>

          <span className="rounded-lg bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
            {filtered.length}
          </span>

        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">

          {/* Search */}

          <div className="relative min-w-[260px] flex-1">

            <Search
              size={18}
              className="absolute left-3 top-3 text-slate-400"
            />

            <input
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search RAT, RIS, Officer..."
              className="w-full rounded-lg border py-2 pl-10 pr-3 focus:border-blue-600 focus:outline-none"
            />

            </div>

          </div>

          {/* Month */}

          <select
            value={month}
            onChange={(e) =>
              onMonthChange(e.target.value)
            }
            className="rounded-lg border px-3 py-2 text-sm"
          >
            <option value="">All Months</option>

            {[
              "January","February","March","April",
              "May","June","July","August",
              "September","October","November","December",
            ].map((m, i) => (
              <option
                key={i + 1}
                value={i + 1}
              >
                {m}
              </option>
            ))}

          </select>

          {/* Fiscal Year */}

          <select
            value={fiscalYear}
            onChange={(e) => onFiscalYearChange(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            <option value="">Fiscal Year</option>

            {fiscalYears.map((year: any) => (
              <option
                key={year.fiscal_year}
                value={year.fiscal_year}
              >
                {year.fiscal_year}
              </option>
            ))}
          </select>

          {/* Status */}

          <select
            value={status}
            onChange={(e) =>
              onStatusChange(e.target.value)
            }
            className="rounded-lg border px-3 py-2 text-sm"
          >
            <option value="">All Status</option>
            <option value="GENERATED">Generated</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

        </div>

      {/* Body */}

      <div
        className={`overflow-y-auto ${
          data.length > 10
            ? "max-h-[650px]"
            : ""
        }`}
      >

        {loading ? (

            <div className="flex h-[650px] items-center justify-center text-slate-500">

                Loading RAT records...

            </div>

        ) : data.length === 0 ? (

            <div className="flex items-center justify-center px-6 py-12">

              <div className="text-center">

                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">

                      📋

                  </div>

                  <h3 className="text-lg font-semibold text-slate-700">

                      No RAT Records Found

                  </h3>

                  <p className="mt-2 text-sm text-slate-500">

                      There are no Registered Accountable Forms Transactions matching the selected filters.

                  </p>

              </div>

          </div>

        ) : (

            <table className="w-full">

                <thead className="sticky top-0 bg-slate-100">

                    <tr className="text-left text-sm font-semibold text-slate-700">

                        <th className="px-4 py-3">
                            RAT No.
                        </th>

                        <th className="px-4 py-3">
                            RIS No.
                        </th>

                        <th className="px-4 py-3">
                            Accountable Officer
                        </th>

                        <th className="px-4 py-3">
                            Generated
                        </th>

                        <th className="px-4 py-3 text-center">
                            Status
                        </th>

                    </tr>

                </thead>

                <tbody>

                  {paginated.map((row) => (

                        <tr
                            key={row.id}
                            onClick={() => onSelect(row)}
                            className={`cursor-pointer border-b transition hover:bg-slate-50 ${
                                selected?.id === row.id
                                    ? "bg-blue-50"
                                    : ""
                            }`}
                        >

                            <td className="px-4 py-3 font-semibold text-blue-700">

                                {row.rat_no}

                            </td>

                            <td className="px-4 py-3">

                                {row.ris_no}

                            </td>

                            <td className="px-4 py-3">

                                {row.accountable_officer}

                            </td>

                            <td className="px-4 py-3">

                                {row.generated_at
                                    ? new Date(
                                          row.generated_at
                                      ).toLocaleDateString()
                                    : "-"}

                            </td>

                            <td className="px-4 py-3 text-center">

                                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">

                                    {row.status}

                                </span>

                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

        )}

    </div>
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