
"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import type { IssueCheckItem } from "./IssueCheckTypes";
import IssueCheckItemsModal from "./IssueCheckItemsModal";

type Props = {
  items: IssueCheckItem[];
  onItemsChange: (items: IssueCheckItem[]) => void;
};

function formatPHP(value: string | number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

export default function IssueCheckItems({
  items,
  onItemsChange,
}: Props) {
  const [showModal, setShowModal] = useState(false);

  const grandTotal = items.reduce(
    (sum, item) => sum + (Number(item.total_debit) || 0),
    0
  );

  function handleAddItem(item: IssueCheckItem) {
    onItemsChange([...items, item]);
    setShowModal(false);
  }

  function handleDeleteItem(id: string) {
    onItemsChange(items.filter((item) => item.id !== id));
  }

  return (
    <>
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Transaction Items
            </h3>

            <p className="mt-0.5 text-xs text-slate-500">
              {items.length} item(s)
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Plus size={16} />
            Add Item / OBR
          </button>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">OBR No.</th>
                <th className="px-4 py-3">Responsibility Center</th>
                <th className="px-4 py-3">Account Code</th>
                <th className="px-4 py-3">Payee Name</th>
                <th className="px-4 py-3">Item Date</th>
                <th className="px-4 py-3 text-right">Total Debit</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-sm text-slate-400"
                  >
                    No transaction items added. Click Add Item / OBR to
                    get started.
                  </td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-500">
                      {index + 1}
                    </td>

                    <td className="px-4 py-3 font-medium text-slate-800">
                      {item.obr_no || "—"}
                    </td>

                    <td className="px-4 py-3">
                      {item.responsibility_center || "—"}
                    </td>

                    <td className="px-4 py-3 font-medium text-slate-800">
                      {item.account_code || "—"}
                    </td>

                    <td className="px-4 py-3">
                      {item.payee_name || "—"}
                    </td>

                    <td className="px-4 py-3">
                      {item.item_date || "—"}
                    </td>

                    <td className="px-4 py-3 text-right font-semibold tabular-nums">
                      {formatPHP(item.total_debit)}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        title="Delete item"
                        className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

            {items.length > 0 && (
              <tfoot className="border-t-2 border-slate-200 bg-slate-50">
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-3 text-right font-bold text-slate-700"
                  >
                    GRAND TOTAL
                  </td>

                  <td className="px-4 py-3 text-right font-bold text-blue-700 tabular-nums">
                    {formatPHP(grandTotal)}
                  </td>

                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </section>

      {/* ITEM MODAL */}
      <IssueCheckItemsModal
        open={showModal}
        item={null}
        onClose={() => setShowModal(false)}
        onSave={handleAddItem}
      />
    </>
  );
}
