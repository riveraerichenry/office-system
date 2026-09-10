"use client";

import {
    useEffect,
    useState,
} from "react";

import "./AbstractSummaryPreview.css";

import AbstractSummaryHeader
    from "./AbstractSummaryHeader";

import AbstractSummaryAccounts
    from "./AbstractSummaryAccounts";


type Props = {
    rcd?: any;
    report?: any;
    items?: any[];
    fundSource?: any;
    user?: any;
};


/* ============================================================
   DATE FORMAT
============================================================ */

function formatDate(
    value?: string | null
): string {

    if (!value) {
        return "—";
    }

    const date =
        new Date(
            `${String(value).substring(
                0,
                10
            )}T00:00:00`
        );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return String(value);
    }

    return date.toLocaleDateString(
        "en-PH",
        {
            month: "long",
            day: "numeric",
            year: "numeric",
        }
    );
}


/* ============================================================
   AMOUNT FORMAT
============================================================ */

function formatAmount(
    value: any
): string {

    return Number(
        value ?? 0
    ).toLocaleString(
        "en-PH",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }
    );
}


/* ============================================================
   USER NAME
============================================================ */

function getFullName(
    user: any
): string {

    if (!user) {
        return "—";
    }

    if (user.full_name) {
        return user.full_name;
    }

    const parts = [
        user.first_name,
        user.middle_name,
        user.last_name,
        user.suffix,
    ].filter(Boolean);

    return (
        parts.join(" ") ||
        user.name ||
        user.username ||
        "—"
    );
}


/* ============================================================
   PRINT
   Use a dedicated print window so Chrome print preview receives
   the actual report content and stylesheet URLs.
============================================================ */

function printAbstractSummary() {

    const reportElement =
        document.querySelector(
            ".abstract-summary-preview-wrapper"
        ) as HTMLElement | null;

    if (!reportElement) {
        console.error(
            "Abstract Summary preview not found."
        );
        return;
    }

    const printWindow =
        window.open(
            "",
            "_blank",
            "width=1200,height=900"
        );

    if (!printWindow) {
        alert(
            "Please allow pop-ups for this site so the report can be printed."
        );
        return;
    }

    const styles: string[] = [];

    document
        .querySelectorAll(
            'link[rel="stylesheet"]'
        )
        .forEach((link) => {

            const href =
                link.getAttribute("href");

            if (!href) {
                return;
            }

            const absoluteHref =
                new URL(
                    href,
                    window.location.href
                ).href;

            styles.push(
                `<link rel="stylesheet" href="${absoluteHref}" />`
            );
        });

    document
        .querySelectorAll("style")
        .forEach((style) => {
            styles.push(
                style.outerHTML
            );
        });

    const clonedReport =
        reportElement.cloneNode(
            true
        ) as HTMLElement;

    clonedReport
        .querySelector(
            ".abstract-summary-floating-print"
        )
        ?.remove();

    clonedReport
        .querySelectorAll("button")
        .forEach((button) => {
            button.remove();
        });

    printWindow.document.open();

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
            <head>

                <meta charset="UTF-8" />

                <title>
                    Abstract of Collections
                </title>

                ${styles.join("\n")}

                <style>

                    html,
                    body {
                        margin: 0 !important;
                        padding: 0 !important;

                        width: 8.5in !important;
                        min-width: 8.5in !important;

                        background: #fff !important;

                        overflow: visible !important;
                    }

                    body {
                        display: block !important;
                    }

                    .abstract-summary-preview-wrapper {

                        width: 8.5in !important;
                        min-width: 8.5in !important;

                        margin: 0 !important;
                        padding: 0 !important;

                        background: #fff !important;

                        display: flex !important;
                        flex-direction: column !important;
                        align-items: center !important;

                        overflow: visible !important;
                    }

                    .abstract-summary-paper {

                        width: 8.5in !important;
                        height: 13in !important;

                        min-width: 8.5in !important;
                        min-height: 13in !important;

                        max-width: 8.5in !important;
                        max-height: 13in !important;

                        margin: 0 !important;

                        background: #fff !important;

                        box-shadow: none !important;

                        overflow: hidden !important;

                        position: relative !important;

                        display: flex !important;
                        flex-direction: column !important;

                        box-sizing: border-box !important;

                        break-after: page !important;
                        page-break-after: always !important;
                    }

                    .abstract-summary-paper:last-child {

                        break-after: auto !important;
                        page-break-after: auto !important;
                    }

                    .abstract-summary-floating-print {
                        display: none !important;
                    }

                    .abstract-summary-preview-wrapper,
                    .abstract-summary-paper,
                    .abstract-summary-paper * {
                        visibility: visible !important;
                    }

                    @page {
                        size: 8.5in 13in;
                        margin: 0;
                    }

                </style>

            </head>

            <body>

                ${clonedReport.outerHTML}

            </body>
        </html>
    `);

    printWindow.document.close();

    const waitForPrint =
        async () => {

            try {

                if (
                    printWindow.document.fonts
                ) {
                    await printWindow
                        .document
                        .fonts
                        .ready;
                }

            } catch {
                // Ignore font loading errors.
            }

            await new Promise<void>(
                (resolve) => {

                    setTimeout(
                        resolve,
                        1000
                    );

                }
            );

            printWindow.focus();

            printWindow.print();
        };

    if (
        printWindow.document.readyState ===
        "complete"
    ) {

        void waitForPrint();

    } else {

        printWindow.onload =
            () => {
                void waitForPrint();
            };

    }

    printWindow.onafterprint =
        () => {
            printWindow.close();
        };
}


/* ============================================================
   COMPONENT
============================================================ */

export default function AbstractSummary({
    rcd,
    report,
    items = [],
    fundSource,
    user,
}: Props) {

    /* ========================================================
       INITIAL REPORT
    ======================================================== */

    const initialReport =
        rcd ??
        report ??
        null;


    /* ========================================================
       REPORT FROM API
    ======================================================== */

    const [
        selectedReport,
        setSelectedReport,
    ] = useState<any>(
        initialReport
    );


    /* ========================================================
       FUND SOURCE FROM API
    ======================================================== */

    const [
        selectedFundSource,
        setSelectedFundSource,
    ] = useState<any>(
        fundSource ??
        null
    );


    /* ========================================================
       COLLECTION ITEMS
    ======================================================== */

    const [
        accountRows,
        setAccountRows,
    ] = useState<any[]>(
        Array.isArray(items)
            ? items
            : []
    );


    /* ========================================================
       LOADING
    ======================================================== */

    const [
        loading,
        setLoading,
    ] = useState(false);


    /* ========================================================
       ERROR
    ======================================================== */

    const [
        error,
        setError,
    ] = useState<string | null>(
        null
    );


    /* ============================================================
       LOAD ABSTRACT SUMMARY
    ============================================================ */

    useEffect(() => {

        const reportId =
            initialReport?.id;

        if (!reportId) {

            setSelectedReport(
                initialReport
            );

            setSelectedFundSource(
                fundSource ??
                null
            );

            setAccountRows(
                Array.isArray(items)
                    ? items
                    : []
            );

            return;
        }

        let cancelled = false;

        async function loadAbstractSummary() {

            try {

                setLoading(true);

                setError(null);

                const url =
                    `/api/rcd/reports/${reportId}/abstractsummary`;

                const response =
                    await fetch(
                        url,
                        {
                            method: "GET",
                            cache: "no-store",
                        }
                    );

                const data =
                    await response.json();

                if (!response.ok) {

                    throw new Error(
                        data?.error ??
                        "Failed to load Abstract Summary."
                    );
                }

                if (cancelled) {
                    return;
                }

                if (data?.rcd) {

                    setSelectedReport(
                        data.rcd
                    );

                } else {

                    setSelectedReport(
                        initialReport
                    );
                }

                if (data?.fund_source) {

                    setSelectedFundSource(
                        data.fund_source
                    );

                } else {

                    setSelectedFundSource(
                        fundSource ??
                        null
                    );
                }

                const rows =
                    Array.isArray(
                        data?.items
                    )
                        ? data.items
                        : [];

                setAccountRows(
                    rows
                );

            }
            catch (
                err: any
            ) {

                console.error(
                    "LOAD ABSTRACT SUMMARY ERROR:",
                    err
                );

                if (!cancelled) {

                    setError(
                        err?.message ??
                        "Failed to load Abstract Summary."
                    );

                    setAccountRows(
                        []
                    );
                }

            }
            finally {

                if (!cancelled) {

                    setLoading(
                        false
                    );

                }

            }

        }

        loadAbstractSummary();

        return () => {

            cancelled = true;

        };

    }, [
        initialReport?.id,
    ]);


    /* ============================================================
       NO REPORT
    ============================================================ */

    if (!selectedReport) {

        return (

            <div className="
                abstract-summary-empty-state
            ">

                Select a report from the list.

            </div>

        );

    }


    /* ============================================================
       PAGINATION

       The daily receipt page uses a practical 38-row page and
       keeps the final page shorter so the Grand Total and
       signatories have room.
    ============================================================ */

    const NORMAL_PAGE_ROWS = 38;
    const LAST_PAGE_ROWS = 30;

    const pages: any[][] = [];

    if (accountRows.length === 0) {

        pages.push([]);

    } else {

        let start = 0;

        while (
            start < accountRows.length
        ) {

            const remaining =
                accountRows.length -
                start;

            const pageSize =
                remaining <= LAST_PAGE_ROWS
                    ? remaining
                    : NORMAL_PAGE_ROWS;

            pages.push(
                accountRows.slice(
                    start,
                    start + pageSize
                )
            );

            start += pageSize;
        }
    }


    /* ============================================================
       GRAND TOTAL
    ============================================================ */

    const grandTotal =
        accountRows.reduce(
            (
                total: number,
                item: any
            ) => {

                const amount =
                    Number(
                        item?.amount ??
                        item?.total ??
                        item?.value ??
                        0
                    );

                return total + amount;

            },
            0
        );


    /* ============================================================
       RENDER
    ============================================================ */

    return (

        <div className="
            abstract-summary-preview-wrapper
        ">

            {/* ==================================================
                PRINT BUTTON
            ================================================== */}

            <button
                type="button"
                onClick={
                    printAbstractSummary
                }
                className="
                    abstract-summary-floating-print
                "
                title="Print Abstract of Collections"
                aria-label="Print Abstract of Collections"
            >

                <span className="
                    abstract-summary-print-icon
                ">
                    🖨
                </span>

                <span>
                    Print
                </span>

            </button>


            {/* ==================================================
                PAGES
            ================================================== */}

            {pages.map(
                (
                    pageItems,
                    pageIndex
                ) => {

                    const isLastPage =
                        pageIndex ===
                        pages.length - 1;

                    return (

                        <div
                            key={
                                `abstract-summary-page-${pageIndex}`
                            }
                            className="
                                abstract-summary-paper
                            "
                        >

                            {/* ==================================================
                                HEADER
                            ================================================== */}

                            <AbstractSummaryHeader
                                report={
                                    selectedReport
                                }

                                fundSource={
                                    selectedFundSource
                                }

                                user={
                                    user
                                }
                            />


                            {/* ==================================================
                                COLLECTION TABLE
                            ================================================== */}

                            {loading ? (

                                <div className="
                                    abstract-summary-status
                                ">

                                    Loading collections...

                                </div>

                            ) : error ? (

                                <div className="
                                    abstract-summary-status
                                    abstract-summary-error
                                ">

                                    {error}

                                </div>

                            ) : (

                                <AbstractSummaryAccounts
                                    items={
                                        pageItems
                                    }

                                    formatAmount={
                                        formatAmount
                                    }

                                    showGrandTotal={
                                        isLastPage
                                    }

                                    grandTotalOverride={
                                        grandTotal
                                    }

                                />

                            )}


                            {/* ==================================================
                                SIGNATORIES — LAST PAGE ONLY
                            ================================================== */}

                            {isLastPage && (

                                <div className="
                                    abstract-summary-signatories
                                ">

                                    <div className="
                                        abstract-summary-signature
                                    ">

                                        <div className="
                                            abstract-summary-signature-label
                                        ">
                                            Prepared By:
                                        </div>

                                        <div className="
                                            abstract-summary-signature-name
                                        ">

                                            {
                                                selectedReport?.rcd_by_name ??
                                                getFullName(user)
                                            }

                                        </div>

                                        <div className="
                                            abstract-summary-signature-role
                                        ">
                                            Accountable Officer
                                        </div>

                                    </div>


                                    <div className="
                                        abstract-summary-signature
                                    ">

                                        <div className="
                                            abstract-summary-signature-label
                                        ">
                                            Noted By:
                                        </div>

                                        <div className="
                                            abstract-summary-signature-name
                                        ">
                                            MARIA CRISTINA B. FORMACION
                                        </div>

                                        <div className="
                                            abstract-summary-signature-role
                                        ">
                                            Municipal Treasurer
                                        </div>

                                    </div>

                                </div>

                            )}


                            {/* ==================================================
                                FOOTER
                            ================================================== */}

                            <div className="
                                abstract-summary-footer
                            ">

                                <span>
                                    Abstract of Collections
                                </span>

                                <span>
                                    {
                                        selectedReport?.report_no ??
                                        "—"
                                    }
                                </span>

                                <span>
                                    Page {pageIndex + 1} of {pages.length}
                                </span>

                            </div>

                        </div>

                    );

                }
            )}

        </div>

    );

}
