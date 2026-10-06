"use client";

import { useEffect, useMemo } from "react";

type ComputedValues = {
    basicTax: number;
    incomeTax: number;
    otherIncome: number;
    interest: number;
    penalty: number;
    total: number;
};

type Props = {
    mode: string;
    grossIncome: number;

    incomeTax?: number;
    otherIncome?: number;
    basicTax?: number;
    interest?: number;
    penalty?: number;
    total?: number;

    saving: boolean;

    onModeChange: (value: string) => void;
    onGrossIncomeChange: (value: number) => void;

    onComputedChange?: (
        values: ComputedValues
    ) => void;
};

export default function TaxComputation({
    mode,
    grossIncome,
    saving,

    onModeChange,
    onGrossIncomeChange,

    onComputedChange,
}: Props) {

    /*
    ============================================================
    COMPUTATION
    ============================================================
    */

    const computedBasicTax = useMemo(() => {
        return 5;
    }, []);

    const computedIncomeTax = useMemo(() => {

        if (
            mode === "EXEMPT" ||
            mode === "PESO"
        ) {
            return 1;
        }

        return Number(grossIncome || 0) / 1000;

    }, [mode, grossIncome]);


    const computedOtherIncome = 0;

    const computedInterest = 0;

    const computedPenalty = 10;


    const computedTotal = useMemo(() => {

        return (
            computedBasicTax +
            computedIncomeTax +
            computedOtherIncome +
            computedInterest +
            computedPenalty
        );

    }, [
        computedBasicTax,
        computedIncomeTax,
        computedOtherIncome,
        computedInterest,
        computedPenalty,
    ]);


    /*
    ============================================================
    SEND COMPUTED VALUES TO PARENT
    ============================================================
    */

    useEffect(() => {

        if (!onComputedChange) {
            return;
        }

        onComputedChange({
            basicTax:
                computedBasicTax,

            incomeTax:
                computedIncomeTax,

            otherIncome:
                computedOtherIncome,

            interest:
                computedInterest,

            penalty:
                computedPenalty,

            total:
                computedTotal,
        });

    }, [
        computedBasicTax,
        computedIncomeTax,
        computedOtherIncome,
        computedInterest,
        computedPenalty,
        computedTotal,
        onComputedChange,
    ]);


    /*
    ============================================================
    FORMAT
    ============================================================
    */

    function formatCurrency(
        value: number
    ) {

        return Number(value).toLocaleString(
            "en-PH",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }
        );

    }


    /*
    ============================================================
    RENDER
    ============================================================
    */

    return (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

            {/* HEADER */}

            <div className="border-b border-slate-200 bg-slate-50 px-5 py-3">

                <h3 className="font-semibold text-slate-800">
                    Tax Computation
                </h3>

            </div>


            {/* BODY */}

            <div className="grid grid-cols-1 gap-8 p-6 lg:grid-cols-2">

                {/* LEFT */}

                <div className="space-y-5">

                    {/* TAX MODE */}

                    <div>

                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            Tax Mode
                        </label>

                        <select
                            value={mode}
                            disabled={saving}
                            onChange={(e) =>
                                onModeChange(
                                    e.target.value
                                )
                            }
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >

                            <option value="TAXABLE">
                                Taxable
                            </option>

                            <option value="EXEMPT">
                                Exempt
                            </option>

                        </select>

                    </div>


                    {/* GROSS INCOME */}

                    <div>

                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            Taxable Gross Receipts / Earnings
                        </label>

                        <input
                            type="text"
                            inputMode="numeric"
                            value={Number(grossIncome || 0).toFixed(2)}
                            disabled={saving}
                            onChange={(e) => {
                                const digits = e.target.value.replace(/\D/g, "");

                                const numericValue =
                                    digits.length === 0
                                        ? 0
                                        : Number(digits) / 100;

                                onGrossIncomeChange(numericValue);
                            }}
                            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-lg font-semibold tracking-wide text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                </div>


                {/* RIGHT */}

                <div>

                    <div className="overflow-hidden rounded-xl border border-slate-200">

                        <table className="w-full text-sm">

                            <tbody>

                                <Row
                                    label="Basic Tax"
                                    value={
                                        computedBasicTax
                                    }
                                />

                                <Row
                                    label="Income Tax"
                                    value={
                                        computedIncomeTax
                                    }
                                />

                                <Row
                                    label="Other Tax"
                                    value={
                                        computedOtherIncome
                                    }
                                />

                                <Row
                                    label="Interest"
                                    value={
                                        computedInterest
                                    }
                                />

                                <Row
                                    label="Penalty"
                                    value={
                                        computedPenalty
                                    }
                                />

                                <tr className="border-t bg-blue-50">

                                    <td className="px-4 py-3 font-bold text-slate-800">
                                        TOTAL
                                    </td>

                                    <td className="px-4 py-3 text-right text-lg font-bold text-blue-700">

                                        ₱
                                        {formatCurrency(
                                            computedTotal
                                        )}

                                    </td>

                                </tr>

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>

        </div>
    );
}


/*
============================================================
ROW
============================================================
*/

function Row({
    label,
    value,
}: {
    label: string;
    value: number;
}) {

    return (

        <tr className="border-b border-slate-100 last:border-0">

            <td className="px-4 py-3 text-slate-600">
                {label}
            </td>

            <td className="px-4 py-3 text-right font-semibold text-slate-800">

                ₱
                {Number(value).toLocaleString(
                    "en-PH",
                    {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    }
                )}

            </td>

        </tr>
    );
}