
"use client";

import {
  Trash2,
  Building2,
  FolderOpen,
  Wallet,
} from "lucide-react";

import type { DVItem } from "./types";

type Props = {
  items: DVItem[];
  onChange: (items: DVItem[]) => void;
};

const peso = (value: number | string) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(Number(value || 0));

export default function DVItems({
  items,
  onChange,
}: Props) {
  const totalOBRAmount = items.reduce(
    (total, item) =>
      total + (Number(item.obligation_amount) || 0),
    0
  );

  return (
    <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
      <table className="w-full min-w-[1050px] text-left">
        <thead className="bg-[#EDF3F7] text-[10px] font-semibold uppercase text-slate-500">
          <tr>
            <th className="w-10 px-2 py-3 text-center">
              #
            </th>

            <th className="w-36 px-3 py-3">
              OBR No.
            </th>

            <th className="w-44 px-3 py-3">
              Office / Sub-office
            </th>

            <th className="w-48 px-3 py-3">
              Expense Category
            </th>

            <th className="w-48 px-3 py-3">
              Expense Account
            </th>

            <th className="w-40 px-3 py-3 text-right">
              OBR Amount
            </th>

            <th className="w-10 px-2 py-3" />
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {items.length > 0 ? (
            items.map((item, index) => (
              <tr
                key={item.id}
                className="transition-colors hover:bg-slate-50"
              >
                <td className="px-2 py-3 text-center text-xs text-slate-400">
                  {index + 1}
                </td>

                <td className="px-3 py-3 align-top">
                  <p className="text-xs font-bold text-slate-700">
                    {item.obr_no}
                  </p>

                  {item.particulars && (
                    <p className="mt-1 text-[10px] text-slate-400">
                      {item.particulars}
                    </p>
                  )}
                </td>

                <td className="px-3 py-3 align-top">
                  <div className="flex items-start gap-2">
                    <Building2
                      size={14}
                      className="mt-0.5 shrink-0 text-[#6689A5]"
                    />

                    <div>
                      <p className="text-xs font-medium text-slate-700">
                        {item.office_name || "—"}
                      </p>

                      <p className="mt-1 text-[10px] text-slate-400">
                        {item.sub_office_name || "No sub-office"}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-3 py-3 align-top">
                  <div className="flex items-start gap-2">
                    <FolderOpen
                      size={14}
                      className="mt-0.5 shrink-0 text-[#6689A5]"
                    />

                    <div>
                      <p className="text-xs font-medium text-slate-700">
                        {item.category_name || "—"}
                      </p>

                      <p className="mt-1 text-[10px] text-slate-400">
                        {item.category_code || ""}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-3 py-3 align-top">
                  <div className="flex items-start gap-2">
                    <Wallet
                      size={14}
                      className="mt-0.5 shrink-0 text-[#6689A5]"
                    />

                    <div>
                      <p className="text-xs font-medium text-slate-700">
                        {item.account_name || "—"}
                      </p>

                      <p className="mt-1 text-[10px] text-slate-400">
                        {item.account_code || ""}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-3 py-3 text-right align-top">
                  <p className="whitespace-nowrap text-xs font-semibold tabular-nums text-slate-600">
                    {peso(item.obligation_amount || 0)}
                  </p>
                </td>

                <td className="px-2 py-3 text-center align-top">
                  <button
                    type="button"
                    onClick={() =>
                      onChange(
                        items.filter(
                          (current) => current.id !== item.id
                        )
                      )
                    }
                    className="rounded p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    title="Remove OBR"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={7}
                className="px-4 py-10 text-center text-xs text-slate-400"
              >
                No OBR items added. Click Add OBR.
              </td>
            </tr>
          )}
        </tbody>

        {items.length > 0 && (
          <tfoot className="border-t border-[#C7D8E3] bg-[#EDF3F7]">
            <tr>
              <td
                colSpan={5}
                className="px-3 py-3 text-right text-xs font-bold uppercase text-[#557992]"
              >
                Total OBR Amount
              </td>

              <td className="px-3 py-3 text-right text-sm font-bold tabular-nums text-[#557992]">
                {peso(totalOBRAmount)}
              </td>

              <td />
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
