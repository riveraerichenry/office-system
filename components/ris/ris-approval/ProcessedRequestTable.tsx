"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, FileText } from "lucide-react";

type Props = {
  rows: any[];
  loading: boolean;

  search: string;
  onSearch: (value: string) => void;

  selected: any;
  onSelect: (row: any) => void;
};

export default function ProcessedRequestTable({
  rows,
  loading,
  search,
  onSearch,
  selected,
  onSelect,
}: Props) {
  const [page, setPage] = useState(1);

  const ROWS_PER_PAGE = 10;

  useEffect(() => {
    setPage(1);
  }, [search]);

  const filtered = useMemo(() => {
    const keyword = search.toLowerCase();

    return rows
      .filter(
        (r) =>
          r.ris_no?.toLowerCase().includes(keyword) ||
          r.accountable_officer
            ?.toLowerCase()
            .includes(keyword)
      )
      .sort((a, b) => {
        if (a.status === b.status) {
          return (
            new Date(b.approved_date ?? 0).getTime() -
            new Date(a.approved_date ?? 0).getTime()
          );
        }

        if (a.status === "Approved") return -1;
        if (b.status === "Approved") return 1;

        return 0;
      });
  }, [rows, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / ROWS_PER_PAGE)
  );

  const paginated = filtered.slice(
    (page - 1) * ROWS_PER_PAGE,
    page * ROWS_PER_PAGE
  );

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

      {/* Header */}

      <div className="border-b bg-slate-50 p-4">

        <div className="flex items-center justify-between">

          <div>

            <h2 className="text-lg font-semibold text-slate-800">
              Approved / Issued Requests
            </h2>

            <p className="text-sm text-slate-500">
              Completed RIS requests
            </p>

          </div>

          <span className="rounded-lg bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
            {filtered.length} Record(s)
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
              onSearch(e.target.value)
            }
            placeholder="Search processed requests..."
            className="w-full rounded-lg border py-2 pl-10 pr-3 focus:border-blue-600 focus:outline-none"
          />

        </div>

      </div>

      {/* Table */}

      <div className="overflow-x-auto">

        <table className="w-full">

          <thead className="bg-slate-100">

            <tr className="text-left text-sm font-semibold text-slate-700">

              <th className="px-4 py-3">
                RIS Number
              </th>

              <th className="px-4 py-3">
                Approved Date
              </th>

              <th className="px-4 py-3">
                Accountable Officer
              </th>

              <th className="px-4 py-3 text-center">
                Qty
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
                  colSpan={5}
                  className="p-10 text-center text-slate-500"
                >
                  Loading...
                </td>
              </tr>

            ) : paginated.length === 0 ? (

              <tr>
                <td
                  colSpan={5}
                  className="p-10 text-center text-slate-500"
                >
                  <div className="flex flex-col items-center gap-3">

                    <FileText size={42} />

                    No Processed Requests

                  </div>
                </td>
              </tr>

            ) : (

              paginated.map((row) => (

                <tr
                  key={row.id}
                  onClick={() =>
                    onSelect(row)
                  }
                  className={`cursor-pointer border-b transition ${
                    selected?.id === row.id
                      ? "bg-blue-50"
                      : "hover:bg-slate-50"
                  }`}
                >

                  <td className="px-4 py-3 font-semibold text-blue-700">
                    {row.ris_no}
                  </td>

                  <td className="px-4 py-3">
                    {row.approved_date
                      ? new Date(
                          row.approved_date
                        ).toLocaleDateString()
                      : "-"}
                  </td>

                  <td className="px-4 py-3">
                    {row.accountable_officer}
                  </td>

                  <td className="px-4 py-3 text-center font-semibold">
                    {row.quantity}
                  </td>

                  <td className="px-4 py-3 text-center">

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        row.status === "Approved"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {row.status}
                    </span>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

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
          className="rounded border px-3 py-1 disabled:opacity-40"
        >
          Previous
        </button>

        <span className="text-sm">
          Page {page} of {totalPages}
        </span>

        <button
          onClick={() =>
            setPage((p) =>
              Math.min(totalPages, p + 1)
            )
          }
          disabled={page >= totalPages}
          className="rounded border px-3 py-1 disabled:opacity-40"
        >
          Next
        </button>

      </div>

    </div>
  );
}