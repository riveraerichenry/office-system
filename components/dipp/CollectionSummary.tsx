"use client";

import { CalendarDays, PhilippinePeso, Receipt } from "lucide-react";
import { useState } from "react";

type Row = {
    form_code: string;
    form_name: string;
    receipts: number;
    amount: number;
};

type Props = {
    rows: Row[];
    loading: boolean;
    month: number;
    year: number;
    totalReceipts: number;
    totalAmount: number;
    onMonthChange: (month: number) => void;
    onYearChange: (year: number) => void;
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

export default function CollectionSummary({

    rows,

    loading,

    month,

    year,

    totalReceipts,

    totalAmount,

    onMonthChange,

    onYearChange,

}: Props) {

    return (

        <div className="rounded-xl border bg-white shadow-sm">

            {/* Header */}

            <div className="border-b px-5 py-4">

                <h2 className="text-lg font-bold text-slate-800">

                    Collection Summary

                </h2>

                <p className="text-sm text-slate-500">

                    Collection per Accountable Form

                </p>

            </div>

            {/* Filters */}

            <div className="space-y-3 border-b p-4">

                <div>

                    <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">

                        Month

                    </label>

                    <select

                        value={month}

                        onChange={(e) =>
                            onMonthChange(
                                Number(e.target.value)
                            )
                        }

                        className="w-full rounded-lg border border-slate-300 px-3 py-2"

                    >

                        {

                            MONTHS.map(

                                (m, i) => (

                                    <option

                                        key={i}

                                        value={i + 1}

                                    >

                                        {m}

                                    </option>

                                )

                            )

                        }

                    </select>

                </div>

                <div>

                    <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">

                        Year

                    </label>

                    <select

                        value={year}

                        onChange={(e) =>
                            onYearChange(
                                Number(e.target.value)
                            )
                        }

                        className="w-full rounded-lg border border-slate-300 px-3 py-2"

                    >

                        {

                            Array.from(

                                {

                                    length: 10,

                                },

                                (_, i) =>

                                    new Date().getFullYear() - 5 + i

                            ).map(

                                y => (

                                    <option

                                        key={y}

                                        value={y}

                                    >

                                        {y}

                                    </option>

                                )

                            )

                        }

                    </select>

                </div>

            </div>

            {/* Body */}

            <div className="divide-y">

                {

                    loading && (

                        <div className="py-10 text-center text-slate-500">

                            Loading...

                        </div>

                    )

                }

                {

                    !loading &&

                    rows.map(

                        row => (

                            <div

                                key={row.form_code}

                                className="flex items-center justify-between p-4"

                            >

                                <div>

                                    <div className="flex items-center gap-2">

                                        <Receipt

                                            size={16}

                                            className="text-blue-600"

                                        />

                                        <p className="font-semibold">

                                            {row.form_code}

                                        </p>

                                    </div>

                                    <p className="mt-1 text-xs text-slate-500">

                                        {

                                            row.receipts.toLocaleString()

                                        } Receipts

                                    </p>

                                </div>

                                <div className="text-right">

                                    <p className="text-lg font-bold text-green-700">

                                        {

                                            Number(

                                                row.amount

                                            ).toLocaleString(

                                                "en-PH",

                                                {

                                                    style:

                                                        "currency",

                                                    currency:

                                                        "PHP",

                                                }

                                            )

                                        }

                                    </p>

                                </div>

                            </div>

                        )

                    )

                }

            </div>

            {/* Footer */}

            <div className="space-y-3 border-t bg-slate-50 p-4">

                <div className="flex items-center justify-between">

                    <div className="flex items-center gap-2">

                        <CalendarDays

                            size={16}

                            className="text-slate-500"

                        />

                        <span className="text-sm text-slate-600">

                            Total Receipts

                        </span>

                    </div>

                    <span className="font-bold">

                        {

                            totalReceipts.toLocaleString()

                        }

                    </span>

                </div>

                <div className="flex items-center justify-between">

                    <div className="flex items-center gap-2">

                        <PhilippinePeso

                            size={16}

                            className="text-green-600"

                        />

                        <span className="font-semibold">

                            Grand Total

                        </span>

                    </div>

                    <span className="text-xl font-black text-green-700">

                        {

                            totalAmount.toLocaleString(

                                "en-PH",

                                {

                                    style:

                                        "currency",

                                    currency:

                                        "PHP",

                                }

                            )

                        }

                    </span>

                </div>

            </div>

        </div>

    );

}