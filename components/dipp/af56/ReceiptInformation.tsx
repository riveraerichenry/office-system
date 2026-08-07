"use client";

import { BookOpen, Hash, FileText, Layers3 } from "lucide-react";
import { AssignedBooklet } from "@/lib/types/booklet";

type Props = {
    selectedBooklet: AssignedBooklet | null;
};

export default function ReceiptInformation({
    selectedBooklet,
}: Props) {
    return (
        <div className="rounded-xl border bg-white shadow-sm">

            <div className="border-b px-6 py-4">

                <h2 className="text-lg font-semibold text-slate-800">
                    Receipt Information
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                    Receipt booklet that will be used for this payment.
                </p>

            </div>

            <div className="p-6">

                {!selectedBooklet ? (

                    <div className="rounded-lg border border-dashed py-12 text-center">

                        <BookOpen
                            className="mx-auto mb-3 text-slate-400"
                            size={40}
                        />

                        <h3 className="font-medium text-slate-700">
                            No Booklet Selected
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            Select a booklet from the right panel.
                        </p>

                    </div>

                ) : (

                    <div className="grid gap-5 md:grid-cols-2">

                        <InfoCard
                            icon={<BookOpen size={18} />}
                            label="Accountable Form"
                            value={`${selectedBooklet.form_code} - ${selectedBooklet.form_name}`}
                        />

                        <InfoCard
                            icon={<FileText size={18} />}
                            label="Control Number"
                            value={selectedBooklet.control_no}
                        />

                        <InfoCard
                            icon={<Hash size={18} />}
                            label="Series"
                            value={selectedBooklet.series}
                        />

                        <InfoCard
                            icon={<Layers3 size={18} />}
                            label="OR Range"
                            value={`${selectedBooklet.beginning_or.toLocaleString()} - ${selectedBooklet.ending_or.toLocaleString()}`}
                        />

                        <InfoCard
                            icon={<Hash size={18} />}
                            label="Next OR Number"
                            value={(selectedBooklet.current_or + 1).toLocaleString()}
                            valueClass="text-blue-600 font-bold"
                        />

                        <InfoCard
                            icon={<BookOpen size={18} />}
                            label="Remaining Receipts"
                            value={selectedBooklet.remaining.toLocaleString()}
                            valueClass="text-green-600 font-bold"
                        />

                        <InfoCard
                            icon={<BookOpen size={18} />}
                            label="Fund Source"
                            value={selectedBooklet.fund_name ?? "-"}
                        />

                    </div>

                )}

            </div>

        </div>
    );
}

type CardProps = {
    icon: React.ReactNode;
    label: string;
    value: string;
    valueClass?: string;
};

function InfoCard({
    icon,
    label,
    value,
    valueClass,
}: CardProps) {
    return (
        <div className="rounded-lg border bg-slate-50 p-4">

            <div className="mb-2 flex items-center gap-2 text-slate-500">

                {icon}

                <span className="text-sm">
                    {label}
                </span>

            </div>

            <div className={`text-lg font-semibold ${valueClass ?? "text-slate-800"}`}>
                {value}
            </div>

        </div>
    );
}