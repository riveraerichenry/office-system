"use client";

import {
    RCDFormRow,
} from "./RCDTypes";

type Props = {
    formRows: RCDFormRow[];
    totalCollections: number;
    formatCurrency: (
        value: number | string | null | undefined
    ) => string;
};

export default function RCDCollections({
    formRows,
    totalCollections,
    formatCurrency,
}: Props) {
    return (
        <section className="rcd-section mb-10">

            <div className="rcd-section-title">
                A. COLLECTIONS
                <span>
                    {" "}
                    ( 1. For Collectors )
                </span>
            </div>

            <table className="rcd-table">

                <thead>

                    <tr>

                        <th
                            rowSpan={2}
                            style={{
                                width: "38%",
                            }}
                        >
                            Type ( Form No )
                        </th>

                        <th colSpan={2}>
                            Official Receipts / Serial No
                        </th>

                        <th
                            rowSpan={2}
                            style={{
                                width: "25%",
                            }}
                        >
                            Amount
                        </th>

                    </tr>

                    <tr>

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

                            <td colSpan={4}>
                                —
                            </td>

                        </tr>

                    ) : (

                        formRows.map(
                            (
                                row,
                                index
                            ) => (

                                <tr
                                    key={
                                        `${row.formCode}-${index}`
                                    }
                                >

                                    <td className="bold">
                                        <center>
                                        {row.formCode}
                                        </center>
                                    </td>

                                    <td className="center">
                                        {row.from}
                                    </td>

                                    <td className="center">
                                        {row.to}
                                    </td>

                                    <td className="right bold">
                                        {formatCurrency(
                                            row.amount
                                        )}
                                    </td>

                                </tr>

                            )
                        )

                    )}

                    <tr>

                        <td
                            colSpan={3}
                            className="bold"
                            style={{
                                height: "50px",
                            }}
                        >
                            TOTAL
                        </td>

                        <td className="right bold" style={{ fontSize: "15px"}}>

                            {formatCurrency(
                                totalCollections
                            )}

                        </td>

                    </tr>

                </tbody>

            </table>

        </section>
    );
}