"use client";

import {
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

type Row = {
    id: string;
    or_number: string;
    payor: string;
    form_code: string;
    receipt_date: string;
    grand_total: number;
};

type Props = {

    rows: Row[];

    loading: boolean;

    page: number;

    totalPages: number;

    totalRecords: number;

    onPageChange: (page:number)=>void;

    onSelectTransaction:(

        id:string

    )=>void;

};

export default function DailyCollections({

    rows,

    loading,

    page,

    totalPages,

    totalRecords,

    onPageChange,

    onSelectTransaction,

}:Props) {

    return (

        <div className="rounded-xl border bg-white shadow-sm">

            {/* Header */}

            <div className="border-b px-5 py-4">

                <div className="flex items-center justify-between">

                    <div>

                        <h2 className="text-lg font-bold text-slate-800">

                            Collection History

                        </h2>

                        <p className="text-sm text-slate-500">

                            Latest receipts issued

                        </p>

                    </div>

                    <div className="text-right">

                        <p className="text-xs uppercase text-slate-500">

                            Total Records

                        </p>

                        <p className="text-xl font-bold">

                            {totalRecords}

                        </p>

                    </div>

                </div>

            </div>

            {/* Table */}

            <div className="overflow-hidden">

                <table className="w-full">

                    <thead className="bg-slate-100">

                        <tr>

                            <th className="px-3 py-3 text-left text-xs font-semibold uppercase">

                                OR No.

                            </th>

                            <th className="px-3 py-3 text-left text-xs font-semibold uppercase">

                                Payor

                            </th>

                            <th className="px-3 py-3 text-center text-xs font-semibold uppercase">

                                Form

                            </th>

                            <th className="px-3 py-3 text-right text-xs font-semibold uppercase">

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

                                        className="py-12 text-center text-slate-500"

                                    >

                                        Loading collections...

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

                                        className="py-12 text-center text-slate-500"

                                    >

                                        No collections found.

                                    </td>

                                </tr>

                            )

                        }

                        {

                            !loading &&

                            rows.map((row) => (

                                <tr

                                    key={row.id}

                                    onClick={() =>

                                        onSelectTransaction(

                                            row.id

                                        )

                                    }

                                    className="cursor-pointer border-t transition hover:bg-blue-50"

                                >

                                    <td className="px-3 py-3 font-semibold">

                                        {row.or_number}

                                    </td>

                                    <td className="max-w-[220px] truncate px-3 py-3">

                                        {row.payor}

                                    </td>

                                    <td className="px-3 py-3 text-center">

                                        <span className="rounded bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">

                                            {row.form_code}

                                        </span>

                                    </td>

                                                                        {/* <td className="px-3 py-3 text-center text-sm">

                                        {

                                            new Date(

                                                row.receipt_date

                                            ).toLocaleDateString(

                                                "en-PH",

                                                {

                                                    month: "short",

                                                    day: "numeric",

                                                    year: "2-digit",

                                                }

                                            )

                                        }

                                    </td> */}

                                    <td className="px-3 py-3 text-right font-semibold text-green-700">

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

                            ))

                        }

                    </tbody>

                </table>

            </div>

            {/* Pagination */}

            <div className="flex items-center justify-between border-t bg-slate-50 px-4 py-3">

                <button

                    disabled={

                        page <= 1

                    }

                    onClick={() =>

                        onPageChange(

                            page - 1

                        )

                    }

                    className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"

                >

                    <ChevronLeft

                        size={16}

                    />

                    Previous

                </button>

                <div className="text-sm text-slate-600">

                    Page

                    <span className="mx-1 font-bold">

                        {page}

                    </span>

                    of

                    <span className="mx-1 font-bold">

                        {totalPages}

                    </span>

                </div>

                <button

                    disabled={

                        page >= totalPages

                    }

                    onClick={() =>

                        onPageChange(

                            page + 1

                        )

                    }

                    className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"

                >

                    Next

                    <ChevronRight

                        size={16}

                    />

                </button>

            </div>

        </div>

    );

}