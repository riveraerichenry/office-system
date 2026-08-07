type Props = {

    saving: boolean;

    canSave: boolean;

    total: number;

    onCancel: () => void;

    onProcess: () => void;

};

export default function Footer({

    saving,

    canSave,

    total,

    onCancel,

    onProcess,

}: Props) {

    return (

        <div className="flex items-center justify-between border-t bg-slate-50 px-6 py-4">

            <button

                type="button"

                onClick={onCancel}

                disabled={saving}

                className="rounded-lg border border-slate-300 bg-white px-6 py-3 font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"

            >

                Cancel

            </button>

            <div className="flex items-center gap-4">

                <div className="text-right">

                    <p className="text-xs uppercase tracking-wide text-slate-500">

                        Grand Total

                    </p>

                    <p className="text-2xl font-bold text-blue-700">

                        {

                            total.toLocaleString(

                                "en-PH",

                                {

                                    style: "currency",

                                    currency: "PHP",

                                }

                            )

                        }

                    </p>

                </div>

                <button

                    type="button"

                    onClick={onProcess}

                    disabled={

                        saving ||

                        !canSave

                    }

                    className="rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"

                >

                    {

                        saving

                            ? "Processing..."

                            : "Process Collection"

                    }

                </button>

            </div>

        </div>

    );

}