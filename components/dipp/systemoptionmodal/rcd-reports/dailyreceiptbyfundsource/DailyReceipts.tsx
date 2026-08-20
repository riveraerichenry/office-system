"use client";

type Props = {
    items?: any[];

    formatAmount: (
        value: any
    ) => string;
};

export default function DailyReceipts({
    items = [],
    formatAmount,
}: Props) {

    const rows =
        Array.isArray(items)
            ? items
            : [];


    const grandTotal =
        rows.reduce(
            (
                total,
                item
            ) => {

                return (
                    total +
                    Number(
                        item?.amount ??
                        0
                    )
                );

            },
            0
        );

    const receiptCount = rows.length;


    return (

        <div className="
            daily-receipt-section
        ">

            <table className="
                daily-receipt-table
            ">

                <thead>

                    <tr>

                        <th className="
                            daily-receipt-entry-column
                        ">
                            Entry #
                        </th>

                        <th>
                            Description
                        </th>

                        <th>
                            Payor
                        </th>

                        <th className="
                            daily-receipt-amount-column
                        ">
                            Amount
                        </th>

                    </tr>

                </thead>


                <tbody>

                    {rows.length === 0 ? (

                        <tr>

                            <td
                                colSpan={4}
                                className="
                                    daily-receipt-empty
                                "
                            >
                                No receipt records found.
                            </td>

                        </tr>

                    ) : (

                        rows.map(
                            (
                                item,
                                index
                            ) => (

                                <tr
                                    key={
                                        item?.id ??
                                        index
                                    }
                                >

                                    <td className="
                                        daily-receipt-entry-column
                                    ">
                                        {
                                            index + 1
                                        }
                                    </td>


                                    <td>

                                        {
                                            item?.series_or_number ??
                                            item?.or_number ??
                                            item?.receipt_no ??
                                            item?.description ??
                                            "—"
                                        }

                                    </td>


                                    <td>

                                        {
                                            item?.payor ??
                                            item?.payor_name ??
                                            "—"
                                        }

                                    </td>


                                    <td className="
                                        daily-receipt-amount-column
                                    ">

                                        ₱
                                        {
                                            formatAmount(
                                                item?.amount
                                            )
                                        }

                                    </td>

                                </tr>

                            )
                        )

                    )}

                </tbody>


                <tfoot>

                    <tr>

                        <td
                            colSpan={2}
                            className="
                                daily-receipt-receipt-count
                            "
                        >

                            Number of Receipts:
                            {" "}
                            {receiptCount}

                        </td>


                        <td
                            className="
                                daily-receipt-grand-total-label
                            "
                        >

                            GRAND TOTAL

                        </td>


                        <td
                            className="
                                daily-receipt-grand-total
                            "
                        >

                            ₱
                            {
                                formatAmount(
                                    grandTotal
                                )
                            }

                        </td>

                    </tr>

                </tfoot>

            </table>

        </div>

    );
}