
"use client";

import { Fragment } from "react";

export type InventoryReportRow = {
  id: string;
  form_code: string;

  beginning_quantity: number;
  beginning_from: string | null;
  beginning_to: string | null;

  receipts_quantity: number;
  receipts_from: string | null;
  receipts_to: string | null;

  issued_quantity: number;
  issued_from: string | null;
  issued_to: string | null;

  ending_quantity: number;
  ending_from: string | null;
  ending_to: string | null;
};

type Props = {
  reportData: InventoryReportRow[];
  month: number;
  year: number;
  loading?: boolean;
};

const MONTHS = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
];

function displayValue(value: string | null) {
  return value ?? "—";
}

export default function InventoryReportPreview({
  reportData,
  month,
  year,
  loading = false,
}: Props) {
  const sections = [
    { key: "beginning", label: "Beginning Balance" },
    { key: "receipts", label: "Receipts" },
    { key: "issued", label: "Issued" },
    { key: "ending", label: "Ending Balance" },
  ] as const;

  return (
    <>
      <style jsx global>{`
        @page {
          size: legal landscape;
          margin: 0.35in;
        }

        @media print {
          body * {
            visibility: hidden !important;
          }

          #inventory-report-print,
          #inventory-report-print * {
            visibility: visible !important;
          }

          #inventory-report-print {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            overflow: visible !important;
          }

          .inventory-report-table {
            width: 100% !important;
            border-collapse: collapse !important;
            font-size: 9px !important;
          }

          .inventory-report-table th,
          .inventory-report-table td {
            border: 1px solid #000 !important;
            padding: 4px 5px !important;
            color: #000 !important;
            background: #fff !important;
          }

          .inventory-report-table tr {
            break-inside: avoid;
          }
        }
      `}</style>

      <div
        id="inventory-report-print"
        className="min-w-[1050px] bg-white p-6 text-slate-900 sm:p-8"
      >
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold uppercase">
            Republic of the Philippines
          </p>
          <p className="text-sm font-semibold uppercase">
            Municipality of Taytay, Palawan
          </p>
          <p className="mt-4 text-base font-bold uppercase">
            Consolidated Report of Accountability for Accountable Forms
          </p>
          <p className="mt-1 text-sm">
            For {MONTHS[month - 1]} {year}
          </p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500">
            Loading consolidated inventory report...
          </div>
        ) : (
          <table className="inventory-report-table w-full border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100">
                <th
                  rowSpan={2}
                  className="border border-slate-500 px-2 py-3 text-left"
                >
                  Accountable Form
                </th>

                {sections.map((section) => (
                  <th
                    key={section.key}
                    colSpan={3}
                    className="border border-slate-500 px-2 py-2 text-center"
                  >
                    {section.label}
                  </th>
                ))}
              </tr>

              <tr className="bg-slate-50">
                {sections.map((section) => (
                  <Fragment key={section.key}>
                    <th className="border border-slate-500 px-2 py-2 text-center">
                      Qty
                    </th>
                    <th className="border border-slate-500 px-2 py-2 text-center">
                      From OR
                    </th>
                    <th className="border border-slate-500 px-2 py-2 text-center">
                      To OR
                    </th>
                  </Fragment>
                ))}
              </tr>
            </thead>

            <tbody>
              {reportData.length === 0 ? (
                <tr>
                  <td
                    colSpan={13}
                    className="border border-slate-500 px-4 py-8 text-center"
                  >
                    No inventory records found for this reporting period.
                  </td>
                </tr>
              ) : (
                reportData.map((row) => (
                  <tr key={row.id}>
                    <td className="border border-slate-500 px-2 py-2 font-semibold">
                      {row.form_code}
                    </td>

                    <td className="border border-slate-500 px-2 py-2 text-right">
                      {row.beginning_quantity}
                    </td>
                    <td className="border border-slate-500 px-2 py-2 text-center">
                      {displayValue(row.beginning_from)}
                    </td>
                    <td className="border border-slate-500 px-2 py-2 text-center">
                      {displayValue(row.beginning_to)}
                    </td>

                    <td className="border border-slate-500 px-2 py-2 text-right">
                      {row.receipts_quantity}
                    </td>
                    <td className="border border-slate-500 px-2 py-2 text-center">
                      {displayValue(row.receipts_from)}
                    </td>
                    <td className="border border-slate-500 px-2 py-2 text-center">
                      {displayValue(row.receipts_to)}
                    </td>

                    <td className="border border-slate-500 px-2 py-2 text-right">
                      {row.issued_quantity}
                    </td>
                    <td className="border border-slate-500 px-2 py-2 text-center">
                      {displayValue(row.issued_from)}
                    </td>
                    <td className="border border-slate-500 px-2 py-2 text-center">
                      {displayValue(row.issued_to)}
                    </td>

                    <td className="border border-slate-500 px-2 py-2 text-right">
                      {row.ending_quantity}
                    </td>
                    <td className="border border-slate-500 px-2 py-2 text-center">
                      {displayValue(row.ending_from)}
                    </td>
                    <td className="border border-slate-500 px-2 py-2 text-center">
                      {displayValue(row.ending_to)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        <div className="mt-12 grid grid-cols-3 gap-8 text-center text-xs">
          <div className="text-left">
            <div className="mb-1 pb-1 font-semibold">
              CERTIFICATION:
            </div>
            <p>
              I hereby certify the foregoing is a true statement of all accountable
              forms received, issued and transferred by me during the period
              above-stated and the correctness of the beginning balance
            </p>
          </div>

          <div>
            <div className="mb-1 border-b border-black pb-1 font-semibold">
              IMLYN B. PARAPINA
            </div>
            <p>Accountable Officer</p>
          </div>

          <div>
            <div className="mb-1 pb-1 font-semibold">
              {new Date().toLocaleDateString("en-PH", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
