"use client";

type Props = {

    forms: string[];

    rows: any[];

    years: number[];

    loading: boolean;

    fiscalYear: number;

    onFiscalYearChange: (year: number) => void;

    onRefresh: () => void;

    onMonthClick: (

        month: number

    ) => void;

};

const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

export default function FiscalYearSummary({

    forms,

    rows,

    years,

    loading,

    fiscalYear,

    onFiscalYearChange,

    onRefresh,

    onMonthClick,

}: Props) {


    console.log("Forms:", forms);
    console.log("Rows:", rows);

    return (

        <div className="rounded-xl border bg-white shadow-sm">

            {/* ======================================================
                Header
            ====================================================== */}

            <div className="flex items-center justify-between border-b px-4 py-3">

                <div>

                    <h2 className="text-lg font-bold text-slate-800">

                        Fiscal Year Summary

                    </h2>

                    <p className="text-xs text-slate-500">

                        Collection per Accountable Form

                    </p>

                </div>

                <div className="flex items-center gap-2">

                    <select

                        value={fiscalYear}

                        onChange={(e) =>

                            onFiscalYearChange(

                                Number(e.target.value)

                            )

                        }

                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"

                    >

                        {

                            years.map(

                                year => (

                                    <option

                                        key={year}

                                        value={year}

                                    >

                                        {year}

                                    </option>

                                )

                            )

                        }

                    </select>

                    <button

                        onClick={onRefresh}

                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"

                    >

                        Refresh

                    </button>

                </div>

            </div>

            {/* ======================================================
                Table
            ====================================================== */}

            <div className="overflow-auto">

                <table className="w-full border-collapse">

                    <thead className="sticky top-0 bg-slate-100">

                        <tr>

                            <th className="sticky left-0 z-10 border-b bg-slate-100 px-3 py-2 text-left text-xs font-bold uppercase">

                                Fiscal Month

                            </th>

                            {

                                forms.map(

                                    (form) => (

                                        <th

                                            key={form}

                                            className="border-b px-3 py-2 text-right text-xs font-bold uppercase whitespace-nowrap"

                                        >

                                            {form}

                                        </th>

                                    )

                                )

                            }

                            <th className="border-b px-3 py-2 text-right text-xs font-bold uppercase">

                                Total

                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {

                            loading && (

                                <tr>

                                    <td

                                        colSpan={

                                            forms.length + 2

                                        }

                                        className="py-10 text-center text-slate-500"

                                    >

                                        Loading summary...

                                    </td>

                                </tr>

                            )

                        }

                        {

                            !loading &&

                            MONTHS.map(

                            (

                                month,

                                index

                            ) => {

                                const row =
                                    rows.find(

                                        r =>

                                            r.month === month

                                    ) || {};

                                let rowTotal = 0;

                                return (

                                    <tr

                                        key={month}

                                        onClick={() =>

                                            onMonthClick(

                                                index + 1

                                            )

                                        }

                                        className="cursor-pointer transition hover:bg-blue-50"

                                    >

                                            <td className="sticky left-0 border-b bg-white px-3 py-2 text-xs font-semibold">

                                                {month}

                                            </td>

                                            {

                                                forms.map(

                                                    (form) => {

                                                        const amount =

                                                            Number(

                                                                row[form] ?? 0

                                                            );

                                                        rowTotal += amount;

                                                        return (

                                                            <td

                                                                key={form}

                                                                className="border-b px-3 py-2 text-right text-xs tabular-nums"

                                                            >

                                                                {

                                                                    amount.toLocaleString(

                                                                        "en-PH",

                                                                        {

                                                                            minimumFractionDigits: 2,

                                                                            maximumFractionDigits: 2,

                                                                        }

                                                                    )

                                                                }

                                                            </td>

                                                        );

                                                    }

                                                )

                                            }

                                            <td className="border-b bg-slate-50 px-3 py-2 text-right text-xs font-bold">

                                                {

                                                    rowTotal.toLocaleString(

                                                        "en-PH",

                                                        {

                                                            minimumFractionDigits: 2,

                                                            maximumFractionDigits: 2,

                                                        }

                                                    )

                                                }

                                            </td>

                                        </tr>

                                    );

                                }

                            )

                        }

                    </tbody>

                    {/* ======================================================
                        Grand Total
                    ====================================================== */}

                    <tfoot className="bg-slate-100">

                        <tr>

                            <td className="sticky left-0 border-t bg-slate-100 px-3 py-2 text-xs font-bold uppercase">

                                Total

                            </td>

                            {

                                forms.map(

                                    (form) => {

                                        const total =

                                            rows.reduce(

                                                (

                                                    sum,

                                                    row

                                                ) =>

                                                    sum +

                                                    Number(

                                                        row[form] ?? 0

                                                    ),

                                                0

                                            );

                                        return (

                                            <td

                                                key={form}

                                                className="border-t px-3 py-2 text-right text-xs font-bold"

                                            >

                                                {

                                                    total.toLocaleString(

                                                        "en-PH",

                                                        {

                                                            minimumFractionDigits: 2,

                                                            maximumFractionDigits: 2,

                                                        }

                                                    )

                                                }

                                            </td>

                                        );

                                    }

                                )

                            }

                            <td className="border-t bg-blue-50 px-3 py-2 text-right text-sm font-extrabold text-blue-700">

                                {

                                    rows.reduce(

                                        (

                                            grand,

                                            row

                                        ) =>

                                            grand +

                                            forms.reduce(

                                                (

                                                    subtotal,

                                                    form

                                                ) =>

                                                    subtotal +

                                                    Number(

                                                        row[form] ?? 0

                                                    ),

                                                0

                                            ),

                                        0

                                    ).toLocaleString(

                                        "en-PH",

                                        {

                                            minimumFractionDigits: 2,

                                            maximumFractionDigits: 2,

                                        }

                                    )

                                }

                            </td>

                        </tr>

                    </tfoot>

                </table>

            </div>

        </div>

    );

}