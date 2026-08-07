"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  X,
  FileText,
  Calendar,
  User,
  CheckCircle2,
  ClipboardList,
} from "lucide-react";

type Props = {
  open: boolean;
  risId: string | null;
  onClose: () => void;
};

export default function RISDetailsModal({
  open,
  risId,
  onClose,
}: Props) {

  const [loading, setLoading] =
    useState(false);

  const [header, setHeader] =
    useState<any>(null);

  const [items, setItems] =
    useState<any[]>([]);

  useEffect(() => {

    if (!open || !risId) return;

    loadDetails();

  }, [open, risId]);

  async function loadDetails() {

    try {

      setLoading(true);

      const res =
        await axios.get(`/api/ris/approval/${risId}`);

      setHeader(res.data.data);

      setItems(
        res.data.data.items ?? []
        );


    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);

    }

  }

  if (!open) return null;

  function badge(status: string) {

    switch (
      status?.toUpperCase()
    ) {

      case "APPROVED":
        return "bg-green-100 text-green-700";

      case "ISSUED":
        return "bg-blue-100 text-blue-700";

      case "RETURNED":
        return "bg-orange-100 text-orange-700";

      case "REJECTED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-yellow-100 text-yellow-700";

    }

  }

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

      <div className="w-full max-w-6xl overflow-hidden rounded-xl bg-white shadow-2xl">

        {/* Header */}

        <div className="flex items-center justify-between border-b bg-slate-50 px-6 py-4">

          <div>

            <h2 className="text-2xl font-bold text-slate-800">

              RIS Details

            </h2>

            <p className="text-sm text-slate-500">

              Requisition and Issue Slip

            </p>

          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-slate-200"
          >

            <X size={22} />

          </button>

        </div>

        {loading ? (

          <div className="p-16 text-center">

            Loading...

          </div>

        ) : (

          <div className="space-y-6 p-6">
                        {/* Information */}

            {/* General Information */}

            <div className="rounded-xl border">

            <div className="border-b bg-slate-50 px-5 py-3">

                <div className="flex items-center gap-2 font-semibold text-slate-700">

                <FileText size={18} />

                General Information

                </div>

            </div>

            <div className="grid grid-cols-2 gap-x-10 gap-y-4 p-5">

                <div>

                <div className="text-xs uppercase tracking-wide text-slate-500">
                    RIS Number
                </div>

                <div className="font-semibold text-slate-800">
                    {header?.ris_no}
                </div>

                </div>

                <div>

                <div className="text-xs uppercase tracking-wide text-slate-500">
                    Status
                </div>

                <span
                    className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badge(
                    header?.status
                    )}`}
                >
                    {header?.status}
                </span>

                </div>

                <div>

                <div className="text-xs uppercase tracking-wide text-slate-500">
                    Request Date
                </div>

                <div className="font-medium">

                    {header?.request_date
                    ? new Date(
                        header.request_date
                        ).toLocaleDateString()
                    : "-"}

                </div>

                </div>

                <div>

                <div className="text-xs uppercase tracking-wide text-slate-500">
                    Approved Date
                </div>

                <div className="font-medium">

                    {header?.approved_date
                    ? new Date(
                        header.approved_date
                        ).toLocaleDateString()
                    : "-"}

                </div>

                </div>

                <div>

                <div className="text-xs uppercase tracking-wide text-slate-500">
                    Requested By
                </div>

                <div className="font-medium">
                    {header?.requested_by}
                </div>

                </div>

                <div>

                <div className="text-xs uppercase tracking-wide text-slate-500">
                    Approved By
                </div>

                <div className="font-medium">
                    {header?.approved_by ?? "-"}
                </div>

                </div>

            </div>

            <div className="border-t bg-slate-50 px-5 py-3">

                <div className="text-xs uppercase tracking-wide text-slate-500">

                Remarks

                </div>

                <div className="mt-2 min-h-[70px] rounded-lg border bg-white p-3 text-sm">

                {header?.remarks || "No remarks."}

                </div>

            </div>

            </div>
                        {/* Requested Items */}

            <div className="rounded-xl border">

              <div className="border-b bg-slate-50 px-4 py-3">

                <div className="flex items-center gap-2 font-semibold text-slate-700">

                  <ClipboardList size={18} />

                  Requested Accountable Forms

                </div>

              </div>

              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead className="bg-slate-100">

                    <tr className="text-left text-sm font-semibold text-slate-700">

                      <th className="w-16 px-4 py-3">
                        #
                      </th>

                      <th className="px-4 py-3">
                        Form Code
                      </th>

                      <th className="px-4 py-3">
                        Accountable Form
                      </th>

                      <th className="w-32 px-4 py-3 text-center">
                        Quantity
                      </th>

                      <th className="px-4 py-3">
                        Remarks
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {items.length === 0 ? (

                      <tr>

                        <td
                          colSpan={5}
                          className="py-12 text-center text-slate-500"
                        >

                          No items found.

                        </td>

                      </tr>

                    ) : (

                      items.map(
                        (
                          item,
                          index
                        ) => (

                          <tr
                            key={item.id}
                            className="border-b hover:bg-slate-50"
                          >

                            <td className="px-4 py-3">

                              {index + 1}

                            </td>

                            <td className="px-4 py-3 font-semibold text-blue-700">

                              {item.form_code}

                            </td>

                            <td className="px-4 py-3">

                              {item.form_name}

                            </td>

                            <td className="px-4 py-3 text-center font-semibold">

                              {item.quantity}

                            </td>

                            <td className="px-4 py-3">

                              {item.remarks || "-"}

                            </td>

                          </tr>

                        )

                      )

                    )}

                  </tbody>

                </table>

              </div>

            </div>

            {/* Footer */}

            <div className="flex items-center justify-end gap-3 border-t pt-5">

              <button
                className="rounded-lg border border-slate-300 px-5 py-2 font-medium transition hover:bg-slate-100"
                onClick={onClose}
              >
                Close
              </button>

              <button
                onClick={() => window.print()}
                className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white transition hover:bg-blue-700"
              >
                Print RIS
              </button>

            </div>

          </div>

        )}

      </div>

    </div>

  );
}