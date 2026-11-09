
"use client";

import {
  X,
  Printer,
  FileText,
  CalendarDays,
  Building2,
  Wallet,
} from "lucide-react";

import type { Allotment } from "./AllotmentTable";

interface Props {
  record: Allotment;
  onClose: () => void;
}

const currency = (amount: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(amount);

export default function AllotmentDetailsModal({
  record,
  onClose,
}: Props) {
  const balance = record.amount - record.obligated_amount;

  const statusClass =
    record.status === "Approved"
      ? "bg-emerald-50 text-emerald-700"
      : record.status === "Pending"
        ? "bg-amber-50 text-amber-700"
        : "bg-slate-100 text-slate-600";

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 p-3 md:p-6">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#DCE3E9] bg-[#EAF1F6] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-white p-2 text-[#6689A5]">
              <FileText size={20} />
            </div>

            <div>
              <h2 className="text-base font-semibold text-slate-800">
                Allotment Details
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {record.allotment_no}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-md p-2 text-slate-500 hover:bg-white"
          >
            <X size={19} />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {/* REFERENCE INFORMATION */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs text-slate-500">Allotment Reference</p>
              <h3 className="mt-1 text-xl font-bold text-slate-800">
                {record.allotment_no}
              </h3>
            </div>

            <span
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusClass}`}
            >
              {record.status}
            </span>
          </div>

          {/* AMOUNTS */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-md border border-slate-200 p-4">
              <p className="text-xs text-slate-500">Total Allotment</p>
              <p className="mt-2 text-lg font-semibold text-slate-800">
                {currency(record.amount)}
              </p>
            </div>

            <div className="rounded-md border border-slate-200 p-4">
              <p className="text-xs text-slate-500">Obligated Amount</p>
              <p className="mt-2 text-lg font-semibold text-slate-800">
                {currency(record.obligated_amount)}
              </p>
            </div>

            <div className="rounded-md border border-slate-200 bg-[#F4F8FA] p-4">
              <p className="text-xs text-slate-500">Available Balance</p>
              <p className="mt-2 text-lg font-semibold text-[#557992]">
                {currency(balance)}
              </p>
            </div>
          </div>

          {/* DETAILS */}
          <section>
            <h3 className="mb-3 border-b border-slate-100 pb-2 text-sm font-semibold text-slate-700">
              General Information
            </h3>

            <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-400">Allotment Date</p>
                <p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <CalendarDays size={15} className="text-slate-400" />
                  {record.allotment_date}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Fiscal Year</p>
                <p className="mt-1 text-sm font-medium text-slate-700">
                  {record.fiscal_year}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Office / Department</p>
                <p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Building2 size={15} className="text-slate-400" />
                  {record.office}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Fund Source</p>
                <p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Wallet size={15} className="text-slate-400" />
                  {record.fund_source}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Allotment Type</p>
                <p className="mt-1 text-sm font-medium text-slate-700">
                  {record.allotment_type}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Expense Account</p>
                <p className="mt-1 text-sm font-medium text-slate-700">
                  {record.account_code}
                </p>
                <p className="text-xs text-slate-500">
                  {record.account_name}
                </p>
              </div>
            </div>
          </section>

          {/* REMARKS */}
          <section>
            <h3 className="mb-2 border-b border-slate-100 pb-2 text-sm font-semibold text-slate-700">
              Remarks
            </h3>

            <p className="text-sm text-slate-600">
              {record.remarks || "No remarks provided."}
            </p>
          </section>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 bg-[#F8FAFC] px-5 py-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <Printer size={15} />
            Print
          </button>

          <button
            onClick={onClose}
            className="rounded-md bg-[#6689A5] px-5 py-2 text-sm font-semibold text-white hover:bg-[#557992]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
