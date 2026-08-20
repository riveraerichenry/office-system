"use client";

import {
    RCD,
    RCDFundSource,
    RCDUser,
} from "./RCDTypes";

type Props = {
    rcd: RCD;
    fundSource?: RCDFundSource | null;
    user?: RCDUser | null;
    formatDate: (
        value?: string | null
    ) => string;
};

export default function RCDHeader({
    rcd,
    fundSource,
    user,
    formatDate,
}: Props) {
    return (
        <>
            {/* =====================================================
                GOVERNMENT HEADER
            ====================================================== */}

            <div className="rcd-government">

                <div>
                    Republic of the Philippines
                </div>

                <div>
                    Province of Palawan
                </div>

                <div className="rcd-municipality">
                    MUNICIPALITY OF TAYTAY
                </div>

                <div className="rcd-office">
                    OFFICE OF THE MUNICIPAL TREASURER
                </div>

            </div>


            <div className="rcd-header-line" />


            <div className="rcd-title">
                REPORT OF COLLECTIONS AND DEPOSITS
            </div>


            {/* =====================================================
                RCD INFORMATION
            ====================================================== */}

            <div className="rcd-information">

                {/* =================================================
                    LEFT
                ================================================== */}

                <div>

                    <div className="rcd-info-row">

                        <span className="rcd-label">
                            Fund Type:
                        </span>

                        <span className="rcd-value">

                            <h1>

                                {fundSource?.fund_code
                                    ? `${fundSource.fund_code} - `
                                    : ""}

                                {fundSource?.fund_name ??
                                    fundSource?.acronym ??
                                    "—"}

                            </h1>

                        </span>

                    </div>


                    <div className="rcd-info-row">

                        <span className="rcd-label">
                            Accountable Officer:
                        </span>

                        <span className="rcd-value">

                            {user?.full_name ?? "—"}

                        </span>

                    </div>

                </div>


                {/* =================================================
                    RIGHT
                ================================================== */}

                <div>

                    <div className="rcd-info-row rcd-right">

                        <span className="rcd-label">
                            Date:
                        </span>

                        <span className="rcd-value">

                            {formatDate(
                                rcd.report_date
                            )}

                        </span>

                    </div>


                    <div className="rcd-info-row rcd-right">

                        <span className="rcd-label">
                            Report No:
                        </span>

                        <span className="rcd-value">

                            {rcd.report_no ?? "—"}

                        </span>

                    </div>

                </div>

            </div>

        </>
    );
}