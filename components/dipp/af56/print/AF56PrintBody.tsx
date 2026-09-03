"use client";

import React from "react";

type Props = {
    transaction: any;
    items?: any[];
};


/* ============================================================
   FORMAT AMOUNT
============================================================ */

function formatAmount(value: any) {
    const amount = Number(value ?? 0);

    return amount.toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}


/* ============================================================
   GET PERIOD RANGE
============================================================ */

function getPeriodRange(items: any[]) {
    const periods: {
        year: number;
        quarter: number;
        value: number;
    }[] = [];

    items.forEach((item) => {
        const startYear = Number(item?.start_year);
        const startQuarter = Number(item?.start_quarter);

        if (
            Number.isFinite(startYear) &&
            Number.isFinite(startQuarter) &&
            startQuarter >= 1 &&
            startQuarter <= 4
        ) {
            periods.push({
                year: startYear,
                quarter: startQuarter,
                value: startYear * 4 + startQuarter,
            });
        }

        const endYear = Number(
            item?.end_year ??
            item?.start_year
        );

        const endQuarter = Number(
            item?.end_quarter ??
            item?.start_quarter
        );

        if (
            Number.isFinite(endYear) &&
            Number.isFinite(endQuarter) &&
            endQuarter >= 1 &&
            endQuarter <= 4
        ) {
            periods.push({
                year: endYear,
                quarter: endQuarter,
                value: endYear * 4 + endQuarter,
            });
        }
    });

    if (periods.length === 0) {
        return {
            startYear: null,
            startQuarter: null,
            endYear: null,
            endQuarter: null,
        };
    }

    periods.sort((a, b) => a.value - b.value);

    const firstPeriod = periods[0];
    const lastPeriod = periods[periods.length - 1];

    return {
        startYear: firstPeriod.year,
        startQuarter: firstPeriod.quarter,
        endYear: lastPeriod.year,
        endQuarter: lastPeriod.quarter,
    };
}


/* ============================================================
   FORMAT YEAR RANGE
============================================================ */

function formatYearRange(
    startYear: number | null,
    endYear: number | null
) {
    if (!startYear) {
        return "";
    }

    if (!endYear || startYear === endYear) {
        return String(startYear);
    }

    return `${startYear}-${endYear}`;
}


/* ============================================================
   FORMAT QUARTER RANGE
============================================================ */

function formatQuarterRange(
    startQuarter: number | null,
    endQuarter: number | null
) {
    if (!startQuarter) {
        return "";
    }

    const start = `${startQuarter}Qtr`;

    if (
        !endQuarter ||
        startQuarter === endQuarter
    ) {
        return start;
    }

    return `${start}-${endQuarter}Qtr`;
}


/* ============================================================
   GROUP ITEMS BY TAX DECLARATION NUMBER
============================================================ */

function groupItemsByTD(items: any[]) {
    const groups = new Map<string, any[]>();

    items.forEach((item, index) => {
        const tdNumber = String(
            item?.td_number ?? ""
        ).trim();

        const key = tdNumber
            ? tdNumber
            : `NO_TD_${item?.id ?? index}`;

        if (!groups.has(key)) {
            groups.set(key, []);
        }

        groups.get(key)!.push(item);
    });

    return Array.from(groups.entries()).map(
        ([key, groupItems]) => {
            const firstItem = groupItems[0];

            const periodRange =
                getPeriodRange(groupItems);

            const payable =
                groupItems.reduce(
                    (sum, item) =>
                        sum +
                        Number(item?.basic ?? 0) +
                        Number(item?.sef ?? 0),
                    0
                );

            const penalty =
                groupItems.reduce(
                    (sum, item) =>
                        sum +
                        Number(item?.penalty ?? 0),
                    0
                );

            const total =
                groupItems.reduce(
                    (sum, item) => {
                        const amount = Number(
                            item?.amount
                        );

                        if (
                            Number.isFinite(amount)
                        ) {
                            return sum + amount;
                        }

                        return (
                            sum +
                            Number(item?.basic ?? 0) +
                            Number(item?.sef ?? 0) +
                            Number(item?.penalty ?? 0) -
                            Number(item?.discount ?? 0)
                        );
                    },
                    0
                );

            return {
                id:
                    firstItem?.id ??
                    key,

                declared_owner:
                    firstItem?.declared_owner ??
                    "",

                property_location:
                    firstItem?.property_location ??
                    "",

                td_number:
                    firstItem?.td_number ??
                    "",

                assessed_value:
                    firstItem?.assessed_value ??
                    0,

                start_year:
                    periodRange.startYear,

                start_quarter:
                    periodRange.startQuarter,

                end_year:
                    periodRange.endYear,

                end_quarter:
                    periodRange.endQuarter,

                payable,
                penalty,
                total,
            };
        }
    );
}


/* ============================================================
   AF56 PRINT BODY
============================================================ */

export default function AF56PrintBody({
    transaction,
    items = [],
}: Props) {

    const groupedItems =
        groupItemsByTD(items);


    /* ========================================================
       SUMMARY TOTALS
    ======================================================== */

    const totalPayable =
        groupedItems.reduce(
            (sum, item) =>
                sum +
                Number(item?.payable ?? 0),
            0
        );

    const totalPenalty =
        groupedItems.reduce(
            (sum, item) =>
                sum +
                Number(item?.penalty ?? 0),
            0
        );

    const grandTotal =
        groupedItems.reduce(
            (sum, item) =>
                sum +
                Number(item?.total ?? 0),
            0
        );


    let previousOwner = "";

    return (
        <div
            className="af56-body"
            style={{

                /*
                 * ======================================================
                 * TABLE / ROW SETTINGS
                 * ======================================================
                 */

                "--af56-body-start-y":
                    "150px",

                "--af56-body-row-height":
                    "30px",

                "--af56-body-row-gap":
                    "2px",


                /*
                 * ======================================================
                 * DECLARED OWNER
                 * ======================================================
                 */

                "--af56-body-owner-x":
                    "105px",

                "--af56-body-owner-y":
                    "90px",

                "--af56-body-owner-width":
                    "120px",

                "--af56-body-owner-font-size":
                    "12px",

                "--af56-body-owner-line-height":
                    "14px",


                /*
                 * ======================================================
                 * BARANGAY / PROPERTY LOCATION
                 * ======================================================
                 */

                "--af56-body-barangay-x":
                    "235px",

                "--af56-body-barangay-y":
                    "90px",

                "--af56-body-barangay-width":
                    "110px",

                "--af56-body-barangay-font-size":
                    "14px",


                /*
                 * ======================================================
                 * TAX DECLARATION NUMBER
                 * ======================================================
                 */

                "--af56-body-tax-declaration-x":
                    "345px",

                "--af56-body-tax-declaration-y":
                    "90px",

                "--af56-body-tax-declaration-width":
                    "120px",

                "--af56-body-tax-declaration-font-size":
                    "14px",


                /*
                 * ======================================================
                 * ASSESSED VALUE
                 * ======================================================
                 */

                "--af56-body-assessed-value-x":
                    "585px",

                "--af56-body-assessed-value-y":
                    "90px",

                "--af56-body-assessed-value-width":
                    "105px",

                "--af56-body-assessed-value-font-size":
                    "12px",


                /*
                 * ======================================================
                 * YEAR PAID
                 * ======================================================
                 */

                "--af56-body-year-paid-x":
                    "655px",

                "--af56-body-year-paid-y":
                    "90px",

                "--af56-body-year-paid-width":
                    "70px",

                "--af56-body-year-paid-font-size":
                    "12px",


                /*
                 * ======================================================
                 * QUARTER
                 * ======================================================
                 */

                "--af56-body-quarter-x":
                    "720px",

                "--af56-body-quarter-y":
                    "90px",

                "--af56-body-quarter-width":
                    "65px",

                "--af56-body-quarter-font-size":
                    "12px",


                /*
                 * ======================================================
                 * PAYABLE
                 * ======================================================
                 */

                "--af56-body-payable-x":
                    "785px",

                "--af56-body-payable-y":
                    "90px",

                "--af56-body-payable-width":
                    "80px",

                "--af56-body-payable-font-size":
                    "12px",


                /*
                 * ======================================================
                 * PENALTY
                 * ======================================================
                 */

                "--af56-body-penalty-x":
                    "885px",

                "--af56-body-penalty-y":
                    "90px",

                "--af56-body-penalty-width":
                    "70px",

                "--af56-body-penalty-font-size":
                    "12px",


                /*
                 * ======================================================
                 * TOTAL
                 * ======================================================
                 */

                "--af56-body-total-x":
                    "950px",

                "--af56-body-total-y":
                    "90px",

                "--af56-body-total-width":
                    "80px",

                "--af56-body-total-font-size":
                    "12px",


                /*
                 * ======================================================
                 * SUMMARY PAYABLE
                 * ======================================================
                 */

                "--af56-summary-payable-x":
                    "745px",

                "--af56-summary-payable-y":
                    "370px",

                "--af56-summary-payable-width":
                    "80px",

                "--af56-summary-payable-font-size":
                    "12px",


                /*
                 * ======================================================
                 * SUMMARY PENALTY
                 * ======================================================
                 */

                "--af56-summary-penalty-x":
                    "855px",

                "--af56-summary-penalty-y":
                    "370px",

                "--af56-summary-penalty-width":
                    "70px",

                "--af56-summary-penalty-font-size":
                    "12px",


                /*
                 * ======================================================
                 * SUMMARY TOTAL
                 * ======================================================
                 */

                "--af56-summary-total-x":
                    "920px",

                "--af56-summary-total-y":
                    "370px",

                "--af56-summary-total-width":
                    "80px",

                "--af56-summary-total-font-size":
                    "12px",


                /*
                 * ======================================================
                 * ELINO P. MONDRAGON
                 * ======================================================
                 */

                "--af56-elino-x":
                    "810px",

                "--af56-elino-y":
                    "390px",

                "--af56-elino-width":
                    "220px",

                "--af56-elino-font-size":
                    "12px",


                /*
                 * ======================================================
                 * IMLYN B. PARAPINA
                 * ======================================================
                 */

                "--af56-imlyn-x":
                    "810px",

                "--af56-imlyn-y":
                    "430px",

                "--af56-imlyn-width":
                    "220px",

                "--af56-imlyn-font-size":
                    "12px",

            } as React.CSSProperties}
        >

            {/* =====================================================
                BODY ROWS
            ===================================================== */}

            {groupedItems.map((item, index) => {

                const actualOwner = String(
                    item?.declared_owner ??
                    transaction?.payor ??
                    ""
                ).trim();

                const owner =
                    actualOwner === previousOwner
                        ? ""
                        : actualOwner;

                previousOwner = actualOwner;


                const barangay = String(
                    item?.property_location ?? ""
                );

                const taxDeclaration = String(
                    item?.td_number ?? ""
                );

                const assessedValue =
                    formatAmount(
                        item?.assessed_value
                    );

                const yearPaid =
                    formatYearRange(
                        item?.start_year,
                        item?.end_year
                    );

                const quarter =
                    formatQuarterRange(
                        item?.start_quarter,
                        item?.end_quarter
                    );


                return (
                    <div
                        key={
                            item?.id ??
                            index
                        }
                        className="af56-body-row"
                        style={{
                            top: `
                                calc(
                                    var(--af56-body-start-y)
                                    +
                                    (
                                        ${index}
                                        *
                                        (
                                            var(--af56-body-row-height)
                                            +
                                            var(--af56-body-row-gap)
                                        )
                                    )
                                )
                            `,

                            height:
                                "var(--af56-body-row-height)",
                        }}
                    >

                        {/* DECLARED OWNER */}

                        <span
                            className="
                                af56-body-field
                                af56-body-owner
                            "
                            style={{
                                left:
                                    "var(--af56-body-owner-x)",

                                top:
                                    "var(--af56-body-owner-y)",

                                width:
                                    "var(--af56-body-owner-width)",

                                fontSize:
                                    "var(--af56-body-owner-font-size)",

                                lineHeight:
                                    "var(--af56-body-owner-line-height)",

                                /*
                                * Allow automatic wrapping based on width.
                                */
                                whiteSpace: "normal",

                                /*
                                * Maximum of 2 lines.
                                */
                                height: "calc(var(--af56-body-owner-line-height) * 2)",

                                overflow: "hidden",

                                overflowWrap: "normal",

                                wordBreak: "normal",
                            }}
                        >
                            {owner}
                        </span>


                        {/* PROPERTY LOCATION */}

                        <span
                            className="
                                af56-body-field
                                af56-body-barangay
                            "
                            style={{
                                left:
                                    "var(--af56-body-barangay-x)",

                                top:
                                    "var(--af56-body-barangay-y)",

                                width:
                                    "var(--af56-body-barangay-width)",

                                fontSize:
                                    "var(--af56-body-barangay-font-size)",
                            }}
                        >
                            {barangay}
                        </span>


                        {/* TAX DECLARATION */}

                        <span
                            className="
                                af56-body-field
                                af56-body-tax-declaration
                            "
                            style={{
                                left:
                                    "var(--af56-body-tax-declaration-x)",

                                top:
                                    "var(--af56-body-tax-declaration-y)",

                                width:
                                    "var(--af56-body-tax-declaration-width)",

                                fontSize:
                                    "var(--af56-body-tax-declaration-font-size)",
                            }}
                        >
                            {taxDeclaration}
                        </span>


                        {/* ASSESSED VALUE */}

                        <span
                            className="
                                af56-body-field
                                af56-body-assessed-value
                            "
                            style={{
                                left:
                                    "var(--af56-body-assessed-value-x)",

                                top:
                                    "var(--af56-body-assessed-value-y)",

                                width:
                                    "var(--af56-body-assessed-value-width)",

                                fontSize:
                                    "var(--af56-body-assessed-value-font-size)",
                            }}
                        >
                            {assessedValue}
                        </span>


                        {/* YEAR PAID */}

                        <span
                            className="
                                af56-body-field
                                af56-body-year-paid
                            "
                            style={{
                                left:
                                    "var(--af56-body-year-paid-x)",

                                top:
                                    "var(--af56-body-year-paid-y)",

                                width:
                                    "var(--af56-body-year-paid-width)",

                                fontSize:
                                    "var(--af56-body-year-paid-font-size)",
                            }}
                        >
                            {yearPaid}
                        </span>


                        {/* QUARTER */}

                        <span
                            className="
                                af56-body-field
                                af56-body-quarter
                            "
                            style={{
                                left:
                                    "var(--af56-body-quarter-x)",

                                top:
                                    "var(--af56-body-quarter-y)",

                                width:
                                    "var(--af56-body-quarter-width)",

                                fontSize:
                                    "var(--af56-body-quarter-font-size)",
                            }}
                        >
                            {quarter}
                        </span>


                        {/* PAYABLE */}

                        <span
                            className="
                                af56-body-field
                                af56-body-payable
                            "
                            style={{
                                left:
                                    "var(--af56-body-payable-x)",

                                top:
                                    "var(--af56-body-payable-y)",

                                width:
                                    "var(--af56-body-payable-width)",

                                fontSize:
                                    "var(--af56-body-payable-font-size)",
                            }}
                        >
                            {formatAmount(
                                item?.payable
                            )}
                        </span>


                        {/* PENALTY */}

                        <span
                            className="
                                af56-body-field
                                af56-body-penalty
                            "
                            style={{
                                left:
                                    "var(--af56-body-penalty-x)",

                                top:
                                    "var(--af56-body-penalty-y)",

                                width:
                                    "var(--af56-body-penalty-width)",

                                fontSize:
                                    "var(--af56-body-penalty-font-size)",
                            }}
                        >
                            {formatAmount(
                                item?.penalty
                            )}
                        </span>


                        {/* TOTAL */}

                        <span
                            className="
                                af56-body-field
                                af56-body-total
                            "
                            style={{
                                left:
                                    "var(--af56-body-total-x)",

                                top:
                                    "var(--af56-body-total-y)",

                                width:
                                    "var(--af56-body-total-width)",

                                fontSize:
                                    "var(--af56-body-total-font-size)",
                            }}
                        >
                            {formatAmount(
                                item?.total
                            )}
                        </span>

                    </div>
                );
            })}


            {/* =====================================================
                SUMMARY PAYABLE
            ===================================================== */}

            <span
                className="
                    af56-body-field
                    af56-summary-payable
                "
                style={{
                    left:
                        "var(--af56-summary-payable-x)",

                    top:
                        "var(--af56-summary-payable-y)",

                    width:
                        "var(--af56-summary-payable-width)",

                    fontSize:
                        "var(--af56-summary-payable-font-size)",

                    textAlign: "right",
                    fontWeight: 700,
                }}
            >
                {formatAmount(totalPayable)}
            </span>


            {/* =====================================================
                SUMMARY PENALTY
            ===================================================== */}

            <span
                className="
                    af56-body-field
                    af56-summary-penalty
                "
                style={{
                    left:
                        "var(--af56-summary-penalty-x)",

                    top:
                        "var(--af56-summary-penalty-y)",

                    width:
                        "var(--af56-summary-penalty-width)",

                    fontSize:
                        "var(--af56-summary-penalty-font-size)",

                    textAlign: "right",
                    fontWeight: 700,
                }}
            >
                {formatAmount(totalPenalty)}
            </span>


            {/* =====================================================
                GRAND TOTAL
            ===================================================== */}

            <span
                className="
                    af56-body-field
                    af56-summary-total
                "
                style={{
                    left:
                        "var(--af56-summary-total-x)",

                    top:
                        "var(--af56-summary-total-y)",

                    width:
                        "var(--af56-summary-total-width)",

                    fontSize:
                        "var(--af56-summary-total-font-size)",

                    textAlign: "right",
                    fontWeight: 700,
                }}
            >
                {formatAmount(grandTotal)}
            </span>


            {/* =====================================================
                HARD CODED NAME
                ELINO P. MONDRAGON
            ===================================================== */}

            <span
                className="af56-body-field"
                style={{
                    left:
                        "var(--af56-elino-x)",

                    top:
                        "var(--af56-elino-y)",

                    width:
                        "var(--af56-elino-width)",

                    fontSize:
                        "var(--af56-elino-font-size)",

                    textAlign: "center",

                    fontWeight: 700,
                }}
            >
                ELINO P. MONDRAGON
            </span>


            {/* =====================================================
                HARD CODED NAME
                IMLYN B. PARAPINA
            ===================================================== */}

            <span
                className="af56-body-field"
                style={{
                    left:
                        "var(--af56-imlyn-x)",

                    top:
                        "var(--af56-imlyn-y)",

                    width:
                        "var(--af56-imlyn-width)",

                    fontSize:
                        "var(--af56-imlyn-font-size)",

                    textAlign: "center",

                    fontWeight: 700,
                }}
            >
                IMLYN B. PARAPINA
            </span>

        </div>
    );
}