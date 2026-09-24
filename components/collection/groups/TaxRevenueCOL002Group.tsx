"use client";

import {
    useEffect,
    useState,
} from "react";


/* ============================================================
   TYPES
============================================================ */

export type TaxRevenueCOL002Row = {
    id?: string;

    remittance_id?: string | null;

    remittance_no?: string | null;

    values?: Record<
        string,
        number | string | null | undefined
    >;

    [key: string]: any;
};


type Props = {
    row: TaxRevenueCOL002Row;
    header?: boolean;
};


type TaxRevenueAPIItem = {
    id: string;

    remittance_no: string | null;

    remittance_date: string | null;

    total_amount: number;

    values?: {
        ctc_corporation?: number | string | null;
        ctc_individual?: number | string | null;
        ctc_penalty?: number | string | null;
    };
};


type TaxRevenueAPIResponse = {
    success: boolean;

    data?: TaxRevenueAPIItem[];

    message?: string;
};


/* ============================================================
   SHARED FETCH CACHE

   The group API is fetched once and reused by all rows.
============================================================ */

let taxRevenueRequest:
    Promise<TaxRevenueAPIItem[]> | null = null;


let taxRevenueCache:
    TaxRevenueAPIItem[] | null = null;


async function loadTaxRevenueData(): Promise<
    TaxRevenueAPIItem[]
> {
    if (taxRevenueCache) {
        return taxRevenueCache;
    }

    if (taxRevenueRequest) {
        return taxRevenueRequest;
    }

    taxRevenueRequest = fetch(
        "/api/collection/tax-revenue-col002",
        {
            method: "GET",
            credentials: "include",
            cache: "no-store",
        }
    )
        .then(async (response) => {
            const result =
                (await response.json()) as TaxRevenueAPIResponse;

            if (
                !response.ok ||
                !result.success
            ) {
                throw new Error(
                    result.message ??
                        "Failed to load Tax Revenue-COL002."
                );
            }

            const data =
                Array.isArray(result.data)
                    ? result.data
                    : [];

            taxRevenueCache = data;

            return data;
        })
        .finally(() => {
            taxRevenueRequest = null;
        });

    return taxRevenueRequest;
}


/* ============================================================
   HELPERS
============================================================ */

function toNumber(
    value: unknown
): number {
    const numberValue =
        Number(value ?? 0);

    return Number.isFinite(
        numberValue
    )
        ? numberValue
        : 0;
}


function formatAmount(
    value: unknown
): string {
    return toNumber(
        value
    ).toLocaleString(
        "en-PH",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }
    );
}


/* ============================================================
   GET REMITTANCE ID
============================================================ */

function getRemittanceId(
    row: TaxRevenueCOL002Row
): string {
    return String(
        row.id ??
            row.remittance_id ??
            ""
    );
}


/* ============================================================
   GET GROUP DATA FOR CURRENT ROW
============================================================ */

function getGroupData(
    data: TaxRevenueAPIItem[],
    row: TaxRevenueCOL002Row
): TaxRevenueAPIItem | null {
    const remittanceId =
        getRemittanceId(row);

    if (!remittanceId) {
        return null;
    }

    return (
        data.find(
            (item) =>
                String(item.id) ===
                remittanceId
        ) ?? null
    );
}


/* ============================================================
   TAX REVENUE-COL002 GROUP
===============================================================
   COLUMNS

   1. DUE TO-LGU 50%      → DISREGARD FOR NOW
   2. CTC-brgy(50%)       → DISREGARD FOR NOW
   3. CTC-corp.           → GET FROM API
   4. CTC-indv.           → GET FROM API
   5. CTC-PEN.            → GET FROM API
============================================================ */

export default function TaxRevenueCOL002Group({
    row,
    header = false,
}: Props) {
    const [
        apiItem,
        setApiItem,
    ] = useState<
        TaxRevenueAPIItem | null
    >(null);


    /* ========================================================
       LOAD SEPARATE API
    ======================================================== */

    useEffect(() => {
        if (header) {
            return;
        }

        let cancelled = false;

        loadTaxRevenueData()
            .then((data) => {
                if (cancelled) {
                    return;
                }

                const current =
                    getGroupData(
                        data,
                        row
                    );

                setApiItem(
                    current
                );
            })
            .catch((error) => {
                console.error(
                    "TAX REVENUE-COL002 GROUP LOAD ERROR:",
                    error
                );

                if (!cancelled) {
                    setApiItem(null);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [header, row]);


    /* ========================================================
       GROUP HEADER
    ======================================================== */

    if (header) {
        return (
            <th
                colSpan={5}
                className="
                    border
                    border-black
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
        );
    }


    /* ========================================================
       GET VALUES
    ======================================================== */

    const corporation =
        apiItem?.values
            ?.ctc_corporation ?? 0;

    const individual =
        apiItem?.values
            ?.ctc_individual ?? 0;

    const penalty =
        apiItem?.values
            ?.ctc_penalty ?? 0;


    /* ========================================================
       RENDER
    ======================================================== */

    return (
        <>
            {/* ==================================================
                DUE TO-LGU 50%

                DISREGARDED FOR NOW
            ================================================== */}

            <td
                className="
                    border
                    border-black
                    px-2
                    py-2
                    text-right
                    text-xs
                    text-slate-400
                "
            >
                —
            </td>


            {/* ==================================================
                CTC-brgy(50%)

                DISREGARDED FOR NOW
            ================================================== */}

            <td
                className="
                    border
                    border-black
                    px-2
                    py-2
                    text-right
                    text-xs
                    text-slate-400
                "
            >
                —
            </td>


            {/* ==================================================
                CTC-corp.
            ================================================== */}

            <td
                className="
                    border
                    border-black
                    px-2
                    py-2
                    text-right
                    text-xs
                    text-slate-700
                "
            >
                {formatAmount(
                    corporation
                )}
            </td>


            {/* ==================================================
                CTC-indv.
            ================================================== */}

            <td
                className="
                    border
                    border-black
                    px-2
                    py-2
                    text-right
                    text-xs
                    text-slate-700
                "
            >
                {formatAmount(
                    individual
                )}
            </td>


            {/* ==================================================
                CTC-PEN.
            ================================================== */}

            <td
                className="
                    border
                    border-black
                    px-2
                    py-2
                    text-right
                    text-xs
                    text-slate-700
                "
            >
                {formatAmount(
                    penalty
                )}
            </td>
        </>
    );
}


/* ============================================================
   SECOND HEADER ROW
============================================================ */

export function TaxRevenueCOL002GroupColumns() {
    return (
        <>
            {/* DUE TO-LGU 50% */}

            <th
                className="
                    border
                    border-black
                    bg-white
                    px-2
                    py-2
                    text-center
                    text-xs
                    font-semibold
                    text-slate-800
                "
            >
                DUE TO-LGU 50%
            </th>


            {/* CTC-brgy(50%) */}

            <th
                className="
                    border
                    border-black
                    bg-white
                    px-2
                    py-2
                    text-center
                    text-xs
                    font-semibold
                    text-slate-800
                "
            >
                CTC-brgy(50%)
            </th>


            {/* CTC-corp. */}

            <th
                className="
                    border
                    border-black
                    bg-white
                    px-2
                    py-2
                    text-center
                    text-xs
                    font-semibold
                    text-slate-800
                "
            >
                CTC-corp.
            </th>


            {/* CTC-indv. */}

            <th
                className="
                    border
                    border-black
                    bg-white
                    px-2
                    py-2
                    text-center
                    text-xs
                    font-semibold
                    text-slate-800
                "
            >
                CTC-indv.
            </th>


            {/* CTC-PEN. */}

            <th
                className="
                    border
                    border-black
                    bg-white
                    px-2
                    py-2
                    text-center
                    text-xs
                    font-semibold
                    text-slate-800
                "
            >
                CTC-PEN.
            </th>
        </>
    );
}