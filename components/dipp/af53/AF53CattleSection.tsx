"use client";

type Props = {
    animalType: string;
    description: string;
    sex: string;
    years: string;
    brandMunicipality: string;
    brandOwner: string;
    saving: boolean;

    onAnimalTypeChange: (value: string) => void;
    onDescriptionChange: (value: string) => void;
    onSexChange: (value: string) => void;
    onYearsChange: (value: string) => void;
    onBrandMunicipalityChange: (value: string) => void;
    onBrandOwnerChange: (value: string) => void;
};

const ANIMAL_TYPES = [
    "Cow",
    "Carabao",
    "Horse",
];

export default function AF53CattleSection({
    animalType,
    description,
    sex,
    years,
    brandMunicipality,
    brandOwner,
    saving,
    onAnimalTypeChange,
    onDescriptionChange,
    onSexChange,
    onYearsChange,
    onBrandMunicipalityChange,
    onBrandOwnerChange,
}: Props) {
    return (
        <section className="rounded-xl border bg-white shadow-sm">

            {/* ============================================================
                HEADER
            ============================================================ */}

            <div className="border-b bg-slate-50 px-5 py-3">
                <h3 className="font-semibold text-slate-800">
                    Animal Description
                </h3>
            </div>

            {/* ============================================================
                BODY
            ============================================================ */}

            <div className="grid grid-cols-12 gap-5 p-5">

                {/* ========================================================
                    ANIMAL TYPE
                ======================================================== */}

                <div className="col-span-3">

                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Animal Type
                    </label>

                    <select
                        value={animalType}
                        disabled={saving}
                        onChange={(e) =>
                            onAnimalTypeChange(
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
                            disabled:bg-slate-100
                        "
                    >
                        <option value="">
                            Select Animal
                        </option>

                        {ANIMAL_TYPES.map((type) => (
                            <option
                                key={type}
                                value={type}
                            >
                                {type}
                            </option>
                        ))}
                    </select>

                </div>


                {/* ========================================================
                    SEX
                ======================================================== */}

                <div className="col-span-3">

                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Sex
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
                            disabled:bg-slate-100
                        "
                    >
                        <option value="">
                            Select
                        </option>

                        <option value="MALE">
                            Male
                        </option>

                        <option value="FEMALE">
                            Female
                        </option>
                    </select>

                </div>


                {/* ========================================================
                    AGE IN YEARS
                ======================================================== */}

                <div className="col-span-2">

                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Age in Years
                    </label>

                    <input
                        type="number"
                        min="0"
                        value={years}
                        disabled={saving}
                        onChange={(e) =>
                            onYearsChange(
                                e.target.value
                            )
                        }
                        placeholder="Years"
                        className="
                            w-full
                            rounded-lg
                            border
                            border-slate-300
                            px-3
                            py-2.5
                            disabled:bg-slate-100
                        "
                    />

                </div>


                {/* ========================================================
                    BRAND / MUNICIPALITY
                ======================================================== */}

                <div className="col-span-2">

                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Brand / Municipality
                    </label>

                    <input
                        value={brandMunicipality}
                        disabled={saving}
                        onChange={(e) =>
                            onBrandMunicipalityChange(
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
                            disabled:bg-slate-100
                        "
                    />

                </div>


                {/* ========================================================
                    BRAND OF OWNER
                ======================================================== */}

                <div className="col-span-2">

                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Brand of Owner
                    </label>

                    <input
                        value={brandOwner}
                        disabled={saving}
                        onChange={(e) =>
                            onBrandOwnerChange(
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
                            disabled:bg-slate-100
                        "
                    />

                </div>


                {/* ========================================================
                    DESCRIPTION
                ======================================================== */}

                <div className="col-span-12">

                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Description / Distinguishing Marks
                    </label>

                    <textarea
                        value={description}
                        disabled={saving}
                        onChange={(e) =>
                            onDescriptionChange(
                                e.target.value
                            )
                        }
                        rows={3}
                        placeholder="Enter the description and distinguishing marks of the animal..."
                        className="
                            w-full
                            resize-none
                            rounded-lg
                            border
                            border-slate-300
                            px-3
                            py-2.5
                            disabled:bg-slate-100
                        "
                    />

                </div>

            </div>

        </section>
    );
}