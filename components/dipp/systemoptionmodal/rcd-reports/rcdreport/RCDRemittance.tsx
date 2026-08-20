"use client";

type Props = {
    totalDeposits: number;
    formatCurrency: (
        value: number | string | null | undefined
    ) => string;
};

export default function RCDRemittance({
    totalDeposits,
    formatCurrency,
}: Props) {
    return (
        <section className="rcd-section">

            <div className="rcd-section-title">
                B. REMITTANCES / DEPOSITS
            </div>


            <table className="rcd-table">

                <thead>

                    <tr>

                        <th>
                            Accountable Officer / Bank
                        </th>

                        <th>
                            Reference
                        </th>

                        <th>
                            Amount
                        </th>

                    </tr>

                </thead>


                <tbody>

                    <tr>

                        <td>
                            —
                        </td>

                        <td
                            className="center italic"
                            style={{
                                fontWeight: 400,
                                fontSize: "10px",
                            }}
                        >
                            Please See Attached Deposit
                        </td>

                        <td className="right">
                            {formatCurrency(
                                totalDeposits
                            )}
                        </td>

                    </tr>


                    <tr>

                        <td
                            colSpan={2}
                            className="bold"
                        >
                            TOTAL
                        </td>

                        <td className="right bold" style={{
                            fontSize: "14px",
                        }}>

                            {formatCurrency(
                                totalDeposits
                            )}

                        </td>

                    </tr>

                </tbody>

            </table>

        </section>
    );
}