"use client";

import {
    PaymentType,
} from "./RCDRemittanceTypes";


type Props = {

    rcdAmount: number;

   paymentType: PaymentType | null;

    cashAmount: number;

    checkAmount: number;

    onCashAmountChange: (
        value: string
    ) => void;

    onCheckAmountChange: (
        value: string
    ) => void;

};


function formatAmount(
    value: number
): string {

    return new Intl.NumberFormat(
        "en-PH",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }
    ).format(
        value
    );

}


export default function RCDRemittanceSummary({

    rcdAmount,

    paymentType,

    cashAmount,

    checkAmount,

    onCashAmountChange,

    onCheckAmountChange,

}: Props) {


    const totalAmount =
        cashAmount +
        checkAmount;


    const difference =
        rcdAmount -
        totalAmount;


    const balanced =
        Math.abs(
            difference
        ) < 0.01;


    return (

        <div className="
            rounded-lg
            border
            border-gray-200
            bg-white
            p-3
        ">


            {/* HEADER */}

            <div className="
                mb-3
                border-b
                border-gray-200
                pb-2
            ">

                <h3 className="
                    text-sm
                    font-bold
                    text-gray-800
                ">
                    Remittance Summary
                </h3>

            </div>


            {/* RCD AMOUNT */}

            <div className="
                mb-3
                flex
                items-center
                justify-between
                rounded-md
                bg-blue-50
                px-3
                py-2
            ">

                <span className="
                    text-xs
                    font-semibold
                    text-gray-600
                ">
                    RCD Amount
                </span>


                <span className="
                    text-base
                    font-bold
                    text-blue-900
                ">
                    ₱{formatAmount(
                        rcdAmount
                    )}
                </span>

            </div>


            {/* CASH */}

            <div className="
                mb-2
                flex
                items-center
                justify-between
                gap-3
            ">

                <span className="
                    text-xs
                    font-semibold
                    text-gray-600
                ">
                    Cash
                </span>


                {paymentType === "CHECK" ? (

                    <span className="
                        text-sm
                        font-semibold
                        text-gray-400
                    ">
                        ₱0.00
                    </span>

                ) : (

                    <div className="
                        relative
                        w-40
                    ">

                        <span className="
                            absolute
                            left-2
                            top-1/2
                            -translate-y-1/2
                            text-xs
                            text-gray-500
                        ">
                            ₱
                        </span>


                        <input

                            type="number"

                            min="0"

                            step="0.01"

                            value={
                                cashAmount > 0
                                    ? cashAmount
                                    : ""
                            }

                            onChange={e =>
                                onCashAmountChange(
                                    e.target.value
                                )
                            }

                            className="
                                h-8
                                w-full
                                rounded-md
                                border
                                border-gray-300
                                bg-white
                                pl-6
                                pr-2
                                text-right
                                text-sm
                                font-semibold
                                outline-none
                                focus:border-blue-500
                                focus:ring-1
                                focus:ring-blue-500
                            "

                            placeholder="0.00"

                        />

                    </div>

                )}

            </div>


            {/* CHECK */}

            <div className="
                mb-3
                flex
                items-center
                justify-between
                gap-3
            ">

                <span className="
                    text-xs
                    font-semibold
                    text-gray-600
                ">
                    Check
                </span>


                {paymentType === "CASH" ? (

                    <span className="
                        text-sm
                        font-semibold
                        text-gray-400
                    ">
                        ₱0.00
                    </span>

                ) : (

                    <div className="
                        relative
                        w-40
                    ">

                        <span className="
                            absolute
                            left-2
                            top-1/2
                            -translate-y-1/2
                            text-xs
                            text-gray-500
                        ">
                            ₱
                        </span>


                        <input

                            type="number"

                            min="0"

                            step="0.01"

                            value={
                                checkAmount > 0
                                    ? checkAmount
                                    : ""
                            }

                            onChange={e =>
                                onCheckAmountChange(
                                    e.target.value
                                )
                            }

                            className="
                                h-8
                                w-full
                                rounded-md
                                border
                                border-gray-300
                                bg-white
                                pl-6
                                pr-2
                                text-right
                                text-sm
                                font-semibold
                                outline-none
                                focus:border-blue-500
                                focus:ring-1
                                focus:ring-blue-500
                            "

                            placeholder="0.00"

                        />

                    </div>

                )}

            </div>


            {/* TOTAL */}

            <div className="
                flex
                items-center
                justify-between
                border-t
                border-gray-200
                pt-2
            ">

                <span className="
                    text-xs
                    font-bold
                    text-gray-700
                ">
                    Total Remitted
                </span>


                <span className="
                    text-base
                    font-bold
                    text-blue-900
                ">
                    ₱{formatAmount(
                        totalAmount
                    )}
                </span>

            </div>


            {/* DIFFERENCE */}

            <div className="
                mt-2
                flex
                items-center
                justify-between
            ">

                <span className="
                    text-[11px]
                    text-gray-500
                ">
                    Difference
                </span>


                <span className={`
                    text-xs
                    font-bold
                    ${
                        balanced
                            ? "text-green-700"
                            : "text-red-600"
                    }
                `}>

                    ₱{formatAmount(
                        Math.abs(
                            difference
                        )
                    )}

                </span>

            </div>

        </div>

    );

}