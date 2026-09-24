"use client";

import { useState } from "react";

type Props = {
    ownerName: string;
    ownerMunicipality: string;
    ownerProvince: string;

    sex: string;

    paymentMode?: string;

    saving: boolean;

    onOwnerNameChange: (
        value: string
    ) => void;

    onOwnerMunicipalityChange: (
        value: string
    ) => void;

    onOwnerProvinceChange: (
        value: string
    ) => void;

    onSexChange: (
        value: string
    ) => void;

    onPaymentModeChange?: (
        value: string
    ) => void;
};

const SEX_OPTIONS = [
    {
        value: "MALE",
        label: "Male",
    },
    {
        value: "FEMALE",
        label: "Female",
    },
];

const PAYMENT_MODES = [
    "Cash",
    "Check",
    "Cash + Check",
];

export default function AF53OwnerSection({
    ownerName,
    ownerMunicipality,
    ownerProvince,

    sex,

    paymentMode,

    saving,

    onOwnerNameChange,
    onOwnerMunicipalityChange,
    onOwnerProvinceChange,

    onSexChange,
    onPaymentModeChange,
}: Props) {

    /*
     * Cash is the default payment mode.
     *
     * This local state also prevents the component
     * from breaking if the parent has not yet passed
     * onPaymentModeChange.
     */
    const [
        localPaymentMode,
        setLocalPaymentMode,
    ] = useState("Cash");

    const activePaymentMode =
        paymentMode || localPaymentMode;

    const handlePaymentModeChange = (
        mode: string
    ) => {

        // Always update local state
        setLocalPaymentMode(mode);

        // Update parent if callback exists
        onPaymentModeChange?.(mode);
    };

    return (
        <section className="w-full rounded-xl border bg-white shadow-sm">

            {/* ============================================================
                HEADER
            ============================================================ */}

            <div className="border-b bg-slate-50 px-5 py-3">

                <h3 className="font-semibold text-slate-800">
                    Registered Owner
                </h3>

            </div>


            {/* ============================================================
                BODY
            ============================================================ */}

            <div className="grid grid-cols-12 gap-5 p-5">

                {/* ========================================================
                    OWNER NAME
                ======================================================== */}

                <div className="col-span-5">

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
                        Owner / Registered Owner
                    </label>

                    <input
                        value={ownerName}
                        disabled={saving}
                        onChange={(e) =>
                            onOwnerNameChange(
                                e.target.value
                            )
                        }
                        placeholder="Enter owner's complete name..."
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


                {/* ========================================================
                    GENDER
                ======================================================== */}

                <div className="col-span-2">

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
                        Gender
                    </label>

                    <select
                        value={sex}
                        disabled={saving}
                        onChange={(e) =>
                            onSexChange(
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
                            Select Gender
                        </option>

                        {SEX_OPTIONS.map(
                            (option) => (

                                <option
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </option>

                            )
                        )}

                    </select>

                </div>


                {/* ========================================================
                    MUNICIPALITY
                ======================================================== */}

                <div className="col-span-3">

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
                        Municipality
                    </label>

                    <input
                        value={ownerMunicipality}
                        disabled={saving}
                        onChange={(e) =>
                            onOwnerMunicipalityChange(
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


                {/* ========================================================
                    PROVINCE
                ======================================================== */}

                <div className="col-span-2">

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
                        value={ownerProvince}
                        disabled={saving}
                        onChange={(e) =>
                            onOwnerProvinceChange(
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


                {/* ========================================================
                    PAYMENT MODE
                    FULL WIDTH
                ======================================================== */}

                <div className="col-span-12">

                    <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Payment Mode
                    </label>

                    <div
                        className="
                            mt-2
                            flex
                            w-full
                            overflow-hidden
                            rounded-lg
                            border
                            border-slate-300
                        "
                    >

                        {PAYMENT_MODES.map(
                            (mode) => (

                                <button
                                    key={mode}
                                    type="button"
                                    disabled={saving}
                                    onClick={() =>
                                        handlePaymentModeChange(
                                            mode
                                        )
                                    }
                                    className={`
                                        flex-1
                                        whitespace-nowrap
                                        px-3
                                        py-3
                                        text-sm
                                        font-medium
                                        transition

                                        ${
                                            activePaymentMode ===
                                            mode
                                                ? "bg-blue-600 text-white"
                                                : "bg-white text-slate-700 hover:bg-slate-100"
                                        }

                                        disabled:bg-slate-100
                                    `}
                                >
                                    {mode}
                                </button>

                            )
                        )}

                    </div>

                </div>

            </div>

        </section>
    );
}