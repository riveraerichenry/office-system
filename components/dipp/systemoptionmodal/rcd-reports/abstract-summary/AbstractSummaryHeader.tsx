"use client";

type Props = {
    report?: any;
    fundSource?: any;
    user?: any;
};



function formatDate(
    value?: string | null
): string {
    if (!value) {
        return "—";
    }

    // Extract YYYY-MM-DD without timezone conversion.
    const dateOnly = String(value).substring(0, 10);
    const parts = dateOnly.split("-");

    if (parts.length !== 3) {
        return String(value);
    }

    const [year, month, day] = parts;

    const yearNumber = Number(year);
    const monthNumber = Number(month);
    const dayNumber = Number(day);

    const date = new Date(
        yearNumber,
        monthNumber - 1,
        dayNumber
    );

    // Validate the date.
    if (
        Number.isNaN(date.getTime()) ||
        date.getFullYear() !== yearNumber ||
        date.getMonth() !== monthNumber - 1 ||
        date.getDate() !== dayNumber
    ) {
        return String(value);
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

            {/* ====================================================
                GOVERNMENT HEADER
            ==================================================== */}

            <div className="abstract-summary-government">

                <div>
                    Republic of the Philippines
                </div>

                <div>
                    Province of Palawan
                </div>

                <div className="
                    abstract-summary-municipality
                ">
                    MUNICIPALITY OF TAYTAY
                </div>

                <div className="
                    abstract-summary-office
                ">
                    OFFICE OF THE MUNICIPAL TREASURER
                </div>

            </div>


            {/* ====================================================
                HEADER LINE
            ==================================================== */}

            <div className="
                abstract-summary-header-line
            " />


            {/* ====================================================
                TITLE
            ==================================================== */}

            <div className="
                abstract-summary-title
            ">
                ABSTRACT OF COLLECTIONS
            </div>


            {/* ====================================================
                INFORMATION
            ==================================================== */}

            <div className="
                abstract-summary-information
            ">


                {/* ==================================================
                    LEFT
                ================================================== */}

                <div>

                    {/* FUND TYPE */}

                    <div className="
                        abstract-summary-info-row
                    ">

                        <span className="
                            abstract-summary-info-label
                        ">
                            Fund Type:
                        </span>

                        <span className="
                            abstract-summary-info-value
                        ">

                            {
                                fundSource?.fund_code
                                    ? `${fundSource.fund_code} - `
                                    : ""
                            }

                            {
                                fundSource?.fund_name ??
                                fundSource?.acronym ??
                                "—"
                            }

                        </span>

                    </div>


                    {/* ACCOUNTABLE OFFICER */}

                    <div className="
                        abstract-summary-info-row
                    ">

                        <span className="
                            abstract-summary-info-label
                        ">
                            Accountable Officer:
                        </span>

                        <span className="
                            abstract-summary-info-value
                        ">

                            {
                                report?.rcd_by_name ??
                                "—"
                            }

                        </span>

                    </div>

                </div>


                {/* ==================================================
                    RIGHT
                ================================================== */}

                <div className="
                    abstract-summary-info-right-column
                ">


                    {/* DATE */}

                    <div className="
                        abstract-summary-info-row
                        abstract-summary-info-right
                    ">

                        <span className="
                            abstract-summary-info-label
                        ">
                            Date:
                        </span>

                        <span className="
                            abstract-summary-info-value
                        ">

                            {
                                formatDate(
                                    report?.report_date ??
                                    report?.date
                                )
                            }

                        </span>

                    </div>


                    {/* REPORT NO */}

                    <div className="
                        abstract-summary-info-row
                        abstract-summary-info-right
                    ">

                        <span className="
                            abstract-summary-info-label
                        ">
                            Report No:
                        </span>

                        <span className="
                            abstract-summary-info-value
                        ">

                            {
                                report?.report_no ??
                                "—"
                            }

                        </span>

                    </div>

                </div>

            </div>

        </>

    );

}