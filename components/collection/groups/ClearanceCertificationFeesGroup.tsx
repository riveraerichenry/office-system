"use client";

type CollectionRow = {
    values?: Record<
        string,
        number | string | null | undefined
    >;
};

type ClearanceCertificationFeesGroupProps = {
    row: CollectionRow;
    header?: boolean;
};

/* ============================================================
   CLEARANCE & CERTIFICATION FEES COLUMNS
============================================================ */

export function ClearanceCertificationFeesGroupColumns() {
    return (
        <th
            className="border border-black bg-slate-100 px-2 py-2 text-center text-xs font-bold text-slate-800"
        >
            CLEARANCE & CERTIFICATION FEES
        </th>
    );
}

/* ============================================================
   CLEARANCE & CERTIFICATION FEES GROUP
============================================================ */

export default function ClearanceCertificationFeesGroup({
    row,
    header = false,
}: ClearanceCertificationFeesGroupProps) {
    if (header) {
        return (
            <th
                colSpan={1}
                className="border border-black bg-slate-100 px-2 py-2 text-center text-xs font-bold text-slate-800"
            >
                CLEARANCE & CERTIFICATION FEES
            </th>
        );
    }

    const amount = Number(
        row.values?.[
            "clearance-certification-fees"
        ] ?? 0
    );

    return (
        <td className="border border-black px-2 py-2 text-right align-top">
            {Number.isFinite(amount)
                ? amount.toLocaleString("en-PH", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                  })
                : "0.00"}
        </td>
    );
}