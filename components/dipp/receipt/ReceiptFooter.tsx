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

    function convert(n: number): string {

        if (n < 20)
            return ones[n];

        if (n < 100)
            return (
                tens[Math.floor(n / 10)] +
                (n % 10
                    ? " " + convert(n % 10)
                    : "")
            );

        if (n < 1000)
            return (
                convert(Math.floor(n / 100)) +
                " HUNDRED" +
                (n % 100
                    ? " " + convert(n % 100)
                    : "")
            );

        if (n < 1000000)
            return (
                convert(Math.floor(n / 1000)) +
                " THOUSAND" +
                (n % 1000
                    ? " " + convert(n % 1000)
                    : "")
            );

        if (n < 1000000000)
            return (
                convert(Math.floor(n / 1000000)) +
                " MILLION" +
                (n % 1000000
                    ? " " + convert(n % 1000000)
                    : "")
            );

        return (
            convert(Math.floor(n / 1000000000)) +
            " BILLION" +
            (n % 1000000000
                ? " " + convert(n % 1000000000)
                : "")
        );

    }

    const whole =
        Math.floor(amount);

    const cents =
        Math.round(
            (amount - whole) * 100
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

    const total = items.reduce(
        (sum, item) =>
            sum + Number(item.amount || 0),
        0
    );

    return (

        <div className="receipt-footer">

            {/* Remarks */}

            <div
                style={{
                    position: "absolute",
                    top: "540px",
                    left: "18px",
                    width: "340px",
                    minHeight: "38px",
                    fontSize: "11px",
                }}
            >
                {transaction?.remarks ?? ""}
            </div>

            {/* Total */}

            <div
                style={{
                    position: "absolute",
                    top: "605px",
                    right: "18px",
                    width: "120px",
                    textAlign: "right",
                    fontWeight: 700,
                    fontSize: "13px",
                }}
            >
                {total.toLocaleString(
                    "en-PH",
                    {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    }
                )}
            </div>

            {/* Amount in Words */}

            <div
                style={{
                    position: "absolute",
                    top: "660px",
                    left: "18px",
                    width: "340px",
                    fontSize: "11px",
                    textTransform: "uppercase",
                }}
            >
                {numberToWords(total)}
            </div>

            {/* Collector */}

            <div
                style={{
                    position: "absolute",
                    top: "735px",
                    left: "18px",
                    width: "150px",
                    textAlign: "center",
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                }}
            >
                {transaction?.collector ?? ""}
            </div>

            {/* Municipal Treasurer */}

            <div
                style={{
                    position: "absolute",
                    top: "735px",
                    right: "18px",
                    width: "150px",
                    textAlign: "center",
                }}
            >

                <div
                    style={{
                        fontSize: "11px",
                        fontWeight: 700,
                    }}
                >
                    IMLYN B. PARAPINA
                </div>

                <div
                    style={{
                        fontSize: "10px",
                    }}
                >
                    Municipal Treasurer
                </div>

            </div>

        </div>

    );

}