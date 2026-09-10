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


    /* ========================================================
       PAGINATION

       Keep the existing Folio layout.
       Only split the receipt rows into pages.
    ======================================================== */

    const RECEIPTS_PER_PAGE = 24;

    const pages: any[][] = [];

    for (
        let i = 0;
        i < rows.length;
        i += RECEIPTS_PER_PAGE
    ) {

        pages.push(
            rows.slice(
                i,
                i + RECEIPTS_PER_PAGE
            )
        );

    }


    /*
       Always render at least one page,
       even when there are no records.
    */
    if (pages.length === 0) {
        pages.push([]);
    }


    /* ========================================================
       GRAND TOTAL

       This is calculated from ALL records,
       not just the current page.
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
                        item?.amount ?? 0
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

            {
                pages.map(
                    (
                        pageItems,
                        pageIndex
                    ) => {

                        const isLastPage =
                            pageIndex ===
                            pages.length - 1;

                        const startIndex =
                            pageIndex *
                            RECEIPTS_PER_PAGE;


                        return (

                            <div
                                key={pageIndex}
                                className="
                                    daily-receipt-paper
                                "
                            >

                                {/* ==================================================
                                    HEADER
                                ================================================== */}

                                <DailyReceiptHeader
                                    report={report}
                                    fundSource={fundSource}
                                    user={user}
                                    formatDate={formatDate}
                                />


                                {/* ==================================================
                                    DAILY RECEIPTS TABLE
                                ================================================== */}

                                <DailyReceipts
                                    items={pageItems}
                                    formatAmount={formatAmount}
                                    startIndex={startIndex}
                                    showGrandTotal={isLastPage}
                                    totalReceiptCount={
                                        totalReceiptCount
                                    }
                                    grandTotalOverride={
                                        grandTotal
                                    }
                                />


                                {/* ==================================================
                                    SIGNATORIES

                                    ONLY ON LAST PAGE
                                ================================================== */}

                                {
                                    isLastPage && (

                                        <div className="
                                            daily-receipt-signatories
                                        ">

                                            {/* ==================================================
                                                LEFT - PREPARED BY
                                            ================================================== */}

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


                                            {/* ==================================================
                                                RIGHT - NOTED BY
                                            ================================================== */}

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


                                {/* ==================================================
                                    FOOTER

                                    Keep footer on EVERY PAGE
                                ================================================== */}

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

                            </div>

                        );

                    }
                )
            }

        </div>

    );
}