"use client";

import { Plus, Trash2, Printer } from "lucide-react";

type Props = {
    selectedCount: number;
    onAdd: () => void;
    onRemove: () => void;
    onSavePrint: () => void;
};

export default function AssessmentToolbar({
    selectedCount,
    onAdd,
    onRemove,
    onSavePrint,
}: Props) {
    return (
        <div className="flex items-center justify-between border-b bg-slate-50 px-6 py-4">

            <div className="flex items-center gap-2">

                <button
                    onClick={onAdd}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white text-black shadow-sm transition hover:bg-gray-100"
                    title="Add Assessment"
                >
                    <Plus className="h-5 w-5" />
                </button>

                <button
                    onClick={onRemove}
                    disabled={selectedCount === 0}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-red-300 bg-white text-red-600 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-300"
                    title="Remove Selected"
                >
                    <Trash2 className="h-5 w-5" />
                </button>

            </div>

            <button
                onClick={onSavePrint}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-blue-700"
            >
                <Printer className="h-5 w-5" />
                Save & Print
            </button>

        </div>
    );
}