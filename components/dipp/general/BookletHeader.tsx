import { Receipt, X } from "lucide-react";

type Props = {
    booklet: any;
    onClose?: () => void;
    saving?: boolean;
};

export default function BookletHeader({
    booklet,
    onClose,
    saving = false,
}: Props) {

    return (

        <div className="border-b bg-white">

            {/* Header */}

            <div className="flex items-center justify-between px-6 py-4">

                <div className="flex-1">

                    {/* First Row */}

                    <div className="flex items-center">

                        <Receipt
                            size={22}
                            className="mr-3 text-blue-600"
                        />

                        <h2 className="text-2xl font-bold text-slate-800">

                            Collection Receipt

                        </h2>

                        <span className="mx-3 text-slate-300">

                            |

                        </span>

                        <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold">

                            {booklet.form_code}

                        </span>

                        <span className="mx-2 text-slate-300">

                            •

                        </span>

                        <span className="text-sm font-medium text-slate-700">

                            {booklet.control_no}

                        </span>

                        <span className="mx-2 text-slate-300">

                            •

                        </span>

                        <span className="text-sm font-medium text-slate-700">

                            {booklet.series}

                        </span>

                        <span className="mx-2 text-slate-300">

                            •

                        </span>

                        <span className="text-sm font-medium uppercase text-slate-700">

                            {booklet.fund_name}

                        </span>

                        <span className="mx-2 text-slate-300">

                            •

                        </span>

                        <span className="text-sm font-medium text-slate-700">

                            {booklet.accountable_officer}

                        </span>

                    </div>

                    {/* Second Row */}

                    <div className="mt-2 flex items-center gap-3">

                        <span className="w-12 text-xs font-semibold text-slate-500">

                            {booklet.beginning_or}

                        </span>

                        <div className="flex-1">

                            <div className="h-2 overflow-hidden rounded-full bg-slate-200">

                                <div

                                    className="h-full rounded-full bg-blue-600 transition-all duration-500"

                                    style={{

                                        width: `${booklet.consumed_percent}%`

                                    }}

                                />

                            </div>

                        </div>

                        <span className="w-12 text-right text-xs font-semibold text-slate-500">

                            {booklet.ending_or}

                        </span>

                        <span className="ml-4 text-xs text-slate-500">

                            Used

                            <strong className="ml-1 text-slate-700">

                                {booklet.issued_receipts}

                            </strong>

                        </span>

                        <span className="text-xs text-slate-500">

                            Remaining

                            <strong className="ml-1 text-green-700">

                                {booklet.remaining_receipts}

                            </strong>

                        </span>

                        <span className="text-xs text-slate-500">

                            {booklet.consumed_percent}%

                        </span>

                    </div>

                    <p className="mt-2 text-xs text-slate-500">

                        Issue an Official Receipt for General Collections

                    </p>

                </div>

                {/* Next OR */}

                <div className="ml-8 flex items-center gap-3">

                    <div className="rounded-2xl bg-gradient-to-b from-blue-600 to-blue-700 px-7 py-4 text-center text-white shadow-lg">

                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-100">

                            Next OR

                        </p>

                        <p className="leading-none text-5xl font-black">

                            {booklet.current_or}

                        </p>

                    </div>

                    {

                        onClose && (

                            <button

                                onClick={onClose}

                                disabled={saving}

                                className="rounded-lg p-2 hover:bg-slate-100"

                            >

                                <X size={20} />

                            </button>

                        )

                    }

                </div>

            </div>

        </div>

    );

}