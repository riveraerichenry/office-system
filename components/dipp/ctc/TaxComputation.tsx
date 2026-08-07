"use client";

type Props = {

    mode: string;

    grossIncome: number;

    incomeTax: number;

    otherIncome: number;

    basicTax: number;

    interest: number;

    penalty: number;

    total: number;

    saving: boolean;

    onModeChange: (
        value: string
    ) => void;

    onGrossIncomeChange: (
        value: number
    ) => void;

};

export default function TaxComputation({

    mode,

    grossIncome,

    incomeTax,

    otherIncome,

    basicTax,

    interest,

    penalty,

    total,

    saving,

    onModeChange,

    onGrossIncomeChange,

}: Props) {

    return (

        <div className="rounded-xl border bg-white shadow-sm">

            <div className="border-b bg-slate-50 px-5 py-3">

                <h3 className="font-semibold">

                    Tax Computation

                </h3>

            </div>

            <div className="grid grid-cols-2 gap-8 p-6">

                {/* =====================================
                    LEFT
                ====================================== */}

                <div className="space-y-5">

                    <div>

                        <label className="mb-1 block text-sm font-medium">

                            Tax Mode

                        </label>

                        <select

                            value={mode}

                            disabled={saving}

                            onChange={(e)=>

                                onModeChange(
                                    e.target.value
                                )

                            }

                            className="w-full rounded-lg border border-slate-300 px-3 py-2"

                        >

                            <option value="TAXABLE">

                                Taxable

                            </option>

                            <option value="EXEMPT">

                                Exempt

                            </option>

                        </select>

                    </div>

                    <div>

                        <label className="mb-1 block text-sm font-medium">

                            Taxable Gross Receipts /
                            Earnings

                        </label>

                        <input

                            type="number"

                            value={grossIncome}

                            disabled={saving}

                            onChange={(e)=>

                                onGrossIncomeChange(

                                    Number(
                                        e.target.value
                                    )

                                )

                            }

                            className="w-full rounded-lg border border-slate-300 px-3 py-2"

                        />

                    </div>

                </div>

                {/* =====================================
                    RIGHT
                ====================================== */}

                <div>

                    <div className="overflow-hidden rounded-xl border">

                        <table className="w-full text-sm">

                            <tbody>

                                <Row

                                    label="Basic Tax"

                                    value={basicTax}

                                />

                                <Row

                                    label="Income Tax"

                                    value={incomeTax}

                                />

                                <Row

                                    label="Other Tax"

                                    value={otherIncome}

                                />

                                <Row

                                    label="Interest"

                                    value={interest}

                                />

                                <Row

                                    label="Penalty"

                                    value={penalty}

                                />

                                <tr className="border-t bg-blue-50">

                                    <td className="px-4 py-3 font-bold">

                                        TOTAL

                                    </td>

                                    <td className="px-4 py-3 text-right text-lg font-bold text-blue-700">

                                        ₱

                                        {total.toLocaleString(

                                            "en-PH",

                                            {

                                                minimumFractionDigits: 2,

                                            }

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

function Row({

    label,

    value,

}: {

    label: string;

    value: number;

}) {

    return (

        <tr className="border-b last:border-0">

            <td className="px-4 py-3 text-slate-600">

                {label}

            </td>

            <td className="px-4 py-3 text-right font-semibold">

                ₱

                {Number(value).toLocaleString(

                    "en-PH",

                    {

                        minimumFractionDigits: 2,

                    }

                )}

            </td>

        </tr>

    );

}