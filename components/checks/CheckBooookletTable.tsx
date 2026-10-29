
"use client";

import { useMemo, useState } from "react";
import {
  Search,
  X,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Clock3,
  Plus,
} from "lucide-react";

export interface Booklet {
  id: string;
  bookletNumber: string;
  registeredAt?: string | null;
  dateReceived?: string | null;
  fundSourceId?: string | null;
  fundSourceName?: string | null;
  bankId?: string | null;
  bank: string;
  bankAccountId?: string | null;
  accountNumber: string;
  beginningCheckNo: string;
  endingCheckNo: string;
  remarks?: string | null;
  status: string;
  createdAt?: string | null;
  checks?: {
    id: string;
    checkNumber: string;
    status: string;
    payee?: string | null;
    amount?: number | string | null;
    dateIssued?: string | null;
  }[];
}

interface Props {
  booklets: Booklet[];
  onSelect: (booklet: Booklet) => void;
  onRegister: () => void;
}

type StatusFilter = "All" | "Active" | "Exhausted";

const PAGE_SIZES = [10, 20, 50, 100];

function normalizeStatus(status?: string | null) {
  return String(status ?? "").trim().toLowerCase();
}

function getStatusClasses(status?: string | null) {
  switch (normalizeStatus(status)) {
    case "active":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "exhausted":
      return "border-amber-200 bg-amber-50 text-amber-700";
    default:
      return "border-slate-200 bg-slate-100 text-slate-600";
  }
}

function getStatusIcon(status?: string | null) {
  switch (normalizeStatus(status)) {
    case "active":
      return <CheckCircle2 size={14} />;
    case "exhausted":
      return <AlertCircle size={14} />;
    default:
      return <Clock3 size={14} />;
  }
}

function formatDate(value?: string | Date | null) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export default function CheckBookletTable({
  booklets,
  onSelect,
  onRegister,
}: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("All");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortAscending, setSortAscending] = useState(false);

  const counts = useMemo(
    () => ({
      total: booklets.length,
      active: booklets.filter(
        (item) => normalizeStatus(item.status) === "active"
      ).length,
      exhausted: booklets.filter(
        (item) => normalizeStatus(item.status) === "exhausted"
      ).length,
    }),
    [booklets]
  );

  const filteredBooklets = useMemo(() => {
    const query = search.trim().toLowerCase();

    return booklets
      .filter((booklet) => {
        const matchesStatus =
          statusFilter === "All" ||
          normalizeStatus(booklet.status) ===
            statusFilter.toLowerCase();

        const values = [
          booklet.bookletNumber,
          booklet.bank,
          booklet.accountNumber,
          booklet.beginningCheckNo,
          booklet.endingCheckNo,
          booklet.fundSourceName,
          booklet.status,
          booklet.remarks,
        ];

        const matchesSearch =
          !query ||
          values.some((value) =>
            String(value ?? "").toLowerCase().includes(query)
          );

        return matchesStatus && matchesSearch;
      })
      .sort((a, b) => {
        const left = String(a.bookletNumber ?? "");
        const right = String(b.bookletNumber ?? "");

        return sortAscending
          ? left.localeCompare(right, undefined, { numeric: true })
          : right.localeCompare(left, undefined, { numeric: true });
      });
  }, [booklets, search, statusFilter, sortAscending]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredBooklets.length / pageSize)
  );
  const currentPage = Math.min(page, totalPages);

  const paginatedBooklets = filteredBooklets.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const startRecord =
    filteredBooklets.length === 0
      ? 0
      : (currentPage - 1) * pageSize + 1;

  const endRecord = Math.min(
    currentPage * pageSize,
    filteredBooklets.length
  );

  function resetFilters() {
    setSearch("");
    setStatusFilter("All");
    setPage(1);
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <BookOpen size={21} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Registered Booklets
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Browse and manage registered check booklet records.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <div className="relative w-full sm:w-72">
              <Search
                size={17}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search booklet, bank, account..."
                aria-label="Search check booklets"
                className="h-11 w-full rounded-xl border border-slate-300 pl-10 pr-10 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as StatusFilter);
                setPage(1);
              }}
              aria-label="Filter by status"
              className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="All">All statuses</option>
              <option value="Active">Active</option>
              <option value="Exhausted">Exhausted</option>
            </select>

            <button
              type="button"
              onClick={onRegister}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
            >
              <Plus size={18} />
              Register Booklet
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Booklets
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {counts.total.toLocaleString("en-PH")}
            </p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Active
            </p>
            <p className="mt-2 text-2xl font-bold text-emerald-800">
              {counts.active.toLocaleString("en-PH")}
            </p>
          </div>
          <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
              Exhausted
            </p>
            <p className="mt-2 text-2xl font-bold text-amber-800">
              {counts.exhausted.toLocaleString("en-PH")}
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1050px] text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">
                #
              </th>
              <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">
                <button
                  type="button"
                  onClick={() => setSortAscending((value) => !value)}
                  className="inline-flex items-center gap-2 hover:text-blue-700"
                >
                  Booklet Number
                  <ArrowUpDown size={14} />
                </button>
              </th>
              <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">
                Bank / Account
              </th>
              <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">
                Check Number Range
              </th>
              <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">
                Fund Source
              </th>
              <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">
                Date Received
              </th>
              <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">
                Status
              </th>
              <th className="px-5 py-4 text-right text-xs font-bold uppercase text-slate-500">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {paginatedBooklets.map((booklet, index) => (
              <tr
                key={booklet.id}
                onClick={() => onSelect(booklet)}
                className="group cursor-pointer transition hover:bg-blue-50/50"
              >
                <td className="px-5 py-4 text-sm text-slate-400">
                  {(currentPage - 1) * pageSize + index + 1}
                </td>
                <td className="px-5 py-4">
                  <div className="font-semibold text-slate-900 group-hover:text-blue-700">
                    {booklet.bookletNumber || "—"}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    Registered {formatDate(booklet.registeredAt)}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="font-medium text-slate-800">
                    {booklet.bank || "—"}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    Account: {booklet.accountNumber || "—"}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="font-mono text-sm font-semibold text-slate-800">
                    {booklet.beginningCheckNo || "—"}
                    <span className="mx-2 text-slate-400">–</span>
                    {booklet.endingCheckNo || "—"}
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-slate-600">
                  {booklet.fundSourceName || "—"}
                </td>
                <td className="px-5 py-4 text-sm text-slate-600">
                  {formatDate(booklet.dateReceived)}
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClasses(booklet.status)}`}
                  >
                    {getStatusIcon(booklet.status)}
                    {booklet.status || "Unknown"}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onSelect(booklet);
                    }}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  >
                    <Eye size={15} />
                    View
                  </button>
                </td>
              </tr>
            ))}

            {paginatedBooklets.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-16 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <Search size={22} />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-slate-800">
                    No booklets found
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {search || statusFilter !== "All"
                      ? "Try changing your search or filter."
                      : "Registered check booklets will appear here."}
                  </p>
                  {(search || statusFilter !== "All") && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <X size={15} />
                      Clear filters
                    </button>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-4 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <span>
            Showing{" "}
            <strong className="text-slate-800">
              {startRecord}–{endRecord}
            </strong>{" "}
            of{" "}
            <strong className="text-slate-800">
              {filteredBooklets.length}
            </strong>
          </span>
          <label className="flex items-center gap-2">
            Rows
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
              className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm"
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-300 px-3 text-sm disabled:opacity-40"
          >
            <ChevronLeft size={16} />
            Previous
          </button>
          <span className="min-w-20 text-center text-sm text-slate-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() =>
              setPage((value) => Math.min(totalPages, value + 1))
            }
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-300 px-3 text-sm disabled:opacity-40"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
