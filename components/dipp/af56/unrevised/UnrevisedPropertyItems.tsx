"use client";

import UnrevisedPropertyRow from "./UnrevisedPropertyRow";

type Item = {
  td_number: string;

  assessed_value: number;

  start_quarter: number;
  start_year: number;

  end_quarter: number;
  end_year: number;

  basic: number;
  sef: number;
  penalty: number;
  discount: number;
};

type Props = {
  items: Item[];

  setItems: React.Dispatch<
    React.SetStateAction<Item[]>
  >;

  emptyItem: () => Item;
};

export default function UnrevisedPropertyItems({
  items,
  setItems,
  emptyItem,
}: Props) {
  return (
    <div className="rounded-xl border bg-white shadow-sm">

      {/* Header */}

      <div className="flex items-center justify-between border-b bg-slate-50 px-6 py-4">

        <div>

          <h2 className="text-lg font-bold text-slate-800">
            Property Items
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Encode all properties included in this receipt.
          </p>

        </div>

        <button
          type="button"
          onClick={() =>
            setItems((prev) => [
              ...prev,
              emptyItem(),
            ])
          }
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + Add Item
        </button>

      </div>

      {/* Table */}

      <div className="overflow-x-auto">

        <table className="min-w-[1850px] border-collapse text-sm">

          <thead className="bg-slate-100">

            <tr>

              <th className="border px-3 py-2 text-left">
                TD Number
              </th>

              <th className="border px-3 py-2 text-right">
                Assessed Value
              </th>

              <th className="border px-3 py-2">
                From Quarter
              </th>

              <th className="border px-3 py-2">
                From Year
              </th>

              <th className="border px-3 py-2">
                To Quarter
              </th>

              <th className="border px-3 py-2">
                To Year
              </th>

              <th className="border px-3 py-2 text-right">
                Basic
              </th>

              <th className="border px-3 py-2 text-right">
                SEF
              </th>

              <th className="border px-3 py-2 text-right">
                Penalty
              </th>

              <th className="border px-3 py-2 text-right">
                Discount
              </th>

              <th className="border px-3 py-2 text-right">
                Total
              </th>

              <th className="w-16 border px-3 py-2">
              </th>

            </tr>

          </thead>

          <tbody>

            {items.map((item, index) => (

              <UnrevisedPropertyRow
                key={index}

                index={index}

                item={item}

                items={items}

                setItems={setItems}
              />

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}