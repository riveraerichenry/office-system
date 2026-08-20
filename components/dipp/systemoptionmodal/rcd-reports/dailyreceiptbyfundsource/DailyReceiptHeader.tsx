"use client";

type Props = {
    report?: any;
    fundSource?: any;
    user?: any;
    formatDate: (
        value?: string | null
    ) => string;
};

export default function DailyReceiptHeader({
    report,
    fundSource,
    user,
    formatDate,
}: Props) {

    return (
        <>

            <div className="daily-receipt-government">

                <div>
                    Republic of the Philippines
                </div>

                <div>
                    Province of Palawan
                </div>

                <div className="daily-receipt-municipality">
                    MUNICIPALITY OF TAYTAY
                </div>

                <div className="daily-receipt-office">
                    OFFICE OF THE MUNICIPAL TREASURER
                </div>

            </div>


            <div className="daily-receipt-header-line" />


            <div className="daily-receipt-title">
                DAILY RECEIPT BY FUND SOURCE
            </div>


            <div className="daily-receipt-information">

                {/* LEFT */}

                <div>

                    <div className="daily-receipt-info-row">

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


                    <div className="daily-receipt-info-row">

                        <span className="
                            daily-receipt-info-label
                        ">
                            Accountable Officer:
                        </span>

                        <span className="
                            daily-receipt-info-value
                        ">
                            {
                                user?.full_name ??
                                "—"
                            }
                        </span>

                    </div>

                </div>


                {/* RIGHT */}

                <div>

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