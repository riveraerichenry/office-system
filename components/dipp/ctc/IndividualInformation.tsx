"use client";

import { CalendarDays } from "lucide-react";

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

    return (

        <div className="rounded-xl border bg-white shadow-sm">

            <div className="border-b bg-slate-50 px-5 py-3">

                <h3 className="font-semibold">

                    Taxpayer Information

                </h3>

            </div>

            <div className="grid grid-cols-2 gap-8 p-6">

                {/* LEFT */}

                <div className="space-y-5">

                    <div>

                        <label className="mb-1 block text-sm font-medium">

                            Full Name

                        </label>

                        <input

                            value={name}

                            disabled={saving}

                            onChange={(e)=>

                                onNameChange(
                                    e.target.value
                                )

                            }

                            className="w-full rounded-lg border px-3 py-2"

                        />

                    </div>

                    <div>

                        <label className="mb-1 block text-sm font-medium">

                            Address

                        </label>

                        <textarea

                            value={address}

                            disabled={saving}

                            onChange={(e)=>

                                onAddressChange(
                                    e.target.value
                                )

                            }

                            rows={3}

                            className="w-full rounded-lg border px-3 py-2"

                        />

                    </div>

                    <div className="grid grid-cols-2 gap-4">

                        <div>

                            <label className="mb-1 block text-sm font-medium">

                                TIN

                            </label>

                            <input

                                value={tin}

                                disabled={saving}

                                onChange={(e)=>

                                    onTinChange(
                                        e.target.value
                                    )

                                }

                                className="w-full rounded-lg border px-3 py-2"

                            />

                        </div>

                        <div>

                            <label className="mb-1 block text-sm font-medium">

                                C.R. No.

                            </label>

                            <input

                                value={crNumber}

                                disabled={saving}

                                onChange={(e)=>

                                    onCRNumberChange(
                                        e.target.value
                                    )

                                }

                                className="w-full rounded-lg border px-3 py-2"

                            />

                        </div>

                    </div>

                    <div>

                        <label className="mb-1 block text-sm font-medium">

                            Citizenship

                        </label>

                        <input

                            value={citizenship}

                            disabled={saving}

                            onChange={(e)=>

                                onCitizenshipChange(
                                    e.target.value
                                )

                            }

                            className="w-full rounded-lg border px-3 py-2"

                        />

                    </div>

                    <div>

                        <label className="mb-1 block text-sm font-medium">

                            Occupation

                        </label>

                        <input

                            value={occupation}

                            disabled={saving}

                            onChange={(e)=>

                                onOccupationChange(
                                    e.target.value
                                )

                            }

                            className="w-full rounded-lg border px-3 py-2"

                        />

                    </div>

                </div>

                {/* RIGHT */}

                <div className="space-y-5">

                    <div className="grid grid-cols-2 gap-4">

                        <div>

                            <label className="mb-1 block text-sm font-medium">

                                Sex

                            </label>

                            <select

                                value={sex}

                                disabled={saving}

                                onChange={(e)=>

                                    onSexChange(
                                        e.target.value
                                    )

                                }

                                className="w-full rounded-lg border px-3 py-2"

                            >

                                <option value="">
                                    Select
                                </option>

                                <option value="Male">
                                    Male
                                </option>

                                <option value="Female">
                                    Female
                                </option>

                            </select>

                        </div>

                        <div>

                            <label className="mb-1 block text-sm font-medium">

                                Civil Status

                            </label>

                            <input

                                value={civilStatus}

                                disabled={saving}

                                onChange={(e)=>

                                    onCivilStatusChange(
                                        e.target.value
                                    )

                                }

                                className="w-full rounded-lg border px-3 py-2"

                            />

                        </div>

                    </div>

                    <div className="grid grid-cols-2 gap-4">

                        <div>

                            <label className="mb-1 block text-sm font-medium">

                                Height

                            </label>

                            <input

                                value={height}

                                disabled={saving}

                                onChange={(e)=>

                                    onHeightChange(
                                        e.target.value
                                    )

                                }

                                className="w-full rounded-lg border px-3 py-2"

                            />

                        </div>

                        <div>

                            <label className="mb-1 block text-sm font-medium">

                                Weight

                            </label>

                            <input

                                value={weight}

                                disabled={saving}

                                onChange={(e)=>

                                    onWeightChange(
                                        e.target.value
                                    )

                                }

                                className="w-full rounded-lg border px-3 py-2"

                            />

                        </div>

                    </div>

                    <div>

                        <label className="mb-1 block text-sm font-medium">

                            Place of Birth

                        </label>

                        <input

                            value={placeOfBirth}

                            disabled={saving}

                            onChange={(e)=>

                                onPlaceOfBirthChange(
                                    e.target.value
                                )

                            }

                            className="w-full rounded-lg border px-3 py-2"

                        />

                    </div>

                    <div>

                        <label className="mb-1 block text-sm font-medium">

                            Birth Date

                        </label>

                        <div className="flex items-center gap-3">

                            <p className="flex-1 rounded-lg border bg-slate-50 px-3 py-2 font-medium">

                                {

                                    birthDate

                                        ?

                                        new Date(

                                            birthDate

                                        ).toLocaleDateString(

                                            "en-PH",

                                            {

                                                year: "numeric",

                                                month: "long",

                                                day: "numeric",

                                            }

                                        )

                                        :

                                        "-"

                                }

                            </p>

                            <div className="relative">

                                <input

                                    type="date"

                                    value={birthDate}

                                    disabled={saving}

                                    onChange={(e)=>

                                        onBirthDateChange(

                                            e.target.value

                                        )

                                    }

                                    className="absolute inset-0 cursor-pointer opacity-0"

                                />

                                <button

                                    type="button"

                                    disabled={saving}

                                    className="rounded-lg border bg-white p-2 hover:bg-slate-100"

                                >

                                    <CalendarDays size={18} />

                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

}