import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { authorize } from "@/lib/authorize";
import { MODULE_PATHS } from "@/lib/module-paths";
import jwt from "jsonwebtoken";

/* ============================================================
   HELPERS
============================================================ */

function getAuthenticatedUserId(req: NextRequest): string | null {
    try {
        const token = req.cookies.get("token")?.value;

        if (!token) {
            return null;
        }

        const secret = process.env.JWT_SECRET;

        if (!secret) {
            return null;
        }

        const decoded = jwt.verify(token, secret) as any;

        return (
            decoded?.id ??
            decoded?.userId ??
            decoded?.user_id ??
            decoded?.sub ??
            null
        );
    } catch (error) {
        console.error(
            "GET AUTHENTICATED USER ID ERROR:",
            error
        );

        return null;
    }
}

/* ============================================================
   GET
   /api/com/dipp-transaction-details?id=TRANSACTION_ID
============================================================ */

export async function GET(req: NextRequest) {
    try {
        await authorize(
            req,
            MODULE_PATHS.DIPP,
            "view"
        );

        const { searchParams } =
            new URL(req.url);

        const id =
            searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Transaction ID is required.",
                },
                {
                    status: 400,
                }
            );
        }

        /* ========================================================
           TRANSACTION HEADER
        ======================================================== */

        const headerResult =
            await pool.query(
                `
                SELECT
                    dt.id,

                    dt.or_number,
                    dt.receipt_date,

                    dt.booklet_registration_id,
                    dt.lor_release_id,
                    dt.accountable_form_id,
                    dt.collector_id,

                    dt.payor,
                    dt.payment_mode,
                    dt.remarks,
                    dt.grand_total,

                    dt.status,

                    dt.is_cancelled,
                    dt.cancelled_at,
                    dt.cancelled_by,

                    dt.created_at,
                    dt.updated_at,

                    dt.remittance_id,

                    dt.encoded_by,
                    dt.updated_by,
                    dt.posted_by,
                    dt.posted_at,

                    dt.billing_id,
                    dt.transaction_type,
                    dt.is_remitted,

                    dt.gender,
                    dt.payment,

                    /* ==================================================
                       ACCOUNTABLE FORM
                    ================================================== */

                    af.form_code,
                    af.form_name,

                    /* ==================================================
                       COLLECTOR
                    ================================================== */

                    collector.full_name
                        AS collector_name,

                    /* ==================================================
                       ENCODER
                    ================================================== */

                    encoder.full_name
                        AS encoded_by_name,

                    /* ==================================================
                       CANCELLATION USER
                    ================================================== */

                    cancelled_user.full_name
                        AS cancelled_by_name,

                    /* ==================================================
                       LOR
                    ================================================== */

                    lr.lor_no,

                    lr.fund_source_id,

                    /* ==================================================
                       FUND SOURCE
                    ================================================== */

                    fs.fund_code,

                    fs.fund_name,

                    fs.acronym
                        AS fund_acronym

                FROM dipp_transactions dt

                LEFT JOIN accountable_forms af
                    ON af.id =
                       dt.accountable_form_id

                LEFT JOIN users collector
                    ON collector.id =
                       dt.collector_id

                LEFT JOIN users encoder
                    ON encoder.id =
                       dt.encoded_by

                LEFT JOIN users cancelled_user
                    ON cancelled_user.id =
                       dt.cancelled_by

                LEFT JOIN lor_releases lr
                    ON lr.id =
                       dt.lor_release_id

                LEFT JOIN fund_sources fs
                    ON fs.id =
                       lr.fund_source_id

                WHERE dt.id = $1

                LIMIT 1
                `,
                [id]
            );

        if (
            headerResult.rows.length === 0
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "DIPP transaction not found.",
                },
                {
                    status: 404,
                }
            );
        }

        const header =
            headerResult.rows[0];

        /* ========================================================
           TRANSACTION ITEMS
        ======================================================== */

        const itemsResult =
            await pool.query(
                `
                SELECT
                    dti.id,

                    dti.transaction_id,

                    dti.account_id,

                    a.account_code,

                    a.account_name,

                    dti.amount,

                    dti.remarks

                FROM dipp_transaction_items dti

                LEFT JOIN accounts a
                    ON a.id =
                       dti.account_id

                WHERE dti.transaction_id = $1

                ORDER BY
                    dti.id ASC
                `,
                [id]
            );

        return NextResponse.json(
            {
                success: true,

                header,

                items:
                    itemsResult.rows,

                count:
                    itemsResult.rows.length,
            },
            {
                status: 200,
            }
        );
    } catch (error: any) {
        console.error(
            "COM DIPP TRANSACTION DETAILS GET ERROR:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    error?.message ??
                    "Failed to load DIPP transaction details.",
            },
            {
                status: 500,
            }
        );
    }
}

/* ============================================================
   PUT
   /api/com/dipp-transaction-details

   SYSTEM CONTROL UPDATE

   Supports:

   - Payor
   - Receipt Date
   - Payment Mode
   - Remarks
   - Status
   - Transaction Items
   - Grand Total

   Cancellation:

   - is_cancelled
   - cancelled_at
   - cancelled_by

   Revert Cancellation:

   - is_cancelled = false
   - cancelled_at = NULL
   - cancelled_by = NULL
============================================================ */

export async function PUT(req: NextRequest) {
    const client =
        await pool.connect();

    try {
        await authorize(
            req,
            MODULE_PATHS.DIPP,
            "edit"
        );

        const body =
            await req.json();

        const transactionId =
            body?.id;

        if (!transactionId) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Transaction ID is required.",
                },
                {
                    status: 400,
                }
            );
        }

        /*
         * Support both:
         *
         * body.payor
         *
         * and
         *
         * body.header.payor
         */

        const incomingHeader =
            body?.header ?? {};

        const payor =
            String(
                body?.payor ??
                incomingHeader?.payor ??
                ""
            ).trim();

        const receiptDate =
            body?.receipt_date ??
            incomingHeader?.receipt_date ??
            null;

        const paymentMode =
            body?.payment_mode ??
            incomingHeader?.payment_mode ??
            null;

        const remarks =
            body?.remarks ??
            incomingHeader?.remarks ??
            null;

        const requestedStatus =
            body?.status ??
            incomingHeader?.status ??
            null;

        const incomingItems =
            Array.isArray(body?.items)
                ? body.items
                : [];

        /*
         * Cancellation flag.
         *
         * If explicitly supplied, use it.
         *
         * Otherwise:
         *
         * status === CANCELLED
         *
         * means cancelled.
         */

        const cancellationRequested =
            typeof body?.is_cancelled ===
            "boolean"
                ? body.is_cancelled
                : typeof incomingHeader?.is_cancelled ===
                  "boolean"
                    ? incomingHeader.is_cancelled
                    : String(
                          requestedStatus ??
                              ""
                      ).toUpperCase() ===
                      "CANCELLED";

        if (!payor) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Payor is required.",
                },
                {
                    status: 400,
                }
            );
        }

        /* ========================================================
           VALIDATE ITEMS
        ======================================================== */

        for (
            let i = 0;
            i < incomingItems.length;
            i++
        ) {
            const item =
                incomingItems[i];

            if (!item?.account_id) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            `Transaction item ${
                                i + 1
                            } does not have an account.`,
                    },
                    {
                        status: 400,
                    }
                );
            }

            const amount =
                Number(
                    item?.amount ?? 0
                );

            if (
                !Number.isFinite(amount)
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            `Invalid amount for transaction item ${
                                i + 1
                            }.`,
                    },
                    {
                        status: 400,
                    }
                );
            }
        }

        /* ========================================================
           CALCULATE GRAND TOTAL
        ======================================================== */

        const grandTotal =
            incomingItems.reduce(
                (
                    total: number,
                    item: any
                ) => {
                    const amount =
                        Number(
                            item?.amount ?? 0
                        );

                    return (
                        total +
                        (
                            Number.isFinite(
                                amount
                            )
                                ? amount
                                : 0
                        )
                    );
                },
                0
            );

        /* ========================================================
           AUTHENTICATED USER
        ======================================================== */

        const authenticatedUserId =
            getAuthenticatedUserId(req);

        /* ========================================================
           START TRANSACTION
        ======================================================== */

        await client.query(
            "BEGIN"
        );

        /* ========================================================
           LOCK TRANSACTION
        ======================================================== */

        const transactionResult =
            await client.query(
                `
                SELECT
                    id,
                    status,
                    is_cancelled,
                    cancelled_at,
                    cancelled_by
                FROM dipp_transactions
                WHERE id = $1
                FOR UPDATE
                `,
                [transactionId]
            );

        if (
            transactionResult.rows.length ===
            0
        ) {
            await client.query(
                "ROLLBACK"
            );

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "DIPP transaction not found.",
                },
                {
                    status: 404,
                }
            );
        }

        const existingTransaction =
            transactionResult.rows[0];

        /* ========================================================
           DETERMINE STATUS
        ======================================================== */

        let finalStatus =
            requestedStatus ??
            existingTransaction.status;

        let finalIsCancelled =
            cancellationRequested;

        let cancelledAt: Date | null =
            null;

        let cancelledBy: string | null =
            null;

        /*
         * ========================================================
         * CANCEL
         * ========================================================
         */

        if (finalIsCancelled) {
            finalStatus = "CANCELLED";

            /*
             * If already cancelled, preserve
             * original cancellation information.
             */

            if (
                existingTransaction.is_cancelled
            ) {
                cancelledAt =
                    existingTransaction.cancelled_at;

                cancelledBy =
                    existingTransaction.cancelled_by;
            } else {
                cancelledAt =
                    new Date();

                cancelledBy =
                    authenticatedUserId;
            }
        }

        /*
         * ========================================================
         * REVERT CANCELLATION
         * ========================================================
         */

        else if (
            existingTransaction.is_cancelled
        ) {
            /*
             * The caller is explicitly reverting
             * the cancellation.
             */

            finalIsCancelled = false;

            cancelledAt = null;

            cancelledBy = null;

            /*
             * If status is still CANCELLED,
             * restore it to ISSUED.
             *
             * If the frontend supplied another
             * valid status, preserve that status.
             */

            if (
                !requestedStatus ||
                String(
                    requestedStatus
                ).toUpperCase() ===
                    "CANCELLED"
            ) {
                finalStatus = "ISSUED";
            }
        }

        /* ========================================================
           UPDATE HEADER
        ======================================================== */

        await client.query(
            `
            UPDATE dipp_transactions

            SET
                payor = $1,

                receipt_date = $2,

                payment_mode = $3,

                remarks = $4,

                status = $5,

                grand_total = $6,

                is_cancelled = $7,

                cancelled_at = $8,

                cancelled_by = $9,

                updated_at = NOW(),

                updated_by = COALESCE(
                    $10,
                    updated_by
                )

            WHERE id = $11
            `,
            [
                payor,
                receiptDate,
                paymentMode,
                remarks,
                finalStatus,
                grandTotal,
                finalIsCancelled,
                cancelledAt,
                cancelledBy,
                authenticatedUserId,
                transactionId,
            ]
        );

        /* ========================================================
           GET EXISTING ITEM IDS
        ======================================================== */

        const existingItemsResult =
            await client.query(
                `
                SELECT
                    id

                FROM dipp_transaction_items

                WHERE transaction_id = $1
                `,
                [transactionId]
            );

        const existingIds =
            existingItemsResult.rows.map(
                (row: any) =>
                    String(row.id)
            );

        const incomingIds =
            incomingItems
                .filter(
                    (item: any) =>
                        item?.id
                )
                .map(
                    (item: any) =>
                        String(item.id)
                );

        /* ========================================================
           DELETE REMOVED ITEMS
        ======================================================== */

        const idsToDelete =
            existingIds.filter(
                (
                    existingId: string
                ) =>
                    !incomingIds.includes(
                        existingId
                    )
            );

        for (
            const itemId of
                idsToDelete
        ) {
            await client.query(
                `
                DELETE FROM
                    dipp_transaction_items

                WHERE id = $1

                AND transaction_id = $2
                `,
                [
                    itemId,
                    transactionId,
                ]
            );
        }

        /* ========================================================
           UPDATE / INSERT ITEMS
        ======================================================== */

        for (
            const item of
                incomingItems
        ) {
            const amount =
                Number(
                    item?.amount ?? 0
                );

            const accountId =
                item.account_id;

            const itemRemarks =
                item?.remarks ??
                null;

            if (item?.id) {
                /* ================================================
                   UPDATE EXISTING ITEM
                ================================================= */

                const updateResult =
                    await client.query(
                        `
                        UPDATE
                            dipp_transaction_items

                        SET
                            account_id = $1,

                            amount = $2,

                            remarks = $3

                        WHERE id = $4

                        AND transaction_id = $5

                        RETURNING id
                        `,
                        [
                            accountId,
                            amount,
                            itemRemarks,
                            item.id,
                            transactionId,
                        ]
                    );

                /*
                 * If the item no longer exists,
                 * insert it.
                 */

                if (
                    updateResult.rows.length ===
                    0
                ) {
                    await client.query(
                        `
                        INSERT INTO
                            dipp_transaction_items
                        (
                            transaction_id,
                            account_id,
                            amount,
                            remarks
                        )

                        VALUES
                        (
                            $1,
                            $2,
                            $3,
                            $4
                        )
                        `,
                        [
                            transactionId,
                            accountId,
                            amount,
                            itemRemarks,
                        ]
                    );
                }
            } else {
                /* ================================================
                   INSERT NEW ITEM
                ================================================= */

                await client.query(
                    `
                    INSERT INTO
                        dipp_transaction_items
                    (
                        transaction_id,
                        account_id,
                        amount,
                        remarks
                    )

                    VALUES
                    (
                        $1,
                        $2,
                        $3,
                        $4
                    )
                    `,
                    [
                        transactionId,
                        accountId,
                        amount,
                        itemRemarks,
                    ]
                );
            }
        }

        /* ========================================================
           COMMIT
        ======================================================== */

        await client.query(
            "COMMIT"
        );

        /* ========================================================
           GET UPDATED HEADER
        ======================================================== */

        const updatedHeaderResult =
            await pool.query(
                `
                SELECT
                    dt.id,

                    dt.or_number,
                    dt.receipt_date,

                    dt.booklet_registration_id,
                    dt.lor_release_id,
                    dt.accountable_form_id,
                    dt.collector_id,

                    dt.payor,
                    dt.payment_mode,
                    dt.remarks,
                    dt.grand_total,

                    dt.status,

                    dt.is_cancelled,
                    dt.cancelled_at,
                    dt.cancelled_by,

                    dt.created_at,
                    dt.updated_at,

                    dt.remittance_id,

                    dt.encoded_by,
                    dt.updated_by,
                    dt.posted_by,
                    dt.posted_at,

                    dt.billing_id,
                    dt.transaction_type,
                    dt.is_remitted,

                    dt.gender,
                    dt.payment,

                    af.form_code,
                    af.form_name,

                    collector.full_name
                        AS collector_name,

                    encoder.full_name
                        AS encoded_by_name,

                    cancelled_user.full_name
                        AS cancelled_by_name,

                    lr.lor_no,

                    lr.fund_source_id,

                    fs.fund_code,

                    fs.fund_name,

                    fs.acronym
                        AS fund_acronym

                FROM dipp_transactions dt

                LEFT JOIN accountable_forms af
                    ON af.id =
                       dt.accountable_form_id

                LEFT JOIN users collector
                    ON collector.id =
                       dt.collector_id

                LEFT JOIN users encoder
                    ON encoder.id =
                       dt.encoded_by

                LEFT JOIN users cancelled_user
                    ON cancelled_user.id =
                       dt.cancelled_by

                LEFT JOIN lor_releases lr
                    ON lr.id =
                       dt.lor_release_id

                LEFT JOIN fund_sources fs
                    ON fs.id =
                       lr.fund_source_id

                WHERE dt.id = $1

                LIMIT 1
                `,
                [transactionId]
            );

        /* ========================================================
           GET UPDATED ITEMS
        ======================================================== */

        const updatedItemsResult =
            await pool.query(
                `
                SELECT
                    dti.id,

                    dti.transaction_id,

                    dti.account_id,

                    a.account_code,

                    a.account_name,

                    dti.amount,

                    dti.remarks

                FROM dipp_transaction_items dti

                LEFT JOIN accounts a
                    ON a.id =
                       dti.account_id

                WHERE dti.transaction_id = $1

                ORDER BY
                    dti.id ASC
                `,
                [transactionId]
            );

        return NextResponse.json(
            {
                success: true,

                message:
                    finalIsCancelled
                        ? "DIPP transaction cancelled successfully."
                        : existingTransaction.is_cancelled
                            ? "DIPP transaction cancellation reverted successfully."
                            : "DIPP transaction updated successfully.",

                header:
                    updatedHeaderResult
                        .rows[0] ??
                    null,

                items:
                    updatedItemsResult.rows,

                count:
                    updatedItemsResult
                        .rows.length,
            },
            {
                status: 200,
            }
        );
    } catch (error: any) {
        try {
            await client.query(
                "ROLLBACK"
            );
        } catch {
            // Ignore rollback errors.
        }

        console.error(
            "COM DIPP TRANSACTION DETAILS PUT ERROR:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    error?.message ??
                    "Failed to update DIPP transaction.",
            },
            {
                status: 500,
            }
        );
    } finally {
        client.release();
    }
}