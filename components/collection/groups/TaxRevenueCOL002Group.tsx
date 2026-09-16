"use client";

export type TaxRevenueCOL002Row = {
    values?: Record<string, number | string | null | undefined>;
    [key: string]: any;
};

type Props = {
    row: TaxRevenueCOL002Row;
    header?: boolean;
};

function getValue(
    row: TaxRevenueCOL002Row,
    key: string
): number {
    const value = row?.values?.[key];

    const numberValue = Number(value ?? 0);

    return Number.isFinite(numberValue)
        ? numberValue
        : 0;
}

function formatAmount(value: number) {
    return value.toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

/*
|--------------------------------------------------------------------------
| TAX REVENUE - COL002
|--------------------------------------------------------------------------
|
| CTC COLLECTION
|
| Accounts:
|
| 4-01-01-050-1
| Individual
|
| 4-01-01-050-2
| Individual - Barangay
|
| 4-01-01-050-3
| Corporation
|
| 4-01-01-050-4
| Individual Penalty
|
| 4-01-01-050-5
| Corporation Penalty
|
|--------------------------------------------------------------------------
*/

export default function TaxRevenueCOL002Group({
    row,
    header = false,
}: Props) {
    /*
    |--------------------------------------------------------------------------
    | GROUP HEADER
    |--------------------------------------------------------------------------
    */

    if (header) {
        return (
            <>
                <th
                    colSpan={5}
                    className="
                        border border-black
                        bg-slate-100
                        px-2
                        py-2
                        text-center
                        text-xs
                        font-bold
                        text-slate-800
                    "
                >
                    TAX REVENUE-COL002
                </th>
            </>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | DATA
    |--------------------------------------------------------------------------
    */

    return (
        <>
            {/* INDIVIDUAL */}
            <td
                className="
                    border border-black
                    px-2
                    py-2
                    text-right
                    text-xs
                    text-slate-700
                "
            >
                {formatAmount(
                    getValue(row, "tax_revenue_col002_individual")
                )}
            </td>

            {/* INDIVIDUAL - BARANGAY */}
            <td
                className="
                    border border-black
                    px-2
                    py-2
                    text-right
                    text-xs
                    text-slate-700
                "
            >
                {formatAmount(
                    getValue(
                        row,
                        "tax_revenue_col002_individual_barangay"
                    )
                )}
            </td>

            {/* CORPORATION */}
            <td
                className="
                    border border-black
                    px-2
                    py-2
                    text-right
                    text-xs
                    text-slate-700
                "
            >
                {formatAmount(
                    getValue(
                        row,
                        "tax_revenue_col002_corporation"
                    )
                )}
            </td>

            {/* INDIVIDUAL PENALTY */}
            <td
                className="
                    border border-black
                    px-2
                    py-2
                    text-right
                    text-xs
                    text-slate-700
                "
            >
                {formatAmount(
                    getValue(
                        row,
                        "tax_revenue_col002_individual_penalty"
                    )
                )}
            </td>

            {/* CORPORATION PENALTY */}
            <td
                className="
                    border border-black
                    px-2
                    py-2
                    text-right
                    text-xs
                    text-slate-700
                "
            >
                {formatAmount(
                    getValue(
                        row,
                        "tax_revenue_col002_corporation_penalty"
                    )
                )}
            </td>
        </>
    );
}

/*
|--------------------------------------------------------------------------
| SECOND HEADER ROW
|--------------------------------------------------------------------------
*/

export function TaxRevenueCOL002GroupColumns() {
    return (
        <>
            <th
                className="
                    border border-black
                    bg-white
                    px-2
                    py-2
                    text-center
                    text-xs
                    font-semibold
                "
            >
                INDIVIDUAL
            </th>

            <th
                className="
                    border border-black
                    bg-white
                    px-2
                    py-2
                    text-center
                    text-xs
                    font-semibold
                "
            >
                INDIVIDUAL
                <div className="text-[10px] font-normal text-slate-500">
                    BARANGAY
                </div>
            </th>

            <th
                className="
                    border border-black
                    bg-white
                    px-2
                    py-2
                    text-center
                    text-xs
                    font-semibold
                "
            >
                CORPORATION
            </th>

            <th
                className="
                    border border-black
                    bg-white
                    px-2
                    py-2
                    text-center
                    text-xs
                    font-semibold
                "
            >
                INDIVIDUAL
                <div className="text-[10px] font-normal text-slate-500">
                    PENALTY
                </div>
            </th>

            <th
                className="
                    border border-black
                    bg-white
                    px-2
                    py-2
                    text-center
                    text-xs
                    font-semibold
                "
            >
                CORPORATION
                <div className="text-[10px] font-normal text-slate-500">
                    PENALTY
                </div>
            </th>
        </>
    );
}