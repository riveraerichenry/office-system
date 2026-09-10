"use client";

import "./DailyReceiptPreview.css";

import DailyReceiptHeader from "./DailyReceiptHeader";
import DailyReceipts from "./DailyReceipts";


type Props = {
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
   FULL NAME
============================================================ */

function getFullName(
    user: any
): string {

    if (!user) {
        return "—";
    }

    if (
        user.full_name
    ) {
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
   PRINT REPORT
============================================================ */

function printDailyReceipt() {
    const reportElement = document.querySelector(
        ".daily-receipt-preview-wrapper"
    ) as HTMLElement | null;

    if (!reportElement) {
        console.error("Daily receipt preview not found.");
        return;
    }

    const printWindow = window.open(
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

    /*
     * ------------------------------------------------------------
     * GET ALL STYLES FROM CURRENT PAGE
     * Convert stylesheet URLs to absolute URLs so they work
     * inside about:blank.
     * ------------------------------------------------------------
     */

    const styles: string[] = [];

    document
        .querySelectorAll('link[rel="stylesheet"]')
        .forEach((link) => {
            const href = link.getAttribute("href");

            if (!href) return;

            const absoluteHref = new URL(
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
            styles.push(style.outerHTML);
        });

    /*
     * ------------------------------------------------------------
     * CLONE REPORT
     * ------------------------------------------------------------
     */

    const clonedReport =
        reportElement.cloneNode(true) as HTMLElement;

    /*
     * Remove print button from printed report
     */
    clonedReport
        .querySelector(".daily-receipt-floating-print")
        ?.remove();

    /*
     * Remove any interactive elements that shouldn't print
     */
    clonedReport
        .querySelectorAll("button")
        .forEach((button) => {
            button.remove();
        });

    /*
     * ------------------------------------------------------------
     * CREATE PRINT DOCUMENT
     * ------------------------------------------------------------
     */

    printWindow.document.open();

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
            <head>

                <meta charset="UTF-8" />

                <title>
                    Daily Receipt by Fund Source
                </title>

                ${styles.join("\n")}

                <style>

                    /*
                     * ====================================================
                     * PRINT DOCUMENT RESET
                     * ====================================================
                     */

                    html,
                    body {
                        margin: 0 !important;
                        padding: 0 !important;

                        width: 8.5in !important;
                        min-width: 8.5in !important;

                        background: #ffffff !important;

                        overflow: visible !important;
                    }

                    body {
                        display: block !important;
                    }


                    /*
                     * ====================================================
                     * REPORT WRAPPER
                     * ====================================================
                     */

                    .daily-receipt-preview-wrapper {

                        width: 8.5in !important;
                        min-width: 8.5in !important;

                        margin: 0 !important;
                        padding: 0 !important;

                        background: #ffffff !important;

                        display: flex !important;
                        flex-direction: column !important;
                        align-items: center !important;

                        overflow: visible !important;
                    }


                    /*
                     * ====================================================
                     * EACH FOLIO PAGE
                     * ====================================================
                     */

                    .daily-receipt-paper {

                        width: 8.5in !important;
                        height: 13in !important;

                        min-width: 8.5in !important;
                        min-height: 13in !important;

                        max-width: 8.5in !important;
                        max-height: 13in !important;

                        margin: 0 !important;

                        padding: 0.30in 0.30in 0.45in 0.30in !important;

                        background: #ffffff !important;

                        box-shadow: none !important;

                        overflow: hidden !important;

                        position: relative !important;

                        display: flex !important;
                        flex-direction: column !important;

                        box-sizing: border-box !important;

                        break-after: page !important;
                        page-break-after: always !important;
                    }


                    .daily-receipt-paper:last-child {

                        break-after: auto !important;
                        page-break-after: auto !important;
                    }


                    /*
                     * ====================================================
                     * HIDE PRINT BUTTON
                     * ====================================================
                     */

                    .daily-receipt-floating-print {

                        display: none !important;

                    }


                    /*
                     * ====================================================
                     * FORCE VISIBILITY
                     * ====================================================
                     */

                    .daily-receipt-preview-wrapper,
                    .daily-receipt-paper,
                    .daily-receipt-paper * {

                        visibility: visible !important;

                    }


                    /*
                     * ====================================================
                     * PAGE SIZE
                     * ====================================================
                     */

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


    /*
     * ------------------------------------------------------------
     * WAIT FOR EVERYTHING TO LOAD
     * ------------------------------------------------------------
     */

    const waitForPrint = async () => {

        try {

            /*
             * Wait for fonts
             */
            if (printWindow.document.fonts) {
                await printWindow.document.fonts.ready;
            }

        } catch {
            // Ignore font loading errors
        }


        /*
         * Wait for stylesheets/images/layout
         */
        await new Promise<void>((resolve) => {

            setTimeout(() => {

                resolve();

            }, 1000);

        });


        /*
         * Make sure the window is active
         */
        printWindow.focus();


        /*
         * PRINT
         */
        printWindow.print();

    };


    /*
     * Wait until print document finishes loading
     */
    if (
        printWindow.document.readyState ===
        "complete"
    ) {

        void waitForPrint();

    } else {

        printWindow.onload = () => {

            void waitForPrint();

        };

    }


    /*
     * Close dedicated window after printing
     */
    printWindow.onafterprint = () => {

        printWindow.close();

    };

}


/* ============================================================
   COMPONENT
============================================================ */

export default function DailyReceiptByFundSource({
    report,
    items = [],
    fundSource,
    user,
}: Props) {


    /* ========================================================
       EMPTY REPORT
    ======================================================== */

    if (!report) {

        return (

            <div className="
                flex
                min-h-[500px]
                items-center
                justify-center
                text-sm
                text-gray-400
            ">

                Select a report from the list.

            </div>
        );
    }


    /* ========================================================
       NORMALIZE ITEMS
    ======================================================== */

    const rows =
        Array.isArray(items)
            ? items
            : [];


    /* ========================================================
       REPORT DATE
    ======================================================== */

    const reportDate =
        report?.report_date ??
        report?.date ??
        null;


    /* ========================================================
       COVERAGE
    ======================================================== */

    const dateFrom =
        report?.date_from ??
        report?.coverage_from ??
        reportDate;

    const dateTo =
        report?.date_to ??
        report?.coverage_to ??
        reportDate;


    void dateFrom;
    void dateTo;


    /* ========================================================
       PAGINATION
       
       NORMAL PAGE:
       38 rows

       FINAL PAGE:
       30 rows because it also contains:

       - Grand Total
       - Signatories
       - Footer
       - Page number
    ======================================================== */

    const NORMAL_PAGE_ROWS = 38;

    const LAST_PAGE_ROWS = 30;


    /* ========================================================
       BUILD PAGES
    ======================================================== */

    const pages: any[][] = [];

    let remainingRows =
        [...rows];


    while (
        remainingRows.length > 0
    ) {

        /*
           Remaining rows fit on the final page.
        */

        if (
            remainingRows.length <=
            LAST_PAGE_ROWS
        ) {

            pages.push(
                remainingRows
            );

            remainingRows = [];

            break;
        }


        /*
           Fill a normal page.
        */

        pages.push(
            remainingRows.slice(
                0,
                NORMAL_PAGE_ROWS
            )
        );


        remainingRows =
            remainingRows.slice(
                NORMAL_PAGE_ROWS
            );
    }


    /* ========================================================
       ALWAYS HAVE ONE PAGE
    ======================================================== */

    if (
        pages.length === 0
    ) {

        pages.push([]);

    }


    /* ========================================================
       GRAND TOTAL
    ======================================================== */

    const grandTotal =
        rows.reduce(
            (
                total,
                item
            ) => {

                return (
                    total +
                    Number(
                        item?.amount ??
                        0
                    )
                );

            },
            0
        );


    /* ========================================================
       TOTAL RECEIPTS
    ======================================================== */

    const totalReceiptCount =
        rows.length;


    /* ========================================================
       RENDER
    ======================================================== */

    return (

        <div className="
            daily-receipt-preview-wrapper
        ">


            {/* ==================================================
                RECEIPT PAGES
            ================================================== */}

            {
                pages.map(
                    (
                        pageItems,
                        pageIndex
                    ) => {

                        const isLastPage =
                            pageIndex ===
                            pages.length - 1;


                        /*
                           Calculate the starting
                           entry number correctly even
                           when the last page has a
                           different capacity.
                        */

                        const startIndex =
                            pages
                                .slice(
                                    0,
                                    pageIndex
                                )
                                .reduce(
                                    (
                                        total,
                                        page
                                    ) =>
                                        total +
                                        page.length,
                                    0
                                );


                        return (

                            <div
                                key={
                                    pageIndex
                                }
                                className="
                                    daily-receipt-paper
                                "
                            >


                                {/* ============================================
                                    HEADER
                                ============================================ */}

                                <DailyReceiptHeader
                                    report={
                                        report
                                    }
                                    fundSource={
                                        fundSource
                                    }
                                    user={
                                        user
                                    }
                                    formatDate={
                                        formatDate
                                    }
                                />


                                {/* ============================================
                                    RECEIPTS
                                ============================================ */}

                                <DailyReceipts
                                    items={
                                        pageItems
                                    }
                                    formatAmount={
                                        formatAmount
                                    }
                                    startIndex={
                                        startIndex
                                    }
                                    showGrandTotal={
                                        isLastPage
                                    }
                                    totalReceiptCount={
                                        totalReceiptCount
                                    }
                                    grandTotalOverride={
                                        grandTotal
                                    }
                                />


                                {/* ============================================
                                    SIGNATORIES
                                    LAST PAGE ONLY
                                ============================================ */}

                                {
                                    isLastPage && (

                                        <div className="
                                            daily-receipt-signatories
                                        ">


                                            {/* ================================
                                                PREPARED BY
                                            ================================= */}

                                            <div>

                                                <div className="
                                                    daily-receipt-signature-label
                                                ">

                                                    Prepared by:

                                                </div>


                                                <div className="
                                                    daily-receipt-signature-name
                                                ">

                                                    {
                                                        getFullName(
                                                            user
                                                        )
                                                    }

                                                </div>


                                                <div className="
                                                    daily-receipt-signature-role
                                                ">

                                                    Accountable Officer

                                                </div>

                                            </div>


                                            {/* ================================
                                                NOTED BY
                                            ================================= */}

                                            <div>

                                                <div className="
                                                    daily-receipt-signature-label
                                                ">

                                                    Noted by:

                                                </div>


                                                <div className="
                                                    daily-receipt-signature-name
                                                ">

                                                    IMLYN B. PARAPINA

                                                </div>


                                                <div className="
                                                    daily-receipt-signature-role
                                                ">

                                                    Municipal Treasurer

                                                </div>

                                            </div>

                                        </div>

                                    )
                                }


                                {/* ============================================
                                    FOOTER
                                ============================================ */}

                                <div className="
                                    daily-receipt-footer
                                ">

                                    <span>

                                        Daily Receipt by Fund Source

                                    </span>


                                    <span>

                                        {
                                            report?.report_no ??
                                            "—"
                                        }

                                    </span>

                                </div>


                                {/* ============================================
                                    PAGE NUMBER
                                ============================================ */}

                                <div className="
                                    daily-receipt-page-number
                                ">

                                    Page{" "}
                                    {pageIndex + 1}
                                    {" "}
                                    of{" "}
                                    {pages.length}

                                </div>


                            </div>

                        );
                    }
                )
            }


            {/* ==================================================
                FLOATING PRINT BUTTON
            ================================================== */}

            <button
                type="button"
                onClick={printDailyReceipt}
                className="daily-receipt-floating-print"
                title="Print Daily Receipt"
                aria-label="Print Daily Receipt"
            >
                <span className="daily-receipt-print-icon">
                    🖨
                </span>

                <span>
                    Print
                </span>
            </button>


        </div>
    );
}