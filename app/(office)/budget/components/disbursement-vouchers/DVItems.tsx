
"use client";

import { Trash2 } from "lucide-react";
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

export default function DVItems({ items, onChange }: Props) {
  const totalOBRAmount = items.reduce(
    (total, item) => total + (Number(item.obligation_amount) || 0),
    0
  );

  return (
    <div className="rounded-md border border-slate-200 bg-white overflow-hidden">
      <table className="w-full table-fixed text-left">
        <thead className="bg-[#EDF3F7] text-[10px] font-semibold uppercase text-slate-500">
          <tr>
            <th className="w-8 px-2 py-2 text-center">#</th>
            <th className="w-32 px-2 py-2">OBR No.</th>
            <th className="px-2 py-2">Particulars</th>
            <th className="w-36 px-2 py-2 text-right">OBR Amount</th>
            <th className="w-8 px-2 py-2" />
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {items.length > 0 ? (
            items.map((item, index) => {
              const particulars = [
                item.payee,
                item.office_name,
                item.sub_office_name,
                item.category_name,
                item.account_code
                  ? `${item.account_code} - ${item.account_name || ""}`
                  : item.account_name,
              ]
                .filter(Boolean)
                .join(" / ");

              return (
                <tr
                  key={item.id}
                  className="transition-colors hover:bg-slate-50"
                >
                  <td className="px-2 py-2 text-center text-[10px] text-slate-400">
                    {index + 1}
                  </td>

                  <td className="px-2 py-2 align-middle">
                    <p className="truncate text-xs font-bold text-slate-700">
                      {item.obr_no || "—"}
                    </p>
                  </td>

                  <td className="px-2 py-2 align-middle">
                    <p
                      className="truncate text-xs text-slate-700"
                      title={particulars}
                    >
                      {particulars || "—"}
                    </p>
                  </td>

                  <td className="px-2 py-2 text-right align-middle">
                    <p className="whitespace-nowrap text-xs font-semibold tabular-nums text-slate-600">
                      {peso(item.obligation_amount || 0)}
                    </p>
                  </td>

                  <td className="px-1 py-2 text-center align-middle">
                    <button
                      type="button"
                      onClick={() =>
                        onChange(
                          items.filter((current) => current.id !== item.id)
                        )
                      }
                      className="rounded p-1 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                      title="Remove OBR"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan={5}
                className="px-4 py-6 text-center text-xs text-slate-400"
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
                colSpan={3}
                className="px-2 py-2 text-right text-[10px] font-bold uppercase text-[#557992]"
              >
                Total OBR Amount
              </td>

              <td className="px-2 py-2 text-right text-sm font-bold tabular-nums text-[#557992]">
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
