"use client";

import { RCD } from "./RCDTypes";

type Props = {
    rcd: RCD;
    totalCollections: number;
    cashCollections: number;
    checkCollections: number;
    balance: number;
    formatCurrency: (
        value: number | string | null | undefined,
        rcd?: RCD | null
    ) => string;
};

export default function RCDSummary({
    rcd,
    totalCollections,
    cashCollections,
    checkCollections,
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
                    <span>Beginning Balance</span>
                    <strong>0.00</strong>
                </div>

                <div className="summary-row">
                    <span>ADD: &nbsp; Collections</span>
                    <strong>
                        {formatCurrency(
                            totalCollections,
                            rcd
                        )}
                    </strong>
                </div>

                <div className="summary-row">
                    <span>CASH</span>
                    <strong className="summary-cash-value">
                        {formatCurrency(
                            cashCollections,
                            rcd
                        )}
                    </strong>
                </div>

                <div className="summary-row">
                    <span>CHECKS</span>
                    <strong className="summary-cash-value">
                        {formatCurrency(
                            checkCollections,
                            rcd
                        )}
                    </strong>
                </div>

                <div className="summary-row">
                    <span>&nbsp;</span>
                    <strong>0.00</strong>
                </div>

                <div className="summary-row">
                    <span>LESS: Remittances / Deposits to</span>
                    <strong>0.00</strong>
                </div>

                <div className="summary-row">
                    <span>Cashiers</span>
                    <strong className="summary-cash-value">
                        {formatCurrency(
                            totalCollections,
                            rcd
                        )}
                    </strong>
                </div>

                <div className="summary-row">
                    <span>Treasurer/Depository Bank</span>
                    <strong>0.00</strong>
                </div>

                <div className="summary-row">
                    <span>Balance</span>
                    <strong>
                        {formatCurrency(
                            balance,
                            rcd
                        )}
                    </strong>
                </div>

                <div className="summary-row">
                    <span>&nbsp;</span>
                    <strong>0.00</strong>
                </div>
            </div>
        </section>
    );
}