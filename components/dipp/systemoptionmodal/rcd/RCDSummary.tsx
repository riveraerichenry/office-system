"use client";

type Props = {
    totalCollections: number;
    balance: number;
    formatCurrency: (
        value: number | string | null | undefined
    ) => string;
};

export default function RCDSummary({
    totalCollections,
    balance,
    formatCurrency,
}: Props) {
    return (
        <section className="rcd-section">

            <div className="rcd-section-title">
                D. SUMMARY OF COLLECTIONS AND REMITTANCES /
                DEPOSITS - List of Check
            </div>


            <div className="summary">

                <div className="summary-row">

                    <span>
                        Beginning Balance
                    </span>

                    <strong>
                        0.00
                    </strong>

                </div>


                <div className="summary-row">

                    <span>
                        ADD: &nbsp; Collections
                    </span>

                    <strong>
                        0.00
                    </strong>

                </div>


                <div className="summary-row">

                    <span>
                        CASH
                    </span>

                    <strong className="summary-cash-value">
                        {formatCurrency(
                            totalCollections
                        )}
                    </strong>

                </div>


                <div className="summary-row">

                    <span>
                        CHECKS
                    </span>

                    <strong>
                        .00
                    </strong>

                </div>


                <div className="summary-row">

                    <span>
                        &nbsp;
                    </span>

                    <strong>
                        0.00
                    </strong>

                </div>


                <div className="summary-row">

                    <span>
                        LESS: Remittances / Deposits to
                    </span>

                    <strong>
                        0.00
                    </strong>

                </div>


                <div className="summary-row">

                    <span>
                        Cashiers
                    </span>

                    <strong className="summary-cash-value">
                        {formatCurrency(
                            totalCollections
                        )}
                    </strong>

                </div>


                <div className="summary-row">

                    <span>
                        Treasurer/Depository Bank
                    </span>

                    <strong>
                        0.00
                    </strong>

                </div>


                <div className="summary-row">

                    <span>
                        Balance
                    </span>

                    <strong>
                        0.00
                    </strong>

                </div>


                <div className="summary-row">

                    <span>
                        &nbsp;
                    </span>

                    <strong>
                        0.00
                    </strong>

                </div>

            </div>

        </section>
    );
}