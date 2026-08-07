"use client";

import { useEffect, useState } from "react";
import axios from "axios";

type Props = {
    selectedBooklet: any;
};

export default function DailyIssuanceTable({
    selectedBooklet,
}: Props) {

    const [rows, setRows] =
        useState<any[]>([]);

    const [loading, setLoading] =
        useState(false);

    const [search, setSearch] =
        useState("");

    useEffect(() => {

        if (!selectedBooklet)
            return;

        loadTransactions();

    }, [

        selectedBooklet,

        search,

    ]);

    async function loadTransactions() {

        try {

            setLoading(true);

            const res =
                await axios.get(

                    "/api/dipp/transactions",

                    {

                        params: {

                            booklet_registration_id:

                                selectedBooklet.booklet_registration_id,

                            search,

                        },

                    }

                );

            setRows(

                res.data.data ?? []

            );

        }

        catch (err) {

            console.error(err);

        }

        finally {

            setLoading(false);

        }

    }

    return (

        <div className="rounded-xl border bg-white shadow-sm">

            {/* Header */}

            <div className="flex items-center justify-between border-b px-5 py-4">

                <div>

                    <h2 className="text-lg font-bold text-slate-800">

                        Daily Issuance

                    </h2>

                    <p className="text-sm text-slate-500">

                        Official Receipts issued from this booklet

                    </p>

                </div>

                <input

                    value={search}

                    onChange={(e)=>

                        setSearch(

                            e.target.value

                        )

                    }

                    placeholder="Search OR / Payor..."

                    className="w-72 rounded-lg border border-slate-300 px-3 py-2"

                />

            </div>

            {/* Table */}

            <div className="overflow-auto">

                <table className="w-full">

                    <thead className="bg-slate-100">

                        <tr>

                            <th className="px-4 py-3 text-left">

                                OR No.

                            </th>

                            <th className="px-4 py-3 text-left">

                                Date

                            </th>

                            <th className="px-4 py-3 text-left">

                                Payor

                            </th>

                            <th className="px-4 py-3 text-left">

                                Mode

                            </th>

                            <th className="px-4 py-3 text-right">

                                Amount

                            </th>

                            <th className="px-4 py-3 text-center">

                                Status

                            </th>

                            <th className="px-4 py-3">

                                Encoded By

                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {

                            loading && (

                                <tr>

                                    <td

                                        colSpan={7}

                                        className="py-10 text-center text-slate-500"

                                    >

                                        Loading...

                                    </td>

                                </tr>

                            )

                        }

                        {

                            !loading &&

                            rows.length === 0 && (

                                <tr>

                                    <td

                                        colSpan={7}

                                        className="py-10 text-center text-slate-500"

                                    >

                                        No transactions found.

                                    </td>

                                </tr>

                            )

                        }

                        {

                            rows.map(

                                (row) => (

                                    <tr

                                        key={row.id}

                                        className="cursor-pointer border-t hover:bg-slate-50"

                                    >

                                        <td className="px-4 py-3 font-semibold">

                                            {row.or_number}

                                        </td>

                                        <td className="px-4 py-3">

                                            {

                                                new Date(

                                                    row.receipt_date

                                                )

                                                .toLocaleDateString(

                                                    "en-PH"

                                                )

                                            }

                                        </td>

                                        <td className="px-4 py-3">

                                            {row.payor}

                                        </td>

                                        <td className="px-4 py-3">

                                            {row.payment_mode}

                                        </td>

                                        <td className="px-4 py-3 text-right font-semibold">

                                            {

                                                Number(

                                                    row.grand_total

                                                )

                                                .toLocaleString(

                                                    "en-PH",

                                                    {

                                                        style:

                                                            "currency",

                                                        currency:

                                                            "PHP",

                                                    }

                                                )

                                            }

                                        </td>

                                        <td className="px-4 py-3 text-center">

                                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">

                                                {row.status}

                                            </span>

                                        </td>

                                        <td className="px-4 py-3">

                                            {row.encoded_by}

                                        </td>

                                    </tr>

                                )

                            )

                        }

                    </tbody>

                </table>

            </div>

        </div>

    );

}