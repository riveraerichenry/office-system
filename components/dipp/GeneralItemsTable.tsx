"use client";

import {
useEffect,
useMemo,
useState,
} from "react";

import Select from "react-select";

import {
Edit3,
Plus,
Trash2,
Save,
X,
} from "lucide-react";

type AccountOption = {

value: string;

label: string;

};

type Item = {

account_id?: string;

account_code: string;

account_name: string;

amount: number | string;

};

type Props = {
    items: Item[];
    grandTotal: number;
    saving?: boolean;

    accountOptions?: AccountOption[];

    loadingAccounts?: boolean;

    onSave: (
        items: Item[]
    ) => void | Promise<void>;
};

export default function GeneralItemsTable({

    items,

    grandTotal,

    saving = false,

    accountOptions = [],

    loadingAccounts = false,

    onSave,

}: Props) {
/*
================================================================
EDIT MODE
================================================================
*/

const [
    editing,
    setEditing,
] = useState(false);


/*
================================================================
WORKING COPY

We do not directly modify the parent items.

Changes only become permanent when
Save Items is clicked.
================================================================
*/

const [
    editableItems,
    setEditableItems,
] = useState<Item[]>([]);


/*
================================================================
LOAD ORIGINAL ITEMS
================================================================
*/

useEffect(() => {

    setEditableItems(

        items.map(

            item => {

                /*
                ============================================================
                FIND ACCOUNT ID IF THE API DID NOT RETURN account_id
                ============================================================
                */

                const matchedAccount =
                    accountOptions.find(

                        option =>

                            option.value ===
                            item.account_id

                            ||

                            option.label.startsWith(

                                `${item.account_code} -`

                            )

                    );


                return {

                    ...item,

                    /*
                    ========================================================
                    ALWAYS ENSURE account_id EXISTS
                    ========================================================
                    */

                    account_id:

                        item.account_id ||

                        matchedAccount?.value ||

                        "",


                    amount:

                        item.amount ?? "",

                };

            }

        )

    );

}, [

    items,

    accountOptions,

]);


/*
================================================================
GRAND TOTAL

Uses the editable items while in edit mode.
================================================================
*/

const currentGrandTotal =
    useMemo(

        () =>

            (
                editing

                    ? editableItems

                    : items

            ).reduce(

                (
                    total,
                    item
                ) =>

                    total +

                    Number(

                        item.amount || 0

                    ),

                0

            ),

        [

            editing,

            editableItems,

            items,

        ]

    );


/*
================================================================
MONEY
================================================================
*/

const money =
    (
        value: number | string
    ) =>

        Number(

            value || 0

        ).toLocaleString(

            "en-PH",

            {

                style: "currency",

                currency: "PHP",

            }

        );


/*
================================================================
START EDITING
================================================================
*/

function startEditing() {

    setEditableItems(

        items.map(

            item => {

                const matchedAccount =
                    accountOptions.find(

                        option =>

                            option.value ===
                            item.account_id

                            ||

                            option.label.startsWith(

                                `${item.account_code} -`

                            )

                    );


                return {

                    ...item,

                    account_id:

                        item.account_id ||

                        matchedAccount?.value ||

                        "",


                    amount:

                        item.amount ?? "",

                };

            }

        )

    );


    setEditing(true);

}


/*
================================================================
CANCEL EDITING
================================================================
*/

function cancelEditing() {

    setEditableItems(

        items.map(

            item => ({

                ...item,

                amount:

                    item.amount ?? "",

            })

        )

    );


    setEditing(false);

}


/*
================================================================
UPDATE ITEM
================================================================
*/

function updateItem(

    index: number,

    field: keyof Item,

    value: any

) {

    setEditableItems(

        current => {

            const updated =
                [...current];


            updated[index] = {

                ...updated[index],

                [field]: value,

            };


            return updated;

        }

    );

}


/*
================================================================
ACCOUNT CHANGE

When an account is selected, automatically update:

- account_id
- account_code
- account_name

The option label is:

ACCOUNT_CODE - ACCOUNT_NAME

Same structure as your existing TransactionItems dropdown.
================================================================
*/

function changeAccount(

    index: number,

    selected:
        | AccountOption
        | null

) {

    if (!selected) {

        setEditableItems(

            current => {

                const updated =
                    [...current];


                updated[index] = {

                    ...updated[index],

                    account_id: "",

                    account_code: "",

                    account_name: "",

                };


                return updated;

            }

        );

        return;

    }


    /*
    ------------------------------------------------------------
    SPLIT LABEL

    Expected format:

    ACCOUNT_CODE - ACCOUNT_NAME
    ------------------------------------------------------------
    */

    const separator =
        selected.label.indexOf(
            " - "
        );


    const accountCode =
        separator >= 0

            ? selected.label.substring(

                0,

                separator

            )

            : selected.label;


    const accountName =
        separator >= 0

            ? selected.label.substring(

                separator + 3

            )

            : "";


    setEditableItems(

        current => {

            const updated =
                [...current];


            updated[index] = {

                ...updated[index],

                account_id:

                    selected.value,

                account_code:

                    accountCode,

                account_name:

                    accountName,

            };


            return updated;

        }

    );

}


/*
================================================================
ADD ITEM
================================================================
*/

function addItem() {

    setEditableItems(

        current => [

            ...current,

            {

                account_id: "",

                account_code: "",

                account_name: "",

                amount: "",

            },

        ]

    );

}


/*
================================================================
REMOVE ITEM
================================================================
*/

function removeItem(

    index: number

) {

    setEditableItems(

        current =>

            current.filter(

                (
                    _,

                    itemIndex

                ) =>

                    itemIndex !== index

            )

    );

}


/*
================================================================
SAVE ITEMS
================================================================
*/

async function saveItems() {

    await onSave(

        editableItems

    );


    setEditing(false);

}


/*
================================================================
RENDER ITEMS
================================================================
*/

const displayItems =
    editing

        ? editableItems

        : items;


return (

    <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">


        {/* ========================================================
            HEADER
        ======================================================== */}

        <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">


            <div>

                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">

                    Transaction Items

                </h3>


                <p className="mt-0.5 text-xs text-slate-500">

                    {
                        editing

                            ? "Edit the account distribution and collection amounts"

                            : "Account distribution of this official receipt"
                    }

                </p>

            </div>


            <div className="flex flex-wrap items-center gap-2">


                <div className="rounded-md bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">

                    {displayItems.length} Item
                    {displayItems.length !== 1 && "s"}

                </div>


                {!editing && (

                    <button
                        type="button"
                        onClick={startEditing}
                        disabled={saving}
                        className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-lg
                            bg-blue-600
                            px-3
                            py-2
                            text-xs
                            font-semibold
                            text-white
                            transition
                            hover:bg-blue-700
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                    >

                        <Edit3
                            size={15}
                        />

                        Edit Items

                    </button>

                )}


                {editing && (

                    <>

                        <button
                            type="button"
                            onClick={addItem}
                            disabled={saving}
                            className="
                                inline-flex
                                items-center
                                gap-2
                                rounded-lg
                                border
                                border-blue-200
                                bg-white
                                px-3
                                py-2
                                text-xs
                                font-semibold
                                text-blue-700
                                transition
                                hover:bg-blue-50
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
                        >

                            <Plus
                                size={15}
                            />

                            Add Item

                        </button>


                        <button
                            type="button"
                            onClick={cancelEditing}
                            disabled={saving}
                            className="
                                inline-flex
                                items-center
                                gap-2
                                rounded-lg
                                border
                                border-slate-300
                                bg-white
                                px-3
                                py-2
                                text-xs
                                font-semibold
                                text-slate-600
                                transition
                                hover:bg-slate-100
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
                        >

                            <X
                                size={15}
                            />

                            Cancel

                        </button>


                        <button
                            type="button"
                            onClick={saveItems}
                            disabled={
                                saving ||

                                editableItems.length === 0
                            }
                            className="
                                inline-flex
                                items-center
                                gap-2
                                rounded-lg
                                bg-emerald-600
                                px-3
                                py-2
                                text-xs
                                font-semibold
                                text-white
                                transition
                                hover:bg-emerald-700
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
                        >

                            <Save
                                size={15}
                            />

                            {
                                saving

                                    ? "Saving..."

                                    : "Save Items"
                            }

                        </button>

                    </>

                )}

            </div>

        </div>


        {/* ========================================================
            TABLE
        ======================================================== */}

        <div className="overflow-x-auto">


            <table className="min-w-full text-sm">


                <thead className="bg-slate-100">

                    <tr>


                        <th className="w-16 border-b px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-600">

                            #

                        </th>


                        <th className="border-b px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-600">

                            Account

                        </th>


                        <th className="w-52 border-b px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-600">

                            Amount

                        </th>


                        {editing && (

                            <th className="w-20 border-b px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-600">

                                Action

                            </th>

                        )}

                    </tr>

                </thead>


                <tbody>


                    {displayItems.length > 0 ? (

                        displayItems.map(

                            (
                                item,

                                index

                            ) => (

                                <tr
                                    key={index}
                                    className="border-b last:border-0 hover:bg-slate-50"
                                >


                                    {/* NUMBER */}

                                    <td className="px-4 py-3 text-center font-medium text-slate-500">

                                        {index + 1}

                                    </td>


                                    {/* ACCOUNT */}

                                    <td className="px-4 py-3">


                                        {editing ? (

                                            <Select

                                                options={
                                                    accountOptions
                                                }

                                                isSearchable

                                                isClearable

                                                menuPortalTarget={

                                                    typeof window !==
                                                    "undefined"

                                                        ? document.body

                                                        : undefined

                                                }

                                                menuPosition="fixed"

                                                menuPlacement="auto"

                                                styles={{

                                                    menuPortal:
                                                        base => ({

                                                            ...base,

                                                            zIndex:
                                                                99999,

                                                        }),

                                                }}

                                                value={

                                                    accountOptions.find(

                                                        option =>

                                                            option.value ===
                                                            item.account_id

                                                    )

                                                    ||

                                                    accountOptions.find(

                                                        option =>

                                                            option.label.startsWith(

                                                                `${item.account_code} -`

                                                            )

                                                    )

                                                    ||

                                                    null

                                                }

                                                onChange={

                                                    selected =>

                                                        changeAccount(

                                                            index,

                                                            selected

                                                                ? {

                                                                    value:
                                                                        selected.value,

                                                                    label:
                                                                        selected.label,

                                                                }

                                                                : null

                                                        )

                                                }

                                                isDisabled={

                                                    saving ||

                                                    loadingAccounts

                                                }

                                                placeholder={

                                                    loadingAccounts

                                                        ? "Loading accounts..."

                                                        : "Search account..."

                                                }

                                            />

                                        ) : (

                                            <div>

                                                <p className="font-semibold text-slate-900">

                                                    {
                                                        item.account_code
                                                    }

                                                </p>


                                                <p className="mt-0.5 text-xs text-slate-500">

                                                    {
                                                        item.account_name
                                                    }

                                                </p>

                                            </div>

                                        )}

                                    </td>


                                    {/* AMOUNT */}

                                    <td className="px-4 py-3 text-right">


                                        {editing ? (

                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={
                                                    item.amount ?? ""
                                                }
                                                disabled={saving}
                                                onChange={

                                                    e =>

                                                        updateItem(

                                                            index,

                                                            "amount",

                                                            e.target.value

                                                        )

                                                }
                                                placeholder="0.00"
                                                className="
                                                    w-full
                                                    rounded-lg
                                                    border
                                                    border-slate-300
                                                    bg-white
                                                    px-3
                                                    py-2
                                                    text-right
                                                    font-semibold
                                                    text-slate-900
                                                    outline-none
                                                    transition
                                                    focus:border-blue-500
                                                    focus:ring-2
                                                    focus:ring-blue-100
                                                    disabled:bg-slate-100
                                                "
                                            />

                                        ) : (

                                            <span className="font-semibold text-slate-900">

                                                {
                                                    money(

                                                        item.amount

                                                    )
                                                }

                                            </span>

                                        )}

                                    </td>


                                    {/* REMOVE */}

                                    {editing && (

                                        <td className="px-4 py-3 text-center">

                                            <button
                                                type="button"
                                                disabled={
                                                    saving ||

                                                    editableItems.length ===
                                                        1
                                                }
                                                onClick={() =>

                                                    removeItem(

                                                        index

                                                    )

                                                }
                                                className="
                                                    inline-flex
                                                    items-center
                                                    justify-center
                                                    rounded-lg
                                                    p-2
                                                    text-red-600
                                                    transition
                                                    hover:bg-red-50
                                                    disabled:cursor-not-allowed
                                                    disabled:opacity-40
                                                "
                                                title="Remove item"
                                            >

                                                <Trash2
                                                    size={18}
                                                />

                                            </button>

                                        </td>

                                    )}

                                </tr>

                            )

                        )

                    ) : (

                        <tr>

                            <td
                                colSpan={
                                    editing

                                        ? 4

                                        : 3
                                }
                                className="py-12 text-center text-sm text-slate-500"
                            >

                                No transaction items found.

                            </td>

                        </tr>

                    )}

                </tbody>


                {/* ====================================================
                    GRAND TOTAL
                ==================================================== */}

                {displayItems.length > 0 && (

                    <tfoot className="border-t bg-slate-50">

                        <tr>

                            <td
                                colSpan={
                                    editing

                                        ? 2

                                        : 2
                                }
                                className="px-4 py-4 text-right text-sm font-semibold uppercase tracking-wide text-slate-600"
                            >

                                Grand Total

                            </td>


                            <td className="px-4 py-4 text-right text-lg font-bold text-blue-700">

                                {
                                    money(

                                        currentGrandTotal

                                    )
                                }

                            </td>


                            {editing && (

                                <td />

                            )}

                        </tr>

                    </tfoot>

                )}

            </table>

        </div>

    </div>

);

}