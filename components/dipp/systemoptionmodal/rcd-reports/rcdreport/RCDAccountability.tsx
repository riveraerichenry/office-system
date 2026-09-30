
"use client";

import { RCDFormRow } from "./RCDTypes";

type Props = {
    formRows: RCDFormRow[];
};

/*
=========================================================
DISPLAY VALUE
=========================================================
*/

function displayValue(
    value?: string | number | null
): string {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "-";
    }

    return String(value);
}

/*
=========================================================
SERIAL QUANTITY
=========================================================
*/

function getQuantity(
    from?: string | null,
    to?: string | null
): number {
    if (!from || !to) {
        return 0;
    }

    const fromNumber = Number(from);
    const toNumber = Number(to);

    if (
        Number.isNaN(fromNumber) ||
        Number.isNaN(toNumber) ||
        toNumber < fromNumber
    ) {
        return 0;
    }

    return toNumber - fromNumber + 1;
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

            <div className="w-full overflow-x-auto">
                <table className="rcd-table accountability w-full">
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
                            <th>From</th>
                            <th>To</th>

                            <th>From</th>
                            <th>To</th>

                            <th>From</th>
                            <th>To</th>

                            <th>From</th>
                            <th>To</th>
                        </tr>
                    </thead>

                    <tbody>
                        {formRows.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={13}
                                    className="text-center"
                                >
                                    No accountable forms found.
                                </td>
                            </tr>
                        ) : (
                            formRows.map((form, index) => {
                                const beginningQuantity =
                                    getQuantity(
                                        form.beginningFrom,
                                        form.beginningTo
                                    );

                                const endingQuantity =
                                    getQuantity(
                                        form.endingFrom,
                                        form.endingTo
                                    );

                                return (
                                    <tr
                                        key={`${form.formCode}-${index}`}
                                    >
                                        {/* FORM NAME */}
                                        <td>
                                            {form.formCode}
                                        </td>

                                        {/* BOOKLET QTY */}
                                        <td>
                                            {displayValue(
                                                form.quantity
                                            )}
                                        </td>

                                        {/* BEGINNING BALANCE */}
                                        <td>
                                            {displayValue(
                                                form.beginningFrom
                                            )}
                                        </td>

                                        <td>
                                            {displayValue(
                                                form.beginningTo
                                            )}
                                        </td>

                                        {/* RECEIPTS QTY */}
                                        <td>
                                            {displayValue(
                                                form.quantity
                                            )}
                                        </td>

                                        {/* RECEIPTS FROM */}
                                        <td>
                                            {displayValue(
                                                form.beginningFrom
                                            )}
                                        </td>

                                        {/* RECEIPTS TO */}
                                        <td>
                                            {displayValue(
                                                form.beginningTo
                                            )}
                                        </td>

                                        {/* ISSUED QTY */}
                                        <td>
                                            {displayValue(
                                                form.quantity
                                            )}
                                        </td>

                                        {/* ISSUED FROM */}
                                        <td>
                                            {displayValue(
                                                form.from
                                            )}
                                        </td>

                                        {/* ISSUED TO */}
                                        <td>
                                            {displayValue(
                                                form.to
                                            )}
                                        </td>

                                        {/* ENDING BALANCE QTY */}
                                        <td>
                                            {endingQuantity > 0
                                                ? endingQuantity
                                                : 0}
                                        </td>

                                        {/* ENDING BALANCE FROM */}
                                        <td>
                                            {displayValue(
                                                form.endingFrom
                                            )}
                                        </td>

                                        {/* ENDING BALANCE TO */}
                                        <td>
                                            {displayValue(
                                                form.endingTo
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}