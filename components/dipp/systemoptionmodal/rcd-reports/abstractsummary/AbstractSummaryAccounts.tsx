"use client";

type Props = {
    items?: any[];

    formatAmount: (
        value: any
    ) => string;
};

export default function AbstractSummaryAccounts({
    items = [],
    formatAmount,
}: Props) {

    const rows: any[] =
        Array.isArray(items)
            ? items
            : [];

    const grandTotal: number =
        rows.reduce(
            (
                total: number,
                item: any
            ): number => {

                return (
                    total +
                    Number(
                        item?.amount ?? 0
                    )
                );

            },
            0
        );

    return (

        <div className="
            abstract-summary-section
        ">

            <table className="
                abstract-summary-table
            ">

                <thead>

                    <tr>

                        <th>
                            Account Number
                        </th>

                        <th>
                            Account Description / Name
                        </th>

                        <th>
                            Amount
                        </th>

                    </tr>

                </thead>


                <tbody>

                    {rows.length === 0 ? (

                        <tr>

                            <td
                                colSpan={3}
                                className="
                                    abstract-summary-empty
                                "
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


                                    <td className="
                                        abstract-summary-amount
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
                                abstract-summary-total-label
                            "
                        >
                            GRAND TOTAL
                        </td>

                        <td className="
                            abstract-summary-total
                        ">

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