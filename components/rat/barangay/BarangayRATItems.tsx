"use client";

import { useMemo } from "react";
import Select from "react-select";
import { Plus, Trash2 } from "lucide-react";

export type RATBookletItem = {
    booklet_id: string;
};

export type BookletOption = {
    value: string;
    label: string;
    control_no?: string;
    form_code?: string;
    fiscal_year?: number;
    series?: string;
    beginning_or?: number;
    ending_or?: number;
    status?: string;
};

type Props = {
    items: RATBookletItem[];
    booklets: BookletOption[];
    loadingBooklets: boolean;
    saving: boolean;
    onAdd: () => void;
    onRemove: (index: number) => void;
    onUpdate: (
        index: number,
        bookletId: string
    ) => void;
};

export default function BarangayRATItems({
    items,
    booklets,
    loadingBooklets,
    saving,
    onAdd,
    onRemove,
    onUpdate,
}: Props) {
    const selectedBookletIds = useMemo(
        () =>
            items
                .map((item) => item.booklet_id)
                .filter(Boolean),
        [items]
    );

    function getAvailableOptions(
        currentBookletId: string
    ) {
        return booklets.filter(
            (booklet) =>
                booklet.value === currentBookletId ||
                !selectedBookletIds.includes(
                    booklet.value
                )
        );
    }

    function getORRange(
        booklet: BookletOption
    ) {
        if (
            booklet.beginning_or ===
                undefined ||
            booklet.beginning_or === null ||
            booklet.ending_or ===
                undefined ||
            booklet.ending_or === null
        ) {
            return "-";
        }

        // No commas
        return `${booklet.beginning_or} - ${booklet.ending_or}`;
    }

    return (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div>
                    <h2 className="text-lg font-semibold text-slate-800">
                        Booklets
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Select the accountable form
                        booklets to include in this RAT.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onAdd}
                    disabled={
                        saving ||
                        loadingBooklets
                    }
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Plus size={18} />
                    Add Item
                </button>
            </div>

            {/* Table */}
            <div className="w-full overflow-hidden">
                <table className="w-full table-fixed">
                    <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-left">
                            <th className="w-14 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                                #
                            </th>

                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                                Booklet
                            </th>

                            <th className="w-20 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">
                                Action
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {items.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={3}
                                    className="px-5 py-10 text-center"
                                >
                                    <div className="text-sm font-medium text-slate-500">
                                        No booklets added.
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            items.map(
                                (
                                    item,
                                    index
                                ) => {
                                    const options =
                                        getAvailableOptions(
                                            item.booklet_id
                                        );

                                    const selectedBooklet =
                                        booklets.find(
                                            (
                                                booklet
                                            ) =>
                                                booklet.value ===
                                                item.booklet_id
                                        );

                                    return (
                                        <tr
                                            key={`${index}-${item.booklet_id}`}
                                            className="border-b border-slate-100 last:border-b-0"
                                        >
                                            {/* Number */}
                                            <td className="px-4 py-4 align-middle text-sm font-semibold text-slate-600">
                                                {index +
                                                    1}
                                            </td>

                                            {/* Booklet */}
                                            <td className="px-4 py-3 align-middle">
                                                <Select<BookletOption>
                                                    instanceId={`barangay-rat-booklet-${index}`}
                                                    value={
                                                        selectedBooklet ||
                                                        null
                                                    }
                                                    options={
                                                        options
                                                    }
                                                    isLoading={
                                                        loadingBooklets
                                                    }
                                                    isDisabled={
                                                        saving
                                                    }
                                                    isSearchable
                                                    isClearable
                                                    placeholder={
                                                        loadingBooklets
                                                            ? "Loading booklets..."
                                                            : "Select booklet..."
                                                    }
                                                    noOptionsMessage={() =>
                                                        "No available CTC-I booklets found."
                                                    }
                                                    onChange={(
                                                        option
                                                    ) =>
                                                        onUpdate(
                                                            index,
                                                            option?.value ||
                                                                ""
                                                        )
                                                    }
                                                    formatOptionLabel={(
                                                        option
                                                    ) => (
                                                        <div className="grid grid-cols-[1.5fr_1.2fr_0.6fr] items-center gap-4">
                                                            {/* Form Code */}
                                                            <span className="truncate font-medium text-slate-800">
                                                                {option.form_code ||
                                                                    "-"}
                                                            </span>

                                                            {/* OR Range */}
                                                            <span className="truncate text-slate-600">
                                                                {getORRange(
                                                                    option
                                                                )}
                                                            </span>

                                                            {/* Series */}
                                                            <span className="truncate text-slate-600">
                                                                {option.series ||
                                                                    "-"}
                                                            </span>
                                                        </div>
                                                    )}
                                                    menuPortalTarget={
                                                        typeof document !==
                                                        "undefined"
                                                            ? document.body
                                                            : undefined
                                                    }
                                                    menuPosition="fixed"
                                                    menuPlacement="auto"
                                                    styles={{
                                                        menuPortal:
                                                            (
                                                                base
                                                            ) => ({
                                                                ...base,
                                                                zIndex: 99999,
                                                            }),
                                                    }}
                                                />
                                            </td>

                                            {/* Action */}
                                            <td className="px-4 py-3 text-center align-middle">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        onRemove(
                                                            index
                                                        )
                                                    }
                                                    disabled={
                                                        saving
                                                    }
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                                    title="Remove"
                                                >
                                                    <Trash2
                                                        size={
                                                            17
                                                        }
                                                    />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                }
                            )
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-3">
                <span className="text-xs font-medium text-slate-500">
                    Total Booklets
                </span>

                <span className="text-sm font-bold text-slate-800">
                    {items.length}
                </span>
            </div>
        </div>
    );
}