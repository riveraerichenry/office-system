"use client";

import { useState } from "react";
import {
    ChevronLeft,
    X,
    BookOpen,
    TriangleAlert,
    FileText,
    Bell,
} from "lucide-react";

export default function DIPPMonitor() {

    const [open, setOpen] = useState(false);

    return (
        <>
            {/* Bookmark */}

            <div
                className={`
                    fixed
                    right-0
                    top-1/2
                    -translate-y-1/2
                    z-50
                    transition-all
                    duration-300
                    ${open ? "translate-x-full" : ""}
                `}
            >

                <button
                    onClick={() => setOpen(true)}
                    className="
                        flex
                        items-center
                        gap-2
                        rounded-l-xl
                        bg-blue-600
                        px-3
                        py-4
                        text-white
                        shadow-xl
                        hover:bg-blue-700
                    "
                >

                    <BookOpen size={20} />

                    <span
                        className="
                            text-sm
                            font-semibold
                            [writing-mode:vertical-rl]
                            rotate-180
                        "
                    >
                        Receipt Monitor
                    </span>

                </button>

            </div>

            {/* Overlay */}

            {open && (

                <div
                    className="fixed inset-0 z-40 bg-black/20"
                    onClick={() => setOpen(false)}
                />

            )}

            {/* Panel */}

            <div
                className={`
                    fixed
                    right-0
                    top-0
                    z-50
                    h-screen
                    w-[420px]
                    bg-white
                    shadow-2xl
                    transition-all
                    duration-300
                    ${open ? "translate-x-0" : "translate-x-full"}
                `}
            >

                {/* Header */}

                <div className="flex items-center justify-between border-b p-5">

                    <div>

                        <h2 className="text-xl font-bold">
                            Receipt Monitor
                        </h2>

                        <p className="text-sm text-slate-500">
                            Accountable Forms Overview
                        </p>

                    </div>

                    <button
                        onClick={() => setOpen(false)}
                        className="rounded-lg p-2 hover:bg-gray-100"
                    >
                        <X size={20} />
                    </button>

                </div>

                {/* Body */}

                <div className="space-y-6 overflow-y-auto p-5">

                    {/* Statistics */}

                    <div className="grid grid-cols-2 gap-4">

                        <Card
                            icon={<BookOpen size={20} />}
                            title="Remaining"
                            value="4,692"
                            color="bg-green-100 text-green-700"
                        />

                        <Card
                            icon={<FileText size={20} />}
                            title="Used"
                            value="9,842"
                            color="bg-blue-100 text-blue-700"
                        />

                        <Card
                            icon={<TriangleAlert size={20} />}
                            title="Near Empty"
                            value="12"
                            color="bg-yellow-100 text-yellow-700"
                        />

                        <Card
                            icon={<Bell size={20} />}
                            title="Alerts"
                            value="47"
                            color="bg-red-100 text-red-700"
                        />

                    </div>

                    {/* Alerts */}

                    <SectionTitle title="Recent Alerts" />

                    <Alert
                        color="red"
                        title="AF56 Booklet #00320"
                        desc="Only 1 receipt remaining."
                    />

                    <Alert
                        color="yellow"
                        title="AF51 Booklet #00125"
                        desc="Only 5 receipts remaining."
                    />

                    <Alert
                        color="green"
                        title="AF56 Booklet #00288"
                        desc="New booklet registered."
                    />

                    {/* Quick Actions */}

                    <SectionTitle title="Quick Actions" />

                    <div className="grid grid-cols-2 gap-3">

                        <ActionButton
                            text="View Booklets"
                        />

                        <ActionButton
                            text="Remaining Report"
                        />

                        <ActionButton
                            text="Search Receipt"
                        />

                        <ActionButton
                            text="Print Summary"
                        />

                    </div>

                </div>

            </div>

        </>
    );

}

type CardProps = {
    icon: React.ReactNode;
    title: string;
    value: string;
    color: string;
};

function Card({
    icon,
    title,
    value,
    color,
}: CardProps) {

    return (

        <div className="rounded-xl border p-4">

            <div className="mb-3 flex justify-between">

                <div className={`rounded-lg p-2 ${color}`}>
                    {icon}
                </div>

            </div>

            <p className="text-sm text-slate-500">
                {title}
            </p>

            <h2 className="mt-1 text-2xl font-bold">
                {value}
            </h2>

        </div>

    );

}

function SectionTitle({
    title,
}: {
    title: string;
}) {

    return (
        <h3 className="border-b pb-2 text-lg font-semibold">
            {title}
        </h3>
    );

}

function Alert({
    color,
    title,
    desc,
}: {
    color: "red" | "yellow" | "green";
    title: string;
    desc: string;
}) {

    const bg =
        color === "red"
            ? "border-red-200 bg-red-50"
            : color === "yellow"
            ? "border-yellow-200 bg-yellow-50"
            : "border-green-200 bg-green-50";

    return (

        <div className={`rounded-xl border p-4 ${bg}`}>

            <p className="font-semibold">
                {title}
            </p>

            <p className="mt-1 text-sm text-slate-600">
                {desc}
            </p>

        </div>

    );

}

function ActionButton({
    text,
}: {
    text: string;
}) {

    return (

        <button
            className="
                rounded-xl
                border
                p-3
                text-sm
                font-medium
                transition
                hover:bg-blue-50
                hover:border-blue-300
            "
        >
            {text}
        </button>

    );

}