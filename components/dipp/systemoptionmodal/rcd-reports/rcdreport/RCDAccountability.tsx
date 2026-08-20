"use client";

import {
    RCDFormRow,
} from "./RCDTypes";


type Props = {
    formRows: RCDFormRow[];
};


/*
=========================================================
SERIAL QUANTITY
=========================================================
*/

function getQuantity(
    from?: string | null,
    to?: string | null
): number {

    if (
        !from ||
        !to
    ) {
        return 0;
    }


    const fromNumber =
        Number(from);


    const toNumber =
        Number(to);


    if (
        Number.isNaN(
            fromNumber
        ) ||
        Number.isNaN(
            toNumber
        )
    ) {
        return 0;
    }


    if (
        toNumber <
        fromNumber
    ) {
        return 0;
    }


    return (
        toNumber -
        fromNumber +
        1
    );
}


/*
=========================================================
DISPLAY VALUE
=========================================================
*/

function displayValue(
    value?:
        | string
        | null
): string {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "—";
    }


    return value;
}


/*
=========================================================
COMPONENT
=========================================================
*/

export default function RCDAccountability({
    formRows,
}: Props) {

    return (

        <section className="rcd-section mb-15">

            <div className="rcd-section-title">
                C. ACCOUNTABILITY FOR ACCOUNTABLE FORMS
            </div>


            <table className="rcd-table accountability">

                <thead>

                    <tr>

                        <th rowSpan={2}>
                            Name of
                            <br />
                            Form &amp; No
                        </th>


                        <th rowSpan={2}>
                            QTY
                        </th>


                        <th colSpan={2}>
                            Beginning Balance
                            <br />
                            Inclusive Serial Nos
                        </th>


                        <th rowSpan={2}>
                            QTY
                        </th>


                        <th colSpan={2}>
                            Receipts
                            <br />
                            Inclusive Serial Nos
                        </th>


                        <th rowSpan={2}>
                            QTY
                        </th>


                        <th colSpan={2}>
                            Issued
                            <br />
                            Inclusive Serial Nos
                        </th>


                        <th rowSpan={2}>
                            QTY
                        </th>


                        <th colSpan={2}>
                            Ending Balance
                            <br />
                            Inclusive Serial Nos
                        </th>

                    </tr>


                    <tr>

                        <th>
                            From
                        </th>

                        <th>
                            To
                        </th>


                        <th>
                            From
                        </th>

                        <th>
                            To
                        </th>


                        <th>
                            From
                        </th>

                        <th>
                            To
                        </th>


                        <th>
                            From
                        </th>

                        <th>
                            To
                        </th>

                    </tr>

                </thead>


                <tbody>

                    {formRows.length === 0 ? (

                        <tr>

                            <td colSpan={13}>
                                —
                            </td>

                        </tr>

                    ) : (

                        formRows.map(
                            (
                                row,
                                index
                            ) => {

                                /*
                                ==================================
                                BEGINNING QTY

                                Example:
                                103 - 150 = 48
                                ==================================
                                */

                                const beginningQty =
                                    getQuantity(
                                        row.beginningFrom,
                                        row.beginningTo
                                    );


                                /*
                                ==================================
                                ISSUED QTY

                                Example:
                                103 - 120 = 18
                                ==================================
                                */

                                const issuedQty =
                                    row.quantity ||
                                    getQuantity(
                                        row.from,
                                        row.to
                                    );


                                /*
                                ==================================
                                ENDING QTY

                                Example:
                                121 - 150 = 30
                                ==================================
                                */

                                const endingQty =
                                    getQuantity(
                                        row.endingFrom,
                                        row.endingTo
                                    );


                                return (

                                    <tr
                                        key={
                                            `accountability-${row.formCode}-${index}`
                                        }
                                    >

                                        {/* FORM */}

                                        <td>
                                            {
                                                row.formCode
                                            }
                                        </td>


                                        {/* BEGINNING QTY */}

                                        <td>
                                            {
                                                beginningQty ||
                                                "—"
                                            }
                                        </td>


                                        {/* BEGINNING FROM */}

                                        <td>
                                            {
                                                displayValue(
                                                    row.beginningFrom
                                                )
                                            }
                                        </td>


                                        {/* BEGINNING TO */}

                                        <td>
                                            {
                                                displayValue(
                                                    row.beginningTo
                                                )
                                            }
                                        </td>


                                        {/* RECEIPTS QTY */}

                                        <td>
                                            &nbsp;
                                        </td>


                                        {/* RECEIPTS FROM */}

                                        <td>
                                            &nbsp;
                                        </td>


                                        {/* RECEIPTS TO */}

                                        <td>
                                            &nbsp;
                                        </td>


                                        {/* ISSUED QTY */}

                                        <td>
                                            {
                                                issuedQty ||
                                                "—"
                                            }
                                        </td>


                                        {/* ISSUED FROM */}

                                        <td>
                                            {
                                                displayValue(
                                                    row.from
                                                )
                                            }
                                        </td>


                                        {/* ISSUED TO */}

                                        <td>
                                            {
                                                displayValue(
                                                    row.to
                                                )
                                            }
                                        </td>


                                        {/* ENDING QTY */}

                                        <td>
                                            {
                                                endingQty ||
                                                "—"
                                            }
                                        </td>


                                        {/* ENDING FROM */}

                                        <td>
                                            {
                                                displayValue(
                                                    row.endingFrom
                                                )
                                            }
                                        </td>


                                        {/* ENDING TO */}

                                        <td>
                                            {
                                                displayValue(
                                                    row.endingTo
                                                )
                                            }
                                        </td>

                                    </tr>

                                );

                            }
                        )

                    )}

                </tbody>

            </table>

        </section>
    );
}