"use client";

import {
    useEffect,
    useState,
} from "react";

import "./AbstractSummaryByPreview.css";

import AbstractSummaryByHeader from "./AbstractSummaryByHeader";

import AbstractSummaryByAccounts from "./AbstractSummaryByAccounts";


type Props = {
    report?: any;
    items?: any[];
    fundSource?: any;
    user?: any;
};


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
   Dedicated print window so Chrome receives the actual
   stylesheet instead of using the old visibility trick.
============================================================ */

function printAbstractSummaryBy() {

    const reportElement =
        document.querySelector(
            ".abstract-by-summary-preview-wrapper"
        ) as HTMLElement | null;

    if (!reportElement) {
        console.error(
            "Abstract Summary by Account preview not found."
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

            if (!href) return;

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
            ".abstract-by-summary-floating-print"
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

                    .abstract-by-summary-preview-wrapper {
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

                    .abstract-by-summary-paper {
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

                        box-sizing: border-box !important;

                        break-after: page !important;
                        page-break-after: always !important;
                    }

                    .abstract-by-summary-paper:last-child {
                        break-after: auto !important;
                        page-break-after: auto !important;
                    }

                    .abstract-by-summary-floating-print {
                        display: none !important;
                    }

                    .abstract-by-summary-preview-wrapper,
                    .abstract-by-summary-paper,
                    .abstract-by-summary-paper * {
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

    const startPrinting =
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
        void startPrinting();
    } else {
        printWindow.onload = () => {
            void startPrinting();
        };
    }

    printWindow.onafterprint = () => {
        printWindow.close();
    };
}


export default function AbstractSummaryByAccount({
    report,
    items = [],
    fundSource,
    user,
}: Props) {

    const [
        accountRows,
        setAccountRows,
    ] = useState<any[]>(
        Array.isArray(items)
            ? items
            : []
    );


    const [
        loading,
        setLoading,
    ] = useState(false);


    const [
        error,
        setError,
    ] = useState<string | null>(
        null
    );


    useEffect(() => {

        if (!report?.id) {

            setAccountRows([]);

            return;
        }


        let cancelled = false;


        async function loadAbstractSummary() {

            try {

                setLoading(true);

                setError(null);


                const url =
                    `/api/rcd/reports/${report.id}/abstract-by-summary`;


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


                const rows =
                    Array.isArray(
                        data?.items
                    )
                        ? data.items
                        : [];


                setAccountRows(rows);

            } catch (err: any) {

                console.error(
                    "LOAD ABSTRACT SUMMARY ERROR:",
                    err
                );


                if (!cancelled) {

                    setError(
                        err?.message ??
                        "Failed to load Abstract Summary."
                    );

                    setAccountRows([]);

                }

            } finally {

                if (!cancelled) {

                    setLoading(false);

                }

            }

        }


        loadAbstractSummary();


        return () => {

            cancelled = true;

        };

    }, [
        report?.id,
    ]);


    if (!report) {

        return (
            <div className="abstract-by-summary-empty-state">
                Select a report from the list.
            </div>
        );

    }


    /*
     * ============================================================
     * PAGINATION
     *
     * Keep the original entry component.
     * Only split its items when the folio needs another page.
     * ============================================================
     */

    const NORMAL_PAGE_ROWS = 38;

    const pages: any[][] = [];

    if (accountRows.length === 0) {
        pages.push([]);
    } else {

        for (
            let start = 0;
            start < accountRows.length;
            start += NORMAL_PAGE_ROWS
        ) {
            pages.push(
                accountRows.slice(
                    start,
                    start + NORMAL_PAGE_ROWS
                )
            );
        }

    }

    const overallGrandTotal =
        accountRows.reduce(
            (
                total: number,
                item: any
            ) =>
                total +
                Number(
                    item?.amount ?? 0
                ),
            0
        );


    return (

        <div className="abstract-by-summary-preview-wrapper">

            <button
                type="button"
                onClick={
                    printAbstractSummaryBy
                }
                className="abstract-by-summary-floating-print"
                title="Print Abstract of Collections"
                aria-label="Print Abstract of Collections"
            >
                <span className="abstract-by-summary-print-icon">
                    🖨
                </span>

                <span>
                    Print
                </span>
            </button>


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
                                `abstract-by-summary-page-${pageIndex}`
                            }
                            className="abstract-by-summary-paper"
                        >

                            <AbstractSummaryByHeader
                                report={report}
                                fundSource={fundSource}
                                user={user}
                                formatDate={formatDate}
                            />


                            {loading ? (

                                <div className="abstract-by-summary-status">
                                    Loading account summary...
                                </div>

                            ) : error ? (

                                <div className="abstract-by-summary-status abstract-by-summary-error">
                                    {error}
                                </div>

                            ) : (

                                <AbstractSummaryByAccounts
                                    items={pageItems}
                                    formatAmount={formatAmount}
                                    showGrandTotal={
                                        isLastPage
                                    }
                                    grandTotalOverride={
                                        isLastPage
                                            ? overallGrandTotal
                                            : undefined
                                    }
                                />

                            )}


                            {isLastPage && (
                                <div className="abstract-by-summary-signatories">

                                    <div className="abstract-by-summary-signature">

                                        <div className="abstract-by-summary-signature-label">
                                            Prepared By:
                                        </div>

                                        <div className="abstract-by-summary-signature-name">
                                            {getFullName(user)}
                                        </div>

                                        <div className="abstract-by-summary-signature-role">
                                            Accountable Officer
                                        </div>

                                    </div>


                                    <div className="abstract-by-summary-signature">

                                        <div className="abstract-by-summary-signature-label">
                                            Noted By:
                                        </div>

                                        <div className="abstract-by-summary-signature-name">
                                            MARIA CRISTINA B. FORMACION
                                        </div>

                                        <div className="abstract-by-summary-signature-role">
                                            Municipal Treasurer
                                        </div>

                                    </div>

                                </div>
                            )}


                            <div className="abstract-by-summary-footer">

                                <span>
                                    Abstract of Collections
                                </span>

                                <span>
                                    {
                                        report?.report_no ??
                                        "—"
                                    }
                                </span>

                            </div>

                        </div>

                    );

                }
            )}

        </div>

    );
}
