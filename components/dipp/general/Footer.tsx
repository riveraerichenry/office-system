"use client";

type Props = {
saving: boolean;

canSave: boolean;

total: number;

payment: number | "";

onPaymentChange: (
    value: number | ""
) => void;

onCancel: () => void;

onProcess: () => void;

};

export default function Footer({
saving,
canSave,
total,
payment,
onPaymentChange,
onCancel,
onProcess,
}: Props) {

const paymentNumber =
    typeof payment === "number"
        ? payment
        : 0;

const change =
    paymentNumber >= total
        ? paymentNumber - total
        : 0;

const insufficientPayment =
    payment !== "" &&
    paymentNumber < total;

const formatCurrency = (
    amount: number
) =>
    amount.toLocaleString(
        "en-PH",
        {
            style: "currency",
            currency: "PHP",
        }
    );

return (
    <div className="border-t bg-slate-50 px-6 py-4">

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            {/* Cancel Button */}

            <button
                type="button"
                onClick={onCancel}
                disabled={saving}
                className="w-full rounded-lg border border-slate-300 bg-white px-6 py-3 font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 lg:w-auto"
            >
                Cancel
            </button>


            {/* Payment Section */}

            <div className="flex flex-col gap-4 lg:flex-row lg:items-end">

                {/* Payment Input */}

                <div className="min-w-[220px]">

                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Payment Received
                    </label>

                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={payment}
                        disabled={saving}
                        onChange={(
                            e
                        ) => {

                            const value =
                                e.target.value;

                            onPaymentChange(
                                value === ""
                                    ? ""
                                    : Number(
                                        value
                                    )
                            );

                        }}
                        placeholder="Enter payment"
                        className={`w-full rounded-lg border bg-white px-4 py-3 text-right text-lg font-semibold outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 ${
                            insufficientPayment
                                ? "border-red-400 focus:ring-red-200"
                                : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                        }`}
                    />

                    {
                        insufficientPayment && (
                            <p className="mt-1 text-xs font-medium text-red-600">
                                Payment is insufficient.
                            </p>
                        )
                    }

                </div>


                {/* Grand Total */}

                <div className="min-w-[180px] rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-right">

                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Grand Total
                    </p>

                    <p className="text-2xl font-bold text-blue-700">
                        {
                            formatCurrency(
                                total
                            )
                        }
                    </p>

                </div>


                {/* Change */}

                <div className="min-w-[180px] rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-right">

                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Change
                    </p>

                    <p className="text-2xl font-bold text-emerald-700">
                        {
                            formatCurrency(
                                change
                            )
                        }
                    </p>

                </div>


                {/* Process Button */}

                <button
                    type="button"
                    onClick={onProcess}
                    disabled={
                        saving ||
                        !canSave ||
                        payment === "" ||
                        paymentNumber < total
                    }
                    className="w-full rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 lg:w-auto"
                >
                    {
                        saving
                            ? "Processing..."
                            : "Process Collection"
                    }
                </button>

            </div>

        </div>

    </div>
);

}