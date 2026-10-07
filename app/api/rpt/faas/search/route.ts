import { NextRequest, NextResponse } from "next/server";
import { mysqlPool } from "@/lib/mysql";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const q = (searchParams.get("q") || "").trim();
        const type = (
            searchParams.get("type") || "any"
        ).toLowerCase();

        if (!q) {
            return NextResponse.json({
                success: true,
                results: [],
            });
        }

        /*
        |--------------------------------------------------------------------------
        | SELECT
        |--------------------------------------------------------------------------
        */

        let sql = `
            SELECT
                objid,
                state,
                rpuid,
                utdno,
                tdno,
                txntype_objid,
                effectivityyear,
                effectivityqtr,
                taxpayer_objid,
                owner_name,
                owner_address,
                prevtdno,
                cancelreason,
                cancelledbytdnos,
                lguid,
                realpropertyid,
                fullpin,
                originlguid,
                taxpayer_name,
                taxpayer_address,
                classification_code,
                classcode,
                classification_name,
                classname,
                ry,
                rputype,
                totalmv,
                totalav,
                totalareasqm,
                totalareaha,
                barangayid,
                cadastrallotno,
                blockno,
                surveyno,
                pin,
                barangay_name,
                trackingno
            FROM vw_faas_lookup
            WHERE state <> 'CANCELLED'
        `;

        /*
        |--------------------------------------------------------------------------
        | SEARCHABLE FIELDS
        |--------------------------------------------------------------------------
        |
        | Every search token will be checked against these fields.
        |
        */

        const searchableFields = [
            "owner_name",
            "taxpayer_name",
            "owner_address",
            "taxpayer_address",
            "tdno",
            "prevtdno",
            "utdno",
            "rpuid",
            "realpropertyid",
            "fullpin",
            "pin",
            "barangay_name",
            "classification_name",
            "classname",
            "classification_code",
            "classcode",
            "rputype",
            "cadastrallotno",
            "blockno",
            "surveyno",
            "trackingno",
        ];

        const params: string[] = [];

        /*
        |--------------------------------------------------------------------------
        | CLEAN SEARCH
        |--------------------------------------------------------------------------
        |
        | Example:
        |
        | "Henry P. Rivera"
        |
        | becomes:
        |
        | ["Henry", "P.", "Rivera"]
        |
        */

        const tokens = q
            .split(/\s+/)
            .map((token) => token.trim())
            .filter(Boolean);

        /*
        |--------------------------------------------------------------------------
        | TYPE-SPECIFIC SEARCH
        |--------------------------------------------------------------------------
        */

        if (type === "owner") {
            /*
             * Every word must be found somewhere inside owner_name.
             *
             * "Henry P Rivera"
             * will match:
             *
             * "Eric Henry P. Rivera"
             */

            for (const token of tokens) {
                sql += `
                    AND owner_name LIKE ?
                `;

                params.push(`%${token}%`);
            }
        } else if (type === "td") {
            /*
             * TD search.
             *
             * Every token can match either TD number
             * or previous TD number.
             */

            for (const token of tokens) {
                sql += `
                    AND (
                        tdno LIKE ?
                        OR prevtdno LIKE ?
                    )
                `;

                params.push(
                    `%${token}%`,
                    `%${token}%`
                );
            }
        } else if (type === "pin") {
            /*
             * PIN search.
             */

            for (const token of tokens) {
                sql += `
                    AND (
                        fullpin LIKE ?
                        OR pin LIKE ?
                    )
                `;

                params.push(
                    `%${token}%`,
                    `%${token}%`
                );
            }
        } else if (type === "barangay") {
            /*
             * Barangay search.
             */

            for (const token of tokens) {
                sql += `
                    AND barangay_name LIKE ?
                `;

                params.push(`%${token}%`);
            }
        } else {
            /*
            |--------------------------------------------------------------------------
            | SMART GENERAL SEARCH
            |--------------------------------------------------------------------------
            |
            | This is the important part.
            |
            | For:
            |
            |     Henry P. Rivera
            |
            | we generate:
            |
            |     AND (
            |         owner_name LIKE '%Henry%'
            |         OR taxpayer_name LIKE '%Henry%'
            |         OR tdno LIKE '%Henry%'
            |         ...
            |     )
            |
            |     AND (
            |         owner_name LIKE '%P.%'
            |         OR taxpayer_name LIKE '%P.%'
            |         OR ...
            |     )
            |
            |     AND (
            |         owner_name LIKE '%Rivera%'
            |         OR taxpayer_name LIKE '%Rivera%'
            |         OR ...
            |     )
            |
            | This means:
            |
            |     Henry
            |     Henry Rivera
            |     P. Rivera
            |     Rivera
            |
            | can all find:
            |
            |     Eric Henry P. Rivera
            |
            |--------------------------------------------------------------------------
            */

            for (const token of tokens) {
                const tokenConditions =
                    searchableFields
                        .map(
                            (field) =>
                                `${field} LIKE ?`
                        )
                        .join(" OR ");

                sql += `
                    AND (
                        ${tokenConditions}
                    )
                `;

                for (let i = 0; i < searchableFields.length; i++) {
                    params.push(`%${token}%`);
                }
            }
        }

        /*
        |--------------------------------------------------------------------------
        | ORDERING
        |--------------------------------------------------------------------------
        |
        | Put exact/stronger owner matches first where possible.
        |
        */

        sql += `
            ORDER BY
                CASE
                    WHEN owner_name LIKE ? THEN 0
                    WHEN taxpayer_name LIKE ? THEN 1
                    WHEN tdno LIKE ? THEN 2
                    WHEN fullpin LIKE ? THEN 3
                    ELSE 4
                END,
                owner_name ASC
            LIMIT 50
        `;

        const exactKeyword = `%${q}%`;

        params.push(
            exactKeyword,
            exactKeyword,
            exactKeyword,
            exactKeyword
        );

        /*
        |--------------------------------------------------------------------------
        | EXECUTE
        |--------------------------------------------------------------------------
        */

        const [rows] = await mysqlPool.query(
            sql,
            params
        );

        return NextResponse.json({
            success: true,
            results: rows,
        });
    } catch (error: unknown) {
        console.error(
            "FAAS SEARCH ERROR:",
            error
        );

        const message =
            error instanceof Error
                ? error.message
                : "An unexpected error occurred.";

        return NextResponse.json(
            {
                success: false,
                message,
                results: [],
            },
            {
                status: 500,
            }
        );
    }
}