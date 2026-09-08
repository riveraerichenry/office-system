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
    ===================================================== */

    const formatDate = (
        value: any
    ) => {

        if (!value) {

            return "";

        }


        const date =
            new Date(
                value
            );


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "";

        }


        return date
            .toLocaleDateString(
                "en-PH",
                {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                }
            )
            .toUpperCase();

    };


    /* =====================================================
       FORMAT AMOUNT
    ===================================================== */

    const formatAmount = (
        value: any
    ) => {

        const amount =
            Number(
                value ?? 0
            );


        if (
            !Number.isFinite(
                amount
            )
        ) {

            return "0.00";

        }


        return amount
            .toLocaleString(
                "en-PH",
                {
                    minimumFractionDigits:
                        2,

                    maximumFractionDigits:
                        2,
                }
            );

    };


    /* =====================================================
       RECEIPT DATE
    ===================================================== */

    const receiptDate =
        ctc?.issue_date ??
        transaction?.receipt_date;


    /* =====================================================
       TAX VALUES
    ===================================================== */

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


    const taxableAmount =
        Number(
            ctc?.taxable_amount ?? 0
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



        /* =====================================================
       FORMAT FULL NAME

       INPUT:
       FIRST MIDDLE LAST

       OUTPUT:
       LAST, FIRST MIDDLE
    ===================================================== */

    const formatFullName = (
        fullName: string
    ) => {

        if (!fullName) {

            return "";

        }


        /*
         * Remove extra spaces
         */

        const parts =
            fullName
                .trim()
                .split(
                    /\s+/
                );


        /*
         * Only one name
         */

        if (
            parts.length === 1
        ) {

            return parts[0];

        }


        /*
         * FIRST NAME
         */

        const firstName =
            parts[0];


        /*
         * LAST NAME
         *
         * Currently assumes that the
         * last word is the last name.
         */

        const lastName =
            parts[
                parts.length - 1
            ];


        /*
         * MIDDLE NAME / MIDDLE NAMES
         */

        const middleName =
            parts
                .slice(
                    1,
                    -1
                )
                .join(
                    " "
                );


        /*
         * OUTPUT:
         *
         * LAST, FIRST MIDDLE
         */

        return middleName

            ? `${lastName}, ${firstName} ${middleName}`

            : `${lastName}, ${firstName}`;

    };


    return (

        <div
            className="ctc-print-page"
            style={{

                /*
                 * =====================================================
                 * GLOBAL FONT CONTROL
                 * =====================================================
                 *
                 * You can change the default font here.
                 */

                "--ctc-font-family":
                    "Arial, sans-serif",


                /*
                 * =====================================================
                 * YEAR
                 * =====================================================
                 */

                "--ctc-year-x":
                    "10px",

                "--ctc-year-y":
                    "70px",

                "--ctc-year-font-size":
                    "16px",

                "--ctc-year-font-weight":
                    "600",


                /*
                 * =====================================================
                 * PLACE OF ISSUE
                 * =====================================================
                 */

                "--ctc-place-issued-x":
                    "78px",

                "--ctc-place-issued-y":
                    "70px",

                "--ctc-place-issued-font-size":
                    "14px",

                "--ctc-place-issued-font-weight":
                    "600",


                /*
                 * =====================================================
                 * DATE ISSUED
                 * =====================================================
                 */

                "--ctc-date-issued-x":
                    "200px",

                "--ctc-date-issued-y":
                    "70px",

                "--ctc-date-issued-font-size":
                    "14px",

                "--ctc-date-issued-font-weight":
                    "600",


                /*
                 * =====================================================
                 * FULL NAME
                 * =====================================================
                 */

                "--ctc-name-x":
                    "30px",

                "--ctc-name-y":
                    "95px",

                "--ctc-name-font-size":
                    "14px",

                "--ctc-name-font-weight":
                    "700",


                /*
                 * =====================================================
                 * ADDRESS
                 * =====================================================
                 */

                "--ctc-address-x":
                    "25px",

                "--ctc-address-y":
                    "115px",

                "--ctc-address-font-size":
                    "14px",

                "--ctc-address-font-weight":
                    "400",


                /*
                 * =====================================================
                 * CITIZENSHIP
                 * =====================================================
                 */

                "--ctc-citizenship-x":
                    "25px",

                "--ctc-citizenship-y":
                    "135px",

                "--ctc-citizenship-font-size":
                    "14px",

                "--ctc-citizenship-font-weight":
                    "400",


                /*
                 * =====================================================
                 * CIVIL STATUS
                 * =====================================================
                 */

                "--ctc-civil-status-x":
                    "25px",

                "--ctc-civil-status-y":
                    "133px",

                "--ctc-civil-status-font-size":
                    "8px",

                "--ctc-civil-status-font-weight":
                    "600",


                /*
                 * =====================================================
                 * BIRTH DATE
                 * =====================================================
                 */

                "--ctc-birth-date-x":
                    "330px",

                "--ctc-birth-date-y":
                    "155px",

                "--ctc-birth-date-font-size":
                    "14px",

                "--ctc-birth-date-font-weight":
                    "400",


                /*
                 * =====================================================
                 * PLACE OF BIRTH
                 * =====================================================
                 */

                "--ctc-place-birth-x":
                    "280px",

                "--ctc-place-birth-y":
                    "135px",

                "--ctc-place-birth-font-size":
                    "14px",

                "--ctc-place-birth-font-weight":
                    "400",


                /*
                 * =====================================================
                 * SEX
                 * =====================================================
                 */

                "--ctc-sex-x":
                    "355px",

                "--ctc-sex-y":
                    "133px",

                "--ctc-sex-font-size":
                    "9px",

                "--ctc-sex-font-weight":
                    "700",


                /*
                 * =====================================================
                 * HEIGHT
                 * =====================================================
                 */

                "--ctc-height-x":
                    "450px",

                "--ctc-height-y":
                    "135px",

                "--ctc-height-font-size":
                    "14px",

                "--ctc-height-font-weight":
                    "600",


                /*
                 * =====================================================
                 * WEIGHT
                 * =====================================================
                 */

                "--ctc-weight-x":
                    "450px",

                "--ctc-weight-y":
                    "155px",

                "--ctc-weight-font-size":
                    "14px",

                "--ctc-weight-font-weight":
                    "400",


                /*
                 * =====================================================
                 * OCCUPATION
                 * =====================================================
                 */

                "--ctc-occupation-x":
                    "155px",

                "--ctc-occupation-y":
                    "160px",

                "--ctc-occupation-font-size":
                    "8px",

                "--ctc-occupation-font-weight":
                    "600",


                /*
                 * =====================================================
                 * CR NUMBER
                 * =====================================================
                 */

                "--ctc-cr-number-x":
                    "310px",

                "--ctc-cr-number-y":
                    "160px",

                "--ctc-cr-number-font-size":
                    "9px",

                "--ctc-cr-number-font-weight":
                    "600",


                /*
                 * =====================================================
                 * BASIC TAX
                 * =====================================================
                 */

                "--ctc-basic-tax-x":
                    "430px",

                "--ctc-basic-tax-y":
                    "198px",

                "--ctc-basic-tax-font-size":
                    "10px",

                "--ctc-basic-tax-font-weight":
                    "600",


                /*
                 * =====================================================
                 * ADDITIONAL TAX
                 * =====================================================
                 */

                "--ctc-additional-tax-x":
                    "430px",

                "--ctc-additional-tax-y":
                    "220px",

                "--ctc-additional-tax-font-size":
                    "10px",

                "--ctc-additional-tax-font-weight":
                    "600",


                /*
                 * =====================================================
                 * TAXABLE AMOUNT
                 * =====================================================
                 */

                "--ctc-taxable-amount-x":
                    "430px",

                "--ctc-taxable-amount-y":
                    "242px",

                "--ctc-taxable-amount-font-size":
                    "10px",

                "--ctc-taxable-amount-font-weight":
                    "600",


                /*
                 * =====================================================
                 * SALARY TAX
                 * =====================================================
                 */

                "--ctc-salary-tax-x":
                    "430px",

                "--ctc-salary-tax-y":
                    "264px",

                "--ctc-salary-tax-font-size":
                    "10px",

                "--ctc-salary-tax-font-weight":
                    "600",


                /*
                 * =====================================================
                 * TOTAL
                 * =====================================================
                 */

                "--ctc-total-x":
                    "430px",

                "--ctc-total-y":
                    "286px",

                "--ctc-total-font-size":
                    "10px",

                "--ctc-total-font-weight":
                    "700",


                /*
                 * =====================================================
                 * INTEREST
                 * =====================================================
                 */

                "--ctc-interest-x":
                    "430px",

                "--ctc-interest-y":
                    "308px",

                "--ctc-interest-font-size":
                    "10px",

                "--ctc-interest-font-weight":
                    "600",


                /*
                 * =====================================================
                 * TOTAL AMOUNT PAID
                 * =====================================================
                 */

                "--ctc-total-paid-x":
                    "430px",

                "--ctc-total-paid-y":
                    "330px",

                "--ctc-total-paid-font-size":
                    "10px",

                "--ctc-total-paid-font-weight":
                    "700",


                /*
                 * =====================================================
                 * TREASURER
                 * =====================================================
                 */

                "--ctc-treasurer-x":
                    "310px",

                "--ctc-treasurer-y":
                    "375px",

                "--ctc-treasurer-font-size":
                    "8px",

                "--ctc-treasurer-font-weight":
                    "700",

            } as React.CSSProperties}
        >


            <div className="ctc-year">
                {
                    receiptDate
                        ? String(
                            new Date(
                                receiptDate
                            ).getFullYear()
                        ).slice(
                            -2
                        )
                        : ""
                }
            </div>


            <div className="ctc-place-issued">
                {
                    ctc?.place_issued ??
                    ""
                }
            </div>


            <div className="ctc-date-issued">
                {
                    receiptDate
                        ? new Date(
                            receiptDate
                        ).toLocaleDateString(
                            "en-US",
                            {
                                month: "2-digit",
                                day: "2-digit",
                                year: "numeric",
                            }
                        )
                        : ""
                }
            </div>


            <div
                className="ctc-name"
            >
                {
                    formatFullName(
                        ctc?.full_name ??
                        transaction?.payor ??
                        ""
                    )
                }
            </div>


            <div className="ctc-address">
                {
                    ctc?.address
                        ? `${ctc.address}, TAYTAY, PALAWAN`
                        : "TAYTAY, PALAWAN"
                }
            </div>


            <div className="ctc-citizenship">
                {
                    ctc?.citizenship ??
                    ""
                }
            </div>


            {/* <div className="ctc-civil-status">
                {
                    ctc?.civil_status ??
                    ""
                }
            </div> */}


            <div className="ctc-birth-date">
                {
                    ctc?.birth_date
                        ? new Date(
                            ctc.birth_date
                        ).toLocaleDateString(
                            "en-US",
                            {
                                month: "2-digit",
                                day: "2-digit",
                                year: "numeric",
                            }
                        )
                        : ""
                }
            </div>


            <div className="ctc-place-birth">
                {
                    ctc?.place_of_birth ??
                    ""
                }
            </div>


            {/* <div className="ctc-sex">
                {
                    ctc?.sex ??
                    transaction?.gender ??
                    ""
                }
            </div> */}


            <div className="ctc-height">
                {
                    ctc?.height ??
                    ""
                }
            </div>


            <div className="ctc-weight">
                {
                    ctc?.weight ??
                    ""
                }
            </div>


            <div className="ctc-occupation">
                {
                    ctc?.occupation ??
                    ""
                }
            </div>


            <div className="ctc-cr-number">
                {
                    ctc?.cr_number ??
                    ""
                }
            </div>


            <div className="ctc-basic-tax">
                ₱{
                    formatAmount(
                        basicTax
                    )
                }
            </div>


            <div className="ctc-additional-tax">
                ₱{
                    formatAmount(
                        additionalTax
                    )
                }
            </div>


            <div className="ctc-taxable-amount">
                ₱{
                    formatAmount(
                        taxableAmount
                    )
                }
            </div>


            <div className="ctc-salary-tax">
                ₱{
                    formatAmount(
                        salaryTax
                    )
                }
            </div>


            <div className="ctc-total">
                ₱{
                    formatAmount(
                        basicTax +
                        additionalTax +
                        salaryTax
                    )
                }
            </div>


            <div className="ctc-interest">
                ₱{
                    formatAmount(
                        interest
                    )
                }
            </div>


            <div className="ctc-total-paid">
                ₱{
                    formatAmount(
                        totalAmount
                    )
                }
            </div>


            <div className="ctc-treasurer">
                MUNICIPAL TREASURER
            </div>


        </div>

    );

}