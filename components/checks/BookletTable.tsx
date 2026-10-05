
"use client";

import {
  ArrowUpDown,
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";

export type CheckStatus = "Available" | "Issued" | "Voided";
export type BookletStatus = "Active" | "Exhausted";

export interface Check {
  id: string;
  checkNumber: string;
  status: CheckStatus;
  payee?: string | null;
  amount?: number | string | null;
  dateIssued?: string | null;
}

export interface Booklet {
  id: string;
  bookletNumber: string;
  bank: string;
  accountNumber: string;
  beginningCheckNo: string;
  endingCheckNo: string;
  dateReceived: string;
  status: BookletStatus;
  fundSourceId?: string | null;
  fundSourceName?: string | null;
  bankId?: string | null;
  bankAccountId?: string | null;
  registeredAt?: string | null;
  remarks?: string | null;
  checks: Check[];
}

interface BookletTableProps {
  booklets: Booklet[];
  onSelect: (booklet: Booklet) => void;
}

export default function BookletTable({
  booklets,
  onSelect,
}: BookletTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">(
    "newest"
  );
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredBooklets = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return [...booklets]
      .filter((booklet) => {
        const matchesSearch =
          !keyword ||
          booklet.bookletNumber?.toLowerCase().includes(keyword) ||
          booklet.bank?.toLowerCase().includes(keyword) ||
          booklet.accountNumber?.toLowerCase().includes(keyword) ||
          booklet.fundSourceName?.toLowerCase().includes(keyword) ||
          booklet.beginningCheckNo?.includes(keyword) ||
          booklet.endingCheckNo?.includes(keyword);

        const matchesStatus =
          statusFilter === "All" ||
          booklet.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const dateA = new Date(
          a.registeredAt || a.dateReceived
        ).getTime();
        const dateB = new Date(
          b.registeredAt || b.dateReceived
        ).getTime();

        return sortOrder === "newest"
          ? dateB - dateA
          : dateA - dateB;
      });
  }, [booklets, search, statusFilter, sortOrder]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredBooklets.length / rowsPerPage)
  );

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const paginatedBooklets = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;

    return filteredBooklets.slice(
      startIndex,
      startIndex + rowsPerPage
    );
  }, [filteredBooklets, currentPage, rowsPerPage]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleRowsPerPageChange = (value: number) => {
    setRowsPerPage(value);
    setCurrentPage(1);
  };

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

  const getCheckCount = (booklet: Booklet) => {
    if (booklet.checks?.length) {
      return booklet.checks.length;
    }

    const start = Number(booklet.beginningCheckNo);
    const end = Number(booklet.endingCheckNo);

    return Number.isFinite(start) &&
      Number.isFinite(end) &&
      end >= start
      ? end - start + 1
      : 0;
  };

  const startEntry =
    filteredBooklets.length === 0
      ? 0
      : (currentPage - 1) * rowsPerPage + 1;

  const endEntry = Math.min(
    currentPage * rowsPerPage,
    filteredBooklets.length
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search book number, bank, account..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-800 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-600"
          >
            <option value="All">All statuses</option>
            <option value="Active">Active</option>
            <option value="Exhausted">Exhausted</option>
          </select>

          <button
            type="button"
            onClick={() =>
              setSortOrder((current) =>
                current === "newest" ? "oldest" : "newest"
              )
            }
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50"
          >
            <ArrowUpDown size={16} />
            {sortOrder === "newest"
              ? "Newest first"
              : "Oldest first"}
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] border-collapse text-left text-sm">
            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-600">
              <tr>
                <th className="px-4 py-3">Book No.</th>
                <th className="px-4 py-3">Fund Source</th>
                <th className="px-4 py-3">Bank</th>
                <th className="px-4 py-3">Account Number</th>
                <th className="px-4 py-3">Check Range</th>
                <th className="px-4 py-3 text-center">Checks</th>
                <th className="px-4 py-3">Date Registered</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {paginatedBooklets.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-12 text-center text-gray-500"
                  >
                    {booklets.length === 0
                      ? "No check booklets registered yet."
                      : "No matching check booklets found."}
                  </td>
                </tr>
              ) : (
                paginatedBooklets.map((booklet) => (
                  <tr
                    key={booklet.id}
                    onClick={() => onSelect(booklet)}
                    className="cursor-pointer transition hover:bg-blue-50/50"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-gray-900">
                      {booklet.bookletNumber || "—"}
                    </td>

                    <td className="px-4 py-3 text-gray-700">
                      {booklet.fundSourceName || "—"}
                    </td>

                    <td className="px-4 py-3 text-gray-700">
                      {booklet.bank || "—"}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 font-mono text-gray-700">
                      {booklet.accountNumber || "—"}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 font-mono text-gray-700">
                      {booklet.beginningCheckNo} –{" "}
                      {booklet.endingCheckNo}
                    </td>

                    <td className="px-4 py-3 text-center text-gray-700">
                      {getCheckCount(booklet).toLocaleString("en-PH")}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                      {formatDate(
                        booklet.registeredAt || booklet.dateReceived
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          booklet.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {booklet.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(booklet);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-50"
                      >
                        <Eye size={15} />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-gray-200 bg-gray-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
            <span>Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) =>
                handleRowsPerPageChange(Number(e.target.value))
              }
              className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-700 outline-none focus:border-blue-600"
            >
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>

            <span className="ml-1">
              Showing {startEntry}–{endEntry} of{" "}
              {filteredBooklets.length} booklets
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 sm:justify-end">
            <span className="text-xs text-gray-600">
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() =>
                setCurrentPage((page) => Math.max(1, page - 1))
              }
              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() =>
                setCurrentPage((page) =>
                  Math.min(totalPages, page + 1)
                )
              }
              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
