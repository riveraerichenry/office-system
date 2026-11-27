"use client";

import { useMemo } from "react";

import RCDHeader from "./RCDHeader";
import RCDCollections from "./RCDCollections";
import RCDLiquidation from "./RCDLiquidation";
import RCDRemittance from "./RCDRemittance";
import RCDAccountability from "./RCDAccountability";
import RCDSummary from "./RCDSummary";
import RCDFooter from "./RCDFooter";

import {
    RCD,
    RCDItem,
    RCDFundSource,
    RCDUser,
    RCDFormRow,
} from "./RCDTypes";

import "./RCDPreview.css";

type Props = {
    rcd: RCD | null;
    items: RCDItem[];
    fundSource?: RCDFundSource | null;
    user?: RCDUser | null;
    previousFormRows?: RCDFormRow[];
};

// ============================================================
// DATE
// ============================================================

function formatDate(value?: string | null): string {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
    });
}

// ============================================================
// CURRENCY - RPT 2/3 DECIMAL PLACES, NON-RPT 2
// ============================================================

function isRPTFund(fund: any): boolean {
    const identifiers = [
        fund?.fund_code,
        fund?.fund_name,
        fund?.acronym,
        fund?.name,
    ]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase());

    return identifiers.some((value) =>
        value.includes("rpt") ||
        value.includes("real property tax") ||
        value.includes("property tax")
    );
}

function formatCurrency(
    value: number | string | null | undefined,
    isRPT: boolean
): string {
    const amount = Number(value ?? 0);

    if (!Number.isFinite(amount)) {
        return "0.00";
    }

    // Check the rounded thousandths digit to avoid floating-point noise.
    const threeDecimalString = Math.abs(amount).toFixed(3);
    const thirdDecimalDigit = threeDecimalString.split(".")[1]?.[2] ?? "0";
    const useThreeDecimals = isRPT && thirdDecimalDigit !== "0";

    return amount.toLocaleString("en-US", {
        minimumFractionDigits: useThreeDecimals ? 3 : 2,
        maximumFractionDigits: useThreeDecimals ? 3 : 2,
    });
}

// ============================================================
// NUMBER TO WORDS
// ============================================================

const ones: string[] = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
];

const tens: string[] = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
];

function numberToWords(number: number): string {
    if (number === 0) {
        return "Zero";
    }

    if (number < 20) {
        return ones[number];
    }

    if (number < 100) {
        return (
            tens[Math.floor(number / 10)] +
            (number % 10 ? ` ${ones[number % 10]}` : "")
        );
    }

    if (number < 1000) {
        return (
            ones[Math.floor(number / 100)] +
            " Hundred" +
            (number % 100
                ? ` ${numberToWords(number % 100)}`
                : "")
        );
    }

    if (number < 1000000) {
        return (
            numberToWords(Math.floor(number / 1000)) +
            " Thousand" +
            (number % 1000
                ? ` ${numberToWords(number % 1000)}`
                : "")
        );
    }

    if (number < 1000000000) {
        return (
            numberToWords(Math.floor(number / 1000000)) +
            " Million" +
            (number % 1000000
                ? ` ${numberToWords(number % 1000000)}`
                : "")
        );
    }

    return (
        numberToWords(Math.floor(number / 1000000000)) +
        " Billion"
    );
}

// ============================================================
// AMOUNT TO WORDS
// ============================================================

function amountToWords(value: number | string): string {
    const amount = Number(value ?? 0);
    const pesos = Math.floor(amount);
    const centavos = Math.round((amount - pesos) * 100);

    let result = `${numberToWords(pesos)} Pesos`;

    if (centavos > 0) {
        result += ` & ${numberToWords(centavos)} Centavos`;
    }

    return result + " Only";
}

function getDisplayFormCode(item: RCDItem): string {
    const formCode = String(item.form_code ?? "").trim();

    const normalizedFormCode = formCode
        .toUpperCase()
        .replace(/[\\_-]+/g, " ");

    const isCashTicket =
        (item.cash_ticket_transaction_id !== null &&
            item.cash_ticket_transaction_id !== undefined) ||
        normalizedFormCode === "CASH TICKET";

    return isCashTicket
        ? "CASH TICKET"
        : formCode || "—";
}

// ============================================================
// COMPONENT
// ============================================================

export default function RCDPreview({
    rcd,
    items,
    fundSource,
    user,
    previousFormRows = [],
}: Props) {
    const activeFundSource = fundSource ?? (rcd as any)?.fund_source ?? null;
    const rptFund = isRPTFund(activeFundSource);

    const formatAmount = (value: number | string | null | undefined) =>
        formatCurrency(value, rptFund);

    // ========================================================
    // TOTALS
    // ========================================================

    const totalCollections = Number(
        rcd?.total_collections ?? 0
    );

    const totalDeposits = Number(
        rcd?.total_deposits ?? 0
    );

    const balance = Number(
        rcd?.balance ?? 0
    );

    // ========================================================
    // CASH AND CHECKS FROM PAYMENT MODE
    // ========================================================

    const cashCollections = useMemo(() => {
        return items.reduce((total, item) => {
            const paymentMode = String(
                item.payment_mode ?? ""
            )
                .trim()
                .toLowerCase();

            if (paymentMode === "cash") {
                return total + Number(item.amount ?? 0);
            }

            return total;
        }, 0);
    }, [items]);

    const checkCollections = useMemo(() => {
        return items.reduce((total, item) => {
            const paymentMode = String(
                item.payment_mode ?? ""
            )
                .trim()
                .toLowerCase();

            if (
                ["check", "checks", "cheque", "cheques"].includes(
                    paymentMode
                )
            ) {
                return total + Number(item.amount ?? 0);
            }

            return total;
        }, 0);
    }, [items]);

    // ========================================================
    // FORM ROWS
    // Group by accountable form and booklet
    // ========================================================

    const formRows = useMemo<RCDFormRow[]>(() => {
        const groups: Record<string, RCDItem[]> = {};

        for (const item of items) {
            const formCode = getDisplayFormCode(item);

            const bookletId =
                item.booklet_registration_id?.trim();

            const bookletKey = bookletId
                ? `BOOKLET:${bookletId}`
                : `RANGE:${String(
                      item.booklet_beginning_or ?? ""
                  )}:${String(
                      item.booklet_ending_or ?? ""
                  )}`;

            const groupKey =
                `${formCode.toUpperCase()}::${bookletKey}`;

            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }

            groups[groupKey].push(item);
        }

        return Object.entries(groups).map(
            ([, groupItems]) => {
                const formCode = getDisplayFormCode(groupItems[0]);

                // Current OR numbers

                const serials = groupItems
                    .map((item) =>
                        String(item.or_number ?? "").trim()
                    )
                    .filter((value) => value !== "");

                const numericSerials = serials
                    .map((value) => Number(value))
                    .filter((value) => !Number.isNaN(value));

                let from = serials[0] ?? "—";

                let to =
                    serials[serials.length - 1] ?? "—";

                let currentMin: number | null = null;
                let currentMax: number | null = null;

                if (numericSerials.length > 0) {
                    currentMin = Math.min(...numericSerials);
                    currentMax = Math.max(...numericSerials);

                    const serialWidth = Math.max(
                        serials[0]?.length ?? 0,
                        serials[serials.length - 1]?.length ?? 0
                    );

                    from = String(currentMin).padStart(
                        serialWidth,
                        "0"
                    );

                    to = String(currentMax).padStart(
                        serialWidth,
                        "0"
                    );
                }

                // Current form amount

                const amount = groupItems.reduce(
                    (total, item) =>
                        total + Number(item.amount ?? 0),
                    0
                );

                // Find booklet

                const bookletItem =
                    groupItems.find(
                        (item) =>
                            item.booklet_ending_or !== null &&
                            item.booklet_ending_or !== undefined
                    ) ?? groupItems[0];

                const bookletEndingRaw =
                    bookletItem?.booklet_ending_or;

                const bookletEnding =
                    bookletEndingRaw !== null &&
                    bookletEndingRaw !== undefined &&
                    String(bookletEndingRaw).trim() !== ""
                        ? Number(bookletEndingRaw)
                        : null;

                // Previous accountability row fallback

                const previousRow = previousFormRows.find(
                    (row) =>
                        row.formCode.trim().toUpperCase() ===
                        formCode.trim().toUpperCase()
                );

                const width = Math.max(
                    serials[0]?.length ?? 0,
                    String(bookletEndingRaw ?? "").length
                );

                // Beginning balance

                let beginningFrom: string | null = null;
                let beginningTo: string | null = null;

                if (currentMin !== null) {
                    beginningFrom = String(
                        currentMin
                    ).padStart(width, "0");

                    if (bookletEnding !== null) {
                        beginningTo = String(
                            bookletEnding
                        ).padStart(width, "0");
                    } else {
                        beginningTo =
                            previousRow?.beginningTo ?? null;
                    }
                }

                // Ending balance

                let endingFrom: string | null = null;
                let endingTo: string | null = null;

                if (
                    currentMax !== null &&
                    bookletEnding !== null &&
                    currentMax < bookletEnding
                ) {
                    endingFrom = String(
                        currentMax + 1
                    ).padStart(width, "0");

                    endingTo = String(
                        bookletEnding
                    ).padStart(width, "0");
                } else if (previousRow) {
                    endingFrom =
                        previousRow.endingFrom ?? null;

                    endingTo =
                        previousRow.endingTo ?? null;
                }

                return {
                    formCode,
                    from,
                    to,
                    quantity: serials.length,
                    amount,
                    beginningFrom,
                    beginningTo,
                    endingFrom,
                    endingTo,
                };
            }
        );
    }, [items, previousFormRows]);

    // ========================================================
    // EMPTY STATE
    // ========================================================

    if (!rcd) {
        return (
            <div className="rcd-preview-empty">
                <div className="rcd-preview-empty-content">
                    <p className="rcd-preview-empty-title">
                        RCD Preview
                    </p>

                    <p className="rcd-preview-empty-text">
                        Generate an RCD to display the form.
                    </p>
                </div>
            </div>
        );
    }

    // ========================================================
    // RENDER
    // ========================================================

    return (
        <div className="rcd-preview-wrapper">
            <div className="rcd-paper rcd-print-area">
                <div className="rcd-content">
                    {/* HEADER */}

                    <RCDHeader
                        rcd={rcd}
                        fundSource={fundSource}
                        user={user}
                        formatDate={formatDate}
                    />

                    {/* COLLECTIONS */}

                    <RCDCollections
                        rcd={rcd}
                        items={items}
                        totalCollections={totalCollections}
                        formatCurrency={formatAmount}
                    />

                    {/* LIQUIDATION */}

                    <RCDLiquidation
                        rcd={rcd}
                        user={user}
                        totalCollections={totalCollections}
                        formatCurrency={formatAmount}
                    />

                    {/* REMITTANCE */}

                    <RCDRemittance
                        totalDeposits={totalDeposits}
                        formatCurrency={formatAmount}
                    />

                    {/* ACCOUNTABILITY */}

                    <RCDAccountability
                        formRows={formRows}
                    />
                </div>

                <div className="rcd-bottom">
                    {/* SUMMARY */}

                    <div className="rcd-summary-container">
                        <RCDSummary
                            rcd={rcd}
                            totalCollections={totalCollections}
                            cashCollections={cashCollections}
                            checkCollections={checkCollections}
                            balance={balance}
                            formatCurrency={formatAmount}
                        />
                    </div>

                    {/* FOOTER */}

                    <div className="rcd-footer-container">
                        <RCDFooter
                            rcd={rcd}
                            user={user}
                            totalCollections={totalCollections}
                            formatDate={formatDate}
                            amountToWords={amountToWords}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}