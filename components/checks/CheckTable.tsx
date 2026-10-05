
"use client";

import { useMemo, useState, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import type { Check, CheckStatus } from "./BookletTable";

interface Props {
  checks: Check[];
}

const PAGE_SIZE = 10;

export default function CheckTable({ checks }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredChecks = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return checks.filter((check) => {
      const matchesSearch =
        !keyword ||
        check.checkNumber?.toLowerCase().includes(keyword) ||
        (check.payee ?? "").toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "All" || check.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [checks, search, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredChecks.length / PAGE_SIZE)
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedChecks = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;

    return filteredChecks.slice(
      startIndex,
      startIndex + PAGE_SIZE
    );
  }, [filteredChecks, currentPage]);

  const formatDate = (value?: string | null) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString("en-PH", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  const formatAmount = (value?: number | string | null) => {
    if (value === null || value === undefined || value === "") {
      return "—";
    }

    const amount = Number(value);

    if (!Number.isFinite(amount)) return "—";

    return amount.toLocaleString("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const statusStyle: Record<CheckStatus, string> = {
    Available: "bg-green-100 text-green-700",
    Issued: "bg-blue-100 text-blue-700",
    Voided: "bg-red-100 text-red-700",
  };

  const startItem =
    filteredChecks.length === 0
      ? 0
      : (currentPage - 1) * PAGE_SIZE + 1;

  const endItem = Math.min(
    currentPage * PAGE_SIZE,
    filteredChecks.length
  );

  const getPageNumbers = () => {
    const pages: number[] = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);

    for (let page = start; page <= end; page++) {
      pages.push(page);
    }

    return pages;
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="flex flex-col gap-3 border-b border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search check number or payee..."
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm text-gray-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-600"
        >
          <option value="All">All statuses</option>
          <option value="Available">Available</option>
          <option value="Issued">Issued</option>
          <option value="Voided">Voided</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-600">
            <tr>
              <th className="px-5 py-3 font-semibold">Check No.</th>
              <th className="px-5 py-3 font-semibold">Payee</th>
              <th className="px-5 py-3 text-right font-semibold">
                Amount
              </th>
              <th className="px-5 py-3 font-semibold">Date Issued</th>
              <th className="px-5 py-3 font-semibold">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {paginatedChecks.map((check) => (
              <tr key={check.id} className="transition hover:bg-gray-50">
                <td className="whitespace-nowrap px-5 py-3.5 font-medium text-gray-900">
                  {check.checkNumber || "—"}
                </td>

                <td className="px-5 py-3.5 text-gray-700">
                  {check.payee || "—"}
                </td>

                <td className="whitespace-nowrap px-5 py-3.5 text-right tabular-nums text-gray-700">
                  {formatAmount(check.amount)}
                </td>

                <td className="whitespace-nowrap px-5 py-3.5 text-gray-700">
                  {formatDate(check.dateIssued)}
                </td>

                <td className="px-5 py-3.5">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                      statusStyle[check.status] ??
                      "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {check.status || "Unknown"}
                  </span>
                </td>
              </tr>
            ))}

            {paginatedChecks.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-12 text-center text-gray-500"
                >
                  No checks found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-gray-200 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-gray-500">
          Showing {startItem}–{endItem} of {filteredChecks.length} checks
        </p>

        <div className="flex flex-wrap items-center justify-end gap-1">
          <button
            type="button"
            onClick={() =>
              setCurrentPage((page) => Math.max(1, page - 1))
            }
            disabled={currentPage === 1}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          {getPageNumbers().map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => setCurrentPage(page)}
              aria-current={currentPage === page ? "page" : undefined}
              className={`min-w-9 rounded-lg border px-3 py-2 text-sm transition ${
                currentPage === page
                  ? "border-blue-700 bg-blue-700 font-semibold text-white"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            onClick={() =>
              setCurrentPage((page) =>
                Math.min(totalPages, page + 1)
              )
            }
            disabled={currentPage === totalPages}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
