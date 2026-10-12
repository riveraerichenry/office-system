"use client";

type Props = {
totalCollections: number;
cashCollections?: number;
checkCollections?: number;
balance: number;
formatCurrency: (
value: number | string | null | undefined
) => string;
};

export default function RCDSummary({
totalCollections,
cashCollections,
checkCollections,
balance,
formatCurrency,
}: Props) {
// Backward-compatible defaults for the current RCDPreview.
const cash = cashCollections ?? totalCollections;
const checks = checkCollections ?? 0;

return (
    <section className="rcd-section">
        <div className="rcd-section-title">
            D. SUMMARY OF COLLECTIONS AND REMITTANCES /
            DEPOSITS - List of Check
        </div>

        <div className="summary">
            <div className="summary-row">
                <span>Beginning Balance</span>
                <strong>{formatCurrency(0)}</strong>
            </div>

            <div className="summary-row">
                <span>ADD: &nbsp; Collections</span>
                <strong>
                    {formatCurrency(totalCollections)}
                </strong>
            </div>

            <div className="summary-row">
                <span>CASH</span>
                <strong className="summary-cash-value">
                    {formatCurrency(cash)}
                </strong>
            </div>

            <div className="summary-row">
                <span>CHECKS</span>
                <strong className="summary-cash-value">
                    {formatCurrency(checks)}
                </strong>
            </div>

            <div className="summary-row">
                <span>&nbsp;</span>
                <strong>{formatCurrency(0)}</strong>
            </div>

            <div className="summary-row">
                <span>LESS: Remittances / Deposits to</span>
                <strong>{formatCurrency(0)}</strong>
            </div>

            <div className="summary-row">
                <span>Cashiers</span>
                <strong className="summary-cash-value">
                    {formatCurrency(totalCollections)}
                </strong>
            </div>

            <div className="summary-row">
                <span>Treasurer/Depository Bank</span>
                <strong>{formatCurrency(0)}</strong>
            </div>

            <div className="summary-row">
                <span>Balance</span>
                <strong>0.00</strong>
            </div>

            <div className="summary-row">
                <span>&nbsp;</span>
                <strong>{formatCurrency(0)}</strong>
            </div>
        </div>
    </section>
);

}