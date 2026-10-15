"use client";

import RCDPreview from "./RCDPreview";

type Props = {
rcd: any;
pairedRCD?: any | null;
};

const RPT_BASIC_ID =
"a30624dd-f490-424a-984d-fe5f5e93277a";

const RPT_SEF_ID =
"2a29a5c5-01d8-4202-8cf9-8a6659865f01";

const RPT_GENERAL_ID =
"87dc32f3-418e-4cab-a024-673321df1ef5";

function getFundSourceId(report: any): string {
return String(
report?.fund_source_id ??
report?.fund_source?.id ??
""
).trim();
}

function getFundSource(report: any) {
return (
report?.fund_source ?? {
id: report?.fund_source_id,
fund_code: report?.fund_code,
fund_name: report?.fund_name,
acronym: report?.acronym,
}
);
}

function isRPTReport(report: any): boolean {
const id = getFundSourceId(report);
const fundSource = getFundSource(report);

const code = String(
    fundSource?.fund_code ??
    report?.fund_code ??
    ""
).trim().toUpperCase();

const name = String(
    fundSource?.fund_name ??
    report?.fund_name ??
    ""
).trim().toUpperCase();

return (
    id === RPT_BASIC_ID ||
    id === RPT_SEF_ID ||
    id === RPT_GENERAL_ID ||
    code === "106" ||
    name.includes("GENERAL RPT")
);

}

function getRPTOrder(report: any): number {
const id = getFundSourceId(report);
const fundSource = getFundSource(report);

const code = String(
    fundSource?.fund_code ??
    report?.fund_code ??
    ""
).trim().toUpperCase();

const name = String(
    fundSource?.fund_name ??
    report?.fund_name ??
    ""
).trim().toUpperCase();

if (
    id === RPT_BASIC_ID ||
    name.includes("BASIC") ||
    code.includes("BASIC")
) {
    return 1;
}

if (
    id === RPT_SEF_ID ||
    name.includes("SEF") ||
    code.includes("SEF")
) {
    return 2;
}

return 3;

}

function PrintButton() {
const handlePrint = () => {
const printAreas = Array.from(
document.querySelectorAll<HTMLElement>(
".rcd-print-area"
)
);

    if (printAreas.length === 0) {
        console.error("No RCD print area found.");
        return;
    }

    const printWindow = window.open(
        "",
        "RCD_PRINT_WINDOW",
        "width=1000,height=1000"
    );

    if (!printWindow) {
        alert(
            "The print window was blocked by your browser. " +
            "Please allow pop-ups for this site and try again."
        );
        return;
    }

    const styles = Array.from(
        document.querySelectorAll(
            'link[rel="stylesheet"], style'
        )
    )
        .map((element) => element.outerHTML)
        .join("\n");

    const reportsHtml = printAreas
        .map(
            (area, index) => `
                <div class="rcd-print-report ${
                    index < printAreas.length - 1
                        ? "rcd-print-report-break"
                        : ""
                }">
                    ${area.outerHTML}
                </div>
            `
        )
        .join("\n");

    printWindow.document.open();

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="UTF-8" />
                <title>RCD Report</title>
                ${styles}

                <style>
                    @page {
                        size: 8.5in 13in;
                        margin: 0;
                    }

                    html,
                    body {
                        margin: 0 !important;
                        padding: 0 !important;
                        width: 8.5in !important;
                        background: #ffffff !important;
                    }

                    body {
                        overflow: visible !important;
                    }

                    .rcd-print-toolbar {
                        display: none !important;
                    }

                    .rcd-print-report {
                        width: 8.5in !important;
                        height: 13in !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        break-inside: avoid !important;
                        page-break-inside: avoid !important;
                    }

                    .rcd-print-report-break {
                        break-after: page !important;
                        page-break-after: always !important;
                    }

                    .rcd-print-area {
                        width: 8.5in !important;
                        height: 13in !important;
                        min-width: 8.5in !important;
                        min-height: 13in !important;
                        max-width: 8.5in !important;
                        max-height: 13in !important;
                        margin: 0 !important;
                        box-sizing: border-box !important;
                        background: #ffffff !important;
                        box-shadow: none !important;
                        overflow: hidden !important;
                        display: flex !important;
                        flex-direction: column !important;
                        position: relative !important;
                        transform: none !important;
                        zoom: 1 !important;
                    }
                </style>
            </head>

            <body>
                ${reportsHtml}
            </body>
        </html>
    `);

    printWindow.document.close();

    window.setTimeout(() => {
        printWindow.focus();
        printWindow.print();
    }, 700);
};

return (
    <div className="rcd-print-toolbar">
        <button
            type="button"
            onClick={handlePrint}
            className="rcd-print-button"
            aria-label="Print RCD report"
        >
            <span aria-hidden="true">🖨</span>
            Print RCD
        </button>
    </div>
);

}

function SingleRCDPreview({
report,
}: {
report: any;
}) {
const fundSource = getFundSource(report);

return (
    <RCDPreview
        rcd={report}
        items={report?.items ?? []}
        fundSource={fundSource}
        user={report?.user ?? null}
        previousFormRows={
            report?.previousFormRows ?? []
        }
    />
);

}

export default function RCDReport({
rcd,
pairedRCD = null,
}: Props) {
if (!rcd) {
return (
<div className="flex min-h-[500px] items-center justify-center text-sm text-gray-400">
Select an RCD from the list.
</div>
);
}

/*
============================================================
NORMAL RCD
============================================================

Non-RPT reports continue to display one report.
*/

const isRPT = isRPTReport(rcd);

if (!isRPT) {
    return (
        <>
            <PrintButton />
            <SingleRCDPreview report={rcd} />
        </>
    );
}

/*
============================================================
RPT REPORTS
============================================================

Use the actual saved BASIC and SEF reports.
Do not divide amounts again in the UI.
*/

const reports = [
    rcd,
    ...(pairedRCD && pairedRCD.id !== rcd.id
        ? [pairedRCD]
        : []),
];

/*
============================================================
ORDER BASIC BEFORE SEF
============================================================
*/

const orderedReports = [...reports].sort(
    (a, b) => {
        const orderDifference =
            getRPTOrder(a) - getRPTOrder(b);

        if (orderDifference !== 0) {
            return orderDifference;
        }

        return String(a.report_no ?? "").localeCompare(
            String(b.report_no ?? ""),
            undefined,
            { numeric: true }
        );
    }
);

/*
============================================================
AVOID DUPLICATE REPORTS
============================================================
*/

const uniqueReports = orderedReports.filter(
    (report, index, allReports) =>
        allReports.findIndex(
            (candidate) =>
                candidate.id === report.id
        ) === index
);

return (
    <>
        <PrintButton />

        <div className="flex w-full flex-col items-center gap-6">
            {uniqueReports.map(
                (report, index) => (
                    <div
                        key={report.id ?? index}
                        className="w-full"
                    >
                        {index > 0 && (
                            <div
                                className="mb-6 border-t-2 border-dashed border-gray-300 pt-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-500 print:hidden"
                                aria-hidden="true"
                            >
                                Next printed page
                            </div>
                        )}

                        <SingleRCDPreview
                            report={report}
                        />
                    </div>
                )
            )}

            {!pairedRCD && (
                <div className="w-full rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 print:hidden">
                    Only one saved RPT report was loaded.
                    The paired BASIC or SEF report was not
                    provided by the modal or API. No amounts
                    have been split or recalculated.
                </div>
            )}
        </div>
    </>
);

}