"use client";

import {
    FileText,
    MapPin,
    User,
    Building2,
    Calculator,
    X,
} from "lucide-react";

export type Property = {
    objid: string;
    state: string;
    rpuid: string;
    utdno: string;
    tdno: string;
    txntype_objid: string;
    effectivityyear: number;
    effectivityqtr: number;
    taxpayer_objid: string | null;
    owner_name: string | null;
    owner_address: string | null;
    prevtdno: string | null;
    cancelreason: string | null;
    cancelledbytdnos: string | null;
    lguid: string;
    realpropertyid: string;
    fullpin: string;
    originlguid: string;
    taxpayer_name: string | null;
    taxpayer_address: string | null;
    classification_code: string | null;
    classcode: string | null;
    classification_name: string | null;
    classname: string | null;
    ry: number;
    rputype: string;
    totalmv: number;
    totalav: number;
    totalareasqm: number;
    totalareaha: number;
    barangayid: string;
    cadastrallotno: string | null;
    blockno: string | null;
    surveyno: string | null;
    pin: string;
    barangay_name: string;
    trackingno: string | null;
};

type Props = {
    property: Property;
    onClear: () => void;
};

export default function PropertyDetailsCard({
    property,
    onClear,
}: Props) {
    /* FORMAT CURRENCY */
    const formatCurrency = (
        value: number | string | null | undefined
    ) => {
        const amount = Number(value || 0);

        return `₱${amount.toLocaleString("en-PH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    /* FORMAT NUMBER */
    const formatNumber = (
        value: number | string | null | undefined,
        decimals = 2
    ) => {
        const amount = Number(value || 0);

        return amount.toLocaleString("en-PH", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        });
    };

    /* QUARTER LABEL */
    const getQuarterLabel = (
        quarter: number | string | null | undefined
    ) => {
        switch (Number(quarter)) {
            case 1:
                return "1st Quarter";
            case 2:
                return "2nd Quarter";
            case 3:
                return "3rd Quarter";
            case 4:
                return "4th Quarter";
            default:
                return "-";
        }
    };

    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {/* HEADER */}
            <div className="relative overflow-hidden border-b border-blue-700 bg-blue-600 px-4 py-3 text-white">
                <div className="pointer-events-none absolute -right-8 -top-12 h-28 w-28 rounded-full bg-white/[0.08]" />
                <div className="pointer-events-none absolute -bottom-14 right-20 h-24 w-24 rounded-full bg-orange-400/[0.10]" />

                <div className="relative flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/20">
                            <FileText size={19} />
                        </div>

                        <div className="min-w-0">
                            <h2 className="text-base font-bold tracking-tight">
                                Property Details
                            </h2>
                            <p className="text-[11px] text-blue-100">
                                FAAS property information
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClear}
                        className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-white/20 bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
                    >
                        <X size={13} />
                        Clear
                    </button>
                </div>
            </div>

            {/* BODY */}
            <div className="space-y-3 p-3 sm:p-4">
                {/* OWNER INFORMATION */}
                <FloatingSection
                    icon={<User size={15} />}
                    title="Owner Information"
                >
                    <div className="grid grid-cols-1 gap-x-3 gap-y-1 sm:grid-cols-2">
                        <DetailItem
                            label="Owner Name"
                            value={property.owner_name}
                            prominent
                        />
                        <DetailItem
                            label="Owner Address"
                            value={property.owner_address}
                        />
                        <DetailItem
                            label="Taxpayer Name"
                            value={property.taxpayer_name}
                        />
                        <DetailItem
                            label="Taxpayer Address"
                            value={property.taxpayer_address}
                        />
                    </div>
                </FloatingSection>

                {/* PROPERTY IDENTIFICATION */}
                <FloatingSection
                    icon={<MapPin size={15} />}
                    title="Property Identification"
                >
                    <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                        <HighlightItem
                            label="TD Number"
                            value={property.tdno}
                            accent="orange"
                        />
                        <HighlightItem
                            label="PIN"
                            value={property.fullpin || property.pin}
                            accent="blue"
                        />
                        <DetailItem
                            label="Previous TD No."
                            value={property.prevtdno}
                        />
                        <DetailItem
                            label="UTD No."
                            value={property.utdno}
                        />
                        <DetailItem
                            label="RPUID"
                            value={property.rpuid}
                        />
                        <DetailItem
                            label="Real Property ID"
                            value={property.realpropertyid}
                        />
                        <DetailItem
                            label="RPU Type"
                            value={property.rputype}
                        />
                        <DetailItem
                            label="Barangay"
                            value={property.barangay_name}
                        />
                        <DetailItem
                            label="Tracking No."
                            value={property.trackingno}
                        />
                    </div>
                </FloatingSection>

                {/* CLASSIFICATION */}
                <FloatingSection
                    icon={<Building2 size={15} />}
                    title="Classification"
                >
                    <div className="grid grid-cols-1 gap-x-3 gap-y-1 sm:grid-cols-2 lg:grid-cols-4">
                        <DetailItem
                            label="Classification"
                            value={
                                property.classification_name ||
                                property.classname
                            }
                            prominent
                        />
                        <DetailItem
                            label="Classification Code"
                            value={
                                property.classification_code ||
                                property.classcode
                            }
                        />
                        <DetailItem
                            label="Effectivity Year"
                            value={property.effectivityyear}
                        />
                        <DetailItem
                            label="Effectivity Quarter"
                            value={getQuarterLabel(
                                property.effectivityqtr
                            )}
                        />
                        <DetailItem
                            label="Revision Year"
                            value={property.ry}
                        />
                        <DetailItem
                            label="Transaction Type"
                            value={property.txntype_objid}
                        />
                    </div>
                </FloatingSection>

                {/* PROPERTY DETAILS */}
                <FloatingSection
                    icon={<MapPin size={15} />}
                    title="Property Details"
                >
                    <div className="grid grid-cols-1 gap-x-3 gap-y-1 sm:grid-cols-2 lg:grid-cols-4">
                        <DetailItem
                            label="Total Area"
                            value={`${formatNumber(
                                property.totalareasqm,
                                6
                            )} sqm`}
                        />
                        <DetailItem
                            label="Total Area"
                            value={`${formatNumber(
                                property.totalareaha,
                                6
                            )} ha`}
                        />
                        <DetailItem
                            label="Cadastral Lot No."
                            value={property.cadastrallotno}
                        />
                        <DetailItem
                            label="Block No."
                            value={property.blockno}
                        />
                        <DetailItem
                            label="Survey No."
                            value={property.surveyno}
                        />
                        <DetailItem
                            label="Barangay ID"
                            value={property.barangayid}
                        />
                        <DetailItem
                            label="FAAS Object ID"
                            value={property.objid}
                        />
                        <DetailItem
                            label="State"
                            value={property.state}
                        />
                    </div>
                </FloatingSection>

                {/* VALUATION */}
                <section>
                    <div className="mb-2 flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                            <Calculator size={15} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">
                                Property Valuation
                            </h3>
                            <p className="text-[10px] text-slate-400">
                                Current FAAS valuation
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        <ValueCard
                            label="Market Value"
                            value={formatCurrency(property.totalmv)}
                            description="Total market valuation"
                            accent="blue"
                        />

                        <ValueCard
                            label="Assessed Value"
                            value={formatCurrency(property.totalav)}
                            description="Taxable assessment"
                            accent="orange"
                        />

                        {/* STATUS */}
                        <div className="relative rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                            <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-blue-600 ring-4 ring-blue-100" />

                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Status
                            </p>

                            <p className="mt-1.5 break-words text-lg font-bold tracking-tight text-slate-900">
                                {property.state || "ACTIVE"}
                            </p>

                            <p className="mt-1 text-[10px] text-slate-400">
                                FAAS account status
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

/* FLOATING SECTION */
function FloatingSection({
    icon,
    title,
    children,
}: {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 transition-colors hover:bg-white">
            <div className="mb-2.5 flex items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
                    {icon}
                </div>

                <h3 className="text-xs font-bold text-slate-900">
                    {title}
                </h3>
            </div>

            {children}
        </section>
    );
}

/* VALUE CARD */
function ValueCard({
    label,
    value,
    description,
    accent,
}: {
    label: string;
    value: string;
    description: string;
    accent: "blue" | "orange";
}) {
    const isOrange = accent === "orange";

    return (
        <div
            className={`relative overflow-hidden rounded-xl border p-3 ${
                isOrange
                    ? "border-orange-200 bg-orange-50"
                    : "border-blue-100 bg-blue-50"
            }`}
        >
            <div className="absolute -right-5 -top-5 h-16 w-16 rounded-full bg-white/70" />

            <div className="relative">
                <p
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                        isOrange
                            ? "text-orange-600"
                            : "text-blue-600"
                    }`}
                >
                    {label}
                </p>

                <p className="mt-1.5 break-words text-lg font-bold tracking-tight text-slate-900">
                    {value}
                </p>

                <p className="mt-1 text-[10px] font-medium text-slate-500">
                    {description}
                </p>
            </div>
        </div>
    );
}

/* HIGHLIGHT ITEM */
function HighlightItem({
    label,
    value,
    accent = "blue",
}: {
    label: string;
    value: string | number | null | undefined;
    accent?: "blue" | "orange";
}) {
    const displayValue =
        value !== null &&
        value !== undefined &&
        String(value).trim() !== ""
            ? String(value)
            : "-";

    const isOrange = accent === "orange";

    return (
        <div className="relative min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2">
            <div
                className={`absolute bottom-0 left-0 top-0 w-1 rounded-l-lg ${
                    isOrange ? "bg-orange-500" : "bg-blue-600"
                }`}
            />

            <p
                className={`text-[10px] font-bold uppercase tracking-wider ${
                    isOrange ? "text-orange-500" : "text-blue-500"
                }`}
            >
                {label}
            </p>

            <p className="mt-1 break-words text-sm font-bold tracking-tight text-slate-900">
                {displayValue}
            </p>
        </div>
    );
}

/* DETAIL ITEM */
function DetailItem({
    label,
    value,
    prominent = false,
}: {
    label: string;
    value: string | number | null | undefined;
    prominent?: boolean;
}) {
    return (
        <div className="min-w-0 rounded-lg px-2 py-1.5 transition-colors hover:bg-white">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {label}
            </p>

            <p
                className={`mt-0.5 break-words ${
                    prominent
                        ? "text-sm font-bold text-slate-900"
                        : "text-xs font-medium text-slate-700"
                }`}
            >
                {value !== null &&
                value !== undefined &&
                String(value).trim() !== ""
                    ? String(value)
                    : "-"}
            </p>
        </div>
    );
}