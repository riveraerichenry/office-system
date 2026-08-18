"use client";

import {
    RCD,
    RCDUser,
} from "./RCDTypes";

type Props = {
    rcd: RCD;
    user?: RCDUser | null;
    totalCollections: number;
    formatCurrency: (
        value: number | string | null | undefined
    ) => string;
};

export default function RCDLiquidation({
    rcd,
    user,
    totalCollections,
    formatCurrency,
}: Props) {
    return (
        <section
            className="rcd-section"
            style={{
                marginBottom: "20px",
            }}
        >

            <div className="rcd-section-title">
                2. For Liquidation Officers / Treasurers
            </div>

            <table className="rcd-table">

                <thead>

                    <tr>

                        <th>
                            Name of Accountable Officer
                        </th>

                        <th>
                            Report No
                        </th>

                        <th>
                            Amount
                        </th>

                    </tr>

                </thead>

                <tbody>

                    <tr>

                        <td className="bold">
                            {user?.full_name ?? "—"}
                        </td>

                        <td className="center bold">
                            {rcd.report_no}
                        </td>

                        <td className="right bold">
                            {formatCurrency(
                                totalCollections
                            )}
                        </td>

                    </tr>

                    <tr>

                        <td
                            colSpan={2}
                            className="bold"
                        >
                            TOTAL
                        </td>

                        <td className="right bold" style={{
                            fontSize: "14px",
                        }}>
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