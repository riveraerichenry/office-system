"use client";

type CollectionRow = {
    values?: Record<
        string,
        number | string | null | undefined
    >;
};

type RegistrationGroupProps = {
    row: CollectionRow;
    header?: boolean;
};

/* ============================================================
   REGISTRATION GROUP COLUMNS
============================================================ */

export function RegistrationGroupColumns() {
    return (
        <th
            className="border border-black bg-slate-100 px-2 py-2 text-center text-xs font-bold text-slate-800"
        >
            REGISTRATION
        </th>
    );
}

/* ============================================================
   FORMAT AMOUNT
============================================================ */

function formatAmount(value: unknown): string {
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
   REGISTRATION GROUP
============================================================ */

export default function RegistrationGroup({
    row,
    header = false,
}: RegistrationGroupProps) {
    /*
     * GROUP HEADER
     */
    if (header) {
        return (
            <th
                colSpan={1}
                className="border border-black bg-slate-100 px-2 py-2 text-center text-xs font-bold text-slate-800"
            >
                REGISTRATION
            </th>
        );
    }

    /*
     * GROUP AMOUNT
     *
     * API wiring will be done later.
     */
    return (
        <td className="border border-black px-2 py-2 text-right align-top">
            {formatAmount(
                row.values?.registration ?? 0
            )}
        </td>
    );
}