"use client";

import { useState } from "react";
import { Save, RotateCcw } from "lucide-react";

export default function CTCForm() {
    const [form, setForm] = useState({
        ctcNo: "",
        date: new Date().toISOString().split("T")[0],
        taxpayerName: "",
        tin: "",
        placeOfBirth: "",
        basicTax: "",
        additionalTax: "",
    });

    const [loading, setLoading] = useState(false);

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement>
    ) {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    function handleReset() {
        setForm({
            ctcNo: "",
            date: new Date()
                .toISOString()
                .split("T")[0],
            taxpayerName: "",
            tin: "",
            placeOfBirth: "",
            basicTax: "",
            additionalTax: "",
        });
    }

    async function handleSubmit(
        e: React.FormEvent<HTMLFormElement>
    ) {
        e.preventDefault();

        try {
            setLoading(true);

            /*
             * API will be connected here once
             * the CTC database/table is created.
             */

            console.log("CTC Form:", form);

        } catch (error) {
            console.error(
                "Failed to create CTC:",
                error
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm">
            {/* HEADER */}
            <div className="px-5 py-4 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-800">
                    Community Tax Certificate
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                    Create and process a new CTC.
                </p>
            </div>

            {/* FORM */}
            <form
                onSubmit={handleSubmit}
                className="p-5 space-y-5"
            >
                {/* CTC NUMBER + DATE */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                        label="CTC No."
                        name="ctcNo"
                        value={form.ctcNo}
                        onChange={handleChange}
                        placeholder="Enter CTC number"
                    />

                    <FormField
                        label="Date"
                        name="date"
                        type="date"
                        value={form.date}
                        onChange={handleChange}
                    />
                </div>

                {/* TAXPAYER */}
                <FormField
                    label="Taxpayer Name"
                    name="taxpayerName"
                    value={form.taxpayerName}
                    onChange={handleChange}
                    placeholder="Enter taxpayer name"
                />

                {/* TIN + PLACE OF BIRTH */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                        label="TIN"
                        name="tin"
                        value={form.tin}
                        onChange={handleChange}
                        placeholder="Enter TIN"
                    />

                    <FormField
                        label="Place of Birth"
                        name="placeOfBirth"
                        value={form.placeOfBirth}
                        onChange={handleChange}
                        placeholder="Enter place of birth"
                    />
                </div>

                {/* TAX */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                        label="Basic Community Tax"
                        name="basicTax"
                        type="number"
                        value={form.basicTax}
                        onChange={handleChange}
                        placeholder="0.00"
                    />

                    <FormField
                        label="Additional Community Tax"
                        name="additionalTax"
                        type="number"
                        value={form.additionalTax}
                        onChange={handleChange}
                        placeholder="0.00"
                    />
                </div>

                {/* ACTIONS */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={handleReset}
                        disabled={loading}
                        className="h-11 px-4 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-semibold flex items-center gap-2 transition disabled:opacity-50"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Reset
                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                        className="h-11 px-5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold flex items-center gap-2 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Create CTC
                            </>
                        )}
                    </button>
                </div>
            </form>
        </section>
    );
}

/* =========================================================
   FORM FIELD
========================================================= */

function FormField({
    label,
    name,
    value,
    onChange,
    type = "text",
    placeholder,
}: {
    label: string;
    name: string;
    value: string;
    onChange: (
        e: React.ChangeEvent<HTMLInputElement>
    ) => void;
    type?: string;
    placeholder?: string;
}) {
    return (
        <div>
            <label
                htmlFor={name}
                className="block text-sm font-semibold text-slate-700 mb-2"
            >
                {label}
            </label>

            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full h-11 px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
        </div>
    );
}