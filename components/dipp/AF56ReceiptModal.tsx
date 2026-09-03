"use client";

import { useEffect, useState } from "react";
import axios from "axios";

import BookletHeader from "./general/BookletHeader";
import AF56BillingInformation from "./af56/AF56BillingInformation";
import AF56BillingResults from "./af56/AF56BillingResult";
import AF56BillingItems from "./af56/AF56BillingItems";
import UnrevisedPropertyModal from "./af56/unrevised/UnrevisedPropertyModal";

import Swal from "sweetalert2";


type Props = {
    open: boolean;
    booklet: any;
    onClose: () => void;
    onSuccess: () => void;
};


export default function AF56ReceiptModal({
    open,
    booklet,
    onClose,
    onSuccess,
}: Props) {


    /* ================================================================
       SEARCH
    ================================================================ */

    const [search, setSearch] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [results, setResults] =
        useState<any[]>([]);

    const [selected, setSelected] =
        useState<any>(null);


    /* ================================================================
       PROCESSING
    ================================================================ */

    const [saving, setSaving] =
        useState(false);


    /* ================================================================
       UNREVISED
    ================================================================ */

    const [unrevisedOpen, setUnrevisedOpen] =
        useState(false);


    /* ================================================================
       PAYOR
    ================================================================ */

    const [payor, setPayor] =
        useState("");


    /* ================================================================
       PAYMENT MODE
    ================================================================ */

    const [paymentMode, setPaymentMode] =
        useState("Cash");


    /* ================================================================
       REMARKS
    ================================================================ */

    const [remarks, setRemarks] =
        useState("");


    /* ================================================================
       SEARCH BILLING
    ================================================================ */

    useEffect(() => {

        if (!open) {
            return;
        }


        if (search.trim().length < 2) {

            setResults([]);

            return;

        }


        const timer =
            setTimeout(
                async () => {

                    try {

                        setLoading(true);


                        console.log(
                            "BOOKLET OBJECT"
                        );

                        console.log(
                            booklet
                        );


                        console.log(
                            "BOOKLET ID"
                        );

                        console.log(
                            booklet?.id
                        );


                        const res =
                            await axios.get(
                                "/api/rpt/billing/search",
                                {
                                    params: {
                                        q: search,
                                    },
                                }
                            );


                        setResults(
                            res.data.data ?? []
                        );

                    }
                    catch (err) {

                        console.error(
                            err
                        );

                        setResults([]);

                    }
                    finally {

                        setLoading(
                            false
                        );

                    }

                },
                300
            );


        return () =>
            clearTimeout(
                timer
            );

    }, [
        search,
        open,
        booklet,
    ]);


    /* ================================================================
       SELECT BILLING
    ================================================================ */

    const handleSelect =
        async (
            row: any
        ) => {

            try {

                console.log(
                    "BOOKLET OBJECT"
                );

                console.log(
                    booklet
                );


                console.log(
                    "BOOKLET ID"
                );

                console.log(
                    booklet?.id
                );


                const res =
                    await axios.get(
                        `/api/rpt/billing/${row.id}`
                    );


                /* ====================================================
                   SELECT BILLING
                ==================================================== */

                setSelected(
                    res.data.billing
                );


                /* ====================================================
                   PAYOR

                   IMPORTANT:

                   Do NOT automatically use owner_name.

                   Payor must be manually entered.
                ==================================================== */

                setPayor(
                    ""
                );


                /* ====================================================
                   PAYMENT MODE
                ==================================================== */

                setPaymentMode(
                    "Cash"
                );


                /* ====================================================
                   REMARKS
                ==================================================== */

                setRemarks(
                    ""
                );


                /* ====================================================
                   CLEAR SEARCH
                ==================================================== */

                setSearch(
                    ""
                );


                setResults(
                    []
                );

            }
            catch (err) {

                console.error(
                    err
                );

            }

        };


    /* ================================================================
       PROCESS AF56
    ================================================================ */

    const handleProcess =
        async () => {


            /* --------------------------------------------------------
               VALIDATE BILLING
            -------------------------------------------------------- */

            if (!selected) {

                await Swal.fire(
                    "No Billing Selected",
                    "Please select a billing first.",
                    "warning"
                );

                return;

            }


            /* --------------------------------------------------------
               VALIDATE PAYOR
            -------------------------------------------------------- */

            if (!payor.trim()) {

                await Swal.fire(
                    "Payor Required",
                    "Please enter the payor name.",
                    "warning"
                );

                return;

            }


            /* --------------------------------------------------------
               PROCESS
            -------------------------------------------------------- */

            try {

                setSaving(
                    true
                );


                console.log(
                    "BOOKLET"
                );

                console.log(
                    booklet
                );


                console.log(
                    "BOOKLET ID"
                );

                console.log(
                    booklet?.id
                );


                const res =
                    await axios.post(

                        "/api/dipp/transactions/rpt",

                        {

                            booklet_registration_id:
                                booklet.id,

                            billing_id:
                                selected.id,

                            receipt_date:
                                new Date(),

                            /*
                            ==================================================
                            PAYOR

                            This is the manually entered Payor.
                            ==================================================
                            */

                            payor:
                                payor,

                            payment_mode:
                                paymentMode,

                            remarks:
                                remarks,

                        }

                    );


                /* ========================================================
                   GET TRANSACTION ID
                ======================================================== */

                const transactionId =
                    res?.data?.transaction_id;


                if (!transactionId) {

                    throw new Error(
                        "Transaction was saved but no transaction ID was returned."
                    );

                }


                /* ========================================================
                   SUCCESS MESSAGE
                ======================================================== */

                await Swal.fire({

                    icon:
                        "success",

                    title:
                        "Collection Processed",

                    text:
                        `OR No. ${res.data.or_number} successfully issued.`,

                    confirmButtonColor:
                        "#2563eb",

                });


                /* ========================================================
                   OPEN AF56 PRINT PAGE
                ======================================================== */

                window.open(

                    `/print/dipp/af56/${transactionId}`,

                    "_blank",

                    "width=1000,height=600"

                );


                /* ========================================================
                   REFRESH
                ======================================================== */

                await onSuccess();


                /* ========================================================
                   CLOSE
                ======================================================== */

                onClose();

            }
            catch (err: any) {

                console.error(
                    "AF56 PROCESS ERROR:",
                    err
                );


                await Swal.fire(

                    "Error",

                    err
                        ?.response
                        ?.data
                        ?.message ??

                    err?.message ??

                    "Unable to process collection.",

                    "error"

                );

            }
            finally {

                setSaving(
                    false
                );

            }

        };


    /* ================================================================
       CLOSED
    ================================================================ */

    if (
        !open ||
        !booklet
    ) {

        return null;

    }


    /* ================================================================
       UI
    ================================================================ */

    return (

        <div
            className="
                fixed
                inset-0
                z-50
                flex
                items-center
                justify-center
                bg-black/50
                p-6
            "
        >

            <div
                className="
                    flex
                    h-[94vh]
                    w-full
                    max-w-7xl
                    flex-col
                    overflow-hidden
                    rounded-2xl
                    bg-white
                    shadow-2xl
                "
            >


                {/* ====================================================
                    HEADER
                ==================================================== */}

                <BookletHeader
                    booklet={
                        booklet
                    }
                />


                {/* ====================================================
                    BODY
                ==================================================== */}

                <div
                    className="
                        flex-1
                        overflow-y-auto
                        bg-slate-100
                        p-6
                    "
                >


                    {/* =================================================
                        SEARCH TAB
                    ================================================= */}

                    <div
                        className="
                            ml-6
                            inline-block
                            rounded-t-xl
                            border
                            border-b-0
                            bg-white
                            px-4
                            py-3
                            shadow-sm
                        "
                    >

                        <AF56BillingInformation

                            search={
                                search
                            }

                            onSearch={
                                setSearch
                            }

                        />

                    </div>


                    {/* =================================================
                        MAIN CARD
                    ================================================= */}

                    <div
                        className="
                            -mt-px
                            min-h-[600px]
                            rounded-xl
                            border
                            bg-white
                            p-6
                            shadow-sm
                        "
                    >


                        {/* =============================================
                            BILLING RESULTS

                            Payor and Payment Mode are controlled
                            by AF56ReceiptModal.
                        ============================================= */}

                        <AF56BillingResults

                            loading={
                                loading
                            }

                            results={
                                results
                            }

                            selected={
                                selected
                            }


                            /* =========================================
                               PAYOR
                            ========================================= */

                            payor={
                                payor
                            }

                            onPayorChange={
                                setPayor
                            }


                            /* =========================================
                               PAYMENT MODE
                            ========================================= */

                            paymentMode={
                                paymentMode
                            }

                            onPaymentModeChange={
                                setPaymentMode
                            }


                            /* =========================================
                               SELECT BILLING
                            ========================================= */

                            onSelect={
                                handleSelect
                            }

                        />


                        {/* =============================================
                            BILLING ITEMS
                        ============================================= */}

                        {selected && (

                            <AF56BillingItems

                                items={
                                    selected.items ??
                                    []
                                }

                            />

                        )}


                    </div>

                </div>


                {/* ====================================================
                    FOOTER
                ==================================================== */}

                <div
                    className="
                        border-t
                        bg-white
                        px-6
                        py-4
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            justify-between
                        "
                    >


                        {/* =============================================
                            LEFT
                        ============================================= */}

                        <div
                            className="
                                flex
                                items-center
                                gap-3
                            "
                        >


                            {/* CANCEL */}

                            <button

                                type="button"

                                onClick={
                                    onClose
                                }

                                disabled={
                                    saving
                                }

                                className="
                                    rounded-xl
                                    border
                                    border-slate-300
                                    bg-white
                                    px-8
                                    py-3
                                    font-medium
                                    text-slate-700
                                    transition
                                    hover:bg-slate-50
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                "

                            >

                                Cancel

                            </button>


                            {/* UNREVISED PROPERTY */}

                            <button

                                type="button"

                                onClick={() =>
                                    setUnrevisedOpen(
                                        true
                                    )
                                }

                                disabled={
                                    saving
                                }

                                className="
                                    rounded-xl
                                    bg-amber-600
                                    px-8
                                    py-3
                                    font-medium
                                    text-white
                                    transition
                                    hover:bg-amber-700
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                "

                            >

                                Unrevised Property

                            </button>


                        </div>


                        {/* =============================================
                            RIGHT
                        ============================================= */}

                        <div
                            className="
                                flex
                                items-center
                                gap-4
                            "
                        >


                            {/* =========================================
                                TOTAL
                            ========================================= */}

                            <div
                                className="
                                    text-right
                                "
                            >

                                <div
                                    className="
                                        text-xs
                                        font-semibold
                                        uppercase
                                        tracking-wide
                                        text-slate-500
                                    "
                                >

                                    Grand Total

                                </div>


                                <div
                                    className="
                                        text-4xl
                                        font-bold
                                        text-blue-700
                                    "
                                >

                                    ₱

                                    {Number(
                                        selected?.grand_total ??
                                        0
                                    ).toLocaleString(
                                        "en-PH",
                                        {
                                            minimumFractionDigits:
                                                2,

                                            maximumFractionDigits:
                                                2,
                                        }
                                    )}

                                </div>

                            </div>


                            {/* =========================================
                                PROCESS
                            ========================================= */}

                            <button

                                type="button"

                                onClick={
                                    handleProcess
                                }

                                disabled={
                                    !selected ||
                                    saving
                                }

                                className="
                                    rounded-xl
                                    bg-blue-600
                                    px-8
                                    py-4
                                    text-lg
                                    font-semibold
                                    text-white
                                    transition
                                    hover:bg-blue-700
                                    disabled:cursor-not-allowed
                                    disabled:bg-slate-300
                                "

                            >

                                {saving

                                    ? "Processing..."

                                    : "Process Collection"

                                }

                            </button>


                        </div>


                        {/* =============================================
                            UNREVISED PROPERTY MODAL
                        ============================================= */}

                        <UnrevisedPropertyModal

                            open={
                                unrevisedOpen
                            }

                            booklet={
                                booklet
                            }

                            onClose={() =>
                                setUnrevisedOpen(
                                    false
                                )
                            }

                            onSuccess={() => {

                                setUnrevisedOpen(
                                    false
                                );

                                onSuccess();

                            }}

                        />


                    </div>

                </div>


            </div>

        </div>

    );

}