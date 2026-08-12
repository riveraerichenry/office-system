"use client";

type Props = {
    items: any[];
};

export default function ReceiptItems({
    items,
}: Props) {

    return (
        <div
            className="receipt-items"
            style={{
                /*
                 * =====================================================
                 * ITEM POSITION CALIBRATION
                 * =====================================================
                 *
                 * Change ONLY these values when calibrating
                 * the physical receipt.
                 *
                 * X = left / right
                 * Y = up / down
                 */


                /* =====================================================
                   NATURE OF COLLECTION
                ===================================================== */

                "--receipt-nature-x": "18px",
                "--receipt-nature-y": "380px",


                /* =====================================================
                   ACCOUNT CODE
                ===================================================== */

                "--receipt-account-code-x": "170px",
                "--receipt-account-code-y": "380px",


                /* =====================================================
                   ITEM AMOUNT
                ===================================================== */

                "--receipt-item-amount-x": "260px",
                "--receipt-item-amount-y": "380px",


                /* =====================================================
                   ROW SPACING
                ===================================================== */

                "--receipt-item-spacing": "24px",

            } as React.CSSProperties}
        >

            {items.map(
                (
                    item,
                    index
                ) => (

                    <div
                        key={
                            item.id ??
                            index
                        }
                        className="receipt-item"
                        style={{
                            "--item-index":
                                index,
                        } as React.CSSProperties}
                    >

                        {/* =================================================
                            NATURE OF COLLECTION
                        ================================================= */}

                        <div
                            className="receipt-item-nature"
                        >
                            {item.account_name}
                        </div>


                        {/* =================================================
                            ACCOUNT CODE
                        ================================================= */}

                        <div
                            className="receipt-item-account-code"
                        >
                            {item.account_code}
                        </div>


                        {/* =================================================
                            EXACT AMOUNT
                        ================================================= */}

                        <div
                            className="receipt-item-amount"
                        >
                            {Number(
                                item.amount ?? 0
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

                )
            )}


            <style jsx>{`

                /* =====================================================
                   ITEM ROW
                ===================================================== */

                .receipt-item {

                    position: absolute;

                    width: 348px;

                    display: flex;

                    font-size: 11px;

                }


                /* =====================================================
                   NATURE OF COLLECTION
                ===================================================== */

                .receipt-item-nature {

                    position: absolute;

                    top: calc(
                        var(--receipt-nature-y) +
                        (
                            var(--item-index) *
                            var(--receipt-item-spacing)
                        )
                    );

                    left:
                        var(--receipt-nature-x);

                    width: 185px;

                    padding-right: 8px;

                    word-break: break-word;

                }


                /* =====================================================
                   ACCOUNT CODE
                ===================================================== */

                .receipt-item-account-code {

                    position: absolute;

                    top: calc(
                        var(--receipt-account-code-y) +
                        (
                            var(--item-index) *
                            var(--receipt-item-spacing)
                        )
                    );

                    left:
                        var(--receipt-account-code-x);

                    width: 70px;

                    text-align: center;

                }


                /* =====================================================
                   EXACT AMOUNT
                ===================================================== */

                .receipt-item-amount {

                    position: absolute;

                    top: calc(
                        var(--receipt-item-amount-y) +
                        (
                            var(--item-index) *
                            var(--receipt-item-spacing)
                        )
                    );

                    left:
                        var(--receipt-item-amount-x);

                    width: 75px;

                    text-align: right;

                }

            `}</style>

        </div>
    );
}