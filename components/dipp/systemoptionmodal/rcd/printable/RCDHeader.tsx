"use client";

type Props = {
    data: any;
};

export default function RCDHeader({
    data,
}: Props) {
    // =========================================================
    // DATA
    // =========================================================

    const filters =
        data?.filters ?? {};

    const fundSource =
        data?.fund_source ??
        data?.fund ??
        null;

    const fundCode =
        fundSource?.fund_code ??
        data?.fund_code ??
        "";

    const fundName =
        fundSource?.fund_name ??
        data?.fund_name ??
        "";

    const fundType =
        fundName && fundCode
            ? `${fundName} (${fundCode})`
            : fundName ||
              fundCode ||
              "";

    // =========================================================
    // ACCOUNTABLE OFFICER
    // =========================================================

    const accountableOfficer =
        data?.user?.full_name ??
        "";

    // =========================================================
    // CURRENT DATE
    // =========================================================

    const currentDate =
        new Date();

    // =========================================================
    // DATE FORMAT
    // =========================================================

    const formatDate = (
        value: any
    ) => {
        if (!value) {
            return "";
        }

        const text =
            String(value);

        const date =
            new Date(
                text.length === 10
                    ? `${text}T00:00:00`
                    : text
            );

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return text;
        }

        return date.toLocaleDateString(
            "en-PH",
            {
                month: "long",
                day: "numeric",
                year: "numeric",
            }
        );
    };

    // Retain filters for future report-period handling.
    void filters;

    return (
        <header className="rcd-header">

            {/* =================================================
                GOVERNMENT HEADER
            ================================================= */}

            <div className="government-header">

                <div>
                    Republic of the Philippines
                </div>

                <div>
                    Province of Palawan
                </div>

                <div className="municipality">
                    MUNICIPALITY OF TAYTAY
                </div>

                <div className="office">
                    OFFICE OF THE MUNICIPAL TREASURER
                </div>

            </div>

            <div className="header-line" />

            {/* =================================================
                REPORT TITLE
            ================================================= */}

            <div className="report-title">
                REPORT OF COLLECTIONS AND DEPOSITS
            </div>

            {/* =================================================
                TOP INFORMATION
            ================================================= */}

            <div className="top-information">

                <div className="top-information-left">

                    <div className="information-row">

                        <span className="information-label">
                            Fund Type:
                        </span>

                        <span className="information-value">
                            {fundType}
                        </span>

                    </div>

                    <div className="information-row">

                        <span className="information-label">
                            Accountable Officer:
                        </span>

                        <span className="information-value">
                            {accountableOfficer}
                        </span>

                    </div>

                </div>

                <div className="top-information-right">

                    <div className="information-row">

                        <span className="information-label">
                            Date:
                        </span>

                        <span className="information-value">
                            {formatDate(
                                currentDate
                            )}
                        </span>

                    </div>

                    <div className="information-row">

                        <span className="information-label">
                            Report No:
                        </span>

                        <span className="information-value report-number">
                        </span>

                    </div>

                </div>

            </div>

        </header>
    );
}