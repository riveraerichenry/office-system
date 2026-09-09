"use client";

type Item = {
td_number: string;

coverage: string;

assessed_value: number | string;

basic: number | string;

sef: number | string;

penalty: number | string;

discount: number | string;

amount: number | string;

};

type Props = {
items: Item[];

grandTotal: number;

saving?: boolean;

onChange: (
    items: Item[]
) => void;

};

const money = (
value: number | string | null | undefined
) =>
Number(
value || 0
).toLocaleString(
"en-PH",
{
minimumFractionDigits: 2,
maximumFractionDigits: 2,
}
);

export default function RPTItemsTable({
items,
grandTotal,
saving = false,
onChange,
}: Props) {

function updateItem(
    index: number,
    field: keyof Item,
    value: string
) {

    const updatedItems =
        [...items];

    updatedItems[index] = {
        ...updatedItems[index],
        [field]: value,
    };

    onChange(
        updatedItems
    );

}


function addItem() {

    onChange([
        ...items,
        {
            td_number: "",
            coverage: "",
            assessed_value: "",
            basic: "",
            sef: "",
            penalty: "",
            discount: "",
            amount: "",
        },
    ]);

}


function removeItem(
    index: number
) {

    onChange(
        items.filter(
            (
                _,
                itemIndex
            ) =>
                itemIndex !== index
        )
    );

}


return (
    <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        {/* ========================================================
            HEADER
        ======================================================== */}

        <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">

            <div>

                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                    RPT Collection Items
                </h3>

                <p className="mt-0.5 text-xs text-slate-500">
                    Edit the Real Property Tax collection details
                </p>

            </div>


            <div className="flex items-center gap-3">

                <div className="rounded-md bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">

                    {items.length} Item
                    {items.length !== 1 && "s"}

                </div>


                <button
                    type="button"
                    onClick={addItem}
                    disabled={saving}
                    className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    + Add Item
                </button>

            </div>

        </div>


        {/* ========================================================
            TABLE
        ======================================================== */}

        <div className="overflow-x-auto">

            <table className="min-w-[1200px] w-full text-sm">

                <thead className="bg-slate-100">

                    <tr>

                        <th className="border-b px-3 py-3 text-left text-[11px] font-semibold uppercase text-slate-600">
                            TD Number
                        </th>


                        <th className="border-b px-3 py-3 text-left text-[11px] font-semibold uppercase text-slate-600">
                            Coverage
                        </th>


                        <th className="border-b px-3 py-3 text-right text-[11px] font-semibold uppercase text-slate-600">
                            Assessed Value
                        </th>


                        <th className="border-b px-3 py-3 text-right text-[11px] font-semibold uppercase text-slate-600">
                            Basic
                        </th>


                        <th className="border-b px-3 py-3 text-right text-[11px] font-semibold uppercase text-slate-600">
                            SEF
                        </th>


                        <th className="border-b px-3 py-3 text-right text-[11px] font-semibold uppercase text-slate-600">
                            Penalty
                        </th>


                        <th className="border-b px-3 py-3 text-right text-[11px] font-semibold uppercase text-slate-600">
                            Discount
                        </th>


                        <th className="border-b px-3 py-3 text-right text-[11px] font-semibold uppercase text-slate-600">
                            Total
                        </th>


                        <th className="border-b px-3 py-3 text-center text-[11px] font-semibold uppercase text-slate-600">
                            Action
                        </th>

                    </tr>

                </thead>


                <tbody>

                    {items.length > 0 ? (

                        items.map(
                            (
                                item,
                                index
                            ) => (

                                <tr
                                    key={index}
                                    className="border-b last:border-0 hover:bg-slate-50"
                                >

                                    {/* TD NUMBER */}

                                    <td className="px-3 py-3">

                                        <input
                                            type="text"
                                            value={
                                                item.td_number ?? ""
                                            }
                                            disabled={saving}
                                            onChange={(
                                                e
                                            ) =>
                                                updateItem(
                                                    index,
                                                    "td_number",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="TD Number"
                                            className="min-w-[130px] rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                                        />

                                    </td>


                                    {/* COVERAGE */}

                                    <td className="px-3 py-3">

                                        <input
                                            type="text"
                                            value={
                                                item.coverage ?? ""
                                            }
                                            disabled={saving}
                                            onChange={(
                                                e
                                            ) =>
                                                updateItem(
                                                    index,
                                                    "coverage",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Coverage"
                                            className="min-w-[180px] rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                                        />

                                    </td>


                                    {/* ASSESSED VALUE */}

                                    <td className="px-3 py-3">

                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={
                                                item.assessed_value ?? ""
                                            }
                                            disabled={saving}
                                            onChange={(
                                                e
                                            ) =>
                                                updateItem(
                                                    index,
                                                    "assessed_value",
                                                    e.target.value
                                                )
                                            }
                                            className="w-32 rounded-lg border border-slate-300 px-3 py-2 text-right outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                                        />

                                    </td>


                                    {/* BASIC */}

                                    <td className="px-3 py-3">

                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={
                                                item.basic ?? ""
                                            }
                                            disabled={saving}
                                            onChange={(
                                                e
                                            ) =>
                                                updateItem(
                                                    index,
                                                    "basic",
                                                    e.target.value
                                                )
                                            }
                                            className="w-28 rounded-lg border border-slate-300 px-3 py-2 text-right outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                                        />

                                    </td>


                                    {/* SEF */}

                                    <td className="px-3 py-3">

                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={
                                                item.sef ?? ""
                                            }
                                            disabled={saving}
                                            onChange={(
                                                e
                                            ) =>
                                                updateItem(
                                                    index,
                                                    "sef",
                                                    e.target.value
                                                )
                                            }
                                            className="w-28 rounded-lg border border-slate-300 px-3 py-2 text-right outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                                        />

                                    </td>


                                    {/* PENALTY */}

                                    <td className="px-3 py-3">

                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={
                                                item.penalty ?? ""
                                            }
                                            disabled={saving}
                                            onChange={(
                                                e
                                            ) =>
                                                updateItem(
                                                    index,
                                                    "penalty",
                                                    e.target.value
                                                )
                                            }
                                            className="w-28 rounded-lg border border-slate-300 px-3 py-2 text-right outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                                        />

                                    </td>


                                    {/* DISCOUNT */}

                                    <td className="px-3 py-3">

                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={
                                                item.discount ?? ""
                                            }
                                            disabled={saving}
                                            onChange={(
                                                e
                                            ) =>
                                                updateItem(
                                                    index,
                                                    "discount",
                                                    e.target.value
                                                )
                                            }
                                            className="w-28 rounded-lg border border-slate-300 px-3 py-2 text-right outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                                        />

                                    </td>


                                    {/* TOTAL */}

                                    <td className="px-3 py-3">

                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={
                                                item.amount ?? ""
                                            }
                                            disabled={saving}
                                            onChange={(
                                                e
                                            ) =>
                                                updateItem(
                                                    index,
                                                    "amount",
                                                    e.target.value
                                                )
                                            }
                                            className="w-32 rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-right font-semibold text-blue-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                                        />

                                    </td>


                                    {/* REMOVE */}

                                    <td className="px-3 py-3 text-center">

                                        <button
                                            type="button"
                                            disabled={
                                                saving ||
                                                items.length === 1
                                            }
                                            onClick={() =>
                                                removeItem(
                                                    index
                                                )
                                            }
                                            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            Remove
                                        </button>

                                    </td>

                                </tr>

                            )
                        )

                    ) : (

                        <tr>

                            <td
                                colSpan={9}
                                className="py-12 text-center text-sm text-slate-500"
                            >
                                No RPT items found.
                            </td>

                        </tr>

                    )}

                </tbody>


                {/* ====================================================
                    GRAND TOTAL
                ==================================================== */}

                {items.length > 0 && (

                    <tfoot className="bg-slate-100">

                        <tr>

                            <td
                                colSpan={7}
                                className="px-3 py-4 text-right font-semibold uppercase tracking-wide text-slate-700"
                            >
                                Grand Total
                            </td>


                            <td className="px-3 py-4 text-right text-lg font-bold text-emerald-700">

                                ₱{
                                    money(
                                        grandTotal
                                    )
                                }

                            </td>


                            <td />

                        </tr>

                    </tfoot>

                )}

            </table>

        </div>

    </div>
);

}