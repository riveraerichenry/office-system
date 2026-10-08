"use client";

import "./CTCPrint.css";

type Props = {
    transaction: any;
};

export default function CTCPrint({
    transaction,
}: Props) {

    /* =====================================================
       CTC DATA
    ===================================================== */

    const ctc =
        transaction?.ctc ??
        transaction ??
        {};


    /* =====================================================
       FORMAT DATE
       MM/DD/YY
    ===================================================== */

    const formatDate = (
        value: any
    ) => {

        if (!value) {
            return "";
        }

        const date =
            new Date(value);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "";
        }

        return date.toLocaleDateString(
            "en-US",
            {
                month: "2-digit",
                day: "2-digit",
                year: "2-digit",
            }
        );
    };


    /* =====================================================
       FORMAT AMOUNT
    ===================================================== */

    const formatAmount = (
        value: any
    ) => {

        const amount =
            Number(value ?? 0);

        if (
            !Number.isFinite(amount)
        ) {
            return "0.00";
        }

        return amount.toLocaleString(
            "en-PH",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }
        );
    };


    /* =====================================================
       FORMAT FULL NAME

       ALWAYS DISPLAY:

       SURNAME, FIRSTNAME MIDDLE

       Supported input:

       FIRSTNAME MIDDLE SURNAME
       ->
       SURNAME, FIRSTNAME MIDDLE

       OR

       SURNAME, FIRSTNAME MIDDLE
       ->
       SURNAME, FIRSTNAME MIDDLE
    ===================================================== */

    const formatFullName = (
        fullName: string
    ) => {

        if (!fullName) {
            return "";
        }

        const cleaned =
            String(fullName)
                .replace(/\s+/g, " ")
                .trim();

        if (!cleaned) {
            return "";
        }


        /*
         * Already surname-first
         *
         * CALINGA, JOHN MARK P.
         *
         * Keep as:
         *
         * CALINGA, JOHN MARK P.
         */

        if (cleaned.includes(",")) {

            const commaIndex =
                cleaned.indexOf(",");

            const surname =
                cleaned
                    .substring(
                        0,
                        commaIndex
                    )
                    .trim();

            const firstMiddle =
                cleaned
                    .substring(
                        commaIndex + 1
                    )
                    .trim()
                    .replace(
                        /\s+/g,
                        " "
                    );

            if (!surname) {
                return firstMiddle;
            }

            if (!firstMiddle) {
                return surname;
            }

            return `${surname}, ${firstMiddle}`;
        }


        /*
         * Encoder entered:
         *
         * JOHN MARK P. CALINGA
         *
         * Convert to:
         *
         * CALINGA, JOHN MARK P.
         */

        const parts =
            cleaned.split(" ");


        /*
         * Only one name
         */

        if (parts.length === 1) {
            return parts[0];
        }


        /*
         * Last word is treated
         * as surname.
         */

        const surname =
            parts[
                parts.length - 1
            ];


        /*
         * Everything before surname
         * becomes first name + middle name.
         */

        const firstMiddle =
            parts
                .slice(0, -1)
                .join(" ")
                .trim();


        if (!firstMiddle) {
            return surname;
        }


        return `${surname}, ${firstMiddle}`;
    };


    /* =====================================================
       AMOUNT TO WORDS
    ===================================================== */

    const amountToWords = (
        value: number
    ) => {

        const numericValue =
            Number(value ?? 0);

        const number =
            Math.floor(
                numericValue
            );

        const centavos =
            Math.round(
                (
                    numericValue -
                    Math.floor(
                        numericValue
                    )
                ) * 100
            );


        const ones = [
            "ZERO",
            "ONE",
            "TWO",
            "THREE",
            "FOUR",
            "FIVE",
            "SIX",
            "SEVEN",
            "EIGHT",
            "NINE",
            "TEN",
            "ELEVEN",
            "TWELVE",
            "THIRTEEN",
            "FOURTEEN",
            "FIFTEEN",
            "SIXTEEN",
            "SEVENTEEN",
            "EIGHTEEN",
            "NINETEEN",
        ];


        const tens = [
            "",
            "",
            "TWENTY",
            "THIRTY",
            "FORTY",
            "FIFTY",
            "SIXTY",
            "SEVENTY",
            "EIGHTY",
            "NINETY",
        ];


        const convertBelowThousand = (
            num: number
        ): string => {

            if (num === 0) {
                return "";
            }

            if (num < 20) {
                return ones[num];
            }

            if (num < 100) {

                return (
                    tens[
                        Math.floor(
                            num / 10
                        )
                    ] +
                    (
                        num % 10 !== 0
                            ? ` ${
                                ones[
                                    num % 10
                                ]
                            }`
                            : ""
                    )
                );
            }


            return (
                `${ones[
                    Math.floor(
                        num / 100
                    )
                ]} HUNDRED` +
                (
                    num % 100 !== 0
                        ? ` ${
                            convertBelowThousand(
                                num % 100
                            )
                        }`
                        : ""
                )
            );
        };


        const convertNumber = (
            num: number
        ): string => {

            if (num === 0) {
                return "ZERO";
            }

            const parts: string[] = [];


            const millions =
                Math.floor(
                    num / 1000000
                );


            const thousands =
                Math.floor(
                    (
                        num % 1000000
                    ) / 1000
                );


            const remainder =
                num % 1000;


            if (millions > 0) {

                parts.push(
                    `${
                        convertBelowThousand(
                            millions
                        )
                    } MILLION`
                );
            }


            if (thousands > 0) {

                parts.push(
                    `${
                        convertBelowThousand(
                            thousands
                        )
                    } THOUSAND`
                );
            }


            if (remainder > 0) {

                parts.push(
                    convertBelowThousand(
                        remainder
                    )
                );
            }


            return parts.join(" ");
        };


        const pesoWords =
            convertNumber(number);


        return (
            `${pesoWords} PESOS` +
            (
                centavos > 0
                    ? ` AND ${
                        convertNumber(
                            centavos
                        )
                    } CENTAVOS`
                    : ""
            ) +
            " ONLY"
        );
    };


    /* =====================================================
       RECEIPT DATE
    ===================================================== */

    const receiptDate =
        transaction?.receipt_date ??
        ctc?.issue_date ??
        transaction?.created_at ??
        null;


    const formattedDate =
        formatDate(
            receiptDate
        );


    /* =====================================================
       COLLECTOR
    ===================================================== */

    const collector =
        transaction?.collector ??
        transaction?.collector_name ??
        "";


    /* =====================================================
       VALUES
    ===================================================== */

    const fullName =
        ctc?.full_name ??
        transaction?.payor ??
        "";


    const address =
        ctc?.address ??
        "";


    const tin =
        ctc?.tin ??
        "";


    const citizenship =
        ctc?.citizenship ??
        "";


    const placeOfBirth =
        ctc?.place_of_birth ??
        "";


    const birthDate =
        ctc?.birth_date
            ? formatDate(
                ctc.birth_date
            )
            : "";


    const civilStatus =
        ctc?.civil_status ??
        "";


    const occupation =
        ctc?.occupation ??
        "";


    const sex =
        ctc?.sex ??
        "";


    const height =
        ctc?.height ??
        "";


    const weight =
        ctc?.weight ??
        "";


    const placeIssued =
        ctc?.place_issued ??
        "";


    const issueDate =
        ctc?.issue_date
            ? formatDate(
                ctc.issue_date
            )
            : formattedDate;


    const orNumber =
        transaction?.or_number ??
        "";


    const basicTax =
        Number(
            ctc?.basic_tax ?? 0
        );


    const salaryTax =
        Number(
            ctc?.salary_tax ?? 0
        );


    const additionalTax =
        Number(
            ctc?.additional_tax ?? 0
        );


    const penalty =
        Number(
            ctc?.penalty ?? 0
        );


    const interest =
        Number(
            ctc?.interest ?? 0
        );


    const totalAmount =
        Number(
            ctc?.total_amount ??
            transaction?.grand_total ??
            0
        );


    const taxableAmount =
        Number(
            ctc?.taxable_amount ?? 0
        );


    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <div className="ctc-print">

            {/* =================================================
                CTC HEADER
            ================================================= */}

            <div className="ctc-header">

                <div className="ctc-header-left">

                    <div className="ctc-republic">
                        REPUBLIC OF THE PHILIPPINES
                    </div>

                    <div className="ctc-province">
                        PROVINCE OF PALAWAN
                    </div>

                    <div className="ctc-municipality">
                        MUNICIPALITY OF TAYTAY
                    </div>

                </div>


                <div className="ctc-title">

                    <div className="ctc-title-main">
                        COMMUNITY TAX CERTIFICATE
                    </div>

                    <div className="ctc-title-sub">
                        INDIVIDUAL
                    </div>

                </div>


                <div className="ctc-header-right">

                    <div>
                        CTC No.
                    </div>

                    <strong>
                        {orNumber}
                    </strong>

                </div>

            </div>


            {/* =================================================
                NAME / ADDRESS
            ================================================= */}

            <div className="ctc-section">

                <div className="ctc-row">

                    <div className="ctc-label">
                        NAME:
                    </div>

                    <div className="ctc-name">
                        {formatFullName(
                            fullName
                        )}
                    </div>

                </div>


                <div className="ctc-row">

                    <div className="ctc-label">
                        ADDRESS:
                    </div>

                    <div className="ctc-value">
                        {address}
                    </div>

                </div>

            </div>


            {/* =================================================
                PERSONAL INFORMATION
            ================================================= */}

            <div className="ctc-section">

                <div className="ctc-grid">

                    <div className="ctc-field">

                        <span className="ctc-label">
                            TIN:
                        </span>

                        <span className="ctc-value">
                            {tin}
                        </span>

                    </div>


                    <div className="ctc-field">

                        <span className="ctc-label">
                            CITIZENSHIP:
                        </span>

                        <span className="ctc-value">
                            {citizenship}
                        </span>

                    </div>


                    <div className="ctc-field">

                        <span className="ctc-label">
                            SEX:
                        </span>

                        <span className="ctc-value">
                            {sex}
                        </span>

                    </div>


                    <div className="ctc-field">

                        <span className="ctc-label">
                            HEIGHT:
                        </span>

                        <span className="ctc-value">
                            {height}
                        </span>

                    </div>


                    <div className="ctc-field">

                        <span className="ctc-label">
                            WEIGHT:
                        </span>

                        <span className="ctc-value">
                            {weight}
                        </span>

                    </div>


                    <div className="ctc-field">

                        <span className="ctc-label">
                            PLACE OF BIRTH:
                        </span>

                        <span className="ctc-value">
                            {placeOfBirth}
                        </span>

                    </div>


                    <div className="ctc-field">

                        <span className="ctc-label">
                            DATE OF BIRTH:
                        </span>

                        <span className="ctc-value">
                            {birthDate}
                        </span>

                    </div>


                    <div className="ctc-field">

                        <span className="ctc-label">
                            CIVIL STATUS:
                        </span>

                        <span className="ctc-value">
                            {civilStatus}
                        </span>

                    </div>


                    <div className="ctc-field">

                        <span className="ctc-label">
                            PROFESSION/OCCUPATION:
                        </span>

                        <span className="ctc-value">
                            {occupation}
                        </span>

                    </div>

                </div>

            </div>


            {/* =================================================
                TAX COMPUTATION
            ================================================= */}

            <div className="ctc-section">

                <div className="ctc-section-title">
                    TAXABLE INCOME
                </div>


                <div className="ctc-tax-row">

                    <div>
                        BASIC COMMUNITY TAX
                    </div>

                    <div>
                        ₱ {formatAmount(
                            basicTax
                        )}
                    </div>

                </div>


                <div className="ctc-tax-row">

                    <div>
                        ADDITIONAL COMMUNITY TAX
                    </div>

                    <div>
                        ₱ {formatAmount(
                            additionalTax
                        )}
                    </div>

                </div>


                <div className="ctc-tax-row">

                    <div>
                        SALARY / INCOME TAX
                    </div>

                    <div>
                        ₱ {formatAmount(
                            salaryTax
                        )}
                    </div>

                </div>


                <div className="ctc-tax-row">

                    <div>
                        PENALTY
                    </div>

                    <div>
                        ₱ {formatAmount(
                            penalty
                        )}
                    </div>

                </div>


                <div className="ctc-tax-row">

                    <div>
                        INTEREST
                    </div>

                    <div>
                        ₱ {formatAmount(
                            interest
                        )}
                    </div>

                </div>


                <div className="ctc-total-row">

                    <div>
                        TOTAL
                    </div>

                    <div>
                        ₱ {formatAmount(
                            totalAmount
                        )}
                    </div>

                </div>

            </div>


            {/* =================================================
                AMOUNT IN WORDS
            ================================================= */}

            <div className="ctc-section">

                <div className="ctc-label">
                    AMOUNT IN WORDS:
                </div>

                <div className="ctc-amount-words">
                    {amountToWords(
                        totalAmount
                    )}
                </div>

            </div>


            {/* =================================================
                ISSUANCE INFORMATION
            ================================================= */}

            <div className="ctc-section">

                <div className="ctc-grid">

                    <div className="ctc-field">

                        <span className="ctc-label">
                            DATE ISSUED:
                        </span>

                        <span className="ctc-value">
                            {issueDate}
                        </span>

                    </div>


                    <div className="ctc-field">

                        <span className="ctc-label">
                            PLACE ISSUED:
                        </span>

                        <span className="ctc-value">
                            {placeIssued}
                        </span>

                    </div>


                    <div className="ctc-field">

                        <span className="ctc-label">
                            RECEIPT DATE:
                        </span>

                        <span className="ctc-value">
                            {formattedDate}
                        </span>

                    </div>

                </div>

            </div>


            {/* =================================================
                SIGNATURE
            ================================================= */}

            <div className="ctc-signature-section">

                <div className="ctc-signature-box">

                    <div className="ctc-signature-line">
                        ______________________________
                    </div>

                    <div className="ctc-signature-label">
                        TAXPAYER / REPRESENTATIVE
                    </div>

                </div>


                <div className="ctc-signature-box">

                    <div className="ctc-signature-line">
                        {collector || "______________________________"}
                    </div>

                    <div className="ctc-signature-label">
                        COLLECTOR
                    </div>

                </div>

            </div>


            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="ctc-footer">

                <div>
                    THIS CERTIFICATE IS VALID UNTIL
                    DECEMBER 31 OF THE CURRENT YEAR.
                </div>

                <div>
                    OR NO.: {orNumber}
                </div>

            </div>

        </div>
    );
}