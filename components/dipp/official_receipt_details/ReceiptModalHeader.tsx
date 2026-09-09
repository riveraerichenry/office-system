"use client";

import {
X,
Printer,
Calendar,
User,
BadgeDollarSign,
UserRound,
} from "lucide-react";

type Header = {

or_number: string;

receipt_date: string;

grand_total: number;

status?: string;

collector?: string;

encoded_by?: string;

};

type Props = {

header: Header | null;

loading: boolean;

disabled: boolean;

onPrint: () => void;

onClose: () => void;

};

export default function ReceiptModalHeader({

header,

loading,

disabled,

onPrint,

onClose,

}: Props) {

const total =
    Number(
        header?.grand_total ?? 0
    );


const formattedTotal =
    total.toLocaleString(
        "en-PH",
        {
            style: "currency",
            currency: "PHP",
        }
    );


const formattedDate =
    header?.receipt_date

        ? new Date(
            header.receipt_date
        ).toLocaleDateString(
            "en-PH",
            {
                year: "numeric",
                month: "long",
                day: "numeric",
            }
        )

        : "-";


const status =
    header?.status ||
    "Posted";


return (

    <div className="border-b border-slate-700 bg-slate-900 text-white">


        <div className="flex flex-col gap-6 px-6 py-5 lg:flex-row lg:items-end lg:justify-between">


            {/* =================================================
                LEFT SIDE
            ================================================= */}

            <div className="flex flex-wrap items-end gap-x-10 gap-y-5">


                {/* OR NUMBER */}

                <div>

                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">

                        Official Receipt No.

                    </p>


                    <p className="mt-1 text-3xl font-bold tracking-wide text-white">

                        {
                            header?.or_number ||
                            "-"
                        }

                    </p>

                </div>


                {/* DATE */}

                <div>

                    <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">

                        <Calendar
                            size={13}
                        />

                        Receipt Date

                    </p>


                    <p className="mt-1 text-sm font-medium text-slate-100">

                        {
                            formattedDate
                        }

                    </p>

                </div>


                {/* STATUS */}

                <div>

                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">

                        Status

                    </p>


                    <span
                        className={`
                            mt-1
                            inline-flex
                            rounded-full
                            px-3
                            py-1
                            text-xs
                            font-semibold

                            ${
                                status === "Posted"

                                    ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30"

                                    : "bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/30"
                            }
                        `}
                    >

                        {
                            status
                        }

                    </span>

                </div>


                {/* COLLECTOR */}

                <div>

                    <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">

                        <User
                            size={13}
                        />

                        Collector

                    </p>


                    <p className="mt-1 text-sm font-medium text-slate-100">

                        {
                            header?.collector ||
                            "-"
                        }

                    </p>

                </div>


                {/* ENCODED BY */}

                <div>

                    <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">

                        <UserRound
                            size={13}
                        />

                        Encoded By

                    </p>


                    <p className="mt-1 text-sm font-medium text-slate-100">

                        {
                            header?.encoded_by ||
                            "-"
                        }

                    </p>

                </div>


            </div>


            {/* =================================================
                RIGHT SIDE
            ================================================= */}

            <div className="flex items-end gap-3">


                {/* GRAND TOTAL */}

                <div className="text-right">

                    <p className="flex items-center justify-end gap-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">

                        <BadgeDollarSign
                            size={14}
                        />

                        Grand Total

                    </p>


                    <p className="mt-1 whitespace-nowrap text-3xl font-bold tracking-tight text-emerald-400">

                        {
                            formattedTotal
                        }

                    </p>

                </div>


                {/* PRINT BUTTON */}

                <button
                    type="button"
                    onClick={onPrint}
                    disabled={
                        loading ||
                        disabled
                    }
                    className="
                        inline-flex
                        items-center
                        rounded-lg
                        bg-blue-600
                        px-5
                        py-3
                        text-sm
                        font-semibold
                        text-white
                        transition
                        hover:bg-blue-700
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                    "
                >

                    <Printer
                        size={18}
                        className="mr-2"
                    />

                    Print

                </button>


                {/* CLOSE BUTTON */}

                <button
                    type="button"
                    onClick={onClose}
                    className="
                        inline-flex
                        items-center
                        justify-center
                        rounded-lg
                        border
                        border-slate-700
                        bg-slate-800
                        p-3
                        text-slate-300
                        transition
                        hover:bg-slate-700
                        hover:text-white
                    "
                    aria-label="Close"
                >

                    <X
                        size={20}
                    />

                </button>


            </div>


        </div>

    </div>

);

}