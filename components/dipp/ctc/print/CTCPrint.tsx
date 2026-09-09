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
   AMOUNT TO WORDS
===================================================== */

const amountToWords = (

    value: number

) => {

    const numericValue =

        Number(
            value ?? 0
        );


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

            )

            * 100

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

        if (

            num === 0

        ) {

            return "";

        }


        if (

            num < 20

        ) {

            return ones[
                num
            ];

        }


        if (

            num < 100

        ) {

            return (

                tens[
                    Math.floor(
                        num / 10
                    )
                ]

                +

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

            `${

                ones[
                    Math.floor(
                        num / 100
                    )
                ]

            } HUNDRED`

            +

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

        if (

            num === 0

        ) {

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

                )

                / 1000

            );


        const remainder =

            num % 1000;


        if (

            millions > 0

        ) {

            parts.push(

                `${

                    convertBelowThousand(
                        millions
                    )

                } MILLION`

            );

        }


        if (

            thousands > 0

        ) {

            parts.push(

                `${

                    convertBelowThousand(
                        thousands
                    )

                } THOUSAND`

            );

        }


        if (

            remainder > 0

        ) {

            parts.push(

                convertBelowThousand(
                    remainder
                )

            );

        }


        return parts.join(
            " "
        );

    };


    const pesoWords =

        convertNumber(
            number
        );


    return (

        `${pesoWords} PESOS`

        +

        (

            centavos > 0

                ? ` AND ${
                    convertNumber(
                        centavos
                    )
                } CENTAVOS`

                : ""

        )

        +

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

   Comes from:
   dipp_transactions.collector_id

   API should return:
   collector_user.username AS collector
===================================================== */

const collector =

    transaction?.collector ??

    transaction?.collector_username ??

    transaction?.collector_name ??

    transaction?.collector_user?.username ??

    "";


/* =====================================================
   USER / ENCODED BY

   IMPORTANT:

   encoded_by = UUID

   encoded_by_name / username = DISPLAY VALUE
===================================================== */

const user =

    transaction?.encoded_by_name ??

    transaction?.username ??

    transaction?.encoded_by_username ??

    transaction?.encoder_user?.username ??

    transaction?.user?.username ??

    transaction?.user_name ??

    "";


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


/* =====================================================
   PENALTY

   DISPLAYED IN THE EXISTING
   INTEREST POSITION.
===================================================== */

const penalty =

    Number(
        ctc?.penalty ?? 0
    );


const totalAmount =

    Number(

        ctc?.total_amount ??

        transaction?.grand_total ??

        0

    );


const totalAmountInWords =

    amountToWords(
        totalAmount
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


    const parts =

        fullName

            .trim()

            .split(
                /\s+/
            );


    if (

        parts.length === 1

    ) {

        return parts[0];

    }


    const firstName =

        parts[0];


    const lastName =

        parts[
            parts.length - 1
        ];


    const middleName =

        parts

            .slice(
                1,
                -1
            )

            .join(
                " "
            );


    return middleName

        ? `${lastName}, ${firstName} ${middleName}`

        : `${lastName}, ${firstName}`;

};


return (

    <div

        className="ctc-print-page"

        style={{

            /* =====================================================
               GLOBAL FONT CONTROL
            ===================================================== */

            "--ctc-font-family":
                "Arial, sans-serif",


            /* =====================================================
               YEAR
            ===================================================== */

            "--ctc-year-x":
                "70px",

            "--ctc-year-y":
                "70px",

            "--ctc-year-font-size":
                "15px",

            "--ctc-year-font-weight":
                "600",


            /* =====================================================
               PLACE OF ISSUE
            ===================================================== */

            "--ctc-place-issued-x":
                "115px",

            "--ctc-place-issued-y":
                "70px",

            "--ctc-place-issued-font-size":
                "14px",

            "--ctc-place-issued-font-weight":
                "600",


            /* =====================================================
               DATE ISSUED
            ===================================================== */

            "--ctc-date-issued-x":
                "250px",

            "--ctc-date-issued-y":
                "70px",

            "--ctc-date-issued-font-size":
                "14px",

            "--ctc-date-issued-font-weight":
                "600",


            /* =====================================================
               FULL NAME
            ===================================================== */

            "--ctc-name-x":
                "60px",

            "--ctc-name-y":
                "90px",

            "--ctc-name-font-size":
                "14px",

            "--ctc-name-font-weight":
                "700",


            /* =====================================================
               ADDRESS
            ===================================================== */

            "--ctc-address-x":
                "60px",

            "--ctc-address-y":
                "109px",

            "--ctc-address-font-size":
                "14px",

            "--ctc-address-font-weight":
                "400",


            /* =====================================================
               CITIZENSHIP
            ===================================================== */

            "--ctc-citizenship-x":
                "60px",

            "--ctc-citizenship-y":
                "130px",

            "--ctc-citizenship-font-size":
                "14px",

            "--ctc-citizenship-font-weight":
                "400",


            /* =====================================================
               CIVIL STATUS
            ===================================================== */

            "--ctc-civil-status-x":
                "25px",

            "--ctc-civil-status-y":
                "133px",

            "--ctc-civil-status-font-size":
                "8px",

            "--ctc-civil-status-font-weight":
                "600",


            /* =====================================================
               BIRTH DATE
            ===================================================== */

            "--ctc-birth-date-x":
                "405px",

            "--ctc-birth-date-y":
                "155px",

            "--ctc-birth-date-font-size":
                "14px",

            "--ctc-birth-date-font-weight":
                "400",


            /* =====================================================
               PLACE OF BIRTH
            ===================================================== */

            "--ctc-place-birth-x":
                "320px",

            "--ctc-place-birth-y":
                "130px",

            "--ctc-place-birth-font-size":
                "14px",

            "--ctc-place-birth-font-weight":
                "400",


            /* =====================================================
               SEX
            ===================================================== */

            "--ctc-sex-x":
                "355px",

            "--ctc-sex-y":
                "133px",

            "--ctc-sex-font-size":
                "9px",

            "--ctc-sex-font-weight":
                "700",


            /* =====================================================
               HEIGHT
            ===================================================== */

            "--ctc-height-x":
                "495px",

            "--ctc-height-y":
                "130px",

            "--ctc-height-font-size":
                "14px",

            "--ctc-height-font-weight":
                "400",


            /* =====================================================
               WEIGHT
            ===================================================== */

            "--ctc-weight-x":
                "495px",

            "--ctc-weight-y":
                "155px",

            "--ctc-weight-font-size":
                "14px",

            "--ctc-weight-font-weight":
                "400",


            /* =====================================================
               OCCUPATION
            ===================================================== */

            "--ctc-occupation-x":
                "60px",

            "--ctc-occupation-y":
                "175px",

            "--ctc-occupation-font-size":
                "14px",

            "--ctc-occupation-font-weight":
                "400",


            /* =====================================================
               CR NUMBER
            ===================================================== */

            "--ctc-cr-number-x":
                "310px",

            "--ctc-cr-number-y":
                "160px",

            "--ctc-cr-number-font-size":
                "9px",

            "--ctc-cr-number-font-weight":
                "600",


            /* =====================================================
               BASIC TAX
            ===================================================== */

            "--ctc-basic-tax-x":
                "440px",

            "--ctc-basic-tax-y":
                "190px",

            "--ctc-basic-tax-font-size":
                "14px",

            "--ctc-basic-tax-font-weight":
                "600",


            
            /*
            * =====================================================
            * SALARY TAX
            * =====================================================
            */

            "--ctc-salary-tax-x":
                "460px",

            "--ctc-salary-tax-y":
                "250px",

            "--ctc-salary-tax-font-size":
                "14px",

            "--ctc-salary-tax-font-weight":
                "600",


            /* =====================================================
               ADDITIONAL TAX
            ===================================================== */

            "--ctc-additional-tax-x":
                "430px",

            "--ctc-additional-tax-y":
                "220px",

            "--ctc-additional-tax-font-size":
                "10px",

            "--ctc-additional-tax-font-weight":
                "600",


            /* =====================================================
               TAXABLE AMOUNT
            ===================================================== */

            "--ctc-taxable-amount-x":
                "380px",

            "--ctc-taxable-amount-y":
                "250px",

            "--ctc-taxable-amount-font-size":
                "14px",

            "--ctc-taxable-amount-font-weight":
                "600",


            /* =====================================================
               SALARY TAX
            ===================================================== */

           

            /* =====================================================
               TOTAL
            ===================================================== */

            "--ctc-total-x":
                "460px",

            "--ctc-total-y":
                "295px",

            "--ctc-total-font-size":
                "14px",

            "--ctc-total-font-weight":
                "700",


            /* =====================================================
               PENALTY
            ===================================================== */

            "--ctc-interest-x":
                "450px",

            "--ctc-interest-y":
                "320px",

            "--ctc-interest-font-size":
                "14px",

            "--ctc-interest-font-weight":
                "600",


            /* =====================================================
               TOTAL AMOUNT PAID
            ===================================================== */

            "--ctc-total-paid-x":
                "460px",

            "--ctc-total-paid-y":
                "350px",

            "--ctc-total-paid-font-size":
                "14px",

            "--ctc-total-paid-font-weight":
                "700",


            /* =====================================================
               TREASURER
            ===================================================== */

            "--ctc-treasurer-x":
                "190px",

            "--ctc-treasurer-y":
                "357px",

            "--ctc-treasurer-font-size":
                "15px",

            "--ctc-treasurer-font-weight":
                "700",


            /* =====================================================
               DATE / COLLECTOR / USER

               ONE SINGLE LINE
            ===================================================== */

            "--ctc-info-line-x":
                "220px",

            "--ctc-info-line-y":
                "400px",

            "--ctc-info-line-font-size":
                "10px",

            "--ctc-info-line-font-weight":
                "400",

            "--ctc-info-line-gap":
                "18px",


            /* =====================================================
               AMOUNT IN WORDS
            ===================================================== */

            "--ctc-amount-words-x":
                "430px",

            "--ctc-amount-words-y":
                "375px",

            "--ctc-amount-words-width":
                "150px",

            "--ctc-amount-words-height":
                "28px",

            "--ctc-amount-words-line-height":
                "14px",

            "--ctc-amount-words-font-size":
                "10px",

            "--ctc-amount-words-font-weight":
                "600",

        } as React.CSSProperties}

    >


        {/* =====================================================
            YEAR
        ===================================================== */}

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


        {/* =====================================================
            PLACE ISSUED
        ===================================================== */}

        <div className="ctc-place-issued">

            {

                ctc?.place_issued ??

                ""

            }

        </div>


        {/* =====================================================
            DATE ISSUED
        ===================================================== */}

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


        {/* =====================================================
            FULL NAME
        ===================================================== */}

        <div className="ctc-name">

            {

                formatFullName(

                    ctc?.full_name ??

                    transaction?.payor ??

                    ""

                )

            }

        </div>


        {/* =====================================================
            ADDRESS
        ===================================================== */}

        <div className="ctc-address">

            {

                ctc?.address

                    ? `${ctc.address}, TAYTAY, PALAWAN`

                    : "TAYTAY, PALAWAN"

            }

        </div>


        {/* =====================================================
            CITIZENSHIP
        ===================================================== */}

        <div className="ctc-citizenship">

            {

                ctc?.citizenship ??

                ""

            }

        </div>


        {/* =====================================================
            BIRTH DATE
        ===================================================== */}

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


        {/* =====================================================
            PLACE OF BIRTH
        ===================================================== */}

        <div className="ctc-place-birth">

            {

                ctc?.place_of_birth ??

                ""

            }

        </div>


        {/* =====================================================
            HEIGHT
        ===================================================== */}

        <div className="ctc-height">

            {

                ctc?.height ??

                ""

            }

        </div>


        {/* =====================================================
            WEIGHT
        ===================================================== */}

        <div className="ctc-weight">

            {

                ctc?.weight ??

                ""

            }

        </div>


        {/* =====================================================
            OCCUPATION
        ===================================================== */}

        <div className="ctc-occupation">

            {

                ctc?.occupation ??

                ""

            }

        </div>


        {/* =====================================================
            CR NUMBER
        ===================================================== */}

        <div className="ctc-cr-number">

            {

                ctc?.cr_number ??

                ""

            }

        </div>


        {/* =====================================================
            BASIC TAX
        ===================================================== */}

        <div className="ctc-basic-tax">

            ₱{

                formatAmount(
                    basicTax
                )

            }

        </div>


        {/* =====================================================
            SALARY TAX
        ===================================================== */}

        <div className="ctc-salary-tax">

            ₱{

                formatAmount(
                    salaryTax
                )

            }

        </div>


        {/* =====================================================
            TAXABLE AMOUNT
        ===================================================== */}

        <div className="ctc-taxable-amount">

            ₱{

                formatAmount(
                    taxableAmount
                )

            }

        </div>


        {/* =====================================================
            TOTAL TAX
        ===================================================== */}

        <div className="ctc-total">

            ₱{

                formatAmount(

                    basicTax +

                    additionalTax +

                    salaryTax

                )

            }

        </div>


        {/* =====================================================
            PENALTY
        ===================================================== */}

        <div className="ctc-interest">

            ₱{

                formatAmount(
                    penalty
                )

            }

        </div>


        {/* =====================================================
            TOTAL PAID
        ===================================================== */}

        <div className="ctc-total-paid">

            ₱{

                formatAmount(
                    totalAmount
                )

            }

        </div>


        {/* =====================================================
            TREASURER
        ===================================================== */}

        <div className="ctc-treasurer">

            IMLYN B. PARAPINA

        </div>


        {/* =====================================================
            DATE / COLLECTOR / USER

            ONE SINGLE LINE
        ===================================================== */}

        <div className="ctc-info-line">


            <span className="ctc-info-date">

                {

                    formattedDate

                }

            </span>


            {/* <span className="ctc-info-collector">

                {

                    collector

                }

            </span> */}


            <span className="ctc-info-user">

                {

                    user

                }

            </span>


        </div>


        {/* =====================================================
            AMOUNT IN WORDS
        ===================================================== */}

        <div className="ctc-amount-words">

            {

                totalAmountInWords

            }

        </div>


    </div>

);

}