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
       RENDER
    ======================================================== */

    return (

        <div className="
            daily-receipt-preview-wrapper
        ">

            <div
                id="
                    daily-receipt-by-fund-source-print-area
                "
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
                    items={rows}
                    formatAmount={formatAmount}
                />


                {/* ==================================================
                    SIGNATORIES
                ================================================== */}

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


                {/* ==================================================
                    FOOTER
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

        </div>

    );
}