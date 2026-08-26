import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";


/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

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
| CTC ACCOUNT DEFINITIONS
|--------------------------------------------------------------------------
*/

const CTC_ACCOUNTS = {

    INDIVIDUAL: {
        code: "4-01-01-050-1",
        name: "*CTC-Individual",
    },

    INDIVIDUAL_BARANGAY: {
        code: "4-01-01-050-2",
        name: "CTC-Individual (Bgy.- 50%)",
    },

    CORPORATION: {
        code: "4-01-01-050-3",
        name: "*CTC-Corporation",
    },

    INDIVIDUAL_PENALTY: {
        code: "4-01-01-050-4",
        name: "*CTC-Individual Fines & Penalties",
    },

    CORPORATION_PENALTY: {
        code: "4-01-01-050-5",
        name: "*CTC-Corporation Fines & Penalties",
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
        } =
            await context.params;


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

                    dt.is_remitted,

                    dt.remarks

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


        /*
        =========================================================
        ADD SUMMARY
        =========================================================
        */

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


            const formCode =
                transaction.form_code
                    ? String(
                        transaction.form_code
                    ).trim()
                    : "";


            /*
            =====================================================
            CHECK RPT
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
                rptResult.rows.length >
                0
            ) {

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
                Do NOT also read transaction_items.
                -------------------------------------------------
                */

                continue;

            }





            /*
============================================================
AF58 - BURIAL PERMIT
============================================================
*/

if (
    formCode === "AF58"
) {

    /*
    ------------------------------------------------------------
    GET AF58 DETAIL
    ------------------------------------------------------------
    */

    const af58Result =
        await pool.query(
            `
            SELECT

                af58.id,

                af58.transaction_id,

                af58.fee_amount,

                af58.account_id,

                a.account_code,

                a.account_name

            FROM dipp_af58_items af58

            LEFT JOIN accounts a
                ON a.id = af58.account_id

            WHERE
                af58.transaction_id = $1

            ORDER BY
                af58.id
            `,
            [
                transactionId,
            ]
        );


    /*
    ------------------------------------------------------------
    IF NO AF58 DETAIL
    ------------------------------------------------------------
    */

    if (
        af58Result.rows.length === 0
    ) {

        console.warn(
            "AF58 DETAIL NOT FOUND:",
            {
                transactionId,
                or_number:
                    transaction.or_number,
                formCode,
            }
        );

        continue;
    }


    /*
    ------------------------------------------------------------
    BURIAL PERMIT ACCOUNT FALLBACK
    ------------------------------------------------------------
    */

    const burialPermitAccount =
        accountByCode.get(
            "4-02-01-010-8"
        );


        /*
        ------------------------------------------------------------
        PROCESS AF58 ITEMS
        ------------------------------------------------------------
        */

        for (
            const af58
            of af58Result.rows
        ) {

            const amount =
                money(
                    toNumber(
                        af58.fee_amount
                    )
                );


            /*
            --------------------------------------------------------
            IGNORE ZERO AMOUNTS
            --------------------------------------------------------
            */

            if (
                Math.abs(
                    amount
                ) < 0.005
            ) {

                continue;

            }


            /*
            --------------------------------------------------------
            USE ACCOUNT STORED IN AF58 ITEM
            --------------------------------------------------------

            If account_id is available and exists in accounts,
            use that account.

            Otherwise use the required Burial Permit account.
            --------------------------------------------------------
            */

            const account =
                af58.account_code
                    ? {

                        id:
                            af58.account_id,

                        account_code:
                            af58.account_code,

                        account_name:
                            af58.account_name,

                    }
                    :
                    burialPermitAccount;


            /*
            --------------------------------------------------------
            ADD AF58 TO SUMMARY
            --------------------------------------------------------
            */

            addSummary(

                account?.id ??
                    null,

                account?.account_code ??
                    "4-02-01-010-8",

                account?.account_name ??
                    "*Burial Permit Fees",

                amount

            );

        }


        /*
        ------------------------------------------------------------
        AF58 COMPLETE
        ------------------------------------------------------------

        Do not continue to normal dipp_transaction_items.
        ------------------------------------------------------------
        */

        continue;

    }



            /*
            =====================================================
            CTC-I / CTC-C
            =====================================================
            */

            if (
                formCode === "CTC-I" ||
                formCode === "CTC-C"
            ) {

                const ctcResult =
                    await pool.query(
                        `
                        SELECT

                            id,

                            transaction_id,

                            ctc_type,

                            full_name,

                            tax_mode,

                            taxable_amount,

                            basic_tax,

                            salary_tax,

                            additional_tax,

                            penalty,

                            interest,

                            total_amount

                        FROM dipp_ctc_items

                        WHERE
                            transaction_id =
                            $1

                        ORDER BY
                            id

                        LIMIT 1
                        `,
                        [
                            transactionId,
                        ]
                    );


                /*
                -------------------------------------------------
                No CTC detail.
                -------------------------------------------------
                */

                if (
                    ctcResult.rows.length === 0
                ) {

                    continue;

                }


                const ctc =
                    ctcResult.rows[0];


                /*
                =================================================
                CTC-I
                =================================================
                */

                if (
                    formCode === "CTC-I"
                ) {

                    /*
                    -------------------------------------------------
                    Get actual accounts.
                    -------------------------------------------------
                    */

                    const individualAccount =
                        accountByCode.get(
                            CTC_ACCOUNTS
                                .INDIVIDUAL
                                .code
                        );


                    const barangayAccount =
                        accountByCode.get(
                            CTC_ACCOUNTS
                                .INDIVIDUAL_BARANGAY
                                .code
                        );


                    const penaltyAccount =
                        accountByCode.get(
                            CTC_ACCOUNTS
                                .INDIVIDUAL_PENALTY
                                .code
                        );


                    /*
                    -------------------------------------------------
                    Tax components
                    -------------------------------------------------
                    */

                    const basicTax =
                        toNumber(
                            ctc.basic_tax
                        );


                    const salaryTax =
                        toNumber(
                            ctc.salary_tax
                        );


                    const additionalTax =
                        toNumber(
                            ctc.additional_tax
                        );


                    /*
                    -------------------------------------------------
                    Total CTC Individual tax
                    -------------------------------------------------
                    */

                    const individualTax =
                        money(
                            basicTax +
                            salaryTax +
                            additionalTax
                        );


                    /*
                    -------------------------------------------------
                    Municipality 50%
                    -------------------------------------------------
                    */

                    const municipalShare =
                        money(
                            individualTax / 2
                        );


                    /*
                    -------------------------------------------------
                    Barangay 50%
                    -------------------------------------------------
                    */

                    const barangayShare =
                        money(
                            individualTax / 2
                        );


                    /*
                    =================================================
                    4-01-01-050-1
                    *CTC-Individual
                    =================================================
                    */

                    addSummary(

                        individualAccount?.id ??
                            null,

                        individualAccount
                            ?.account_code ??
                            CTC_ACCOUNTS
                                .INDIVIDUAL
                                .code,

                        individualAccount
                            ?.account_name ??
                            CTC_ACCOUNTS
                                .INDIVIDUAL
                                .name,

                        municipalShare

                    );


                    /*
                    =================================================
                    4-01-01-050-2
                    CTC-Individual (Bgy.- 50%)
                    =================================================
                    */

                    addSummary(

                        barangayAccount?.id ??
                            null,

                        barangayAccount
                            ?.account_code ??
                            CTC_ACCOUNTS
                                .INDIVIDUAL_BARANGAY
                                .code,

                        barangayAccount
                            ?.account_name ??
                            CTC_ACCOUNTS
                                .INDIVIDUAL_BARANGAY
                                .name,

                        barangayShare

                    );


                    /*
                    =================================================
                    4-01-01-050-4
                    *CTC-Individual Fines & Penalties
                    =================================================
                    */

                    const penalty =
                        toNumber(
                            ctc.penalty
                        );


                    const interest =
                        toNumber(
                            ctc.interest
                        );


                    const totalPenalty =
                        money(
                            penalty +
                            interest
                        );


                    addSummary(

                        penaltyAccount?.id ??
                            null,

                        penaltyAccount
                            ?.account_code ??
                            CTC_ACCOUNTS
                                .INDIVIDUAL_PENALTY
                                .code,

                        penaltyAccount
                            ?.account_name ??
                            CTC_ACCOUNTS
                                .INDIVIDUAL_PENALTY
                                .name,

                        totalPenalty

                    );


                    continue;

                }


                /*
                =================================================
                CTC-C
                =================================================
                */

                if (
                    formCode === "CTC-C"
                ) {

                    const corporationAccount =
                        accountByCode.get(
                            CTC_ACCOUNTS
                                .CORPORATION
                                .code
                        );


                    const penaltyAccount =
                        accountByCode.get(
                            CTC_ACCOUNTS
                                .CORPORATION_PENALTY
                                .code
                        );


                    /*
                    -------------------------------------------------
                    Tax
                    -------------------------------------------------
                    */

                    const basicTax =
                        toNumber(
                            ctc.basic_tax
                        );


                    const salaryTax =
                        toNumber(
                            ctc.salary_tax
                        );


                    const additionalTax =
                        toNumber(
                            ctc.additional_tax
                        );


                    const corporationTax =
                        money(
                            basicTax +
                            salaryTax +
                            additionalTax
                        );


                    /*
                    -------------------------------------------------
                    Penalty
                    -------------------------------------------------
                    */

                    const penalty =
                        toNumber(
                            ctc.penalty
                        );


                    const interest =
                        toNumber(
                            ctc.interest
                        );


                    const corporationPenalty =
                        money(
                            penalty +
                            interest
                        );


                    /*
                    =================================================
                    4-01-01-050-3
                    *CTC-Corporation
                    =================================================
                    */

                    addSummary(

                        corporationAccount?.id ??
                            null,

                        corporationAccount
                            ?.account_code ??
                            CTC_ACCOUNTS
                                .CORPORATION
                                .code,

                        corporationAccount
                            ?.account_name ??
                            CTC_ACCOUNTS
                                .CORPORATION
                                .name,

                        corporationTax

                    );


                    /*
                    =================================================
                    4-01-01-050-5
                    *CTC-Corporation Fines & Penalties
                    =================================================
                    */

                    addSummary(

                        penaltyAccount?.id ??
                            null,

                        penaltyAccount
                            ?.account_code ??
                            CTC_ACCOUNTS
                                .CORPORATION_PENALTY
                                .code,

                        penaltyAccount
                            ?.account_name ??
                            CTC_ACCOUNTS
                                .CORPORATION_PENALTY
                                .name,

                        corporationPenalty

                    );


                    continue;

                }

            }


            /*
            =====================================================
            NON-RPT / NON-CTC TRANSACTION
            =====================================================

            AF51
            AF56
            Other accountable forms
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
            Add actual accounts used.
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

    }
    catch (
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