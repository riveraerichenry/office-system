"use client";

import { useEffect, useState } from "react";
import axios from "axios";

import {
    RCD,
    RCDRemittance,
} from "../RCDRemittanceTypes";

type Props = {
    rcd: RCD | null;
    remittance: RCDRemittance | null;
};

type DenominationRow = {
    denomination: number;
    quantity: number;
    amount: number;
};

/* ============================================================
   DENOMINATIONS
============================================================ */

const DENOMINATIONS: number[] = [
    1000,
    500,
    200,
    100,
    50,
    20,
    10,
    5,
    1,
    0.25,
    0.10,
    0.05,
    0.01,
];

/* ============================================================
   FORMAT CURRENCY
============================================================ */

function formatCurrency(
    value: number | string | null | undefined
): string {
    return new Intl.NumberFormat("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(value ?? 0));
}

/* ============================================================
   FORMAT DATE
============================================================ */

function formatDate(
    value: string | null | undefined
): string {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

/* ============================================================
   FORMAT DENOMINATION
============================================================ */

function formatDenomination(
    value: number
): string {
    if (value >= 1) {
        return `₱${value.toLocaleString("en-PH", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        })}`;
    }

    return `₱${value.toFixed(2)}`;
}

/* ============================================================
   PAYMENT TYPE
============================================================ */

function getPaymentTypeLabel(
    value: string | null | undefined
): string {
    switch (
        String(value ?? "").toUpperCase()
    ) {
        case "CASH":
            return "CASH";

        case "CHECK":
            return "CHECK";

        case "BOTH":
            return "CASH AND CHECK";

        default:
            return "—";
    }
}

/* ============================================================
   GET DENOMINATION ROWS
============================================================ */

function getDenominationRows(
    denominations: Record<number, number>
): DenominationRow[] {
    const source = denominations;

    return DENOMINATIONS.map(
        (denomination) => {
            let quantity = 0;

            /*
             * OBJECT FORMAT
             *
             * {
             *   "1000": 2,
             *   "500": 3
             * }
             */

            if (
                source &&
                !Array.isArray(source)
            ) {
                const objectSource =
                    source as Record<
                        string,
                        number
                    >;

                quantity = Number(
                    objectSource[
                        String(denomination)
                    ] ?? 0
                );
            }

            /*
             * ARRAY FORMAT
             *
             * [
             *   {
             *      denomination: 1000,
             *      quantity: 2,
             *      amount: 2000
             *   }
             * ]
             */

            if (
                Array.isArray(source)
            ) {
                const found =
                    source.find(
                        (item: any) =>
                            Number(
                                item?.denomination
                            ) ===
                            denomination
                    );

                quantity = Number(
                    found?.quantity ?? 0
                );
            }

            return {
                denomination,
                quantity,
                amount:
                    denomination *
                    quantity,
            };
        }
    );
}

/* ============================================================
   COMPONENT
============================================================ */

export default function RCDRemittancePreview({
    rcd,
    remittance,
}: Props) {

    /*
    ============================================================
    DENOMINATION DATA
    ============================================================
    Denominations are retrieved separately from:

    GET /api/rcd/remittance/{remittance_id}/denominations

    This keeps denomination retrieval independent from the
    main RCD/remittance API.
    ============================================================
    */

    const [
        denominations,
        setDenominations,
    ] = useState<Record<number, number>>({});


    useEffect(() => {

        /*
        ============================================================
        DENOMINATION DATA
        ============================================================
        */

        const remittanceId =
            remittance?.id;


        /*
        No remittance means there is nothing to retrieve.
        */

        if (!remittanceId) {

            setDenominations({});

            return;

        }


        let cancelled = false;


        async function loadDenominations() {

            try {

                const response =
                    await axios.get(
                        `/api/rcd/remittance/${remittanceId}/denominations`
                    );


                if (cancelled) {

                    return;

                }


                setDenominations(
                    response.data?.denominations ??
                    {}
                );


            } catch (error) {

                console.error(
                    "LOAD RCD DENOMINATIONS ERROR:",
                    error
                );


                if (!cancelled) {

                    setDenominations({});

                }

            }

        }


        loadDenominations();


        return () => {

            cancelled = true;

        };

    }, [
        remittance?.id,
    ]);


    /* ========================================================
       EMPTY STATE
    ======================================================== */

    if (!rcd) {
        return (
            <div className="rcd-remittance-preview-empty">
                <div>
                    <div className="rcd-remittance-empty-title">
                        RCD Remittance Preview
                    </div>

                    <div className="rcd-remittance-empty-text">
                        Select an RCD from the list.
                    </div>
                </div>

                <style jsx>{`
                    .rcd-remittance-preview-empty {
                        width: 100%;
                        min-height: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: #e2e8f0;
                        text-align: center;
                        box-sizing: border-box;
                    }

                    .rcd-remittance-empty-title {
                        font-size: 18px;
                        font-weight: 700;
                        color: #374151;
                    }

                    .rcd-remittance-empty-text {
                        margin-top: 4px;
                        font-size: 14px;
                        color: #6b7280;
                    }
                `}</style>
            </div>
        );
    }

    /* ========================================================
       AMOUNTS
    ======================================================== */

    const rcdAmount =
        Number(
            rcd.total_collections ?? 0
        );

    const cashAmount =
        Number(
            remittance?.cash_amount ?? 0
        );

    const checkAmount =
        Number(
            remittance?.check_amount ?? 0
        );

    const totalAmount =
        Number(
            remittance?.total_amount ?? 0
        );

    /* ========================================================
       DENOMINATIONS
    ======================================================== */

    const denominationRows =
        getDenominationRows(
            denominations
        );

    const denominationTotal =
        denominationRows.reduce(
            (
                total,
                row
            ) =>
                total +
                row.amount,
            0
        );

    /* ========================================================
       DIFFERENCE
    ======================================================== */

    const difference =
        rcdAmount -
        totalAmount;

    /* ========================================================
       RENDER
    ======================================================== */

    return (
        <div className="rcd-remittance-preview-wrapper">

            <div
                id="rcd-remittance-print-area"
                className="rcd-remittance-paper"
            >

                {/* ============================================================
                    GOVERNMENT HEADER
                ============================================================ */}

                

                <div className="rcd-government">

                    <div>
                        Republic of the Philippines
                    </div>

                    <div>
                        Province of Palawan
                    </div>

                    <div className="rcd-municipality">
                        MUNICIPALITY OF TAYTAY
                    </div>

                    <div className="rcd-office">
                        OFFICE OF THE MUNICIPAL TREASURER
                    </div>

                </div>


                <div className="rcd-header-line" />


                <div className="rcd-title">
                    REPORT OF REMITTANCE
                </div>


                {/* ============================================================
                    RCD INFORMATION
                ============================================================ */}

                <div className="rcd-information">

                    {/* ========================================================
                        LEFT
                    ======================================================== */}

                    <div>

                        <div className="rcd-info-row">

                            <span className="rcd-label">
                                Fund Type:
                            </span>

                            <span className="rcd-value">

                                {rcd.fund_code
                                    ? `${rcd.fund_code} - `
                                    : ""
                                }

                                {rcd.fund_name ??
                                    rcd.acronym ??
                                    "—"
                                }

                            </span>

                        </div>


                        <div className="rcd-info-row">

                            <span className="rcd-label">
                                Accountable Officer:
                            </span>

                            <span className="rcd-value">
                                {remittance?.remitted_by_name ?? "—"}
                            </span>

                        </div>

                    </div>


                    {/* ========================================================
                        RIGHT
                    ======================================================== */}

                    <div>

                        <div className="rcd-info-row rcd-right">

                            <span className="rcd-label">
                                Date:
                            </span>

                            <span className="rcd-value">

                                {formatDate(
                                    rcd.report_date
                                )}

                            </span>

                        </div>


                        <div className="rcd-info-row rcd-right">

                            <span className="rcd-label">
                                Report No:
                            </span>

                            <span className="rcd-value">
                                {rcd.report_no ?? "—"}
                            </span>

                        </div>

                    </div>

                </div>

                {/* =================================================
                    A + B. SUMMARY AND CASH DENOMINATION
                ================================================= */}

                <div className="rcd-remittance-summary-denomination">

                    {/* =================================================
                        A. REMITTANCE SUMMARY
                    ================================================= */}

                    <section className="rcd-remittance-card">

                        <div className="rcd-remittance-section-title">
                            A. REMITTANCE SUMMARY
                        </div>

                        <div className="rcd-remittance-summary-list">

                            <div className="rcd-remittance-summary-row">
                                <span>
                                    RCD Collection Amount
                                </span>

                                <strong>
                                    ₱{formatCurrency(rcdAmount)}
                                </strong>
                            </div>

                            <div className="rcd-remittance-summary-row">
                                <span>
                                    Payment Type
                                </span>

                                <strong>
                                    {getPaymentTypeLabel(
                                        remittance?.payment_type
                                    )}
                                </strong>
                            </div>

                            <div className="rcd-remittance-summary-row">
                                <span>
                                    Cash
                                </span>

                                <strong>
                                    ₱{formatCurrency(cashAmount)}
                                </strong>
                            </div>

                            <div className="rcd-remittance-summary-row">
                                <span>
                                    Check
                                </span>

                                <strong>
                                    ₱{formatCurrency(checkAmount)}
                                </strong>
                            </div>

                            <div className="rcd-remittance-summary-total">
                                <span>
                                    TOTAL REMITTED
                                </span>

                                <strong>
                                    ₱{formatCurrency(totalAmount)}
                                </strong>
                            </div>

                        </div>

                    </section>


                    {/* =================================================
                        B. CASH DENOMINATION
                    ================================================= */}

                    <section className="rcd-remittance-card">

                        <div className="rcd-remittance-section-title">
                            B. CASH DENOMINATION
                        </div>

                        <div className="rcd-remittance-denomination-list">

                            {denominationRows.map(
                                (row) => (
                                    <div
                                        key={
                                            row.denomination
                                        }
                                        className="rcd-remittance-denomination-row"
                                    >

                                        <span className="rcd-remittance-denomination-value">
                                            {formatDenomination(
                                                row.denomination
                                            )}
                                        </span>

                                        <span className="rcd-remittance-denomination-quantity">
                                            {row.quantity}
                                        </span>

                                        <strong className="rcd-remittance-denomination-amount">
                                            ₱{formatCurrency(
                                                row.amount
                                            )}
                                        </strong>

                                    </div>
                                )
                            )}

                            <div className="rcd-remittance-denomination-total-row">

                                <span>
                                    TOTAL CASH DENOMINATION
                                </span>

                                <strong>
                                    ₱{formatCurrency(
                                        denominationTotal
                                    )}
                                </strong>

                            </div>

                        </div>

                    </section>

                </div>


                {/* =================================================
                    C. RECONCILIATION
                ================================================= */}

                <section className="rcd-remittance-section">

                    <div className="rcd-remittance-section-title">
                        C. RECONCILIATION
                    </div>

                    <table className="rcd-remittance-table">

                        <tbody>

                            <tr>

                                <td>
                                    RCD Collection
                                </td>

                                <td className="rcd-remittance-amount">
                                    ₱
                                    {formatCurrency(
                                        rcdAmount
                                    )}
                                </td>

                            </tr>

                            <tr>

                                <td>
                                    Total Remitted
                                </td>

                                <td className="rcd-remittance-amount">
                                    ₱
                                    {formatCurrency(
                                        totalAmount
                                    )}
                                </td>

                            </tr>

                            <tr className="rcd-remittance-total-row">

                                <td>
                                    Difference
                                </td>

                                <td className="rcd-remittance-amount">
                                    ₱
                                    {formatCurrency(
                                        difference
                                    )}
                                </td>

                            </tr>

                        </tbody>

                    </table>

                </section>

                {/* =================================================
                    SIGNATURES
                ================================================= */}

                <div className="rcd-remittance-signatories">

                    {/* =====================================================
                        PREPARED BY
                    ====================================================== */}

                    <div className="rcd-remittance-signature-block">

                        <div className="rcd-remittance-signature-label">
                            Prepared by:
                        </div>

                        <div className="rcd-remittance-signature-name">
                            {remittance?.remitted_by_name ?? "—"}
                        </div>

                        <div className="rcd-remittance-signature-line" />


                    </div>


                    {/* =====================================================
                        NOTED BY
                    ====================================================== */}

                    <div className="rcd-remittance-signature-block">

                        <div className="rcd-remittance-signature-label">
                            Noted by:
                        </div>

                        <div className="rcd-remittance-signature-name">
                            MARIA CRISTINA B. FORMACION
                        </div>

                        <div className="rcd-remittance-signature-line" />

                        <div className="rcd-remittance-signature-role">
                            LRCO - II
                        </div>

                    </div>


                    {/* =====================================================
                        APPROVED BY
                    ====================================================== */}

                    <div className="rcd-remittance-signature-block">

                        <div className="rcd-remittance-signature-label">
                            Approved By:
                        </div>

                        <div className="rcd-remittance-signature-name">
                            IMLYN B. PARAPINA
                        </div>

                        <div className="rcd-remittance-signature-line" />

                        <div className="rcd-remittance-signature-role">
                            Municipal Treasurer
                        </div>

                    </div>

                </div>

                {/* =================================================
                    FOOTER
                ================================================= */}

                <div className="rcd-remittance-footer">

                    <span>
                        RCD Remittance Report
                    </span>

                    <span>
                        {
                            rcd.report_no ??
                            "—"
                        }
                    </span>

                </div>

            </div>

            {/* =====================================================
                STYLES
            ===================================================== */}

            <style jsx>{`


                .rcd-remittance-page {
                position: relative;

                width: 8.5in;
                height: 13in;

                box-sizing: border-box;
            }

                .rcd-remittance-preview-wrapper {
                    width: 100%;
                    height: 100%;
                    min-height: 100%;
                    padding: 20px;
                    background: #e2e8f0;
                    display: flex;
                    justify-content: center;
                    align-items: flex-start;
                    overflow: auto;
                    box-sizing: border-box;
                }

                .rcd-remittance-paper {
                    width: 8.5in;
                    height: 13in;

                    min-width: 8.5in;
                    max-width: 8.5in;

                    min-height: 13in;
                    max-height: 13in;

                    flex-shrink: 0;

                    box-sizing: border-box;

                    background: #ffffff;

                    padding:
                        0.35in
                        0.35in
                        0.25in
                        0.35in;

                    color: #000000;

                    font-family:
                        Arial,
                        Helvetica,
                        sans-serif;

                    font-size: 10px;

                    line-height: 1.2;

                    overflow: hidden;

                    box-shadow:
                        0 5px 25px
                        rgba(
                            0,
                            0,
                            0,
                            0.18
                        );
                }

                .rcd-remittance-government {
                    text-align: center;

                    font-family:
                        "Times New Roman",
                        Times,
                        serif;

                    font-size: 12px;

                    line-height: 1.1;
                }

                .rcd-remittance-municipality {
                    margin-top: 2px;

                    font-size: 17px;

                    font-weight: 700;
                }

                .rcd-remittance-office {
                    font-size: 15px;

                    font-weight: 700;
                }

                .rcd-remittance-header-line {
                    width: 100%;

                    margin-top: 6px;

                    border-bottom:
                        1.5px solid
                        #000000;
                }

                .rcd-remittance-title {
                    margin-top: 10px;
                    margin-bottom: 10px;

                    text-align: center;

                    font-size: 14px;

                    font-weight: 700;

                    letter-spacing: 0.4px;
                }

                .rcd-remittance-information {
                    border:
                        1px solid
                        #000000;

                    margin-bottom: 10px;
                }

                .rcd-remittance-information-row {
                    display: grid;

                    grid-template-columns:
                        1.7in 1fr;

                    min-height: 22px;

                    border-bottom:
                        1px solid
                        #000000;
                }

                .rcd-remittance-information-row:last-child {
                    border-bottom: none;
                }

                .rcd-remittance-information-row > span {
                    padding: 4px 6px;

                    font-weight: 700;

                    border-right:
                        1px solid
                        #000000;

                    background: #f3f4f6;
                }

                .rcd-remittance-information-row > strong {
                    padding: 4px 6px;

                    font-weight: 700;
                }

                .rcd-remittance-section {
                    margin-top: 9px;
                }

                .rcd-remittance-summary-denomination {
                    display: grid;

                    grid-template-columns:
                        minmax(0, 1fr)
                        minmax(0, 1fr);

                    gap: 12px;

                    margin-top: 9px;

                    width: 100%;
                }

                .rcd-remittance-card {
                    min-width: 0;

                    border:
                        1px solid
                        #000000;

                    box-sizing: border-box;
                }

                .rcd-remittance-section-title {
                    padding: 4px 6px;

                    border-bottom:
                        1px solid
                        #000000;

                    background: #f3f4f6;

                    font-size: 10px;

                    font-weight: 700;
                }

                .rcd-remittance-summary-list {
                    width: 100%;
                }

                .rcd-remittance-summary-row {
                    display: flex;

                    align-items: center;

                    justify-content:
                        space-between;

                    gap: 12px;

                    min-height: 23px;

                    padding:
                        4px
                        7px;

                    box-sizing: border-box;

                    border-bottom:
                        1px solid
                        #d1d5db;

                    font-size: 9.5px;
                }

                .rcd-remittance-summary-row > span {
                    flex: 1;

                    min-width: 0;
                }

                .rcd-remittance-summary-row > strong {
                    min-width: 1.15in;

                    text-align: right;

                    white-space: nowrap;

                    font-weight: 700;
                }

                .rcd-remittance-summary-total {
                    display: flex;

                    align-items: center;

                    justify-content:
                        space-between;

                    gap: 12px;

                    min-height: 25px;

                    padding:
                        4px
                        7px;

                    box-sizing: border-box;

                    font-size: 10px;

                    font-weight: 700;
                }

                .rcd-remittance-summary-total > strong {
                    min-width: 1.15in;

                    text-align: right;

                    white-space: nowrap;
                }

                .rcd-remittance-denomination-list {
                    width: 100%;
                }

                .rcd-remittance-denomination-row {
                    display: grid;

                    grid-template-columns:
                        1fr
                        0.55in
                        1.05in;

                    align-items: center;

                    min-height: 18px;

                    padding:
                        2px
                        6px;

                    box-sizing: border-box;

                    border-bottom:
                        1px solid
                        #d1d5db;

                    font-size: 9px;
                }

                .rcd-remittance-denomination-value {
                    font-weight: 600;
                }

                .rcd-remittance-denomination-quantity {
                    text-align: center;

                    font-weight: 600;
                }

                .rcd-remittance-denomination-amount {
                    text-align: right;

                    white-space: nowrap;

                    font-weight: 700;
                }

                .rcd-remittance-denomination-total-row {
                    display: flex;

                    align-items: center;

                    justify-content:
                        space-between;

                    gap: 10px;

                    min-height: 24px;

                    padding:
                        4px
                        6px;

                    box-sizing: border-box;

                    font-size: 9.5px;

                    font-weight: 700;
                }

                .rcd-remittance-denomination-total-row > strong {
                    text-align: right;

                    white-space: nowrap;
                }


                .rcd-remittance-signature-name {
                    font-size: 15px;
                    font-weight: 700;
                    text-transform: uppercase;
                    min-height: 18px;
                }

                .rcd-remittance-signatories {
                    display: grid;

                    grid-template-columns:
                        1fr 1fr;

                    gap: 60px;

                    margin-top: 55px;
                }

                .rcd-remittance-signature-block {
                    text-align: center;
                }

                .rcd-remittance-signature-line {
                    width: 100%;

                    height: 5px;

                    border-bottom:
                        1px solid
                        #000000;
                }

                .rcd-remittance-signature-label {
                    margin-top: 5px;
                    margin-bottom: 50px;

                    font-size: 12px;

                    font-weight: 500;
                }

                .rcd-remittance-signature-role {
                  

                    font-size: 12px;

                }

                .rcd-remittance-footer {
                    display: flex;

                    justify-content:
                        space-between;

                    margin-top: 300px;

                    padding-top: 5px;

                    border-top:
                        1px solid
                        #000000;

                    font-size: 8px;

                    color: #444444;
                }

                @media print {

                    @page {
                        size: 8.5in 13in;
                        margin: 0;
                    }

                    html,
                    body {
                        margin: 0 !important;
                        padding: 0 !important;

                        background:
                            #ffffff !important;
                    }

                    body * {
                        visibility: hidden;
                    }

                    #rcd-remittance-print-area,
                    #rcd-remittance-print-area * {
                        visibility: visible;
                    }

                    #rcd-remittance-print-area {
                        position: absolute;

                        left: 0;
                        top: 0;

                        width: 8.5in;
                        height: 13in;

                        margin: 0;

                        padding:
                            0.35in
                            0.35in
                            0.25in
                            0.35in;

                        box-shadow: none;

                        overflow: hidden;
                    }

                    .rcd-remittance-preview-wrapper {
                        padding: 0 !important;

                        margin: 0 !important;

                        width: 8.5in !important;
                        height: 13in !important;

                        min-height: 13in !important;

                        background:
                            #ffffff !important;

                        overflow: hidden !important;
                    }

                }


                /* ============================================================
   GOVERNMENT HEADER
============================================================ */

.rcd-government {

    width: 100%;

    text-align: center;

    font-family:
        "Times New Roman",
        Times,
        serif;

    font-size: 15px;

    line-height: 1.15;

}


.rcd-municipality {

    margin-top: 3px;

    font-size: 20px;

    font-weight: 700;

}


.rcd-office {

    font-size: 17px;

    font-weight: 700;

}


/* ============================================================
   HEADER LINE
============================================================ */

.rcd-header-line {

    width: 100%;

    margin-top: 7px;

    border-bottom:
        1.5px solid
        #000000;

}


/* ============================================================
   TITLE
============================================================ */

.rcd-title {

    margin-top: 9px;

    margin-bottom: 10px;

    text-align: center;

    font-family:
        "Times New Roman",
        Times,
        serif;

    font-size: 14px;

    font-weight: 700;

}


/* ============================================================
   RCD INFORMATION
============================================================ */

.rcd-information {

    display: grid;

    grid-template-columns:
        1fr 1fr;

    column-gap: 25px;

    width: 100%;

    margin-bottom: 12px;

}


.rcd-info-row {

    display: flex;

    align-items: baseline;

    margin-bottom: 5px;

    font-size: 10px;

}


.rcd-label {

    min-width: 1.25in;

    font-weight: 700;

}


.rcd-value {

    flex: 1;

    font-weight: 600;

}


.rcd-right {

    justify-content: flex-end;

}


.rcd-right .rcd-label {

    min-width: auto;

    margin-right: 8px;

}


.rcd-right .rcd-value {

    flex: initial;

    min-width: 1.65in;

    text-align: left;

}


@media print {

    @page {
        size: 8.5in 13in;
        margin: 0;
    }

    html,
    body {
        width: 8.5in;
        height: 13in;
        margin: 0;
        padding: 0;
        background: white !important;
    }

    /*
    =====================================================
    HIDE THE APPLICATION / MODAL UI
    =====================================================
    */

    body * {
        visibility: hidden;
    }

    /*
    =====================================================
    SHOW ONLY THE RCD PRINTABLE CONTENT
    =====================================================
    */

    .rcd-remittance-printable,
    .rcd-remittance-printable * {
        visibility: visible;
    }

    .rcd-remittance-printable {
        position: absolute;
        left: 0;
        top: 0;

        width: 8.5in;
        height: 13in;

        margin: 0;
        padding: 0.5in;

        box-sizing: border-box;

        background: white !important;

        overflow: visible !important;
    }

    /*
    =====================================================
    FOOTER
    =====================================================
    */

    .rcd-remittance-footer {
        position: absolute;

        left: 0.35in;
        right: 0.35in;

        bottom: 0.18in;

        display: flex;

        justify-content: space-between;

        align-items: center;

        padding-top: 5px;

        border-top:
            1px solid
            #000000;

        font-size: 8px;

        color: #444444;

        box-sizing: border-box;
    }

    /*
    =====================================================
    REMOVE SCREEN-ONLY ELEMENTS
    =====================================================
    */

    .no-print {
        display: none !important;
    }

}










            `}</style>

        </div>
    );
}