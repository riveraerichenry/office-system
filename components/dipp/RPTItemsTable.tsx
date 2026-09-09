"use client";

type Item = {
    id?: string;

    transaction_id?: string;

    billing_id?: string | null;

    tax_declaration_id?: string | null;

    td_number?: string | null;

    coverage?: string | null;

    declared_owner?: string | null;

    property_location?: string | null;

    assessed_value?: number | string | null;

    start_quarter?: number | null;

    start_year?: number | null;

    end_quarter?: number | null;

    end_year?: number | null;

    basic?: number | string | null;

    sef?: number | string | null;

    penalty?: number | string | null;

    discount?: number | string | null;

    amount?: number | string | null;

    tax_due?: number | string | null;

    billing_number?: string | null;

    billing_item_id?: string | null;

    account_id?: string | null;

    [key: string]: any;
};


type Props = {

    items: Item[];

    grandTotal: number;

};


const money = (

    value:
        | number
        | string
        | null
        | undefined

) =>

    Number(

        value ?? 0

    ).toLocaleString(

        "en-PH",

        {

            minimumFractionDigits:
                2,

            maximumFractionDigits:
                2,

        }

    );


function getCoverage(

    item: Item

) {

    if (

        item.coverage

    ) {

        return item.coverage;

    }


    if (

        !item.start_quarter ||

        !item.start_year

    ) {

        return "-";

    }


    const quarterLabel = (

        quarter: number

    ) => {

        const labels: Record<
            number,
            string
        > = {

            1:
                "1st Quarter",

            2:
                "2nd Quarter",

            3:
                "3rd Quarter",

            4:
                "4th Quarter",

        };


        return (

            labels[
                quarter
            ] ||

            `Quarter ${quarter}`

        );

    };


    const start =

        `${quarterLabel(
            item.start_quarter
        )} ${item.start_year}`;


    if (

        !item.end_quarter ||

        !item.end_year

    ) {

        return start;

    }


    const end =

        `${quarterLabel(
            item.end_quarter
        )} ${item.end_year}`;


    if (

        item.start_quarter ===
        item.end_quarter

        &&

        item.start_year ===
        item.end_year

    ) {

        return start;

    }


    return (

        `${start} - ${end}`

    );

}


export default function RPTItemsTable({

    items,

    grandTotal,

}: Props) {

    return (

        <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

            {/* =====================================================
                HEADER
            ===================================================== */}

            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3">

                <div>

                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">

                        RPT Collection Items

                    </h3>


                    <p className="mt-0.5 text-xs text-slate-500">

                        Real Property Tax collection breakdown

                    </p>

                </div>


                <div className="rounded-md bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">

                    {items.length} Item

                    {items.length !== 1 &&
                        "s"}

                </div>

            </div>


            {/* =====================================================
                TABLE
            ===================================================== */}

            <div className="overflow-x-auto">

                <table className="min-w-full text-sm">

                    <thead className="bg-slate-100">

                        <tr>

                            <th className="border-b px-3 py-2 text-left text-[11px] font-semibold uppercase text-slate-600">

                                TD Number

                            </th>


                            <th className="border-b px-3 py-2 text-left text-[11px] font-semibold uppercase text-slate-600">

                                Coverage

                            </th>


                            <th className="border-b px-3 py-2 text-right text-[11px] font-semibold uppercase text-slate-600">

                                Assessed Value

                            </th>


                            <th className="border-b px-3 py-2 text-right text-[11px] font-semibold uppercase text-slate-600">

                                Basic

                            </th>


                            <th className="border-b px-3 py-2 text-right text-[11px] font-semibold uppercase text-slate-600">

                                SEF

                            </th>


                            <th className="border-b px-3 py-2 text-right text-[11px] font-semibold uppercase text-slate-600">

                                Penalty

                            </th>


                            <th className="border-b px-3 py-2 text-right text-[11px] font-semibold uppercase text-slate-600">

                                Discount

                            </th>


                            <th className="border-b px-3 py-2 text-right text-[11px] font-semibold uppercase text-slate-600">

                                Total

                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {

                            items.length > 0

                                ? items.map(

                                    (

                                        item,

                                        index

                                    ) => {

                                        const previousItem =

                                            items[
                                                index - 1
                                            ];


                                        const showTD =

                                            index === 0 ||

                                            previousItem
                                                ?.td_number !==

                                            item.td_number;


                                        return (

                                            <tr

                                                key={
                                                    item.id ??
                                                    index
                                                }

                                                className="border-b last:border-0 transition hover:bg-slate-50"

                                            >

                                                {/* TD NUMBER */}

                                                <td className="px-3 py-2 font-semibold text-slate-800">

                                                    {

                                                        showTD

                                                            ? (

                                                                item.td_number ||

                                                                "-"

                                                            )

                                                            : ""

                                                    }

                                                </td>


                                                {/* COVERAGE */}

                                                <td className="px-3 py-2 text-slate-700">

                                                    {

                                                        getCoverage(
                                                            item
                                                        )

                                                    }

                                                </td>


                                                {/* ASSESSED VALUE */}

                                                <td className="px-3 py-2 text-right text-slate-700">

                                                    {

                                                        money(
                                                            item.assessed_value
                                                        )

                                                    }

                                                </td>


                                                {/* BASIC */}

                                                <td className="px-3 py-2 text-right text-slate-700">

                                                    {

                                                        money(
                                                            item.basic
                                                        )

                                                    }

                                                </td>


                                                {/* SEF */}

                                                <td className="px-3 py-2 text-right text-slate-700">

                                                    {

                                                        money(
                                                            item.sef
                                                        )

                                                    }

                                                </td>


                                                {/* PENALTY */}

                                                <td className="px-3 py-2 text-right">

                                                    <span className="text-red-600">

                                                        {

                                                            money(
                                                                item.penalty
                                                            )

                                                        }

                                                    </span>

                                                </td>


                                                {/* DISCOUNT */}

                                                <td className="px-3 py-2 text-right">

                                                    <span className="text-blue-700">

                                                        {

                                                            money(
                                                                item.discount
                                                            )

                                                        }

                                                    </span>

                                                </td>


                                                {/* TOTAL */}

                                                <td className="px-3 py-2 text-right">

                                                    <span className="font-semibold text-emerald-700">

                                                        {

                                                            money(
                                                                item.amount
                                                            )

                                                        }

                                                    </span>

                                                </td>

                                            </tr>

                                        );

                                    }

                                )

                                : (

                                    <tr>

                                        <td

                                            colSpan={
                                                8
                                            }

                                            className="py-12 text-center text-sm text-slate-500"

                                        >

                                            No RPT items found.

                                        </td>

                                    </tr>

                                )

                        }

                    </tbody>


                    {/* =====================================================
                        GRAND TOTAL
                    ===================================================== */}

                    {

                        items.length > 0 && (

                            <tfoot className="border-t bg-slate-100">

                                <tr>

                                    <td

                                        colSpan={
                                            7
                                        }

                                        className="px-3 py-3 text-right text-sm font-semibold uppercase tracking-wide text-slate-700"

                                    >

                                        Grand Total

                                    </td>


                                    <td className="px-3 py-3 text-right text-lg font-bold text-emerald-700">

                                        ₱

                                        {

                                            money(
                                                grandTotal
                                            )

                                        }

                                    </td>

                                </tr>

                            </tfoot>

                        )

                    }

                </table>

            </div>

        </div>

    );

}