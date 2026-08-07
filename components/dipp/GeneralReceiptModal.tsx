"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

import BookletHeader from "./general/BookletHeader";
import BookletInformation from "./general/BookletInformation";
import PayorSection from "./general/PayorSection";
import TransactionItems from "./general/TransactionItems";
import Footer from "./general/Footer";

type Props = {

    open: boolean;

    booklet: any;

    onClose: () => void;

    onSuccess: () => void;

};

export default function GeneralReceiptModal({

    open,

    booklet,

    onClose,

    onSuccess,

}: Props) {

    const [saving, setSaving] =
        useState(false);

    const [loadingAccounts, setLoadingAccounts] =
        useState(false);

    const [accountOptions, setAccountOptions] =
        useState<any[]>([]);

    const [receiptDate, setReceiptDate] =
        useState(

            new Date()

                .toISOString()

                .substring(0, 10)

        );

    const [payor, setPayor] =
        useState("");

    const [paymentMode, setPaymentMode] =
        useState("Cash");

    const [items, setItems] =
        useState([

            {

                account_id: "",

                amount: "",

                remarks: "",

            },

        ]);

    useEffect(() => {

        if (

            !open ||

            !booklet

        )

            return;

        loadAccounts();

    }, [

        open,

        booklet,

    ]);

    async function loadAccounts() {

        try {

            setLoadingAccounts(true);

            const res =
                await axios.get(
                    "/api/accounts"
                );

            setAccountOptions(

                res.data.data.map(

                    (x: any) => ({

                        value: x.id,

                        label:

                            `${x.account_code} - ${x.account_name}`,

                    })

                )

            );

        } finally {

            setLoadingAccounts(false);

        }

    }

    function addItem() {

        setItems([

            ...items,

            {

                account_id: "",

                amount: "",

                remarks: "",

            },

        ]);

    }

    function removeItem(

        index: number

    ) {

        setItems(

            items.filter(

                (

                    _,

                    i

                ) =>

                    i !== index

            )

        );

    }

    function updateItem(

        index: number,

        field: any,

        value: any

    ) {

        const copy =
            [...items];

        copy[index] = {

            ...copy[index],

            [field]: value,

        };

        setItems(copy);

    }

    const total =
        useMemo(

            () =>

                items.reduce(

                    (

                        sum,

                        item

                    ) =>

                        sum +

                        Number(

                            item.amount || 0

                        ),

                    0

                ),

            [items]

        );

    const canSave =

        payor.trim() !== ""

        &&

        items.every(

            x =>

                x.account_id

                &&

                Number(

                    x.amount

                ) > 0

        );

    async function processCollection() {

        try {

            setSaving(true);

            const res = await axios.post(
                "/api/dipp/transactions",
                {
                    booklet_registration_id:
                        booklet.booklet_registration_id,

                    receipt_date:
                        receiptDate,

                    payor,

                    payment_mode:
                        paymentMode,

                    remarks: null,

                    items,
                }
            );

            Swal.fire({

                icon: "success",

                title: "Collection Processed",

                text: `O.R. No. ${res.data.or_number} successfully issued.`,

                timer: 1500,

                showConfirmButton: false,

            });

            window.open(

                `/print/dipp/receipt/${res.data.transaction_id}`,

                "_blank",

                "width=420,height=850"

            );

            await onSuccess();

            onClose();

        }

        catch (err: any) {

            Swal.fire({

                icon: "error",

                title: "Unable to Process",

                text:

                    err.response?.data?.message ||

                    "Unexpected error.",

            });

        }

        finally {

            setSaving(false);

        }

    }

    if (

        !open ||

        !booklet

    )

        return null;

    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">

            <div className="flex h-[92vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

                <BookletHeader

                    booklet={booklet}

                />

                <div className="flex-1 space-y-5 overflow-y-auto p-6">

                    <BookletInformation

                        booklet={booklet}

                        receiptDate={receiptDate}

                        saving={saving}

                        onReceiptDateChange={

                            setReceiptDate

                        }

                    />

                    <PayorSection

                        payor={payor}

                        paymentMode={paymentMode}

                        saving={saving}

                        onPayorChange={

                            setPayor

                        }

                        onPaymentModeChange={

                            setPaymentMode

                        }

                    />

                    <TransactionItems

                        items={items}

                        accountOptions={accountOptions}

                        loadingAccounts={loadingAccounts}

                        saving={saving}

                        onAdd={addItem}

                        onRemove={removeItem}

                        onUpdate={updateItem}

                    />

                </div>

                <Footer

                    saving={saving}

                    canSave={canSave}

                    total={total}

                    onCancel={onClose}

                    onProcess={processCollection}

                />

            </div>

        </div>

    );

}