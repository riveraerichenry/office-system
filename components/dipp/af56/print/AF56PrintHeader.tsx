"use client";

import React from "react";

type Props = {
    transaction: any;
};

function formatDate(value: any) {
    if (!value) {
        return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleDateString("en-PH", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
    });
}

function formatAmount(value: any) {
    const amount = Number(value ?? 0);

    return amount.toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

function numberToWords(amount: number): string {
    if (!Number.isFinite(amount) || amount < 0) {
        return "";
    }

    const ones = [
        "",
        "ONE",
        "TWO",
        "THREE",
        "FOUR",
        "FIVE",
        "SIX",
        "SEVEN",
        "EIGHT",
        "NINE",
        "TEN",
        "ELEVEN",
        "TWELVE",
        "THIRTEEN",
        "FOURTEEN",
        "FIFTEEN",
        "SIXTEEN",
        "SEVENTEEN",
        "EIGHTEEN",
        "NINETEEN",
    ];

    const tens = [
        "",
        "",
        "TWENTY",
        "THIRTY",
        "FORTY",
        "FIFTY",
        "SIXTY",
        "SEVENTY",
        "EIGHTY",
        "NINETY",
    ];

    function convertHundreds(value: number): string {
        let result = "";

        if (value >= 100) {
            result +=
                ones[Math.floor(value / 100)] +
                " HUNDRED";

            value %= 100;

            if (value > 0) {
                result += " ";
            }
        }

        if (value >= 20) {
            result +=
                tens[Math.floor(value / 10)];

            value %= 10;

            if (value > 0) {
                result +=
                    " " + ones[value];
            }
        } else if (value > 0) {
            result += ones[value];
        }

        return result;
    }

    const pesos = Math.floor(amount);

    let centavos = Math.round(
        (amount - pesos) * 100
    );

    let adjustedPesos = pesos;

    if (centavos === 100) {
        adjustedPesos += 1;
        centavos = 0;
    }

    let remaining = adjustedPesos;

    let result = "";

    if (adjustedPesos === 0) {
        result = "ZERO PESOS";
    } else {
        const millions = Math.floor(
            remaining / 1000000
        );

        if (millions > 0) {
            result +=
                convertHundreds(millions) +
                " MILLION";

            remaining %= 1000000;

            if (remaining > 0) {
                result += " ";
            }
        }

        const thousands = Math.floor(
            remaining / 1000
        );

        if (thousands > 0) {
            result +=
                convertHundreds(thousands) +
                " THOUSAND";

            remaining %= 1000;

            if (remaining > 0) {
                result += " ";
            }
        }

        if (remaining > 0) {
            result +=
                convertHundreds(remaining);
        }

        result += " PESOS";
    }

    if (centavos > 0) {
        result +=
            " AND " +
            String(centavos).padStart(
                2,
                "0"
            ) +
            " CENTAVOS";
    } else {
        result += " ONLY";
    }

    return result;
}

function titleCase(value: string) {
    return value
        .toLowerCase()
        .replace(
            /\b\w/g,
            (char) => char.toUpperCase()
        );
}

export default function AF56PrintHeader({
    transaction,
}: Props) {

    const municipality =
        transaction?.city_municipality ??
        "TAYTAY";

    const province =
        transaction?.province ??
        "PALAWAN";

    const receiptDate =
        transaction?.receipt_date ??
        transaction?.created_at ??
        "";

    const payor =
        transaction?.payor ??
        "";

    const total = Number(
        transaction?.grand_total ?? 0
    );

    const amount =
        formatAmount(total);

    const amountInWords =
        numberToWords(total);

    return (
        <div
            className="af56-header"
            style={{
                /*
                 * =====================================================
                 * AF56 HEADER POSITION CALIBRATION
                 * =====================================================
                 *
                 * All positioning is now in PIXELS.
                 *
                 * Adjust only these values when calibrating.
                 */


                /* MUNICIPALITY / PROVINCE */

                "--af56-municipality-x": "230px",
                "--af56-municipality-y": "110px",
                "--af56-municipality-width": "500px",
                "--af56-municipality-size": "14px",


                /* DATE */

                "--af56-date-x": "850px",
                "--af56-date-y": "110px",
                "--af56-date-width": "140px",
                "--af56-date-size": "14px",


                /* PAYOR */

                "--af56-payor-x": "310px",
                "--af56-payor-y": "135px",
                "--af56-payor-width": "300px",
                "--af56-payor-size": "14px",


                /* AMOUNT IN WORDS */

                "--af56-words-x": "630px",
                "--af56-words-y": "125px",
                "--af56-words-width": "220px",
                "--af56-words-size": "10px",


                /* TOTAL AMOUNT */

                "--af56-amount-x": "850px",
                "--af56-amount-y": "130px",
                "--af56-amount-width": "130px",
                "--af56-amount-size": "14px",

            } as React.CSSProperties}
        >

            {/* MUNICIPALITY / PROVINCE */}

            <div className="af56-field af56-municipality">
                {municipality} / {province}
            </div>


            {/* DATE */}

            <div className="af56-field af56-date">
                {formatDate(receiptDate)}
            </div>


            {/* PAYOR */}

            <div className="af56-field af56-payor">
                {payor}
            </div>


            {/* AMOUNT IN WORDS */}

            <div className="af56-field af56-amount-words">
                {titleCase(amountInWords)}
            </div>


            {/* TOTAL AMOUNT */}

            <div className="af56-field af56-amount">
                ₱ {amount}
            </div>


            <style jsx>{`

                /* =====================================================
                   BASE FIELD
                ===================================================== */

                .af56-field {
                    position: absolute;

                    box-sizing: border-box;

                    white-space: nowrap;

                    overflow: hidden;

                    text-overflow: clip;

                    line-height: 1.1;
                }


                /* =====================================================
                   MUNICIPALITY / PROVINCE
                ===================================================== */

                .af56-municipality {

                    position: absolute;

                    left: var(
                        --af56-municipality-x
                    );

                    top: var(
                        --af56-municipality-y
                    );

                    width: var(
                        --af56-municipality-width
                    );

                    font-size: var(
                        --af56-municipality-size
                    );
                }


                /* =====================================================
                   DATE
                ===================================================== */

                .af56-date {

                    position: absolute;

                    left: var(
                        --af56-date-x
                    );

                    top: var(
                        --af56-date-y
                    );

                    width: var(
                        --af56-date-width
                    );

                    font-size: var(
                        --af56-date-size
                    );
                }


                /* =====================================================
                   PAYOR
                ===================================================== */

                .af56-payor {

                    position: absolute;

                    left: var(
                        --af56-payor-x
                    );

                    top: var(
                        --af56-payor-y
                    );

                    width: var(
                        --af56-payor-width
                    );

                    font-size: var(
                        --af56-payor-size
                    );
                }


                /* =====================================================
                   AMOUNT IN WORDS
                ===================================================== */

                .af56-amount-words {

                    position: absolute;

                    left: var(
                        --af56-words-x
                    );

                    top: var(
                        --af56-words-y
                    );

                    width: var(
                        --af56-words-width
                    );

                    font-size: var(
                        --af56-words-size
                    );

                    /*
                     * Width controls where
                     * the amount wraps.
                     */

                    white-space: normal !important;

                    overflow: visible !important;

                    text-overflow: unset !important;

                    height: auto !important;

                    line-height: 1.15 !important;

                    word-break: normal !important;

                    overflow-wrap: normal !important;
                }


                /* =====================================================
                   TOTAL AMOUNT
                ===================================================== */

                .af56-amount {

                    position: absolute;

                    left: var(
                        --af56-amount-x
                    );

                    top: var(
                        --af56-amount-y
                    );

                    width: var(
                        --af56-amount-width
                    );

                    font-size: var(
                        --af56-amount-size
                    );

                    text-align: right;
                }

            `}</style>

        </div>
    );
}