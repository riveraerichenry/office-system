"use client";

type Props = {
    items?: any[];

    formatAmount: (
        value: any
    ) => string;

    startIndex?: number;

    showGrandTotal?: boolean;

    totalReceiptCount?: number;

    grandTotalOverride?: number;
};

export default function DailyReceipts({
    items = [],
    formatAmount,
    startIndex = 0,
    showGrandTotal = true,
    totalReceiptCount,
    grandTotalOverride,
}: Props) {
    /* ============================================================
       NORMALIZE AND DEDUPLICATE ROWS
       SAME OR NUMBER = ONE RECEIPT
    ============================================================ */

    const rows = Array.isArray(items)
        ? items.filter(
            (item: any, index: number, array: any[]) => {
                const receiptNumber = String(
                    item?.series_or_number ??
                    item?.or_number ??
                    item?.receipt_no ??
                    ""
                ).trim();

                // If there is no receipt number,
                // retain the row rather than incorrectly removing it.
                if (!receiptNumber) {
                    return true;
                }

                return (
                    array.findIndex(
                        (row: any) =>
                            String(
                                row?.series_or_number ??
                                row?.or_number ??
                                row?.receipt_no ??
                                ""
                            ).trim() === receiptNumber
                    ) === index
                );
            }
        )
        : [];

    /* ============================================================
       PAGE GRAND TOTAL
    ============================================================ */

    const pageGrandTotal = rows.reduce(
        (
            total: number,
            item: any
        ) => {
            return (
                total +
                Number(item?.amount ?? 0)
            );
        },
        0
    );

    const grandTotal =
        grandTotalOverride ??
        pageGrandTotal;

    /* ============================================================
       RECEIPT COUNT
    ============================================================ */

    const receiptCount =
        totalReceiptCount ??
        rows.length;

    /* ============================================================
       RENDER
    ============================================================ */

    return (
        <div className="daily-receipt-section">
            <table className="daily-receipt-table">
                <thead>
                    <tr>
                        <th className="daily-receipt-entry-column">
                            Entry #
                        </th>

                        <th>
                            Description
                        </th>

                        <th>
                            Payor
                        </th>

                        <th className="daily-receipt-amount-column">
                            Amount
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {rows.length === 0 ? (
                        <tr>
                            <td
                                colSpan={4}
                                className="daily-receipt-empty"
                            >
                                No receipt records found.
                            </td>
                        </tr>
                    ) : (
                        rows.map(
                            (
                                item: any,
                                index: number
                            ) => {
                                /* ========================================
                                   CHECK CANCELLED STATUS
                                ======================================== */

                                const isCancelled =
                                    item?.is_cancelled === true ||
                                    item?.is_cancelled === "true" ||
                                    String(
                                        item?.transaction_status ??
                                        item?.status ??
                                        ""
                                    ).toUpperCase() === "CANCELLED";

                                /* ========================================
                                   PAYOR NAME
                                ======================================== */

                                const payor =
                                    item?.payor ??
                                    item?.payor_name ??
                                    "—";

                                /* ========================================
                                   RECEIPT NUMBER
                                ======================================== */

                                const receiptNumber =
                                    item?.series_or_number ??
                                    item?.or_number ??
                                    item?.receipt_no ??
                                    item?.description ??
                                    "—";

                                return (
                                    <tr
                                        key={
                                            item?.id ??
                                            `${receiptNumber}-${index}`
                                        }
                                    >
                                        {/* ========================================
                                            ENTRY NUMBER
                                        ======================================== */}

                                        <td className="daily-receipt-entry-column">
                                            {startIndex + index + 1}
                                        </td>

                                        {/* ========================================
                                            DESCRIPTION
                                        ======================================== */}

                                        <td>
                                            {receiptNumber}
                                        </td>

                                        {/* ========================================
                                            PAYOR
                                        ======================================== */}

                                        <td>
                                            <span>
                                                {payor}
                                            </span>

                                            {isCancelled && (
                                                <span
                                                    style={{
                                                        color: "#dc2626",
                                                        fontWeight: 700,
                                                        marginLeft: "6px",
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    (CANCELLED)
                                                </span>
                                            )}
                                        </td>

                                        {/* ========================================
                                            AMOUNT
                                        ======================================== */}

                                        <td className="daily-receipt-amount-column">
                                            ₱
                                            {formatAmount(
                                                item?.amount
                                            )}
                                        </td>
                                    </tr>
                                );
                            }
                        )
                    )}
                </tbody>

                {/* ==================================================
                    GRAND TOTAL
                    FINAL PAGE ONLY
                ================================================== */}

                {showGrandTotal && (
                    <tfoot>
                        <tr>
                            <td
                                colSpan={2}
                                className="daily-receipt-receipt-count"
                            >
                                Number of Receipts:{" "}
                                {receiptCount}
                            </td>

                            <td className="daily-receipt-grand-total-label">
                                GRAND TOTAL
                            </td>

                            <td className="daily-receipt-grand-total">
                                ₱
                                {formatAmount(
                                    grandTotal
                                )}
                            </td>
                        </tr>
                    </tfoot>
                )}
            </table>
        </div>
    );
}