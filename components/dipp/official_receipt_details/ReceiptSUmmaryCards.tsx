"use client";


type Header = {

    or_number: string;

    receipt_date: string;

    grand_total: number;

    status?: string;

};


type Props = {

    header: Header;

};


export default function ReceiptSummaryCards({

    header,

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


    const status =
        header?.status ||
        "Posted";


    return (

        <div
            className="
                grid
                grid-cols-4
                gap-4
            "
        >

            {/* =====================================================
                OR NUMBER
            ===================================================== */}

            <div
                className="
                    rounded-lg
                    border
                    bg-white
                    p-4
                    shadow-sm
                "
            >

                <p
                    className="
                        text-[11px]
                        font-semibold
                        uppercase
                        tracking-wide
                        text-slate-500
                    "
                >

                    OR Number

                </p>


                <p
                    className="
                        mt-1
                        text-lg
                        font-bold
                        text-slate-900
                    "
                >

                    {
                        header.or_number
                    }

                </p>

            </div>


            {/* =====================================================
                RECEIPT DATE
            ===================================================== */}

            <div
                className="
                    rounded-lg
                    border
                    bg-white
                    p-4
                    shadow-sm
                "
            >

                <p
                    className="
                        text-[11px]
                        font-semibold
                        uppercase
                        tracking-wide
                        text-slate-500
                    "
                >

                    Receipt Date

                </p>


                <p
                    className="
                        mt-1
                        font-medium
                        text-slate-900
                    "
                >

                    {
                        header.receipt_date

                            ? new Date(
                                header.receipt_date
                            ).toLocaleDateString(
                                "en-PH",
                                {
                                    year:
                                        "numeric",

                                    month:
                                        "long",

                                    day:
                                        "numeric",
                                }
                            )

                            : "-"
                    }

                </p>

            </div>


            {/* =====================================================
                GRAND TOTAL
            ===================================================== */}

            <div
                className="
                    rounded-lg
                    border
                    bg-white
                    p-4
                    shadow-sm
                "
            >

                <p
                    className="
                        text-[11px]
                        font-semibold
                        uppercase
                        tracking-wide
                        text-slate-500
                    "
                >

                    Grand Total

                </p>


                <p
                    className="
                        mt-1
                        text-xl
                        font-bold
                        text-blue-700
                    "
                >

                    {
                        formattedTotal
                    }

                </p>

            </div>


            {/* =====================================================
                STATUS
            ===================================================== */}

            <div
                className="
                    rounded-lg
                    border
                    bg-white
                    p-4
                    shadow-sm
                "
            >

                <p
                    className="
                        text-[11px]
                        font-semibold
                        uppercase
                        tracking-wide
                        text-slate-500
                    "
                >

                    Status

                </p>


                <span
                    className={`
                        mt-2
                        inline-flex
                        rounded-full
                        px-3
                        py-1
                        text-xs
                        font-semibold

                        ${
                            status === "Posted"

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

        </div>

    );

}