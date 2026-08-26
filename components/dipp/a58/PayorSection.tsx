"use client";

type Props = {
    payor: string;
    paymentMode: string;
    saving: boolean;

    onPayorChange: (value: string) => void;
    onPaymentModeChange: (value: string) => void;
};

const PAYMENT_MODES = [
    "Cash",
    "Check",
    "Cash + Check",
];

export default function PayorSection({
    payor,
    paymentMode,
    saving,
    onPayorChange,
    onPaymentModeChange,
}: Props) {
    return (
        <section className="rounded-xl border bg-white shadow-sm">

            <div className="border-b bg-slate-50 px-5 py-3">
                <h3 className="font-semibold text-slate-800">
                    Payor Information
                </h3>
            </div>

            <div className="grid grid-cols-2 gap-6 p-5">

                {/* PAYOR */}

                <div>
                    <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Payor
                    </label>

                    <input
                        value={payor}
                        disabled={saving}
                        onChange={(e) =>
                            onPayorChange(e.target.value)
                        }
                        placeholder="Enter payor name..."
                        className="
                            mt-2
                            w-full
                            rounded-lg
                            border
                            border-slate-300
                            px-4
                            py-3
                            focus:border-blue-500
                            focus:outline-none
                            focus:ring-2
                            focus:ring-blue-200
                            disabled:bg-slate-100
                        "
                    />
                </div>

                {/* PAYMENT MODE */}

                <div>
                    <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Payment Mode
                    </label>

                    <div className="mt-2 flex overflow-hidden rounded-lg border border-slate-300">

                        {PAYMENT_MODES.map((mode) => (
                            <button
                                key={mode}
                                type="button"
                                disabled={saving}
                                onClick={() =>
                                    onPaymentModeChange(mode)
                                }
                                className={`
                                    flex-1
                                    px-4
                                    py-3
                                    text-sm
                                    font-medium
                                    transition

                                    ${
                                        paymentMode === mode
                                            ? "bg-blue-600 text-white"
                                            : "bg-white text-slate-700 hover:bg-slate-100"
                                    }

                                    disabled:bg-slate-100
                                `}
                            >
                                {mode}
                            </button>
                        ))}

                    </div>
                </div>

            </div>
        </section>
    );
}