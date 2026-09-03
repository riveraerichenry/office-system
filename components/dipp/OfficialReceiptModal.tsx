"use client";

import {
    X,
    Printer,
} from "lucide-react";

import Swal from "sweetalert2";

import GeneralItemsTable
    from "./GeneralItemsTable";

import RPTItemsTable
    from "./RPTItemsTable";

import ReceiptModalHeader from "./official_receipt_details/ReceiptModalHeader";

import ReceiptSummaryCards from "./official_receipt_details/ReceiptSUmmaryCards";

import ReceiptTransactionDetails from "./official_receipt_details/ReceiptTransactionDetails";

import ReceiptAccountableForm from "./official_receipt_details/ReceiptAccountableForm";

import ReceiptFooterSummary from "./official_receipt_details/ReceiptFooterSummary";


type Header = {

    id: string;

    or_number: string;

    receipt_date: string;

    payor: string;

    payment_mode: string;

    form_code: string;

    encoded_by: string;

    grand_total: number;

    collector?: string;

    remarks?: string;

    status?: string;

    booklet_number?: string;

    fiscal_year?: string;

    series?: string;

    beginning_or?: string;

    ending_or?: string;

    current_or?: string;

    receipt_count?: number;

    received_date?: string;

    issued_date?: string;

};


type GeneralItem = {

    account_code: string;

    account_name: string;

    amount: number;

};


type RPTItem = {

    td_number: string;

    coverage: string;

    assessed_value: number;

    basic: number;

    sef: number;

    penalty: number;

    discount: number;

    amount: number;

};


type Props = {

    open: boolean;

    loading: boolean;

    header: Header | null;

    items: GeneralItem[] | RPTItem[];

    onClose: () => void;

};


export default function OfficialReceiptDetailsModal({

    open,

    loading,

    header,

    items,

    onClose,

}: Props) {


    /*
    ================================================================
    CLOSED
    ================================================================
    */

    if (!open) {

        return null;

    }


    /*
    ================================================================
    ITEM TYPES
    ================================================================
    */

    const generalItems =
        items as GeneralItem[];


    const rptItems =
        items as RPTItem[];


    /*
    ================================================================
    PRINT
    ================================================================
    */

   const handlePrint = async () => {

    if (!header?.id) {

        await Swal.fire({

            icon: "error",

            title: "Unable to Print",

            text:
                "Transaction ID is missing.",

        });

        return;

    }


    /*
    ============================================================
    AF56

    IMPORTANT:

    Do NOT send transaction data directly to the Epson service.

    Open the real AF56 page first.

    The AF56 page contains:

    AF56Print
    AF56PrintHeader
    AF56PrintBody

    Then that page will capture its own rendered layout.
    ============================================================
    */

    if (
        header.form_code === "AF56"
    ) {

        window.open(

            `/print/dipp/af56/${header.id}`,

            "_blank"

        );

        return;

    }


    /*
    ============================================================
    AF58
    ============================================================
    */

    if (
        header.form_code === "AF58"
    ) {

        window.open(

            `/print/dipp/af58/${header.id}`,

            "_blank"

        );

        return;

    }


    /*
    ============================================================
    OTHER RECEIPTS
    ============================================================
    */

    window.open(

        `/print/dipp/receipt/${header.id}`,

        "_blank"

    );

};


    /*
    ================================================================
    RENDER
    ================================================================
    */

    return (

        <div
            className="
                fixed
                inset-0
                z-50
                flex
                items-center
                justify-center
                bg-slate-900/50
                p-4
                backdrop-blur-sm
            "
        >

            <div
                className="
                    flex
                    h-[90vh]
                    w-full
                    max-w-7xl
                    flex-col
                    overflow-hidden
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    shadow-2xl
                "
            >

                {/* =================================================
                    HEADER
                ================================================= */}

                <ReceiptModalHeader

                    loading={
                        loading
                    }

                    disabled={
                        !header
                    }

                    onPrint={
                        handlePrint
                    }

                    onClose={
                        onClose
                    }

                />


                {/* =================================================
                    BODY
                ================================================= */}

                <div
                    className="
                        flex-1
                        overflow-y-auto
                        bg-slate-50
                        p-5
                    "
                >

                    {/* =================================================
                        LOADING
                    ================================================= */}

                    {loading && (

                        <div
                            className="
                                flex
                                h-full
                                items-center
                                justify-center
                            "
                        >

                            <div
                                className="
                                    rounded-lg
                                    border
                                    bg-white
                                    px-8
                                    py-6
                                    text-sm
                                    text-slate-500
                                    shadow-sm
                                "
                            >

                                Loading transaction details...

                            </div>

                        </div>

                    )}


                    {/* =================================================
                        CONTENT
                    ================================================= */}

                    {!loading &&
                        header && (

                            <>

                                <ReceiptSummaryCards
                                    header={
                                        header
                                    }
                                />


                                <ReceiptTransactionDetails
                                    header={
                                        header
                                    }
                                />


                                <ReceiptAccountableForm
                                    header={
                                        header
                                    }
                                />


                                {/* =====================================
                                    ITEMS
                                ===================================== */}

                                {
                                    header.form_code ===
                                    "AF56"

                                        ? (

                                            <RPTItemsTable

                                                items={
                                                    rptItems
                                                }

                                                grandTotal={
                                                    header.grand_total
                                                }

                                            />

                                        )

                                        : (

                                            <GeneralItemsTable

                                                items={
                                                    generalItems
                                                }

                                                grandTotal={
                                                    header.grand_total
                                                }

                                            />

                                        )
                                }


                                <ReceiptFooterSummary

                                    header={
                                        header
                                    }

                                    itemCount={
                                        items.length
                                    }

                                />

                            </>

                        )}

                </div>

            </div>

        </div>

    );

}