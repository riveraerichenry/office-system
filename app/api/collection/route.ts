import {
    NextRequest,
    NextResponse,
} from "next/server";

import { pool } from "@/lib/db";
import { authorize } from "@/lib/authorize";
import { MODULE_PATHS } from "@/lib/module-paths";


/* ============================================================
   TYPES
============================================================ */

type ColumnDefinition = {
    id: string;
    code: string | null;
    label: string;
};

type ColumnGroup = {
    id: string;
    label: string;
    columns: ColumnDefinition[];
};

type CollectionRow = {
    id: string;

    remittance_no: string | null;

    remittance_date: string | null;

    total_amount: number;

    rcd_transaction_id: string | null;

    report_no: string | null;

    report_date: string | null;

    collector_name: string | null;

    fund_code: string | null;

    fund_name: string | null;

    values: Record<string, number>;
};


/* ============================================================
   HELPERS
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


function money(
    value: number
): number {

    return Number(
        value.toFixed(2)
    );

}


/* ============================================================
   ADD VALUE
============================================================ */

function addValue(
    values: Record<string, number>,
    key: string,
    amount: number
) {

    const value =
        toNumber(amount);


    if (
        !Number.isFinite(value)
    ) {
        return;
    }


    values[key] =
        money(
            (
                values[key] ??
                0
            ) +
            value
        );

}


/* ============================================================
   RPT GROUP
============================================================ */

const RPT_COLUMNS: ColumnDefinition[] = [

    {
        id: "rpt_basic",
        code: null,
        label: "BASIC",
    },

    {
        id: "rpt_sef",
        code: null,
        label: "SEF",
    },

    {
        id: "rpt_total",
        code: null,
        label: "TOTAL",
    },

];


/* ============================================================
   TAX REVENUE GROUP
============================================================ */

const TAX_REVENUE_COLUMNS: ColumnDefinition[] = [

    {
        id: "ctc_barangay",
        code: "4 01 01 050",
        label: "CTC-brgy(50%)",
    },

    {
        id: "ctc_corporation",
        code: "4 01 01 050",
        label: "CTC-corp.",
    },

    {
        id: "ctc_individual",
        code: "4 01 01 050",
        label: "CTC-indv.",
    },

    {
        id: "ctc_penalty",
        code: null,
        label: "CTC-PEN.",
    },

];


/* ============================================================
   GET
============================================================ */

export async function GET(
    req: NextRequest
) {

    try {

        /* ========================================================
           AUTHORIZATION
        ======================================================== */

        await authorize(
            req,
            MODULE_PATHS.DIPP,
            "view"
        );


        /* ========================================================
           LOAD REMITTANCES
           
           REMITTANCE
                ↓
           RCD
                ↓
           RCD ITEMS
                ↓
           COLLECTORS
        ======================================================== */

        const remittanceResult =
            await pool.query(
                `

                SELECT

                    rt.id
                        AS remittance_id,

                    rt.remittance_no,

                    rt.remittance_date,

                    rt.total_amount,

                    rcd.id
                        AS rcd_transaction_id,

                    rcd.report_no,

                    rcd.report_date,

                    rcd.fund_source_id,

                    fs.fund_code,

                    fs.fund_name,

                    COALESCE(

                        STRING_AGG(
                            DISTINCT
                            collector.full_name,
                            ', '
                        )
                        FILTER (
                            WHERE
                                collector.full_name
                                IS NOT NULL
                        ),

                        rcd_user.full_name,

                        '—'

                    )
                        AS collector_name

                FROM remittance_transactions rt

                INNER JOIN rcd_transaction rcd

                    ON rcd.id =
                       rt.rcd_transaction_id

                LEFT JOIN fund_sources fs

                    ON fs.id =
                       rcd.fund_source_id

                LEFT JOIN rcd_items ri

                    ON ri.rcd_transaction_id =
                       rcd.id

                LEFT JOIN users collector

                    ON collector.id =
                       ri.collector_id

                LEFT JOIN users rcd_user

                    ON rcd_user.id =
                       rcd.rcd_by

                GROUP BY

                    rt.id,

                    rt.remittance_no,

                    rt.remittance_date,

                    rt.total_amount,

                    rt.created_at,

                    rcd.id,

                    rcd.report_no,

                    rcd.report_date,

                    rcd.fund_source_id,

                    fs.fund_code,

                    fs.fund_name,

                    rcd_user.full_name

                ORDER BY

                    rt.remittance_date DESC NULLS LAST,

                    rt.created_at DESC NULLS LAST,

                    rt.id DESC

                `
            );


        /* ========================================================
           LOAD ACTIVE ACCOUNTS

           Used for normal dipp_transaction_items.

           accounts has parent_id, which lets us determine
           the account group.
        ======================================================== */

        const accountResult =
            await pool.query(
                `

                SELECT

                    a.id,

                    a.account_code,

                    a.account_name,

                    a.parent_id,

                    parent.account_code
                        AS parent_account_code,

                    parent.account_name
                        AS parent_account_name

                FROM accounts a

                LEFT JOIN accounts parent

                    ON parent.id =
                       a.parent_id

                WHERE
                    a.is_active = TRUE

                ORDER BY
                    a.account_code

                `
            );


        const accountMap =
            new Map<
                string,
                any
            >();


        for (
            const account
            of accountResult.rows
        ) {

            accountMap.set(
                String(
                    account.id
                ),
                account
            );

        }


        /* ========================================================
           DYNAMIC ACCOUNT GROUPS

           These are populated from normal
           dipp_transaction_items.
        ======================================================== */

        const dynamicGroups =
            new Map<
                string,
                {
                    id: string;
                    label: string;
                    columns: Map<
                        string,
                        ColumnDefinition
                    >;
                }
            >();


        /*
         * Find the correct group for a normal account.
         */

        function getNormalGroup(
            account: any
        ) {

            const parentName =
                String(
                    account?.parent_account_name ??
                    ""
                )
                    .trim();


            const parentCode =
                String(
                    account?.parent_account_code ??
                    ""
                )
                    .trim();


            const accountName =
                String(
                    account?.account_name ??
                    ""
                )
                    .trim();


            const combined =
                (
                    parentName +
                    " " +
                    accountName
                )
                    .toUpperCase();


            /*
             * TAXES ON GOODS & SERVICES
             */

            if (
                combined.includes(
                    "TAXES ON GOODS"
                ) ||
                combined.includes(
                    "GOODS & SERVICES"
                ) ||
                combined.includes(
                    "GOODS AND SERVICES"
                )
            ) {

                return {
                    id:
                        "tax-goods",

                    label:
                        "TAXES ON GOODS & SERVICES-COL004",
                };

            }


            /*
             * TAX REVENUE
             */

            if (
                combined.includes(
                    "TAX REVENUE"
                )
            ) {

                return {
                    id:
                        "tax-revenue-other",

                    label:
                        "TAX REVENUE-COL002",
                };

            }


            /*
             * PARENT ACCOUNT
             */

            if (
                parentName
            ) {

                return {
                    id:
                        `parent-${account.parent_id}`,

                    label:
                        parentName,
                };

            }


            /*
             * FALLBACK
             */

            return {
                id:
                    "other-collections",

                label:
                    "OTHER COLLECTIONS",
            };

        }


        /* ========================================================
           PROCESS EACH REMITTANCE
        ======================================================== */

        const rows:
            CollectionRow[] = [];


        for (
            const remittance
            of remittanceResult.rows
        ) {

            const values:
                Record<string, number> = {};


            /* ====================================================
               GET DIPP TRANSACTIONS IN THIS RCD
            ==================================================== */

            const transactionResult =
                await pool.query(
                    `

                    SELECT DISTINCT

                        ri.dipp_transaction_id,

                        dt.or_number,

                        dt.accountable_form_id,

                        af.form_code

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

                    AND

                        COALESCE(
                            dt.is_cancelled,
                            FALSE
                        ) = FALSE

                    ORDER BY
                        dt.or_number

                    `,
                    [
                        remittance.rcd_transaction_id,
                    ]
                );


            /* ====================================================
               PROCESS EACH DIPP TRANSACTION
            ==================================================== */

            for (
                const transaction
                of transactionResult.rows
            ) {

                const transactionId =
                    transaction.dipp_transaction_id;


                const formCode =
                    String(
                        transaction.form_code ??
                        ""
                    )
                        .trim()
                        .toUpperCase();


                /* ==================================================
                   RPT
                   
                   RPT values come from dipp_rpt_items.
                ================================================== */

                const rptResult =
                    await pool.query(
                        `

                        SELECT

                            basic,

                            sef,

                            penalty,

                            discount,

                            amount

                        FROM dipp_rpt_items

                        WHERE
                            transaction_id =
                            $1

                        `,
                        [
                            transactionId,
                        ]
                    );


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


                        /*
                         * The screenshot/report structure
                         * shows RPT as:
                         *
                         * BASIC
                         * SEF
                         * TOTAL
                         *
                         * TOTAL = BASIC + SEF
                         *
                         * Penalty is handled separately
                         * in the existing account logic.
                         */

                        addValue(
                            values,
                            "rpt_basic",
                            basic
                        );


                        addValue(
                            values,
                            "rpt_sef",
                            sef
                        );


                        addValue(
                            values,
                            "rpt_total",
                            basic + sef
                        );

                    }


                    /*
                     * Important:
                     *
                     * RPT transactions are handled here.
                     * Do not also read dipp_transaction_items
                     * for the same RPT transaction.
                     */

                    continue;

                }


                /* ==================================================
                   CTC
                ================================================== */

                if (
                    formCode === "CTC-I" ||
                    formCode === "CTC-C"
                ) {

                    const ctcResult =
                        await pool.query(
                            `

                            SELECT

                                basic_tax,

                                salary_tax,

                                additional_tax,

                                penalty,

                                interest

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


                    if (
                        ctcResult.rows.length ===
                        0
                    ) {

                        continue;

                    }


                    const ctc =
                        ctcResult.rows[0];


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


                    const totalTax =
                        money(
                            basicTax +
                            salaryTax +
                            additionalTax
                        );


                    const penalty =
                        money(
                            toNumber(
                                ctc.penalty
                            ) +
                            toNumber(
                                ctc.interest
                            )
                        );


                    /* ==============================================
                       CTC INDIVIDUAL
                    ============================================== */

                    if (
                        formCode === "CTC-I"
                    ) {

                        const municipalShare =
                            money(
                                totalTax /
                                2
                            );


                        const barangayShare =
                            money(
                                totalTax /
                                2
                            );


                        addValue(
                            values,
                            "ctc_individual",
                            municipalShare
                        );


                        addValue(
                            values,
                            "ctc_barangay",
                            barangayShare
                        );


                        addValue(
                            values,
                            "ctc_penalty",
                            penalty
                        );

                    }


                    /* ==============================================
                       CTC CORPORATION
                    ============================================== */

                    if (
                        formCode === "CTC-C"
                    ) {

                        addValue(
                            values,
                            "ctc_corporation",
                            totalTax
                        );


                        addValue(
                            values,
                            "ctc_penalty",
                            penalty
                        );

                    }


                    /*
                     * CTC is handled above.
                     * Don't also read transaction items.
                     */

                    continue;

                }


                /* ==================================================
                   NORMAL TRANSACTION
                   
                   AF51 / AF56 / other forms.
                ================================================== */

                const transactionItemsResult =
                    await pool.query(
                        `

                        SELECT

                            dti.account_id,

                            dti.amount,

                            a.account_code,

                            a.account_name,

                            a.parent_id,

                            parent.account_code
                                AS parent_account_code,

                            parent.account_name
                                AS parent_account_name

                        FROM dipp_transaction_items dti

                        INNER JOIN accounts a

                            ON a.id =
                               dti.account_id

                        LEFT JOIN accounts parent

                            ON parent.id =
                               a.parent_id

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


                for (
                    const item
                    of transactionItemsResult.rows
                ) {

                    const accountId =
                        String(
                            item.account_id
                        );


                    const amount =
                        toNumber(
                            item.amount
                        );


                    if (
                        amount === 0
                    ) {
                        continue;
                    }


                    const group =
                        getNormalGroup(
                            item
                        );


                    /*
                     * TAX REVENUE and TAX GOODS groups
                     * are already represented by the main
                     * special groups.
                     *
                     * Add their actual account columns.
                     */

                    let groupRecord =
                        dynamicGroups.get(
                            group.id
                        );


                    if (
                        !groupRecord
                    ) {

                        groupRecord = {

                            id:
                                group.id,

                            label:
                                group.label,

                            columns:
                                new Map(),

                        };


                        dynamicGroups.set(
                            group.id,
                            groupRecord
                        );

                    }


                    if (
                        !groupRecord.columns.has(
                            accountId
                        )
                    ) {

                        groupRecord.columns.set(
                            accountId,
                            {

                                id:
                                    `account-${accountId}`,

                                code:
                                    item.account_code ??
                                    null,

                                label:
                                    item.account_name ??
                                    item.account_code ??
                                    "Account",

                            }
                        );

                    }


                    addValue(
                        values,
                        `account-${accountId}`,
                        amount
                    );

                }

            }


            /* ====================================================
               BUILD ROW
            ==================================================== */

            rows.push({

                id:
                    String(
                        remittance.remittance_id
                    ),

                remittance_no:
                    remittance.remittance_no ??
                    null,

                remittance_date:
                    remittance.remittance_date ??
                    null,

                total_amount:
                    money(
                        toNumber(
                            remittance.total_amount
                        )
                    ),

                rcd_transaction_id:
                    remittance.rcd_transaction_id ??
                    null,

                report_no:
                    remittance.report_no ??
                    null,

                report_date:
                    remittance.report_date ??
                    null,

                collector_name:
                    remittance.collector_name ??
                    null,

                fund_code:
                    remittance.fund_code ??
                    null,

                fund_name:
                    remittance.fund_name ??
                    null,

                values,

            });

        }


        /* ========================================================
           BUILD COLUMN GROUPS
        ======================================================== */

        const columnGroups:
            ColumnGroup[] = [];


        /*
         * RPT
         */

        columnGroups.push({

            id:
                "rpt",

            label:
                "RPT",

            columns:
                RPT_COLUMNS,

        });


        /*
         * TAX REVENUE
         */

        columnGroups.push({

            id:
                "tax-revenue",

            label:
                "TAX REVENUE-COL002",

            columns:
                TAX_REVENUE_COLUMNS,

        });


        /*
         * TAXES ON GOODS & SERVICES
         *
         * We create this only when there are
         * actual matching accounts.
         */

        const taxGoodsGroup =
            dynamicGroups.get(
                "tax-goods"
            );


        if (
            taxGoodsGroup &&
            taxGoodsGroup.columns.size > 0
        ) {

            columnGroups.push({

                id:
                    "tax-goods",

                label:
                    taxGoodsGroup.label,

                columns:
                    Array.from(
                        taxGoodsGroup.columns.values()
                    ),

            });

        }


        /*
         * OTHER TAX REVENUE ACCOUNTS
         */

        const otherTaxRevenueGroup =
            dynamicGroups.get(
                "tax-revenue-other"
            );


        if (
            otherTaxRevenueGroup &&
            otherTaxRevenueGroup.columns.size > 0
        ) {

            columnGroups.push({

                id:
                    "tax-revenue-other",

                label:
                    "TAX REVENUE-COL002 - OTHER",

                columns:
                    Array.from(
                        otherTaxRevenueGroup.columns.values()
                    ),

            });

        }


        /*
         * OTHER PARENT ACCOUNT GROUPS
         */

        for (
            const group
            of dynamicGroups.values()
        ) {

            if (
                group.id ===
                "tax-goods"
            ) {
                continue;
            }


            if (
                group.id ===
                "tax-revenue-other"
            ) {
                continue;
            }


            if (
                group.columns.size ===
                0
            ) {
                continue;
            }


            columnGroups.push({

                id:
                    group.id,

                label:
                    group.label,

                columns:
                    Array.from(
                        group.columns.values()
                    ),

            });

        }


        /* ========================================================
           RESPONSE
        ======================================================== */

        return NextResponse.json({

            success:
                true,

            data:
                rows,

            columnGroups,

            count:
                rows.length,

        });


    } catch (
        error: any
    ) {

        console.error(
            "GET COLLECTION ERROR:",
            error
        );


        return NextResponse.json(

            {
                success:
                    false,

                message:
                    error?.message ??
                    "Failed to load collection.",
            },

            {
                status:
                    500,
            }

        );

    }

}