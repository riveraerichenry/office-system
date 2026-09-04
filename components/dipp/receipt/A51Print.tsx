"use client";

import ReceiptHeader from "./ReceiptHeader";
import ReceiptItems from "./ReceiptItems";
import ReceiptFooter from "./ReceiptFooter";

type Props = {
    transaction: any;
    items: any[];
};

export default function A51Print({
    transaction,
    items,
}: Props) {

    return (

        <div className="a51-simple-print">

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