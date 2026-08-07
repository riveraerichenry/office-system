"use client";

import { CalendarDays } from "lucide-react";

type Props = {

    booklet: any;

    issueDate: string;

    placeIssued: string;

    saving: boolean;

    onIssueDateChange: (
        value: string
    ) => void;

    onPlaceIssuedChange: (
        value: string
    ) => void;

};

export default function CertificateInformation({

    booklet,

    issueDate,

    placeIssued,

    saving,

    onIssueDateChange,

    onPlaceIssuedChange,

}: Props) {

    const fiscalYear =
        new Date(issueDate)
            .getFullYear();

    const ctcType =

        booklet?.form_code ===
        "CTC-CORPORATION"

            ?

            "CORPORATION"

            :

            "INDIVIDUAL";

    return (

        <div className="rounded-xl border bg-white shadow-sm">

            <div className="border-b bg-slate-50 px-5 py-3">

                <h3 className="font-semibold">

                    Certificate Information

                </h3>

            </div>

            <div className="grid grid-cols-2 gap-8 p-6">

                {/* =======================================
                    Left
                ======================================= */}

                <div className="space-y-5">

                    {/* Fiscal Year */}

                    <div>

                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">

                            Fiscal Year

                        </p>

                        <p className="mt-1 text-2xl font-bold text-blue-700">

                            {fiscalYear}

                        </p>

                    </div>

                    {/* Date Issued */}

                    <div>

                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">

                            Date Issued

                        </p>

                        <div className="mt-1 flex items-center gap-3">

                            <p className="text-lg font-semibold text-slate-800">

                                {

                                    new Date(issueDate)

                                        .toLocaleDateString(

                                            "en-PH",

                                            {

                                                weekday: "long",

                                                year: "numeric",

                                                month: "long",

                                                day: "numeric",

                                            }

                                        )

                                }

                            </p>

                            <div className="relative">

                                <input

                                    type="date"

                                    value={issueDate}

                                    disabled={saving}

                                    onChange={(e) =>

                                        onIssueDateChange(

                                            e.target.value

                                        )

                                    }

                                    className="absolute inset-0 cursor-pointer opacity-0"

                                />

                                <button

                                    type="button"

                                    disabled={saving}

                                    className="rounded-lg border border-slate-300 bg-white p-2 hover:bg-slate-100 disabled:opacity-50"

                                >

                                    <CalendarDays

                                        size={18}

                                    />

                                </button>

                            </div>

                        </div>

                    </div>

                </div>

                {/* =======================================
                    Right
                ======================================= */}

                <div className="space-y-5">

                    {/* CTC Type */}

                    <div>

                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">

                            CTC Type

                        </p>

                        <p className="mt-1 rounded-lg bg-blue-600 px-4 py-2 text-center text-lg font-bold tracking-wide text-white">

                            {ctcType}

                        </p>

                    </div>

                    {/* Place Issued */}

                    <div>

                        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">

                            Place Issued

                        </label>

                        <input

                            value={placeIssued}

                            disabled={saving}

                            onChange={(e) =>

                                onPlaceIssuedChange(

                                    e.target.value

                                )

                            }

                            className="w-full rounded-lg border border-slate-300 px-3 py-2 font-semibold uppercase"

                        />

                    </div>

                </div>

            </div>

        </div>

    );

}