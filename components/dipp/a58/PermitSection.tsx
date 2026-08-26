"use client";

import { CalendarDays } from "lucide-react";

type Props = {
    receiptDate: string;
    cityMunicipality: string;
    province: string;
    permitAction: string;
    remainsOf: string;

    saving: boolean;

    onReceiptDateChange: (value: string) => void;
    onCityMunicipalityChange: (value: string) => void;
    onProvinceChange: (value: string) => void;
    onPermitActionChange: (value: string) => void;
    onRemainsOfChange: (value: string) => void;
};

function formatDate(value: string) {
    if (!value) {
        return "";
    }

    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

export default function PermitSection({
    receiptDate,
    cityMunicipality,
    province,
    permitAction,
    remainsOf,
    saving,
    onReceiptDateChange,
    onCityMunicipalityChange,
    onProvinceChange,
    onPermitActionChange,
    onRemainsOfChange,
}: Props) {
    return (
        <section className="rounded-xl border bg-white shadow-sm">

            {/* HEADER */}

            <div className="border-b bg-slate-50 px-5 py-3">
                <h3 className="font-semibold text-slate-800">
                    Certificate Information
                </h3>
            </div>

            {/* BODY */}

            <div className="grid grid-cols-3 gap-5 p-5">

                {/* =====================================================
                    DATE ISSUED
                ===================================================== */}

                <div>
                    <label
                        className="
                            mb-1
                            block
                            text-xs
                            font-semibold
                            uppercase
                            tracking-wide
                            text-slate-500
                        "
                    >
                        Date Issued
                    </label>

                    <div className="relative">

                        <div
                            className="
                                flex
                                items-center
                                justify-between
                                rounded-lg
                                border
                                border-slate-300
                                bg-white
                                px-3
                                py-2.5
                            "
                        >

                            <span className="font-medium text-slate-700">
                                {formatDate(receiptDate)}
                            </span>

                            <CalendarDays
                                size={18}
                                className="text-slate-500"
                            />

                        </div>

                        <input
                            type="date"
                            value={receiptDate}
                            disabled={saving}
                            onChange={(e) =>
                                onReceiptDateChange(
                                    e.target.value
                                )
                            }
                            className="
                                absolute
                                inset-0
                                h-full
                                w-full
                                cursor-pointer
                                opacity-0
                            "
                        />

                    </div>
                </div>

                {/* =====================================================
                    CITY / MUNICIPALITY
                ===================================================== */}

                <div>
                    <label
                        className="
                            mb-1
                            block
                            text-xs
                            font-semibold
                            uppercase
                            tracking-wide
                            text-slate-500
                        "
                    >
                        City / Municipality
                    </label>

                    <input
                        value={cityMunicipality}
                        disabled={saving}
                        onChange={(e) =>
                            onCityMunicipalityChange(
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
                            focus:border-blue-500
                            focus:outline-none
                            focus:ring-2
                            focus:ring-blue-200
                            disabled:bg-slate-100
                        "
                    />
                </div>

                {/* =====================================================
                    PROVINCE
                ===================================================== */}

                <div>
                    <label
                        className="
                            mb-1
                            block
                            text-xs
                            font-semibold
                            uppercase
                            tracking-wide
                            text-slate-500
                        "
                    >
                        Province
                    </label>

                    <input
                        value={province}
                        disabled={saving}
                        onChange={(e) =>
                            onProvinceChange(
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
                            focus:border-blue-500
                            focus:outline-none
                            focus:ring-2
                            focus:ring-blue-200
                            disabled:bg-slate-100
                        "
                    />
                </div>

                {/* =====================================================
                    PERMISSION
                ===================================================== */}

                <div>
                    <label
                        className="
                            mb-1
                            block
                            text-xs
                            font-semibold
                            uppercase
                            tracking-wide
                            text-slate-500
                        "
                    >
                        Permission
                    </label>

                    <select
                        value={permitAction}
                        disabled={saving}
                        onChange={(e) =>
                            onPermitActionChange(
                                e.target.value
                            )
                        }
                        className="
                            w-full
                            rounded-lg
                            border
                            border-slate-300
                            bg-white
                            px-3
                            py-2.5
                            focus:border-blue-500
                            focus:outline-none
                            focus:ring-2
                            focus:ring-blue-200
                            disabled:bg-slate-100
                        "
                    >
                        <option value="">
                            Select
                        </option>

                        <option value="INTER">
                            Inter
                        </option>

                        <option value="DIAMETER">
                            Diameter
                        </option>

                        <option value="REMOVE">
                            Remove
                        </option>
                    </select>
                </div>

              

            </div>

        </section>
    );
}