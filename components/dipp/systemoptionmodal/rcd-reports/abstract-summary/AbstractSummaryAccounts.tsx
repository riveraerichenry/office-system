"use client";

type Props = {
    items?: any[];
    formatAmount: (value: any) => string;
    showGrandTotal?: boolean;
    grandTotalOverride?: number;
};

/* ============================================================
   DATE — FROM receipt_date ONLY
   TIMEZONE SAFE FOR YYYY-MM-DD / ISO VALUES
============================================================ */

function formatDate(value: any): string {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "—";
    }

    const rawValue = String(value).trim();

    // Extract the calendar date directly, avoiding timezone shifts.
    const match = rawValue.match(
        /^(\d{4})-(\d{2})-(\d{2})(?:$|T|\s)/
    );

    if (match) {
        const [, year, month, day] = match;
        const yearNumber = Number(year);
        const monthNumber = Number(month);
        const dayNumber = Number(day);

        const checkDate = new Date(
            yearNumber,
            monthNumber - 1,
            dayNumber
        );

        if (
            checkDate.getFullYear() !== yearNumber ||
            checkDate.getMonth() !== monthNumber - 1 ||
            checkDate.getDate() !== dayNumber
        ) {
            return "—";
        }

        return `${month}/${day}/${year}`;
    }

    // Fallback for other formats, if the API returns one.
    const parsedDate = new Date(rawValue);

    if (Number.isNaN(parsedDate.getTime())) {
        return rawValue;
    }

    return parsedDate.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
        timeZone: "Asia/Manila",
    });
}

/* ============================================================
   TEXT HELPERS
============================================================ */

function getORNumber(item: any): string {
    return (
        item?.or_number ??
        item?.or_no ??
        item?.receipt_number ??
        item?.official_receipt_no ??
        item?.receipt_no ??
        "—"
    );
}

function getPayor(item: any): string {
    return (
        item?.payor ??
        item?.payor_name ??
        item?.payer_name ??
        item?.owner_name ??
        "—"
    );
}

function getAccountCode(item: any): string {
    return (
        item?.account_code ??
        item?.code ??
        "—"
    );
}

function getParticulars(item: any): string {
    return (
        item?.particulars ??
        item?.account_name ??
        item?.description ??
        item?.item_name ??
        "—"
    );
}

function getRemarks(item: any): string {
    return (
        item?.remarks ??
        item?.remark ??
        item?.barangay_name ??
        item?.barangay ??
        "—"
    );
}

/* ============================================================
   DISPLAY-ONLY CANCELLATION
============================================================ */

function isCancelled(item: any): boolean {
    const status = String(
        item?.transaction_status ??
        item?.status ??
        ""
    )
        .trim()
        .toUpperCase();

    return (
        status === "CANCELLED" ||
        status === "CANCELED" ||
        item?.is_cancelled === true ||
        String(item?.is_cancelled).toLowerCase() === "true"
    );
}

/* ============================================================
   AMOUNT
============================================================ */

function getAmount(item: any): number {
    // Keep cancelled rows visible, but display zero amount.
    if (isCancelled(item)) {
        return 0;
    }

    const amount = Number(
        item?.amount ??
        item?.total ??
        item?.value ??
        0
    );

    return Number.isFinite(amount) ? amount : 0;
}

/* ============================================================
   COMPONENT
============================================================ */

export default function AbstractSummaryAccounts({
    items = [],
    formatAmount,
    showGrandTotal = true,
    grandTotalOverride,
}: Props) {
    const rows: any[] = Array.isArray(items)
        ? items
        : [];

    /*
     * Preserve the parent's Grand Total when supplied.
     * This keeps the existing RPT calculation intact.
     */
    const calculatedGrandTotal = rows.reduce(
        (total: number, item: any) => {
            return total + getAmount(item);
        },
        0
    );

    const grandTotal =
        typeof grandTotalOverride === "number" &&
        Number.isFinite(grandTotalOverride)
            ? grandTotalOverride
            : calculatedGrandTotal;

    return (
        <div className="abstract-summary-section">
            <table className="abstract-summary-table">
                {/* HEADER */}
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>O.R. No</th>
                        <th>PAYOR</th>
                        <th>
                            ACCT
                            <br />
                            CODE
                        </th>
                        <th>PARTICULARS</th>
                        <th>REMARKS</th>
                        <th>Amount</th>
                    </tr>
                </thead>

                {/* BODY */}
                <tbody>
                    {rows.length === 0 ? (
                        <tr>
                            <td
                                colSpan={7}
                                className="abstract-summary-empty"
                            >
                                No collection records found.
                            </td>
                        </tr>
                    ) : (
                        rows.map((item: any, index: number) => (
                            <tr
                                key={
                                    item?.id ??
                                    item?.item_id ??
                                    `${getORNumber(item)}-${getAccountCode(item)}-${index}`
                                }
                            >
                                {/* DATE — FROM API receipt_date */}
                                <td className="abstract-summary-date">
                                    {formatDate(item?.receipt_date)}
                                </td>

                                {/* O.R. NUMBER */}
                                <td className="abstract-summary-or">
                                    {getORNumber(item)}
                                </td>

                                {/* PAYOR */}
                                <td className="abstract-summary-payor">
                                    <span>{getPayor(item)}</span>

                                    {isCancelled(item) && (
                                        <span
                                            style={{
                                                color: "#dc2626",
                                                fontWeight: 700,
                                                marginLeft: "5px",
                                            }}
                                        >
                                            (CANCELLED)
                                        </span>
                                    )}
                                </td>

                                {/* ACCOUNT CODE */}
                                <td className="abstract-summary-account-code">
                                    {getAccountCode(item)}
                                </td>

                                {/* PARTICULARS */}
                                <td className="abstract-summary-particulars">
                                    {getParticulars(item)}
                                </td>

                                {/* REMARKS */}
                                <td className="abstract-summary-remarks">
                                    {getRemarks(item)}
                                </td>

                                {/* AMOUNT */}
                                <td className="abstract-summary-amount">
                                    {formatAmount(getAmount(item))}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>

                {/* GRAND TOTAL */}
                {showGrandTotal && (
                    <tfoot>
                        <tr>
                            <td
                                colSpan={6}
                                className="abstract-summary-total-label"
                            >
                                Grand Total:
                            </td>

                            <td className="abstract-summary-total">
                                {formatAmount(grandTotal)}
                            </td>
                        </tr>
                    </tfoot>
                )}
            </table>
        </div>
    );
}
