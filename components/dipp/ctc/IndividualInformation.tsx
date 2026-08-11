"use client";

import { useEffect, useState } from "react";
import axios from "axios";

type Props = {
    name: string;
    address: string;
    tin: string;
    crNumber: string;
    citizenship: string;
    sex: string;
    height: string;
    weight: string;
    placeOfBirth: string;
    birthDate: string;
    civilStatus: string;
    occupation: string;
    saving: boolean;

    onNameChange: (value: string) => void;
    onAddressChange: (value: string) => void;
    onTinChange: (value: string) => void;
    onCRNumberChange: (value: string) => void;
    onCitizenshipChange: (value: string) => void;
    onSexChange: (value: string) => void;
    onHeightChange: (value: string) => void;
    onWeightChange: (value: string) => void;
    onPlaceOfBirthChange: (value: string) => void;
    onBirthDateChange: (value: string) => void;
    onCivilStatusChange: (value: string) => void;
    onOccupationChange: (value: string) => void;
};

type Barangay = {
    barangay_name: string;
};

export default function IndividualInformation({
    name,
    address,
    tin,
    crNumber,
    citizenship,
    sex,
    height,
    weight,
    placeOfBirth,
    birthDate,
    civilStatus,
    occupation,
    saving,

    onNameChange,
    onAddressChange,
    onTinChange,
    onCRNumberChange,
    onCitizenshipChange,
    onSexChange,
    onHeightChange,
    onWeightChange,
    onPlaceOfBirthChange,
    onBirthDateChange,
    onCivilStatusChange,
    onOccupationChange,
}: Props) {

    /*
    |--------------------------------------------------------------------------
    | Barangays
    |--------------------------------------------------------------------------
    */

    const [barangays, setBarangays] =
        useState<Barangay[]>([]);

    const [loadingBarangays, setLoadingBarangays] =
        useState(false);

    /*
    |--------------------------------------------------------------------------
    | Load Barangays
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        let mounted = true;

        async function loadBarangays() {
            try {
                setLoadingBarangays(true);

                const response = await axios.get(
                    "/api/rpt/property-metadata"
                );

                if (!mounted) {
                    return;
                }

                setBarangays(
                    Array.isArray(response.data?.barangays)
                        ? response.data.barangays
                        : []
                );

            } catch (error) {
                console.error(
                    "Failed to load barangays:",
                    error
                );

                if (mounted) {
                    setBarangays([]);
                }

            } finally {
                if (mounted) {
                    setLoadingBarangays(false);
                }
            }
        }

        loadBarangays();

        return () => {
            mounted = false;
        };
    }, []);

    /*
    |--------------------------------------------------------------------------
    | Styles
    |--------------------------------------------------------------------------
    */

    const inputClass =
        "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";

    const labelClass =
        "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600";

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">

            {/* ==============================================================
                HEADER
            ============================================================== */}

            <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">

                <div className="text-sm font-bold text-slate-800">
                    Individual Information
                </div>

                <div className="mt-0.5 text-xs text-slate-500">
                    Enter the taxpayer's personal information.
                </div>

            </div>

            {/* ==============================================================
                BODY
            ============================================================== */}

            <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">

                {/* ==========================================================
                    NAME
                ========================================================== */}

                <div className="md:col-span-2">

                    <label className={labelClass}>
                        Full Name
                    </label>

                    <input
                        type="text"
                        value={name}
                        disabled={saving}
                        onChange={(event) =>
                            onNameChange(
                                event.target.value
                            )
                        }
                        placeholder="Enter full name"
                        className={inputClass}
                    />

                </div>

                {/* ==========================================================
                    ADDRESS / BARANGAY
                ========================================================== */}

                <div>

                    <label className={labelClass}>
                        Address
                    </label>

                    <select
                        value={address}
                        disabled={
                            saving ||
                            loadingBarangays
                        }
                        onChange={(event) =>
                            onAddressChange(
                                event.target.value
                            )
                        }
                        className={inputClass}
                    >
                        <option value="">
                            {loadingBarangays
                                ? "Loading barangays..."
                                : "Select barangay"}
                        </option>

                        {barangays.map(
                            (barangay, index) => (
                                <option
                                    key={`${barangay.barangay_name}-${index}`}
                                    value={barangay.barangay_name}
                                >
                                    {barangay.barangay_name}
                                </option>
                            )
                        )}
                    </select>

                </div>

                {/* ==========================================================
                    TIN
                ========================================================== */}

                <div>

                    <label className={labelClass}>
                        TIN
                    </label>

                    <input
                        type="text"
                        value={tin}
                        disabled={saving}
                        onChange={(event) =>
                            onTinChange(
                                event.target.value
                            )
                        }
                        placeholder="Enter TIN"
                        className={inputClass}
                    />

                </div>

                {/* ==========================================================
                    CTC / CR NUMBER
                ========================================================== */}

                <div>

                    <label className={labelClass}>
                        CTC / CR Number
                    </label>

                    <input
                        type="text"
                        value={crNumber}
                        disabled={saving}
                        onChange={(event) =>
                            onCRNumberChange(
                                event.target.value
                            )
                        }
                        placeholder="Enter CTC / CR number"
                        className={inputClass}
                    />

                </div>

                {/* ==========================================================
                    CITIZENSHIP
                ========================================================== */}

                <div>

                    <label className={labelClass}>
                        Citizenship
                    </label>

                    <input
                        type="text"
                        value={citizenship}
                        disabled={saving}
                        onChange={(event) =>
                            onCitizenshipChange(
                                event.target.value
                            )
                        }
                        placeholder="Enter citizenship"
                        className={inputClass}
                    />

                </div>

                {/* ==========================================================
                    SEX
                ========================================================== */}

                <div>

                    <label className={labelClass}>
                        Sex
                    </label>

                    <select
                        value={sex}
                        disabled={saving}
                        onChange={(event) =>
                            onSexChange(
                                event.target.value
                            )
                        }
                        className={inputClass}
                    >

                        <option value="">
                            Select sex
                        </option>

                        <option value="MALE">
                            Male
                        </option>

                        <option value="FEMALE">
                            Female
                        </option>

                    </select>

                </div>

                {/* ==========================================================
                    HEIGHT
                ========================================================== */}

                <div>

                    <label className={labelClass}>
                        Height
                    </label>

                    <input
                        type="text"
                        value={height}
                        disabled={saving}
                        onChange={(event) =>
                            onHeightChange(
                                event.target.value
                            )
                        }
                        placeholder="e.g. 170 cm"
                        className={inputClass}
                    />

                </div>

                {/* ==========================================================
                    WEIGHT
                ========================================================== */}

                <div>

                    <label className={labelClass}>
                        Weight
                    </label>

                    <input
                        type="text"
                        value={weight}
                        disabled={saving}
                        onChange={(event) =>
                            onWeightChange(
                                event.target.value
                            )
                        }
                        placeholder="e.g. 70 kg"
                        className={inputClass}
                    />

                </div>

                {/* ==========================================================
                    PLACE OF BIRTH
                ========================================================== */}

                <div>

                    <label className={labelClass}>
                        Place of Birth
                    </label>

                    <input
                        type="text"
                        value={placeOfBirth}
                        disabled={saving}
                        onChange={(event) =>
                            onPlaceOfBirthChange(
                                event.target.value
                            )
                        }
                        placeholder="Enter place of birth"
                        className={inputClass}
                    />

                </div>

                {/* ==========================================================
                    BIRTH DATE
                ========================================================== */}

                <div>

                    <label className={labelClass}>
                        Birth Date
                    </label>

                    <input
                        type="date"
                        value={birthDate}
                        disabled={saving}
                        onChange={(event) =>
                            onBirthDateChange(
                                event.target.value
                            )
                        }
                        className={inputClass}
                    />

                </div>

                {/* ==========================================================
                    CIVIL STATUS
                ========================================================== */}

                <div>

                    <label className={labelClass}>
                        Civil Status
                    </label>

                    <select
                        value={civilStatus}
                        disabled={saving}
                        onChange={(event) =>
                            onCivilStatusChange(
                                event.target.value
                            )
                        }
                        className={inputClass}
                    >

                        <option value="">
                            Select civil status
                        </option>

                        <option value="SINGLE">
                            Single
                        </option>

                        <option value="MARRIED">
                            Married
                        </option>

                        <option value="WIDOWED">
                            Widowed
                        </option>

                        <option value="SEPARATED">
                            Separated
                        </option>

                        <option value="DIVORCED">
                            Divorced
                        </option>

                    </select>

                </div>

                {/* ==========================================================
                    OCCUPATION
                ========================================================== */}

                <div>

                    <label className={labelClass}>
                        Occupation
                    </label>

                    <input
                        type="text"
                        value={occupation}
                        disabled={saving}
                        onChange={(event) =>
                            onOccupationChange(
                                event.target.value
                            )
                        }
                        placeholder="Enter occupation"
                        className={inputClass}
                    />

                </div>

            </div>

        </section>
    );
}