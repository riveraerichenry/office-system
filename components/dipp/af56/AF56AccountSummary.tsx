"use client";

import { Plus, Trash2 } from "lucide-react";

type AccountRow = {
    account_code: string;
    account_name: string;
    amount: string;
};

type Props = {
    rows: AccountRow[];
    saving: boolean;
    onChange: (rows: AccountRow[]) => void;
};

export default function AF56AccountSummary({

    rows,
    saving,
    onChange,

}: Props) {

    function addRow() {

        onChange([

            ...rows,

            {

                account_code: "",

                account_name: "",

                amount: "",

            },

        ]);

    }

    function removeRow(index: number) {

        onChange(

            rows.filter(

                (_, i) => i !== index

            )

        );

    }

    function update(

        index: number,

        field: keyof AccountRow,

        value: string

    ) {

        const copy = [...rows];

        copy[index] = {

            ...copy[index],

            [field]: value,

        };

        onChange(copy);

    }

    const total = rows.reduce(

        (sum, row) =>

            sum +

            Number(row.amount || 0),

        0

    );

    return (

        <div className="rounded-xl border bg-white shadow-sm">

            <div className="flex items-center justify-between border-b bg-slate-50 px-5 py-3">

                <div>

                    <h2 className="text-base font-semibold text-slate-800">
                        Account Summary
                    </h2>

                    <p className="text-sm text-slate-500">
                        Accounting Distribution
                    </p>

                </div>

                <button

                    disabled={saving}

                    onClick={addRow}

                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"

                >

                    <Plus size={16} />

                    Add Account

                </button>

            </div>

            <div className="overflow-x-auto">

                <table className="w-full">

                    <thead className="bg-slate-100">

                        <tr>

                            <th className="w-52 px-4 py-3 text-left text-xs font-semibold uppercase">
                                Account Code
                            </th>

                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                                Account Name
                            </th>

                            <th className="w-56 px-4 py-3 text-right text-xs font-semibold uppercase">
                                Amount
                            </th>

                            <th className="w-16"></th>

                        </tr>

                    </thead>

                    <tbody>

                        {rows.length === 0 && (

                            <tr>

                                <td
                                    colSpan={4}
                                    className="py-12 text-center text-slate-500"
                                >

                                    No account entries.

                                </td>

                            </tr>

                        )}

                        {rows.map((row, index) => (

                            <tr
                                key={index}
                                className="border-t"
                            >

                                <td className="p-2">

                                    <input

                                        value={row.account_code}

                                        disabled={saving}

                                        onChange={(e) =>

                                            update(

                                                index,

                                                "account_code",

                                                e.target.value

                                            )

                                        }

                                        placeholder="Code"

                                        className="w-full rounded-lg border px-3 py-2"

                                    />

                                </td>

                                <td className="p-2">

                                    <input

                                        value={row.account_name}

                                        disabled={saving}

                                        onChange={(e) =>

                                            update(

                                                index,

                                                "account_name",

                                                e.target.value

                                            )

                                        }

                                        placeholder="Account Name"

                                        className="w-full rounded-lg border px-3 py-2"

                                    />

                                </td>

                                <td className="p-2">

                                    <input

                                        type="number"

                                        value={row.amount}

                                        disabled={saving}

                                        onChange={(e) =>

                                            update(

                                                index,

                                                "amount",

                                                e.target.value

                                            )

                                        }

                                        className="w-full rounded-lg border px-3 py-2 text-right"

                                    />

                                </td>

                                <td className="text-center">

                                    <button

                                        disabled={saving}

                                        onClick={() =>

                                            removeRow(index)

                                        }

                                        className="rounded-lg p-2 text-red-600 hover:bg-red-50"

                                    >

                                        <Trash2 size={16} />

                                    </button>

                                </td>

                            </tr>

                        ))}

                    </tbody>

                    <tfoot className="border-t bg-slate-50">

                        <tr>

                            <td
                                colSpan={2}
                                className="px-4 py-4 text-right font-semibold"
                            >

                                Total

                            </td>

                            <td className="px-4 py-4 text-right text-lg font-bold text-blue-700">

                                {total.toLocaleString(

                                    "en-PH",

                                    {

                                        style: "currency",

                                        currency: "PHP",

                                    }

                                )}

                            </td>

                            <td></td>

                        </tr>

                    </tfoot>

                </table>

            </div>

        </div>

    );

}