
"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Package,
  FileText,
} from "lucide-react";

import GenerateInventoryReportModal, {
  type InventoryReportOptions,
} from "./GenerateInventoryReportModal";

import type { InventoryReportRow } from "./InventoryReportPreview";

import CashTicketTable, {
  type CashTicketRow,
} from "./CashTicketTable";

type InventoryRow = {
  id: string | number;
  form_code: string;
  form_name: string;
  total_registered: number;
  total_issued: number;
  total_remaining: number;
};

type InventoryView = "accountable-forms" | "cash-tickets";

type Props = {
  data: InventoryRow[];
  years: number[];
  loading: boolean;
  search: string;
  yearFilter: string;

  onSearch: (value: string) => void;
  onYearFilter: (value: string) => void;
  onSelect: (row: InventoryRow) => void;
  onAdd: () => void;

  reportData: InventoryReportRow[];
  reportLoading: boolean;
  onReportPeriodChange: (month: number, year: number) => void;
  onGenerateReport?: (options: InventoryReportOptions) => void;

  cashTickets: CashTicketRow[];
  cashTicketLoading: boolean;
  cashTicketError: string;
  onRefreshCashTickets: () => void;
  onAddCashTicket: () => void;
};

export default function InventoryTable({
  data,
  years,
  loading,
  search,
  yearFilter,
  onSearch,
  onYearFilter,
  onSelect,
  onAdd,
  reportData,
  reportLoading,
  onReportPeriodChange,
  onGenerateReport,
  cashTickets,
  cashTicketLoading,
  cashTicketError,
  onRefreshCashTickets,
  onAddCashTicket,
}: Props) {
  const rowsPerPage = 10;

  const [page, setPage] = useState(1);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const [inventoryView, setInventoryView] =
    useState<InventoryView>("accountable-forms");

  useEffect(() => {
    setPage(1);
  }, [data, yearFilter, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(data.length / rowsPerPage)
  );

  const paginatedData = data.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const grandRegistered = data.reduce(
    (sum, row) => sum + Number(row.total_registered || 0),
    0
  );

  const grandIssued = data.reduce(
    (sum, row) => sum + Number(row.total_issued || 0),
    0
  );

  const grandRemaining = data.reduce(
    (sum, row) => sum + Number(row.total_remaining || 0),
    0
  );

  function handleGenerateReport(options: InventoryReportOptions) {
    onGenerateReport?.(options);
  }

  return (
    <div className="space-y-4">
      {/* Inventory Header and Type Selector */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">
              Stock Monitoring &amp; Inventory
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Manage accountable forms and cash tickets.
            </p>
          </div>

          <div className="w-full sm:max-w-xs">
            <label
              htmlFor="inventory-view"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Inventory Type
            </label>

            <select
              id="inventory-view"
              value={inventoryView}
              onChange={(event) => {
                setInventoryView(
                  event.target.value as InventoryView
                );
              }}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            >
              <option value="accountable-forms">
                Accountable Forms
              </option>

              <option value="cash-tickets">
                Cash Tickets
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Cash Tickets View */}
      {inventoryView === "cash-tickets" ? (
        <CashTicketTable
          data={cashTickets}
          loading={cashTicketLoading}
          error={cashTicketError}
          onRefresh={onRefreshCashTickets}
          onAdd={onAddCashTicket}
        />
      ) : (
        /* Accountable Forms View */
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Accountable Forms Header */}
          <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">
                Accountable Forms
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Inventory summary by accountable form.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setReportModalOpen(true)}
                disabled={loading || data.length === 0}
                className="flex items-center gap-2 rounded-xl border border-blue-600 bg-white px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FileText size={18} />
                Generate Report
              </button>

              <button
                type="button"
                onClick={onAdd}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                <Plus size={18} />
                Register Booklet
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 border-b border-slate-200 p-5 sm:grid-cols-3">
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-sm text-slate-500">
                Total Registered
              </p>

              <p className="mt-2 text-3xl font-bold text-blue-700">
                {grandRegistered.toLocaleString()}
              </p>
            </div>

            <div className="rounded-xl border border-orange-100 bg-orange-50 p-4">
              <p className="text-sm text-slate-500">
                Total Issued
              </p>

              <p className="mt-2 text-3xl font-bold text-orange-600">
                {grandIssued.toLocaleString()}
              </p>
            </div>

            <div className="rounded-xl border border-green-100 bg-green-50 p-4">
              <p className="text-sm text-slate-500">
                Total Remaining
              </p>

              <p className="mt-2 text-3xl font-bold text-green-700">
                {grandRemaining.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="border-b border-slate-200 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                value={search}
                onChange={(event) => onSearch(event.target.value)}
                placeholder="Search accountable forms..."
                aria-label="Search accountable forms"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <select
                value={yearFilter}
                onChange={(event) =>
                  onYearFilter(event.target.value)
                }
                aria-label="Filter by fiscal year"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">All Fiscal Years</option>

                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Accountable Forms Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-10 text-center text-slate-500">
                Loading inventory...
              </div>
            ) : data.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 p-12 text-slate-500">
                <Package size={42} />
                <p>No inventory found.</p>
              </div>
            ) : (
              <table className="w-full min-w-[650px]">
                <thead className="bg-slate-50">
                  <tr className="text-left text-sm font-semibold text-slate-600">
                    <th className="px-5 py-3">Form Code</th>
                    <th className="px-5 py-3">Accountable Form</th>
                    <th className="px-5 py-3 text-center">
                      Total Registered
                    </th>
                    <th className="px-5 py-3 text-center">
                      Total Issued
                    </th>
                    <th className="px-5 py-3 text-center">
                      Total Remaining
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedData.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => onSelect(row)}
                      className="cursor-pointer border-t border-slate-100 transition hover:bg-blue-50"
                    >
                      <td className="px-5 py-4 font-semibold text-slate-800">
                        {row.form_code}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-700">
                        {row.form_name}
                      </td>

                      <td className="px-5 py-4 text-center font-semibold text-blue-700">
                        {Number(
                          row.total_registered || 0
                        ).toLocaleString()}
                      </td>

                      <td className="px-5 py-4 text-center font-semibold text-orange-600">
                        {Number(
                          row.total_issued || 0
                        ).toLocaleString()}
                      </td>

                      <td className="px-5 py-4 text-center font-semibold text-green-700">
                        {Number(
                          row.total_remaining || 0
                        ).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Pagination */}
            <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm text-slate-500">
                Showing{" "}
                {data.length === 0
                  ? 0
                  : (page - 1) * rowsPerPage + 1}
                {" - "}
                {Math.min(page * rowsPerPage, data.length)} of{" "}
                {data.length}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setPage((current) =>
                      Math.max(1, current - 1)
                    )
                  }
                  disabled={page === 1}
                  aria-label="Previous page"
                  className="rounded-lg border border-slate-300 p-2 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                </button>

                <span className="text-sm font-medium text-slate-700">
                  {page} / {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setPage((current) =>
                      Math.min(totalPages, current + 1)
                    )
                  }
                  disabled={page === totalPages}
                  aria-label="Next page"
                  className="rounded-lg border border-slate-300 p-2 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Report Modal */}
      <GenerateInventoryReportModal
        open={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        reportData={reportData}
        loading={reportLoading}
        onPeriodChange={onReportPeriodChange}
        onGenerate={handleGenerateReport}
      />
    </div>
  );
}
