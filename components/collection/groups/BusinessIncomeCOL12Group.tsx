"use client";

type CollectionRow = {
    values?: Record<
        string,
        number | string | null | undefined
    >;
};

type BusinessIncomeCOL012GroupProps = {
    row: CollectionRow;
    header?: boolean;
};

/* ============================================================
   FORMAT AMOUNT
============================================================ */

function formatAmount(value: unknown) {
    const amount = Number(value ?? 0);

    if (!Number.isFinite(amount)) {
        return "0.00";
    }

    return amount.toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

/* ============================================================
   BUSINESS INCOME-COL012 COLUMNS
============================================================ */

export function BusinessIncomeCOL012GroupColumns() {
    return (
        <th className="border border-black bg-slate-50 px-2 py-2 text-center text-xs font-bold text-slate-800">
            AMOUNT
        </th>
    );
}

/* ============================================================
   BUSINESS INCOME-COL012 GROUP
============================================================ */

export default function BusinessIncomeCOL012Group({
    row,
    header = false,
}: BusinessIncomeCOL012GroupProps) {
    /* --------------------------------------------------------
       GROUP HEADER
    -------------------------------------------------------- */

    if (header) {
        return (
            <th
                className="
                    border
                    border-black
                    bg-slate-100
                    px-3
                    py-2
                    text-center
                    text-xs
                    font-bold
                    text-slate-800
                "
            >
                BUSINESS INCOME-COL012
            </th>
        );
    }

    /* --------------------------------------------------------
       GROUP AMOUNT
    -------------------------------------------------------- */

    return (
        <td
            className="
                whitespace-nowrap
                border
                border-black
                px-3
                py-2
                text-right
                align-top
            "
        >
            {formatAmount(
                row.values?.["business-income"] ?? 0
            )}
        </td>
    );
}