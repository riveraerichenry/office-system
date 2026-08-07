"use client";

import {
  History,
  Clock3,
  ChevronRight,
} from "lucide-react";

type Props = {
  rows: any[];
  filter: string;
  onFilterChange: (value: string) => void;
};

export default function RISHistory({
  rows,
  filter,
  onFilterChange,
}: Props) {
  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

      <div className="border-b bg-slate-50 p-4">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-2">

            <History
              size={20}
              className="text-blue-600"
            />

            <h2 className="text-lg font-semibold text-slate-800">
              Request History
            </h2>

          </div>

          <select
            value={filter}
            onChange={(e) =>
              onFilterChange(e.target.value)
            }
            className="rounded-lg border px-3 py-1 text-sm"
          >
            <option value="my">
              My Requests
            </option>

            <option value="all">
              All Requests
            </option>

          </select>

        </div>

      </div>

      <div className="max-h-[650px] overflow-y-auto">

        {rows.length === 0 ? (

          <div className="p-8 text-center text-slate-500">
            No history available.
          </div>

        ) : (

          rows.map((item) => (

            <div
              key={item.id}
              className="cursor-pointer border-b p-4 transition hover:bg-slate-50"
            >

              <div className="flex items-start justify-between">

                <div>

                  <div className="font-semibold text-slate-800">
                    {item.ris_no}
                  </div>

                  <div className="mt-1 text-sm text-slate-600">
                    {item.accountable_officer}
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">

                    <Clock3 size={13} />

                    {item.request_date
                      ? new Date(
                          item.request_date
                        ).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })
                      : "-"}

                  </div>

                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold
                    ${
                      item.status === "Approved"
                        ? "bg-green-100 text-green-700"
                        : item.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : item.status === "Rejected"
                        ? "bg-red-100 text-red-700"
                        : item.status === "Returned"
                        ? "bg-orange-100 text-orange-700"
                        : item.status === "Cancelled"
                        ? "bg-gray-100 text-gray-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                >
                  {item.status}
                </span>

              </div>

            </div>

          ))

        )}

      </div>

      <div className="flex items-center justify-center border-t bg-slate-50 p-3">

        <button className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800">

          View Complete History

          <ChevronRight size={16} />

        </button>

      </div>

    </div>
  );
}