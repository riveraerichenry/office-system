"use client";

import Select from "react-select";
import { Plus, Trash2 } from "lucide-react";

type AccountOption = {
    value: string;
    label: string;
};

type TransactionItem = {
    account_id: string;
    amount: string;
    remarks: string;
};

type Props = {
    items: TransactionItem[];
    accountOptions: AccountOption[];
    loadingAccounts: boolean;
    saving: boolean;

    onAdd: () => void;

    onRemove: (index: number) => void;

    onUpdate: (
        index: number,
        field: keyof TransactionItem,
        value: any
    ) => void;
};

export default function TransactionItems({

    items,

    accountOptions,

    loadingAccounts,

    saving,

    onAdd,

    onRemove,

    onUpdate,

}: Props) {

    const total =
        items.reduce(

            (

                sum,

                item

            ) =>

                sum +

                Number(

                    item.amount || 0

                ),

            0

        );

    return (

        <div className="mt-5 rounded-xl border">

            {/* Header */}

            <div className="flex items-center justify-between border-b bg-slate-50 px-4 py-3">

                <h3 className="font-semibold">

                    Transaction Items

                </h3>

                <button

                    onClick={onAdd}

                    disabled={saving}

                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-slate-300"

                >

                    <Plus size={16} />

                    Add Item

                </button>

            </div>

            {/* Table */}

            <div className="overflow-x-auto">

                <table className="w-full">

                    <thead className="bg-slate-100">

                        <tr>

                            <th className="w-14 px-3 py-3">

                                #

                            </th>

                            <th className="w-[420px] px-3 py-3 text-left">

                                Account

                            </th>

                            <th className="w-52 px-3 py-3 text-right">

                                Amount

                            </th>

                            <th className="px-3 py-3 text-left">

                                Remarks

                            </th>

                            <th className="w-16">

                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {

                            items.map(

                                (

                                    item,

                                    index

                                ) => (

                                    <tr

                                        key={index}

                                        className="border-t"

                                    >

                                        <td className="text-center">

                                            {index + 1}

                                        </td>

                                        <td className="p-3">

                                            <Select

                                                options={accountOptions}

                                                isSearchable

                                                isClearable

                                                menuPortalTarget={

                                                    typeof window !== "undefined"

                                                        ? document.body

                                                        : undefined

                                                }

                                                menuPosition="fixed"

                                                menuPlacement="auto"

                                                styles={{

                                                    menuPortal: (

                                                        base

                                                    ) => ({

                                                        ...base,

                                                        zIndex: 99999,

                                                    }),

                                                }}

                                                value={

                                                    accountOptions.find(

                                                        x =>

                                                            x.value ===

                                                            item.account_id

                                                    ) ?? null

                                                }

                                                onChange={(selected) =>

                                                    onUpdate(

                                                        index,

                                                        "account_id",

                                                        selected?.value ?? ""

                                                    )

                                                }

                                                isDisabled={

                                                    saving ||

                                                    loadingAccounts

                                                }

                                                placeholder={

                                                    loadingAccounts

                                                        ? "Loading..."

                                                        : "Search account..."

                                                }

                                            />

                                        </td>

                                        <td className="p-3">

                                            <input

                                                type="number"

                                                step="0.01"

                                                min="0"

                                                value={item.amount}

                                                disabled={saving}

                                                onChange={(e) =>

                                                    onUpdate(

                                                        index,

                                                        "amount",

                                                        e.target.value

                                                    )

                                                }

                                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-right"

                                            />

                                        </td>

                                        <td className="p-3">

                                            <input

                                                value={item.remarks}

                                                disabled={saving}

                                                onChange={(e) =>

                                                    onUpdate(

                                                        index,

                                                        "remarks",

                                                        e.target.value

                                                    )

                                                }

                                                className="w-full rounded-lg border border-slate-300 px-3 py-2"

                                                placeholder="Optional"

                                            />

                                        </td>

                                        <td className="text-center">

                                            <button

                                                onClick={() =>

                                                    onRemove(index)

                                                }

                                                disabled={

                                                    saving ||

                                                    items.length === 1

                                                }

                                                className="rounded-lg p-2 text-red-600 hover:bg-red-50"

                                            >

                                                <Trash2 size={18} />

                                            </button>

                                        </td>

                                    </tr>

                                )

                            )

                        }

                    </tbody>

                </table>

            </div>

            {/* Summary */}

            <div className="border-t bg-slate-50 px-5 py-4">

                <div className="flex justify-end">

                    <div className="w-80 rounded-xl border bg-white p-5">

                        <div className="flex justify-between">

                            <span className="text-slate-500">

                                Entries

                            </span>

                            <span>

                                {items.length}

                            </span>

                        </div>

                        <div className="mt-3 flex justify-between">

                            <span className="text-lg font-semibold">

                                Grand Total

                            </span>

                            <span className="text-3xl font-black text-blue-700">

                                {

                                    total.toLocaleString(

                                        "en-PH",

                                        {

                                            style: "currency",

                                            currency: "PHP",

                                        }

                                    )

                                }

                            </span>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

}