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

/* Display penalties as positive (+) and discounts as negative (-). */
function formatSignedAmount(value: any) {
    const amount = Number(value ?? 0);
    const formatted = Math.abs(amount).toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    if (amount > 0) return `+${formatted}`;
    if (amount < 0) return `-${formatted}`;
    return formatted;
}


/* ============================================================
   GROUP TRANSACTION ITEMS BY TRANSACTION, TD, AND TAX PERIOD

   For present year 2026:
   - Advance: each year after 2026 is displayed separately.
   - Current: 2026 is displayed separately.
   - Previous year: 2025 is displayed separately.
   - Older previous years: 2024 and earlier are combined
     into one row per transaction + TD.

   Different TD numbers are never combined.
============================================================ */

function getYearFromItem(item: any) {
    const year = Number(item?.start_year);
    return Number.isInteger(year) ? year : null;
}

function getItemEndYear(item: any) {
    const year = Number(item?.end_year ?? item?.start_year);
    return Number.isInteger(year) ? year : null;
}

function formatQuarterCoverage(items: any[]) {
    const quarters = new Set<number>();

    items.forEach((item) => {
        const startQuarter = Number(item?.start_quarter);
        const endQuarter = Number(
            item?.end_quarter ?? item?.start_quarter
        );

        if (
            Number.isInteger(startQuarter) &&
            startQuarter >= 1 &&
            startQuarter <= 4
        ) {
            quarters.add(startQuarter);
        }

        if (
            Number.isInteger(endQuarter) &&
            endQuarter >= 1 &&
            endQuarter <= 4
        ) {
            quarters.add(endQuarter);
        }
    });

    const sorted = Array.from(quarters).sort((a, b) => a - b);

    if (sorted.length === 0) return "";

    const first = sorted[0];
    const last = sorted[sorted.length - 1];

    const ordinal = (quarter: number) =>
        `${quarter}${quarter === 1 ? "st" : quarter === 2 ? "nd" : quarter === 3 ? "rd" : "th"} Qtr`;

    return first === last
        ? ordinal(first)
        : `${ordinal(first)} - ${ordinal(last)}`;
}

function formatYearCoverage(items: any[]) {
    const years = new Set<number>();

    items.forEach((item) => {
        const startYear = getYearFromItem(item);
        const endYear = getItemEndYear(item);

        if (startYear === null) return;

        const finalYear = endYear ?? startYear;

        for (let year = startYear; year <= finalYear; year++) {
            years.add(year);
        }
    });

    const sortedYears = Array.from(years).sort((a, b) => a - b);

    if (sortedYears.length === 0) return "";

    const ranges: string[] = [];
    let rangeStart = sortedYears[0];
    let rangeEnd = sortedYears[0];

    for (let index = 1; index < sortedYears.length; index++) {
        const year = sortedYears[index];

        if (year === rangeEnd + 1) {
            rangeEnd = year;
            continue;
        }

        ranges.push(
            rangeStart === rangeEnd
                ? String(rangeStart)
                : `${rangeStart}-${rangeEnd}`
        );

        rangeStart = year;
        rangeEnd = year;
    }

    ranges.push(
        rangeStart === rangeEnd
            ? String(rangeStart)
            : `${rangeStart}-${rangeEnd}`
    );

    return ranges.join(", ");
}

function getItemTotal(item: any) {
    const amountValue = item?.amount;

    if (
        amountValue !== null &&
        amountValue !== undefined &&
        String(amountValue).trim() !== "" &&
        Number.isFinite(Number(amountValue))
    ) {
        return Number(amountValue);
    }

    return (
        Number(item?.basic ?? 0) +
        Number(item?.sef ?? 0) +
        Number(item?.penalty ?? 0) -
        Number(item?.discount ?? 0)
    );
}

function summarizeItems(
    groupItems: any[],
    groupKey: string,
    suffix: string
) {
    const firstItem = groupItems[0];

    const payable = groupItems.reduce(
        (sum, item) =>
            sum +
            Number(item?.basic ?? 0) +
            Number(item?.sef ?? 0),
        0
    );

    const penalty = groupItems.reduce(
        (sum, item) => sum + Number(item?.penalty ?? 0),
        0
    );

    const discount = groupItems.reduce(
        (sum, item) => sum + Number(item?.discount ?? 0),
        0
    );

    // One shared column: penalty is positive, discount is negative.
    const adjustment = penalty - discount;

    const total = groupItems.reduce(
        (sum, item) => sum + getItemTotal(item),
        0
    );

    return {
        id: `${groupKey}-${suffix}`,
        transaction_id:
            firstItem?.transaction_id ??
            firstItem?.rpt_transaction_id ??
            "",
        declared_owner: firstItem?.declared_owner ?? "",
        classification_name:
            groupItems.find(
                (entry) =>
                    String(entry?.classification_name ?? "").trim() !== ""
            )?.classification_name ?? "",
        property_location: firstItem?.property_location ?? "",
        td_number: firstItem?.td_number ?? "",
        assessed_value: firstItem?.assessed_value ?? 0,
        years: formatYearCoverage(groupItems),
        quarters: formatQuarterCoverage(groupItems),
        payable,
        penalty,
        discount,
        adjustment,
        total,
    };
}

function groupItemsByTD(items: any[]) {
    // Use the current calendar year as the classification reference.
    const presentYear = new Date().getFullYear();

    const tdGroups = new Map<string, any[]>();

    items.forEach((item, index) => {
        const tdNumber = String(item?.td_number ?? "").trim();

        const transactionId = String(
            item?.transaction_id ??
            item?.rpt_transaction_id ??
            item?.transactionId ??
            ""
        ).trim();

        // Do not combine different TDs or different transactions.
        const key = [
            transactionId || "CURRENT_TRANSACTION",
            tdNumber || `NO_TD_${item?.id ?? index}`,
        ].join("::");

        if (!tdGroups.has(key)) {
            tdGroups.set(key, []);
        }

        tdGroups.get(key)!.push(item);
    });

    const result: any[] = [];

    tdGroups.forEach((tdItems, tdKey) => {
        const futureBuckets = new Map<number, any[]>();
        const currentItems: any[] = [];
        const previousYearItems: any[] = [];
        const olderPreviousItems: any[] = [];

        tdItems.forEach((item) => {
            const startYear = getYearFromItem(item);
            if (startYear === null) return;

            // A single item covering a year range is assigned according
            // to its starting year. Normal annual transaction items
            // are classified individually.
            const classificationYear = startYear;

            if (classificationYear > presentYear) {
                if (!futureBuckets.has(classificationYear)) {
                    futureBuckets.set(classificationYear, []);
                }

                futureBuckets.get(classificationYear)!.push(item);
            } else if (classificationYear === presentYear) {
                currentItems.push(item);
            } else if (classificationYear === presentYear - 1) {
                // Previous year is deliberately kept separate.
                previousYearItems.push(item);
            } else {
                // 2024 and earlier are grouped together for the same TD.
                olderPreviousItems.push(item);
            }
        });

        // Advance years: one separate row per year, newest first.
        Array.from(futureBuckets.entries())
            .sort(([yearA], [yearB]) => yearB - yearA)
            .forEach(([year, yearItems]) => {
                result.push(
                    summarizeItems(
                        yearItems,
                        tdKey,
                        `advance-${year}`
                    )
                );
            });

        // Current year: its own row.
        if (currentItems.length > 0) {
            result.push(
                summarizeItems(
                    currentItems,
                    tdKey,
                    `current-${presentYear}`
                )
            );
        }

        // Previous year: its own row, even if the TD is the same.
        if (previousYearItems.length > 0) {
            result.push(
                summarizeItems(
                    previousYearItems,
                    tdKey,
                    `previous-${presentYear - 1}`
                )
            );
        }

        // Older previous years: one aggregated row for the same TD.
        if (olderPreviousItems.length > 0) {
            result.push(
                summarizeItems(
                    olderPreviousItems,
                    tdKey,
                    "older-previous"
                )
            );
        }
    });

    return result;
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

    const totalDiscount =
        groupedItems.reduce(
            (sum, item) =>
                sum +
                Number(item?.discount ?? 0),
            0
        );

    const totalAdjustment = totalPenalty - totalDiscount;

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
                    "155px",

                "--af56-body-owner-y":
                    "90px",

                "--af56-body-owner-width":
                    "130px",

                "--af56-body-owner-font-size":
                    "14px",

                "--af56-body-owner-line-height":
                    "20px",


                /*
                 * ======================================================
                 * BARANGAY / PROPERTY LOCATION
                 * ======================================================
                 */

                "--af56-body-barangay-x":
                    "295px",

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
                    "430px",

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
                    "645px",

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
                    "710px",

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
                    "785px",

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
                    "860px",

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
                    "925px",

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
                    "980px",

                "--af56-body-total-y":
                    "90px",

                "--af56-body-total-width":
                    "80px",

                "--af56-body-total-font-size":
                    "13px",


                /*
                 * ======================================================
                 * SUMMARY PAYABLE
                 * ======================================================
                 */

                "--af56-summary-payable-x":
                    "810px",

                "--af56-summary-payable-y":
                    "370px",

                "--af56-summary-payable-width":
                    "80px",

                "--af56-summary-payable-font-size":
                    "14px",


                /*
                 * ======================================================
                 * SUMMARY PENALTY
                 * ======================================================
                 */

                "--af56-summary-penalty-x":
                    "895px",

                "--af56-summary-penalty-y":
                    "370px",

                "--af56-summary-penalty-width":
                    "70px",

                "--af56-summary-penalty-font-size":
                    "14px",


                /*
                 * ======================================================
                 * SUMMARY TOTAL
                 * ======================================================
                 */


                "--af56-summary-total-x":
                    "950px",

                "--af56-summary-total-y":
                    "370px",

                "--af56-summary-total-width":
                    "80px",

                "--af56-summary-total-font-size":
                    "14px",


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

                const yearPaid = String(item?.years ?? "");
                const quarter = String(item?.quarters ?? "");


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
                                    left: "var(--af56-body-owner-x)",
                                    top: "var(--af56-body-owner-y)",

                                    width: "var(--af56-body-owner-width)",
                                    maxWidth: "130px",

                                    fontSize: "var(--af56-body-owner-font-size)",
                                    lineHeight: "var(--af56-body-owner-line-height)",

                                    display: "block",
                                    whiteSpace: "normal",

                                    height: "calc(var(--af56-body-owner-line-height) * 2 + 12px)",

                                    overflow: "hidden",
                                    overflowWrap: "anywhere",
                                    wordBreak: "normal",
                                }}
                            >
                                <span
                                    style={{
                                        display: "block",
                                        width: "100%",
                                        whiteSpace: "normal",
                                        lineHeight: "18px",
                                        overflowWrap: "anywhere",
                                    }}
                                >
                                    {owner}
                                </span>

                                {owner && item?.classification_name ? (
                                    <span
                                        style={{
                                            display: "block",
                                            fontSize: "14px",
                                            lineHeight: "12px",
                                            fontWeight: 600,
                                            marginTop: "20px",
                                        }}
                                    >
                                        {`(${String(item.classification_name)})`}
                                    </span>
                                ) : null}
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

                                whiteSpace: "pre-line",
                                lineHeight: "14px",
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

                                whiteSpace: "pre-line",
                                lineHeight: "14px",
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
                            {formatSignedAmount(item?.adjustment)}
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
                {formatSignedAmount(totalAdjustment)}
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