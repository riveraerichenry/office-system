"use client";

type Item = {
  id: string;
  td_number: string;
  coverage: string;
  assessed_value: number;
  tax_due: number;
  basic: number;
  sef: number;
  penalty: number;
  discount: number;
  total: number;
};

type Props = {
  items: Item[];
};

const money = (value: number | null | undefined) =>
  Number(value ?? 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function AF56BillingItems({
  items,
}: Props) {
  if (!items.length) return null;

  return (
    <div className="mt-8">
      <div className="mb-4 border-b border-slate-200 pb-3">
        <h2 className="text-lg font-semibold text-slate-800">
          Billing Items
        </h2>

        <p className="text-sm text-slate-500">
          Breakdown of all billable property tax items.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                TD Number
              </th>

              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                Coverage
              </th>

              <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                Assessed Value
              </th>

              <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                Tax Due
              </th>

              <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                Basic
              </th>

              <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                SEF
              </th>

              <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                Penalty
              </th>

              <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                Discount
              </th>

              <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                Total
              </th>
            </tr>
          </thead>

          <tbody>
            {items.map((item, index) => {
              const showTD =
                index === 0 ||
                items[index - 1].td_number !== item.td_number;

              return (
                <tr
                  key={item.id}
                  className="border-t border-slate-200 hover:bg-slate-50"
                >
                  <td className="px-3 py-2 font-medium text-slate-700">
                    {showTD ? item.td_number : ""}
                  </td>

                  <td className="px-3 py-2">
                    {item.coverage}
                  </td>

                  <td className="px-3 py-2 text-right">
                    {money(item.assessed_value)}
                  </td>

                  <td className="px-3 py-2 text-right">
                    {money(item.tax_due)}
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
                    {money(item.total)}
                  </td>
                </tr>
              );
            })}
          </tbody>

          <tfoot className="bg-slate-100">
            <tr>
              <td
                colSpan={8}
                className="px-3 py-3 text-right font-semibold"
              >
                Grand Total
              </td>

              <td className="px-3 py-3 text-right font-bold text-emerald-700">
                ₱
                {money(
                  items.reduce(
                    (sum, item) => sum + Number(item.total ?? 0),
                    0
                  )
                )}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}