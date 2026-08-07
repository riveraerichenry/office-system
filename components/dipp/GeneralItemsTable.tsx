    "use client";

    type Item = {
    account_code: string;
    account_name: string;
    amount: number;
    };

    type Props = {
    items: Item[];
    grandTotal: number;
    };

    export default function GeneralItemsTable({
    items,
    grandTotal,
    }: Props) {
    return (
        <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3">
            <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                Transaction Items
            </h3>

            <p className="mt-0.5 text-xs text-slate-500">
                Account distribution of this official receipt
            </p>
            </div>

            <div className="rounded-md bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {items.length} Item{items.length !== 1 && "s"}
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
            <thead className="bg-slate-100">
                <tr>
                <th className="w-16 border-b px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                    #
                </th>

                <th className="border-b px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                    Account Code
                </th>

                <th className="border-b px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                    Account Name
                </th>

                <th className="w-52 border-b px-4 py-2 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                    Amount
                </th>
                </tr>
            </thead>

            <tbody>
                {items.length > 0 ? (
                items.map((item, index) => (
                    <tr
                    key={index}
                    className="border-b last:border-0 hover:bg-slate-50"
                    >
                    <td className="px-4 py-2 text-center font-medium text-slate-700">
                        {index + 1}
                    </td>

                    <td className="px-4 py-2 font-semibold text-slate-900">
                        {item.account_code}
                    </td>

                    <td className="px-4 py-2 text-slate-700">
                        {item.account_name}
                    </td>

                    <td className="px-4 py-2 text-right font-semibold text-slate-900">
                        {Number(item.amount).toLocaleString("en-PH", {
                        style: "currency",
                        currency: "PHP",
                        })}
                    </td>
                    </tr>
                ))
                ) : (
                <tr>
                    <td
                    colSpan={4}
                    className="py-12 text-center text-sm text-slate-500"
                    >
                    No transaction items found.
                    </td>
                </tr>
                )}
            </tbody>

            {items.length > 0 && (
                <tfoot className="border-t bg-slate-50">
                <tr>
                    <td
                    colSpan={3}
                    className="px-4 py-3 text-right text-sm font-semibold uppercase tracking-wide text-slate-600"
                    >
                    Grand Total
                    </td>

                    <td className="px-4 py-3 text-right text-lg font-bold text-blue-700">
                    {Number(grandTotal).toLocaleString("en-PH", {
                        style: "currency",
                        currency: "PHP",
                    })}
                    </td>
                </tr>
                </tfoot>
            )}
            </table>
        </div>
        </div>
    );
    }