"use client";

import { useEffect, useState } from "react";


/* ============================================================
   TYPES
============================================================ */

type CollectionRow = {
    id?: string;

    values?: Record<
        string,
        number | string | null | undefined
    >;
};


type TaxGoodsApiRow = {
    id: string;

    remittance_no?: string | null;

    values?: {
        tax_goods_business_tax_license?:
            | number
            | string
            | null;

        tax_goods_peddlers?:
            | number
            | string
            | null;

        tax_goods_fines_penalties?:
            | number
            | string
            | null;
    };

    tax_goods_business_tax_license?:
        number | string | null;

    tax_goods_peddlers?:
        number | string | null;

    tax_goods_fines_penalties?:
        number | string | null;
};


/* ============================================================
   SHARED API CACHE
============================================================ */

/*
 * The group component appears once for every remittance row.
 *
 * We DO NOT want every row to make another API request.
 *
 * Therefore:
 *
 *      first row
 *          ↓
 *      fetch API
 *          ↓
 *      cache result
 *
 * All other rows reuse the same Promise/cache.
 */

let taxGoodsCache:
    Map<string, TaxGoodsApiRow> | null = null;


let taxGoodsPromise:
    Promise<Map<string, TaxGoodsApiRow>> | null =
        null;


/* ============================================================
   LOAD TAX GOODS DATA
============================================================ */

async function loadTaxGoodsData(): Promise<
    Map<string, TaxGoodsApiRow>
> {

    /*
     * Already loaded.
     */

    if (taxGoodsCache) {
        return taxGoodsCache;
    }


    /*
     * Already loading.
     *
     * Reuse the existing request.
     */

    if (taxGoodsPromise) {
        return taxGoodsPromise;
    }


    /*
     * Create shared request.
     */

    taxGoodsPromise =
        fetch(
            "/api/collection/tax-goods-col004",
            {
                method: "GET",

                credentials:
                    "include",

                cache:
                    "no-store",
            }
        )
            .then(
                async (response) => {

                    const result =
                        await response.json();


                    if (
                        !response.ok ||
                        !result?.success
                    ) {

                        throw new Error(
                            result?.message ??
                                "Failed to load TAXES ON GOODS & SERVICES-COL004."
                        );
                    }


                    const apiRows =
                        Array.isArray(
                            result?.data
                        )
                            ? result.data
                            : [];


                    const map =
                        new Map<
                            string,
                            TaxGoodsApiRow
                        >();


                    /*
                     * Index by REMITTANCE ID.
                     */

                    for (
                        const item
                        of apiRows
                    ) {

                        if (
                            item?.id
                        ) {

                            map.set(
                                String(
                                    item.id
                                ),
                                item
                            );

                        }

                    }


                    taxGoodsCache =
                        map;


                    return map;
                }
            )
            .catch(
                (error) => {

                    /*
                     * Allow a later attempt if the request
                     * failed.
                     */

                    taxGoodsPromise =
                        null;


                    throw error;
                }
            );


    return taxGoodsPromise;
}


/* ============================================================
   NUMBER HELPER
============================================================ */

function toNumber(
    value: unknown
): number {

    const number =
        Number(
            value ?? 0
        );


    return Number.isFinite(
        number
    )
        ? number
        : 0;
}


/* ============================================================
   FORMAT AMOUNT
============================================================ */

function formatAmount(
    value: unknown
): string {

    return toNumber(
        value
    ).toLocaleString(
        "en-PH",
        {
            minimumFractionDigits:
                2,

            maximumFractionDigits:
                2,
        }
    );
}


/* ============================================================
   COLUMN HEADERS
============================================================ */

export const TaxGoodsCOL004GroupColumns =
    () => {

        return (
            <>

                {/* =============================================
                    BUSINESS TAX / LICENSE
                ============================================= */}

                <th
                    className="
                        border
                        border-black
                        bg-white
                        px-3
                        py-2
                        text-center
                        text-xs
                        font-bold
                        text-slate-800
                    "
                >
                    Business Tax / License
                </th>


                {/* =============================================
                    PEDDLERS
                ============================================= */}

                <th
                    className="
                        border
                        border-black
                        bg-white
                        px-3
                        py-2
                        text-center
                        text-xs
                        font-bold
                        text-slate-800
                    "
                >
                    Peddlers
                </th>


                {/* =============================================
                    FINES / PENALTIES
                ============================================= */}

                <th
                    className="
                        border
                        border-black
                        bg-white
                        px-3
                        py-2
                        text-center
                        text-xs
                        font-bold
                        text-slate-800
                    "
                >
                    Fines / Penalties
                </th>

            </>
        );
    };


/* ============================================================
   COMPONENT
============================================================ */

export default function TaxGoodsCOL004Group({
    row,
    header = false,
}: {
    row: CollectionRow;

    header?: boolean;
}) {

    /* ========================================================
       HEADER
    ======================================================== */

    if (header) {

        return (
            <th
                colSpan={3}
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
                TAXES ON GOODS &amp; SERVICES-COL004
            </th>
        );
    }


    /* ========================================================
       LOCAL VALUES
    ======================================================== */

    const [
        businessTaxLicense,
        setBusinessTaxLicense,
    ] = useState(0);


    const [
        peddlers,
        setPeddlers,
    ] = useState(0);


    const [
        finesPenalties,
        setFinesPenalties,
    ] = useState(0);


    /* ========================================================
       LOAD GROUP DATA
    ======================================================== */

    useEffect(
        () => {

            let mounted =
                true;


            async function load() {

                try {

                    const map =
                        await loadTaxGoodsData();


                    if (!mounted) {
                        return;
                    }


                    /*
                     * Main CollectionTable row.id
                     * is the REMITTANCE ID.
                     */

                    const data =
                        row?.id
                            ? map.get(
                                  String(
                                      row.id
                                  )
                              )
                            : undefined;


                    if (!data) {

                        setBusinessTaxLicense(
                            0
                        );

                        setPeddlers(
                            0
                        );

                        setFinesPenalties(
                            0
                        );

                        return;
                    }


                    /*
                     * Read the values returned by
                     * the dedicated COL004 API.
                     */

                    const businessTax =
                        toNumber(
                            data
                                ?.values
                                ?.tax_goods_business_tax_license ??
                                data.tax_goods_business_tax_license
                        );


                    const peddlerAmount =
                        toNumber(
                            data
                                ?.values
                                ?.tax_goods_peddlers ??
                                data.tax_goods_peddlers
                        );


                    const penaltyAmount =
                        toNumber(
                            data
                                ?.values
                                ?.tax_goods_fines_penalties ??
                                data.tax_goods_fines_penalties
                        );


                    setBusinessTaxLicense(
                        businessTax
                    );


                    setPeddlers(
                        peddlerAmount
                    );


                    setFinesPenalties(
                        penaltyAmount
                    );

                } catch (
                    error
                ) {

                    console.error(
                        "TAX GOODS COL004 GROUP LOAD ERROR:",
                        error
                    );


                    /*
                     * Keep the row visible and show
                     * zero instead of breaking the table.
                     */

                    if (!mounted) {
                        return;
                    }


                    setBusinessTaxLicense(
                        0
                    );


                    setPeddlers(
                        0
                    );


                    setFinesPenalties(
                        0
                    );

                }

            }


            load();


            return () => {

                mounted =
                    false;

            };

        },
        [
            row?.id,
        ]
    );


    /* ========================================================
       RENDER
    ======================================================== */

    return (
        <>

            {/* ==================================================
                BUSINESS TAX / LICENSE
            ================================================== */}

            <td
                className="
                    whitespace-nowrap
                    border
                    border-black
                    px-3
                    py-2
                    text-right
                    align-top
                    text-sm
                "
            >
                {formatAmount(
                    businessTaxLicense
                )}
            </td>


            {/* ==================================================
                PEDDLERS
            ================================================== */}

            <td
                className="
                    whitespace-nowrap
                    border
                    border-black
                    px-3
                    py-2
                    text-right
                    align-top
                    text-sm
                "
            >
                {formatAmount(
                    peddlers
                )}
            </td>


            {/* ==================================================
                FINES / PENALTIES
            ================================================== */}

            <td
                className="
                    whitespace-nowrap
                    border
                    border-black
                    px-3
                    py-2
                    text-right
                    align-top
                    text-sm
                "
            >
                {formatAmount(
                    finesPenalties
                )}
            </td>

        </>
    );
}