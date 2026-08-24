"use client";

type Props = {
    items?: any[];

    formatAmount: (
        value: any
    ) => string;
};


/* ============================================================
   DATE
============================================================ */

function formatDate(
    value: any
): string {

    if (!value) {
        return "—";
    }

    const date = new Date(
        `${String(value).substring(
            0,
            10
        )}T00:00:00`
    );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return String(value);
    }

    return date.toLocaleDateString(
        "en-PH",
        {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
        }
    );
}


/* ============================================================
   TEXT HELPERS
============================================================ */

function getORNumber(
    item: any
): string {

    return (
        item?.or_number ??
        item?.or_no ??
        item?.receipt_number ??
        item?.official_receipt_no ??
        item?.receipt_no ??
        "—"
    );
}


function getPayor(
    item: any
): string {

    return (
        item?.payor ??
        item?.payor_name ??
        item?.payer_name ??
        item?.owner_name ??
        "—"
    );
}


function getAccountCode(
    item: any
): string {

    return (
        item?.account_code ??
        item?.code ??
        "—"
    );
}


function getParticulars(
    item: any
): string {

    return (
        item?.particulars ??
        item?.account_name ??
        item?.description ??
        item?.item_name ??
        "—"
    );
}


function getRemarks(
    item: any
): string {

    return (
        item?.remarks ??
        item?.remark ??
        item?.barangay_name ??
        item?.barangay ??
        "—"
    );
}


function getAmount(
    item: any
): number {

    return Number(
        item?.amount ??
        item?.total ??
        item?.value ??
        0
    );
}


/* ============================================================
   COMPONENT
============================================================ */

export default function AbstractSummaryAccounts({
    items = [],
    formatAmount,
}: Props) {

    const rows: any[] =
        Array.isArray(items)
            ? items
            : [];


    const grandTotal =
        rows.reduce(
            (
                total: number,
                item: any
            ) =>
                total +
                getAmount(item),
            0
        );


    return (

        <div className="abstract-summary-section">

            <table className="abstract-summary-table">

                {/* ====================================================
                    HEADER
                ==================================================== */}

                <thead>

                    <tr>

                        <th>
                            Date
                        </th>

                        <th>
                            O.R. No
                        </th>

                        <th>
                            PAYOR
                        </th>

                        <th>
                            ACCT
                            <br />
                            CODE
                        </th>

                        <th>
                            PARTICULARS
                        </th>

                        <th>
                            REMARKS
                        </th>

                        <th>
                            Amount
                        </th>

                    </tr>

                </thead>


                {/* ====================================================
                    BODY
                ==================================================== */}

                <tbody>

                    {rows.length === 0 ? (

                        <tr>

                            <td
                                colSpan={7}
                                className="
                                    abstract-summary-empty
                                "
                            >
                                No collection records found.
                            </td>

                        </tr>

                    ) : (

                        rows.map(
                            (
                                item: any,
                                index: number
                            ) => (

                                <tr
                                    key={
                                        item?.id ??
                                        item?.item_id ??
                                        `${getORNumber(item)}-${getAccountCode(item)}-${index}`
                                    }
                                >

                                    {/* DATE */}

                                    <td
                                        className="
                                            abstract-summary-date
                                        "
                                    >
                                        {
                                            formatDate(
                                                item?.date ??
                                                item?.transaction_date ??
                                                item?.collection_date ??
                                                item?.or_date ??
                                                item?.receipt_date
                                            )
                                        }
                                    </td>


                                    {/* O.R. NUMBER */}

                                    <td
                                        className="
                                            abstract-summary-or
                                        "
                                    >
                                        {
                                            getORNumber(
                                                item
                                            )
                                        }
                                    </td>


                                    {/* PAYOR */}

                                    <td
                                        className="
                                            abstract-summary-payor
                                        "
                                    >
                                        {
                                            getPayor(
                                                item
                                            )
                                        }
                                    </td>


                                    {/* ACCOUNT CODE */}

                                    <td
                                        className="
                                            abstract-summary-account-code
                                        "
                                    >
                                        {
                                            getAccountCode(
                                                item
                                            )
                                        }
                                    </td>


                                    {/* PARTICULARS */}

                                    <td
                                        className="
                                            abstract-summary-particulars
                                        "
                                    >
                                        {
                                            getParticulars(
                                                item
                                            )
                                        }
                                    </td>


                                    {/* REMARKS */}

                                    <td
                                        className="
                                            abstract-summary-remarks
                                        "
                                    >
                                        {
                                            getRemarks(
                                                item
                                            )
                                        }
                                    </td>


                                    {/* AMOUNT */}

                                    <td
                                        className="
                                            abstract-summary-amount
                                        "
                                    >
                                        {
                                            formatAmount(
                                                getAmount(
                                                    item
                                                )
                                            )
                                        }
                                    </td>

                                </tr>

                            )
                        )

                    )}

                </tbody>


                {/* ====================================================
                    GRAND TOTAL
                ==================================================== */}

                <tfoot>

                    <tr>

                        <td
                            colSpan={6}
                            className="
                                abstract-summary-total-label
                            "
                        >
                            Grand Total:
                        </td>

                        <td
                            className="
                                abstract-summary-total
                            "
                        >
                            {
                                formatAmount(
                                    grandTotal
                                )
                            }
                        </td>

                    </tr>

                </tfoot>

            </table>

        </div>

    );
}