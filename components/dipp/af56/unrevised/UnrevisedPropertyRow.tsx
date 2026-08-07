"use client";

import { Trash2 } from "lucide-react";

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
  index: number;

  item: Item;

  items: Item[];

  setItems: React.Dispatch<
    React.SetStateAction<Item[]>
  >;
};

const quarters = [
  { value: 1, label: "1st Quarter" },
  { value: 2, label: "2nd Quarter" },
  { value: 3, label: "3rd Quarter" },
  { value: 4, label: "4th Quarter" },
];

export default function UnrevisedPropertyRow({
  index,
  item,
  items,
  setItems,
}: Props) {

  const update = (
    field: keyof Item,
    value: any
  ) => {

    const copy = [...items];

    copy[index] = {
      ...copy[index],
      [field]: value,
    };

    setItems(copy);

  };

  const remove = () => {

    if (items.length === 1) return;

    setItems(
      items.filter((_, i) => i !== index)
    );

  };

  const total =
    Number(item.basic) +
    Number(item.sef) +
    Number(item.penalty) -
    Number(item.discount);

  return (

    <tr>

      {/* TD Number */}

      <td className="border p-2">

        <input
          value={item.td_number}
          onChange={(e) =>
            update(
              "td_number",
              e.target.value
            )
          }
          className="w-44 rounded border px-2 py-1"
        />

      </td>

      {/* Assessed Value */}

      <td className="border p-2">

        <input
          type="number"
          value={item.assessed_value}
          onChange={(e) =>
            update(
              "assessed_value",
              Number(e.target.value)
            )
          }
          className="w-36 rounded border px-2 py-1 text-right"
        />

      </td>

      {/* From Quarter */}

      <td className="border p-2">

        <select
          value={item.start_quarter}
          onChange={(e) =>
            update(
              "start_quarter",
              Number(e.target.value)
            )
          }
          className="w-36 rounded border px-2 py-1"
        >

          {quarters.map((q) => (

            <option
              key={q.value}
              value={q.value}
            >
              {q.label}
            </option>

          ))}

        </select>

      </td>

      {/* From Year */}

      <td className="border p-2">

        <input
          type="number"
          value={item.start_year}
          onChange={(e) =>
            update(
              "start_year",
              Number(e.target.value)
            )
          }
          className="w-24 rounded border px-2 py-1"
        />

      </td>

      {/* To Quarter */}

      <td className="border p-2">

        <select
          value={item.end_quarter}
          onChange={(e) =>
            update(
              "end_quarter",
              Number(e.target.value)
            )
          }
          className="w-36 rounded border px-2 py-1"
        >

          {quarters.map((q) => (

            <option
              key={q.value}
              value={q.value}
            >
              {q.label}
            </option>

          ))}

        </select>

      </td>

      {/* To Year */}

      <td className="border p-2">

        <input
          type="number"
          value={item.end_year}
          onChange={(e) =>
            update(
              "end_year",
              Number(e.target.value)
            )
          }
          className="w-24 rounded border px-2 py-1"
        />

      </td>

      {/* Basic */}

      <td className="border p-2">

        <input
          type="number"
          value={item.basic}
          onChange={(e) =>
            update(
              "basic",
              Number(e.target.value)
            )
          }
          className="w-28 rounded border px-2 py-1 text-right"
        />

      </td>

      {/* SEF */}

      <td className="border p-2">

        <input
          type="number"
          value={item.sef}
          onChange={(e) =>
            update(
              "sef",
              Number(e.target.value)
            )
          }
          className="w-28 rounded border px-2 py-1 text-right"
        />

      </td>

      {/* Penalty */}

      <td className="border p-2">

        <input
          type="number"
          value={item.penalty}
          onChange={(e) =>
            update(
              "penalty",
              Number(e.target.value)
            )
          }
          className="w-28 rounded border px-2 py-1 text-right"
        />

      </td>

      {/* Discount */}

      <td className="border p-2">

        <input
          type="number"
          value={item.discount}
          onChange={(e) =>
            update(
              "discount",
              Number(e.target.value)
            )
          }
          className="w-28 rounded border px-2 py-1 text-right"
        />

      </td>

      {/* Total */}

      <td className="border bg-slate-50 px-3 text-right font-semibold text-blue-700">

        ₱
        {total.toLocaleString(
          "en-PH",
          {
            minimumFractionDigits: 2,
          }
        )}

      </td>

      {/* Remove */}

      <td className="border text-center">

        <button
          type="button"
          onClick={remove}
          className="rounded p-2 text-red-600 hover:bg-red-50"
        >
          <Trash2 size={18} />
        </button>

      </td>

    </tr>

  );

}