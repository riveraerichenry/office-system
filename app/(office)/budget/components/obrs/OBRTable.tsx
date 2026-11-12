
"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import type { OBRRecord } from "./types";
import { dateFormat, money } from "./format";

export default function OBRTable({
  records,
  loading,
}: {
  records: OBRRecord[];
  loading: boolean;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // PAGINATION
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset page when records change
  useEffect(() => {
    setPage(1);
    setExpandedId(null);
  }, [records.length]);

  const totalRecords = records.length;

  const totalPages = Math.max(
    1,
    Math.ceil(totalRecords / pageSize)
  );

  const safePage = Math.min(page, totalPages);

  const paginatedRecords = useMemo(() => {
    const start = (safePage - 1) * pageSize;

    return records.slice(start, start + pageSize);
  }, [records, safePage, pageSize]);

  const firstRecord =
    totalRecords === 0
      ? 0
      : (safePage - 1) * pageSize + 1;

  const lastRecord = Math.min(
    safePage * pageSize,
    totalRecords
  );

  function handlePageSizeChange(value: number) {
    setPageSize(value);
    setPage(1);
    setExpandedId(null);
  }

  return (
    <div>
      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1150px] text-sm">
          <thead className="bg-[#F4F7F9] text-xs uppercase text-slate-500">
            <tr>
              <th className="w-10 px-3 py-3" />
              <th className="px-4 py-3 text-left">
                OBR Number
              </th>
              <th className="px-4 py-3 text-left">
                Date
              </th>
              <th className="px-4 py-3 text-left">
                Payee
              </th>
              <th className="px-4 py-3 text-left">
                Office
              </th>
              <th className="px-4 py-3 text-left">
                Particulars
              </th>
              <th className="px-4 py-3 text-center">
                Linked PRs
              </th>
              <th className="px-4 py-3 text-right">
                Total Allocation
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-10 text-center text-slate-400"
                >
                  Loading OBR records...
                </td>
              </tr>
            ) : totalRecords === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-10 text-center text-slate-400"
                >
                  No OBR records found.
                </td>
              </tr>
            ) : (
              paginatedRecords.map((record) => {
                const expanded = expandedId === record.id;

                const linkedPRs =
                  record.purchase_requests || [];

                return (
                  <Fragment key={record.id}>
                    {/* MAIN ROW */}
                    <tr
                      onClick={() =>
                        setExpandedId(
                          expanded ? null : record.id
                        )
                      }
                      className="cursor-pointer transition-colors hover:bg-[#F8FAFC]"
                    >
                      <td className="px-3 py-3 text-slate-400">
                        {expanded ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </td>

                      <td className="px-4 py-3 font-semibold text-[#557992]">
                        {record.obr_number}
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {dateFormat(record.obr_date)}
                      </td>

                      <td className="px-4 py-3 font-medium text-slate-700">
                        {record.payee}
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {record.office_name || "—"}

                        {record.sub_office_name && (
                          <p className="mt-0.5 text-xs text-slate-400">
                            {record.sub_office_name}
                          </p>
                        )}
                      </td>

                      <td className="max-w-[260px] px-4 py-3 text-slate-600">
                        <p className="line-clamp-2">
                          {record.particulars || "—"}
                        </p>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                          {Number(record.pr_count || 0)} PR
                          {Number(record.pr_count || 0) === 1
                            ? ""
                            : "s"}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right font-semibold text-slate-700">
                        {money(record.total_allocation)}
                      </td>
                    </tr>

                    {/* EXPANDED DETAILS */}
                    {expanded && (
                      <tr className="bg-slate-50">
                        <td colSpan={8} className="px-6 py-4">
                          <div className="grid gap-4 lg:grid-cols-3">
                            {/* CLASSIFICATION */}
                            <div>
                              <p className="text-[11px] font-semibold uppercase text-slate-400">
                                Classification
                              </p>

                              <p className="mt-1 text-sm text-slate-700">
                                {record.category_code || "—"}{" "}
                                {record.category_name || ""}
                              </p>

                              <p className="mt-1 text-sm text-slate-600">
                                {record.account_code || "—"}{" "}
                                {record.account_name || ""}
                              </p>
                            </div>

                            {/* REMARKS */}
                            <div>
                              <p className="text-[11px] font-semibold uppercase text-slate-400">
                                Remarks
                              </p>

                              <p className="mt-1 text-sm text-slate-700">
                                {record.remarks || "—"}
                              </p>
                            </div>

                            {/* LINKED PURCHASE REQUESTS */}
                            <div>
                              <p className="text-[11px] font-semibold uppercase text-slate-400">
                                Linked Purchase Requests
                              </p>

                              {linkedPRs.length === 0 ? (
                                <p className="mt-1 text-sm text-slate-500">
                                  No PR linked.
                                </p>
                              ) : (
                                <div className="mt-2 space-y-2">
                                  {linkedPRs.map((pr) => (
                                    <div
                                      key={pr.id}
                                      className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-slate-200 bg-white px-3 py-2"
                                    >
                                      <div>
                                        <p className="text-sm font-semibold text-[#557992]">
                                          {pr.pr_number}
                                        </p>

                                        <p className="text-xs text-slate-500">
                                          {dateFormat(pr.pr_date)}{" "}
                                          · {pr.purpose || "—"}
                                        </p>
                                      </div>

                                      <p className="text-sm font-semibold text-slate-700">
                                        {money(pr.amount)}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex flex-col gap-3 border-t border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">

        {/* ROWS PER PAGE AND RECORD COUNT */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span>Rows per page:</span>

          <select
            value={pageSize}
            onChange={(e) =>
              handlePageSizeChange(Number(e.target.value))
            }
            className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700 outline-none focus:border-[#6689A5]"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>

          <span className="ml-2">
            Showing{" "}
            <strong className="text-slate-700">
              {firstRecord}-{lastRecord}
            </strong>{" "}
            of{" "}
            <strong className="text-slate-700">
              {totalRecords}
            </strong>{" "}
            records
          </span>
        </div>

        {/* PAGE NAVIGATION */}
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => {
              setPage(1);
              setExpandedId(null);
            }}
            disabled={safePage <= 1 || loading}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          >
            First
          </button>

          <button
            type="button"
            onClick={() => {
              setPage((value) => Math.max(1, value - 1));
              setExpandedId(null);
            }}
            disabled={safePage <= 1 || loading}
            className="rounded-md border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            title="Previous page"
          >
            <ChevronLeft size={16} />
          </button>

          <span className="min-w-[90px] text-center text-xs text-slate-600">
            Page{" "}
            <strong>{safePage}</strong> of{" "}
            <strong>{totalPages}</strong>
          </span>

          <button
            type="button"
            onClick={() => {
              setPage((value) =>
                Math.min(totalPages, value + 1)
              );
              setExpandedId(null);
            }}
            disabled={safePage >= totalPages || loading}
            className="rounded-md border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            title="Next page"
          >
            <ChevronRight size={16} />
          </button>

          <button
            type="button"
            onClick={() => {
              setPage(totalPages);
              setExpandedId(null);
            }}
            disabled={safePage >= totalPages || loading}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          >
            Last
          </button>
        </div>
      </div>
    </div>
  );
}
