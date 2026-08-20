import { NextRequest, NextResponse } from "next/server";
import { mysqlPool } from "@/lib/mysql";

type FaaSRecord = {
    objid: string;
    realpropertyid: string;

    tdno: string | null;
    utdno: string | null;
    prevtdno: string | null;

    state: string | null;

    effectivityyear: number | null;
    effectivityqtr: number | null;

    totalav: number | string | null;
    totalmv: number | string | null;

    fullpin: string | null;
    pin: string | null;

    owner_name: string | null;
    owner_address: string | null;

    barangayid: string | null;
    barangay_name: string | null;

    classification_name: string | null;
    rputype: string | null;
};

function isValidEffectivity(
    year: number | null,
    quarter: number | null
) {
    if (
        year === null ||
        quarter === null
    ) {
        return false;
    }

    if (!Number.isInteger(year)) {
        return false;
    }

    if (!Number.isInteger(quarter)) {
        return false;
    }

    // Ignore obviously corrupt years
    if (year < 1900 || year > 2100) {
        return false;
    }

    // Valid quarters only
    if (quarter < 1 || quarter > 4) {
        return false;
    }

    return true;
}


/*
|--------------------------------------------------------------------------
| Convert prevtdno into individual TD numbers
|--------------------------------------------------------------------------
|
| Example:
|
| "24-23-0024-00415, 024-0373-A"
|
| becomes:
|
| [
|     "24-23-0024-00415",
|     "024-0373-A"
| ]
|
*/

function parsePreviousTDs(
    value: string | null
): string[] {

    if (!value) {
        return [];
    }

    return value
        .split(",")
        .map((item) => item.trim())
        .filter(
            (item) =>
                item.length > 0 &&
                item.toUpperCase() !== "NEW"
        );
}


export async function GET(
    req: NextRequest
) {

    try {

        const { searchParams } =
            new URL(req.url);

        const pin = (
            searchParams.get("pin") || ""
        ).trim();

        if (!pin) {

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "PIN is required.",
                },
                { status: 400 }
            );
        }


        /*
        |--------------------------------------------------------------------------
        | STEP 1
        | Find FAAS records associated with the PIN.
        |
        | DO NOT filter by state.
        |--------------------------------------------------------------------------
        */

        const [pinRowsRaw] =
            await mysqlPool.query(
                `
                SELECT
                    objid,
                    realpropertyid,
                    tdno,
                    utdno,
                    prevtdno,
                    state,
                    effectivityyear,
                    effectivityqtr,
                    totalav,
                    totalmv,
                    fullpin,
                    pin,
                    owner_name,
                    owner_address,
                    barangayid,
                    barangay_name,
                    classification_name,
                    rputype
                FROM vw_faas_lookup
                WHERE pin = ?
                   OR fullpin = ?
                ORDER BY
                    effectivityyear DESC,
                    effectivityqtr DESC
                `,
                [
                    pin,
                    pin,
                ]
            );

        const pinRows =
            pinRowsRaw as FaaSRecord[];


        if (pinRows.length === 0) {

            return NextResponse.json({
                success: true,
                pin,
                current: null,
                count: 0,
                revisions: [],
                message:
                    "No FAAS record found.",
            });

        }


        /*
        |--------------------------------------------------------------------------
        | STEP 2
        | Only records with valid effectivity dates can participate.
        |--------------------------------------------------------------------------
        */

        const validPinRows =
            pinRows.filter(
                (row) =>
                    isValidEffectivity(
                        Number(
                            row.effectivityyear
                        ),
                        Number(
                            row.effectivityqtr
                        )
                    )
            );


        if (
            validPinRows.length === 0
        ) {

            return NextResponse.json({
                success: true,
                pin,
                current: null,
                count: 0,
                revisions: [],
                message:
                    "FAAS records were found, but all have invalid effectivity dates.",
            });

        }


        /*
        |--------------------------------------------------------------------------
        | STEP 3
        | Latest valid FAAS for this PIN.
        |--------------------------------------------------------------------------
        */

        const current =
            validPinRows[0];


        /*
        |--------------------------------------------------------------------------
        | STEP 4
        | Revision collection.
        |--------------------------------------------------------------------------
        */

        const revisions: FaaSRecord[] = [
            current,
        ];


        /*
        |--------------------------------------------------------------------------
        | Track objects and TDs already visited.
        |--------------------------------------------------------------------------
        */

        const visitedObjids =
            new Set<string>();

        const visitedTDs =
            new Set<string>();


        if (current.objid) {
            visitedObjids.add(
                current.objid
            );
        }

        if (current.tdno) {
            visitedTDs.add(
                current.tdno
            );
        }


        /*
        |--------------------------------------------------------------------------
        | We may have multiple previous TDs.
        |
        | Use a queue instead of a single previousTD variable.
        |--------------------------------------------------------------------------
        */

        const queue =
            parsePreviousTDs(
                current.prevtdno
            );


        /*
        |--------------------------------------------------------------------------
        | STEP 5
        | Follow previous TDs.
        |--------------------------------------------------------------------------
        */

        while (queue.length > 0) {

            const previousTD =
                queue.shift();

            if (!previousTD) {
                continue;
            }


            /*
            |--------------------------------------------------------------------------
            | Prevent circular references.
            |--------------------------------------------------------------------------
            */

            if (
                visitedTDs.has(
                    previousTD
                )
            ) {
                continue;
            }


            /*
            |--------------------------------------------------------------------------
            | Search previous TD in vw_faas_lookup.
            |
            | CURRENT and CANCELLED are both allowed.
            |--------------------------------------------------------------------------
            */

            const [previousRowsRaw] =
                await mysqlPool.query(
                    `
                    SELECT
                        objid,
                        realpropertyid,
                        tdno,
                        utdno,
                        prevtdno,
                        state,
                        effectivityyear,
                        effectivityqtr,
                        totalav,
                        totalmv,
                        fullpin,
                        pin,
                        owner_name,
                        owner_address,
                        barangayid,
                        barangay_name,
                        classification_name,
                        rputype
                    FROM vw_faas_lookup
                    WHERE tdno = ?
                       OR utdno = ?
                    `,
                    [
                        previousTD,
                        previousTD,
                    ]
                );


            const previousRows =
                previousRowsRaw as FaaSRecord[];


            /*
            |--------------------------------------------------------------------------
            | Previous TD doesn't exist.
            |
            | Ignore it.
            |--------------------------------------------------------------------------
            */

            if (
                previousRows.length === 0
            ) {
                continue;
            }


            /*
            |--------------------------------------------------------------------------
            | Ignore invalid effectivity records.
            |--------------------------------------------------------------------------
            */

            const validMatches =
                previousRows.filter(
                    (row) =>
                        isValidEffectivity(
                            Number(
                                row.effectivityyear
                            ),
                            Number(
                                row.effectivityqtr
                            )
                        )
                );


            if (
                validMatches.length === 0
            ) {
                continue;
            }


            /*
            |--------------------------------------------------------------------------
            | If multiple records exist for the same TD,
            | choose the latest valid one.
            |--------------------------------------------------------------------------
            */

            validMatches.sort(
                (a, b) => {

                    const yearDiff =
                        Number(
                            b.effectivityyear
                        ) -
                        Number(
                            a.effectivityyear
                        );

                    if (
                        yearDiff !== 0
                    ) {
                        return yearDiff;
                    }

                    return (
                        Number(
                            b.effectivityqtr
                        ) -
                        Number(
                            a.effectivityqtr
                        )
                    );
                }
            );


            const previous =
                validMatches[0];


            /*
            |--------------------------------------------------------------------------
            | Prevent duplicate records.
            |--------------------------------------------------------------------------
            */

            if (
                visitedObjids.has(
                    previous.objid
                )
            ) {
                continue;
            }


            visitedObjids.add(
                previous.objid
            );


            if (previous.tdno) {
                visitedTDs.add(
                    previous.tdno
                );
            }


            /*
            |--------------------------------------------------------------------------
            | Add historical revision.
            |--------------------------------------------------------------------------
            */

            revisions.push(
                previous
            );


            /*
            |--------------------------------------------------------------------------
            | Follow ALL previous TD references.
            |--------------------------------------------------------------------------
            */

            const olderTDs =
                parsePreviousTDs(
                    previous.prevtdno
                );


            for (
                const olderTD of olderTDs
            ) {

                if (
                    !visitedTDs.has(
                        olderTD
                    )
                ) {

                    queue.push(
                        olderTD
                    );

                }

            }

        }


        /*
        |--------------------------------------------------------------------------
        | STEP 6
        | Sort oldest → newest.
        |--------------------------------------------------------------------------
        */

        revisions.sort(
            (a, b) => {

                const yearDiff =
                    Number(
                        a.effectivityyear
                    ) -
                    Number(
                        b.effectivityyear
                    );

                if (
                    yearDiff !== 0
                ) {
                    return yearDiff;
                }

                return (
                    Number(
                        a.effectivityqtr
                    ) -
                    Number(
                        b.effectivityqtr
                    )
                );
            }
        );


        /*
        |--------------------------------------------------------------------------
        | RESPONSE
        |--------------------------------------------------------------------------
        */

        return NextResponse.json({

            success: true,

            pin,

            current,

            count:
                revisions.length,

            revisions,

        });


    } catch (error: any) {

        console.error(
            "FAAS HISTORY ERROR:",
            error
        );


        return NextResponse.json(
            {
                success: false,
                message:
                    error?.message ||
                    "Failed to retrieve FAAS history.",
            },
            {
                status: 500,
            }
        );
    }
}