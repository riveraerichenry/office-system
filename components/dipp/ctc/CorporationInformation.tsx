"use client";

type Props = {

    corporationName: string;

    address: string;

    tin: string;

    secNumber: string;

    representative: string;

    saving: boolean;

    onCorporationNameChange: (
        value: string
    ) => void;

    onAddressChange: (
        value: string
    ) => void;

    onTinChange: (
        value: string
    ) => void;

    onSECChange: (
        value: string
    ) => void;

    onRepresentativeChange: (
        value: string
    ) => void;

};

export default function CorporationInformation({

    corporationName,

    address,

    tin,

    secNumber,

    representative,

    saving,

    onCorporationNameChange,

    onAddressChange,

    onTinChange,

    onSECChange,

    onRepresentativeChange,

}: Props) {

    return (

        <div className="rounded-xl border bg-white shadow-sm">

            <div className="border-b bg-slate-50 px-5 py-3">

                <h3 className="font-semibold">

                    Corporation Information

                </h3>

            </div>

            <div className="grid grid-cols-2 gap-8 p-6">

                {/* =======================================
                    LEFT
                ======================================= */}

                <div className="space-y-5">

                    <div>

                        <label className="mb-1 block text-sm font-medium">

                            Corporation Name

                        </label>

                        <input

                            value={corporationName}

                            disabled={saving}

                            onChange={(e)=>

                                onCorporationNameChange(

                                    e.target.value

                                )

                            }

                            className="w-full rounded-lg border border-slate-300 px-3 py-2"

                        />

                    </div>

                    <div>

                        <label className="mb-1 block text-sm font-medium">

                            Business Address

                        </label>

                        <textarea

                            rows={4}

                            value={address}

                            disabled={saving}

                            onChange={(e)=>

                                onAddressChange(

                                    e.target.value

                                )

                            }

                            className="w-full rounded-lg border border-slate-300 px-3 py-2"

                        />

                    </div>

                    <div>

                        <label className="mb-1 block text-sm font-medium">

                            Authorized Representative

                        </label>

                        <input

                            value={representative}

                            disabled={saving}

                            onChange={(e)=>

                                onRepresentativeChange(

                                    e.target.value

                                )

                            }

                            className="w-full rounded-lg border border-slate-300 px-3 py-2"

                        />

                    </div>

                </div>

                {/* =======================================
                    RIGHT
                ======================================= */}

                <div className="space-y-5">

                    <div>

                        <label className="mb-1 block text-sm font-medium">

                            Tax Identification Number (TIN)

                        </label>

                        <input

                            value={tin}

                            disabled={saving}

                            onChange={(e)=>

                                onTinChange(

                                    e.target.value

                                )

                            }

                            className="w-full rounded-lg border border-slate-300 px-3 py-2"

                        />

                    </div>

                    <div>

                        <label className="mb-1 block text-sm font-medium">

                            SEC Registration Number

                        </label>

                        <input

                            value={secNumber}

                            disabled={saving}

                            onChange={(e)=>

                                onSECChange(

                                    e.target.value

                                )

                            }

                            className="w-full rounded-lg border border-slate-300 px-3 py-2"

                        />

                    </div>

                    <div className="rounded-xl border bg-slate-50 p-5">

                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">

                            Certificate Type

                        </p>

                        <p className="mt-2 text-xl font-bold text-blue-700">

                            COMMUNITY TAX CERTIFICATE

                        </p>

                        <p className="mt-1 text-sm text-slate-600">

                            CORPORATION

                        </p>

                    </div>

                </div>

            </div>

        </div>

    );

}