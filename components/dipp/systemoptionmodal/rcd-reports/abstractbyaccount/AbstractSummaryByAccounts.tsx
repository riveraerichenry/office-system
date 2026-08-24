"use client";

type Props = {
    items?: any[];
    formatAmount: (
        value: any
    ) => string;
};

export default function AbstractSummaryByAccounts({
    items = [],
    formatAmount,
}: Props) {

    const rows: any[] =
        Array.isArray(items)
            ? items
            : [];

    const grandTotal =
        rows.reduce(
            (
                total: number,
                item: any
            ) =>
                total +
                Number(
                    item?.amount ?? 0
                ),
            0
        );

    return (
        <div className="abstract-by-summary-section">

            <table className="abstract-by-summary-table">

                <thead>
                    <tr>
                        <th>ACCOUNT CODE</th>

                        <th>PARTICULARS</th>

                        <th>AMOUNT</th>
                    </tr>
                </thead>

                <tbody>

                    {rows.length === 0 ? (

                        <tr>
                            <td
                                colSpan={3}
                                className="abstract-by-summary-empty"
                            >
                                No account records found.
                            </td>
                        </tr>

                    ) : (

                        rows.map(
                            (
                                item: any,
                                index: number
                            ) => (

                                <tr
                                    key={
                                        item?.account_id ??
                                        item?.account_code ??
                                        index
                                    }
                                >

                                    <td>
                                        {
                                            item?.account_code ??
                                            "—"
                                        }
                                    </td>

                                    <td>
                                        {
                                            item?.account_name ??
                                            "—"
                                        }
                                    </td>

                                    <td className="abstract-by-summary-amount">
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
                            className="abstract-by-summary-total-label"
                        >
                            Grand Total:
                        </td>

                        <td className="abstract-by-summary-total">
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
