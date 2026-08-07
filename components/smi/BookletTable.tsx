"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type Props = {
  data: any[];
  loading: boolean;
  selected: any;

  search: string;
  statusFilter: string;
  yearFilter: string;
  formFilter: string;

  forms: any[];

  onSearch: (value: string) => void;
  onStatusFilter: (value: string) => void;
  onYearFilter: (value: string) => void;
  onFormFilter: (value: string) => void;

  onSelect: (booklet: any) => void;
  onAdd: () => void;
};

export default function BookletTable({
  data,
  loading,
  selected,

  search,
  statusFilter,
  yearFilter,
  formFilter,

  forms,

  onSearch,
  onStatusFilter,
  onYearFilter,
  onFormFilter,

  onSelect,
  onAdd,
}: Props) {


  const rowsPerPage = 10;

const [page, setPage] = useState(1);

useEffect(() => {
  setPage(1);
}, [data]);

const totalPages = Math.max(
  1,
  Math.ceil(data.length / rowsPerPage)
);

const paginatedData = data.slice(
  (page - 1) * rowsPerPage,
  page * rowsPerPage
);
  const years = [
    ...new Set(
      data.map((x) => x.fiscal_year)
    ),
  ].sort();

  return (
    <div className="rounded-2xl border bg-white shadow-sm">

      {/* Header */}

      <div className="flex items-center justify-between border-b p-5">

        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Accountable Forms Stock Monitoring and Inventory (SMI)
          </h2>

          <p className="text-sm text-slate-500">
            Registered Accountable Form Booklets
          </p>
        </div>

        <button
          onClick={onAdd}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          Register
        </button>

      </div>

      {/* Filters */}

      <div className="space-y-3 border-b p-4">

        {/* Search */}

        <div className="relative">

          <Search
            size={18}
            className="absolute left-3 top-3 text-gray-400"
          />

          <input
            value={search}
            onChange={(e) =>
              onSearch(e.target.value)
            }
            placeholder="Search..."
            className="w-full rounded-xl border py-2 pl-10 pr-4 outline-none focus:border-blue-500"
          />

        </div>

        {/* Dropdown Filters */}

        <div className="grid grid-cols-3 gap-3">

          {/* Status */}

          <select
            value={statusFilter}
            onChange={(e) =>
              onStatusFilter(
                e.target.value
              )
            }
            className="rounded-lg border p-2"
          >
            <option value="">
              All Status
            </option>

            <option value="AVAILABLE">
              Available
            </option>

            <option value="ISSUED">
              Issued
            </option>

            <option value="LIQUIDATED">
              Liquidated
            </option>

          </select>

          {/* Fiscal Year */}

          <select
            value={yearFilter}
            onChange={(e) =>
              onYearFilter(
                e.target.value
              )
            }
            className="rounded-lg border p-2"
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

          {/* Accountable Form */}

          <select
            value={formFilter}
            onChange={(e) =>
              onFormFilter(
                e.target.value
              )
            }
            className="rounded-lg border p-2"
          >
            <option value="">
              All Forms
            </option>

            {forms.map((form) => (
              <option
                key={form.id}
                value={form.id}
              >
                {form.form_code}
              </option>
            ))}

          </select>

        </div>

      </div>

      {/* Table */}

      <div className="overflow-x-auto">

        {loading ? (

          <div className="p-8 text-center text-gray-500">
            Loading...
          </div>

        ) : data.length === 0 ? (

          <div className="p-8 text-center text-gray-500">
            No booklets found.
          </div>

        ) : (

          <table className="w-full">

            <thead className="sticky top-0 bg-gray-50">

              <tr className="text-left text-sm text-slate-600">

                <th className="px-4 py-3">
                  Control No
                </th>

                <th className="px-4 py-3">
                  Form
                </th>

                <th className="px-4 py-3">
                  Series
                </th>

                <th className="px-4 py-3">
                  Status
                </th>

              </tr>

            </thead>

            <tbody>

              {paginatedData.map((row) => (

                <tr
                  key={row.id}
                  onClick={() =>
                    onSelect(row)
                  }
                  className={`cursor-pointer border-t transition hover:bg-blue-50 ${
                    selected?.id ===
                    row.id
                      ? "bg-blue-50"
                      : ""
                  }`}
                >

                  <td className="px-4 py-3 font-medium">
                    {row.control_no}
                  </td>

                  <td className="px-4 py-3">
                    {row.form_code}
                  </td>

                  <td className="px-4 py-3">
                    {row.series}
                  </td>

                  <td className="px-4 py-3">

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        row.status ===
                        "AVAILABLE"
                          ? "bg-green-100 text-green-700"
                          : row.status ===
                            "ISSUED"
                          ? "bg-orange-100 text-orange-700"
                          : row.status ===
                            "LIQUIDATED"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {row.status}
                    </span>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

          

        )}
        <div className="flex items-center justify-between border-t px-5 py-3">

  <span className="text-sm text-gray-500">
    Showing{" "}
    {data.length === 0
      ? 0
      : (page - 1) * rowsPerPage + 1}
    {" - "}
    {Math.min(page * rowsPerPage, data.length)}
    {" of "}
    {data.length}
  </span>

  <div className="flex items-center gap-2">

    <button
      onClick={() =>
        setPage((p) => Math.max(1, p - 1))
      }
      disabled={page === 1}
      className="rounded-lg border p-2 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <ChevronLeft size={16} />
    </button>

    <span className="text-sm font-medium">
      {page} / {totalPages}
    </span>

    <button
      onClick={() =>
        setPage((p) => Math.min(totalPages, p + 1))
      }
      disabled={page === totalPages}
      className="rounded-lg border p-2 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <ChevronRight size={16} />
    </button>

  </div>

</div>

      </div>

    </div>
  );
}