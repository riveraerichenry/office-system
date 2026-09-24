"use client";

type CollectionRow = {
    values?: Record<
        string,
        number | string | null | undefined
    >;
};

export const OtherFeesGroupColumns = () => {
    return (
        <>
            <th className="border border-black bg-white px-3 py-2 text-center text-xs font-bold text-slate-800">
                AMOUNT
            </th>
        </>
    );
};

export default function OtherFeesGroup({
    row,
    header = false,
}: {
    row: CollectionRow;
    header?: boolean;
}) {
    if (header) {
        return (
            <th
                colSpan={1}
                className="border border-black bg-slate-100 px-3 py-2 text-center text-xs font-bold text-slate-800"
            >
                OTHER FEES
            </th>
        );
    }

    const amount = Number(
        row.values?.["other-fees"] ??
        row.values?.["other_fees"] ??
        0
    );

    return (
        <td className="whitespace-nowrap border border-black px-3 py-2 text-right align-top text-sm">
            {amount.toLocaleString("en-PH", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })}
        </td>
    );
}