import { CalendarDays } from "lucide-react";

type Props = {

    booklet: any;

    receiptDate: string;

    saving: boolean;

    onReceiptDateChange: (
        value: string
    ) => void;

};

export default function BookletInformation({

    booklet,

    receiptDate,

    saving,

    onReceiptDateChange,

}: Props) {

    return (

        <div className="rounded-xl border">

            <div className="border-b bg-slate-50 px-4 py-3">

                <h3 className="font-semibold">

                    Booklet Information

                </h3>

            </div>

            <div className="grid grid-cols-3 items-center gap-8 p-5">

                <div>

                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">

                        Fund Source

                    </p>

                    <p className="mt-1 text-lg font-semibold text-slate-800">

                        {booklet.fund_name}

                    </p>

                </div>

                <div>

                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">

                        Collector

                    </p>

                    <p className="mt-1 text-lg font-semibold text-slate-800">

                        {booklet.accountable_officer}

                    </p>

                </div>

                <div className="flex items-center justify-end gap-3">

                    <p className="text-lg font-semibold text-slate-800">

                        {

                            new Date(receiptDate)

                                .toLocaleDateString(

                                    "en-PH",

                                    {

                                        year: "numeric",

                                        month: "long",

                                        day: "numeric",

                                        weekday: "long",

                                    }

                                )

                        }

                    </p>

                    <div className="relative">

                        <input

                            type="date"

                            value={receiptDate}

                            disabled={saving}

                            onChange={(e) =>

                                onReceiptDateChange(

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

                            <CalendarDays size={18} />

                        </button>

                    </div>

                </div>

            </div>

        </div>

    );

}