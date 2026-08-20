"use client";

type Props = {
    report?: any;
    fundSource?: any;
    user?: any;
    formatDate: (
        value?: string | null
    ) => string;
};

export default function AbstractSummaryHeader({
    report,
    fundSource,
    user,
    formatDate,
}: Props) {

    return (
        <>

            {/* =====================================================
                GOVERNMENT HEADER
            ====================================================== */}

            <div className="
                abstract-summary-government
            ">

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


            {/* =====================================================
                HEADER LINE
            ====================================================== */}

            <div className="
                abstract-summary-header-line
            " />


            {/* =====================================================
                TITLE
            ====================================================== */}

            <div className="
                abstract-summary-title
            ">
                ABSTRACT SUMMARY
            </div>


            {/* =====================================================
                INFORMATION
            ====================================================== */}

            <div className="
                abstract-summary-information
            ">

                {/* =================================================
                    LEFT SIDE
                ================================================== */}

                <div>

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
                                user?.full_name ??
                                "—"
                            }

                        </span>

                    </div>

                </div>


                {/* =================================================
                    RIGHT SIDE
                ================================================== */}

                <div>

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