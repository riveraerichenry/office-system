"use client";

type Props = {
    payor: string;
    location: string;
    lastOR: string;
    orDate: string;

    saving: boolean;

    onPayorChange: (value: string) => void;
    onLocationChange: (value: string) => void;
    onLastORChange: (value: string) => void;
    onORDateChange: (value: string) => void;
};

export default function AF56TaxpayerSection({

    payor,
    location,
    lastOR,
    orDate,

    saving,

    onPayorChange,
    onLocationChange,
    onLastORChange,
    onORDateChange,

}: Props) {

    return (

        <div className="rounded-xl border bg-white shadow-sm">

            <div className="border-b bg-slate-50 px-5 py-3">

                <h2 className="text-base font-semibold text-slate-800">
                    Taxpayer Information
                </h2>

                <p className="text-sm text-slate-500">
                    Real Property Tax Collection Information
                </p>

            </div>

            <div className="grid grid-cols-12 gap-5 p-5">

                {/* Payor */}

                <div className="col-span-8">

                    <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
                        Payor
                    </label>

                    <input
                        value={payor}
                        disabled={saving}
                        onChange={(e) =>
                            onPayorChange(e.target.value)
                        }
                        placeholder="Enter payor's complete name"
                        className="w-full rounded-lg border px-3 py-2 focus:border-blue-600 focus:outline-none"
                    />

                </div>

                {/* Last OR */}

                <div className="col-span-2">

                    <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
                        Last O.R.
                    </label>

                    <input
                        value={lastOR}
                        disabled={saving}
                        onChange={(e) =>
                            onLastORChange(e.target.value)
                        }
                        className="w-full rounded-lg border px-3 py-2 text-center"
                    />

                </div>

                {/* OR Date */}

                <div className="col-span-2">

                    <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
                        O.R. Date
                    </label>

                    <input
                        type="date"
                        value={orDate}
                        disabled={saving}
                        onChange={(e) =>
                            onORDateChange(e.target.value)
                        }
                        className="w-full rounded-lg border px-3 py-2"
                    />

                </div>

                {/* Property Location */}

                <div className="col-span-12">

                    <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
                        Property Location
                    </label>

                    <textarea
                        rows={2}
                        value={location}
                        disabled={saving}
                        onChange={(e) =>
                            onLocationChange(e.target.value)
                        }
                        placeholder="Barangay / Sitio / Location"
                        className="w-full rounded-lg border px-3 py-2 resize-none focus:border-blue-600 focus:outline-none"
                    />

                </div>

            </div>

        </div>

    );

}