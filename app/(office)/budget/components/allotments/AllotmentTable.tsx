
"use client";

import { Eye, MoreHorizontal } from "lucide-react";

export interface Allotment {
  id: number;
  allotment_no: string;
  allotment_date: string;
  fiscal_year: number;
  office: string;
  fund_source: string;
  account_code: string;
  account_name: string;
  allotment_type: string;
  amount: number;
  obligated_amount: number;
  status: string;
  remarks: string;
}

interface Props {
  records: Allotment[];
  onView: (record: Allotment) => void;
}

const currency = (amount: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount);

export default function AllotmentTable({ records, onView }: Props) {
  const statusStyle = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-emerald-50 text-emerald-700";
      case "Pending":
        return "bg-amber-50 text-amber-700";
      case "Cancelled":
        return "bg-red-50 text-red-700";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="mb-3 rounded-full bg-slate-100 p-4 text-slate-400">
          <MoreHorizontal size={25} />
        </div>
        <p className="text-sm font-medium text-slate-600">
          No allotment records found
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Try changing your search or filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[1050px] border-collapse text-left text-sm">
        <thead className="bg-[#F3F6F8] text-[11px] uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3 font-semibold">Allotment No.</th>
            <th className="px-4 py-3 font-semibold">Date</th>
            <th className="px-4 py-3 font-semibold">Office</th>
            <th className="px-4 py-3 font-semibold">Fund Source</th>
            <th className="px-4 py-3 font-semibold">Expense Account</th>
            <th className="px-4 py-3 text-right font-semibold">Allotment</th>
            <th className="px-4 py-3 text-right font-semibold">Obligated</th>
            <th className="px-4 py-3 text-right font-semibold">Balance</th>
            <th className="px-4 py-3 text-center font-semibold">Status</th>
            <th className="px-4 py-3 text-center font-semibold">Action</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {records.map((record) => {
            const balance = record.amount - record.obligated_amount;

            return (
              <tr
                key={record.id}
                className="transition hover:bg-[#F8FAFC]"
              >
                <td className="px-4 py-3">
                  <button
                    onClick={() => onView(record)}
                    className="font-semibold text-[#6689A5] hover:underline"
                  >
                    {record.allotment_no}
                  </button>
                  <p className="mt-1 text-[10px] text-slate-400">
                    {record.allotment_type}
                  </p>
                </td>

                <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-600">
                  {new Date(record.allotment_date + "T00:00:00").toLocaleDateString(
                    "en-PH",
                    {
                      month: "short",
                      day: "2-digit",
                      year: "numeric",
                    }
                  )}
                </td>

                <td className="max-w-[180px] px-4 py-3 text-xs text-slate-700">
                  {record.office}
                </td>

                <td className="px-4 py-3 text-xs text-slate-600">
                  {record.fund_source}
                </td>

                <td className="px-4 py-3">
                  <p className="text-xs font-medium text-slate-700">
                    {record.account_code}
                  </p>
                  <p className="mt-1 max-w-[160px] truncate text-[10px] text-slate-400">
                    {record.account_name}
                  </p>
                </td>

                <td className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold text-slate-700">
                  {currency(record.amount)}
                </td>

                <td className="whitespace-nowrap px-4 py-3 text-right text-xs text-slate-600">
                  {currency(record.obligated_amount)}
                </td>

                <td className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold text-slate-700">
                  {currency(balance)}
                </td>

                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusStyle(
                      record.status
                    )}`}
                  >
                    {record.status}
                  </span>
                </td>

                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => onView(record)}
                    title="View allotment"
                    className="rounded-md border border-slate-200 p-1.5 text-slate-500 hover:border-[#829FB5] hover:bg-[#EAF1F6] hover:text-[#557992]"
                  >
                    <Eye size={15} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
