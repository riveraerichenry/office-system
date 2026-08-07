"use client";

import { useMemo, useState } from "react";
import { History, Search, ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  history: any[];
};

export default function BookletHistoryCard({ history }: Props) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const rowsPerPage = 10;

  const filtered = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) return history;

    return history.filter((row) =>
      [
        row.control_no,
        row.form_code,
        row.action,
        row.performed_by_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [history, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / rowsPerPage)
  );

  const paginated = filtered.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <div className="rounded-2xl border bg-white shadow-sm">

      {/* Header */}

      <div className="border-b p-5">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-2">

            <History
              size={20}
              className="text-blue-600"
            />

            <div>

              <h2 className="text-lg font-semibold text-slate-800">
                Registration History
              </h2>

              <p className="text-sm text-slate-500">
                Latest booklet activities
              </p>

            </div>

          </div>

          {/* Search */}

          <div className="relative w-72">

            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none"
            />

          </div>

        </div>

      </div>

      {/* Table */}

      <div className="overflow-x-auto">

        <table className="w-full">

          <thead className="sticky top-0 bg-slate-50">

            <tr className="border-b text-left text-sm font-semibold text-slate-600">

              <th className="px-4 py-3">
                Control No.
              </th>

              <th className="px-4 py-3">
                Form
              </th>

              <th className="px-4 py-3">
                Activity
              </th>

              <th className="px-4 py-3">
                Performed By
              </th>

            </tr>

          </thead>

          <tbody>

            {paginated.length === 0 ? (

              <tr>

                <td
                  colSpan={4}
                  className="py-10 text-center text-gray-500"
                >
                  No history found.
                </td>

              </tr>

            ) : (

              paginated.map((row: any) => (

                <tr
                  key={row.id}
                  className="border-b hover:bg-blue-50"
                >

                  <td className="px-4 py-3 font-medium whitespace-nowrap">
                    {row.control_no}
                  </td>

                  <td className="px-4 py-3">
                    {row.form_code}
                  </td>

                  <td className="px-4 py-3">

                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        row.action === "REGISTERED"
                          ? "bg-green-100 text-green-700"
                          : row.action === "UPDATED"
                          ? "bg-blue-100 text-blue-700"
                          : row.action === "ISSUED"
                          ? "bg-orange-100 text-orange-700"
                          : row.action === "LIQUIDATED"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {row.action}
                    </span>

                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    {row.performed_by_name}
                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

      {/* Footer */}

      <div className="flex items-center justify-between border-t px-5 py-3">

        <span className="text-sm text-gray-500">
          Showing{" "}
          {filtered.length === 0
            ? 0
            : (page - 1) * rowsPerPage + 1}
          {" - "}
          {Math.min(page * rowsPerPage, filtered.length)}
          {" of "}
          {filtered.length}
        </span>

        <div className="flex items-center gap-2">

          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
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
  );
}