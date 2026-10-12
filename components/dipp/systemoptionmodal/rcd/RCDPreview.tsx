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

/* =========================================================
   DATE
========================================================= */

function formatDate(value?: string | null): string {
    if (!value) return "—";

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

/* =========================================================
   CURRENCY
========================================================= */

function formatCurrency(
    value: number | string | null | undefined
): string {
    const amount = Number(value ?? 0);

    return (Number.isFinite(amount) ? amount : 0).toLocaleString(
        "en-US",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }
    );
}

/* =========================================================
   NUMBER TO WORDS
========================================================= */

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
    if (number === 0) return "Zero";

    if (number < 20) return ones[number];

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

    if (number < 1_000_000) {
        return (
            numberToWords(Math.floor(number / 1000)) +
            " Thousand" +
            (number % 1000
                ? ` ${numberToWords(number % 1000)}`
                : "")
        );
    }

    if (number < 1_000_000_000) {
        return (
            numberToWords(Math.floor(number / 1_000_000)) +
            " Million" +
            (number % 1_000_000
                ? ` ${numberToWords(number % 1_000_000)}`
                : "")
        );
    }

    return (
        numberToWords(Math.floor(number / 1_000_000_000)) +
        " Billion"
    );
}

/* =========================================================
   AMOUNT TO WORDS
========================================================= */

function amountToWords(value: number | string): string {
    const amount = Number(value ?? 0);

    if (!Number.isFinite(amount)) {
        return "Zero Pesos Only";
    }

    const pesos = Math.floor(amount);
    const centavos = Math.round((amount - pesos) * 100);

    let result = `${numberToWords(pesos)} Pesos`;

    if (centavos > 0) {
        result += ` & ${numberToWords(centavos)} Centavos`;
    }

    return `${result} Only`;
}

/* =========================================================
   COMPONENT
========================================================= */

export default function RCDPreview({
    rcd,
    items,
    fundSource,
    user,
    previousFormRows = [],
}: Props) {
    /* =====================================================
       TOTALS
    ===================================================== */

    const totalCollections = Number(rcd?.total_collections ?? 0);
    const totalDeposits = Number(rcd?.total_deposits ?? 0);
    const balance = Number(rcd?.balance ?? 0);

    /* =====================================================
       CASH AND CHECK COLLECTIONS
    ===================================================== */

    const { cashCollections, checkCollections } = useMemo(() => {
        const totals: {
            cashCollections: number;
            checkCollections: number;
        } = {
            cashCollections: 0,
            checkCollections: 0,
        };

        for (const item of items) {
            const mode = String(item.payment_mode ?? "")
                .trim()
                .toLowerCase()
                .replace(/[^a-z]/g, "");

            const amount = Number(item.amount ?? 0);

            if (!Number.isFinite(amount)) {
                continue;
            }

            if (mode === "cash") {
                totals.cashCollections += amount;
            } else if (
                ["check", "checks", "cheque", "cheques"].includes(
                    mode
                )
            ) {
                totals.checkCollections += amount;
            }
        }

        return totals;
    }, [items]);

    /* =====================================================
       FORM ROWS
    ===================================================== */

    const formRows = useMemo<RCDFormRow[]>(() => {
        const groups: Record<string, RCDItem[]> = {};

        for (const item of items) {
            const formCode = String(item.form_code ?? "—").trim();

            if (!groups[formCode]) {
                groups[formCode] = [];
            }

            groups[formCode].push(item);
        }

        return Object.entries(groups).map(
            ([formCode, groupItems]) => {
                const serials = groupItems
                    .map((item) =>
                        String(item.or_number ?? "").trim()
                    )
                    .filter((value) => value !== "");

                const numericSerials = serials
                    .map(Number)
                    .filter((value) => !Number.isNaN(value));

                let from = serials[0] ?? "—";
                let to = serials[serials.length - 1] ?? "—";

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

                const amount = groupItems.reduce(
                    (total, item) =>
                        total + Number(item.amount ?? 0),
                    0
                );

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

                const previousRow = previousFormRows.find(
                    (row) =>
                        row.formCode.trim().toUpperCase() ===
                        formCode.trim().toUpperCase()
                );

                const width = Math.max(
                    serials[0]?.length ?? 0,
                    String(bookletEndingRaw ?? "").length
                );

                let beginningFrom: string | null = null;
                let beginningTo: string | null = null;

                if (currentMin !== null) {
                    beginningFrom = String(currentMin).padStart(
                        width,
                        "0"
                    );

                    if (bookletEnding !== null) {
                        beginningTo = String(bookletEnding).padStart(
                            width,
                            "0"
                        );
                    } else {
                        beginningTo =
                            previousRow?.beginningTo ?? null;
                    }
                }

                let endingFrom: string | null = null;
                let endingTo: string | null = null;

                if (
                    currentMax !== null &&
                    bookletEnding !== null &&
                    currentMax < bookletEnding
                ) {
                    endingFrom = String(currentMax + 1).padStart(
                        width,
                        "0"
                    );

                    endingTo = String(bookletEnding).padStart(
                        width,
                        "0"
                    );
                } else if (previousRow) {
                    endingFrom = previousRow.endingFrom ?? null;
                    endingTo = previousRow.endingTo ?? null;
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

    /* =====================================================
       EMPTY STATE
    ===================================================== */

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

    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <div className="rcd-preview-wrapper">
            <div id="rcd-print-area" className="rcd-paper">
                <div className="rcd-content">
                    <RCDHeader
                        rcd={rcd}
                        fundSource={fundSource}
                        user={user}
                        formatDate={formatDate}
                    />

                    <RCDCollections
                        formRows={formRows}
                        totalCollections={totalCollections}
                        formatCurrency={formatCurrency}
                    />

                    <RCDLiquidation
                        rcd={rcd}
                        user={user}
                        totalCollections={totalCollections}
                        formatCurrency={formatCurrency}
                    />

                    <RCDRemittance
                        totalDeposits={totalDeposits}
                        formatCurrency={formatCurrency}
                    />

                    <RCDAccountability formRows={formRows} />
                </div>

                <div className="rcd-bottom">
                    <div className="rcd-summary-container">
                        <RCDSummary
                            totalCollections={totalCollections}
                            cashCollections={cashCollections}
                            checkCollections={checkCollections}
                            balance={balance}
                            formatCurrency={formatCurrency}
                        />
                    </div>

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