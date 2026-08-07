"use client";

import { Search } from "lucide-react";

type Props = {
  requests: any[];
  loading: boolean;
  selected: any;

  search: string;
  status: string;
  fiscalYear: string;

  onSearch: (value: string) => void;
  onStatus: (value: string) => void;
  onFiscalYear: (value: string) => void;

  onSelect: (ris: any) => void;
};

export default function ApprovalTable({
  requests,
  loading,
  selected,

  search,
  status,
  fiscalYear,

  onSearch,
  onStatus,
  onFiscalYear,

  onSelect,
}: Props) {

  const years = [
    ...new Set(
      requests.map((x) =>
        new Date(x.request_date)
          .getFullYear()
      )
    ),
  ].sort((a, b) => Number(b) - Number(a));

  return (

    <div className="rounded-2xl border bg-white shadow-sm">

      {/* Header */}

      <div className="border-b p-5">

        <h2 className="text-lg font-semibold text-slate-800">

          RIS Approval

        </h2>

        <p className="text-sm text-slate-500">

          Requests awaiting approval

        </p>

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
            placeholder="Search RIS..."
            className="w-full rounded-xl border py-2 pl-10 pr-4 outline-none focus:border-blue-500"
          />

        </div>

        {/* Filters */}

        <div className="grid grid-cols-2 gap-3">

          <select
            value={status}
            onChange={(e) =>
              onStatus(e.target.value)
            }
            className="rounded-lg border p-2"
          >

            <option value="PENDING">
              Pending
            </option>

            <option value="APPROVED">
              Approved
            </option>

            <option value="ISSUED">
              Issued
            </option>

            <option value="ALL">
              All
            </option>

          </select>

          <select
            value={fiscalYear}
            onChange={(e) =>
              onFiscalYear(
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

        </div>

      </div>

      {/* Table */}

      <div className="max-h-[650px] overflow-y-auto">

        {loading ? (

          <div className="p-8 text-center text-gray-500">

            Loading...

          </div>

        ) : requests.length === 0 ? (

          <div className="p-8 text-center text-gray-500">

            No RIS found.

          </div>

        ) : (

          <table className="w-full">

            <thead className="sticky top-0 bg-gray-50">

              <tr className="text-left text-sm text-slate-600">

                <th className="px-4 py-3">

                  RIS No

                </th>

                <th className="px-4 py-3">

                  Requester

                </th>

                <th className="px-4 py-3">

                  Date

                </th>

                <th className="px-4 py-3">

                  Status

                </th>

              </tr>

            </thead>

            <tbody>

              {requests.map((row) => (

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

                    {row.ris_no}

                  </td>

                  <td className="px-4 py-3">

                    {row.requested_by_name}

                  </td>

                  <td className="px-4 py-3">

                    {new Date(
                      row.request_date
                    ).toLocaleDateString()}

                  </td>

                  <td className="px-4 py-3">

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        row.status ===
                        "PENDING"
                          ? "bg-yellow-100 text-yellow-700"
                          : row.status ===
                            "APPROVED"
                          ? "bg-green-100 text-green-700"
                          : row.status ===
                            "ISSUED"
                          ? "bg-blue-100 text-blue-700"
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

      </div>

    </div>

  );
}