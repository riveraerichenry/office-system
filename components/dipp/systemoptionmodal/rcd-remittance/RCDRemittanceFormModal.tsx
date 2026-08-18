"use client";

import {
    useMemo,
    useState,
} from "react";

import axios from "axios";

import Swal from "sweetalert2";

import {
    X,
} from "lucide-react";

import {
    RCD,
    RCDRemittance,
    PaymentType,
    Denominations,
} from "./RCDRemittanceTypes";

import RCDRemittancePaymentType
    from "./RCDRemittancePaymentType";

import RCDRemittanceSummary
    from "./RCDRemittanceSummary";

import RCDRemittanceDenomination
    from "./RCDRemittanceDenomination";


type Props = {

    open: boolean;

    rcd: RCD | null;

    onClose: () => void;

    onSuccess: (
        remittance: RCDRemittance
    ) => void;

};


/*
=============================================================
NUMBER
=============================================================
*/

function toNumber(
    value: unknown
): number {

    const number =
        Number(
            value ?? 0
        );

    return Number.isFinite(
        number
    )
        ? number
        : 0;
}


/*
=============================================================
FORMAT AMOUNT
=============================================================
*/

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


/*
=============================================================
COMPONENT
=============================================================
*/

export default function RCDRemittanceFormModal({

    open,

    rcd,

    onClose,

    onSuccess,

}: Props) {


    /*
    =========================================================
    SAVING
    =========================================================
    */

    const [
        saving,
        setSaving,
    ] = useState(false);


    /*
    =========================================================
    PAYMENT TYPE
    =========================================================

    IMPORTANT:
    null means no payment type has been selected yet.
    =========================================================
    */

    const [
        paymentType,
        setPaymentType,
    ] = useState<PaymentType | null>(
        null
    );


    /*
    =========================================================
    CASH AMOUNT
    =========================================================
    */

    const [
        cashAmount,
        setCashAmount,
    ] = useState(0);


    /*
    =========================================================
    CHECK AMOUNT
    =========================================================
    */

    const [
        checkAmount,
        setCheckAmount,
    ] = useState(0);


    /*
    =========================================================
    DENOMINATIONS
    =========================================================
    */

    const [
        denominations,
        setDenominations,
    ] = useState<Denominations>({});


    /*
    =========================================================
    RCD AMOUNT
    =========================================================
    */

    const rcdAmount =
        toNumber(
            rcd?.total_collections
        );


    /*
    =========================================================
    DENOMINATION TOTAL
    =========================================================
    */

    const denominationTotal =
        useMemo(

            () => {

                return Object.entries(
                    denominations
                ).reduce(

                    (
                        total,
                        [
                            denomination,
                            quantity,
                        ]
                    ) => {

                        return (
                            total +
                            (
                                Number(
                                    denomination
                                ) *
                                Number(
                                    quantity
                                )
                            )
                        );

                    },

                    0

                );

            },

            [
                denominations,
            ]

        );


    /*
    =========================================================
    TOTAL REMITTED
    =========================================================
    */

    const totalRemitted =
        cashAmount +
        checkAmount;


    /*
    =========================================================
    DIFFERENCE
    =========================================================
    */

    const remittanceDifference =
        rcdAmount -
        totalRemitted;


    /*
    =========================================================
    DENOMINATION BALANCE
    =========================================================
    */

    const denominationDifference =
        cashAmount -
        denominationTotal;


    /*
    =========================================================
    VALIDATION
    =========================================================
    */

    const amountsBalanced =
        Math.abs(
            remittanceDifference
        ) < 0.01;


    /*
    =========================================================
    DENOMINATION VALIDATION
    =========================================================

    CHECK does not require cash denominations.

    CASH and BOTH require the denomination
    total to equal the cash amount.
    =========================================================
    */

    const denominationsBalanced =
        paymentType === "CHECK"

            ? true

            : Math.abs(
                denominationDifference
            ) < 0.01;


    /*
    =========================================================
    CAN SAVE
    =========================================================

    Payment type MUST be selected.
    =========================================================
    */

    const canSave =
        !saving &&
        paymentType !== null &&
        amountsBalanced &&
        denominationsBalanced;


    /*
    =========================================================
    PAYMENT TYPE
    =========================================================
    */

    function handlePaymentTypeChange(
        value: PaymentType
    ) {

        setPaymentType(
            value
        );


        /*
        =====================================================
        CASH
        =====================================================
        */

        if (
            value ===
            "CASH"
        ) {

            setCashAmount(
                rcdAmount
            );

            setCheckAmount(
                0
            );

        }


        /*
        =====================================================
        CHECK
        =====================================================
        */

        if (
            value ===
            "CHECK"
        ) {

            setCashAmount(
                0
            );

            setCheckAmount(
                rcdAmount
            );

            setDenominations(
                {}
            );

        }


        /*
        =====================================================
        BOTH
        =====================================================
        */

        if (
            value ===
            "BOTH"
        ) {

            setCashAmount(
                0
            );

            setCheckAmount(
                0
            );

        }

    }


    /*
    =========================================================
    CASH AMOUNT
    =========================================================
    */

    function handleCashAmountChange(
        value: string
    ) {

        const amount =
            Math.max(
                0,
                Number(
                    value
                ) || 0
            );


        setCashAmount(
            amount
        );

    }


    /*
    =========================================================
    CHECK AMOUNT
    =========================================================
    */

    function handleCheckAmountChange(
        value: string
    ) {

        const amount =
            Math.max(
                0,
                Number(
                    value
                ) || 0
            );


        setCheckAmount(
            amount
        );

    }


    /*
    =========================================================
    DENOMINATION
    =========================================================
    */

    function updateDenomination(

        denomination: number,

        value: string

    ) {

        const quantity =
            Math.max(
                0,
                Math.floor(
                    Number(
                        value
                    ) || 0
                )
            );


        setDenominations(
            previous => ({

                ...previous,

                [denomination]:
                    quantity,

            })
        );

    }


    /*
    =========================================================
    SAVE REMITTANCE
    =========================================================
    */

    async function saveRemittance() {

        /*
        =====================================================
        RCD REQUIRED
        =====================================================
        */

        if (
            !rcd
        ) {

            return;

        }


        /*
        =====================================================
        PAYMENT TYPE REQUIRED
        =====================================================
        */

        if (
            !paymentType
        ) {

            await Swal.fire({

                icon:
                    "warning",

                title:
                    "Payment Type Required",

                text:
                    "Please select a payment type before saving the remittance.",

            });

            return;

        }


        /*
        =====================================================
        AMOUNT VALIDATION
        =====================================================
        */

        if (
            !amountsBalanced
        ) {

            await Swal.fire({

                icon:
                    "warning",

                title:
                    "Amount Does Not Match",

                text:
                    `Total remitted must equal the RCD amount of ₱${formatAmount(
                        rcdAmount
                    )}.`,

            });

            return;

        }


        /*
        =====================================================
        DENOMINATION VALIDATION
        =====================================================
        */

        if (
            !denominationsBalanced
        ) {

            await Swal.fire({

                icon:
                    "warning",

                title:
                    "Denomination Does Not Match",

                text:
                    `Cash denominations must equal the cash amount of ₱${formatAmount(
                        cashAmount
                    )}.`,

            });

            return;

        }


        /*
        =====================================================
        SAVE
        =====================================================
        */

        try {

            setSaving(
                true
            );


            const response =
                await axios.post(

                    "/api/rcd/remittance",

                    {

                        rcd_id:
                            rcd.id,

                        payment_type:
                            paymentType,

                        cash_amount:
                            cashAmount,

                        check_amount:
                            checkAmount,

                        total_amount:
                            totalRemitted,

                        denominations:
                            denominations,

                    }

                );


            /*
            =================================================
            RESPONSE
            =================================================
            */

            const newRemittance =
                response.data
                    ?.remittance;


            if (
                !newRemittance
            ) {

                throw new Error(
                    "Remittance was created but no remittance data was returned."
                );

            }


            /*
            =================================================
            SUCCESS
            =================================================
            */

            await Swal.fire({

                icon:
                    "success",

                title:
                    "Remittance Saved",

                text:
                    `Report No. ${newRemittance.report_no}`,

                timer:
                    1500,

                showConfirmButton:
                    false,

            });


            /*
            =================================================
            PASS RESULT TO PARENT
            =================================================
            */

            onSuccess(
                newRemittance
            );


            /*
            =================================================
            CLOSE FORM
            =================================================
            */

            onClose();


        } catch (
            error: any
        ) {

            console.error(
                "SAVE RCD REMITTANCE ERROR:",
                error
            );


            await Swal.fire({

                icon:
                    "error",

                title:
                    "Unable to Save Remittance",

                text:
                    error.response
                        ?.data
                        ?.message ||

                    error.message ||

                    "Unexpected error.",

            });

        } finally {

            setSaving(
                false
            );

        }

    }


    /*
    =========================================================
    DON'T RENDER
    =========================================================
    */

    if (
        !open ||
        !rcd
    ) {

        return null;

    }


    /*
    =========================================================
    RENDER
    =========================================================
    */

    return (

        <div
            className="
                fixed
                inset-0
                z-[60]
                flex
                items-center
                justify-center
                bg-black/40
                p-6
            "
        >

            <div
                className="
                    flex
                    max-h-[94vh]
                    w-full
                    max-w-6xl
                    flex-col
                    overflow-hidden
                    rounded-xl
                    bg-white
                    shadow-2xl
                "
            >

                {/* =================================================
                    HEADER
                ================================================= */}

                <div
                    className="
                        flex
                        items-center
                        justify-between
                        bg-blue-900
                        px-5
                        py-3
                        text-white
                    "
                >

                    <div>

                        <div
                            className="
                                text-lg
                                font-bold
                            "
                        >
                            RCD Remittance
                        </div>


                        <div
                            className="
                                mt-0.5
                                text-xs
                                text-blue-100
                            "
                        >

                            {rcd.report_no}

                            {" • "}

                            {rcd.fund_name ??
                                rcd.acronym ??
                                rcd.fund_code ??
                                "—"}

                        </div>

                    </div>


                    <div
                        className="
                            flex
                            items-center
                            gap-4
                        "
                    >

                        <div
                            className="
                                text-right
                            "
                        >

                            <div
                                className="
                                    text-[10px]
                                    uppercase
                                    tracking-wide
                                    text-blue-200
                                "
                            >
                                RCD Amount
                            </div>


                            <div
                                className="
                                    text-xl
                                    font-bold
                                "
                            >

                                ₱
                                {formatAmount(
                                    rcdAmount
                                )}

                            </div>

                        </div>


                        <button

                            type="button"

                            onClick={
                                onClose
                            }

                            disabled={
                                saving
                            }

                            className="
                                rounded-lg
                                p-1.5
                                hover:bg-white/10
                                disabled:opacity-50
                            "
                        >

                            <X
                                size={20}
                            />

                        </button>

                    </div>

                </div>


                {/* =================================================
                    BODY
                ================================================= */}

                <div
                    className="
                        flex-1
                        overflow-y-auto
                        p-4
                    "
                >

                    <div
                        className="
                            grid
                            grid-cols-1
                            gap-4
                            lg:grid-cols-2
                        "
                    >

                        {/* =========================================
                            LEFT
                        ========================================== */}

                        <div
                            className="
                                space-y-4
                            "
                        >

                            <RCDRemittancePaymentType

                                paymentType={
                                    paymentType
                                }

                                onChange={
                                    handlePaymentTypeChange
                                }

                            />


                            <RCDRemittanceSummary

                                rcdAmount={
                                    rcdAmount
                                }

                                paymentType={
                                    paymentType
                                }

                                cashAmount={
                                    cashAmount
                                }

                                checkAmount={
                                    checkAmount
                                }

                                onCashAmountChange={
                                    handleCashAmountChange
                                }

                                onCheckAmountChange={
                                    handleCheckAmountChange
                                }

                            />

                        </div>


                        {/* =========================================
                            RIGHT
                        ========================================== */}

                        <div>

                            <RCDRemittanceDenomination

                                cashAmount={
                                    cashAmount
                                }

                                denominations={
                                    denominations
                                }

                                denominationTotal={
                                    denominationTotal
                                }

                                onChange={
                                    updateDenomination
                                }

                            />

                        </div>

                    </div>

                </div>


                {/* =================================================
                    FOOTER
                ================================================= */}

                <div
                    className="
                        flex
                        items-center
                        justify-between
                        border-t
                        border-gray-200
                        bg-gray-50
                        px-5
                        py-3
                    "
                >

                    <div
                        className="
                            text-xs
                            text-gray-500
                        "
                    >

                        {paymentType === "CHECK"

                            ? "Check remittance — no cash denomination required."

                            : paymentType === null

                                ? "Please select a payment type."

                                : denominationsBalanced

                                    ? "Cash denomination is balanced."

                                    : "Cash denomination must equal the cash amount."

                        }

                    </div>


                    <div
                        className="
                            flex
                            items-center
                            gap-2
                        "
                    >

                        <button

                            type="button"

                            onClick={
                                onClose
                            }

                            disabled={
                                saving
                            }

                            className="
                                rounded-lg
                                border
                                border-gray-300
                                bg-white
                                px-4
                                py-2
                                text-sm
                                font-semibold
                                text-gray-700
                                hover:bg-gray-50
                                disabled:opacity-50
                            "
                        >

                            Cancel

                        </button>


                        <button

                            type="button"

                            onClick={
                                saveRemittance
                            }

                            disabled={
                                !canSave
                            }

                            className="
                                rounded-lg
                                bg-blue-700
                                px-5
                                py-2
                                text-sm
                                font-semibold
                                text-white
                                hover:bg-blue-800
                                disabled:cursor-not-allowed
                                disabled:bg-gray-300
                            "
                        >

                            {saving
                                ? "Saving..."
                                : "Save Remittance"}

                        </button>

                    </div>

                </div>

            </div>

        </div>

    );

}