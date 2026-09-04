"use client";

type Props = {
    transaction: any;
};

export default function ReceiptHeader({
    transaction,
}: Props) {

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

    return (
        <div
            className="receipt-header"
            style={{
                /*
                 * =====================================================
                 * HEADER POSITION CALIBRATION
                 * =====================================================
                 *
                 * Change ONLY these values when calibrating
                 * the physical receipt.
                 */

                "--receipt-date-x": "245px",
                "--receipt-date-y": "175px",

                "--receipt-agency-x": "96px",
                "--receipt-agency-y": "205px",

                "--receipt-fund-x": "310px",
                "--receipt-fund-y": "205px",

                "--receipt-payor-x": "96px",
                "--receipt-payor-y": "225px",

            } as React.CSSProperties}
        >

            {/* =====================================================
                DATE
            ===================================================== */}

            <div
                className="receipt-header-date"
            >
                {receiptDate}
            </div>


            {/* =====================================================
                AGENCY
            ===================================================== */}

            <div
                className="receipt-header-agency"
            >
                MTO
            </div>


            {/* =====================================================
                FUND SOURCE
            ===================================================== */}

            <div
                className="receipt-header-fund"
            >
                {transaction?.fund_code}
            </div>


            {/* =====================================================
                PAYOR
            ===================================================== */}

            <div
                className="receipt-header-payor"
            >
                {transaction?.payor}
            </div>


            <style jsx>{`

                /* =====================================================
                   DATE
                ===================================================== */

                .receipt-header-date {

                    position: absolute;

                    top: var(
                        --receipt-date-y
                    );

                    left: var(
                        --receipt-date-x
                    );

                    width: 155px;

                    font-size: 12px;

                }


                /* =====================================================
                   AGENCY
                ===================================================== */

                .receipt-header-agency {

                    position: absolute;

                    top: var(
                        --receipt-agency-y
                    );

                    left: var(
                        --receipt-agency-x
                    );

                    width: 120px;

                    font-size: 12px;

                    font-weight: 600;

                }


                /* =====================================================
                   FUND SOURCE
                ===================================================== */

                .receipt-header-fund {

                    position: absolute;

                    top: var(
                        --receipt-fund-y
                    );

                    left: var(
                        --receipt-fund-x
                    );

                    width: 60px;

                    text-align: center;

                    font-size: 12px;

                    font-weight: 600;

                }


                /* =====================================================
                   PAYOR
                ===================================================== */

                .receipt-header-payor {

                    position: absolute;

                    top: var(
                        --receipt-payor-y
                    );

                    left: var(
                        --receipt-payor-x
                    );

                    width: 340px;

                    font-size: 12px;

                    font-weight: 600;

                    text-transform: uppercase;

                }

            `}</style>

        </div>
    );
}