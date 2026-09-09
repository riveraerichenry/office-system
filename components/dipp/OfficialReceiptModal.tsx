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

/*
HEADER

*/

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

/*
GENERAL ITEM

*/

type GeneralItem = {

account_id?: string;

account_code: string;

account_name: string;

amount: number | string;

remarks?: string | null;

};

/*
RPT ITEM / AF56

*/

type RPTItem = {

td_number: string;

coverage: string;

assessed_value: number | string;

basic: number | string;

sef: number | string;

penalty: number | string;

discount: number | string;

amount: number | string;

};

/*
CTC ITEM

*/

type CTCItem = {

ctc_type?: string | null;

full_name?: string | null;

address?: string | null;

tin?: string | null;

cr_number?: string | null;

citizenship?: string | null;

sex?: string | null;

height?: string | number | null;

weight?: string | number | null;

place_of_birth?: string | null;

birth_date?: string | null;

civil_status?: string | null;

occupation?: string | null;

corporation_name?: string | null;

sec_registration?: string | null;

representative?: string | null;

place_issued?: string | null;

issue_date?: string | null;

tax_mode?: string | null;

taxable_amount?: number | string | null;

basic_tax?: number | string | null;

salary_tax?: number | string | null;

additional_tax?: number | string | null;

penalty?: number | string | null;

interest?: number | string | null;

total_amount?: number | string | null;

};

/*
AF58 ITEM

*/

type AF58Item = {

payor_name?: string | null;

city_municipality?: string | null;

province?: string | null;

permit_action?: string | null;

remains_of?: string | null;

deceased_name?: string | null;

nationality?: string | null;

age?: number | string | null;

sex?: string | null;

date_of_death?: string | null;

cause_of_death?: string | null;

cemetery_name?: string | null;

infectious_status?: string | null;

embalmed_status?: string | null;

disposition_of_remains?: string | null;

fee_amount?: number | string | null;

certification_city_municipality?: string | null;

certification_province?: string | null;

certification_date?: string | null;

};

/*
PROPS

*/

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

/*
================================================================
EDITABLE ITEM STATES
================================================================
*/

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


/*
================================================================
SAVING GENERAL ITEMS
================================================================
*/

const [

    savingGeneralItems,

    setSavingGeneralItems,

] = useState(false);


/*
================================================================
ACCOUNT OPTIONS
================================================================
*/

const [

    accountOptions,

    setAccountOptions,

] = useState<any[]>([]);


const [

    loadingAccounts,

    setLoadingAccounts,

] = useState(false);


/*
================================================================
SAVING TRANSACTION DETAILS
================================================================
*/

const [

    savingTransactionDetails,

    setSavingTransactionDetails,

] = useState(false);


/*
================================================================
SAVE TRANSACTION DETAILS

ONLY UPDATES:

dipp_transactions

DOES NOT UPDATE:

dipp_transaction_items
dipp_rpt_items
dipp_ctc_items
dipp_af58_items
================================================================
*/

async function handleSaveTransactionDetails(

    details: {

        payor: string;

        payment_mode: string;

        remarks: string;

    }

) {


    /*
    ============================================================
    VALIDATE TRANSACTION ID
    ============================================================
    */

    if (

        !header?.id

    ) {

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

        /*
        ========================================================
        SAVING
        ========================================================
        */

        setSavingTransactionDetails(
            true
        );


        /*
        ========================================================
        UPDATE TRANSACTION DETAILS
        ========================================================
        */

        const res =
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


        /*
        ========================================================
        VALIDATE API RESPONSE
        ========================================================
        */

        if (

            !res.data.success

        ) {

            throw new Error(

                res.data.message ||

                "Unable to update transaction details."

            );

        }


        /*
        ========================================================
        UPDATE LOCAL HEADER

        THIS MAKES THE UI UPDATE IMMEDIATELY
        WITHOUT REQUIRING THE MODAL TO CLOSE.
        ========================================================
        */

        /*
        NOTE:

        header is a prop, so we cannot directly mutate it here.

        The parent should ideally reload the transaction after
        saving. For now, the API save is completed successfully.
        */


        /*
        ========================================================
        SUCCESS
        ========================================================
        */

        await Swal.fire({

            icon:
                "success",

            title:
                "Transaction Details Updated",

            text:
                "The transaction details were successfully updated.",

            timer:
                1500,

            showConfirmButton:
                false,

        });

    }

    catch (

        err: any

    ) {

        console.error(

            "SAVE TRANSACTION DETAILS ERROR:",

            err

        );


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

                "Unable to update transaction details.",

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

                (x: any) => ({

                    value:
                        x.id,

                    label:
                        `${x.account_code} - ${x.account_name}`,

                })

            )

        );

    }

    catch (

        error

    ) {

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
LOAD ACCOUNTS WHEN MODAL OPENS
================================================================
*/

useEffect(() => {

    if (

        !open ||

        !header

    )

        return;


    if (

        header.form_code ===
        "AF56" ||

        header.form_code ===
        "AF58" ||

        header.form_code ===
        "CTC"

    )

        return;


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

    if (

        !header

    ) {

        setEditableGeneralItems([]);

        setEditableRPTItems([]);

        setEditableCTCItems([]);

        setEditableAF58Items([]);

        return;

    }


    /*
    ------------------------------------------------------------
    AF56
    ------------------------------------------------------------
    */

    if (

        header.form_code ===
        "AF56"

    ) {

        setEditableRPTItems(

            items as RPTItem[]

        );

        return;

    }


    /*
    ------------------------------------------------------------
    AF58
    ------------------------------------------------------------
    */

    if (

        header.form_code ===
        "AF58"

    ) {

        setEditableAF58Items(

            items as AF58Item[]

        );

        return;

    }


    /*
    ------------------------------------------------------------
    CTC
    ------------------------------------------------------------
    */

    if (

        header.form_code ===
        "CTC"

    ) {

        setEditableCTCItems(

            items as CTCItem[]

        );

        return;

    }


    /*
    ------------------------------------------------------------
    GENERAL RECEIPT
    ------------------------------------------------------------
    */

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
SAVE GENERAL ITEMS
================================================================
*/

async function handleSaveGeneralItems(

    updatedItems:
        GeneralItem[]

) {

    if (

        !header?.id

    ) {

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


    /*
    ============================================================
    VALIDATE BEFORE API CALL
    ============================================================
    */

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

        if (

            !item.account_id

        ) {

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


        const amount =

            Number(
                item.amount
            );


        if (

            !Number.isFinite(
                amount
            ) ||

            amount <= 0

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


        const res =
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


        if (

            !res.data.success

        ) {

            throw new Error(

                res.data.message ||

                "Unable to update transaction items."

            );

        }


        /*
        ========================================================
        UPDATE LOCAL STATE
        ========================================================
        */

        setEditableGeneralItems(

            updatedItems

        );


        await Swal.fire({

            icon:
                "success",

            title:
                "Transaction Items Updated",

            text:
                "The transaction items were successfully saved.",

            timer:
                1500,

            showConfirmButton:
                false,

        });

    }

    catch (

        error: any

    ) {

        console.error(

            "SAVE GENERAL ITEMS ERROR:",

            error

        );


        await Swal.fire({

            icon:
                "error",

            title:
                "Unable to Save",

            text:

                error.response?.data?.message ||

                error.message ||

                "Unable to update transaction items.",

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

                        item.amount ||
                        0

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

                        item.amount ||
                        0

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

                        item.total_amount ||
                        0

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

                        item.fee_amount ||
                        0

                    ),

                0

            ),

        [

            editableAF58Items,

        ]

    );


/*
================================================================
PRINT
================================================================
*/

const handlePrint =

    async () => {

        if (

            !header?.id

        ) {

            await Swal.fire({

                icon:
                    "error",

                title:
                    "Unable to Print",

                text:
                    "Transaction ID is missing.",

            });

            return;

        }


        if (

            header.form_code ===
            "AF56"

        ) {

            window.open(

                `/print/dipp/af56/${header.id}`,

                "_blank"

            );

            return;

        }


        if (

            header.form_code ===
            "AF58"

        ) {

            window.open(

                `/print/dipp/af58/${header.id}`,

                "_blank"

            );

            return;

        }


        window.open(

            `/print/dipp/receipt/${header.id}`,

            "_blank"

        );

    };


/*
================================================================
CLOSED
================================================================
*/

if (

    !open

) {

    return null;

}


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

                    loading && (

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

                    )

                }


                {

                    !loading &&

                    header && (

                        <div className="space-y-5">


                            {/* =====================================
                                TRANSACTION DETAILS
                            ===================================== */}

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


                            {/* =====================================
                                AF56 / RPT
                            ===================================== */}

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

                                        saving={
                                            loading
                                        }

                                        onChange={
                                            setEditableRPTItems
                                        }

                                    />

                                )

                            }


                            {/* =====================================
                                AF58
                            ===================================== */}

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


                            {/* =====================================
                                CTC
                            ===================================== */}

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


                            {/* =====================================
                                GENERAL RECEIPT
                            ===================================== */}

                            {

                                header.form_code !==
                                    "AF56" &&

                                header.form_code !==
                                    "AF58" &&

                                header.form_code !==
                                    "CTC" && (

                                    <GeneralItemsTable

                                        items={
                                            editableGeneralItems
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