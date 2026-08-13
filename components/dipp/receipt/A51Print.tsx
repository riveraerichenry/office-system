"use client";

type Props = {
    transaction: any;
    items: any[];
};


/* ============================================================
   NUMBER TO WORDS
============================================================ */

function numberToWords(amount: number) {

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


    function convert(
        n: number
    ): string {

        if (n < 20) {
            return ones[n];
        }


        if (n < 100) {

            return (
                tens[
                    Math.floor(
                        n / 10
                    )
                ] +
                (
                    n % 10
                        ? " " +
                          convert(
                              n % 10
                          )
                        : ""
                )
            );

        }


        if (n < 1000) {

            return (
                convert(
                    Math.floor(
                        n / 100
                    )
                ) +
                " HUNDRED" +
                (
                    n % 100
                        ? " " +
                          convert(
                              n % 100
                          )
                        : ""
                )
            );

        }


        if (n < 1000000) {

            return (
                convert(
                    Math.floor(
                        n / 1000
                    )
                ) +
                " THOUSAND" +
                (
                    n % 1000
                        ? " " +
                          convert(
                              n % 1000
                          )
                        : ""
                )
            );

        }


        if (n < 1000000000) {

            return (
                convert(
                    Math.floor(
                        n / 1000000
                    )
                ) +
                " MILLION" +
                (
                    n % 1000000
                        ? " " +
                          convert(
                              n % 1000000
                          )
                        : ""
                )
            );

        }


        return (
            convert(
                Math.floor(
                    n / 1000000000
                )
            ) +
            " BILLION" +
            (
                n % 1000000000
                    ? " " +
                      convert(
                          n % 1000000000
                      )
                    : ""
            )
        );

    }


    const whole =
        Math.floor(amount);

    const cents =
        Math.round(
            (
                amount -
                whole
            ) * 100
        );


    let result =
        convert(whole) +
        " PESOS";


    if (cents > 0) {

        result +=
            " AND " +
            convert(cents) +
            " CENTAVOS";

    }


    return result + " ONLY";
}


/* ============================================================
   A51 PRINT
============================================================ */

export default function A51Print({
    transaction,
    items,
}: Props) {


    /* ========================================================
       RECEIPT DATE
    ======================================================== */

    const receiptDate =
        transaction?.receipt_date
            ? new Date(
                  transaction.receipt_date
              ).toLocaleDateString(
                  "en-PH",
                  {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                  }
              )
            : "";


    /* ========================================================
       TOTAL
    ======================================================== */

    const total =
        items.reduce(
            (
                sum,
                item
            ) =>
                sum +
                Number(
                    item.amount || 0
                ),
            0
        );


    /* ========================================================
       COLLECTOR FIRST NAME
    ======================================================== */

    const collectorFirstName =
        transaction?.collector
            ? transaction.collector
                  .trim()
                  .split(/\s+/)[0]
            : "";


    /* ========================================================
       TRANSACTION DATE / TIME
    ======================================================== */

    const transactionDateTime =
        transaction?.created_at
            ? new Date(
                  transaction.created_at
              ).toLocaleString(
                  "en-PH",
                  {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: true,
                  }
              )
            : "";


    /* ========================================================
       AMOUNT IN WORDS
    ======================================================== */

    const amountInWords =
        numberToWords(total);


    return (

        <div className="a51-simple-print">

            {/* =================================================
                DATE
            ================================================= */}

            <div className="a51-date">

                {receiptDate}

            </div>


            {/* =================================================
                AGENCY
            ================================================= */}

            <div className="a51-agency">

                MTO

            </div>


            {/* =================================================
                FUND SOURCE
            ================================================= */}

            <div className="a51-fund">

                {transaction?.fund_code}

            </div>


            {/* =================================================
                PAYOR
            ================================================= */}

            <div className="a51-payor">

                {transaction?.payor}

            </div>


            {/* =================================================
                ITEMS
            ================================================= */}

            <div className="a51-items">

                {items.map(
                    (
                        item,
                        index
                    ) => (

                        <div
                            key={
                                item.id ??
                                index
                            }
                            className="a51-item"
                            style={{
                                "--item-index":
                                    index,
                            } as React.CSSProperties}
                        >

                            <span className="a51-item-name">

                                {item.account_name}

                            </span>


                            <span className="a51-item-code">

                                {item.account_code}

                            </span>


                            <span className="a51-item-amount">

                                ₱
                                {Number(
                                    item.amount || 0
                                ).toLocaleString(
                                    "en-PH",
                                    {
                                        minimumFractionDigits:
                                            2,

                                        maximumFractionDigits:
                                            2,
                                    }
                                )}

                            </span>

                        </div>

                    )
                )}

            </div>


            {/* =================================================
                REMARKS
            ================================================= */}

            <div className="a51-remarks">

                {transaction?.remarks ?? ""}

            </div>


            {/* =================================================
                TOTAL
            ================================================= */}

            <div className="a51-total">

                {total.toLocaleString(
                    "en-PH",
                    {
                        minimumFractionDigits:
                            2,

                        maximumFractionDigits:
                            2,
                    }
                )}

            </div>


            {/* =================================================
                AMOUNT IN WORDS
            ================================================= */}

            <div className="a51-words">

                {amountInWords}

            </div>


            {/* =================================================
                COLLECTOR
            ================================================= */}

            <div className="a51-collector">

                {transaction?.collector ?? ""}

            </div>


            {/* =================================================
                COLLECTOR FIRST NAME
            ================================================= */}

            <div className="a51-collector-first-name">

                {collectorFirstName}

            </div>


            {/* =================================================
                TRANSACTION DATE / TIME
            ================================================= */}

            <div className="a51-transaction-datetime">

                {transactionDateTime}

            </div>


            {/* =================================================
                MUNICIPAL TREASURER
            ================================================= */}

            <div className="a51-treasurer">

                <div className="a51-treasurer-name">

                    IMLYN B. PARAPINA

                </div>

                <div className="a51-treasurer-title">

                    Municipal Treasurer

                </div>

            </div>

        </div>

    );

}