"use client";

type Props = {
    transaction: any;
    af58: any;
};


/* ================================================================
   FORMAT DATE
================================================================ */

function formatDate(value: any) {

    if (!value) {
        return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleDateString("en-PH", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
    });
}


/* ================================================================
   AMOUNT
================================================================ */

function formatAmount(value: any) {

    const amount = Number(value ?? 0);

    return amount.toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}


/* ================================================================
   NUMBER TO WORDS
================================================================ */

function numberToWords(
    amount: number
): string {

    const ones = [
        "",
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


    function convertHundreds(
        value: number
    ): string {

        let result = "";

        if (value >= 100) {

            result +=
                ones[
                    Math.floor(
                        value / 100
                    )
                ] +
                " HUNDRED";

            value %= 100;

            if (value > 0) {
                result += " ";
            }
        }


        if (value >= 20) {

            result +=
                tens[
                    Math.floor(
                        value / 10
                    )
                ];

            value %= 10;

            if (value > 0) {

                result +=
                    " " +
                    ones[value];

            }

        }
        else if (value > 0) {

            result += ones[value];

        }

        return result;
    }


    if (
        !Number.isFinite(amount) ||
        amount < 0
    ) {
        return "";
    }


    const pesos =
        Math.floor(amount);

    const centavos =
        Math.round(
            (amount - pesos) * 100
        );


    let result = "";


    if (pesos === 0) {

        result = "ZERO PESOS";

    }
    else {

        let remaining = pesos;


        const millions =
            Math.floor(
                remaining / 1000000
            );

        if (millions > 0) {

            result +=
                convertHundreds(
                    millions
                ) +
                " MILLION";

            remaining %= 1000000;

            if (remaining > 0) {
                result += " ";
            }
        }


        const thousands =
            Math.floor(
                remaining / 1000
            );

        if (thousands > 0) {

            result +=
                convertHundreds(
                    thousands
                ) +
                " THOUSAND";

            remaining %= 1000;

            if (remaining > 0) {
                result += " ";
            }
        }


        if (remaining > 0) {

            result +=
                convertHundreds(
                    remaining
                );

        }


        result +=
            " PESOS";
    }


    if (centavos > 0) {

        result +=
            " AND " +
            String(
                centavos
            ).padStart(
                2,
                "0"
            ) +
            " CENTAVOS";

    }
    else {

        result +=
            " ONLY";

    }


    return result;
}


/* ================================================================
   COMPONENT
================================================================ */

export default function AF58PrintFooter({
    transaction,
    af58,
}: Props) {


    /*
    ================================================================
    DATABASE VALUES
    ================================================================
    */

    const amount =
        Number(
            af58?.fee_amount ??
            0
        );


    const cityMunicipality =
        af58?.city_municipality ??
        "";


    const province =
        af58?.province ??
        "";


    /*
    ================================================================
    DATE

    Use receipt date from transaction.
    ================================================================
    */

    const receiptDate =
        transaction?.receipt_date ??
        transaction?.created_at ??
        af58?.certification_date ??
        new Date();


    /*
    ================================================================
    LOGGED USER

    encoded_by is the user who encoded/logged
    the transaction.

    Fallbacks are included in case the header
    uses a different field.
    ================================================================
    */

    const loggedUser =
        transaction?.encoded_by ??
        transaction?.collector ??
        "";


    /*
    ================================================================
    YEAR

    20 is fixed.
    The last two digits vary.

    Example:
    2026 -> 26
    2027 -> 27
    ================================================================
    */

    const year =
        new Date(
            receiptDate
        ).getFullYear();


    const yearSuffix =
        String(year).slice(-2);


    const displayYear =
        `20${yearSuffix}`;


    /*
    ================================================================
    AMOUNT IN WORDS
    ================================================================
    */

    const amountWords =
        numberToWords(
            amount
        );


    return (

        <div
            className="af58-print-footer"

            style={{

                /*
                ========================================================
                FOOTER POSITIONING
                ========================================================

                Change these values to calibrate
                the physical receipt.
                ========================================================
                */

                "--af58-amount-x":
                    "36px",

                "--af58-amount-y":
                    "690px",


                "--af58-city-x":
                    "36px",

                "--af58-city-y":
                    "710px",


                "--af58-province-x":
                    "230px",

                "--af58-province-y":
                    "710px",


                "--af58-date-x":
                    "50px",

                "--af58-date-y":
                    "730px",


                "--af58-year-x":
                    "250px",

                "--af58-year-y":
                    "730px",


               


                "--af58-user-x":
                    "200px",

                "--af58-user-y":
                    "830px",

            } as React.CSSProperties}
        >


            {/* =====================================================
                AMOUNT
            ===================================================== */}

            <span
                style={{
                    position: "absolute",

                    left:
                        "var(--af58-amount-x)",

                    top:
                        "var(--af58-amount-y)",

                    width: "340px",

                    fontSize: "12px",

                    fontWeight: 700,

                    whiteSpace: "nowrap",
                }}
            >

                ₱ {formatAmount(amount)}

            </span>


            {/* =====================================================
                CITY / MUNICIPALITY
            ===================================================== */}

            <span
                style={{
                    position: "absolute",

                    left:
                        "var(--af58-city-x)",

                    top:
                        "var(--af58-city-y)",

                    width: "160px",

                    fontSize: "12px",

                    fontWeight: 600,

                    textTransform: "uppercase",

                    whiteSpace: "nowrap",

                    overflow: "hidden",
                }}
            >

                {cityMunicipality}

            </span>


            {/* =====================================================
                PROVINCE
            ===================================================== */}

            <span
                style={{
                    position: "absolute",

                    left:
                        "var(--af58-province-x)",

                    top:
                        "var(--af58-province-y)",

                    width: "160px",

                    fontSize: "12px",

                    fontWeight: 600,

                    textTransform: "uppercase",

                    whiteSpace: "nowrap",

                    overflow: "hidden",
                }}
            >

                {province}

            </span>


            {/* =====================================================
                DATE
            ===================================================== */}

            <span
                style={{
                    position: "absolute",

                    left:
                        "var(--af58-date-x)",

                    top:
                        "var(--af58-date-y)",

                    width: "150px",

                    fontSize: "12px",

                    fontWeight: 600,

                    whiteSpace: "nowrap",
                }}
            >

                {formatDate(
                    receiptDate
                )}

            </span>


            {/* =====================================================
                YEAR
            ===================================================== */}

            <span
                style={{
                    position: "absolute",

                    left:
                        "var(--af58-year-x)",

                    top:
                        "var(--af58-year-y)",

                    width: "80px",

                    fontSize: "12px",

                    fontWeight: 600,

                    whiteSpace: "nowrap",
                }}
            >

                {displayYear}

            </span>


            {/* =====================================================
                AMOUNT IN WORDS
            ===================================================== */}

          


            {/* =====================================================
                LOGGED USER
            ===================================================== */}

            <span
                style={{
                    position: "absolute",

                    left:
                        "var(--af58-user-x)",

                    top:
                        "var(--af58-user-y)",

                    width: "180px",

                    fontSize: "12px",

                    fontWeight: 700,

                    textTransform: "uppercase",

                    whiteSpace: "nowrap",

                    overflow: "hidden",
                }}
            >

                {loggedUser}

            </span>


        </div>

    );

}