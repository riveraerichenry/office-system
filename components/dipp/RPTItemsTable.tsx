"use client";

type Item = {
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
  items: Item[];
  grandTotal: number;
};

const money = (value: number | null | undefined) =>
  Number(value ?? 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function RPTItemsTable({
  items,
  grandTotal,
}: Props) {
  return (
    <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
            RPT Collection Items
          </h3>

          <p className="mt-0.5 text-xs text-slate-500">
            Real Property Tax collection breakdown
          </p>
        </div>

        <div className="rounded-md bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {items.length} Item{items.length !== 1 && "s"}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="border-b px-3 py-2 text-left text-[11px] font-semibold uppercase text-slate-600">
                TD Number
              </th>

              <th className="border-b px-3 py-2 text-left text-[11px] font-semibold uppercase text-slate-600">
                Coverage
              </th>

              <th className="border-b px-3 py-2 text-right text-[11px] font-semibold uppercase text-slate-600">
                Assessed Value
              </th>

              <th className="border-b px-3 py-2 text-right text-[11px] font-semibold uppercase text-slate-600">
                Basic
              </th>

              <th className="border-b px-3 py-2 text-right text-[11px] font-semibold uppercase text-slate-600">
                SEF
              </th>

              <th className="border-b px-3 py-2 text-right text-[11px] font-semibold uppercase text-slate-600">
                Penalty
              </th>

              <th className="border-b px-3 py-2 text-right text-[11px] font-semibold uppercase text-slate-600">
                Discount
              </th>

              <th className="border-b px-3 py-2 text-right text-[11px] font-semibold uppercase text-slate-600">
                Total
              </th>
            </tr>
          </thead>

          <tbody>
            {items.length > 0 ? (
              items.map((item, index) => {
                const showTD =
                  index === 0 ||
                  items[index - 1].td_number !== item.td_number;

                return (
                  <tr
                    key={index}
                    className="border-b hover:bg-slate-50"
                  >
                    <td className="px-3 py-2 font-semibold">
                      {showTD ? item.td_number : ""}
                    </td>

                    <td className="px-3 py-2">
                      {item.coverage}
                    </td>

                    <td className="px-3 py-2 text-right">
                      {money(item.assessed_value)}
                    </td>

                    <td className="px-3 py-2 text-right">
                      {money(item.basic)}
                    </td>

                    <td className="px-3 py-2 text-right">
                      {money(item.sef)}
                    </td>

                    <td className="px-3 py-2 text-right text-red-600">
                      {money(item.penalty)}
                    </td>

                    <td className="px-3 py-2 text-right text-blue-700">
                      {money(item.discount)}
                    </td>

                    <td className="px-3 py-2 text-right font-semibold text-emerald-700">
                      {money(item.amount)}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={8}
                  className="py-12 text-center text-sm text-slate-500"
                >
                  No RPT items found.
                </td>
              </tr>
            )}
          </tbody>

          {items.length > 0 && (
            <tfoot className="bg-slate-100">
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-3 text-right font-semibold uppercase tracking-wide text-slate-700"
                >
                  Grand Total
                </td>

                <td className="px-3 py-3 text-right text-lg font-bold text-emerald-700">
                  ₱{money(grandTotal)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}