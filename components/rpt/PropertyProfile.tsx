"use client";

import {
    Building2,
    FileText,
    Home,
    Landmark,
    MapPin,
    User,
} from "lucide-react";

type Props = {
    property: any;
};

function money(value: any) {
    return `₱${Number(value || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

function number(value: any) {
    return Number(value || 0).toLocaleString();
}

export default function PropertyProfile({
    property,
}: Props) {
    return (
        <div className="rounded-xl border bg-white shadow-sm">

            <div className="flex items-center justify-between border-b p-6">

                <div>

                    <h2 className="text-2xl font-bold">
                        Property Information
                    </h2>

                    <p className="text-gray-500">
                        Selected Real Property
                    </p>

                </div>

                <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
                    {property.state}
                </span>

            </div>

            <div className="grid gap-6 p-6 lg:grid-cols-2">

                <Card
                    icon={<User size={18} />}
                    title="Registered Owner"
                    value={property.owner_name}
                />

                <Card
                    icon={<MapPin size={18} />}
                    title="Owner Address"
                    value={property.owner_address}
                />

                <Card
                    icon={<FileText size={18} />}
                    title="Tax Declaration Number"
                    value={property.tdno}
                />

                <Card
                    icon={<FileText size={18} />}
                    title="Property Identification Number"
                    value={property.fullpin}
                />

                <Card
                    icon={<Home size={18} />}
                    title="Barangay"
                    value={property.barangay_name}
                />

                <Card
                    icon={<Building2 size={18} />}
                    title="Property Classification"
                    value={property.classification_name}
                />

                <Card
                    icon={<Landmark size={18} />}
                    title="Property Type"
                    value={property.rputype?.toUpperCase()}
                />

                <Card
                    icon={<Landmark size={18} />}
                    title="Area"
                    value={`${number(property.totalareasqm)} sqm`}
                />

                <Card
                    icon={<Landmark size={18} />}
                    title="Market Value"
                    value={money(property.totalmv)}
                />

                <Card
                    icon={<Landmark size={18} />}
                    title="Assessed Value"
                    value={money(property.totalav)}
                />

            </div>

            <div className="border-t bg-gray-50 p-6">

                <div className="flex flex-wrap gap-3">

                    <button
                        className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
                    >
                        Create Billing
                    </button>

                    <button
                        className="rounded-lg border px-6 py-3 hover:bg-gray-100"
                    >
                        Assessment Details
                    </button>

                    <button
                        className="rounded-lg border px-6 py-3 hover:bg-gray-100"
                    >
                        Property Ledger
                    </button>

                    <button
                        className="rounded-lg border px-6 py-3 hover:bg-gray-100"
                    >
                        Print Property Profile
                    </button>

                </div>

            </div>

        </div>
    );
}

function Card({
    icon,
    title,
    value,
}: {
    icon: React.ReactNode;
    title: string;
    value: any;
}) {
    return (
        <div className="rounded-xl border p-5">

            <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">

                {icon}

                {title}

            </div>

            <div className="break-words text-lg font-semibold">

                {value || "-"}

            </div>

        </div>
    );
}