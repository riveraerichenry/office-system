"use client";


import { Search, FileText, Plus } from "lucide-react";

type Props = {
  data: any[];
  loading: boolean;

  search: string;
  page: number;
  totalPages: number;

  onSearch: React.Dispatch<React.SetStateAction<string>>;
  onPageChange: (page: number) => void;

  onSelect: (row: any) => void;
  onRequest: () => void;
};

export default function RISTable({
  data,
  loading,
  search,
  page,
  totalPages,
  onSearch,
  onPageChange,
  onSelect,
  onRequest,
}: Props) {
  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

      <div className="border-b bg-slate-50 p-4">
        <div className="flex items-center justify-between">

          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              RIS Requests
            </h2>

            <p className="text-sm text-slate-500">
              Manage accountable form requests.
            </p>
          </div>

          <div className="flex items-center gap-3">

            <span className="rounded-lg bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700">
              {data.length} Record(s)
            </span>

            <button
              onClick={onRequest}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              <Plus size={18} />
              Request Booklet
            </button>

          </div>

        </div>
        <div className="relative mt-4">
          <Search
            size={18}
            className="absolute left-3 top-3 text-slate-400"
          />

          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search RIS..."
            className="w-full rounded-lg border py-2 pl-10 pr-3 focus:border-blue-600 focus:outline-none"
          />
        </div>
      </div>

      <div className="overflow-auto">
        <table className="w-full">

          <thead className="bg-slate-100">
            <tr className="text-left text-sm font-semibold text-slate-700">
              <th className="px-4 py-3">RIS No</th>
              <th className="px-4 py-3">RIS Date</th>
              <th className="px-4 py-3">Accountable Officer</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-center">Qty</th>
            </tr>
          </thead>

          <tbody>

            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-10 text-center text-slate-500"
                >
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-10 text-center text-slate-500"
                >
                  <div className="flex flex-col items-center gap-3">
                    <FileText size={40} />
                    No RIS Requests Found.
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onSelect(row)}
                  className="cursor-pointer border-b transition hover:bg-blue-50"
                >
                  <td className="px-4 py-3 font-medium">
                    {row.ris_no}
                  </td>

                  <td className="px-4 py-3">
                    {new Date(row.request_date).toLocaleDateString()}
                  </td>

                  <td className="px-4 py-3">
                    {row.accountable_officer}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold
                        ${
                          row.status === "APPROVED"
                            ? "bg-green-100 text-green-700"
                            : row.status === "ISSUED"
                            ? "bg-blue-100 text-blue-700"
                            : row.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-700"
                            : row.status === "REJECTED"
                            ? "bg-red-100 text-red-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                    >
                      {row.status}
                    </span>
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

      <div className="flex items-center justify-between border-t bg-slate-50 px-4 py-3">

        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="rounded border px-3 py-1 disabled:opacity-40"
        >
          Previous
        </button>

        <span className="text-sm">
          Page {page} of {Math.max(totalPages, 1)}
        </span>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="rounded border px-3 py-1 disabled:opacity-40"
        >
          Next
        </button>

      </div>

    </div>
  );
}