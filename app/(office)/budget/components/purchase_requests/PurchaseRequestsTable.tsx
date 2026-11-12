"use client";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ClipboardList,
  Eye,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";

import type {
  PurchaseRequest,
  OfficeOption,
  SubOfficeOption,
} from "./purchase-requests-types";

type Props = {
  records: PurchaseRequest[];
  offices: OfficeOption[];
  subOffices: SubOfficeOption[];
  loading: boolean;
  search: string;
  selectedOffice: string;
  selectedSubOffice: string;
  selectedStatus: string;
  selectedYear: string;
  page: number;
  pageSize: number;
  total: number;
  expanded: boolean;
  totalAmount: number;

  onSearchChange: (value: string) => void;
  onOfficeChange: (value: string) => void;
  onSubOfficeChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onYearChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onToggleExpanded: () => void;
  onAdd: () => void;
  onView: (record: PurchaseRequest) => void;
  onRefresh: () => void;
  onReset: () => void;
};

const PAGE_SIZE_OPTIONS = [5, 10, 20];

const money = (value: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(Number(value || 0));

const dateFormat = (value: string) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

const statusStyle = (status: string) => {
  switch (status) {
    case "approved":
      return "bg-emerald-50 text-emerald-700";

    case "submitted":
    case "for_review":
      return "bg-amber-50 text-amber-700";

    case "rejected":
    case "cancelled":
      return "bg-red-50 text-red-700";

    case "partially_converted_to_obr":
      return "bg-indigo-50 text-indigo-700";

    case "converted_to_obr":
      return "bg-blue-50 text-blue-700";

    case "no_obr":
      return "bg-slate-100 text-slate-500";

    default:
      return "bg-slate-100 text-slate-600";
  }
};

const statusLabel = (status: string) =>
  status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function PurchaseRequestsTable({
  records,
  offices,
  subOffices,
  loading,
  search,
  selectedOffice,
  selectedSubOffice,
  selectedStatus,
  selectedYear,
  page,
  pageSize,
  total,
  expanded,
  totalAmount,
  onSearchChange,
  onOfficeChange,
  onSubOfficeChange,
  onStatusChange,
  onYearChange,
  onPageChange,
  onPageSizeChange,
  onToggleExpanded,
  onAdd,
  onView,
  onRefresh,
  onReset,
}: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const filteredSubOffices = subOffices.filter(
    (item) =>
      item.office_id === selectedOffice &&
      item.is_active !== false
  );

  return (
    <section className="overflow-hidden rounded-lg border border-[#DCE3E9] bg-white">

      {/* SECTION HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DCE3E9] p-4">
        <button
          type="button"
          onClick={onToggleExpanded}
          className="flex items-center gap-3 text-left"
        >
          <div className="rounded-md bg-[#EAF1F6] p-2 text-[#6689A5]">
            <ClipboardList size={19} />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-800">
              Purchase Requests
            </h2>
            <p className="text-[11px] text-slate-400">
              Purchase requests submitted by offices
            </p>
          </div>

          {expanded ? (
            <ChevronUp size={16} className="text-slate-500" />
          ) : (
            <ChevronDown size={16} className="text-slate-500" />
          )}
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            title="Refresh records"
            className="rounded-md border border-slate-200 p-2 text-slate-500 hover:bg-[#EAF1F6] hover:text-[#557992]"
          >
            <RefreshCw size={14} />
          </button>

          <button
            type="button"
            onClick={onReset}
            className="rounded-md border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            Reset Filters
          </button>

          <button
            type="button"
            onClick={onAdd}
            className="flex items-center gap-2 rounded-md bg-[#6689A5] px-3 py-2.5 text-xs font-semibold text-white hover:bg-[#557992]"
          >
            <Plus size={15} />
            New Purchase Request
          </button>
        </div>
      </div>

      {expanded && (
        <>
          {/* FILTERS */}
          <div className="grid gap-2 border-b border-slate-100 bg-[#FAFBFC] p-4 sm:grid-cols-2 xl:grid-cols-5">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-2.5 text-slate-400"
              />

              <input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search purchase requests..."
                className="w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs outline-none focus:border-[#829FB5]"
              />
            </div>

            <select
              value={selectedYear}
              onChange={(e) => onYearChange(e.target.value)}
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#829FB5]"
            >
              <option value="All">All Years</option>

              {Array.from(
                { length: 8 },
                (_, index) => new Date().getFullYear() - index
              ).map((year) => (
                <option key={year} value={String(year)}>
                  {year}
                </option>
              ))}
            </select>

            <select
              value={selectedOffice}
              onChange={(e) => onOfficeChange(e.target.value)}
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#829FB5]"
            >
              <option value="All">All Offices</option>

              {offices
                .filter(
                  (item) =>
                    item.is_active !== false ||
                    item.id === selectedOffice
                )
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.office_code
                      ? `${item.office_code} — ${item.office_name}`
                      : item.office_name}
                  </option>
                ))}
            </select>

            <select
              value={selectedSubOffice}
              onChange={(e) => onSubOfficeChange(e.target.value)}
              disabled={selectedOffice === "All"}
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#829FB5] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            >
              <option value="All">All Sub-offices</option>

              {filteredSubOffices.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.sub_office_code
                    ? `${item.sub_office_code} — ${item.sub_office_name}`
                    : item.sub_office_name}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#829FB5]"
            >
              <option value="All">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="for_review">For Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
              <option value="partially_converted_to_obr">
                Partially Converted to OBR
              </option>
              <option value="converted_to_obr">
                Converted to OBR
              </option>
            </select>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="bg-[#F3F6F8] text-[10px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3">
                    PR Number
                  </th>
                  <th className="whitespace-nowrap px-4 py-3">
                    PR Date
                  </th>
                  <th className="whitespace-nowrap px-4 py-3">
                    Office
                  </th>
                  <th className="whitespace-nowrap px-4 py-3">
                    Purpose
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-center">
                    Items
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-right">
                    Estimated Amount
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-center">
                    Status
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-center">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-10 text-center text-slate-400"
                    >
                      Loading purchase requests...
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-10 text-center text-sm text-slate-400"
                    >
                      No purchase requests found.
                    </td>
                  </tr>
                ) : (
                  records.map((item) => {
                    // The list API must return obr_count for each purchase request.
                    // No OBR overrides the workflow status only when no link exists.
                    const hasObr = Number((item as any).obr_count ?? 0) > 0;
                    const displayStatus = hasObr
                      ? item.status
                      : "no_obr";

                    return (
                    <tr
                      key={item.id}
                      className="transition hover:bg-[#F8FAFC]"
                    >
                      <td className="whitespace-nowrap px-4 py-2.5 text-xs font-semibold text-[#6689A5]">
                        {(item as any).pr_number || (item as any).rp_number}
                      </td>

                      <td className="whitespace-nowrap px-4 py-2.5 text-xs text-slate-600">
                        {dateFormat(item.pr_date)}
                      </td>

                      <td className="px-4 py-2.5 text-xs">
                        <p className="font-medium text-slate-700">
                          {item.office_name}
                        </p>

                        {item.sub_office_name && (
                          <p className="mt-0.5 text-[10px] text-violet-600">
                            {item.sub_office_name}
                          </p>
                        )}
                      </td>

                      <td className="max-w-[260px] px-4 py-2.5 text-xs text-slate-600">
                        <span className="line-clamp-2">
                          {item.purpose}
                        </span>
                      </td>

                      <td className="px-4 py-2.5 text-center text-xs text-slate-600">
                        {item.item_count}
                      </td>

                      <td className="whitespace-nowrap px-4 py-2.5 text-right text-xs font-semibold text-slate-700">
                        {money(Number(item.total_amount))}
                      </td>

                      <td className="px-4 py-2.5 text-center">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusStyle(
                            displayStatus
                          )}`}
                        >
                          {statusLabel(displayStatus)}
                        </span>
                      </td>

                      <td className="px-4 py-2.5">
                        <div className="flex justify-center">
                          <button
                            type="button"
                            title="View purchase request"
                            onClick={() => onView(item)}
                            className="rounded-md border border-slate-200 p-1.5 text-slate-500 hover:bg-[#EAF1F6] hover:text-[#557992]"
                          >
                            <Eye size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    );
                  })
                )}
              </tbody>

              {!loading && total > 0 && (
                <tfoot className="border-t border-slate-200 bg-[#F8FAFC]">
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-600"
                    >
                      Total Estimated Amount
                    </td>

                    <td className="px-4 py-3 text-right text-xs font-bold text-[#557992]">
                      {money(totalAmount)}
                    </td>

                    <td colSpan={2} />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* PAGINATION */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">
                Rows per page
              </span>

              <select
                value={pageSize}
                onChange={(e) =>
                  onPageSizeChange(Number(e.target.value))
                }
                className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-600 outline-none"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>

              <span className="text-[11px] text-slate-400">
                Showing {start}-{end} of {total}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
                className="rounded-md border border-slate-200 p-1.5 text-slate-500 disabled:opacity-40"
              >
                <ChevronLeft size={15} />
              </button>

              <span className="min-w-[90px] text-center text-[11px] text-slate-500">
                Page {page} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
                className="rounded-md border border-slate-200 p-1.5 text-slate-500 disabled:opacity-40"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}