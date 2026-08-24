import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

type AccountRow = {
    account_id: string | null;
    account_code: string;
    account_name: string;
    amount: number;
};

type RptAccountDefinition = {
    code: string;
    name: string;
};


/*
|--------------------------------------------------------------------------
| RPT ACCOUNT DEFINITIONS
|--------------------------------------------------------------------------
*/

const RPT_ACCOUNTS = {

    BASIC_CURRENT: {
        code: "588-01-01",
        name: "*RPT BASIC-Current",
    },

    BASIC_PREVIOUS: {
        code: "588-01-02",
        name: "*RPT BASIC-Previous",
    },

    BASIC_ADVANCE: {
        code: "588-01-05",
        name: "*RPT-BASIC-Advance",
    },


    SEF_CURRENT: {
        code: "591-01-01",
        name: "*SEF Real Property Income-Current",
    },

    SEF_PREVIOUS: {
        code: "591-01-03",
        name: "*SEF Real Property Income-Previous",
    },

    SEF_ADVANCE: {
        code: "591-01-05",
        name: "*SEF Real Property Income-Advance",
    },


    BASIC_PENALTY_CURRENT: {
        code: "599-01-01",
        name: "*BASIC Penalty, Real Property Income-Current",
    },

    BASIC_PENALTY_PREVIOUS: {
        code: "599-01-02",
        name: "*BASIC Penalty, Real Property Income-Previous",
    },


    SEF_PENALTY_CURRENT: {
        code: "599-02-01",
        name: "*SEF Penalty, Real Property Income-Current",
    },

    SEF_PENALTY_PREVIOUS: {
        code: "599-02-02",
        name: "*SEF Penalty, Real Property Income-Previous",
    },


    BASIC_DISCOUNT: {
        code: "954-01-01",
        name: "*Discount on RPT-BASIC",
    },

    SEF_DISCOUNT: {
        code: "955-01-01",
        name: "*Discount on RPT-SEF",
    },

};


/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function toNumber(
    value: unknown
): number {

    const number =
        Number(value ?? 0);

    return Number.isFinite(number)
        ? number
        : 0;

}


function money(
    value: number
): number {

    return Number(
        value.toFixed(2)
    );

}


/*
|--------------------------------------------------------------------------
| YEAR CLASSIFICATION
|--------------------------------------------------------------------------
*/

function classifyYear(
    year: number,
    currentYear: number
):
    "CURRENT" |
    "PREVIOUS" |
    "ADVANCE" {

    if (
        year < currentYear
    ) {

        return "PREVIOUS";

    }

    if (
        year > currentYear
    ) {

        return "ADVANCE";

    }

    return "CURRENT";

}


/*
|--------------------------------------------------------------------------
| GET ABSTRACT SUMMARY
|--------------------------------------------------------------------------
*/

export async function GET(
    request: NextRequest,
    context: {
        params: Promise<{
            id: string;
        }>;
    }
) {

    try {

        /*
        =========================================================
        RCD ID
        =========================================================
        */

        const {
            id: rcdId,
        } = await context.params;


        if (
            !rcdId
        ) {

            return NextResponse.json(
                {
                    success: false,
                    error:
                        "RCD ID is required.",
                },
                {
                    status: 400,
                }
            );

        }


        /*
        =========================================================
        GET RCD
        =========================================================
        */

        const rcdResult =
            await pool.query(
                `
                SELECT

                    rt.id,

                    rt.report_no,

                    rt.report_date,

                    rt.fund_source_id,

                    fs.fund_code,

                    fs.fund_name,

                    fs.acronym

                FROM rcd_transaction rt

                LEFT JOIN fund_sources fs
                    ON fs.id =
                       rt.fund_source_id

                WHERE
                    rt.id = $1

                LIMIT 1
                `,
                [
                    rcdId,
                ]
            );


        if (
            rcdResult.rows.length === 0
        ) {

            return NextResponse.json(
                {
                    success: false,
                    error:
                        "RCD was not found.",
                },
                {
                    status: 404,
                }
            );

        }


        const rcd =
            rcdResult.rows[0];


        /*
        =========================================================
        CURRENT YEAR
        =========================================================
        */

        const reportDate =
            rcd.report_date
                ? new Date(
                    `${String(
                        rcd.report_date
                    ).substring(
                        0,
                        10
                    )}T00:00:00`
                )
                : new Date();


        const currentYear =
            reportDate.getFullYear();


        /*
        =========================================================
        GET ALL DIPP TRANSACTIONS BELONGING TO THIS RCD
        =========================================================
        */

        const transactionsResult =
            await pool.query(
                `
                SELECT

                    ri.id
                        AS rcd_item_id,

                    ri.dipp_transaction_id,

                    ri.or_number,

                    ri.receipt_date,

                    ri.collector_id,

                    ri.payor,

                    ri.payment_mode,

                    ri.amount
                        AS rcd_amount,

                    dt.transaction_type,

                    dt.accountable_form_id,

                    af.form_code,

                    af.form_name,

                    dt.grand_total,

                    dt.status,

                    dt.is_cancelled,

                    dt.is_remitted

                FROM rcd_items ri

                INNER JOIN dipp_transactions dt
                    ON dt.id =
                       ri.dipp_transaction_id

                LEFT JOIN accountable_forms af
                    ON af.id =
                       dt.accountable_form_id

                WHERE
                    ri.rcd_transaction_id =
                    $1

                ORDER BY

                    ri.receipt_date,

                    ri.or_number
                `,
                [
                    rcdId,
                ]
            );


        const transactions =
            transactionsResult.rows;


        /*
        =========================================================
        NO TRANSACTIONS
        =========================================================
        */

        if (
            transactions.length === 0
        ) {

            return NextResponse.json({

                success: true,

                rcd: {

                    id:
                        rcd.id,

                    report_no:
                        rcd.report_no,

                    report_date:
                        rcd.report_date,

                },

                fund_source: {

                    id:
                        rcd.fund_source_id,

                    fund_code:
                        rcd.fund_code,

                    fund_name:
                        rcd.fund_name,

                    acronym:
                        rcd.acronym,

                },

                current_year:
                    currentYear,

                transaction_count: 0,

                items: [],

                grand_total: 0,

            });

        }


        /*
        =========================================================
        ACCOUNT MAP
        =========================================================
        */

        const accountResult =
            await pool.query(
                `
                SELECT

                    id,

                    account_code,

                    account_name

                FROM accounts

                WHERE
                    is_active = TRUE

                ORDER BY
                    account_code
                `
            );


        const accountById =
            new Map<
                string,
                {
                    id: string;
                    account_code: string;
                    account_name: string;
                }
            >();


        const accountByCode =
            new Map<
                string,
                {
                    id: string;
                    account_code: string;
                    account_name: string;
                }
            >();


        for (
            const account
            of accountResult.rows
        ) {

            accountById.set(
                String(
                    account.id
                ),
                {
                    id:
                        account.id,

                    account_code:
                        account.account_code,

                    account_name:
                        account.account_name,
                }
            );


            if (
                account.account_code
            ) {

                accountByCode.set(
                    String(
                        account.account_code
                    ).trim(),
                    {
                        id:
                            account.id,

                        account_code:
                            account.account_code,

                        account_name:
                            account.account_name,
                    }
                );

            }

        }


        /*
        =========================================================
        FINAL SUMMARY MAP
        =========================================================
        */

        const summaryMap =
            new Map<
                string,
                AccountRow
            >();


        function addSummary(
            accountId:
                string | null,

            accountCode:
                string,

            accountName:
                string,

            amount:
                number
        ) {

            const value =
                money(
                    amount
                );


            if (
                Math.abs(value) <
                0.005
            ) {

                return;

            }


            /*
            -----------------------------------------------------
            Account code is the grouping key.
            -----------------------------------------------------
            */

            const key =
                accountCode ||
                accountId ||
                accountName;


            const existing =
                summaryMap.get(
                    key
                );


            if (
                existing
            ) {

                existing.amount =
                    money(
                        existing.amount +
                        value
                    );

                return;

            }


            summaryMap.set(
                key,
                {

                    account_id:
                        accountId,

                    account_code:
                        accountCode,

                    account_name:
                        accountName,

                    amount:
                        value,

                }
            );

        }


        /*
        =========================================================
        PROCESS EACH TRANSACTION
        =========================================================
        */

        for (
            const transaction
            of transactions
        ) {

            const transactionId =
                transaction.dipp_transaction_id;


            /*
            =====================================================
            CHECK WHETHER THIS TRANSACTION HAS RPT ITEMS
            =====================================================
            */

            const rptResult =
                await pool.query(
                    `
                    SELECT

                        id,

                        transaction_id,

                        billing_id,

                        td_number,

                        assessed_value,

                        start_quarter,

                        start_year,

                        end_quarter,

                        end_year,

                        basic,

                        sef,

                        penalty,

                        discount,

                        amount

                    FROM dipp_rpt_items

                    WHERE
                        transaction_id =
                        $1

                    ORDER BY
                        start_year,
                        start_quarter,
                        end_year,
                        end_quarter
                    `,
                    [
                        transactionId,
                    ]
                );


            /*
            =====================================================
            RPT TRANSACTION
            =====================================================
            */

            if (
                rptResult.rows.length > 0
            ) {

                /*
                -------------------------------------------------
                Process every RPT item.
                -------------------------------------------------
                */

                for (
                    const rpt
                    of rptResult.rows
                ) {

                    const basic =
                        toNumber(
                            rpt.basic
                        );

                    const sef =
                        toNumber(
                            rpt.sef
                        );

                    const penalty =
                        toNumber(
                            rpt.penalty
                        );

                    const discount =
                        toNumber(
                            rpt.discount
                        );


                    /*
                    -------------------------------------------------
                    Determine tax year.
                    -------------------------------------------------
                    */

                    let taxYear =
                        toNumber(
                            rpt.end_year
                        );


                    if (
                        !taxYear
                    ) {

                        taxYear =
                            toNumber(
                                rpt.start_year
                            );

                    }


                    const classification =
                        classifyYear(
                            taxYear,
                            currentYear
                        );


                    /*
                    =================================================
                    BASIC
                    =================================================
                    */

                    let basicAccount:
                        RptAccountDefinition;


                    if (
                        classification ===
                        "CURRENT"
                    ) {

                        basicAccount =
                            RPT_ACCOUNTS
                                .BASIC_CURRENT;

                    }
                    else if (
                        classification ===
                        "PREVIOUS"
                    ) {

                        basicAccount =
                            RPT_ACCOUNTS
                                .BASIC_PREVIOUS;

                    }
                    else {

                        basicAccount =
                            RPT_ACCOUNTS
                                .BASIC_ADVANCE;

                    }


                    const basicAccountRecord =
                        accountByCode.get(
                            basicAccount.code
                        );


                    addSummary(

                        basicAccountRecord?.id ??
                            null,

                        basicAccountRecord
                            ?.account_code ??
                            basicAccount.code,

                        basicAccountRecord
                            ?.account_name ??
                            basicAccount.name,

                        basic

                    );


                    /*
                    =================================================
                    SEF
                    =================================================
                    */

                    let sefAccount:
                        RptAccountDefinition;


                    if (
                        classification ===
                        "CURRENT"
                    ) {

                        sefAccount =
                            RPT_ACCOUNTS
                                .SEF_CURRENT;

                    }
                    else if (
                        classification ===
                        "PREVIOUS"
                    ) {

                        sefAccount =
                            RPT_ACCOUNTS
                                .SEF_PREVIOUS;

                    }
                    else {

                        sefAccount =
                            RPT_ACCOUNTS
                                .SEF_ADVANCE;

                    }


                    const sefAccountRecord =
                        accountByCode.get(
                            sefAccount.code
                        );


                    addSummary(

                        sefAccountRecord?.id ??
                            null,

                        sefAccountRecord
                            ?.account_code ??
                            sefAccount.code,

                        sefAccountRecord
                            ?.account_name ??
                            sefAccount.name,

                        sef

                    );


                    /*
                    =================================================
                    PENALTY
                    =================================================
                    */

                    /*
                    -------------------------------------------------
                    The current RPT item stores combined penalty.
                    Split it between BASIC and SEF.
                    -------------------------------------------------
                    */

                    const basicPenalty =
                        penalty / 2;

                    const sefPenalty =
                        penalty / 2;


                    let basicPenaltyAccount:
                        RptAccountDefinition;


                    let sefPenaltyAccount:
                        RptAccountDefinition;


                    if (
                        classification ===
                        "CURRENT"
                    ) {

                        basicPenaltyAccount =
                            RPT_ACCOUNTS
                                .BASIC_PENALTY_CURRENT;

                        sefPenaltyAccount =
                            RPT_ACCOUNTS
                                .SEF_PENALTY_CURRENT;

                    }
                    else {

                        basicPenaltyAccount =
                            RPT_ACCOUNTS
                                .BASIC_PENALTY_PREVIOUS;

                        sefPenaltyAccount =
                            RPT_ACCOUNTS
                                .SEF_PENALTY_PREVIOUS;

                    }


                    const basicPenaltyRecord =
                        accountByCode.get(
                            basicPenaltyAccount.code
                        );


                    const sefPenaltyRecord =
                        accountByCode.get(
                            sefPenaltyAccount.code
                        );


                    addSummary(

                        basicPenaltyRecord?.id ??
                            null,

                        basicPenaltyRecord
                            ?.account_code ??
                            basicPenaltyAccount.code,

                        basicPenaltyRecord
                            ?.account_name ??
                            basicPenaltyAccount.name,

                        basicPenalty

                    );


                    addSummary(

                        sefPenaltyRecord?.id ??
                            null,

                        sefPenaltyRecord
                            ?.account_code ??
                            sefPenaltyAccount.code,

                        sefPenaltyRecord
                            ?.account_name ??
                            sefPenaltyAccount.name,

                        sefPenalty

                    );


                    /*
                    =================================================
                    DISCOUNT
                    =================================================
                    */

                    /*
                    -------------------------------------------------
                    Current dipp_rpt_items stores combined discount.
                    Split it between BASIC and SEF.
                    -------------------------------------------------
                    */

                    const basicDiscount =
                        discount / 2;

                    const sefDiscount =
                        discount / 2;


                    const basicDiscountRecord =
                        accountByCode.get(
                            RPT_ACCOUNTS
                                .BASIC_DISCOUNT
                                .code
                        );


                    const sefDiscountRecord =
                        accountByCode.get(
                            RPT_ACCOUNTS
                                .SEF_DISCOUNT
                                .code
                        );


                    addSummary(

                        basicDiscountRecord?.id ??
                            null,

                        basicDiscountRecord
                            ?.account_code ??
                            RPT_ACCOUNTS
                                .BASIC_DISCOUNT
                                .code,

                        basicDiscountRecord
                            ?.account_name ??
                            RPT_ACCOUNTS
                                .BASIC_DISCOUNT
                                .name,

                        basicDiscount

                    );


                    addSummary(

                        sefDiscountRecord?.id ??
                            null,

                        sefDiscountRecord
                            ?.account_code ??
                            RPT_ACCOUNTS
                                .SEF_DISCOUNT
                                .code,

                        sefDiscountRecord
                            ?.account_name ??
                            RPT_ACCOUNTS
                                .SEF_DISCOUNT
                                .name,

                        sefDiscount

                    );

                }


                /*
                -------------------------------------------------
                IMPORTANT:
                Do NOT also read dipp_transaction_items for
                this transaction.
                -------------------------------------------------
                */

                continue;

            }


            /*
            =====================================================
            NON-RPT TRANSACTION
            =====================================================
            */

            const transactionItemsResult =
                await pool.query(
                    `
                    SELECT

                        dti.id,

                        dti.account_id,

                        dti.amount,

                        a.account_code,

                        a.account_name

                    FROM dipp_transaction_items dti

                    INNER JOIN accounts a
                        ON a.id =
                           dti.account_id

                    WHERE
                        dti.transaction_id =
                        $1

                    ORDER BY
                        a.account_code
                    `,
                    [
                        transactionId,
                    ]
                );


            /*
            -----------------------------------------------------
            Add actual accounts used by this transaction.
            -----------------------------------------------------
            */

            for (
                const item
                of transactionItemsResult.rows
            ) {

                addSummary(

                    item.account_id,

                    item.account_code,

                    item.account_name,

                    toNumber(
                        item.amount
                    )

                );

            }

        }


        /*
        =========================================================
        CONVERT MAP TO ARRAY
        =========================================================
        */

        const items =
            Array.from(
                summaryMap.values()
            )
                .map(
                    item => ({

                        ...item,

                        amount:
                            money(
                                item.amount
                            ),

                    })
                )
                .filter(
                    item =>
                        Math.abs(
                            item.amount
                        ) >=
                        0.005
                )
                .sort(
                    (
                        a,
                        b
                    ) =>
                        String(
                            a.account_code
                        ).localeCompare(
                            String(
                                b.account_code
                            )
                        )
                );


        /*
        =========================================================
        GRAND TOTAL
        =========================================================
        */

        const grandTotal =
            items.reduce(
                (
                    total,
                    item
                ) =>
                    total +
                    toNumber(
                        item.amount
                    ),
                0
            );


        /*
        =========================================================
        RESPONSE
        =========================================================
        */

        return NextResponse.json({

            success: true,

            rcd: {

                id:
                    rcd.id,

                report_no:
                    rcd.report_no,

                report_date:
                    rcd.report_date,

            },

            fund_source: {

                id:
                    rcd.fund_source_id,

                fund_code:
                    rcd.fund_code,

                fund_name:
                    rcd.fund_name,

                acronym:
                    rcd.acronym,

            },

            current_year:
                currentYear,

            transaction_count:
                transactions.length,

            items,

            grand_total:
                money(
                    grandTotal
                ),

        });

    } catch (
        error: any
    ) {

        console.error(
            "ABSTRACT SUMMARY ERROR:",
            error
        );


        return NextResponse.json(
            {

                success: false,

                error:
                    error?.message ??
                    "Failed to load Abstract Summary.",

            },
            {
                status: 500,
            }
        );

    }

}