
"use client";

import {
  Eye,
  Plus,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import type { DVRecord } from "./types";

type Props = {
  rows: DVRecord[];
  loading?: boolean;
  onCreate: () => void;
  onRefresh: () => void;
  onView?: (row: DVRecord) => void;
};

const peso = (v: number | string) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(Number(v || 0));

export default function DVTable({
  rows,
  loading = false,
  onCreate,
  onRefresh,
  onView,
}: Props) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return rows.filter((r) =>
      [r.dv_no, r.payee, r.payor, r.status].some((v) =>
        String(v || "").toLowerCase().includes(keyword)
      )
    );
  }, [rows, search]);

  const totalRecords = filtered.length;

  const totalPages = Math.max(
    1,
    Math.ceil(totalRecords / pageSize)
  );

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const startRecord =
    totalRecords === 0 ? 0 : (page - 1) * pageSize + 1;

  const endRecord = Math.min(
    page * pageSize,
    totalRecords
  );

  useEffect(() => {
    setPage(1);
  }, [search, pageSize]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return (
    <div className="space-y-4">

      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Disbursement Vouchers
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Manage and review recorded disbursement vouchers.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={onCreate}
            className="inline-flex items-center gap-2 rounded-md bg-[#6689A5] px-3 py-2 text-xs font-semibold text-white hover:bg-[#557992]"
          >
            <Plus size={14} />
            Create DV
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3">
        <Search size={15} className="text-slate-400" />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search DV number, payee, status..."
          className="w-full py-2.5 text-xs outline-none"
        />

        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="text-[10px] font-medium text-slate-400 hover:text-slate-700"
          >
            Clear
          </button>
        )}
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
        <table className="w-full min-w-[800px] text-left">
          <thead className="bg-[#EDF3F7] text-[11px] font-semibold text-slate-500">
            <tr>
              <th className="px-3 py-2.5">DV Number</th>
              <th className="px-3 py-2.5">Date</th>
              <th className="px-3 py-2.5">Payee</th>
              <th className="px-3 py-2.5 text-right">
                Total Amount
              </th>
              <th className="px-3 py-2.5">Status</th>
              <th className="px-3 py-2.5 text-center">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-10 text-center text-xs text-slate-400"
                >
                  Loading vouchers...
                </td>
              </tr>
            ) : paginatedRows.length > 0 ? (
              paginatedRows.map((r) => (
                <tr
                  key={r.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onView?.(r)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onView?.(r);
                    }
                  }}
                  className="cursor-pointer transition-colors hover:bg-[#EDF3F7] focus:bg-[#EDF3F7] focus:outline-none"
                  title="Click to view voucher details"
                >
                  <td className="px-3 py-2.5 text-xs font-semibold text-slate-700">
                    {r.dv_no}
                  </td>

                  <td className="px-3 py-2.5 text-xs text-slate-500">
                    {r.dv_date
                      ? String(r.dv_date).slice(0, 10)
                      : "—"}
                  </td>

                  <td className="px-3 py-2.5 text-xs text-slate-600">
                    {r.payee}
                  </td>

                  <td className="px-3 py-2.5 text-right text-xs font-semibold tabular-nums">
                    {peso(r.grand_total)}
                  </td>

                  <td className="px-3 py-2.5">
                    <span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">
                      {r.status || "DRAFT"}
                    </span>
                  </td>

                  <td className="px-3 py-2.5 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onView?.(r);
                      }}
                      className="rounded p-1.5 text-slate-500 hover:bg-white hover:text-[#557992]"
                      title="View voucher"
                    >
                      <Eye size={15} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="py-10 text-center text-xs text-slate-400"
                >
                  {search
                    ? "No matching disbursement vouchers found."
                    : "No disbursement vouchers found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-[11px] text-slate-500">
          Showing{" "}
          <span className="font-semibold text-slate-700">
            {startRecord}
          </span>
          {" "}to{" "}
          <span className="font-semibold text-slate-700">
            {endRecord}
          </span>
          {" "}of{" "}
          <span className="font-semibold text-slate-700">
            {totalRecords}
          </span>
          {" "}voucher(s)
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500">
              Rows per page
            </span>

            <select
              value={pageSize}
              onChange={(e) =>
                setPageSize(Number(e.target.value))
              }
              className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-600 outline-none focus:border-[#6689A5]"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>

          <span className="text-[11px] text-slate-500">
            Page{" "}
            <span className="font-semibold text-slate-700">
              {page}
            </span>
            {" "}of{" "}
            <span className="font-semibold text-slate-700">
              {totalPages}
            </span>
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() =>
                setPage((current) => Math.max(1, current - 1))
              }
              disabled={page <= 1 || loading}
              className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              title="Previous page"
            >
              <ChevronLeft size={15} />
            </button>

            <button
              type="button"
              onClick={() =>
                setPage((current) =>
                  Math.min(totalPages, current + 1)
                )
              }
              disabled={page >= totalPages || loading}
              className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              title="Next page"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
