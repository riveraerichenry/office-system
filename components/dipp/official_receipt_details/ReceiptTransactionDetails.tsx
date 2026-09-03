"use client";


type Header = {

    payor: string;

    collector?: string;

    payment_mode: string;

    form_code: string;

    encoded_by: string;

    status?: string;

    remarks?: string;

};


type Props = {

    header: Header;

};


export default function ReceiptTransactionDetails({

    header,

}: Props) {

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
                    border-b
                    border-slate-200
                    px-5
                    py-3
                "
            >

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

            </div>


            <div
                className="
                    grid
                    grid-cols-2
                    gap-x-10
                    gap-y-3
                    p-5
                    text-sm
                "
            >

                {/* PAYOR */}

                <div
                    className="
                        grid
                        grid-cols-[150px_1fr]
                        items-center
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

                </div>


                {/* COLLECTOR */}

                <div
                    className="
                        grid
                        grid-cols-[150px_1fr]
                        items-center
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


                {/* PAYMENT MODE */}

                <div
                    className="
                        grid
                        grid-cols-[150px_1fr]
                        items-center
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

                </div>


                {/* FORM */}

                <div
                    className="
                        grid
                        grid-cols-[150px_1fr]
                        items-center
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


                {/* ENCODED BY */}

                <div
                    className="
                        grid
                        grid-cols-[150px_1fr]
                        items-center
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


                {/* STATUS */}

                <div
                    className="
                        grid
                        grid-cols-[150px_1fr]
                        items-center
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


                {/* REMARKS */}

                <div
                    className="
                        col-span-2
                        grid
                        grid-cols-[150px_1fr]
                        items-start
                    "
                >

                    <span
                        className="
                            pt-1
                            font-medium
                            text-slate-500
                        "
                    >

                        Remarks

                    </span>


                    <span
                        className="
                            text-slate-900
                        "
                    >

                        {
                            header.remarks ||
                            "-"
                        }

                    </span>

                </div>

            </div>

        </div>

    );

}