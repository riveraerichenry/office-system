"use client";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import axios from "axios";

import Swal from "sweetalert2";

import GeneralItemsTable
from "./GeneralItemsTable";

import RPTItemsTable
from "./RPTItemsTable";

import CTCItemsTable
from "./CTCItemsTable";

import AF58ItemsTable
from "./AF58ItemsTable";

import ReceiptModalHeader
from "./official_receipt_details/ReceiptModalHeader";

import ReceiptTransactionDetails
from "./official_receipt_details/ReceiptTransactionDetails";


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

};


type GeneralItem = {

    account_id?: string;

    account_code: string;

    account_name: string;

    amount: number | string;

    remarks?: string | null;

};


type RPTItem = {
    id?: string;

    transaction_id?: string;

    billing_id?: string | null;

    tax_declaration_id?: string | null;

    td_number?: string | null;

    coverage?: string | null;

    declared_owner?: string | null;

    property_location?: string | null;

    assessed_value?: number | string | null;

    start_quarter?: number | null;

    start_year?: number | null;

    end_quarter?: number | null;

    end_year?: number | null;

    basic?: number | string | null;

    sef?: number | string | null;

    penalty?: number | string | null;

    discount?: number | string | null;

    amount?: number | string | null;

    tax_due?: number | string | null;

    billing_number?: string | null;

    billing_item_id?: string | null;

    account_id?: string | null;

    [key: string]: any;
};


type CTCItem = {

    ctc_type?: string | null;

    full_name?: string | null;

    total_amount?: number | string | null;

    [key: string]: any;

};


type AF58Item = {

    fee_amount?: number | string | null;

    [key: string]: any;

};


type Props = {

    open: boolean;

    loading: boolean;

    header: Header | null;

    items:
        | GeneralItem[]
        | RPTItem[]
        | CTCItem[]
        | AF58Item[];

    onClose: () => void;

};


export default function OfficialReceiptDetailsModal({

    open,

    loading,

    header,

    items,

    onClose,

}: Props) {


    


    const [

        editableGeneralItems,

        setEditableGeneralItems,

    ] = useState<GeneralItem[]>([]);


    const [

        editableRPTItems,

        setEditableRPTItems,

    ] = useState<RPTItem[]>([]);


    const [

        editableCTCItems,

        setEditableCTCItems,

    ] = useState<CTCItem[]>([]);


    const [

        editableAF58Items,

        setEditableAF58Items,

    ] = useState<AF58Item[]>([]);


    const [

        savingGeneralItems,

        setSavingGeneralItems,

    ] = useState(false);


    const [

        savingTransactionDetails,

        setSavingTransactionDetails,

    ] = useState(false);


    const [

        accountOptions,

        setAccountOptions,

    ] = useState<any[]>([]);


    const [

        loadingAccounts,

        setLoadingAccounts,

    ] = useState(false);



    const [

        loadingRPTItems,

        setLoadingRPTItems,

    ] = useState(
        false
    );


    async function loadRPTItems() {

        if (
            !header?.id
        ) {

            setEditableRPTItems([]);

            return;

        }


        try {

            setLoadingRPTItems(
                true
            );


            const res =
                await axios.get(
                    `/api/dipp/rpt-items?id=${header.id}`
                );


            setEditableRPTItems(

                res.data.items || []

            );

        }

        catch (
            error
        ) {

            console.error(
                "Failed to load RPT items:",
                error
            );


            setEditableRPTItems([]);

        }

        finally {

            setLoadingRPTItems(
                false
            );

        }

    }



    useEffect(() => {

        if (

            !open ||

            !header?.id ||

            header.form_code !== "AF56"

        ) {

            return;

        }


        loadRPTItems();

    }, [

        open,

        header?.id,

        header?.form_code,

    ]);





    /*
    ================================================================
    LOAD ACCOUNTS
    ================================================================
    */

    async function loadAccounts() {

        try {

            setLoadingAccounts(
                true
            );


            const res =
                await axios.get(
                    "/api/accounts"
                );


            setAccountOptions(

                res.data.data.map(

                    (account: any) => ({

                        value:
                            account.id,

                        label:
                            `${account.account_code} - ${account.account_name}`,

                    })

                )

            );

        }

        catch (error) {

            console.error(
                "Failed to load accounts:",
                error
            );

            setAccountOptions([]);

        }

        finally {

            setLoadingAccounts(
                false
            );

        }

    }


    /*
    ================================================================
    LOAD ACCOUNTS
    ================================================================
    */

    useEffect(() => {

        if (

            !open ||

            !header

        ) {

            return;

        }


        if (

            header.form_code === "AF56" ||

            header.form_code === "AF58" ||

            header.form_code === "CTC"

        ) {

            return;

        }


        loadAccounts();

    }, [

        open,

        header?.id,

        header?.form_code,

    ]);


    /*
    ================================================================
    LOAD ITEMS INTO EDITABLE STATE
    ================================================================
    */

    useEffect(() => {

        if (!header) {

            setEditableGeneralItems([]);

            setEditableRPTItems([]);

            setEditableCTCItems([]);

            setEditableAF58Items([]);

            return;

        }


        if (

            header.form_code ===
            "AF56"

        ) {

            setEditableRPTItems(

                items as RPTItem[]

            );

            return;

        }


        if (

            header.form_code ===
            "AF58"

        ) {

            setEditableAF58Items(

                items as AF58Item[]

            );

            return;

        }


        if (

            header.form_code ===
            "CTC"

        ) {

            setEditableCTCItems(

                items as CTCItem[]

            );

            return;

        }


        setEditableGeneralItems(

            items as GeneralItem[]

        );

    }, [

        header?.id,

        header?.form_code,

        items,

    ]);


    /*
    ================================================================
    GENERAL GRAND TOTAL
    ================================================================
    */

    const generalGrandTotal =

        useMemo(

            () =>

                editableGeneralItems.reduce(

                    (

                        total,

                        item

                    ) =>

                        total +

                        Number(
                            item.amount || 0
                        ),

                    0

                ),

            [

                editableGeneralItems,

            ]

        );


    /*
    ================================================================
    RPT GRAND TOTAL
    ================================================================
    */

    const rptGrandTotal =

        useMemo(

            () =>

                editableRPTItems.reduce(

                    (

                        total,

                        item

                    ) =>

                        total +

                        Number(
                            item.amount || 0
                        ),

                    0

                ),

            [

                editableRPTItems,

            ]

        );


    /*
    ================================================================
    CTC GRAND TOTAL
    ================================================================
    */

    const ctcGrandTotal =

        useMemo(

            () =>

                editableCTCItems.reduce(

                    (

                        total,

                        item

                    ) =>

                        total +

                        Number(
                            item.total_amount || 0
                        ),

                    0

                ),

            [

                editableCTCItems,

            ]

        );


    /*
    ================================================================
    AF58 GRAND TOTAL
    ================================================================
    */

    const af58GrandTotal =

        useMemo(

            () =>

                editableAF58Items.reduce(

                    (

                        total,

                        item

                    ) =>

                        total +

                        Number(
                            item.fee_amount || 0
                        ),

                    0

                ),

            [

                editableAF58Items,

            ]

        );


    /*
    ================================================================
    SAVE TRANSACTION DETAILS
    ================================================================
    */

    async function handleSaveTransactionDetails(

        details: {

            payor: string;

            payment_mode: string;

            remarks: string;

        }

    ) {

        if (!header?.id) {

            await Swal.fire({

                icon:
                    "error",

                title:
                    "Unable to Save",

                text:
                    "Transaction ID is missing.",

            });

            return;

        }


        try {

            setSavingTransactionDetails(
                true
            );


            await axios.put(

                "/api/dipp/transaction-details",

                {

                    id:
                        header.id,

                    payor:
                        details.payor,

                    payment_mode:
                        details.payment_mode,

                    remarks:
                        details.remarks,

                }

            );


            await Swal.fire({

                icon:
                    "success",

                title:
                    "Transaction Details Updated",

                timer:
                    1500,

                showConfirmButton:
                    false,

            });

        }

        catch (err: any) {

            await Swal.fire({

                icon:
                    "error",

                title:
                    "Unable to Save",

                text:

                    err.response
                        ?.data
                        ?.message ||

                    err.message ||

                    "Unexpected error.",

            });

        }

        finally {

            setSavingTransactionDetails(
                false
            );

        }

    }


    /*
    ================================================================
    SAVE GENERAL ITEMS
    ================================================================
    */

    async function handleSaveGeneralItems(

        updatedItems:
            GeneralItem[]

    ) {

        if (!header?.id) {

            await Swal.fire({

                icon:
                    "error",

                title:
                    "Unable to Save",

                text:
                    "Transaction ID is missing.",

            });

            return;

        }


        if (

            updatedItems.length ===
            0

        ) {

            await Swal.fire({

                icon:
                    "warning",

                title:
                    "No Items",

                text:
                    "Please add at least one transaction item.",

            });

            return;

        }


        for (

            const item

            of updatedItems

        ) {

            if (!item.account_id) {

                await Swal.fire({

                    icon:
                        "warning",

                    title:
                        "Account Required",

                    text:
                        "Please select an account for every transaction item.",

                });

                return;

            }


            if (

                Number(
                    item.amount
                ) <= 0

            ) {

                await Swal.fire({

                    icon:
                        "warning",

                    title:
                        "Invalid Amount",

                    text:
                        "Every transaction amount must be greater than zero.",

                });

                return;

            }

        }


        try {

            setSavingGeneralItems(
                true
            );


            await axios.put(

                "/api/dipp/transaction-items/update",

                {

                    transaction_id:
                        header.id,

                    items:

                        updatedItems.map(

                            item => ({

                                account_id:
                                    item.account_id,

                                amount:
                                    Number(
                                        item.amount
                                    ),

                                remarks:
                                    item.remarks ??
                                    null,

                            })

                        ),

                }

            );


            setEditableGeneralItems(

                updatedItems

            );


            await Swal.fire({

                icon:
                    "success",

                title:
                    "Transaction Items Updated",

                timer:
                    1500,

                showConfirmButton:
                    false,

            });

        }

        catch (err: any) {

            await Swal.fire({

                icon:
                    "error",

                title:
                    "Unable to Save",

                text:

                    err.response
                        ?.data
                        ?.message ||

                    err.message ||

                    "Unexpected error.",

            });

        }

        finally {

            setSavingGeneralItems(
                false
            );

        }

    }


    /*
    ================================================================
    PRINT
    ================================================================
    */

    const handlePrint = () => {

    if (!header?.id) {

        return;

    }


    if (header.form_code === "AF56") {

        window.open(
            `/print/dipp/af56/${header.id}`,
            "_blank"
        );

        return;

    }


    if (header.form_code === "AF58") {

        window.open(
            `/print/dipp/af58/${header.id}`,
            "_blank"
        );

        return;

    }


    if (header.form_code === "CTC-I") {

        window.open(
            `/print/dipp/ctci/${header.id}`,
            "_blank"
        );

        return;

    }


    /*
    |--------------------------------------------------------------------------
    | GENERAL RECEIPT / AF51
    |--------------------------------------------------------------------------
    */

    window.open(
        `/print/dipp/receipt/${header.id}`,
        "_blank"
    );

};


    if (!open) {

        return null;

    }


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
                p-4
            "

        >

            <div

                className="
                    flex
                    h-[92vh]
                    w-full
                    max-w-7xl
                    flex-col
                    overflow-hidden
                    rounded-xl
                    bg-white
                    shadow-2xl
                "

            >

                <ReceiptModalHeader

                    header={
                        header
                    }

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


                <div

                    className="
                        flex-1
                        overflow-y-auto
                        bg-slate-50
                        p-5
                    "

                >

                    {

                        header && (

                            <div className="space-y-5">


                                <ReceiptTransactionDetails

                                    header={
                                        header
                                    }

                                    saving={
                                        savingTransactionDetails
                                    }

                                    onSave={
                                        handleSaveTransactionDetails
                                    }

                                />


                                {/* AF56 / RPT */}

                                {

                                    header.form_code ===
                                    "AF56" && (

                                        <RPTItemsTable

                                            items={
                                                editableRPTItems
                                            }

                                            grandTotal={
                                                rptGrandTotal
                                            }

                                          

                                        />

                                    )

                                }


                                {/* AF58 */}

                                {

                                    header.form_code ===
                                    "AF58" && (

                                        <AF58ItemsTable

                                            items={
                                                editableAF58Items
                                            }

                                            grandTotal={
                                                af58GrandTotal
                                            }

                                            saving={
                                                loading
                                            }

                                            onChange={
                                                setEditableAF58Items
                                            }

                                        />

                                    )

                                }


                                {/* CTC */}

                                {

                                    header.form_code ===
                                    "CTC" && (

                                        <CTCItemsTable

                                            items={
                                                editableCTCItems
                                            }

                                            grandTotal={
                                                ctcGrandTotal
                                            }

                                            saving={
                                                loading
                                            }

                                            onChange={
                                                setEditableCTCItems
                                            }

                                        />

                                    )

                                }


                                {/* GENERAL RECEIPT */}

                                {

                                    header.form_code !== "AF56" &&

                                    header.form_code !== "AF58" &&

                                    header.form_code !== "CTC" && (

                                        <GeneralItemsTable
                                            items={
                                                editableGeneralItems.map(
                                                    (item) => ({
                                                        ...item,
                                                        remarks:
                                                            item.remarks ??
                                                            undefined,
                                                    })
                                                )
                                            }
                                            grandTotal={
                                                generalGrandTotal
                                            }
                                            saving={
                                                savingGeneralItems
                                            }
                                            accountOptions={
                                                accountOptions
                                            }
                                            loadingAccounts={
                                                loadingAccounts
                                            }
                                            onSave={
                                                handleSaveGeneralItems
                                            }
                                        />

                                    )

                                }

                            </div>

                        )

                    }

                </div>

            </div>

        </div>

    );

}