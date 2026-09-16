"use client";

export type CollectionGroupRow = {
    values?: Record<string, number | string | null | undefined>;
    [key: string]: any;
};

type Props = {
    row: CollectionGroupRow;
    header?: boolean;
};

function getValue(
    row: CollectionGroupRow,
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
| RPT GROUP
|--------------------------------------------------------------------------
|
| REAL PROPERTY TAX
|
| Columns:
|
| BASIC
|   - Current
|   - Previous
|   - Advance
|
| SEF
|   - Current
|   - Previous
|   - Advance
|
| PENALTY
| DISCOUNT
|
|--------------------------------------------------------------------------
*/

export default function RPTGroup({
    row,
    header = false,
}: Props) {
    /*
    |--------------------------------------------------------------------------
    | HEADER
    |--------------------------------------------------------------------------
    */

    if (header) {
        return (
            <>
                <th
                    colSpan={8}
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
                    REAL PROPERTY TAX
                </th>
            </>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | DATA CELLS
    |--------------------------------------------------------------------------
    */

    return (
        <>
            {/* BASIC - CURRENT */}
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
                    getValue(row, "rpt_basic_current")
                )}
            </td>

            {/* BASIC - PREVIOUS */}
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
                    getValue(row, "rpt_basic_previous")
                )}
            </td>

            {/* BASIC - ADVANCE */}
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
                    getValue(row, "rpt_basic_advance")
                )}
            </td>

            {/* SEF - CURRENT */}
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
                    getValue(row, "rpt_sef_current")
                )}
            </td>

            {/* SEF - PREVIOUS */}
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
                    getValue(row, "rpt_sef_previous")
                )}
            </td>

            {/* SEF - ADVANCE */}
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
                    getValue(row, "rpt_sef_advance")
                )}
            </td>

            {/* PENALTY */}
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
                    getValue(row, "rpt_penalty")
                )}
            </td>

            {/* DISCOUNT */}
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
                    getValue(row, "rpt_discount")
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

export function RPTGroupColumns() {
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
                BASIC
                <div className="text-[10px] font-normal text-slate-500">
                    CURRENT
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
                BASIC
                <div className="text-[10px] font-normal text-slate-500">
                    PREVIOUS
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
                BASIC
                <div className="text-[10px] font-normal text-slate-500">
                    ADVANCE
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
                SEF
                <div className="text-[10px] font-normal text-slate-500">
                    CURRENT
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
                SEF
                <div className="text-[10px] font-normal text-slate-500">
                    PREVIOUS
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
                SEF
                <div className="text-[10px] font-normal text-slate-500">
                    ADVANCE
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
                PENALTY
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
                DISCOUNT
            </th>
        </>
    );
}