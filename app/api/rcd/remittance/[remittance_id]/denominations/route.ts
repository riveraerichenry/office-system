import {
    NextRequest,
    NextResponse,
} from "next/server";

import {
    pool,
} from "@/lib/db";


export async function GET(
    request: NextRequest,
    context: {
        params: Promise<{
            remittance_id: string;
        }>;
    }
) {

    const client =
        await pool.connect();

    try {

        const {
            remittance_id,
        } =
            await context.params;


        if (
            !remittance_id
        ) {

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Remittance ID is required.",
                },
                {
                    status: 400,
                }
            );

        }


        /*
        =====================================================
        GET DENOMINATIONS
        =====================================================
        */

        const result =
            await client.query(
                `
                SELECT

                    id,

                    remittance_id,

                    denomination,

                    quantity,

                    amount,

                    created_at

                FROM
                    rcd_remittance_denominations

                WHERE
                    remittance_id =
                    $1

                ORDER BY
                    denomination DESC
                `,
                [
                    remittance_id,
                ]
            );


        /*
        =====================================================
        CONVERT TO OBJECT
        =====================================================
        */

        const denominations:
            Record<number, number> = {};


        let total =
            0;


        for (
            const row
            of result.rows
        ) {

            const denomination =
                Number(
                    row.denomination
                );

            const quantity =
                Number(
                    row.quantity
                );

            const amount =
                Number(
                    row.amount ??
                    denomination *
                    quantity
                );


            denominations[
                denomination
            ] =
                quantity;


            total +=
                amount;

        }


        return NextResponse.json(
            {
                success: true,

                remittance_id,

                denominations,

                total,

                rows:
                    result.rows.map(
                        row => ({
                            id:
                                row.id,

                            denomination:
                                Number(
                                    row.denomination
                                ),

                            quantity:
                                Number(
                                    row.quantity
                                ),

                            amount:
                                Number(
                                    row.amount
                                ),

                            created_at:
                                row.created_at,
                        })
                    ),
            }
        );


    } catch (
        error: any
    ) {

        console.error(
            "GET RCD DENOMINATIONS ERROR:",
            error
        );


        return NextResponse.json(
            {
                success: false,

                message:
                    error?.message ??
                    "Failed to retrieve denominations.",
            },
            {
                status: 500,
            }
        );


    } finally {

        client.release();

    }

}