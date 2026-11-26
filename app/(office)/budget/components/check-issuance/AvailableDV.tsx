
"use client";

import { useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  FileText,
  ArrowRight,
} from "lucide-react";

export type DVRecord = {
  id: string;
  dv_no: string;
  dv_date: string;
  payee: string;
  particulars: string;
  grand_total: number | string;
  status?: string;
};

interface AvailableDVProps {
  dvs: DVRecord[];
  loading: boolean;
  onRefresh: () => void;
  onAssign: (dv: DVRecord) => void;
}

const formatCurrency = (value: number | string) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(Number(value || 0));

const formatDate = (value: string) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function AvailableDV({
  dvs,
  loading,
  onRefresh,
  onAssign,
}: AvailableDVProps) {
  const [search, setSearch] = useState("");

  const filteredDVs = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) return dvs;

    return dvs.filter((dv) =>
      [
        dv.dv_no,
        dv.payee,
        dv.particulars,
        dv.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [dvs, search]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search DV number, payee, particulars..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-5 py-4">DV Number</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Payee</th>
                <th className="px-5 py-4">Particulars</th>
                <th className="px-5 py-4 text-right">Amount</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-gray-500"
                  >
                    Loading available DVs...
                  </td>
                </tr>
              ) : filteredDVs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <FileText className="h-8 w-8" />

                      <p className="font-medium text-gray-600">
                        No available DVs found
                      </p>

                      <p className="text-xs">
                        DVs already assigned a check will not appear here.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDVs.map((dv) => (
                  <tr
                    key={dv.id}
                    className="transition hover:bg-gray-50"
                  >
                    <td className="px-5 py-4 font-semibold text-gray-900">
                      {dv.dv_no}
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {formatDate(dv.dv_date)}
                    </td>

                    <td className="px-5 py-4 font-medium text-gray-700">
                      {dv.payee}
                    </td>

                    <td className="max-w-[280px] px-5 py-4 text-gray-600">
                      <p className="line-clamp-2">
                        {dv.particulars || "—"}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-right font-semibold tabular-nums text-gray-900">
                      {formatCurrency(dv.grand_total)}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => onAssign(dv)}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                      >
                        Assign Check
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 bg-gray-50 px-5 py-3">
          <p className="text-xs text-gray-500">
            Showing{" "}
            <span className="font-semibold text-gray-700">
              {filteredDVs.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-700">
              {dvs.length}
            </span>{" "}
            available DVs
          </p>
        </div>
      </div>
    </div>
  );
}
