"use client";

type Props = {
    items: any[];
};

export default function ReceiptItems({
    items,
}: Props) {

    return (

        <div className="receipt-items">

            {/* Table Header */}

            <div
                style={{
                    position: "absolute",
                    top: "245px",
                    left: "18px",
                    width: "348px",
                    display: "flex",
                    fontWeight: 700,
                    fontSize: "11px",
                }}
            >

                

                

                <div
                    style={{
                        flex: 1,
                        textAlign: "right",
                    }}
                >
                    Amount
                </div>

            </div>

            {/* Items */}

            {items.map(

                (
                    item,
                    index
                ) => (

                    <div

                        key={index}

                        style={{

                            position: "absolute",

                            top: `${270 + index * 24}px`,

                            left: "18px",

                            width: "348px",

                            display: "flex",

                            fontSize: "11px",

                        }}

                    >

                        {/* Nature */}

                        <div
                            style={{
                                width: "185px",
                                paddingRight: "8px",
                                wordBreak: "break-word",
                            }}
                        >
                            {item.account_name}
                        </div>

                        {/* Account Code */}

                        <div
                            style={{
                                width: "70px",
                                textAlign: "center",
                            }}
                        >
                            {item.account_code}
                        </div>

                        {/* Amount */}

                        <div
                            style={{
                                flex: 1,
                                textAlign: "right",
                            }}
                        >
                            {Number(
                                item.amount
                            ).toLocaleString(
                                "en-PH",
                                {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                }
                            )}
                        </div>

                    </div>

                )

            )}

        </div>

    );

}