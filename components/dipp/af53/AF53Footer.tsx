"use client";

import {
    useEffect,
    useState,
} from "react";


type Props = {

    saving: boolean;

    onClose: () => void;

    onProcess: (
        grandTotal: number,
        paymentReceived: number
    ) => void;

};


export default function AF53Footer({

    saving,
    onClose,
    onProcess,

}: Props) {


    /*
    |--------------------------------------------------------------------------
    | Grand Total
    |--------------------------------------------------------------------------
    */

    const [
        grandTotal,
        setGrandTotal
    ] = useState<number>(
        5.00
    );


    /*
    |--------------------------------------------------------------------------
    | Payment Received
    |--------------------------------------------------------------------------
    */

    const [
        paymentReceived,
        setPaymentReceived
    ] = useState<number>(
        0
    );


    /*
    |--------------------------------------------------------------------------
    | Change
    |--------------------------------------------------------------------------
    */

    const change =
        Math.max(
            paymentReceived -
            grandTotal,
            0
        );


    /*
    |--------------------------------------------------------------------------
    | Process Validation
    |--------------------------------------------------------------------------
    */

    const canProcess =
        !saving &&
        grandTotal >= 0 &&
        paymentReceived >= grandTotal;


    /*
    |--------------------------------------------------------------------------
    | Process
    |--------------------------------------------------------------------------
    */

    const handleProcess = () => {

        if (!canProcess) {
            return;
        }


        onProcess(
            grandTotal,
            paymentReceived
        );

    };


    /*
    |--------------------------------------------------------------------------
    | Currency
    |--------------------------------------------------------------------------
    */

    const formatCurrency = (
        value: number
    ) => {

        return value.toLocaleString(
            "en-PH",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }
        );

    };


    return (

        <div
            className="
                flex
                shrink-0
                items-center
                justify-between
                gap-4
                border-t
                bg-white
                px-6
                py-4
            "
        >

            {/* =========================================================
                CANCEL
            ========================================================= */}

            <button
                type="button"
                disabled={saving}
                onClick={onClose}
                className="
                    shrink-0
                    rounded-lg
                    border
                    border-slate-300
                    px-6
                    py-2.5
                    font-semibold
                    text-slate-700
                    transition
                    hover:bg-slate-100
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                "
            >

                Cancel

            </button>


            {/* =========================================================
                PAYMENT AREA
            ========================================================= */}

            <div
                className="
                    ml-auto
                    flex
                    items-center
                    gap-4
                "
            >


                {/* =====================================================
                    PAYMENT RECEIVED
                ===================================================== */}

                <div
                    className="
                        flex
                        flex-col
                        items-center
                    "
                >

                    <label
                        className="
                            mb-1
                            text-xs
                            font-medium
                            uppercase
                            tracking-wide
                            text-slate-500
                        "
                    >
                        Payment Received
                    </label>


                    <div
                        className="
                            flex
                            h-[58px]
                            w-[252px]
                            items-center
                            rounded-lg
                            border
                            border-slate-300
                            bg-white
                            px-4
                        "
                    >

                        <span
                            className="
                                mr-2
                                text-lg
                                font-semibold
                                text-slate-500
                            "
                        >
                            ₱
                        </span>


                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={
                                paymentReceived === 0
                                    ? ""
                                    : paymentReceived
                            }
                            onChange={(e) => {

                                const value =
                                    e.target.value;


                                if (
                                    value === ""
                                ) {

                                    setPaymentReceived(
                                        0
                                    );

                                    return;

                                }


                                const number =
                                    Number(
                                        value
                                    );


                                if (
                                    Number.isFinite(
                                        number
                                    )
                                ) {

                                    setPaymentReceived(
                                        Math.max(
                                            number,
                                            0
                                        )
                                    );

                                }

                            }}
                            placeholder="Enter payment"
                            disabled={saving}
                            className="
                                w-full
                                border-0
                                bg-transparent
                                text-right
                                text-lg
                                font-semibold
                                text-slate-700
                                outline-none
                                focus:ring-0
                            "
                        />

                    </div>

                </div>


                {/* =====================================================
                    GRAND TOTAL
                ===================================================== */}

                <div
                    className="
                        flex
                        h-[74px]
                        w-[180px]
                        flex-col
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-blue-100
                        bg-blue-50
                        px-3
                    "
                >

                    <label
                        className="
                            mb-0.5
                            text-xs
                            font-medium
                            uppercase
                            tracking-wide
                            text-slate-500
                        "
                    >
                        Grand Total
                    </label>


                    <div
                        className="
                            flex
                            items-center
                            justify-center
                        "
                    >

                        <span
                            className="
                                mr-1
                                text-lg
                                font-bold
                                text-blue-700
                            "
                        >
                            ₱
                        </span>


                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={
                                grandTotal
                            }
                            onChange={(e) => {

                                const value =
                                    Number(
                                        e.target.value
                                    );


                                if (
                                    Number.isFinite(
                                        value
                                    )
                                ) {

                                    setGrandTotal(
                                        Math.max(
                                            value,
                                            0
                                        )
                                    );

                                }

                            }}
                            disabled={saving}
                            className="
                                w-[105px]
                                border-0
                                bg-transparent
                                p-0
                                text-center
                                text-xl
                                font-bold
                                text-blue-700
                                outline-none
                                focus:ring-0
                            "
                        />

                    </div>

                </div>


                {/* =====================================================
                    CHANGE
                ===================================================== */}

                <div
                    className="
                        flex
                        h-[74px]
                        w-[180px]
                        flex-col
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-emerald-100
                        bg-emerald-50
                        px-3
                    "
                >

                    <div
                        className="
                            mb-0.5
                            text-xs
                            font-medium
                            uppercase
                            tracking-wide
                            text-slate-500
                        "
                    >
                        Change
                    </div>


                    <div
                        className="
                            text-xl
                            font-bold
                            text-emerald-700
                        "
                    >

                        ₱
                        {formatCurrency(change)}

                    </div>

                </div>


                {/* =====================================================
                    PROCESS
                ===================================================== */}

                <button
                    type="button"
                    disabled={
                        !canProcess
                    }
                    onClick={
                        handleProcess
                    }
                    className="
                        h-[48px]
                        min-w-[196px]
                        rounded-lg
                        bg-blue-600
                        px-7
                        py-2.5
                        font-semibold
                        text-white
                        transition
                        hover:bg-blue-700
                        disabled:cursor-not-allowed
                        disabled:bg-slate-300
                        disabled:text-white
                    "
                >

                    {
                        saving
                            ? "Processing..."
                            : "Process AF53"
                    }

                </button>

            </div>

        </div>

    );

}