"use client";

import "./receipt.css";

import ReceiptHeader from "./ReceiptHeader";
import ReceiptItems from "./ReceiptItems";
import ReceiptFooter from "./ReceiptFooter";

type Props = {
    transaction: any;
    items: any[];
};

export default function Receipt({

    transaction,

    items,

}: Props) {

    return (

        <div className="print-page">

            <ReceiptHeader
                transaction={transaction}
            />

            <ReceiptItems
                items={items}
            />

            <ReceiptFooter

                transaction={transaction}

                items={items}

            />

        </div>

    );

}