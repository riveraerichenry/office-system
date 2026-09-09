import {
NextRequest,
NextResponse,
} from "next/server";

import {
PoolClient,
} from "pg";

import {
authorize,
} from "@/lib/authorize";

import {
pool,
} from "@/lib/db";

import {
MODULE_PATHS,
} from "@/lib/module-paths";

type TransactionItem = {

account_id: string;

amount:
    | number
    | string;

remarks?:
    | string
    | null;

};

export async function PUT(
req: NextRequest
) {

let client:
    | PoolClient
    | null =
    null;


try {

    /*
    ================================================================
    AUTHORIZATION
    ================================================================
    */

    await authorize(

        req,

        MODULE_PATHS.DIPP,

        "edit"

    );


    /*
    ================================================================
    REQUEST BODY
    ================================================================
    */

    const body =
        await req.json();


    const {

        transaction_id,

        items,

    } = body;


    /*
    ================================================================
    VALIDATION
    ================================================================
    */

    if (

        !transaction_id

    ) {

        return NextResponse.json(

            {

                success:
                    false,

                message:
                    "Transaction ID is required.",

            },

            {

                status:
                    400,

            }

        );

    }


    if (

        !items ||

        !Array.isArray(
            items
        ) ||

        items.length === 0

    ) {

        return NextResponse.json(

            {

                success:
                    false,

                message:
                    "At least one transaction item is required.",

            },

            {

                status:
                    400,

            }

        );

    }


    /*
    ================================================================
    BEGIN DATABASE TRANSACTION
    ================================================================
    */

    client =
        await pool.connect();


    await client.query(
        "BEGIN"
    );


    /*
    ================================================================
    VALIDATE TRANSACTION

    We also lock the transaction while editing.
    ================================================================
    */

    const transactionResult =
        await client.query(

            `
            SELECT

                id,

                transaction_type,

                grand_total

            FROM dipp_transactions

            WHERE

                id = $1

            AND

                is_cancelled = FALSE

            FOR UPDATE
            `,

            [

                transaction_id,

            ]

        );


    if (

        transactionResult.rows.length ===
        0

    ) {

        throw new Error(
            "Transaction not found or has been cancelled."
        );

    }


    /*
    ================================================================
    VALIDATE EACH ITEM

    Also calculate the new grand total.
    ================================================================
    */

    let grandTotal =
        0;


    const validatedItems:
        TransactionItem[] =
        [];


    for (

        const item

        of items

    ) {

        if (

            !item.account_id

        ) {

            throw new Error(
                "Please select an account for every transaction item."
            );

        }


        const amount =
            Number(
                item.amount
            );


        if (

            !Number.isFinite(
                amount
            ) ||

            amount <= 0

        ) {

            throw new Error(
                "Every transaction amount must be greater than zero."
            );

        }


        /*
        ============================================================
        VALIDATE ACCOUNT
        ============================================================
        */

        const accountResult =
            await client.query(

                `
                SELECT

                    id

                FROM accounts

                WHERE

                    id = $1

                AND

                    is_active = TRUE

                AND

                    is_postable = TRUE
                `,

                [

                    item.account_id,

                ]

            );


        if (

            accountResult.rows.length ===
            0

        ) {

            throw new Error(
                "One or more selected accounts are invalid or inactive."
            );

        }


        validatedItems.push(

            {

                account_id:
                    item.account_id,

                amount,

                remarks:
                    item.remarks ??
                    null,

            }

        );


        grandTotal +=
            amount;

    }


    /*
    ================================================================
    REMOVE EXISTING GENERAL ITEMS
    ================================================================
    */

    await client.query(

        `
        DELETE FROM dipp_transaction_items

        WHERE

            transaction_id = $1
        `,

        [

            transaction_id,

        ]

    );


    /*
    ================================================================
    INSERT UPDATED ITEMS
    ================================================================
    */

    for (

        const item

        of validatedItems

    ) {

        await client.query(

            `
            INSERT INTO dipp_transaction_items (

                transaction_id,

                account_id,

                amount,

                remarks

            )

            VALUES (

                $1,

                $2,

                $3,

                $4

            )
            `,

            [

                transaction_id,

                item.account_id,

                item.amount,

                item.remarks,

            ]

        );

    }


    /*
    ================================================================
    UPDATE GRAND TOTAL
    ================================================================
    */

    await client.query(

        `
        UPDATE dipp_transactions

        SET

            grand_total = $1

        WHERE

            id = $2
        `,

        [

            grandTotal,

            transaction_id,

        ]

    );


    /*
    ================================================================
    COMMIT
    ================================================================
    */

    await client.query(
        "COMMIT"
    );


    /*
    ================================================================
    RESPONSE
    ================================================================
    */

    return NextResponse.json(

        {

            success:
                true,

            message:
                "Transaction items successfully updated.",

            grand_total:
                grandTotal,

            items:
                validatedItems,

        }

    );

}

catch (
    error: any
) {

    /*
    ================================================================
    ROLLBACK
    ================================================================
    */

    if (

        client

    ) {

        try {

            await client.query(
                "ROLLBACK"
            );

        }

        catch (
            rollbackError
        ) {

            console.error(

                "Rollback error:",

                rollbackError

            );

        }

    }


    console.error(

        "UPDATE GENERAL TRANSACTION ITEMS ERROR:",

        error

    );


    return NextResponse.json(

        {

            success:
                false,

            message:

                error?.message ||

                "Unable to update transaction items.",

        },

        {

            status:
                500,

        }

    );

}

finally {

    client?.release();

}

}