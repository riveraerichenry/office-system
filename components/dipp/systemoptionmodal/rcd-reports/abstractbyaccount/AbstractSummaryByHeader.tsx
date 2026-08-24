"use client";

type Props = {
    report?: any;
    fundSource?: any;
    user?: any;

    formatDate: (
        value?: string | null
    ) => string;
};


export default function AbstractSummaryByHeader({
    report,
    fundSource,
    user,
    formatDate,
}: Props) {

    /*
    |--------------------------------------------------------------------------
    | FUND SOURCE
    |--------------------------------------------------------------------------
    */

    const fundType = [
        fundSource?.fund_code,
        fundSource?.fund_name ??
            fundSource?.acronym,
    ]
        .filter(Boolean)
        .join(" - ");


    /*
    |--------------------------------------------------------------------------
    | ACCOUNTABLE OFFICER
    |--------------------------------------------------------------------------
    */

    const accountableOfficer =
        user?.full_name ??
        user?.name ??
        (
            [
                user?.first_name,
                user?.middle_name,
                user?.last_name,
                user?.suffix,
            ]
                .filter(Boolean)
                .join(" ")
        ) ??
        "—";


    /*
    |--------------------------------------------------------------------------
    | REPORT DATE
    |--------------------------------------------------------------------------
    */

    const reportDate =
        report?.report_date ??
        report?.date ??
        null;


    /*
    |--------------------------------------------------------------------------
    | REPORT NUMBER
    |--------------------------------------------------------------------------
    */

    const reportNo =
        report?.report_no ??
        "—";


    return (
        <>

            {/* =========================================================
                GOVERNMENT HEADER
            ========================================================= */}

            <div className="abstract-by-summary-government">

                <div>
                    Republic of the Philippines
                </div>

                <div>
                    Province of Palawan
                </div>

                <div className="abstract-by-summary-municipality">
                    MUNICIPALITY OF TAYTAY
                </div>

                <div className="abstract-by-summary-office">
                    OFFICE OF THE MUNICIPAL TREASURER
                </div>

            </div>


            {/* =========================================================
                HEADER LINE
            ========================================================= */}

            <div className="abstract-by-summary-header-line" />


            {/* =========================================================
                TITLE
            ========================================================= */}

            <div className="abstract-by-summary-title">
                ABSTRACT OF COLLECTIONS
            </div>


            {/* =========================================================
                INFORMATION
            ========================================================= */}

            <div className="abstract-by-summary-information">


                {/* =====================================================
                    LEFT
                ===================================================== */}

                <div>


                    {/* FUND TYPE */}

                    <div className="abstract-by-summary-info-row">

                        <span className="
                            abstract-by-summary-info-label
                        ">
                            Fund Type:
                        </span>


                        <span className="
                            abstract-by-summary-info-value
                        ">

                            {
                                fundType ||
                                "—"
                            }

                        </span>

                    </div>


                    {/* ACCOUNTABLE OFFICER */}

                    <div className="abstract-by-summary-info-row">

                        <span className="
                            abstract-by-summary-info-label
                        ">
                            Accountable Officer:
                        </span>


                        <span className="
                            abstract-by-summary-info-value
                        ">

                            {
                                accountableOfficer
                            }

                        </span>

                    </div>


                </div>


                {/* =====================================================
                    RIGHT
                ===================================================== */}
                <div className="abstract-by-summary-info-right-column">

                    {/* DATE */}

                    <div className="
                        abstract-by-summary-info-row
                        abstract-by-summary-info-right
                    ">

                        <span className="
                            abstract-by-summary-info-label
                        ">
                            Date:
                        </span>

                        <span className="
                            abstract-by-summary-info-value
                        ">
                            {
                                formatDate(
                                    reportDate
                                )
                            }
                        </span>

                    </div>


                    {/* REPORT NO */}

                    <div className="
                        abstract-by-summary-info-row
                        abstract-by-summary-info-right
                    ">

                        <span className="
                            abstract-by-summary-info-label
                        ">
                            Report No:
                        </span>

                        <span className="
                            abstract-by-summary-info-value
                        ">
                            {
                                reportNo
                            }
                        </span>

                    </div>

                </div>


            </div>

        </>
    );
}