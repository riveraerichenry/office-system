
"use client";

type Props = {
    totalCollections: number;
    cashCollections: number;
    checkCollections: number;
    totalRemittances: number;
    totalDeposits: number;
    balance: number;
    formatAmount: (value: any) => string;
};

export default function RCDSummary({
    totalCollections,
    cashCollections,
    checkCollections,
    totalRemittances,
    totalDeposits,
    balance,
    formatAmount,
}: Props) {
    return (
        <section className="rcd-summary">

            {/* =================================================
                D. SUMMARY
            ================================================= */}

            <div className="section-title summary-title">

                D. SUMMARY OF COLLECTIONS AND
                <br />
                REMITTANCES / DEPOSITS

                <span className="normal">
                    {" "}
                    - List of Check
                </span>

            </div>

            <div className="summary-area">

                {/* BEGINNING BALANCE */}

                <div className="summary-row">

                    <span>
                        Beginning Balance
                    </span>

                    <span className="right">
                        0.00
                    </span>

                </div>

                {/* COLLECTIONS */}

                <div className="summary-row">

                    <span className="bold">
                        ADD: Collections
                    </span>

                    <span className="right bold">
                        {formatAmount(totalCollections)}
                    </span>

                </div>

                {/* CASH */}

                <div className="summary-row">

                    <span>
                        CASH
                    </span>

                    <span className="right summary-payment-value">
                        {formatAmount(cashCollections)}
                    </span>

                </div>

                {/* CHECKS */}

                <div className="summary-row">

                    <span>
                        CHECKS
                    </span>

                    <span className="right summary-payment-value">
                        {formatAmount(checkCollections)}
                    </span>

                </div>

                {/* REMITTANCES */}

                <div className="summary-row">

                    <span className="bold">
                        LESS: Remittances /
                        <br />
                        Deposits
                    </span>

                    <span className="right">
                        {formatAmount(
                            totalRemittances + totalDeposits
                        )}
                    </span>

                </div>

                {/* BALANCE */}

                <div className="summary-row">

                    <span className="bold">
                        Balance
                    </span>

                    <span className="right bold">
                        {formatAmount(balance)}
                    </span>

                </div>

            </div>

        </section>
    );
}
