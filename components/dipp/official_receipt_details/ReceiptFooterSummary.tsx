"use client";


type Header = {

    grand_total: number;

    status?: string;

};


type Props = {

    header: Header;

    itemCount: number;

};


export default function ReceiptFooterSummary({

    header,

    itemCount,

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
                mt-5
                rounded-xl
                border
                border-slate-200
                bg-white
                shadow-sm
            "
        >

            <div
                className="
                    flex
                    items-center
                    justify-between
                    px-6
                    py-4
                "
            >

                <div
                    className="
                        flex
                        items-center
                        gap-10
                    "
                >

                    <div>

                        <p
                            className="
                                text-[11px]
                                font-semibold
                                uppercase
                                tracking-wide
                                text-slate-500
                            "
                        >

                            Transaction Status

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


                    <div>

                        <p
                            className="
                                text-[11px]
                                font-semibold
                                uppercase
                                tracking-wide
                                text-slate-500
                            "
                        >

                            Total Items

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
                                itemCount
                            }

                        </p>

                    </div>

                </div>


                <div
                    className="
                        text-right
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
                            text-2xl
                            font-bold
                            text-blue-700
                        "
                    >

                        {
                            formattedTotal
                        }

                    </p>

                </div>

            </div>

        </div>

    );

}