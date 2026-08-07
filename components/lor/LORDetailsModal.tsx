"use client";

import {
  X,
  FileText,
  Receipt,
  User,
  Landmark,
  Calendar,
  Printer,
  BookOpen,
} from "lucide-react";

type Props = {
  open: boolean;
  selected: any;
  onClose: () => void;
};

export default function LORDetailsModal({

  open,
  selected,
  onClose,

}: Props) {

  if (!open || !selected)
    return null;

  const used = Math.max(
    0,
    Number(selected.current_or) -
      Number(selected.beginning_or)
  );

  const total =
    Number(selected.ending_or) -
      Number(selected.beginning_or) +
      1;

  const remaining =
    total - used;

  const percent =
    total > 0
      ? (used / total) * 100
      : 0;

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">

      <div className="flex max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* Header */}

        <div className="flex items-center justify-between border-b bg-slate-50 px-6 py-5">

          <div>

            <h2 className="text-2xl font-semibold text-slate-800">

              Letter of Receipt

            </h2>

            <p className="text-sm text-slate-500">

              Released Booklet Information

            </p>

          </div>

          <button

            onClick={onClose}

            className="rounded-lg p-2 hover:bg-slate-200"

          >

            <X />

          </button>

        </div>

        {/* Body */}

        <div className="grid flex-1 grid-cols-2 gap-6 overflow-y-auto p-6">

          {/* LEFT COLUMN */}

          <div className="space-y-6">

            {/* LOR */}

            <div className="rounded-xl border">

              <div className="flex items-center gap-2 border-b bg-slate-50 px-4 py-3">

                <FileText
                  size={18}
                  className="text-blue-600"
                />

                <span className="font-semibold">

                  LOR Information

                </span>

              </div>

              <div className="space-y-4 p-4">

                <div>

                  <div className="text-xs text-slate-500">

                    LOR Number

                  </div>

                  <div className="font-semibold text-blue-700">

                    {selected.lor_no}

                  </div>

                </div>

                <div>

                  <div className="text-xs text-slate-500">

                    Status

                  </div>

                  <span className="mt-1 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">

                    {selected.status}

                  </span>

                </div>

                <div>

                  <div className="text-xs text-slate-500">

                    Released Date

                  </div>

                  <div>

                    {

                      selected.released_at

                      ?

                      new Date(
                        selected.released_at
                      ).toLocaleString()

                      :

                      "-"

                    }

                  </div>

                </div>

                <div>

                  <div className="text-xs text-slate-500">

                    Released By

                  </div>

                  <div>

                    {selected.released_by}

                  </div>

                </div>

              </div>

            </div>

            {/* BOOKLET */}

            <div className="rounded-xl border">

              <div className="flex items-center gap-2 border-b bg-slate-50 px-4 py-3">

                <Receipt
                  size={18}
                  className="text-blue-600"
                />

                <span className="font-semibold">

                  Booklet Information

                </span>

              </div>

              <div className="grid grid-cols-2 gap-4 p-4">

                <div>

                  <div className="text-xs text-slate-500">

                    Form Code

                  </div>

                  <div className="font-medium">

                    {selected.form_code}

                  </div>

                </div>

                <div>

                  <div className="text-xs text-slate-500">

                    Form Name

                  </div>

                  <div>

                    {selected.form_name}

                  </div>

                </div>

                <div>

                  <div className="text-xs text-slate-500">

                    Control No.

                  </div>

                  <div>

                    {selected.control_no}

                  </div>

                </div>

                <div>

                  <div className="text-xs text-slate-500">

                    Coverage

                  </div>

                  <div>

                    {selected.beginning_or}

                    {" - "}

                    {selected.ending_or}

                  </div>

                </div>

                <div>

                  <div className="text-xs text-slate-500">

                    Current OR

                  </div>

                  <div className="font-semibold text-blue-700">

                    {selected.current_or}

                  </div>

                </div>

                <div>

                  <div className="text-xs text-slate-500">

                    Booklet Status

                  </div>

                  <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">

                    {selected.booklet_status}

                  </span>

                </div>

              </div>

            </div>

                        {/* Assignment */}

            <div className="rounded-xl border">

              <div className="flex items-center gap-2 border-b bg-slate-50 px-4 py-3">

                <User
                  size={18}
                  className="text-blue-600"
                />

                <span className="font-semibold">

                  Assignment Information

                </span>

              </div>

              <div className="grid grid-cols-2 gap-4 p-4">

                <div>

                  <div className="text-xs text-slate-500">

                    RAT Number

                  </div>

                  <div className="font-medium">

                    {selected.rat_no}

                  </div>

                </div>

                <div>

                  <div className="text-xs text-slate-500">

                    RIS Number

                  </div>

                  <div>

                    {selected.ris_no}

                  </div>

                </div>

                <div className="col-span-2">

                  <div className="text-xs text-slate-500">

                    Accountable Officer

                  </div>

                  <div className="font-medium">

                    {selected.accountable_officer}

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* RIGHT COLUMN */}

          <div className="space-y-6">

            {/* Fund */}

            <div className="rounded-xl border">

              <div className="flex items-center gap-2 border-b bg-slate-50 px-4 py-3">

                <Landmark
                  size={18}
                  className="text-blue-600"
                />

                <span className="font-semibold">

                  Fund Information

                </span>

              </div>

              <div className="space-y-4 p-4">

                <div>

                  <div className="text-xs text-slate-500">

                    Fund Code

                  </div>

                  <div className="font-semibold">

                    {selected.fund_code}

                  </div>

                </div>

                <div>

                  <div className="text-xs text-slate-500">

                    Fund Name

                  </div>

                  <div>

                    {selected.fund_name}

                  </div>

                </div>

              </div>

            </div>

            {/* Receipt Usage */}

            <div className="rounded-xl border">

              <div className="flex items-center gap-2 border-b bg-slate-50 px-4 py-3">

                <Calendar
                  size={18}
                  className="text-blue-600"
                />

                <span className="font-semibold">

                  Receipt Usage

                </span>

              </div>

              <div className="space-y-4 p-4">

                <div className="flex justify-between text-sm">

                  <span>

                    Used

                  </span>

                  <span className="font-semibold">

                    {used} / {total}

                  </span>

                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-200">

                  <div

                    className="h-full rounded-full bg-blue-600 transition-all"

                    style={{
                      width: `${percent}%`,
                    }}

                  />

                </div>

                <div className="grid grid-cols-2 gap-4">

                  <div>

                    <div className="text-xs text-slate-500">

                      Used

                    </div>

                    <div className="font-semibold text-red-600">

                      {used}

                    </div>

                  </div>

                  <div>

                    <div className="text-xs text-slate-500">

                      Remaining

                    </div>

                    <div className="font-semibold text-green-600">

                      {remaining}

                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* Remarks */}

            <div className="rounded-xl border">

              <div className="flex items-center gap-2 border-b bg-slate-50 px-4 py-3">

                <BookOpen
                  size={18}
                  className="text-blue-600"
                />

                <span className="font-semibold">

                  Remarks

                </span>

              </div>

              <div className="p-4 text-sm text-slate-700">

                {

                  selected.remarks ||

                  "No remarks provided."

                }

              </div>

            </div>

          </div>

        </div>

        {/* Footer */}

        <div className="flex items-center justify-end gap-3 border-t bg-slate-50 px-6 py-4">

          <button

            className="inline-flex items-center gap-2 rounded-lg border px-5 py-2 hover:bg-slate-100"

          >

            <Printer size={18} />

            Print LOR

          </button>

          <button

            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"

          >

            <BookOpen size={18} />

            View Transactions

          </button>

          <button

            onClick={onClose}

            className="rounded-lg border px-5 py-2 hover:bg-slate-100"

          >

            Close

          </button>

        </div>

      </div>

    </div>

  );

}