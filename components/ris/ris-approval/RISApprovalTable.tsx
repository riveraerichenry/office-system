"use client";

import { Search } from "lucide-react";

type Props = {
  data: any[];
  loading: boolean;
  selected: any;

  search: string;
  statusFilter: string;

  onSearch: (value: string) => void;
  onStatusFilter: (
    value: string
  ) => void;

  onSelect: (
    request: any
  ) => void;
};

export default function RISApprovalTable({
  data,
  loading,
  selected,

  search,
  statusFilter,

  onSearch,
  onStatusFilter,

  onSelect,
}: Props) {

  return (

    <div className="rounded-2xl border bg-white shadow-sm">

      <div className="border-b p-5">

        <h2 className="text-lg font-semibold text-slate-800">
          RIS Approval
        </h2>

        <p className="text-sm text-slate-500">
          Pending Requisition & Issue Slips
        </p>

      </div>

      <div className="space-y-3 border-b p-4">

        <div className="relative">

          <Search
            size={18}
            className="absolute left-3 top-3 text-gray-400"
          />

          <input
            value={search}
            onChange={(e) =>
              onSearch(
                e.target.value
              )
            }
            placeholder="Search RIS..."
            className="w-full rounded-xl border py-2 pl-10 pr-4 outline-none focus:border-blue-500"
          />

        </div>

        <select
          value={statusFilter}
          onChange={(e) =>
            onStatusFilter(
              e.target.value
            )
          }
          className="w-full rounded-xl border px-3 py-2"
        >

          <option value="">
            All Status
          </option>

          <option value="PENDING">
            Pending
          </option>

          <option value="RETURNED">
            Returned
          </option>

          <option value="APPROVED">
            Approved
          </option>

          <option value="REJECTED">
            Rejected
          </option>

        </select>

      </div>

      <div className="max-h-[650px] overflow-y-auto">

        {loading ? (

          <div className="p-8 text-center text-gray-500">
            Loading...
          </div>

        ) : data.length === 0 ? (

          <div className="p-8 text-center text-gray-500">
            No RIS found.
          </div>

        ) : (

          <table className="w-full">

            <thead className="sticky top-0 bg-slate-50">

              <tr className="text-left text-sm text-slate-600">

                <th className="px-4 py-3">
                  RIS No.
                </th>

                <th className="px-4 py-3">
                  Requester
                </th>

                <th className="px-4 py-3">
                  Date
                </th>

                <th className="px-4 py-3 text-center">
                  Items
                </th>

                <th className="px-4 py-3">
                  Status
                </th>

              </tr>

            </thead>

            <tbody>

              {data.map((row) => (

                <tr
                  key={row.id}
                  onClick={() =>
                    onSelect(row)
                  }
                  className={`cursor-pointer border-t hover:bg-blue-50 transition ${
                    selected?.id === row.id
                      ? "bg-blue-50"
                      : ""
                  }`}
                >

                  <td className="px-4 py-3 font-medium">
                    {row.ris_no}
                  </td>

                  <td className="px-4 py-3">
                    {row.requested_by_name}
                  </td>

                  <td className="px-4 py-3">
                    {row.request_date}
                  </td>

                  <td className="px-4 py-3 text-center">
                    {row.total_items}
                  </td>

                  <td className="px-4 py-3">

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        row.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-700"
                          : row.status === "APPROVED"
                          ? "bg-green-100 text-green-700"
                          : row.status === "RETURNED"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-red-100 text-red-700"
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

      </div>

    </div>

  );

}