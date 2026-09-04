"use client";

type Props = {
    transaction: any;
    items: any[];
};


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

        if (n < 20)
            return ones[n];


        if (n < 100)
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


        if (n < 1000)
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


        if (n < 1000000)
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


        if (n < 1000000000)
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


export default function ReceiptFooter({
    transaction,
    items,
}: Props) {

    /*
     * =====================================================
     * TOTAL
     * =====================================================
     */

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


    /*
     * =====================================================
     * COLLECTOR FIRST NAME
     * =====================================================
     */

    const collectorFirstName =
        transaction?.collector
            ? transaction.collector
                  .trim()
                  .split(/\s+/)[0]
            : "";


    /*
     * =====================================================
     * TRANSACTION DATE AND TIME
     * =====================================================
     */

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


    return (

        <div
            className="receipt-footer"
            style={{

                /*
                 * =====================================================
                 * FOOTER POSITION CALIBRATION
                 * =====================================================
                 *
                 * Change ONLY these values when calibrating
                 * the physical receipt.
                 *
                 * X = left / right
                 * Y = up / down
                 */


                /* =====================================================
                   REMARKS
                ===================================================== */

                "--receipt-remarks-x": "50px",
                "--receipt-remarks-y": "460px",


                /* =====================================================
                   TOTAL
                ===================================================== */

                "--receipt-total-x": "230px",
                "--receipt-total-y": "460px",


                /* =====================================================
                   AMOUNT IN WORDS
                ===================================================== */

                "--receipt-words-x": "50px",
                "--receipt-words-y": "505px",


                /* =====================================================
                   COLLECTOR
                ===================================================== */

                "--receipt-collector-x": "30px",
                "--receipt-collector-y": "630px",


                /* =====================================================
                   COLLECTOR FIRST NAME
                ===================================================== */

                "--receipt-collector-first-name-x": "50px",
                "--receipt-collector-first-name-y": "680px",


                /* =====================================================
                   TRANSACTION DATE AND TIME
                ===================================================== */

                "--receipt-transaction-datetime-x": "30px",
                "--receipt-transaction-datetime-y": "690px",


                /* =====================================================
                   MUNICIPAL TREASURER
                ===================================================== */

                "--receipt-treasurer-x": "200px",
                "--receipt-treasurer-y": "630px",

            } as React.CSSProperties}
        >

            {/* =====================================================
                REMARKS
            ===================================================== */}

            <div
                className="receipt-footer-remarks"
            >
                {transaction?.remarks ?? ""}
            </div>


            {/* =====================================================
                TOTAL
            ===================================================== */}

            <div
                className="receipt-footer-total"
            >
                {total.toLocaleString(
                    "en-PH",
                    {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    }
                )}
            </div>


            {/* =====================================================
                AMOUNT IN WORDS
            ===================================================== */}

            <div
                className="receipt-footer-words"
            >
                {numberToWords(total)}
            </div>


            {/* =====================================================
                COLLECTOR
            ===================================================== */}

            <div
                className="receipt-footer-collector"
            >
                {transaction?.collector ?? ""}
            </div>


            {/* =====================================================
                COLLECTOR FIRST NAME
            ===================================================== */}

            <div
                className="receipt-footer-collector-first-name"
            >
                {collectorFirstName}
            </div>


            {/* =====================================================
                TRANSACTION DATE AND TIME
            ===================================================== */}

            <div
                className="receipt-footer-transaction-datetime"
            >
                {transactionDateTime}
            </div>


            {/* =====================================================
                MUNICIPAL TREASURER
            ===================================================== */}

            <div
                className="receipt-footer-treasurer"
            >

                <div
                    className="receipt-treasurer-name"
                >
                    IMLYN B. PARAPINA
                </div>

                <div
                    className="receipt-treasurer-title"
                >
                    Municipal Treasurer
                </div>

            </div>


            <style jsx>{`

                /* =====================================================
                   REMARKS
                ===================================================== */

                .receipt-footer-remarks {

                    position: absolute;

                    top:
                        var(
                            --receipt-remarks-y
                        );

                    left:
                        var(
                            --receipt-remarks-x
                        );

                    width: 340px;

                    min-height: 38px;

                    font-size: 11px;

                }


                /* =====================================================
                   TOTAL
                ===================================================== */

                .receipt-footer-total {

                    position: absolute;

                    top:
                        var(
                            --receipt-total-y
                        );

                    left:
                        var(
                            --receipt-total-x
                        );

                    width: 120px;

                    text-align: right;

                    font-weight: 700;

                    font-size: 13px;

                }


                /* =====================================================
                   AMOUNT IN WORDS
                ===================================================== */

                .receipt-footer-words {

                    position: absolute;

                    top:
                        var(
                            --receipt-words-y
                        );

                    left:
                        var(
                            --receipt-words-x
                        );

                    width: 340px;

                    font-size: 11px;

                    text-transform: uppercase;

                }


                /* =====================================================
                   COLLECTOR
                ===================================================== */

                .receipt-footer-collector {

                    position: absolute;

                    top:
                        var(
                            --receipt-collector-y
                        );

                    left:
                        var(
                            --receipt-collector-x
                        );

                    width: 150px;

                    text-align: center;

                    font-size: 11px;

                    font-weight: 700;

                    text-transform: uppercase;

                }


                /* =====================================================
                   COLLECTOR FIRST NAME
                ===================================================== */

                .receipt-footer-collector-first-name {

                    position: absolute;

                    top:
                        var(
                            --receipt-collector-first-name-y
                        );

                    left:
                        var(
                            --receipt-collector-first-name-x
                        );

                    width: 150px;

                    text-align: center;

                    font-size: 10px;

                    text-transform: uppercase;

                }


                /* =====================================================
                   TRANSACTION DATE AND TIME
                ===================================================== */

                .receipt-footer-transaction-datetime {

                    position: absolute;

                    top:
                        var(
                            --receipt-transaction-datetime-y
                        );

                    left:
                        var(
                            --receipt-transaction-datetime-x
                        );

                    width: 180px;

                    text-align: center;

                    font-size: 9px;

                }


                /* =====================================================
                   MUNICIPAL TREASURER
                ===================================================== */

                .receipt-footer-treasurer {

                    position: absolute;

                    top:
                        var(
                            --receipt-treasurer-y
                        );

                    left:
                        var(
                            --receipt-treasurer-x
                        );

                    width: 150px;

                    text-align: center;

                }


                /* =====================================================
                   TREASURER NAME
                ===================================================== */

                .receipt-treasurer-name {

                    font-size: 11px;

                    font-weight: 700;

                }


                /* =====================================================
                   TREASURER TITLE
                ===================================================== */

                .receipt-treasurer-title {

                    font-size: 10px;

                }

            `}</style>

        </div>

    );
}