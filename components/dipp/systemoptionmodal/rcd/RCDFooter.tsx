"use client";

import {
    RCD,
    RCDUser,
} from "./RCDTypes";

type Props = {
    rcd: RCD;
    user?: RCDUser | null;
    totalCollections: number;

    formatDate: (
        value?: string | null
    ) => string;

    amountToWords: (
        value: number | string
    ) => string;
};

export default function RCDFooter({
    rcd,
    user,
    totalCollections,
    formatDate,
    amountToWords,
}: Props) {
    return (
        <>

            {/* =====================================================
                CERTIFICATION / VERIFICATION
            ====================================================== */}

            <div className="footer-grid">

                {/* =================================================
                    CERTIFICATION
                ================================================== */}

                <div className="footer-box">

                    <div className="footer-title">
                        CERTIFICATION
                    </div>


                    <p>
                        I hereby certify that the foregoing
                        report of collections and deposits.
                        Accountability for accountable form
                        is true and correct.
                    </p>


                    <div className="signature-row">

                        <strong>
                            {user?.full_name ?? "—"}
                        </strong>

                        <strong>
                            {formatDate(
                                rcd.report_date
                            )}
                        </strong>

                    </div>

                </div>


                {/* =================================================
                    VERIFICATION
                ================================================== */}

                <div className="footer-box">

                    <div className="footer-title">
                        VERIFICATION AND ACKNOWLEDGEMENT
                    </div>


                    <p>
                        I hereby certify that the foregoing
                        report of collection has been verified
                        and acknowledged receipt of
                    </p>


                    <div className="amount-words">

                        {amountToWords(
                            totalCollections
                        )}

                    </div>


                    <div className="signature-row">

                        <strong>
                            MARIA CRISTINA B. FORMACION
                        </strong>

                        <strong>
                            {formatDate(
                                rcd.report_date
                            )}
                        </strong>

                    </div>

                </div>

            </div>


            {/* =====================================================
                SYSTEM FOOTER
            ====================================================== */}

            <div className="system-footer">

                System Date :
                {" "}
                {new Date().toLocaleString(
                    "en-US",
                    {
                        month: "2-digit",
                        day: "2-digit",
                        year: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                    }
                )}

                {" / Page 1 of 1"}

            </div>

        </>
    );
}