"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Loader2, CheckCircle2 } from "lucide-react";

type AssignedReceipt = {
    lor_item_id: string;
    booklet_id: string;

    form_code: string;
    form_name: string;

    control_no: string;
    series: string;

    beginning_or: number;
    current_or: number;
    ending_or: number;

    remaining: number;

    fund_name: string;
};

export default function AssignedReceiptCard() {

    const [loading, setLoading] = useState(true);

    const [receipts, setReceipts] = useState<AssignedReceipt[]>([]);

    const [active, setActive] = useState<string | null>(null);

    useEffect(() => {

        loadAssigned();

    }, []);

    async function loadAssigned() {

        try {

            const res =
                await axios.get("/api/dipp/booklets");

            setReceipts(res.data.data);

            if (res.data.data.length > 0) {

                setActive(
                    res.data.data[0].lor_item_id
                );

            }

        } finally {

            setLoading(false);

        }

    }

    const current =
        receipts.find(
            r => r.lor_item_id === active
        );

    return (

        <div
            className="
            fixed
            top-24
            right-6
            w-80
            "
        >

            <div className="rounded-xl border bg-white shadow-lg">

                <div className="border-b px-5 py-4">

                    <h2 className="font-semibold text-slate-800">

                        Assigned Receipt

                    </h2>

                    <p className="text-xs text-slate-500">

                        Currently assigned accountable form

                    </p>

                </div>

                {loading && (

                    <div className="flex items-center justify-center p-10">

                        <Loader2 className="h-5 w-5 animate-spin" />

                    </div>

                )}

                {!loading && current && (

                    <div className="space-y-4 p-5">

                        <div>

                            <div className="text-xs text-slate-500">

                                Form

                            </div>

                            <div className="font-semibold">

                                {current.form_code}

                            </div>

                            <div className="text-sm text-slate-500">

                                {current.form_name}

                            </div>

                        </div>

                        <div>

                            <div className="text-xs text-slate-500">

                                Control No.

                            </div>

                            <div className="font-medium">

                                {current.control_no}

                            </div>

                        </div>

                        <div className="grid grid-cols-2 gap-3">

                            <div>

                                <div className="text-xs text-slate-500">

                                    OR Range

                                </div>

                                <div className="font-medium">

                                    {current.beginning_or}

                                    {" - "}

                                    {current.ending_or}

                                </div>

                            </div>

                            <div>

                                <div className="text-xs text-slate-500">

                                    Next OR

                                </div>

                                <div className="font-semibold text-blue-600">

                                    {current.current_or + 1}

                                </div>

                            </div>

                        </div>

                        <div>

                            <div className="text-xs text-slate-500">

                                Remaining

                            </div>

                            <div className="font-medium">

                                {current.remaining}

                            </div>

                        </div>

                        <div>

                            <div className="text-xs text-slate-500">

                                Fund Source

                            </div>

                            <div>

                                {current.fund_name}

                            </div>

                        </div>

                        <div className="flex items-center justify-between rounded-lg bg-green-50 px-4 py-3">

                            <div className="flex items-center gap-2">

                                <CheckCircle2
                                    className="text-green-600"
                                    size={18}
                                />

                                <span className="font-medium text-green-700">

                                    IN USE

                                </span>

                            </div>

                        </div>

                    </div>

                )}

            </div>

        </div>

    );

}