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

function quarterlyTax(
    assessedValue: number
): number {
    return (
        assessedValue *
        RULES.annualTaxRate /
        4
    );
}

function discountPercent(
    taxYear: number,
    paymentDate: Date
): number {

    const paymentYear =
        paymentDate.getFullYear();

    const paymentMonth =
        paymentDate.getMonth() + 1;

    /*
        Advance payment

        Example:
        Paying 2027 tax during 2026
        =20%
    */

    if (taxYear === paymentYear + 1) {
        return RULES.advanceDiscount;
    }

    /*
        Current year
        Jan-Mar
        =10%
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
    */

    if (taxYear > paymentYear) {
        return 0;
    }

    /*
        Current year
        Jan-Mar
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
            April = 8%
            May =10%
            June=12%
            ...
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

    if (penalty > RULES.maximumPenalty) {
        penalty = RULES.maximumPenalty;
    }

    return penalty;
}

export function computeRPT(
    input: RPTComputationInput
): RPTComputationResult {

    const {
        assessedValue,
        taxYear,
        paymentDate,
    } = input;

    const taxDue =
        quarterlyTax(
            assessedValue
        );

    const basic =
        taxDue / 2;

    const sef =
        taxDue / 2;

    const penaltyRate =
        penaltyPercent(
            taxYear,
            paymentDate
        );

    const discountRate =
        discountPercent(
            taxYear,
            paymentDate
        );

    const penalty =
        taxDue *
        penaltyRate /
        100;

    const discount =
        taxDue *
        discountRate /
        100;

    const total =
        taxDue +
        penalty -
        discount;

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