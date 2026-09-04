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

                "--receipt-nature-x": "50px",

                "--receipt-nature-y": "300px",

                /*
                 * Maximum width of Nature of Collection.
                 *
                 * Increase or decrease this value depending
                 * on the available space before Account Code.
                 */
                "--receipt-nature-width": "140px",


                /* =====================================================
                   ACCOUNT CODE
                ===================================================== */

                "--receipt-account-code-x": "200px",

                "--receipt-account-code-y": "300px",


                /* =====================================================
                   ITEM AMOUNT
                ===================================================== */

                "--receipt-item-amount-x": "270px",

                "--receipt-item-amount-y": "300px",


                /* =====================================================
                   ROW SPACING
                ===================================================== */

                /*
                 * Space between each item row.
                 *
                 * Since Nature of Collection can now use
                 * up to 2 lines, use a larger spacing
                 * to prevent overlapping.
                 */
                "--receipt-item-spacing": "25px",

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
                            ₱{Number(
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
                   ITEMS CONTAINER
                ===================================================== */

                .receipt-items {

                    position: absolute;

                    left: 0;

                    top: 0;

                    width: 100%;

                }


                /* =====================================================
                   ITEM ROW
                ===================================================== */

                .receipt-item {

                    position: absolute;

                    left: 0;

                    top: 0;

                    width: 100%;

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

                    width:
                        var(--receipt-nature-width);

                    max-width:
                        var(--receipt-nature-width);

                    white-space: normal;

                    overflow-wrap: break-word;

                    word-break: break-word;

                    /*
                     * Maximum of 2 lines
                     */
                    display: -webkit-box;

                    -webkit-box-orient: vertical;

                    -webkit-line-clamp: 2;

                    overflow: hidden;

                    line-height: 11px;

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

                    white-space: nowrap;

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

                    white-space: nowrap;

                }

            `}</style>

        </div>
    );
}