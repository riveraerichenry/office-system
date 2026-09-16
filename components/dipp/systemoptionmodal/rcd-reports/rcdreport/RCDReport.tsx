"use client";

import RCDPreview from "./RCDPreview";

type Props = {
    rcd: any;
};

export default function RCDReport({
    rcd,
}: Props) {
    /*
    ============================================================
    EMPTY STATE
    ============================================================
    */

    if (!rcd) {
        return (
            <div className="flex min-h-[500px] items-center justify-center text-sm text-gray-400">
                Select an RCD from the list.
            </div>
        );
    }

    /*
    ============================================================
    FUND SOURCE
    ============================================================
    */

    const fundSource =
        rcd.fund_source ?? {
            id: rcd.fund_source_id,
            fund_code: rcd.fund_code,
            fund_name: rcd.fund_name,
            acronym: rcd.acronym,
        };

    /*
    ============================================================
    DETERMINE FUND SOURCE
    ============================================================
    
    RPT CONDITION:
    
    If fund source is 106,
    generate TWO reports:
    
    1. 106 - GENERAL RPT - BASIC
    2. 106 - GENERAL RPT - SEF
    
    Each receives 50% of the original amount.
    */

    const fundSourceId = String(
        rcd.fund_source_id ??
            fundSource?.id ??
            ""
    ).trim();

    const fundCode = String(
        fundSource?.fund_code ??
            rcd.fund_code ??
            ""
    ).trim();

    const isRPT =
        fundSourceId === "106" ||
        fundCode === "106";

    /*
    ============================================================
    NORMAL RCD
    ============================================================
    
    If the fund source is NOT 106,
    nothing changes.
    
    It will generate one report only.
    */

    if (!isRPT) {
        return (
            <RCDPreview
                rcd={rcd}
                items={rcd.items ?? []}
                fundSource={fundSource}
                user={rcd.user ?? null}
                previousFormRows={
                    rcd.previousFormRows ?? []
                }
            />
        );
    }

    /*
    ============================================================
    HELPER
    ============================================================
    */

    const splitAmount = (
        value: any
    ): number => {
        const amount = Number(
            value ?? 0
        );

        if (
            Number.isNaN(amount)
        ) {
            return 0;
        }

        return amount / 2;
    };

    /*
    ============================================================
    SPLIT COLLECTION ITEMS
    ============================================================
    
    Every collection item is divided by 2.
    
    Example:
    
    Original:
        ₱1,000.00
    
    Basic:
        ₱500.00
    
    SEF:
        ₱500.00
    */

    const splitItems = (
        rcd.items ?? []
    ).map(
        (
            item: any
        ) => ({
            ...item,

            amount:
                splitAmount(
                    item?.amount
                ),
        })
    );

    /*
    ============================================================
    SPLIT REMITTANCE
    ============================================================
    
    Cash, check and total remittance are also
    divided by 2.
    */

    const createSplitRemittance = () => {
        if (
            !rcd.remittance
        ) {
            return null;
        }

        return {
            ...rcd.remittance,

            total_amount:
                splitAmount(
                    rcd.remittance
                        ?.total_amount
                ),

            cash_amount:
                splitAmount(
                    rcd.remittance
                        ?.cash_amount
                ),

            check_amount:
                splitAmount(
                    rcd.remittance
                        ?.check_amount
                ),
        };
    };

    /*
    ============================================================
    BASIC RPT REPORT
    ============================================================
    */

    const basicRcd = {
        ...rcd,

        /*
        -----------------------------
        TOTALS
        -----------------------------
        */

        total_collections:
            splitAmount(
                rcd.total_collections
            ),

        total_remittances:
            splitAmount(
                rcd.total_remittances
            ),

        total_deposits:
            splitAmount(
                rcd.total_deposits
            ),

        balance:
            splitAmount(
                rcd.balance
            ),

        /*
        -----------------------------
        COLLECTION ITEMS
        -----------------------------
        */

        items: splitItems,

        /*
        -----------------------------
        REMITTANCE
        -----------------------------
        */

        remittance:
            createSplitRemittance(),

        /*
        Keep original RCD number.
        */

        report_no:
            rcd.report_no,
    };

    /*
    ============================================================
    SEF RPT REPORT
    ============================================================
    */

    const sefRcd = {
        ...rcd,

        /*
        -----------------------------
        TOTALS
        -----------------------------
        */

        total_collections:
            splitAmount(
                rcd.total_collections
            ),

        total_remittances:
            splitAmount(
                rcd.total_remittances
            ),

        total_deposits:
            splitAmount(
                rcd.total_deposits
            ),

        balance:
            splitAmount(
                rcd.balance
            ),

        /*
        -----------------------------
        COLLECTION ITEMS
        -----------------------------
        */

        items: splitItems,

        /*
        -----------------------------
        REMITTANCE
        -----------------------------
        */

        remittance:
            createSplitRemittance(),

        /*
        Keep original RCD number.
        */

        report_no:
            rcd.report_no,
    };

    /*
    ============================================================
    BASIC FUND SOURCE
    ============================================================
    */

    const basicFundSource = {
        ...fundSource,

        id:
            fundSource?.id ??
            "106",

        fund_code:
            "106",

        fund_name:
            "106 - GENERAL RPT - BASIC",

        acronym:
            "GENERAL RPT - BASIC",
    };

    /*
    ============================================================
    SEF FUND SOURCE
    ============================================================
    */

    const sefFundSource = {
        ...fundSource,

        id:
            fundSource?.id ??
            "106",

        fund_code:
            "106",

        fund_name:
            "106 - GENERAL RPT - SEF",

        acronym:
            "GENERAL RPT - SEF",
    };

    /*
    ============================================================
    DEBUG
    ============================================================
    */

    console.log(
        "RCD REPORT - FUND SOURCE",
        {
            fundSourceId,
            fundCode,
            isRPT,
        }
    );

    console.log(
        "RCD REPORT - BASIC",
        basicRcd
    );

    console.log(
        "RCD REPORT - SEF",
        sefRcd
    );

    /*
    ============================================================
    RENDER TWO REPORTS
    ============================================================
    */

    return (
        <div className="flex w-full flex-col items-center">
            {/* ====================================================
                REPORT 1
            ==================================================== */}

            <div className="w-full">
                <RCDPreview
                    rcd={basicRcd}
                    items={splitItems}
                    fundSource={
                        basicFundSource
                    }
                    user={
                        rcd.user ?? null
                    }
                    previousFormRows={
                        rcd.previousFormRows ??
                        []
                    }
                />
            </div>

            {/* ====================================================
                PAGE BREAK
            ==================================================== */}

            <div
                className="print-page-break"
                aria-hidden="true"
            />

            {/* ====================================================
                REPORT 2
            ==================================================== */}

            <div className="w-full">
                <RCDPreview
                    rcd={sefRcd}
                    items={splitItems}
                    fundSource={
                        sefFundSource
                    }
                    user={
                        rcd.user ?? null
                    }
                    previousFormRows={
                        rcd.previousFormRows ??
                        []
                    }
                />
            </div>
        </div>
    );
}