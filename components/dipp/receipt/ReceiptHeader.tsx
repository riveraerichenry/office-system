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

        <div className="receipt-header">

            {/* Date */}

            <div
                style={{
                    position: "absolute",

                    top: "100px",

                    left: "205px",

                    width: "155px",

                    fontSize: "12px",
                }}
            >
                {receiptDate}
            </div>

            {/* Agency */}

            <div
                style={{
                    position: "absolute",

                    /* 0.3 inch higher */
                    top: "118px",

                    /* 0.5 inch to the right */
                    left: "66px",

                    width: "120px",

                    fontSize: "12px",

                    fontWeight: 600,
                }}
            >
                MTO
            </div>

            {/* Fund Source */}

            <div
                style={{
                    position: "absolute",
                     /* 0.5 inch to the right */
                    left: "66px",


                    top: "145px",

                    right: "18px",

                    width: "60px",

                    textAlign: "center",

                    fontSize: "12px",

                    fontWeight: 600,
                }}
            >
                {transaction?.fund_code}
            </div>

            {/* Payor */}

            <div
                style={{
                    position: "absolute",

                    /* 0.3 inch higher */
                    top: "156px",

                    left: "18px",

                    width: "340px",

                    fontSize: "12px",

                    fontWeight: 600,

                    textTransform: "uppercase",
                }}
            >
                {transaction?.payor}
            </div>

        </div>

    );

}