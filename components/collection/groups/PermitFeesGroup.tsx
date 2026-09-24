"use client";

import {
    useEffect,
    useState,
} from "react";


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


type PermitApiRow = {
    id: string;

    permit_mayors_permit?: number | string | null;

    permit_mtop?: number | string | null;

    permit_sanitary_permit?: number | string | null;

    permit_building_permit_80?: number | string | null;

    permit_meo_15?: number | string | null;

    permit_nga_5?: number | string | null;

    values?: {

        permit_mayors_permit?:
            number | string | null;

        permit_mtop?:
            number | string | null;

        permit_sanitary_permit?:
            number | string | null;

        permit_building_permit_80?:
            number | string | null;

        permit_meo_15?:
            number | string | null;

        permit_nga_5?:
            number | string | null;

    };
};


/* ============================================================
   API CACHE
============================================================ */

let permitCache:
    Map<string, PermitApiRow> | null =
        null;


let permitPromise:
    Promise<
        Map<string, PermitApiRow>
    > | null =
        null;


/* ============================================================
   LOAD API
============================================================ */

async function loadPermitData() {

    if (
        permitCache
    ) {

        return permitCache;

    }


    if (
        permitPromise
    ) {

        return permitPromise;

    }


    permitPromise =
        fetch(
            "/api/collection/permit-fees",
            {
                method: "GET",

                credentials:
                    "include",

                cache:
                    "no-store",
            }
        )
            .then(
                async (
                    response
                ) => {

                    const result =
                        await response.json();


                    if (
                        !response.ok ||
                        !result?.success
                    ) {

                        throw new Error(
                            result?.message ??
                            "Failed to load PERMIT FEES."
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
                            PermitApiRow
                        >();


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


                    permitCache =
                        map;


                    return map;

                }
            )
            .catch(
                (
                    error
                ) => {

                    permitPromise =
                        null;

                    throw error;

                }
            );


    return permitPromise;
}


/* ============================================================
   NUMBER
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
   FORMAT
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

export const PermitFeesGroupColumns =
    () => {

        return (
            <>

                {/* MAYORS PERMIT */}

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
                    Mayors Permit
                </th>


                {/* MTOP */}

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
                    MTOP
                </th>


                {/* SANITARY PERMIT */}

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
                    SANITARY PERMIT
                </th>


                {/* BUILDING */}

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
                    Building Ins./permit (80%)
                </th>


                {/* MEO */}

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
                    due to other funds-MEO(15%)
                </th>


                {/* NGA */}

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
                    due to NGA(5%)
                </th>

            </>
        );
    };


/* ============================================================
   COMPONENT
============================================================ */

export default function PermitFeesGroup({
    row,
    header = false,
}: {
    row: CollectionRow;

    header?: boolean;
}) {

    /* ========================================================
       GROUP HEADER
    ======================================================== */

    if (
        header
    ) {

        return (
            <th
                colSpan={6}
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
                PERMIT FEES
            </th>
        );

    }


    /* ========================================================
       STATE
    ======================================================== */

    const [
        mayorsPermit,
        setMayorsPermit,
    ] = useState(0);


    const [
        mtop,
        setMtop,
    ] = useState(0);


    const [
        sanitaryPermit,
        setSanitaryPermit,
    ] = useState(0);


    const [
        buildingPermit,
        setBuildingPermit,
    ] = useState(0);


    const [
        meo15,
        setMeo15,
    ] = useState(0);


    const [
        nga5,
        setNga5,
    ] = useState(0);


    /* ========================================================
       LOAD DATA FOR THIS REMITTANCE
    ======================================================== */

    useEffect(
        () => {

            let mounted =
                true;


            async function load() {

                try {

                    const map =
                        await loadPermitData();


                    if (
                        !mounted
                    ) {

                        return;

                    }


                    const data =
                        row?.id
                            ? map.get(
                                  String(
                                      row.id
                                  )
                              )
                            : undefined;


                    if (
                        !data
                    ) {

                        setMayorsPermit(0);

                        setMtop(0);

                        setSanitaryPermit(0);

                        setBuildingPermit(0);

                        setMeo15(0);

                        setNga5(0);

                        return;

                    }


                    setMayorsPermit(
                        toNumber(
                            data
                                ?.values
                                ?.permit_mayors_permit ??
                            data
                                .permit_mayors_permit
                        )
                    );


                    setMtop(
                        toNumber(
                            data
                                ?.values
                                ?.permit_mtop ??
                            data
                                .permit_mtop
                        )
                    );


                    setSanitaryPermit(
                        toNumber(
                            data
                                ?.values
                                ?.permit_sanitary_permit ??
                            data
                                .permit_sanitary_permit
                        )
                    );


                    setBuildingPermit(
                        toNumber(
                            data
                                ?.values
                                ?.permit_building_permit_80 ??
                            data
                                .permit_building_permit_80
                        )
                    );


                    setMeo15(
                        toNumber(
                            data
                                ?.values
                                ?.permit_meo_15 ??
                            data
                                .permit_meo_15
                        )
                    );


                    setNga5(
                        toNumber(
                            data
                                ?.values
                                ?.permit_nga_5 ??
                            data
                                .permit_nga_5
                        )
                    );

                } catch (
                    error
                ) {

                    console.error(
                        "PERMIT FEES GROUP LOAD ERROR:",
                        error
                    );


                    if (
                        !mounted
                    ) {

                        return;

                    }


                    setMayorsPermit(0);

                    setMtop(0);

                    setSanitaryPermit(0);

                    setBuildingPermit(0);

                    setMeo15(0);

                    setNga5(0);

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

            {/* MAYORS PERMIT */}

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
                    mayorsPermit
                )}
            </td>


            {/* MTOP */}

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
                    mtop
                )}
            </td>


            {/* SANITARY PERMIT */}

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
                    sanitaryPermit
                )}
            </td>


            {/* BUILDING PERMIT 80% */}

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
                    buildingPermit
                )}
            </td>


            {/* MEO 15% */}

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
                    meo15
                )}
            </td>


            {/* NGA 5% */}

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
                    nga5
                )}
            </td>

        </>
    );
}