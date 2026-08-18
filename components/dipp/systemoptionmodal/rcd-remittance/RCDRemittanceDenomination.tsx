"use client";

import {
    Denominations,
} from "./RCDRemittanceTypes";


type Props = {

    cashAmount: number;

    denominations: Denominations;

    denominationTotal: number;

    onChange: (
        denomination: number,
        value: string
    ) => void;

};


const DENOMINATIONS: number[] = [

    1000,
    500,
    200,
    100,
    50,
    20,
    10,
    5,
    1,
    0.25,
    0.10,
    0.05,
    0.01,

];


function formatDenomination(
    value: number
): string {

    if (value >= 1) {

        return value.toLocaleString(
            "en-PH",
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }
        );

    }

    return value.toFixed(2);

}


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


export default function RCDRemittanceDenomination({

    cashAmount,

    denominations,

    denominationTotal,

    onChange,

}: Props) {


    const difference =
        cashAmount -
        denominationTotal;


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


           


            {/* TABLE */}

            <div className="
                overflow-hidden
                rounded-md
                border
                border-gray-200
            ">

                <table className="
                    w-full
                    border-collapse
                    text-xs
                ">

                    <thead>

                        <tr className="
                            bg-gray-100
                            text-gray-600
                        ">

                            <th className="
                                border-b
                                border-gray-200
                                px-3
                                py-1.5
                                text-left
                                font-semibold
                            ">
                                Denomination
                            </th>


                            <th className="
                                border-b
                                border-gray-200
                                px-3
                                py-1.5
                                text-center
                                font-semibold
                            ">
                                Qty
                            </th>


                            <th className="
                                border-b
                                border-gray-200
                                px-3
                                py-1.5
                                text-right
                                font-semibold
                            ">
                                Amount
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {DENOMINATIONS.map(
                            denomination => {

                                const quantity =
                                    denominations[
                                        denomination
                                    ] ?? 0;


                                const amount =
                                    denomination *
                                    quantity;


                                return (

                                    <tr
                                        key={
                                            denomination
                                        }
                                        className="
                                            hover:bg-gray-50
                                        "
                                    >

                                        {/* DENOMINATION */}

                                        <td className="
                                            border-b
                                            border-gray-100
                                            px-3
                                            py-1
                                            text-left
                                            font-semibold
                                            text-gray-700
                                        ">

                                            ₱{
                                                formatDenomination(
                                                    denomination
                                                )
                                            }

                                        </td>


                                        {/* QUANTITY */}

                                        <td className="
                                            border-b
                                            border-gray-100
                                            px-3
                                            py-1
                                            text-center
                                        ">

                                            <input

                                                type="number"

                                                min="0"

                                                step="1"

                                                value={
                                                    quantity > 0
                                                        ? quantity
                                                        : ""
                                                }

                                                onChange={e =>
                                                    onChange(
                                                        denomination,
                                                        e.target.value
                                                    )
                                                }

                                                className="
                                                    h-7
                                                    w-20
                                                    rounded
                                                    border
                                                    border-gray-300
                                                    bg-white
                                                    px-2
                                                    text-center
                                                    text-xs
                                                    font-semibold
                                                    outline-none
                                                    focus:border-blue-500
                                                    focus:ring-1
                                                    focus:ring-blue-500
                                                "

                                                placeholder="0"

                                            />

                                        </td>


                                        {/* AMOUNT */}

                                        <td className="
                                            border-b
                                            border-gray-100
                                            px-3
                                            py-1
                                            text-right
                                            font-medium
                                            text-gray-700
                                        ">

                                            ₱{
                                                formatAmount(
                                                    amount
                                                )
                                            }

                                        </td>

                                    </tr>

                                );

                            }
                        )}

                    </tbody>


                    {/* TOTAL */}

                    <tfoot>

                        <tr className="
                            bg-gray-50
                        ">

                            <td
                                colSpan={2}
                                className="
                                    px-3
                                    py-2
                                    text-right
                                    font-bold
                                    text-gray-700
                                "
                            >
                                Denomination Total
                            </td>


                            <td className={`
                                px-3
                                py-2
                                text-right
                                font-bold
                                ${
                                    balanced
                                        ? "text-green-700"
                                        : "text-red-600"
                                }
                            `}>

                                ₱{formatAmount(
                                    denominationTotal
                                )}

                            </td>

                        </tr>

                    </tfoot>

                </table>

            </div>


            {/* DIFFERENCE */}

            {!balanced && (

                <div className="
                    mt-2
                    text-right
                    text-[11px]
                    font-medium
                    text-red-600
                ">

                    Difference:
                    {" "}
                    ₱{formatAmount(
                        Math.abs(
                            difference
                        )
                    )}

                </div>

            )}

        </div>

    );

}