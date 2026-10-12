"use client";

type Props = {
    report?: any;
    fundSource?: any;
    user?: any;
};

/**
 * Format report dates without shifting date-only values.
 *
 * Supports:
 * - 2026-10-12
 * - 2026-10-12T00:00:00.000Z
 * - 2026-10-11T16:00:00.000Z (Philippine midnight)
 */
function formatDate(value?: string | Date | null): string {
    if (!value) {
        return "—";
    }

    const rawValue = String(value).trim();

    // Date-only strings must never be parsed as UTC timestamps.
    const dateOnlyMatch = rawValue.match(
        /^(\d{4})-(\d{2})-(\d{2})$/
    );

    let year: number;
    let month: number;
    let day: number;

    if (dateOnlyMatch) {
        year = Number(dateOnlyMatch[1]);
        month = Number(dateOnlyMatch[2]);
        day = Number(dateOnlyMatch[3]);
    } else {
        const timestamp = new Date(rawValue);

        if (Number.isNaN(timestamp.getTime())) {
            return rawValue;
        }

        // Interpret timestamps in Philippine time.
        const parts = new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Manila",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        }).formatToParts(timestamp);

        const getPart = (type: string) =>
            parts.find((part) => part.type === type)?.value;

        year = Number(getPart("year"));
        month = Number(getPart("month"));
        day = Number(getPart("day"));
    }

    // Validate the calendar date.
    const date = new Date(year, month - 1, day);

    if (
        Number.isNaN(date.getTime()) ||
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return rawValue;
    }

    return date.toLocaleDateString("en-PH", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
}

export default function AbstractSummaryHeader({
    report,
    fundSource,
}: Props) {
    return (
        <>
            {/* GOVERNMENT HEADER */}
            <div className="abstract-summary-government">
                <div>Republic of the Philippines</div>
                <div>Province of Palawan</div>

                <div className="abstract-summary-municipality">
                    MUNICIPALITY OF TAYTAY
                </div>

                <div className="abstract-summary-office">
                    OFFICE OF THE MUNICIPAL TREASURER
                </div>
            </div>

            {/* HEADER LINE */}
            <div className="abstract-summary-header-line" />

            {/* TITLE */}
            <div className="abstract-summary-title">
                ABSTRACT OF COLLECTIONS
            </div>

            {/* INFORMATION */}
            <div className="abstract-summary-information">
                {/* LEFT COLUMN */}
                <div>
                    <div className="abstract-summary-info-row">
                        <span className="abstract-summary-info-label">
                            Fund Type:
                        </span>

                        <span className="abstract-summary-info-value">
                            {fundSource?.fund_code
                                ? `${fundSource.fund_code} - `
                                : ""}
                            {fundSource?.fund_name ??
                                fundSource?.acronym ??
                                "—"}
                        </span>
                    </div>

                    <div className="abstract-summary-info-row">
                        <span className="abstract-summary-info-label">
                            Accountable Officer:
                        </span>

                        <span className="abstract-summary-info-value">
                            {report?.rcd_by_name ??
                                report?.user?.full_name ??
                                "—"}
                        </span>
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="abstract-summary-info-right-column">
                    <div
                        className="
                            abstract-summary-info-row
                            abstract-summary-info-right
                        "
                    >
                        <span className="abstract-summary-info-label">
                            Date:
                        </span>

                        <span className="abstract-summary-info-value">
                            {formatDate(
                                report?.report_date ??
                                report?.date
                            )}
                        </span>
                    </div>

                    <div
                        className="
                            abstract-summary-info-row
                            abstract-summary-info-right
                        "
                    >
                        <span className="abstract-summary-info-label">
                            Report No:
                        </span>

                        <span className="abstract-summary-info-value">
                            {report?.report_no ?? "—"}
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
}