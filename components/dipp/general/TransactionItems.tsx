
"use client";

import { useRef } from "react";
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
    const accountRefs = useRef<any[]>([]);

    const total = items.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
    );

    // Move focus between Account fields.
    const moveToAccount = (index: number) => {
        if (index < 0 || index >= items.length) {
            return;
        }

        accountRefs.current[index]?.focus();
    };

    // Keyboard navigation for Account dropdown.
    const handleAccountKeyDown = (
        event: React.KeyboardEvent,
        index: number
    ) => {
        if (event.key !== "ArrowDown" &&
            event.key !== "ArrowUp") {
            return;
        }

        const select = accountRefs.current[index];

        // When the dropdown is open, allow react-select
        // to navigate its options normally.
        if (select?.state?.menuIsOpen) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        if (event.key === "ArrowDown") {
            moveToAccount(index + 1);
        }

        if (event.key === "ArrowUp") {
            moveToAccount(index - 1);
        }
    };

    // Keyboard navigation for Amount and Remarks.
    const handleFieldKeyDown = (
        event: React.KeyboardEvent<HTMLInputElement>,
        index: number
    ) => {
        if (event.key === "ArrowDown") {
            event.preventDefault();
            event.stopPropagation();
            moveToAccount(index + 1);
        }

        if (event.key === "ArrowUp") {
            event.preventDefault();
            event.stopPropagation();
            moveToAccount(index - 1);
        }
    };

    return (
        <div className="mt-5 rounded-xl border">
            {/* Header */}
            <div className="flex items-center justify-between border-b bg-slate-50 px-4 py-3">
                <h3 className="font-semibold">
                    Transaction Items
                </h3>

                <button
                    type="button"
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

                            <th className="w-16"></th>
                        </tr>
                    </thead>

                    <tbody>
                        {items.map((item, index) => (
                            <tr
                                key={index}
                                className="border-t"
                            >
                                {/* Row number */}
                                <td className="text-center">
                                    {index + 1}
                                </td>

                                {/* Account */}
                                <td className="p-3">
                                    <Select<AccountOption>
                                        ref={(element) => {
                                            accountRefs.current[index] =
                                                element;
                                        }}
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
                                        onKeyDown={(event) =>
                                            handleAccountKeyDown(
                                                event,
                                                index
                                            )
                                        }
                                        styles={{
                                            menuPortal: (base) => ({
                                                ...base,
                                                zIndex: 99999,
                                            }),
                                        }}
                                        value={
                                            accountOptions.find(
                                                (x) =>
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
                                            saving || loadingAccounts
                                        }
                                        placeholder={
                                            loadingAccounts
                                                ? "Loading..."
                                                : "Search account..."
                                        }
                                    />
                                </td>

                                {/* Amount */}
                                <td className="p-3">
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={item.amount}
                                        disabled={saving}
                                        onKeyDown={(event) =>
                                            handleFieldKeyDown(
                                                event,
                                                index
                                            )
                                        }
                                        onChange={(e) =>
                                            onUpdate(
                                                index,
                                                "amount",
                                                e.target.value
                                            )
                                        }
                                        className="amount-input w-full rounded-lg border border-slate-300 px-3 py-2 text-right"
                                    />
                                </td>

                                {/* Remarks */}
                                <td className="p-3">
                                    <input
                                        value={item.remarks}
                                        disabled={saving}
                                        onKeyDown={(event) =>
                                            handleFieldKeyDown(
                                                event,
                                                index
                                            )
                                        }
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

                                {/* Remove */}
                                <td className="text-center">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            onRemove(index)
                                        }
                                        disabled={
                                            saving ||
                                            items.length === 1
                                        }
                                        className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
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

                            <span>{items.length}</span>
                        </div>

                        <div className="mt-3 flex justify-between">
                            <span className="text-lg font-semibold">
                                Grand Total
                            </span>

                            <span className="text-3xl font-black text-blue-700">
                                {total.toLocaleString("en-PH", {
                                    style: "currency",
                                    currency: "PHP",
                                })}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hide number input spinner arrows */}
            <style jsx global>{`
                .amount-input::-webkit-inner-spin-button,
                .amount-input::-webkit-outer-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }

                .amount-input {
                    -moz-appearance: textfield;
                    appearance: textfield;
                }
            `}</style>
        </div>
    );
}