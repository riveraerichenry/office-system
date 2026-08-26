"use client";

type Props = {
    feeAmount: string;

    certificationCity: string;
    certificationProvince: string;
    certificationDate: string;

    saving: boolean;

    onFeeAmountChange: (value: string) => void;
    onCertificationCityChange: (value: string) => void;
    onCertificationProvinceChange: (value: string) => void;
    onCertificationDateChange: (value: string) => void;
};

export default function CertificateSection({
    feeAmount,
    certificationCity,
    certificationProvince,
    certificationDate,

    saving,

    onFeeAmountChange,
    onCertificationCityChange,
    onCertificationProvinceChange,
    onCertificationDateChange,
}: Props) {
    return (
        <section className="rounded-xl border bg-white shadow-sm">

            <div className="border-b bg-slate-50 px-5 py-3">
                <h3 className="font-semibold text-slate-800">
                    Fee and Certification
                </h3>
            </div>

            <div className="grid grid-cols-4 gap-5 p-5">

                {/* FEE */}

                <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Fee per City/Municipal Ordinance
                    </label>

                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={feeAmount}
                        disabled={saving}
                        onChange={(e) =>
                            onFeeAmountChange(
                                e.target.value
                            )
                        }
                        className="
                            w-full
                            rounded-lg
                            border
                            border-slate-300
                            px-3
                            py-2.5
                            text-right
                            font-semibold
                        "
                    />
                </div>

                {/* CITY */}

                <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                        City / Municipality
                    </label>

                    <input
                        value={certificationCity}
                        disabled={saving}
                        onChange={(e) =>
                            onCertificationCityChange(
                                e.target.value
                            )
                        }
                        className="
                            w-full
                            rounded-lg
                            border
                            border-slate-300
                            px-3
                            py-2.5
                            uppercase
                        "
                    />
                </div>

                {/* PROVINCE */}

                <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Province
                    </label>

                    <input
                        value={certificationProvince}
                        disabled={saving}
                        onChange={(e) =>
                            onCertificationProvinceChange(
                                e.target.value
                            )
                        }
                        className="
                            w-full
                            rounded-lg
                            border
                            border-slate-300
                            px-3
                            py-2.5
                            uppercase
                        "
                    />
                </div>

                {/* DATE */}

                <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Certification Date
                    </label>

                    <input
                        type="date"
                        value={certificationDate}
                        disabled={saving}
                        onChange={(e) =>
                            onCertificationDateChange(
                                e.target.value
                            )
                        }
                        className="
                            w-full
                            rounded-lg
                            border
                            border-slate-300
                            px-3
                            py-2.5
                        "
                    />
                </div>

            </div>
        </section>
    );
}