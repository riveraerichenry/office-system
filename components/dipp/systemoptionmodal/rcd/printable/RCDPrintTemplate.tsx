"use client";

import "./RCDGeneralPrintTemplate.css";

type Props = {
    data: any;
};

const n = (v: any) => Number(v ?? 0);

const money = (v: any) =>
    n(v).toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

const dateOnly = (v: any) => {
    if (!v) return "";

    const value = String(v).slice(0, 10);
    const d = new Date(`${value}T00:00:00`);

    if (Number.isNaN(d.getTime())) return value;

    return d.toLocaleDateString("en-PH", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
    });
};

const first = (...values: any[]) =>
    values.find(
        (v) =>
            v !== undefined &&
            v !== null &&
            v !== ""
    ) ?? "";

const amountWords = (amount: number) => {
    if (!amount) return "Zero Pesos Only";

    return `${money(amount)} Pesos Only`;
};

export default function RCDGeneralPrintTemplate({
    data,
}: Props) {
    const filters = data?.filters ?? {};
    const summary = data?.summary ?? {};
    const collectionSummary =
        data?.summary_of_collections ?? {};

    const forms = Array.isArray(data?.forms)
        ? data.forms
        : [];

    const accountability =
        Array.isArray(data?.accountability)
            ? data.accountability
            : [];

    const collections =
        Array.isArray(data?.collections)
            ? data.collections
            : [];

    const remittances =
        Array.isArray(data?.remittances)
            ? data.remittances
            : [];

    const deposits =
        Array.isArray(data?.deposits)
            ? data.deposits
            : [];

    const accountableOfficer = first(
        data?.user?.full_name,
        data?.accountable_officer,
        data?.user?.name,
        "-"
    );

    const fundSource = first(
        data?.fund_source_name,
        data?.fund_source?.fund_name,
        data?.fund_source?.name,
        data?.fund_source,
        data?.fund_source_id,
        "-"
    );

    const reportNo = first(
        data?.report_no,
        data?.report_number,
        data?.rcd_number,
        data?.rcd_no,
        "-"
    );

    const dateFrom = filters?.date_from;
    const dateTo = filters?.date_to;

    const reportDate =
        dateFrom &&
        dateTo &&
        dateFrom !== dateTo
            ? `${dateOnly(dateFrom)} - ${dateOnly(dateTo)}`
            : dateOnly(dateFrom || dateTo);

    const totalCollections = n(
        first(
            collectionSummary?.total_collections,
            summary?.total_collections,
            collections.reduce(
                (sum: number, item: any) =>
                    sum +
                    n(
                        first(
                            item?.amount,
                            item?.total_amount,
                            item?.collection_total
                        )
                    ),
                0
            )
        )
    );

    const totalRemittances = n(
        first(
            collectionSummary?.total_remittances,
            summary?.total_remittances,
            remittances.reduce(
                (sum: number, item: any) =>
                    sum +
                    n(
                        first(
                            item?.amount,
                            item?.total_amount
                        )
                    ),
                0
            )
        )
    );

    const totalDeposits = n(
        first(
            collectionSummary?.total_deposits,
            summary?.total_deposits,
            deposits.reduce(
                (sum: number, item: any) =>
                    sum +
                    n(
                        first(
                            item?.amount,
                            item?.total_amount
                        )
                    ),
                0
            )
        )
    );

    const balance = n(
        first(
            collectionSummary?.balance,
            summary?.balance,
            totalCollections -
                totalRemittances -
                totalDeposits
        )
    );

    /*
     * The API may provide accountability separately.
     * If it doesn't, use forms as the fallback.
     */
    const accountabilityRows =
        accountability.length > 0
            ? accountability
            : forms;

    /*
     * Collection rows.
     */
    const collectionRows =
        collections.length > 0
            ? collections
            : forms;

    /*
     * Determine first form when the API returns
     * a single accountable-form record.
     */
    const firstForm =
        accountabilityRows[0] ??
        forms[0] ??
        {};

    const formCode = first(
        firstForm?.form_code,
        firstForm?.form_name,
        firstForm?.code,
        "AF56"
    );

    const beginningFrom = first(
        firstForm?.beginning_from,
        firstForm?.beginning_or,
        firstForm?.beginning_serial,
        firstForm?.beginning_series,
        ""
    );

    const beginningTo = first(
        firstForm?.beginning_to,
        firstForm?.ending_or,
        firstForm?.ending_serial,
        ""
    );

    const receiptFrom = first(
        firstForm?.receipt_from,
        firstForm?.receipt_beginning,
        firstForm?.or_from,
        firstForm?.beginning_receipt,
        ""
    );

    const receiptTo = first(
        firstForm?.receipt_to,
        firstForm?.receipt_ending,
        firstForm?.or_to,
        firstForm?.ending_receipt,
        ""
    );

    const issuedFrom = first(
        firstForm?.issued_from,
        firstForm?.issued_beginning,
        ""
    );

    const issuedTo = first(
        firstForm?.issued_to,
        firstForm?.issued_ending,
        ""
    );

    const endingFrom = first(
        firstForm?.ending_from,
        firstForm?.ending_balance_from,
        ""
    );

    const endingTo = first(
        firstForm?.ending_to,
        firstForm?.ending_balance_to,
        ""
    );

    const formQty = n(
        first(
            firstForm?.quantity,
            firstForm?.qty,
            firstForm?.receipt_count,
            firstForm?.booklet_quantity
        )
    );

    const issuedQty = n(
        first(
            firstForm?.issued_qty,
            firstForm?.issued_count
        )
    );

    const receiptQty = n(
        first(
            firstForm?.receipt_qty,
            firstForm?.receipt_count
        )
    );

    return (
        <div className="rcd-print-root">

            <div className="rcd-paper">

                {/* =====================================================
                    HEADER
                ===================================================== */}

                <div className="rcd-header">

                    <div className="header-line-1">
                        Republic of the Philippines
                    </div>

                    <div className="header-line-2">
                        Province of Palawan
                    </div>

                    <div className="header-line-3">
                        MUNICIPALITY OF TAYTAY
                    </div>

                    <div className="header-line-4">
                        OFFICE OF THE MUNICIPAL TREASURER
                    </div>

                    <div className="header-rule" />

                    <div className="report-title">
                        REPORT OF COLLECTIONS AND DEPOSITS
                    </div>

                </div>

                {/* =====================================================
                    REPORT INFORMATION
                ===================================================== */}

                <div className="report-info">

                    <div className="info-left">

                        <div className="info-row">
                            <span className="info-label">
                                Fund Type:
                            </span>

                            <span className="info-value">
                                {fundSource}
                            </span>
                        </div>

                        <div className="info-row">
                            <span className="info-label">
                                Accountable Officer:
                            </span>

                            <span className="info-value">
                                {accountableOfficer}
                            </span>
                        </div>

                    </div>

                    <div className="info-right">

                        <div className="info-row">
                            <span className="info-label">
                                Date:
                            </span>

                            <span className="info-value">
                                {reportDate}
                            </span>
                        </div>

                        <div className="info-row">
                            <span className="info-label">
                                Report No:
                            </span>

                            <span className="info-value">
                                {reportNo}
                            </span>
                        </div>

                    </div>

                </div>

                {/* =====================================================
                    A. COLLECTIONS
                ===================================================== */}

                <div className="section-a">

                    <div className="section-title">
                        A. COLLECTIONS ( 1. For Collectors )
                    </div>

                    <table className="collections-table">

                        <colgroup>
                            <col className="col-form" />
                            <col className="col-from" />
                            <col className="col-to" />
                            <col className="col-amount" />
                        </colgroup>

                        <thead>

                            <tr>

                                <th rowSpan={2}>
                                    Type ( Form No )
                                </th>

                                <th colSpan={2}>
                                    Official Receipts / Serial No
                                </th>

                                <th rowSpan={2}>
                                    Amount
                                </th>

                            </tr>

                            <tr>

                                <th>
                                    From
                                </th>

                                <th>
                                    To
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {collectionRows.length === 0 ? (

                                <tr className="empty-row">
                                    <td colSpan={4}>
                                        &nbsp;
                                    </td>
                                </tr>

                            ) : (

                                collectionRows.map(
                                    (
                                        item: any,
                                        index: number
                                    ) => {

                                        const amount = n(
                                            first(
                                                item?.amount,
                                                item?.total_amount,
                                                item?.collection_total
                                            )
                                        );

                                        return (
                                            <tr
                                                key={
                                                    item?.id ??
                                                    index
                                                }
                                            >

                                                <td className="center bold">
                                                    {first(
                                                        item?.form_code,
                                                        item?.form_name,
                                                        item?.form,
                                                        formCode
                                                    )}
                                                </td>

                                                <td className="center bold">
                                                    {first(
                                                        item?.or_from,
                                                        item?.receipt_from,
                                                        item?.beginning_or,
                                                        item?.serial_from,
                                                        receiptFrom
                                                    )}
                                                </td>

                                                <td className="center bold">
                                                    {first(
                                                        item?.or_to,
                                                        item?.receipt_to,
                                                        item?.ending_or,
                                                        item?.serial_to,
                                                        receiptTo
                                                    )}
                                                </td>

                                                <td className="right bold">
                                                    {money(amount)}
                                                </td>

                                            </tr>
                                        );
                                    }
                                )

                            )}

                        </tbody>

                        <tfoot>

                            <tr>

                                <td
                                    colSpan={3}
                                    className="total-label"
                                >
                                    TOTAL
                                </td>

                                <td className="right bold">
                                    {money(
                                        totalCollections
                                    )}
                                </td>

                            </tr>

                        </tfoot>

                    </table>

                    {/* -----------------------------------------------
                        2. LIQUIDATION OFFICERS
                    ----------------------------------------------- */}

                    <div className="liquidation-title">
                        2. For Liquidation Officers / Treasurers
                    </div>

                    <table className="liquidation-table">

                        <colgroup>
                            <col className="liq-name" />
                            <col className="liq-report" />
                            <col className="liq-amount" />
                        </colgroup>

                        <thead>

                            <tr>

                                <th>
                                    Name of Accountable Officer
                                </th>

                                <th>
                                    Report No
                                </th>

                                <th>
                                    Amount
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            <tr>

                                <td className="bold">
                                    {accountableOfficer}
                                </td>

                                <td className="center bold">
                                    {reportNo}
                                </td>

                                <td className="right bold">
                                    {money(
                                        totalCollections
                                    )}
                                </td>

                            </tr>

                        </tbody>

                        <tfoot>

                            <tr>

                                <td
                                    colSpan={2}
                                    className="total-label"
                                >
                                    TOTAL
                                </td>

                                <td className="right bold">
                                    {money(
                                        totalCollections
                                    )}
                                </td>

                            </tr>

                        </tfoot>

                    </table>

                </div>

                {/* =====================================================
                    B. REMITTANCES / DEPOSITS
                ===================================================== */}

                <div className="section-b">

                    <div className="section-title">
                        B. REMITTANCES / DEPOSITS
                    </div>

                    <table className="remittance-table">

                        <colgroup>
                            <col className="rem-name" />
                            <col className="rem-reference" />
                            <col className="rem-amount" />
                        </colgroup>

                        <thead>

                            <tr>

                                <th>
                                    Accountable Officer / Bank
                                </th>

                                <th>
                                    Reference
                                </th>

                                <th>
                                    Amount
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {remittances.length === 0 &&
                            deposits.length === 0 ? (

                                <tr>

                                    <td>
                                        &nbsp;
                                    </td>

                                    <td className="center italic">
                                        Please See Attached Deposit
                                    </td>

                                    <td className="right">
                                        &nbsp;
                                    </td>

                                </tr>

                            ) : (

                                [
                                    ...remittances,
                                    ...deposits,
                                ].map(
                                    (
                                        item: any,
                                        index: number
                                    ) => (

                                        <tr
                                            key={
                                                item?.id ??
                                                index
                                            }
                                        >

                                            <td>
                                                {first(
                                                    item?.accountable_officer,
                                                    item?.officer,
                                                    item?.bank,
                                                    accountableOfficer
                                                )}
                                            </td>

                                            <td>
                                                {first(
                                                    item?.reference,
                                                    item?.reference_no,
                                                    item?.reference_number,
                                                    item?.remarks,
                                                    "-"
                                                )}
                                            </td>

                                            <td className="right">
                                                {money(
                                                    first(
                                                        item?.amount,
                                                        item?.total_amount
                                                    )
                                                )}
                                            </td>

                                        </tr>

                                    )
                                )

                            )}

                        </tbody>

                        <tfoot>

                            <tr>

                                <td
                                    colSpan={2}
                                    className="total-label"
                                >
                                    TOTAL
                                </td>

                                <td className="right bold">
                                    {money(
                                        totalRemittances +
                                        totalDeposits
                                    )}
                                </td>

                            </tr>

                        </tfoot>

                    </table>

                </div>

                {/* =====================================================
                    C. ACCOUNTABILITY
                ===================================================== */}

                <div className="section-c">

                    <div className="section-title">
                        C. ACCOUNTABILITY FOR ACCOUNTABLE FORMS
                    </div>

                    <table className="accountability-table">

                        <colgroup>
                            <col className="af-form" />
                            <col className="af-qty" />

                            <col className="af-serial" />
                            <col className="af-serial" />

                            <col className="af-qty" />

                            <col className="af-serial" />
                            <col className="af-serial" />

                            <col className="af-qty" />

                            <col className="af-serial" />
                            <col className="af-serial" />

                            <col className="af-qty" />

                            <col className="af-serial" />
                            <col className="af-serial" />
                        </colgroup>

                        <thead>

                            <tr>

                                <th rowSpan={2}>
                                    Name of
                                    <br />
                                    Form &amp; No
                                </th>

                                <th rowSpan={2}>
                                    QTY
                                </th>

                                <th colSpan={2}>
                                    Beginning Balance
                                    <br />
                                    Inclusive Serial Nos
                                </th>

                                <th rowSpan={2}>
                                    QTY
                                </th>

                                <th colSpan={2}>
                                    Receipts
                                    <br />
                                    Inclusive Serial Nos
                                </th>

                                <th rowSpan={2}>
                                    QTY
                                </th>

                                <th colSpan={2}>
                                    Issued
                                    <br />
                                    Inclusive Serial Nos
                                </th>

                                <th rowSpan={2}>
                                    QTY
                                </th>

                                <th colSpan={2}>
                                    Ending Balance
                                    <br />
                                    Inclusive Serial Nos
                                </th>

                            </tr>

                            <tr>

                                <th>
                                    From
                                </th>

                                <th>
                                    To
                                </th>

                                <th>
                                    From
                                </th>

                                <th>
                                    To
                                </th>

                                <th>
                                    From
                                </th>

                                <th>
                                    To
                                </th>

                                <th>
                                    From
                                </th>

                                <th>
                                    To
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {accountabilityRows.length === 0 ? (

                                <tr>
                                    <td
                                        colSpan={13}
                                        className="center"
                                    >
                                        &nbsp;
                                    </td>
                                </tr>

                            ) : (

                                accountabilityRows.map(
                                    (
                                        item: any,
                                        index: number
                                    ) => (

                                        <tr
                                            key={
                                                item?.id ??
                                                item?.lor_id ??
                                                index
                                            }
                                        >

                                            <td className="center">
                                                {first(
                                                    item?.form_code,
                                                    item?.form_name,
                                                    formCode
                                                )}
                                            </td>

                                            <td className="center">
                                                {first(
                                                    item?.quantity,
                                                    item?.qty,
                                                    formQty
                                                )}
                                            </td>

                                            <td className="center">
                                                {first(
                                                    item?.beginning_from,
                                                    item?.beginning_or,
                                                    beginningFrom
                                                )}
                                            </td>

                                            <td className="center">
                                                {first(
                                                    item?.beginning_to,
                                                    beginningTo
                                                )}
                                            </td>

                                            <td className="center">
                                                {first(
                                                    item?.receipt_qty,
                                                    item?.receipt_count,
                                                    receiptQty
                                                )}
                                            </td>

                                            <td className="center">
                                                {first(
                                                    item?.receipt_from,
                                                    item?.or_from,
                                                    receiptFrom
                                                )}
                                            </td>

                                            <td className="center">
                                                {first(
                                                    item?.receipt_to,
                                                    item?.or_to,
                                                    receiptTo
                                                )}
                                            </td>

                                            <td className="center">
                                                {first(
                                                    item?.issued_qty,
                                                    item?.issued_count,
                                                    issuedQty
                                                )}
                                            </td>

                                            <td className="center">
                                                {first(
                                                    item?.issued_from,
                                                    issuedFrom
                                                )}
                                            </td>

                                            <td className="center">
                                                {first(
                                                    item?.issued_to,
                                                    issuedTo
                                                )}
                                            </td>

                                            <td className="center">
                                                {first(
                                                    item?.ending_qty,
                                                    0
                                                )}
                                            </td>

                                            <td className="center">
                                                {first(
                                                    item?.ending_from,
                                                    endingFrom
                                                )}
                                            </td>

                                            <td className="center">
                                                {first(
                                                    item?.ending_to,
                                                    endingTo
                                                )}
                                            </td>

                                        </tr>

                                    )
                                )

                            )}

                        </tbody>

                    </table>

                </div>

                {/* =====================================================
                    D. SUMMARY
                ===================================================== */}

                <div className="section-d">

                    <div className="section-title">
                        D. SUMMARY OF COLLECTIONS AND REMITTANCES / DEPOSITS - List of Check
                    </div>

                    <div className="summary-content">

                        <div className="summary-line">
                            <span>
                                Beginning Balance
                            </span>

                            <strong>
                                0.00
                            </strong>
                        </div>

                        <div className="summary-line">
                            <span>
                                ADD: Collections
                            </span>

                            <strong>
                                0.00
                            </strong>
                        </div>

                        <div className="summary-line">
                            <span>
                                CASH
                            </span>

                            <strong>
                                {money(
                                    totalCollections
                                )}
                            </strong>
                        </div>

                        <div className="summary-line">
                            <span>
                                CHECKS
                            </span>

                            <strong>
                                .00
                            </strong>
                        </div>

                        <div className="summary-blank">
                            0.00
                        </div>

                        <div className="summary-less">
                            LESS: Remittances / Deposits to
                        </div>

                        <div className="summary-line">
                            <span>
                                Cashiers:
                            </span>

                            <strong>
                                {money(
                                    totalRemittances
                                )}
                            </strong>
                        </div>

                        <div className="summary-line">
                            <span>
                                Treasurer/Depository Bank
                            </span>

                            <strong>
                                {money(
                                    totalDeposits
                                )}
                            </strong>
                        </div>

                        <div className="summary-line">
                            <span>
                                Balance
                            </span>

                            <strong>
                                {money(
                                    balance
                                )}
                            </strong>
                        </div>

                        <div className="summary-blank">
                            0.00
                        </div>

                    </div>

                </div>

                {/* =====================================================
                    CERTIFICATION / VERIFICATION
                ===================================================== */}

                <div className="footer-area">

                    <div className="certification">

                        <div className="footer-heading">
                            CERTIFICATION
                        </div>

                        <p>
                            I hereby certify that the foregoing
                            report of collections and deposits,
                            Accountability for accountable form
                            is true and correct.
                        </p>

                        <div className="signature-block">

                            <div className="signature-name">
                                {accountableOfficer}
                            </div>

                            <div className="signature-date">
                                {dateOnly(dateTo)}
                            </div>

                            <div className="signature-label">
                                Accountable Officer
                            </div>

                        </div>

                    </div>

                    <div className="verification">

                        <div className="footer-heading">
                            VERIFICATION AND ACKNOWLEDGEMENT
                        </div>

                        <p>
                            I hereby certify that the foregoing
                            report of collection has been verified
                            and acknowledged receipt of
                        </p>

                        <div className="amount-words">
                            {amountWords(
                                totalCollections
                            )}
                        </div>

                        <div className="verification-signature">

                            <div>
                                <span className="signature-name">
                                    {first(
                                        data?.verified_by,
                                        data?.verified_by_name,
                                        "MARIA CRISTINA B. FORMACI0N"
                                    )}
                                </span>

                                <span className="signature-label">
                                    Municipal Treasurer
                                </span>
                            </div>

                            <div className="signature-date">
                                {dateOnly(dateTo)}
                            </div>

                        </div>

                    </div>

                </div>

                <div className="system-footer">
                    System Date : {dateOnly(new Date())} / Page 1 of 1
                </div>

            </div>
        </div>
    );
}