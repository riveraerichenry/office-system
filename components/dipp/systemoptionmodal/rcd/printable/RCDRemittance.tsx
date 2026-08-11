"use client";

type Props = {
    remittances: any[];
    deposits: any[];
    totalRemittances: number;
    totalDeposits: number;
    formatAmount: (value: any) => string;
};

export default function RCDRemittance({
    remittances,
    deposits,
    totalRemittances,
    totalDeposits,
    formatAmount,
}: Props) {
    const hasRemittances =
        remittances.length > 0 ||
        deposits.length > 0;

    const rows = [
        ...remittances,
        ...deposits,
    ];

    return (
        <section className="rcd-remittance">

            {/* =================================================
                B. REMITTANCES / DEPOSITS
            ================================================= */}

            <div className="section-title">
                B. REMITTANCES / DEPOSITS
            </div>

            {hasRemittances ? (

                <table className="remittance-table">

                    <thead>

                        <tr>

                            <th>
                                Accountable Officer / Bank
                            </th>

                            <th>
                                Reference
                            </th>

                            <th>
                                Date
                            </th>

                            <th>
                                Amount
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {rows.map(
                            (
                                item: any,
                                index: number
                            ) => (

                                <tr
                                    key={
                                        item?.id ??
                                        index
                                    }
                                >

                                    <td>

                                        {
                                            item?.accountable_officer ??
                                            item?.collector ??
                                            item?.bank ??
                                            ""
                                        }

                                    </td>

                                    <td className="center">

                                        {
                                            item?.reference ??
                                            item?.reference_no ??
                                            item?.remittance_no ??
                                            ""
                                        }

                                    </td>

                                    <td className="center">

                                        {formatDate(
                                            item?.remittance_date ??
                                            item?.deposit_date ??
                                            item?.date
                                        )}

                                    </td>

                                    <td className="right">

                                        {formatAmount(
                                            item?.amount ??
                                            item?.total_amount ??
                                            0
                                        )}

                                    </td>

                                </tr>

                            )
                        )}

                    </tbody>

                    <tfoot>

                        <tr>

                            <td
                                colSpan={3}
                                className="total-label"
                            >
                                TOTAL
                            </td>

                            <td className="right bold">

                                {formatAmount(
                                    totalRemittances +
                                    totalDeposits
                                )}

                            </td>

                        </tr>

                    </tfoot>

                </table>

            ) : (

                <table className="remittance-table">

                    <tbody>

                        <tr>

                            <td
                                colSpan={4}
                                className="empty-row"
                            >
                                No remittances or
                                deposits recorded
                                for the selected period.
                            </td>

                        </tr>

                    </tbody>

                </table>

            )}

        </section>
    );
}

function formatDate(
    value: any
) {
    if (!value) {
        return "";
    }

    const text =
        String(value);

    const date =
        new Date(
            text.length === 10
                ? `${text}T00:00:00`
                : text
        );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return text;
    }

    return date.toLocaleDateString(
        "en-PH",
        {
            month: "long",
            day: "numeric",
            year: "numeric",
        }
    );
}