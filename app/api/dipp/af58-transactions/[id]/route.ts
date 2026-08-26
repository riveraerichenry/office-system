import {
    NextRequest,
    NextResponse,
} from "next/server";

import { pool } from "@/lib/db";


export async function GET(
    request: NextRequest,
    {
        params,
    }: {
        params: Promise<{
            id: string;
        }>;
    }
) {

    try {

        const {
            id,
        } = await params;


        if (!id) {

            return NextResponse.json(
                {
                    error:
                        "Transaction ID is required.",
                },
                {
                    status: 400,
                }
            );

        }


        /*
        ================================================================
        GET AF58 DETAILS
        ================================================================
        */

        const result =
            await pool.query(
                `
                SELECT
                    id,
                    transaction_id,
                    payor_name,
                    city_municipality,
                    province,
                    permit_action,
                    remains_of,
                    deceased_name,
                    nationality,
                    age,
                    sex,
                    date_of_death,
                    cause_of_death,
                    cemetery_name,
                    infectious_status,
                    embalmed_status,
                    disposition_of_remains,
                    fee_amount,
                    certification_city_municipality,
                    certification_province,
                    certification_date,
                    created_at,
                    updated_at,
                    account_id
                FROM dipp_af58_items
                WHERE transaction_id = $1
                LIMIT 1
                `,
                [id]
            );


        /*
        ================================================================
        NOT FOUND
        ================================================================
        */

        if (result.rows.length === 0) {

            return NextResponse.json(
                {
                    error:
                        "AF58 details not found.",
                },
                {
                    status: 404,
                }
            );

        }


        /*
        ================================================================
        RETURN AF58
        ================================================================
        */

        return NextResponse.json(
            {
                af58:
                    result.rows[0],
            },
            {
                status: 200,
            }
        );

    }
    catch (error) {

        console.error(
            "AF58 DETAILS API ERROR:",
            error
        );


        return NextResponse.json(
            {
                error:
                    "Failed to retrieve AF58 details.",
            },
            {
                status: 500,
            }
        );

    }

}