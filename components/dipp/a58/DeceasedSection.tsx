"use client";

type Props = {
    deceasedName: string;
    nationality: string;
    age: string;
    sex: string;
    dateOfDeath: string;
    causeOfDeath: string;
    cemeteryName: string;
    infectiousStatus: string;
    embalmedStatus: string;
    dispositionOfRemains: string;

    saving: boolean;

    onDeceasedNameChange: (value: string) => void;
    onNationalityChange: (value: string) => void;
    onAgeChange: (value: string) => void;
    onSexChange: (value: string) => void;
    onDateOfDeathChange: (value: string) => void;
    onCauseOfDeathChange: (value: string) => void;
    onCemeteryNameChange: (value: string) => void;
    onInfectiousStatusChange: (value: string) => void;
    onEmbalmedStatusChange: (value: string) => void;
    onDispositionChange: (value: string) => void;
};

export default function DeceasedSection({
    deceasedName,
    nationality,
    age,
    sex,
    dateOfDeath,
    causeOfDeath,
    cemeteryName,
    infectiousStatus,
    embalmedStatus,
    dispositionOfRemains,

    saving,

    onDeceasedNameChange,
    onNationalityChange,
    onAgeChange,
    onSexChange,
    onDateOfDeathChange,
    onCauseOfDeathChange,
    onCemeteryNameChange,
    onInfectiousStatusChange,
    onEmbalmedStatusChange,
    onDispositionChange,
}: Props) {
    return (
        <section className="rounded-xl border bg-white shadow-sm">

            <div className="border-b bg-slate-50 px-5 py-3">
                <h3 className="font-semibold text-slate-800">
                    Information of the Deceased
                </h3>
            </div>

            <div className="grid grid-cols-3 gap-5 p-5">

                {/* NAME */}

                <div className="col-span-2">
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Name
                    </label>

                    <input
                        value={deceasedName}
                        disabled={saving}
                        onChange={(e) =>
                            onDeceasedNameChange(
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

                {/* NATIONALITY */}

                <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Nationality
                    </label>

                    <input
                        value={nationality}
                        disabled={saving}
                        onChange={(e) =>
                            onNationalityChange(
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

                {/* AGE */}

                <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Age
                    </label>

                    <input
                        type="number"
                        min="0"
                        value={age}
                        disabled={saving}
                        onChange={(e) =>
                            onAgeChange(
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

                {/* SEX */}

                <div>
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

                {/* DATE OF DEATH */}

                <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Date of Death
                    </label>

                    <input
                        type="date"
                        value={dateOfDeath}
                        disabled={saving}
                        onChange={(e) =>
                            onDateOfDeathChange(
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

                {/* CAUSE */}

                <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Cause of Death
                    </label>

                    <input
                        value={causeOfDeath}
                        disabled={saving}
                        onChange={(e) =>
                            onCauseOfDeathChange(
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

                {/* CEMETERY */}

                <div className="col-span-2">
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Name of Cemetery
                    </label>

                    <input
                        value={cemeteryName}
                        disabled={saving}
                        onChange={(e) =>
                            onCemeteryNameChange(
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

                {/* INFECTIOUS */}

                <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Infectious / Non-infectious
                    </label>

                    <select
                        value={infectiousStatus}
                        disabled={saving}
                        onChange={(e) =>
                            onInfectiousStatusChange(
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
                        "
                    >
                        <option value="">
                            Select
                        </option>

                        <option value="INFECTIOUS">
                            Infectious
                        </option>

                        <option value="NON-INFECTIOUS">
                            Non-infectious
                        </option>
                    </select>
                </div>

                {/* EMBALMED */}

                <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Body
                    </label>

                    <select
                        value={embalmedStatus}
                        disabled={saving}
                        onChange={(e) =>
                            onEmbalmedStatusChange(
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
                        "
                    >
                        <option value="">
                            Select
                        </option>

                        <option value="EMBALMED">
                            Embalmed
                        </option>

                        <option value="NOT EMBALMED">
                            Not Embalmed
                        </option>
                    </select>
                </div>

                {/* DISPOSITION */}

                <div className="col-span-3">
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Disposition of Remains
                    </label>

                    <input
                        value={dispositionOfRemains}
                        disabled={saving}
                        onChange={(e) =>
                            onDispositionChange(
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