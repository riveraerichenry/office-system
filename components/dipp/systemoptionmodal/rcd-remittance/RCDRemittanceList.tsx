"use client";

import {
    ChevronRight,
    RefreshCw,
    CheckCircle2,
} from "lucide-react";

import {
    RCD,
} from "./RCDRemittanceTypes";


type Props = {

    rcds: RCD[];

    selectedRCDId:
        | string
        | null;

    loading: boolean;

    onSelect: (
        rcd: RCD
    ) => void;

};


function formatCurrency(
    value:
        | number
        | string
        | null
        | undefined
): string {

    return new Intl.NumberFormat(
        "en-PH",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }
    ).format(
        Number(value ?? 0)
    );

}


function formatDate(
    value:
        | string
        | null
        | undefined
): string {

    if (!value) {

        return "—";

    }


    const date =
        new Date(
            value
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return value;

    }


    return date.toLocaleDateString(
        "en-PH",
        {
            year: "numeric",
            month: "short",
            day: "numeric",
        }
    );

}


export default function RCDRemittanceList({

    rcds,

    selectedRCDId,

    loading,

    onSelect,

}: Props) {


    /*
    =====================================================
    LOADING
    =====================================================
    */

    if (
        loading
    ) {

        return (

            <div className="
                flex
                h-full
                items-center
                justify-center
                gap-2
                text-sm
                text-gray-500
            ">

                <RefreshCw
                    size={18}
                    className="
                        animate-spin
                    "
                />

                Loading RCD reports...

            </div>

        );

    }


    /*
    =====================================================
    EMPTY
    =====================================================
    */

    if (
        rcds.length === 0
    ) {

        return (

            <div className="
                flex
                h-full
                items-center
                justify-center
                px-6
                text-center
                text-sm
                text-gray-500
            ">

                No RCD reports found.

            </div>

        );

    }


    /*
    =====================================================
    LIST
    =====================================================
    */

    return (

        <div className="
            space-y-2
            p-3
        ">

            {rcds.map(
                rcd => {

                    const selected =
                        selectedRCDId ===
                        rcd.id;


                    const remitted =
                        rcd.has_remittance ===
                        true;


                    return (

                        <button

                            key={
                                rcd.id
                            }

                            type="button"

                            onClick={() =>
                                onSelect(
                                    rcd
                                )
                            }

                            className={`

                                w-full

                                rounded-xl

                                border

                                p-4

                                text-left

                                transition

                                ${
                                    selected

                                        ? `
                                            border-blue-600
                                            bg-blue-50
                                            shadow-sm
                                        `

                                        : `
                                            border-gray-200
                                            bg-white
                                            hover:border-blue-300
                                            hover:bg-blue-50
                                        `
                                }

                            `}

                        >

                            {/* HEADER */}

                            <div className="
                                flex
                                items-center
                                justify-between
                            ">


                                <span className="
                                    font-bold
                                    text-blue-800
                                ">

                                    {
                                        rcd.report_no
                                    }

                                </span>


                                <ChevronRight

                                    size={18}

                                    className={

                                        selected

                                            ? "text-blue-600"

                                            : "text-gray-400"

                                    }

                                />

                            </div>


                            {/* FUND SOURCE */}

                            <div className="
                                mt-2
                                text-sm
                                font-semibold
                                text-gray-700
                            ">

                                {rcd.fund_code
                                    ? `${rcd.fund_code} - `
                                    : ""}

                                {
                                    rcd.fund_name ??
                                    rcd.acronym ??
                                    "—"
                                }

                            </div>


                            {/* DATE + AMOUNT */}

                            <div className="
                                mt-2
                                flex
                                justify-between
                                text-xs
                                text-gray-500
                            ">

                                <span>

                                    {
                                        formatDate(
                                            rcd.report_date
                                        )
                                    }

                                </span>


                                <strong className="
                                    text-gray-800
                                ">

                                    ₱

                                    {
                                        formatCurrency(
                                            rcd.total_collections
                                        )
                                    }

                                </strong>

                            </div>


                            {/* COVERAGE */}

                            <div className="
                                mt-1
                                text-xs
                                text-gray-500
                            ">

                                Coverage:

                                {" "}

                                {
                                    formatDate(
                                        rcd.date_from
                                    )
                                }

                                {" – "}

                                {
                                    formatDate(
                                        rcd.date_to
                                    )
                                }

                            </div>


                            {/* STATUS */}

                            <div className="
                                mt-2
                                flex
                                items-center
                                justify-between
                            ">


                                {remitted ? (

                                    <span className="
                                        inline-flex
                                        items-center
                                        gap-1
                                        rounded-full
                                        bg-green-100
                                        px-2
                                        py-1
                                        text-[10px]
                                        font-bold
                                        uppercase
                                        text-green-700
                                    ">

                                        <CheckCircle2
                                            size={12}
                                        />

                                        REMITTED

                                    </span>

                                ) : (

                                    <span className="
                                        inline-flex
                                        rounded-full
                                        bg-yellow-100
                                        px-2
                                        py-1
                                        text-[10px]
                                        font-bold
                                        uppercase
                                        text-yellow-700
                                    ">

                                        FOR REMITTANCE

                                    </span>

                                )}


                            </div>


                        </button>

                    );

                }
            )}

        </div>

    );

}