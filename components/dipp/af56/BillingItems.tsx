"use client";

import { BillingItem } from "@/lib/types/billing";

type Props = {
    items: BillingItem[];
};

export default function BillingItems({ items }: Props) {
    if (items.length === 0) {
        return (
            <div className="rounded-xl border bg-white shadow-sm">

                <div className="border-b bg-blue-600 px-5 py-3">
                    <h2 className="font-semibold text-white">
                        Billing Items
                    </h2>
                </div>

                <div className="p-10 text-center text-gray-500">
                    No billing items found.
                </div>

            </div>
        );
    }

    const totals = items.reduce(
        (acc, item) => ({
            basic: acc.basic + Number(item.basic ?? 0),
            sef: acc.sef + Number(item.sef ?? 0),
            penalty: acc.penalty + Number(item.penalty ?? 0),
            discount: acc.discount + Number(item.discount ?? 0),
            total: acc.total + Number(item.total ?? 0),
        }),
        {
            basic: 0,
            sef: 0,
            penalty: 0,
            discount: 0,
            total: 0,
        }
    );

    return (
        <div className="rounded-xl border bg-white shadow-sm">

            <div className="border-b bg-blue-600 px-5 py-3">
                <h2 className="font-semibold text-white">
                    Billing Items
                </h2>
            </div>

            <div className="overflow-auto">

                <table className="min-w-full">

                    <thead className="sticky top-0 bg-gray-100">

                        <tr className="text-sm">

                            <th className="border p-2 text-center">
                                #
                            </th>

                            <th className="border p-2 text-left">
                                Coverage
                            </th>

                            <th className="border p-2 text-right">
                                Assessed Value
                            </th>

                            <th className="border p-2 text-right">
                                Basic
                            </th>

                            <th className="border p-2 text-right">
                                SEF
                            </th>

                            <th className="border p-2 text-right">
                                Penalty %
                            </th>

                            <th className="border p-2 text-right">
                                Penalty
                            </th>

                            <th className="border p-2 text-right">
                                Discount %
                            </th>

                            <th className="border p-2 text-right">
                                Discount
                            </th>

                            <th className="border p-2 text-right">
                                Total
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {items.map((item, index) => (

                            <tr
                                key={item.id}
                                className="hover:bg-gray-50"
                            >

                                <td className="border p-2 text-center">
                                    {index + 1}
                                </td>

                                <td className="border p-2">
                                    {item.coverage}
                                </td>

                                <td className="border p-2 text-right">
                                    {currency(item.assessed_value)}
                                </td>

                                <td className="border p-2 text-right">
                                    {currency(item.basic)}
                                </td>

                                <td className="border p-2 text-right">
                                    {currency(item.sef)}
                                </td>

                                <td className="border p-2 text-right">
                                    {Number(item.penalty_percent ?? 0)}%
                                </td>

                                <td className="border p-2 text-right">
                                    {currency(item.penalty)}
                                </td>

                                <td className="border p-2 text-right">
                                    {Number(item.discount_percent ?? 0)}%
                                </td>

                                <td className="border p-2 text-right">
                                    {currency(item.discount)}
                                </td>

                                <td className="border p-2 text-right font-semibold">
                                    {currency(item.total)}
                                </td>

                            </tr>

                        ))}

                    </tbody>

                    <tfoot className="bg-gray-100 font-semibold">

                        <tr>

                            <td
                                colSpan={3}
                                className="border p-2 text-right"
                            >
                                TOTAL
                            </td>

                            <td className="border p-2 text-right">
                                {currency(totals.basic)}
                            </td>

                            <td className="border p-2 text-right">
                                {currency(totals.sef)}
                            </td>

                            <td className="border"></td>

                            <td className="border p-2 text-right">
                                {currency(totals.penalty)}
                            </td>

                            <td className="border"></td>

                            <td className="border p-2 text-right">
                                {currency(totals.discount)}
                            </td>

                            <td className="border p-2 text-right">
                                {currency(totals.total)}
                            </td>

                        </tr>

                    </tfoot>

                </table>

            </div>

        </div>
    );
}

function currency(value: number | null | undefined) {
    return Number(value ?? 0).toLocaleString("en-PH", {
        style: "currency",
        currency: "PHP",
    });
}