"use client";

import {
useEffect,
useState,
} from "react";

import {
Edit3,
Save,
X,
} from "lucide-react";

type Header = {

payor: string;

collector?: string;

payment_mode: string;

form_code: string;

encoded_by: string;

status?: string;

remarks?: string;

};

type EditableDetails = {

payor: string;

payment_mode: string;

remarks: string;

};

type Props = {

header: Header;

saving?: boolean;

onSave?: (
    details: EditableDetails
) => void | Promise<void>;

};

export default function ReceiptTransactionDetails({

header,

saving = false,

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
EDITABLE DETAILS
================================================================
*/

const [
    details,
    setDetails,
] = useState<EditableDetails>({

    payor:
        header?.payor || "",

    payment_mode:
        header?.payment_mode || "",

    remarks:
        header?.remarks || "",

});


/*
================================================================
UPDATE DETAILS WHEN HEADER CHANGES
================================================================
*/

useEffect(() => {

    setDetails({

        payor:
            header?.payor || "",

        payment_mode:
            header?.payment_mode || "",

        remarks:
            header?.remarks || "",

    });

}, [

    header?.payor,

    header?.payment_mode,

    header?.remarks,

]);


/*
================================================================
STATUS
================================================================
*/

const status =
    header?.status ||
    "Posted";


/*
================================================================
START EDITING
================================================================
*/

function startEditing() {

    setDetails({

        payor:
            header?.payor || "",

        payment_mode:
            header?.payment_mode || "",

        remarks:
            header?.remarks || "",

    });


    setEditing(
        true
    );

}


/*
================================================================
CANCEL EDITING
================================================================
*/

function cancelEditing() {

    setDetails({

        payor:
            header?.payor || "",

        payment_mode:
            header?.payment_mode || "",

        remarks:
            header?.remarks || "",

    });


    setEditing(
        false
    );

}


/*
================================================================
SAVE DETAILS
================================================================
*/

async function saveDetails() {

    if (

        !details.payor.trim()

    ) {

        return;

    }


    if (

        onSave

    ) {

        await onSave({

            payor:
                details.payor.trim(),

            payment_mode:
                details.payment_mode,

            remarks:
                details.remarks,

        });

    }


    setEditing(
        false
    );

}


return (

    <div
        className="
            mt-5
            overflow-hidden
            rounded-xl
            border
            border-slate-200
            bg-white
            shadow-sm
        "
    >

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div
            className="
                flex
                flex-col
                gap-3
                border-b
                border-slate-200
                bg-slate-50
                px-5
                py-3
                sm:flex-row
                sm:items-center
                sm:justify-between
            "
        >

            <div>

                <h3
                    className="
                        text-sm
                        font-semibold
                        uppercase
                        tracking-wide
                        text-slate-700
                    "
                >

                    Transaction Details

                </h3>


                <p
                    className="
                        mt-0.5
                        text-xs
                        text-slate-500
                    "
                >

                    {

                        editing

                            ? "Edit transaction information"

                            : "Official receipt transaction information"

                    }

                </p>

            </div>


            <div
                className="
                    flex
                    flex-wrap
                    items-center
                    gap-2
                "
            >

                {

                    !editing && (

                        <button
                            type="button"
                            onClick={
                                startEditing
                            }
                            disabled={
                                saving
                            }
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

                            Edit Details

                        </button>

                    )

                }


                {

                    editing && (

                        <>

                            <button
                                type="button"
                                onClick={
                                    cancelEditing
                                }
                                disabled={
                                    saving
                                }
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
                                onClick={
                                    saveDetails
                                }
                                disabled={
                                    saving ||

                                    !details.payor.trim()
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

                                        : "Save Details"

                                }

                            </button>

                        </>

                    )

                }

            </div>

        </div>


        {/* ====================================================
            DETAILS
        ==================================================== */}

        <div
            className="
                grid
                grid-cols-1
                gap-x-10
                gap-y-4
                p-5
                text-sm
                lg:grid-cols-2
            "
        >


            {/* ====================================================
                PAYOR
            ==================================================== */}

            <div
                className="
                    grid
                    grid-cols-[150px_1fr]
                    items-center
                    gap-3
                "
            >

                <span
                    className="
                        font-medium
                        text-slate-500
                    "
                >

                    Payor

                </span>


                {

                    editing

                        ? (

                            <input
                                type="text"
                                value={
                                    details.payor
                                }
                                disabled={
                                    saving
                                }
                                onChange={

                                    e =>

                                        setDetails(

                                            current => ({

                                                ...current,

                                                payor:
                                                    e.target.value,

                                            })

                                        )

                                }
                                placeholder="Enter payor name"
                                className="
                                    w-full
                                    rounded-lg
                                    border
                                    border-slate-300
                                    bg-white
                                    px-3
                                    py-2
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

                        )

                        : (

                            <span
                                className="
                                    font-semibold
                                    text-slate-900
                                "
                            >

                                {

                                    header.payor ||
                                    "-"

                                }

                            </span>

                        )

                }

            </div>


            {/* ====================================================
                COLLECTOR
            ==================================================== */}

            <div
                className="
                    grid
                    grid-cols-[150px_1fr]
                    items-center
                    gap-3
                "
            >

                <span
                    className="
                        font-medium
                        text-slate-500
                    "
                >

                    Collector

                </span>


                <span
                    className="
                        font-semibold
                        text-slate-900
                    "
                >

                    {

                        header.collector ||
                        "-"

                    }

                </span>

            </div>


            {/* ====================================================
                PAYMENT MODE
            ==================================================== */}

            <div
                className="
                    grid
                    grid-cols-[150px_1fr]
                    items-center
                    gap-3
                "
            >

                <span
                    className="
                        font-medium
                        text-slate-500
                    "
                >

                    Payment Mode

                </span>


                {

                    editing

                        ? (

                            <select
                                value={
                                    details.payment_mode
                                }
                                disabled={
                                    saving
                                }
                                onChange={

                                    e =>

                                        setDetails(

                                            current => ({

                                                ...current,

                                                payment_mode:
                                                    e.target.value,

                                            })

                                        )

                                }
                                className="
                                    w-full
                                    rounded-lg
                                    border
                                    border-slate-300
                                    bg-white
                                    px-3
                                    py-2
                                    font-semibold
                                    text-slate-900
                                    outline-none
                                    transition
                                    focus:border-blue-500
                                    focus:ring-2
                                    focus:ring-blue-100
                                    disabled:bg-slate-100
                                "
                            >

                                <option value="Cash">

                                    Cash

                                </option>


                                <option value="Check">

                                    Check

                                </option>


                                <option value="Online">

                                    Online

                                </option>


                                <option value="Others">

                                    Others

                                </option>

                            </select>

                        )

                        : (

                            <span
                                className="
                                    font-semibold
                                    text-slate-900
                                "
                            >

                                {

                                    header.payment_mode ||
                                    "-"

                                }

                            </span>

                        )

                }

            </div>


            {/* ====================================================
                ACCOUNTABLE FORM
                READ ONLY
            ==================================================== */}

            <div
                className="
                    grid
                    grid-cols-[150px_1fr]
                    items-center
                    gap-3
                "
            >

                <span
                    className="
                        font-medium
                        text-slate-500
                    "
                >

                    Accountable Form

                </span>


                <span
                    className="
                        font-semibold
                        text-slate-900
                    "
                >

                    {

                        header.form_code ||
                        "-"

                    }

                </span>

            </div>


            {/* ====================================================
                ENCODED BY
                READ ONLY
            ==================================================== */}

            <div
                className="
                    grid
                    grid-cols-[150px_1fr]
                    items-center
                    gap-3
                "
            >

                <span
                    className="
                        font-medium
                        text-slate-500
                    "
                >

                    Encoded By

                </span>


                <span
                    className="
                        font-semibold
                        text-slate-900
                    "
                >

                    {

                        header.encoded_by ||
                        "-"

                    }

                </span>

            </div>


            {/* ====================================================
                STATUS
                READ ONLY
            ==================================================== */}

            <div
                className="
                    grid
                    grid-cols-[150px_1fr]
                    items-center
                    gap-3
                "
            >

                <span
                    className="
                        font-medium
                        text-slate-500
                    "
                >

                    Status

                </span>


                <span
                    className={`

                        inline-flex
                        w-fit
                        rounded-full
                        px-2.5
                        py-1
                        text-xs
                        font-semibold

                        ${

                            status ===
                            "Posted"

                                ? "bg-green-100 text-green-700"

                                : "bg-amber-100 text-amber-700"

                        }

                    `}
                >

                    {

                        status

                    }

                </span>

            </div>


            {/* ====================================================
                REMARKS
            ==================================================== */}

            <div
                className="
                    col-span-1
                    grid
                    grid-cols-[150px_1fr]
                    items-start
                    gap-3
                    lg:col-span-2
                "
            >

                <span
                    className="
                        pt-2
                        font-medium
                        text-slate-500
                    "
                >

                    Remarks

                </span>


                {

                    editing

                        ? (

                            <textarea
                                value={
                                    details.remarks
                                }
                                disabled={
                                    saving
                                }
                                onChange={

                                    e =>

                                        setDetails(

                                            current => ({

                                                ...current,

                                                remarks:
                                                    e.target.value,

                                            })

                                        )

                                }
                                rows={3}
                                placeholder="Enter remarks..."
                                className="
                                    w-full
                                    resize-none
                                    rounded-lg
                                    border
                                    border-slate-300
                                    bg-white
                                    px-3
                                    py-2
                                    text-slate-900
                                    outline-none
                                    transition
                                    focus:border-blue-500
                                    focus:ring-2
                                    focus:ring-blue-100
                                    disabled:bg-slate-100
                                "
                            />

                        )

                        : (

                            <span
                                className="
                                    whitespace-pre-wrap
                                    text-slate-900
                                "
                            >

                                {

                                    header.remarks ||
                                    "-"

                                }

                            </span>

                        )

                }

            </div>

        </div>

    </div>

);

}