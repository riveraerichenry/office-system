"use client";

export type CollectionGroupRow = {
    basic?: number | string | null;
    sef?: number | string | null;
    penalty?: number | string | null;
    discount?: number | string | null;
    total?: number | string | null;

    values?: Record<
        string,
        number | string | null | undefined
    >;

    [key: string]: any;
};

type Props = {
    row: CollectionGroupRow;
    header?: boolean;
};


/* ============================================================
   GET VALUE
============================================================ */

function getValue(
    row: CollectionGroupRow,
    key:
        | "basic"
        | "sef"
        | "penalty"
        | "discount"
        | "total"
): number {

    const value =
        row?.[key];

    const numberValue =
        Number(value ?? 0);

    return Number.isFinite(
        numberValue
    )
        ? numberValue
        : 0;
}


/* ============================================================
   FORMAT AMOUNT
============================================================ */

function formatAmount(
    value: number
) {

    return value.toLocaleString(
        "en-PH",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }
    );

}


/* ============================================================
   RPT GROUP
============================================================ */

export default function RPTGroup({
    row,
    header = false,
}: Props) {

    /* ========================================================
       GROUP HEADER
    ======================================================== */

    if (header) {

        return (
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
                REAL PROPERTY TAX
            </th>
        );

    }


    /* ========================================================
       VALUES
    ======================================================== */

    const basic =
        getValue(
            row,
            "basic"
        );


    const sef =
        getValue(
            row,
            "sef"
        );


    const penalty =
        getValue(
            row,
            "penalty"
        );


    const discount =
        getValue(
            row,
            "discount"
        );


    const total =
        getValue(
            row,
            "total"
        );


    /* ========================================================
       DATA CELLS
    ======================================================== */

    return (
        <>

            {/* ==================================================
                BASIC
            ================================================== */}

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
                {formatAmount(basic)}
            </td>


            {/* ==================================================
                SEF
            ================================================== */}

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
                {formatAmount(sef)}
            </td>


            {/* ==================================================
                PENALTY
            ================================================== */}

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
                {formatAmount(penalty)}
            </td>


            {/* ==================================================
                DISCOUNT
            ================================================== */}

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
                {formatAmount(discount)}
            </td>


            {/* ==================================================
                TOTAL
            ================================================== */}

            <td
                className="
                    border border-black
                    px-2
                    py-2
                    text-right
                    text-xs
                    font-semibold
                    text-slate-800
                "
            >
                {formatAmount(total)}
            </td>

        </>
    );

}


/* ============================================================
   SECOND HEADER ROW
============================================================ */

export function RPTGroupColumns() {

    return (
        <>

            {/* ==================================================
                BASIC
            ================================================== */}

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
            </th>


            {/* ==================================================
                SEF
            ================================================== */}

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
            </th>


            {/* ==================================================
                PENALTY
            ================================================== */}

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


            {/* ==================================================
                DISCOUNT
            ================================================== */}

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


            {/* ==================================================
                TOTAL
            ================================================== */}

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
                TOTAL
            </th>

        </>
    );

}