import {
    NextRequest,
    NextResponse,
} from "next/server";

import { Pool } from "pg";


const pool = new Pool({
    connectionString:
        process.env.DATABASE_URL,
});


/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

type AbstractRow = {

    id: string;

    no: number;

    date: string | null;

    or_number: string | null;

    payor: string | null;

    account_id: string | null;

    account_code: string;

    account_name: string;

    particulars: string;

    remarks: string | null;

    amount: number;

};


/*
|--------------------------------------------------------------------------
| RPT ACCOUNT MAPPING
|--------------------------------------------------------------------------
|
| ACCOUNTING RULES ARE INTENTIONALLY HARDCODED.
|
| OR NUMBER / DATE / PAYOR ARE NEVER HARDCODED.
| They come from dipp_transactions.
|
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
    value: any
): number {

    const result =
        Number(
            value ?? 0
        );

    return Number.isFinite(
        result
    )
        ? result
        : 0;

}


function money(
    value: number
): number {

    return Number(
        value.toFixed(2)
    );

}


function classifyYear(
    year: number,
    currentYear: number
):
    "CURRENT" |
    "PREVIOUS" |
    "ADVANCE" {

    if (
        year <
        currentYear
    ) {

        return "PREVIOUS";

    }

    if (
        year >
        currentYear
    ) {

        return "ADVANCE";

    }

    return "CURRENT";

}


/*
|--------------------------------------------------------------------------
| GET
|--------------------------------------------------------------------------
*/

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

        /*
        ================================================================
        RCD ID
        ================================================================
        */

        const {
            id: rcdId,
        } =
            await params;


        if (!rcdId) {

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
        ================================================================
        GET RCD
        ================================================================
        */

        const rcdResult =
            await pool.query(
                `
                SELECT

                    rt.id,

                    rt.report_no,

                    rt.report_date,

                    rt.fund_source_id,

                    rt.rcd_by,

                    u.full_name
                        AS rcd_by_name,

                    fs.fund_code,

                    fs.fund_name,

                    fs.acronym

                FROM rcd_transaction rt

                LEFT JOIN fund_sources fs
                    ON fs.id =
                       rt.fund_source_id

                LEFT JOIN users u
                    ON u.id =
                       rt.rcd_by

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
        ================================================================
        CURRENT YEAR
        ================================================================
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
        ================================================================
        GET RCD TRANSACTIONS
        ================================================================
        */

        /*
        OR NUMBER
        RECEIPT DATE
        PAYOR

        ALL COME FROM dipp_transactions.
        */

        const transactionsResult =
            await pool.query(
                `
                SELECT

                    ri.id
                        AS rcd_item_id,

                    ri.dipp_transaction_id,

                    dt.or_number,

                    dt.receipt_date,

                    dt.payor,

                    dt.payment_mode,

                    dt.grand_total,

                    dt.transaction_type,

                    dt.accountable_form_id,

                    af.form_code,

                    dt.status,

                    dt.is_cancelled,

                    dt.is_remitted,

                    dt.created_at

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

                    dt.receipt_date,

                    dt.or_number,

                    dt.created_at
                `,
                [
                    rcdId,
                ]
            );


        const transactions =
            transactionsResult.rows;


        /*
        ================================================================
        ACCOUNT LOOKUP
        ================================================================
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

            if (
                !account.account_code
            ) {

                continue;

            }


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


        /*
        ================================================================
        RPT GROUP MAP
        ================================================================
        */

        /*
        One key represents:

            ONE RECEIPT
            + ONE PAYOR
            + ONE ACCOUNT

        Therefore multiple RPT items belonging to the same receipt
        and same account classification are combined.
        */

        const rptGroups =
            new Map<
                string,
                {
                    transaction: any;

                    accountId: string | null;

                    accountCode: string;

                    accountName: string;

                    particulars: string;

                    remarks: string | null;

                    amount: number;
                }
            >();


        /*
        ================================================================
        ADD RPT GROUP
        ================================================================
        */

        function addRptGroup(
            transaction: any,

            account: {
                code: string;

                name: string;
            },

            amount: number,

            remarks:
                string | null = null
        ) {

            const value =
                toNumber(
                    amount
                );


            if (
                Math.abs(value) <
                0.005
            ) {

                return;

            }


            /*
            ------------------------------------------------------------
            IMPORTANT:

            Group using the actual receipt/payor.

            This means:

            Same OR + same payor + same account
            = one row
            ------------------------------------------------------------
            */

            const key = [

                transaction.dipp_transaction_id,

                transaction.or_number ?? "",

                transaction.payor ?? "",

                account.code,

            ].join("|");


            const accountRecord =
                accountByCode.get(
                    account.code
                );


            const existing =
                rptGroups.get(
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


            rptGroups.set(
                key,
                {

                    transaction,

                    accountId:
                        accountRecord?.id ??
                        null,

                    accountCode:
                        accountRecord
                            ?.account_code ??
                        account.code,

                    accountName:
                        accountRecord
                            ?.account_name ??
                        account.name,

                    particulars:
                        accountRecord
                            ?.account_name ??
                        account.name,

                    remarks:
                        remarks,

                    amount:
                        money(
                            value
                        ),

                }
            );

        }


        /*
        ================================================================
        NON-RPT ROWS
        ================================================================
        */

        const nonRptRows:
            AbstractRow[] = [];


        /*
        ================================================================
        ADD CTC ROW
        ================================================================
        */

        function addCtcRow(
            transaction: any,
            account: {
                id?: string;
                account_code?: string;
                account_name?: string;
            } | null | undefined,
            fallbackCode: string,
            fallbackName: string,
            amount: number,
            remarks: string | null = null
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


            nonRptRows.push({

                id:
                    `${transaction.dipp_transaction_id}-ctc-${fallbackCode}-${nonRptRows.length}`,

                no:
                    0,

                date:
                    transaction.receipt_date ??
                    null,

                or_number:
                    transaction.or_number
                        ? String(
                            transaction.or_number
                        )
                        : null,

                payor:
                    transaction.payor ??
                    null,

                account_id:
                    account?.id ??
                    null,

                account_code:
                    account?.account_code ??
                    fallbackCode,

                account_name:
                    account?.account_name ??
                    fallbackName,

                particulars:
                    account?.account_name ??
                    fallbackName,

                remarks:
                    remarks,

                amount:
                    value,

            });

        }


        /*
        ================================================================
        PROCESS RCD TRANSACTIONS
        ================================================================
        */

        for (
            const transaction
            of transactions
        ) {

            const transactionId =
                transaction.dipp_transaction_id;


            /*
            ============================================================
            GET RPT ITEMS
            ============================================================
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

                        end_quarter,

                        id
                    `,
                    [
                        transactionId,
                    ]
                );


            /*
            ============================================================
            RPT TRANSACTION
            ============================================================
            */

            if (
                rptResult.rows.length > 0
            ) {

                /*
                --------------------------------------------------------
                PROCESS EVERY RPT ITEM
                --------------------------------------------------------
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
                    ----------------------------------------------------
                    TAX YEAR
                    ----------------------------------------------------
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
                    ====================================================
                    BASIC
                    ====================================================
                    */

                    let basicAccount =
                        RPT_ACCOUNTS
                            .BASIC_CURRENT;


                    if (
                        classification ===
                        "PREVIOUS"
                    ) {

                        basicAccount =
                            RPT_ACCOUNTS
                                .BASIC_PREVIOUS;

                    }
                    else if (
                        classification ===
                        "ADVANCE"
                    ) {

                        basicAccount =
                            RPT_ACCOUNTS
                                .BASIC_ADVANCE;

                    }


                    addRptGroup(

                        transaction,

                        basicAccount,

                        basic,

                        rpt.td_number
                            ? `TD No. ${rpt.td_number}`
                            : null

                    );


                    /*
                    ====================================================
                    SEF
                    ====================================================
                    */

                    let sefAccount =
                        RPT_ACCOUNTS
                            .SEF_CURRENT;


                    if (
                        classification ===
                        "PREVIOUS"
                    ) {

                        sefAccount =
                            RPT_ACCOUNTS
                                .SEF_PREVIOUS;

                    }
                    else if (
                        classification ===
                        "ADVANCE"
                    ) {

                        sefAccount =
                            RPT_ACCOUNTS
                                .SEF_ADVANCE;

                    }


                    addRptGroup(

                        transaction,

                        sefAccount,

                        sef,

                        rpt.td_number
                            ? `TD No. ${rpt.td_number}`
                            : null

                    );


                    /*
                    ====================================================
                    PENALTY
                    ====================================================
                    */

                    /*
                    Existing RPT penalty is split:

                        50% BASIC
                        50% SEF
                    */

                    const basicPenalty =
                        penalty / 2;


                    const sefPenalty =
                        penalty / 2;


                    let basicPenaltyAccount =
                        RPT_ACCOUNTS
                            .BASIC_PENALTY_CURRENT;


                    let sefPenaltyAccount =
                        RPT_ACCOUNTS
                            .SEF_PENALTY_CURRENT;


                    if (
                        classification ===
                        "PREVIOUS"
                    ) {

                        basicPenaltyAccount =
                            RPT_ACCOUNTS
                                .BASIC_PENALTY_PREVIOUS;

                        sefPenaltyAccount =
                            RPT_ACCOUNTS
                                .SEF_PENALTY_PREVIOUS;

                    }


                    addRptGroup(

                        transaction,

                        basicPenaltyAccount,

                        basicPenalty,

                        rpt.td_number
                            ? `TD No. ${rpt.td_number}`
                            : null

                    );


                    addRptGroup(

                        transaction,

                        sefPenaltyAccount,

                        sefPenalty,

                        rpt.td_number
                            ? `TD No. ${rpt.td_number}`
                            : null

                    );


                    /*
                    ====================================================
                    DISCOUNT
                    ====================================================
                    */

                    /*
                    Existing RPT discount is split:

                        50% BASIC
                        50% SEF
                    */

                    const basicDiscount =
                        discount / 2;


                    const sefDiscount =
                        discount / 2;


                    addRptGroup(

                        transaction,

                        RPT_ACCOUNTS
                            .BASIC_DISCOUNT,

                        basicDiscount,

                        rpt.td_number
                            ? `TD No. ${rpt.td_number}`
                            : null

                    );


                    addRptGroup(

                        transaction,

                        RPT_ACCOUNTS
                            .SEF_DISCOUNT,

                        sefDiscount,

                        rpt.td_number
                            ? `TD No. ${rpt.td_number}`
                            : null

                    );

                }


                /*
                --------------------------------------------------------
                IMPORTANT:

                Do NOT process dipp_transaction_items for RPT.
                --------------------------------------------------------
                */

                continue;

            }


            /*
            ============================================================
            CTC TRANSACTION
            ============================================================
            */

            const formCode =
                transaction.form_code
                    ? String(
                        transaction.form_code
                    ).trim().toUpperCase()
                    : "";


          /*
============================================================
AF58 TRANSACTION
============================================================
*/

if (
    formCode === "AF58"
) {

    /*
    ------------------------------------------------------------
    GET AF58 DETAILS
    ------------------------------------------------------------
    */

    const af58Result =
        await pool.query(
            `
            SELECT
                *
            FROM dipp_af58_items
            WHERE
                transaction_id = $1
            ORDER BY
                id
            `,
            [
                transactionId,
            ]
        );


    /*
    ------------------------------------------------------------
    AF58 DETAIL NOT FOUND
    ------------------------------------------------------------
    */

    if (
        af58Result.rows.length === 0
    ) {

        console.warn(
            "AF58 transaction has no dipp_af58_items:",
            transactionId
        );

        continue;
    }


    /*
    ------------------------------------------------------------
    BURIAL PERMIT ACCOUNT
    ------------------------------------------------------------
    */

    const burialPermitAccount =
        accountByCode.get(
            "4-02-01-010-8"
        );


    /*
    ------------------------------------------------------------
    TOTAL AF58 AMOUNT
    ------------------------------------------------------------
    */

    let af58Amount = 0;


    for (
        const item
        of af58Result.rows
    ) {

        af58Amount +=
            toNumber(
                item.amount
            );

    }


    af58Amount =
        money(
            af58Amount
        );


    /*
    ------------------------------------------------------------
    AF58 REMARKS
    ------------------------------------------------------------
    */

    const af58Remarks =
        af58Result.rows
            .map(
                (
                    item: any
                ) => {

                    if (
                        item.remarks ===
                        null ||
                        item.remarks ===
                        undefined
                    ) {

                        return "";

                    }

                    return String(
                        item.remarks
                    ).trim();

                }
            )
            .filter(
                Boolean
            )
            .join(
                " - "
            );


        /*
============================================================
AF58 TRANSACTION
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
    AF58 DETAIL NOT FOUND
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
        PROCESS AF58 ITEMS
        ------------------------------------------------------------
        */

        for (
            const item
            of af58Result.rows
        ) {

            const feeAmount =
                money(
                    toNumber(
                        item.fee_amount
                    )
                );


            /*
            --------------------------------------------------------
            SKIP ZERO AMOUNT
            --------------------------------------------------------
            */

            if (
                Math.abs(
                    feeAmount
                ) < 0.005
            ) {

                continue;

            }


            /*
            --------------------------------------------------------
            ACCOUNT
            --------------------------------------------------------
            */

            const account =
                item.account_code
                    ? {
                        id:
                            item.account_id,

                        account_code:
                            item.account_code,

                        account_name:
                            item.account_name,
                    }
                    : accountByCode.get(
                        "4-02-01-010-8"
                    );


            /*
            --------------------------------------------------------
            ADD AF58 ROW
            --------------------------------------------------------
            */

            nonRptRows.push({

                id:
                    `${transactionId}-AF58-${item.id}`,

                no:
                    0,

                /*
                ----------------------------------------------------
                TRANSACTION INFORMATION
                ----------------------------------------------------
                */

                date:
                    transaction.receipt_date ??
                    null,

                or_number:
                    transaction.or_number
                        ? String(
                            transaction.or_number
                        )
                        : null,

                payor:
                    transaction.payor ??
                    null,

                /*
                ----------------------------------------------------
                ACCOUNT
                ----------------------------------------------------
                */

                account_id:
                    account?.id ??
                    null,

                account_code:
                    account?.account_code ??
                    "4-02-01-010-8",

                account_name:
                    account?.account_name ??
                    "*Burial Permit Fees",

                particulars:
                    account?.account_name ??
                    "*Burial Permit Fees",

                /*
                ----------------------------------------------------
                REMARKS
                ----------------------------------------------------

                AF58 doesn't have a remarks column.
                So use the transaction remarks if available.
                ----------------------------------------------------
                */

                remarks:
                    transaction.remarks ??
                    null,

                /*
                ----------------------------------------------------
                AMOUNT
                ----------------------------------------------------
                */

                amount:
                    feeAmount,

            });

        }


        /*
        ------------------------------------------------------------
        AF58 COMPLETE
        ------------------------------------------------------------

        Do NOT process AF58 again through the normal
        dipp_transaction_items logic.
        ------------------------------------------------------------
        */

        continue;
    }


        /*
        ------------------------------------------------------------
        IMPORTANT
        ------------------------------------------------------------

        AF58 has already been processed.

        Do not allow it to continue into the normal
        dipp_transaction_items processing.
        ------------------------------------------------------------
        */

        continue;

    }


            /*
            ============================================================
            CTC TRANSACTION
            ============================================================
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
                            transaction_id = $1

                        ORDER BY
                            id

                        LIMIT 1
                        `,
                        [
                            transactionId,
                        ]
                    );


                /*
                ------------------------------------------------------------
                CTC DETAIL NOT FOUND
                ------------------------------------------------------------
                */

                if (
                    ctcResult.rows.length === 0
                ) {

                    /*
                    CTC transaction exists, but its detail
                    does not exist. Do not process it as
                    a normal transaction item.
                    */

                    continue;

                }


                const ctc =
                    ctcResult.rows[0];


                /*
                ============================================================
                CTC-I
                ============================================================
                */

                if (
                    formCode === "CTC-I"
                ) {

                    const individualAccount =
                        accountByCode.get(
                            "4-01-01-050-1"
                        );


                    const barangayAccount =
                        accountByCode.get(
                            "4-01-01-050-2"
                        );


                    const penaltyAccount =
                        accountByCode.get(
                            "4-01-01-050-4"
                        );


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
                    --------------------------------------------------------
                    TOTAL CTC INDIVIDUAL TAX
                    --------------------------------------------------------
                    */

                    const individualTax =
                        money(
                            basicTax +
                            salaryTax +
                            additionalTax
                        );


                    /*
                    --------------------------------------------------------
                    50% MUNICIPAL SHARE
                    --------------------------------------------------------
                    */

                    const municipalShare =
                        money(
                            individualTax / 2
                        );


                    /*
                    --------------------------------------------------------
                    50% BARANGAY SHARE
                    --------------------------------------------------------
                    */

                    const barangayShare =
                        money(
                            individualTax / 2
                        );


                    /*
                    ========================================================
                    CTC INDIVIDUAL
                    ========================================================
                    */

                    addCtcRow(

                        transaction,

                        individualAccount,

                        "4-01-01-050-1",

                        "*CTC-Individual",

                        municipalShare,

                        transaction.remarks ??
                            null

                    );


                    /*
                    ========================================================
                    CTC INDIVIDUAL BARANGAY 50%
                    ========================================================
                    */

                    addCtcRow(

                        transaction,

                        barangayAccount,

                        "4-01-01-050-2",

                        "CTC-Individual (Bgy.- 50%)",

                        barangayShare,

                        transaction.remarks ??
                            null

                    );


                    /*
                    ========================================================
                    CTC INDIVIDUAL FINES & PENALTIES
                    ========================================================
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


                    addCtcRow(

                        transaction,

                        penaltyAccount,

                        "4-01-01-050-4",

                        "*CTC-Individual Fines & Penalties",

                        totalPenalty,

                        transaction.remarks ??
                            null

                    );


                    /*
                    --------------------------------------------------------
                    CTC-I DONE
                    --------------------------------------------------------
                    */

                    continue;

                }


                /*
                ============================================================
                CTC-C
                ============================================================
                */

                if (
                    formCode === "CTC-C"
                ) {

                    const corporationAccount =
                        accountByCode.get(
                            "4-01-01-050-3"
                        );


                    const penaltyAccount =
                        accountByCode.get(
                            "4-01-01-050-5"
                        );


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
                    ========================================================
                    CTC CORPORATION
                    ========================================================
                    */

                    addCtcRow(

                        transaction,

                        corporationAccount,

                        "4-01-01-050-3",

                        "*CTC-Corporation",

                        corporationTax,

                        transaction.remarks ??
                            null

                    );


                    /*
                    ========================================================
                    CTC CORPORATION FINES & PENALTIES
                    ========================================================
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


                    addCtcRow(

                        transaction,

                        penaltyAccount,

                        "4-01-01-050-5",

                        "*CTC-Corporation Fines & Penalties",

                        corporationPenalty,

                        transaction.remarks ??
                            null

                    );


                    /*
                    --------------------------------------------------------
                    CTC-C DONE
                    --------------------------------------------------------
                    */

                    continue;

                }

            }


            /*
            ============================================================
            NON-RPT TRANSACTION
            ============================================================
            */

            const transactionItemsResult =
                await pool.query(
                    `
                    SELECT

                        dti.id,

                        dti.account_id,

                        dti.amount,

                        dti.remarks,

                        a.account_code,

                        a.account_name

                    FROM dipp_transaction_items dti

                    LEFT JOIN accounts a
                        ON a.id =
                           dti.account_id

                    WHERE
                        dti.transaction_id =
                        $1

                    ORDER BY

                        a.account_code,

                        dti.id
                    `,
                    [
                        transactionId,
                    ]
                );


            /*
            ------------------------------------------------------------
            USE ACTUAL NON-RPT ITEMS
            ------------------------------------------------------------
            */

            for (
                const item
                of transactionItemsResult.rows
            ) {

                const amount =
                    toNumber(
                        item.amount
                    );


                if (
                    Math.abs(amount) <
                    0.005
                ) {

                    continue;

                }


                nonRptRows.push({

                    id:
                        `${transactionId}-${item.id}`,

                    no:
                        0,

                    /*
                    ----------------------------------------------------
                    DYNAMIC TRANSACTION DATA
                    ----------------------------------------------------
                    */

                    date:
                        transaction.receipt_date ??
                        null,

                    or_number:
                        transaction.or_number
                            ? String(
                                transaction.or_number
                            )
                            : null,

                    payor:
                        transaction.payor ??
                        null,

                    /*
                    ----------------------------------------------------
                    ACTUAL ACCOUNT DATA
                    ----------------------------------------------------
                    */

                    account_id:
                        item.account_id ??
                        null,

                    account_code:
                        item.account_code ??
                        "—",

                    account_name:
                        item.account_name ??
                        "—",

                    particulars:
                        item.account_name ??
                        "—",

                    remarks:
                        item.remarks ??
                        null,

                    amount:
                        money(
                            amount
                        ),

                });

            }

        }


        /*
        ================================================================
        CONVERT RPT GROUPS TO ROWS
        ================================================================
        */

        const rptRows:
            AbstractRow[] =
            Array.from(
                rptGroups.values()
            ).map(
                (
                    group,
                    index
                ) => ({

                    id:
                        `rpt-${index}-${group.transaction.dipp_transaction_id}`,

                    no:
                        0,

                    /*
                    ----------------------------------------------------
                    DYNAMIC FROM DIPP TRANSACTION
                    ----------------------------------------------------
                    */

                    date:
                        group.transaction.receipt_date ??
                        null,

                    or_number:
                        group.transaction.or_number
                            ? String(
                                group.transaction.or_number
                            )
                            : null,

                    payor:
                        group.transaction.payor ??
                        null,

                    /*
                    ----------------------------------------------------
                    ACCOUNT
                    ----------------------------------------------------
                    */

                    account_id:
                        group.accountId,

                    account_code:
                        group.accountCode,

                    account_name:
                        group.accountName,

                    particulars:
                        group.particulars,

                    remarks:
                        group.remarks,

                    amount:
                        money(
                            group.amount
                        ),

                })
            );


        /*
        ================================================================
        COMBINE RPT + NON-RPT
        ================================================================
        */

        const finalItems =
            [
                ...rptRows,
                ...nonRptRows,
            ]
                .map(
                    (
                        row,
                        index
                    ) => ({

                        ...row,

                        no:
                            index + 1,

                    })
                );


        /*
        ================================================================
        GRAND TOTAL
        ================================================================
        */

        const grandTotal =
            finalItems.reduce(
                (
                    total,
                    row
                ) =>
                    total +
                    toNumber(
                        row.amount
                    ),
                0
            );


        /*
        ================================================================
        RESPONSE
        ================================================================
        */

        return NextResponse.json({

            success: true,


            /*
            ------------------------------------------------------------
            RCD
            ------------------------------------------------------------
            */

            rcd: {

                id:
                    rcd.id,

                report_no:
                    rcd.report_no,

                report_date:
                    rcd.report_date,

                rcd_by:
                    rcd.rcd_by,

                rcd_by_name:
                    rcd.rcd_by_name,

            },


            /*
            ------------------------------------------------------------
            FUND SOURCE
            ------------------------------------------------------------
            */

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


            /*
            ------------------------------------------------------------
            CURRENT YEAR
            ------------------------------------------------------------
            */

            current_year:
                currentYear,


            /*
            ------------------------------------------------------------
            TRANSACTION COUNT
            ------------------------------------------------------------
            */

            transaction_count:
                transactions.length,


            /*
            ------------------------------------------------------------
            ABSTRACT ITEMS
            ------------------------------------------------------------
            */

            items:
                finalItems,


            /*
            ------------------------------------------------------------
            GRAND TOTAL
            ------------------------------------------------------------
            */

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