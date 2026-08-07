"use client";

import { useState } from "react";

type Props = {
    open: boolean;
    onClose: () => void;
    onCompute: (data: {
        fromQuarter: number;
        fromYear: number;
        toQuarter: number;
        toYear: number;
        tdn: string;
        assessedValue: number;
    }) => void;
};


export default function AddAssessmentModal({
    open,
    onClose,
    onCompute,
}: Props) {

    const currentYear = new Date().getFullYear();

    const [form, setForm] = useState({

        fromYear: currentYear,
        fromQuarter: 1,

        toYear: currentYear,
        toQuarter: 1,

        kind: "Land",

        classification: "A - AGRICULTURAL",

        actualUse: "NONE",

        subClass: "NONE",

        tdn: "",

        assessedValue: 0,

        flag: "PREVIOUS",

    });

    function update(
        field: keyof typeof form,
        value: any
    ) {
        setForm(prev => ({
            ...prev,
            [field]: value,
        }));
    }

    if (!open) return null;

    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

            <div className="w-full max-w-4xl rounded-xl bg-white shadow-2xl">

                <div className="border-b px-6 py-4">

                    <h2 className="text-xl font-semibold">
                        Add Assessment
                    </h2>

                </div>

                <div className="space-y-8 p-6">

                    {/* COVERAGE */}

                    <div className="grid grid-cols-4 gap-6">

                        <div>

                            <label className="mb-2 block text-sm font-medium">
                                Quarter From
                            </label>

                            <select
                                value={form.fromQuarter}
                                onChange={(e)=>
                                    update("fromQuarter",Number(e.target.value))
                                }
                                className="w-full rounded-md border px-3 py-2"
                            >

                                <option value={1}>1st Quarter</option>
                                <option value={2}>2nd Quarter</option>
                                <option value={3}>3rd Quarter</option>
                                <option value={4}>4th Quarter</option>

                            </select>

                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Year From
                            </label>

                            <input
                                type="number"
                                value={form.fromYear}
                                onChange={(e)=>
                                    update("fromYear",Number(e.target.value))
                                }
                                className="w-full rounded-md border px-3 py-2"
                            />
                        </div>

                        <div>

                            <label className="mb-2 block text-sm font-medium">
                                Quarter To
                            </label>

                            <select
                                value={form.toQuarter}
                                onChange={(e)=>
                                    update("toQuarter",Number(e.target.value))
                                }
                                className="w-full rounded-md border px-3 py-2"
                            >

                                <option value={1}>1st Quarter</option>
                                <option value={2}>2nd Quarter</option>
                                <option value={3}>3rd Quarter</option>
                                <option value={4}>4th Quarter</option>

                            </select>
                            
                        </div>
                        <div>

                            <label className="mb-2 block text-sm font-medium">
                                Year To
                            </label>

                            <input
                                type="number"
                                value={form.toYear}
                                onChange={(e)=>
                                    update("toYear",Number(e.target.value))
                                }
                                className="w-full rounded-md border px-3 py-2"
                            />

                        </div>

                    </div>

                    <hr />

                    {/* DETAILS */}

                    <div className="grid grid-cols-2 gap-x-10 gap-y-5">

                        {/* <div>

                            <label className="mb-2 block text-sm font-medium">
                                Kind
                            </label>

                            <select
                                value={form.kind}
                                onChange={(e)=>
                                    update("kind",e.target.value)
                                }
                                className="w-full rounded-md border px-3 py-2"
                            >
                                <option>Land</option>
                                <option>Building</option>
                                <option>Machinery</option>
                            </select>

                        </div> */}

                        {/* <div>

                            <label className="mb-2 block text-sm font-medium">
                                Classification
                            </label>

                            <select
                                value={form.classification}
                                onChange={(e)=>
                                    update("classification",e.target.value)
                                }
                                className="w-full rounded-md border px-3 py-2"
                            >
                                <option>A - AGRICULTURAL</option>
                            </select>

                        </div> */}
{/* 
                        <div>

                            <label className="mb-2 block text-sm font-medium">
                                Actual Use
                            </label>

                            <select
                                value={form.actualUse}
                                onChange={(e)=>
                                    update("actualUse",e.target.value)
                                }
                                className="w-full rounded-md border px-3 py-2"
                            >
                                <option>NONE</option>
                            </select>

                        </div> */}

                        {/* <div>

                            <label className="mb-2 block text-sm font-medium">
                                Sub Class
                            </label>

                            <select
                                value={form.subClass}
                                onChange={(e)=>
                                    update("subClass",e.target.value)
                                }
                                className="w-full rounded-md border px-3 py-2"
                            >
                                <option>NONE</option>
                            </select>

                        </div> */}

                        <div>

                            <label className="mb-2 block text-sm font-medium">
                                TD Number
                            </label>

                            <input
                                value={form.tdn}
                                onChange={(e)=>
                                    update("tdn",e.target.value)
                                }
                                className="w-full rounded-md border px-3 py-2"
                            />

                        </div>

                        <div>

                            <label className="mb-2 block text-sm font-medium">
                                Assessed Value
                            </label>

                            <input
                                type="number"
                                value={form.assessedValue}
                                onChange={(e)=>
                                    update("assessedValue",Number(e.target.value))
                                }
                                className="w-full rounded-md border px-3 py-2 text-right"
                            />

                        </div>

                        {/* <div>

                            <label className="mb-2 block text-sm font-medium">
                                Flag
                            </label>

                            <select
                                value={form.flag}
                                onChange={(e)=>
                                    update("flag",e.target.value)
                                }
                                className="w-full rounded-md border px-3 py-2"
                            >
                                <option>PREVIOUS</option>
                                <option>CURRENT</option>
                                <option>ADVANCE</option>
                            </select>

                        </div> */}

                    </div>

                </div>

                <div className="flex justify-end gap-2 border-t bg-gray-50 px-6 py-4">

                    <button
                        onClick={() => {

                            onCompute({

                                fromQuarter: form.fromQuarter,
                                fromYear: form.fromYear,

                                toQuarter: form.toQuarter,
                                toYear: form.toYear,

                                tdn: form.tdn,

                                assessedValue: form.assessedValue,

                            });

                            onClose();

                        }}
                        className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
                    >
                        Re-compute
                    </button>

                    <button
                        onClick={onClose}
                        className="rounded-lg border px-5 py-2 hover:bg-gray-100"
                    >
                        Close
                    </button>

                </div>

            </div>

        </div>

    );

}