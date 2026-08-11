"use client";

type Props = {
    data: any;
    accountableOfficer: string;
};

export default function RCDFooter({
    data,
    accountableOfficer,
}: Props) {
    const currentDate =
        new Date();

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

    const verifiedBy =
        data?.verified_by
            ?.full_name ??
        data?.verified_by
            ?.name ??
        "";

    return (
        <footer className="rcd-footer">

            {/* =================================================
                CERTIFICATION / VERIFICATION
            ================================================= */}

            <div className="certification-section">

                {/* =============================================
                    CERTIFICATION
                ============================================= */}

                <div className="certification-box">

                    <div className="certification-title">
                        CERTIFICATION
                    </div>

                    <div className="certification-text">

                        I hereby certify that the
                        foregoing report of collections
                        and deposits, accountability for
                        accountable forms is true and
                        correct.

                    </div>

                    <div className="certification-signature">

                        <div className="signature-line">
                            {accountableOfficer}
                        </div>

                        <div className="signature-caption">
                            Accountable Officer
                        </div>

                    </div>

                    <div className="certification-date">

                        {formatDate(
                            currentDate
                        )}

                    </div>

                </div>

                {/* =============================================
                    VERIFICATION
                ============================================= */}

                <div className="verification-box">

                    <div className="verification-title">
                        VERIFICATION AND ACKNOWLEDGEMENT
                    </div>

                    <div className="verification-text">

                        I hereby certify that the
                        foregoing report of collection
                        has been verified and acknowledged
                        receipt of the amount shown herein.

                    </div>

                    <div className="verification-signature">

                        <div className="signature-line">
                            {verifiedBy}
                        </div>

                        <div className="signature-caption">
                            Municipal Treasurer
                        </div>

                    </div>

                    <div className="verification-date">

                        {formatDate(
                            currentDate
                        )}

                    </div>

                </div>

            </div>

            {/* =================================================
                SYSTEM FOOTER
            ================================================= */}

            <div className="system-footer">

                <span>
                    System Date:{" "}
                    {formatDate(
                        currentDate
                    )}
                </span>

                <span>
                    Page 1 of 1
                </span>

            </div>

        </footer>
    );
}