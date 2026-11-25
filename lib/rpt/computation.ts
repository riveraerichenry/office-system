export type RPTComputationInput = {
    assessedValue: number;
    taxYear: number;
    paymentDate: Date;
};

export type RPTComputationResult = {
    taxDue: number;
    basic: number;
    sef: number;
    penaltyPercent: number;
    penalty: number;
    discountPercent: number;
    discount: number;
    total: number;
};

const RULES = {
    annualTaxRate: 0.02,

    advanceDiscount: 20,

    firstQuarterDiscount: 10,

    aprilPenalty: 8,

    monthlyPenaltyIncrease: 2,

    yearlyPenaltyIncrease: 24,

    maximumPenalty: 72,
};

/*
====================================================================
MONEY ROUNDING
====================================================================
*/

function roundMoney(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}

/*
====================================================================
QUARTERLY TAX
====================================================================
*/

function quarterlyTax(
    assessedValue: number
): number {
    return roundMoney(
        assessedValue *
        RULES.annualTaxRate /
        4
    );
}

/*
====================================================================
DISCOUNT COMPUTATION
====================================================================
*/

function discountPercent(
    taxYear: number,
    paymentDate: Date
): number {

    const paymentYear =
        paymentDate.getFullYear();

    const paymentMonth =
        paymentDate.getMonth() + 1;

    /*
        Any future tax year
        receives 20% discount.
    */

    if (taxYear > paymentYear) {
        return RULES.advanceDiscount;
    }

    /*
        Current year
        January - March
        receives 10% discount.
    */

    if (
        taxYear === paymentYear &&
        paymentMonth >= 1 &&
        paymentMonth <= 3
    ) {
        return RULES.firstQuarterDiscount;
    }

    return 0;
}

/*
====================================================================
PENALTY COMPUTATION
====================================================================
*/

function penaltyPercent(
    taxYear: number,
    paymentDate: Date
): number {

    const paymentYear =
        paymentDate.getFullYear();

    const paymentMonth =
        paymentDate.getMonth() + 1;

    /*
        Advance payment
        No penalty.
    */

    if (taxYear > paymentYear) {
        return 0;
    }

    /*
        Current year
        January - March
        No penalty.
    */

    if (
        taxYear === paymentYear &&
        paymentMonth <= 3
    ) {
        return 0;
    }

    let penalty = 0;

    if (taxYear === paymentYear) {

        /*
            Current year:

            April = 8%
            May = 10%
            June = 12%
            July = 14%
            August = 16%
            September = 18%
            October = 20%
            November = 22%
            December = 24%
        */

        penalty =
            RULES.aprilPenalty +
            Math.max(
                0,
                paymentMonth - 4
            ) *
            RULES.monthlyPenaltyIncrease;

    } else {

        /*
            Previous years
        */

        penalty =
            RULES.aprilPenalty +
            Math.max(
                0,
                paymentMonth - 4
            ) *
            RULES.monthlyPenaltyIncrease;

        penalty +=
            (paymentYear - taxYear) *
            RULES.yearlyPenaltyIncrease;
    }

    /*
        Maximum penalty = 72%
    */

    if (penalty > RULES.maximumPenalty) {
        penalty = RULES.maximumPenalty;
    }

    return penalty;
}

/*
====================================================================
MAIN RPT COMPUTATION
====================================================================
*/

export function computeRPT(
    input: RPTComputationInput
): RPTComputationResult {

    const {
        assessedValue,
        taxYear,
        paymentDate,
    } = input;

    /*
        Quarterly tax due
    */

    const taxDue =
        quarterlyTax(
            assessedValue
        );

    /*
        Basic and SEF
    */

    const basic =
        roundMoney(taxDue / 2);

    const sef =
        roundMoney(taxDue / 2);

    /*
        Penalty rate
    */

    const penaltyRate =
        penaltyPercent(
            taxYear,
            paymentDate
        );

    /*
        Discount rate
    */

    const discountRate =
        discountPercent(
            taxYear,
            paymentDate
        );

    /*
        Penalty amount
    */

    const penalty =
        roundMoney(
            taxDue *
            penaltyRate /
            100
        );

    /*
        Discount amount
    */

    const discount =
        roundMoney(
            taxDue *
            discountRate /
            100
        );

    /*
        Final amount
        Uses rounded monetary values.
    */

    const total =
        roundMoney(
            taxDue +
            penalty -
            discount
        );

    return {
        taxDue,
        basic,
        sef,
        penaltyPercent: penaltyRate,
        penalty,
        discountPercent: discountRate,
        discount,
        total,
    };
}