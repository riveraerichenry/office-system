
"use client";

import { X, Receipt, CalendarDays, User, FileText } from "lucide-react";

export type DVDetailItem = {
  id: string;
  obr_id: string;
  obr_no: string;
  account_code?: string;
  particulars?: string;
  amount: number | string;
};

export type DVDetailRecord = {
  id: string;
  dv_no: string;
  dv_date: string;
  payee: string;
  payor?: string;
  particulars?: string;
  grand_total: number | string;
  status?: string;
  created_at?: string;
  items: DVDetailItem[];
};

type Props = {
  data: DVDetailRecord;
  onClose: () => void;
};

const peso = (value: number | string) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(Number(value || 0));

const dateFormat = (value?: string) => {
  if (!value) return "—";

  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);

  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);

  return date.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function DVDetailsModal({ data, onClose }: Props) {
  const items = Array.isArray(data.items) ? data.items : [];

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-2 backdrop-blur-[2px] sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-slate-200 bg-[#F8FAFC] shadow-2xl">

        {/* HEADER */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#C7D8E3] bg-[#D6E5EF] px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#83A8C5] text-white">
              <Receipt size={21} />
            </div>

            <div>
              <h2 className="text-base font-semibold text-slate-800">
                Disbursement Voucher Details
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Voucher No. {data.dv_no}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-slate-500 hover:bg-white/70 hover:text-slate-800"
            title="Close"
          >
            <X size={19} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">

          {/* STATUS */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Voucher Information
            </span>

            <span className="rounded-md bg-slate-100 px-3 py-1.5 text-[10px] font-bold uppercase text-slate-600">
              {data.status || "DRAFT"}
            </span>
          </div>

          {/* DETAILS */}
          <section className="grid grid-cols-1 gap-4 rounded-md border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-3">

            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase text-slate-400">
                DV Number
              </label>
              <p className="text-sm font-semibold text-slate-800">
                {data.dv_no || "—"}
              </p>
            </div>

            <div>
              <label className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase text-slate-400">
                <CalendarDays size={12} />
                DV Date
              </label>
              <p className="text-sm text-slate-700">
                {dateFormat(data.dv_date)}
              </p>
            </div>

            <div>
              <label className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase text-slate-400">
                <User size={12} />
                Payee
              </label>
              <p className="text-sm font-medium text-slate-700">
                {data.payee || "—"}
              </p>
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="mb-1 block text-[10px] font-semibold uppercase text-slate-400">
                Payor
              </label>
              <p className="text-sm text-slate-700">
                {data.payor || "Municipality of Taytay, Palawan"}
              </p>
            </div>
          </section>

          {/* PARTICULARS */}
          <section className="rounded-md border border-slate-200 bg-white p-4">
            <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold text-[#557992]">
              <FileText size={15} />
              Particulars
            </h3>

            <div className="whitespace-pre-line text-xs leading-6 text-slate-700">
              {data.particulars || "No particulars recorded."}
            </div>
          </section>

          {/* OBR ITEMS */}
          <section>
            <div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-sm font-semibold text-[#557992]">
                Attached OBRs
              </h3>

              <span className="rounded-full bg-[#EDF3F7] px-2.5 py-1 text-[10px] font-semibold text-[#557992]">
                {items.length} OBR(s)
              </span>
            </div>

            <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
              <table className="w-full min-w-[650px] text-left">
                <thead className="bg-[#EDF3F7] text-[10px] font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-3">#</th>
                    <th className="px-3 py-3">OBR Number</th>
                    <th className="px-3 py-3">Account Code</th>
                    <th className="px-3 py-3">Particulars</th>
                    <th className="px-3 py-3 text-right">Amount</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {items.length > 0 ? (
                    items.map((item, index) => (
                      <tr key={item.id || item.obr_id}>
                        <td className="px-3 py-3 text-xs text-slate-400">
                          {index + 1}
                        </td>

                        <td className="px-3 py-3 text-xs font-semibold text-slate-700">
                          {item.obr_no || "—"}
                        </td>

                        <td className="px-3 py-3 text-xs text-slate-600">
                          {item.account_code || "—"}
                        </td>

                        <td className="px-3 py-3 text-xs text-slate-600">
                          {item.particulars || "—"}
                        </td>

                        <td className="px-3 py-3 text-right text-xs font-semibold tabular-nums text-slate-700">
                          {peso(item.amount)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-8 text-center text-xs text-slate-400"
                      >
                        No OBR items found.
                      </td>
                    </tr>
                  )}
                </tbody>

                {items.length > 0 && (
                  <tfoot className="border-t border-slate-200 bg-slate-50">
                    <tr>
                      <td
                        colSpan={4}
                        className="px-3 py-3 text-right text-xs font-bold uppercase text-slate-600"
                      >
                        Total
                      </td>
                      <td className="px-3 py-3 text-right text-sm font-bold text-[#557992]">
                        {peso(data.grand_total)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </section>

          {/* TOTAL CARD */}
          <section className="flex items-center justify-between rounded-md border border-[#D5E3EC] bg-[#EDF3F7] p-4">
            <div>
              <p className="text-[10px] font-semibold uppercase text-[#557992]">
                Grand Total
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Total amount of all attached OBRs
              </p>
            </div>

            <p className="text-xl font-bold tabular-nums text-[#557992] sm:text-2xl">
              {peso(data.grand_total)}
            </p>
          </section>

          <p className="text-[10px] text-slate-400">
            This voucher record does not indicate that a check has been issued.
          </p>
        </div>

        {/* FOOTER */}
        <footer className="flex shrink-0 justify-end border-t border-slate-200 bg-white px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-300 bg-white px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}
