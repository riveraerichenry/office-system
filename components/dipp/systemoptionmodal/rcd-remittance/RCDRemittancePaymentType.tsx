"use client";

import {
    PaymentType,
} from "./RCDRemittanceTypes";


type Props = {

    paymentType:
        | PaymentType
        | null;

    onChange: (
        value: PaymentType
    ) => void;

};


export default function RCDRemittancePaymentType({

    paymentType,

    onChange,

}: Props) {

    return (

        <div className="
            rounded-lg
            border
            border-gray-200
            bg-white
            p-3
        ">


            <div className="
                mb-2
            ">

                <h3 className="
                    text-sm
                    font-bold
                    text-gray-800
                ">
                    Payment Type
                </h3>

                <p className="
                    text-[11px]
                    text-gray-500
                ">
                    Select how the RCD was remitted.
                </p>

            </div>


            <div className="
                grid
                grid-cols-3
                gap-2
            ">


                {/* CASH */}

                <button
                    type="button"
                    onClick={() =>
                        onChange(
                            "CASH"
                        )
                    }
                    className={`
                        rounded-md
                        border
                        px-3
                        py-2
                        text-xs
                        font-semibold
                        transition

                        ${
                            paymentType === "CASH"
                                ? `
                                    border-blue-600
                                    bg-blue-600
                                    text-white
                                `
                                : `
                                    border-gray-300
                                    bg-white
                                    text-gray-700
                                    hover:bg-gray-50
                                `
                        }
                    `}
                >
                    CASH
                </button>


                {/* CHECK */}

                <button
                    type="button"
                    onClick={() =>
                        onChange(
                            "CHECK"
                        )
                    }
                    className={`
                        rounded-md
                        border
                        px-3
                        py-2
                        text-xs
                        font-semibold
                        transition

                        ${
                            paymentType === "CHECK"
                                ? `
                                    border-blue-600
                                    bg-blue-600
                                    text-white
                                `
                                : `
                                    border-gray-300
                                    bg-white
                                    text-gray-700
                                    hover:bg-gray-50
                                `
                        }
                    `}
                >
                    CHECK
                </button>


                {/* BOTH */}

                <button
                    type="button"
                    onClick={() =>
                        onChange(
                            "BOTH"
                        )
                    }
                    className={`
                        rounded-md
                        border
                        px-3
                        py-2
                        text-xs
                        font-semibold
                        transition

                        ${
                            paymentType === "BOTH"
                                ? `
                                    border-blue-600
                                    bg-blue-600
                                    text-white
                                `
                                : `
                                    border-gray-300
                                    bg-white
                                    text-gray-700
                                    hover:bg-gray-50
                                `
                        }
                    `}
                >
                    BOTH
                </button>

            </div>

        </div>

    );

}