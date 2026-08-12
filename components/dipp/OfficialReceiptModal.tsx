"use client";

import { X, Printer } from "lucide-react";

import GeneralItemsTable from "./GeneralItemsTable";
import RPTItemsTable from "./RPTItemsTable";
import Swal from "sweetalert2";

type Header = {
  id: string;
  or_number: string;
  receipt_date: string;
  payor: string;
  payment_mode: string;
  form_code: string;
  encoded_by: string;
  grand_total: number;

  collector?: string;

  remarks?: string;
  status?: string;

  booklet_number?: string;
  fiscal_year?: string;
  series?: string;
  beginning_or?: string;
  ending_or?: string;
  current_or?: string;
  receipt_count?: number;
  received_date?: string;
  issued_date?: string;
};

type GeneralItem = {
  account_code: string;
  account_name: string;
  amount: number;
};

type RPTItem = {
  td_number: string;
  coverage: string;

  assessed_value: number;

  basic: number;
  sef: number;

  penalty: number;
  discount: number;

  amount: number;
};

type Props = {
  open: boolean;
  loading: boolean;

  header: Header | null;

  items: GeneralItem[] | RPTItem[];

  onClose: () => void;
};



export default function OfficialReceiptDetailsModal({
  open,
  loading,
  header,
  items,
  onClose,
}: Props) {
  if (!open) return null;

  const isRPT =
    header?.form_code === "AF56";

  const generalItems =
    items as GeneralItem[];

  const rptItems =
    items as RPTItem[];



  const handlePrint = () => {
  if (!header?.id) {
    Swal.fire({
      icon: "error",
      title: "Unable to Print",
      text: "Transaction ID is missing.",
    });

    return;
  }

  window.open(
    `/print/dipp/receipt/${header.id}`,
    "_blank",
    "width=420,height=850"
  );
};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">

      <div className="flex h-[90vh] w-full max-w-7xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">

        {/* ==========================================================
            Corporate Header
        =========================================================== */}

        <div className="border-b border-slate-200 bg-slate-900">

          <div className="flex items-center justify-between px-6 py-4">

            <div>

              <h2 className="text-lg font-semibold tracking-wide text-white">
                Official Receipt Details
              </h2>

              <p className="mt-1 text-xs text-slate-300">
                Complete Official Receipt Transaction Information
              </p>

            </div>

            <div className="flex items-center gap-2">

              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                <Printer size={16} className="mr-2" />
                Print
              </button>

              <button
                onClick={onClose}
                className="rounded-md p-2 text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                <X size={20} />
              </button>

            </div>

          </div>

        </div>

        {/* ==========================================================
            Body
        =========================================================== */}

        <div className="flex-1 overflow-y-auto bg-slate-50 p-5">

          {loading && (

            <div className="flex h-full items-center justify-center">

              <div className="rounded-lg border bg-white px-8 py-6 text-sm text-slate-500 shadow-sm">
                Loading transaction details...
              </div>

            </div>

          )}

          {!loading && header && (

            <>

              {/* ==========================================================
                  Summary Cards
              =========================================================== */}

              <div className="grid grid-cols-4 gap-4">

                <div className="rounded-lg border bg-white p-4 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    OR Number
                  </p>

                  <p className="mt-1 text-lg font-bold text-slate-900">
                    {header.or_number}
                  </p>
                </div>

                <div className="rounded-lg border bg-white p-4 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Receipt Date
                  </p>

                  <p className="mt-1 font-medium text-slate-900">
                    {new Date(header.receipt_date).toLocaleDateString(
                      "en-PH",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>

                <div className="rounded-lg border bg-white p-4 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Grand Total
                  </p>

                  <p className="mt-1 text-xl font-bold text-blue-700">
                    {Number(header.grand_total).toLocaleString(
                      "en-PH",
                      {
                        style: "currency",
                        currency: "PHP",
                      }
                    )}
                  </p>
                </div>

                <div className="rounded-lg border bg-white p-4 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </p>

                  <span
                    className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      header.status === "Posted"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {header.status || "Posted"}
                  </span>
                </div>

              </div>
                            {/* ==========================================================
                  Transaction Details
              =========================================================== */}

              <div className="mt-5 rounded-xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-200 px-5 py-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                    Transaction Details
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-x-10 gap-y-3 p-5 text-sm">

                  <div className="grid grid-cols-[150px_1fr] items-center">
                    <span className="font-medium text-slate-500">
                      Payor
                    </span>
                    <span className="font-semibold text-slate-900">
                      {header.payor}
                    </span>
                  </div>

                  <div className="grid grid-cols-[150px_1fr] items-center">
                    <span className="font-medium text-slate-500">
                      Collector
                    </span>
                    <span className="font-semibold text-slate-900">
                      {header.collector || "-"}
                    </span>
                  </div>

                  <div className="grid grid-cols-[150px_1fr] items-center">
                    <span className="font-medium text-slate-500">
                      Payment Mode
                    </span>
                    <span className="font-semibold text-slate-900">
                      {header.payment_mode}
                    </span>
                  </div>

                  <div className="grid grid-cols-[150px_1fr] items-center">
                    <span className="font-medium text-slate-500">
                      Accountable Form
                    </span>
                    <span className="font-semibold text-slate-900">
                      {header.form_code}
                    </span>
                  </div>

                  <div className="grid grid-cols-[150px_1fr] items-center">
                    <span className="font-medium text-slate-500">
                      Encoded By
                    </span>
                    <span className="font-semibold text-slate-900">
                      {header.encoded_by}
                    </span>
                  </div>

                  <div className="grid grid-cols-[150px_1fr] items-center">
                    <span className="font-medium text-slate-500">
                      Status
                    </span>

                    <span
                      className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${
                        header.status === "Posted"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {header.status || "Posted"}
                    </span>
                  </div>

                  <div className="col-span-2 grid grid-cols-[150px_1fr] items-start">
                    <span className="pt-1 font-medium text-slate-500">
                      Remarks
                    </span>

                    <span className="text-slate-900">
                      {header.remarks || "-"}
                    </span>
                  </div>

                </div>

              </div>

              {/* ==========================================================
                  Booklet Information
              =========================================================== */}

              <div className="mt-5 rounded-xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-200 px-5 py-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                    Accountable Form Information
                  </h3>
                </div>

                <div className="overflow-x-auto">

                  <table className="w-full text-sm">

                    <thead className="border-b bg-slate-100">

                      <tr>

                        <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase text-slate-600">
                            Accountable Form
                        </th>

                        <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase text-slate-600">
                            Booklet
                        </th>

                        <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase text-slate-600">
                          Fiscal Year
                        </th>

                        <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase text-slate-600">
                          Series
                        </th>

                        <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase text-slate-600">
                          OR Range
                        </th>

                        <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase text-slate-600">
                          OR Number
                        </th>

                        <th className="px-4 py-2 text-center text-[11px] font-semibold uppercase text-slate-600">
                          Receipts
                        </th>

                        <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase text-slate-600">
                          Issued
                        </th>

                        <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase text-slate-600">
                          Received
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      <tr className="border-b hover:bg-slate-50">

                        <td className="px-4 py-3">

                            <div className="flex flex-col">

                                <span className="font-semibold">

                                    {header.form_code}

                                </span>

                                <span className="text-xs text-slate-500">

                                    {

                                        header.form_code === "AF56"

                                            ? "Real Property Tax"

                                            : header.form_code === "CTC-I"

                                            ? "Community Tax Certificate - Individual"

                                            : header.form_code === "CTC-C"

                                            ? "Community Tax Certificate - Corporation"

                                            : "General Official Receipt"

                                    }

                                </span>

                            </div>

                        </td>

                        <td className="px-4 py-3 font-semibold">

                            {header.booklet_number || "-"}

                        </td>

                        <td className="px-4 py-3">
                          {header.fiscal_year || "-"}
                        </td>

                        <td className="px-4 py-3">
                          {header.series || "-"}
                        </td>

                        <td className="px-4 py-3">
                          {header.beginning_or} - {header.ending_or}
                        </td>

                        <td className="px-4 py-3 font-semibold text-blue-700">
                          {header.current_or || "-"}
                        </td>

                        <td className="px-4 py-3 text-center">
                          {header.receipt_count ?? "-"}
                        </td>

                        <td className="px-4 py-3">
                          {header.issued_date
                            ? new Date(header.issued_date).toLocaleDateString(
                                "en-PH"
                              )
                            : "-"}
                        </td>

                        <td className="px-4 py-3">
                          {header.received_date
                            ? new Date(header.received_date).toLocaleDateString(
                                "en-PH"
                              )
                            : "-"}
                        </td>

                      </tr>

                    </tbody>

                  </table>

                </div>

              </div>
                           {/* ==========================================================
                              Transaction Items
                          ========================================================== */}

                          {header && (
                            header.form_code === "AF56" ? (
                              <RPTItemsTable
                                items={rptItems}
                                grandTotal={header.grand_total}
                              />
                            ) : (
                              <GeneralItemsTable
                                items={generalItems}
                                grandTotal={header.grand_total}
                              />
                            )
                          )}

                            {/* ==========================================================
                  Footer Summary
              =========================================================== */}

              <div className="mt-5 rounded-xl border border-slate-200 bg-white shadow-sm">

                <div className="flex items-center justify-between px-6 py-4">

                  <div className="flex items-center gap-10">

                    <div>

                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Transaction Status
                      </p>

                      <span
                        className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          header.status === "Posted"
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {header.status || "Posted"}
                      </span>

                    </div>

                    <div>

                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Total Items
                      </p>

                      <p className="mt-1 text-lg font-bold text-slate-900">
                        {items.length}
                      </p>

                    </div>

                  </div>

                  <div className="text-right">

                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Grand Total
                    </p>

                    <p className="mt-1 text-2xl font-bold text-blue-700">

                      {Number(header.grand_total).toLocaleString(
                        "en-PH",
                        {
                          style: "currency",
                          currency: "PHP",
                        }
                      )}

                    </p>

                  </div>

                </div>

              </div>

            </>

          )}

          {!loading && !header && (

            <div className="flex h-full items-center justify-center">

              <div className="rounded-xl border border-slate-200 bg-white px-10 py-10 text-center shadow-sm">

                <h3 className="text-lg font-semibold text-slate-800">
                  Transaction Not Found
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  No official receipt information is available for the selected
                  transaction.
                </p>

              </div>

            </div>

          )}

        </div>

      </div>

    </div>

  );
}