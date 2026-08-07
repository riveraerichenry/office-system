"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  FileText,
  CheckCircle2,
} from "lucide-react";

type Props = {
  rows: any[];
  loading: boolean;

  search: string;
  onSearch: (value: string) => void;

  selected: any;
  onSelect: (row: any) => void;

  selectedRows: string[];
  onSelectionChange: (
    ids: string[]
  ) => void;

  onApproveSelected: () => void;
};

export default function PendingRequestTable({
  rows,
  loading,
  search,
  onSearch,
  selected,
  onSelect,
  selectedRows,
  onSelectionChange,
  onApproveSelected,
}: Props) {

  const [page, setPage] =
    useState(1);

  const ROWS_PER_PAGE = 10;

  useEffect(() => {
    setPage(1);
  }, [search]);

  const filtered = useMemo(() => {

    const keyword =
      search.toLowerCase();

    return rows.filter(
      (r) =>
        r.ris_no
          ?.toLowerCase()
          .includes(keyword) ||
        r.accountable_officer
          ?.toLowerCase()
          .includes(keyword)
    );

  }, [rows, search]);

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

  function toggleRow(id: string) {

    if (
      selectedRows.includes(id)
    ) {

      onSelectionChange(
        selectedRows.filter(
          (x) => x !== id
        )
      );

    } else {

      onSelectionChange([
        ...selectedRows,
        id,
      ]);

    }

  }

  function toggleAll() {

    if (
      paginated.length ===
      selectedRows.length
    ) {

      onSelectionChange([]);

    } else {

      onSelectionChange(
        paginated.map(
          (r) => r.id
        )
      );

    }

  }

  const allSelected =
    paginated.length > 0 &&
    paginated.every((r) =>
      selectedRows.includes(r.id)
    );

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

      {/* Header */}

      <div className="border-b bg-slate-50 p-4">

        <div className="flex items-center justify-between">

          <div>

            <h2 className="text-lg font-semibold text-slate-800">
              Pending RIS Requests
            </h2>

            <p className="text-sm text-slate-500">
              Requests awaiting approval
            </p>

          </div>

          <div className="flex items-center gap-3">

            {selectedRows.length >
              0 && (

              <button
                onClick={
                  onApproveSelected
                }
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
              >

                <CheckCircle2
                  size={18}
                />

                Approve Selected (
                {
                  selectedRows.length
                })

              </button>

            )}

            <span className="rounded-lg bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-700">

              {filtered.length}
              {" "}
              Pending

            </span>

          </div>

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
            placeholder="Search pending requests..."
            className="w-full rounded-lg border py-2 pl-10 pr-3 focus:border-blue-600 focus:outline-none"
          />

        </div>

      </div>

      {/* Table */}

      <div className="overflow-x-auto">

        <table className="w-full">

          <thead className="bg-slate-100">

            <tr className="text-left text-sm font-semibold text-slate-700">

              <th className="w-12 px-4 py-3">

                <input
                  type="checkbox"
                  checked={
                    allSelected
                  }
                  onChange={
                    toggleAll
                  }
                />

              </th>

              <th className="px-4 py-3">
                RIS Number
              </th>

              <th className="px-4 py-3">
                RIS Date
              </th>

              <th className="px-4 py-3">
                Accountable Officer
              </th>

              <th className="px-4 py-3 text-center">
                Total Qty
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

                    No Pending Requests

                  </div>
                </td>
              </tr>

            ) : (

              paginated.map((row) => (

                <tr
                  key={row.id}
                  onClick={() => onSelect(row)}
                  className={`cursor-pointer border-b transition ${
                    selected?.id === row.id
                      ? "bg-blue-50"
                      : "hover:bg-slate-50"
                  }`}
                >

                  <td
                    className="px-4 py-3"
                    onClick={(e) =>
                      e.stopPropagation()
                    }
                  >

                    <input
                      type="checkbox"
                      checked={selectedRows.includes(
                        row.id
                      )}
                      onChange={() =>
                        toggleRow(row.id)
                      }
                    />

                  </td>

                  <td className="px-4 py-3 font-semibold text-blue-700">
                    {row.ris_no}
                  </td>

                  <td className="px-4 py-3">
                    {row.request_date
                      ? new Date(
                          row.request_date
                        ).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )
                      : "-"}
                  </td>

                  <td className="px-4 py-3">
                    {row.accountable_officer}
                  </td>

                  <td className="px-4 py-3 text-center font-semibold">
                    {row.quantity}
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
              Math.min(
                totalPages,
                p + 1
              )
            )
          }
          disabled={
            page >= totalPages
          }
          className="rounded border px-3 py-1 disabled:opacity-40"
        >
          Next
        </button>

      </div>

    </div>
  );
}