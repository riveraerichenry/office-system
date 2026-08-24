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


export default function AbstractSummaryHeader({
    report,
    fundSource,
}: Props) {

    return (
        <>

            {/* ====================================================
                GOVERNMENT HEADER
            ==================================================== */}

            <div className="daily-receipt-government">

                <div>
                    Republic of the Philippines
                </div>

                <div>
                    Province of Palawan
                </div>

                <div className="
                    daily-receipt-municipality
                ">
                    MUNICIPALITY OF TAYTAY
                </div>

                <div className="
                    daily-receipt-office
                ">
                    OFFICE OF THE MUNICIPAL TREASURER
                </div>

            </div>


            {/* ====================================================
                HEADER LINE
            ==================================================== */}

            <div className="
                daily-receipt-header-line
            " />


            {/* ====================================================
                TITLE
            ==================================================== */}

            <div className="
                daily-receipt-title
            ">
                ABSTRACT OF COLLECTIONS
            </div>


            {/* ====================================================
                INFORMATION
            ==================================================== */}

            <div className="
                daily-receipt-information
            ">


                {/* ==================================================
                    LEFT
                ================================================== */}

                <div>

                    {/* FUND TYPE */}

                    <div className="
                        daily-receipt-info-row
                    ">

                        <span className="
                            daily-receipt-info-label
                        ">
                            Fund Type:
                        </span>

                        <span className="
                            daily-receipt-info-value
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
                        daily-receipt-info-row
                    ">

                        <span className="
                            daily-receipt-info-label
                        ">
                            Accountable Officer:
                        </span>

                        <span className="
                            daily-receipt-info-value
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

                <div>


                    {/* DATE */}

                    <div className="
                        daily-receipt-info-row
                        daily-receipt-info-right
                    ">

                        <span className="
                            daily-receipt-info-label
                        ">
                            Date:
                        </span>

                        <span className="
                            daily-receipt-info-value
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
                        daily-receipt-info-row
                        daily-receipt-info-right
                    ">

                        <span className="
                            daily-receipt-info-label
                        ">
                            Report No:
                        </span>

                        <span className="
                            daily-receipt-info-value
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