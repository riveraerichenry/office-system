"use client";

import { X, Search, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

type Transaction = {
    id: string;
    or_number: string;
    receipt_date: string;
    payor: string;
    form_code: string;
    grand_total: number;
};

type Props = {

    open: boolean;

    month: number;

    year: number;

    formCode?: string | null;

    onClose: () => void;

    onSelectTransaction: (

        id: string

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

export default function MonthlyTransactionsModal({

    open,

    month,

    year,

    formCode,

    onClose,

    onSelectTransaction,

}: Props) {

    const [loading, setLoading] =
        useState(false);

    const [search, setSearch] =
        useState("");

    const [rows, setRows] =
        useState<Transaction[]>([]);

    async function loadTransactions() {

            try {

                setLoading(true);

                const res =
                    await axios.get(

                        "/api/dipp/month-transactions",

                        {

                            params: {

                                month,

                                year,

                                search,

                            },

                        }

                    );

                setRows(

                    res.data.rows ?? []

                );

            }

            catch (err) {

                console.error(err);

            }

            finally {

                setLoading(false);

            }

        }

        useEffect(() => {

            if (!open)
                return;

            loadTransactions();

        }, [

            open,

            month,

            year,

            search,

        ]);

    if (!open) return null;

    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">

            <div className="flex h-[85vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

                {/* ======================================================
                    Header
                ====================================================== */}

                <div className="flex items-center justify-between border-b px-6 py-4">

                    <div>

                        <h2 className="text-xl font-bold text-slate-800">

                            Collection Details

                        </h2>

                        <p className="text-sm text-slate-500">

                            {

                                MONTHS[month - 1]

                            }

                            {" "}

                            {year}

                            {

                                formCode && (

                                    <>

                                        {" • "}

                                        <span className="font-semibold text-blue-700">

                                            {formCode}

                                        </span>

                                    </>

                                )

                            }

                        </p>

                    </div>

                    <button

                        onClick={onClose}

                        className="rounded-lg p-2 transition hover:bg-slate-100"

                    >

                        <X size={22} />

                    </button>

                </div>

                {/* ======================================================
                    Toolbar
                ====================================================== */}

                <div className="flex items-center justify-between border-b bg-slate-50 px-6 py-3">

                    <div className="relative w-96">

                        <Search

                            size={16}

                            className="absolute left-3 top-3 text-slate-400"

                        />

                        <input

                            value={search}

                            onChange={(e) =>

                                setSearch(

                                    e.target.value

                                )

                            }

                            placeholder="Search OR Number or Payor..."

                            className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm"

                        />

                    </div>

                    <button

                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"

                    >

                        <Printer size={16} />

                        Print

                    </button>

                </div>

                {/* ======================================================
                    Table
                ====================================================== */}

                <div className="flex-1 overflow-auto">

                    <table className="w-full">

                        <thead className="sticky top-0 bg-slate-100">

                            <tr>

                                <th className="px-4 py-3 text-left text-xs font-bold uppercase">

                                    OR No.

                                </th>

                                <th className="px-4 py-3 text-left text-xs font-bold uppercase">

                                    Date

                                </th>

                                <th className="px-4 py-3 text-left text-xs font-bold uppercase">

                                    Payor

                                </th>

                                <th className="px-4 py-3 text-center text-xs font-bold uppercase">

                                    Form

                                </th>

                                <th className="px-4 py-3 text-right text-xs font-bold uppercase">

                                    Amount

                                </th>

                            </tr>

                        </thead>

                        <tbody>

                                                {

                            loading && (

                                <tr>

                                    <td

                                        colSpan={5}

                                        className="py-16 text-center text-slate-500"

                                    >

                                        Loading transactions...

                                    </td>

                                </tr>

                            )

                        }

                        {

                            !loading &&

                            rows.length === 0 && (

                                <tr>

                                    <td

                                        colSpan={5}

                                        className="py-16 text-center text-slate-500"

                                    >

                                        No transactions found.

                                    </td>

                                </tr>

                            )

                        }

                        {

                            !loading &&

                            rows.map(

                                (row) => (

                                    <tr

                                        key={row.id}

                                        onClick={() =>

                                            onSelectTransaction(

                                                row.id

                                            )

                                        }

                                        className="cursor-pointer border-b transition hover:bg-blue-50"

                                    >

                                        <td className="px-4 py-3 font-semibold">

                                            {row.or_number}

                                        </td>

                                        <td className="px-4 py-3">

                                            {

                                                new Date(

                                                    row.receipt_date

                                                ).toLocaleDateString(

                                                    "en-PH",

                                                    {

                                                        year: "numeric",

                                                        month: "short",

                                                        day: "numeric",

                                                    }

                                                )

                                            }

                                        </td>

                                        <td className="px-4 py-3">

                                            {row.payor}

                                        </td>

                                        <td className="px-4 py-3 text-center">

                                            <span className="rounded-md bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">

                                                {row.form_code}

                                            </span>

                                        </td>

                                        <td className="px-4 py-3 text-right font-semibold text-green-700">

                                            {

                                                Number(

                                                    row.grand_total

                                                ).toLocaleString(

                                                    "en-PH",

                                                    {

                                                        style: "currency",

                                                        currency: "PHP",

                                                    }

                                                )

                                            }

                                        </td>

                                    </tr>

                                )

                            )

                        }

                    </tbody>

                </table>

            </div>

            {/* ======================================================
                Footer
            ====================================================== */}

            <div className="flex items-center justify-between border-t bg-slate-50 px-6 py-4">

                <div>

                    <p className="text-sm text-slate-500">

                        Total Receipts

                    </p>

                    <p className="text-lg font-bold">

                        {

                            rows.length.toLocaleString()

                        }

                    </p>

                </div>

                <div className="text-right">

                    <p className="text-sm text-slate-500">

                        Grand Total

                    </p>

                    <p className="text-2xl font-black text-green-700">

                        {

                            rows

                                .reduce(

                                    (

                                        total,

                                        row

                                    ) =>

                                        total +

                                        Number(

                                            row.grand_total

                                        ),

                                    0

                                )

                                .toLocaleString(

                                    "en-PH",

                                    {

                                        style: "currency",

                                        currency: "PHP",

                                    }

                                )

                        }

                    </p>

                </div>

            </div>

        </div>

    </div>

);

}