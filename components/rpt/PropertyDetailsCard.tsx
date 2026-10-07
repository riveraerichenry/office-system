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
    /* ================================================================
        FORMAT CURRENCY
    ================================================================ */

    const formatCurrency = (
        value: number | string | null | undefined
    ) => {
        const amount = Number(value || 0);

        return `₱${amount.toLocaleString("en-PH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    /* ================================================================
        FORMAT NUMBER
    ================================================================ */

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

    /* ================================================================
        QUARTER LABEL
    ================================================================ */

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
        <div
            className="
                group
                overflow-hidden
                rounded-2xl
                border
                border-slate-200
                bg-white
                shadow-[0_10px_35px_rgba(0,0,0,0.06)]
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-[0_18px_45px_rgba(0,0,0,0.10)]
            "
        >
            {/* =========================================================
                HEADER
            ========================================================= */}

            <div
                className="
                    relative
                    overflow-hidden
                    border-b
                    border-blue-700
                    bg-blue-600
                    px-5
                    py-5
                    text-white
                    sm:px-6
                "
            >
                {/* Decorative circles */}

                <div
                    className="
                        absolute
                        -right-10
                        -top-16
                        h-40
                        w-40
                        rounded-full
                        bg-white/[0.08]
                    "
                />

                <div
                    className="
                        absolute
                        -bottom-20
                        right-24
                        h-32
                        w-32
                        rounded-full
                        bg-orange-400/[0.10]
                    "
                />

                <div
                    className="
                        relative
                        flex
                        flex-col
                        gap-4
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                    "
                >
                    {/* TITLE */}

                    <div className="flex items-center gap-3">
                        <div
                            className="
                                flex
                                h-11
                                w-11
                                items-center
                                justify-center
                                rounded-xl
                                bg-white/15
                                ring-1
                                ring-white/20
                            "
                        >
                            <FileText size={21} />
                        </div>

                        <div>
                            <h2
                                className="
                                    text-lg
                                    font-bold
                                    tracking-tight
                                "
                            >
                                Property Details
                            </h2>

                            <p
                                className="
                                    mt-0.5
                                    text-xs
                                    text-blue-100
                                "
                            >
                                FAAS property information
                            </p>
                        </div>
                    </div>

                    {/* CLEAR */}

                    <button
                        type="button"
                        onClick={onClear}
                        className="
                            inline-flex
                            items-center
                            gap-1.5
                            self-start
                            rounded-lg
                            border
                            border-white/20
                            bg-white/10
                            px-3
                            py-2
                            text-xs
                            font-semibold
                            text-white
                            transition-all
                            hover:bg-white/20
                            sm:self-auto
                        "
                    >
                        <X size={14} />

                        Clear
                    </button>
                </div>
            </div>

            {/* =========================================================
                BODY
            ========================================================= */}

            <div className="p-5 sm:p-6">

                {/* =====================================================
                    OWNER INFORMATION
                ===================================================== */}

                <FloatingSection
                    icon={<User size={17} />}
                    title="Owner Information"
                >
                    <div
                        className="
                            grid
                            grid-cols-1
                            gap-4
                            md:grid-cols-2
                        "
                    >
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

                {/* =====================================================
                    PROPERTY IDENTIFICATION
                ===================================================== */}

                <FloatingSection
                    icon={<MapPin size={17} />}
                    title="Property Identification"
                    className="mt-5"
                >
                    <div
                        className="
                            grid
                            grid-cols-1
                            gap-3
                            sm:grid-cols-2
                            lg:grid-cols-3
                        "
                    >
                        <HighlightItem
                            label="TD Number"
                            value={property.tdno}
                            accent="orange"
                        />

                        <HighlightItem
                            label="PIN"
                            value={
                                property.fullpin ||
                                property.pin
                            }
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

                {/* =====================================================
                    CLASSIFICATION
                ===================================================== */}

                <FloatingSection
                    icon={<Building2 size={17} />}
                    title="Classification"
                    className="mt-5"
                >
                    <div
                        className="
                            grid
                            grid-cols-1
                            gap-4
                            sm:grid-cols-2
                            lg:grid-cols-4
                        "
                    >
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

                {/* =====================================================
                    PROPERTY DETAILS
                ===================================================== */}

                <FloatingSection
                    icon={<MapPin size={17} />}
                    title="Property Details"
                    className="mt-5"
                >
                    <div
                        className="
                            grid
                            grid-cols-1
                            gap-4
                            sm:grid-cols-2
                            lg:grid-cols-4
                        "
                    >
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

                {/* =====================================================
                    VALUATION
                ===================================================== */}

                <div className="mt-5">
                    <div
                        className="
                            mb-3
                            flex
                            items-center
                            gap-2
                        "
                    >
                        <div
                            className="
                                flex
                                h-8
                                w-8
                                items-center
                                justify-center
                                rounded-lg
                                bg-blue-50
                                text-blue-600
                            "
                        >
                            <Calculator size={16} />
                        </div>

                        <div>
                            <h3
                                className="
                                    text-sm
                                    font-bold
                                    text-slate-900
                                "
                            >
                                Property Valuation
                            </h3>

                            <p
                                className="
                                    text-[11px]
                                    text-slate-400
                                "
                            >
                                Current FAAS valuation
                            </p>
                        </div>
                    </div>

                    <div
                        className="
                            grid
                            grid-cols-1
                            gap-4
                            sm:grid-cols-3
                        "
                    >
                        {/* MARKET VALUE */}

                        <ValueCard
                            label="Market Value"
                            value={formatCurrency(
                                property.totalmv
                            )}
                            description="Total market valuation"
                            accent="blue"
                        />

                        {/* ASSESSED VALUE */}

                        <ValueCard
                            label="Assessed Value"
                            value={formatCurrency(
                                property.totalav
                            )}
                            description="Taxable assessment"
                            accent="orange"
                        />

                        {/* STATUS */}

                        <div
                            className="
                                relative
                                overflow-hidden
                                rounded-2xl
                                border
                                border-slate-200
                                bg-white
                                p-5
                                shadow-sm
                                transition-all
                                duration-300
                                hover:-translate-y-1
                                hover:shadow-lg
                            "
                        >
                            <div
                                className="
                                    absolute
                                    right-4
                                    top-4
                                    h-2.5
                                    w-2.5
                                    rounded-full
                                    bg-blue-600
                                    shadow-[0_0_0_4px_rgba(37,99,235,0.10)]
                                "
                            />

                            <p
                                className="
                                    text-[10px]
                                    font-bold
                                    uppercase
                                    tracking-[0.12em]
                                    text-slate-400
                                "
                            >
                                Status
                            </p>

                            <p
                                className="
                                    mt-2
                                    text-xl
                                    font-bold
                                    tracking-tight
                                    text-slate-900
                                "
                            >
                                {property.state || "ACTIVE"}
                            </p>

                            <p
                                className="
                                    mt-2
                                    text-[10px]
                                    font-medium
                                    text-slate-400
                                "
                            >
                                FAAS account status
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| FLOATING SECTION
|--------------------------------------------------------------------------
*/

function FloatingSection({
    icon,
    title,
    children,
    className = "",
}: {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={`
                rounded-2xl
                border
                border-slate-200/80
                bg-slate-50/70
                p-4
                shadow-sm
                transition-all
                duration-300
                hover:border-blue-200
                hover:bg-white
                hover:shadow-md
                ${className}
            `}
        >
            <div
                className="
                    mb-4
                    flex
                    items-center
                    gap-2.5
                "
            >
                <div
                    className="
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-lg
                        bg-blue-600
                        text-white
                        shadow-sm
                    "
                >
                    {icon}
                </div>

                <h3
                    className="
                        text-sm
                        font-bold
                        text-slate-900
                    "
                >
                    {title}
                </h3>
            </div>

            {children}
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| VALUE CARD
|--------------------------------------------------------------------------
*/

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
            className={`
                relative
                overflow-hidden
                rounded-2xl
                border
                p-5
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-lg
                ${
                    isOrange
                        ? "border-orange-200 bg-orange-50 hover:shadow-orange-500/10"
                        : "border-blue-100 bg-blue-50 hover:shadow-blue-600/10"
                }
            `}
        >
            <div
                className="
                    absolute
                    -right-6
                    -top-6
                    h-20
                    w-20
                    rounded-full
                    bg-white/70
                "
            />

            <div className="relative">
                <p
                    className={`
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.12em]
                        ${
                            isOrange
                                ? "text-orange-600"
                                : "text-blue-600"
                        }
                    `}
                >
                    {label}
                </p>

                <p
                    className="
                        mt-2
                        text-xl
                        font-bold
                        tracking-tight
                        text-slate-900
                    "
                >
                    {value}
                </p>

                <p
                    className="
                        mt-2
                        text-[10px]
                        font-medium
                        text-slate-500
                    "
                >
                    {description}
                </p>
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| HIGHLIGHT ITEM
|--------------------------------------------------------------------------
*/

function HighlightItem({
    label,
    value,
    accent = "blue",
}: {
    label: string;
    value:
        | string
        | number
        | null
        | undefined;
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
        <div
            className="
                group/item
                relative
                overflow-hidden
                rounded-xl
                border
                border-slate-200
                bg-white
                p-4
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:shadow-sm
            "
        >
            <div
                className={`
                    absolute
                    left-0
                    top-0
                    h-full
                    w-1
                    ${
                        isOrange
                            ? "bg-orange-500"
                            : "bg-blue-600"
                    }
                    opacity-0
                    transition-opacity
                    duration-200
                    group-hover/item:opacity-100
                `}
            />

            <p
                className={`
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.1em]
                    ${
                        isOrange
                            ? "text-orange-500"
                            : "text-blue-500"
                    }
                `}
            >
                {label}
            </p>

            <p
                className="
                    mt-1.5
                    break-words
                    text-base
                    font-bold
                    tracking-tight
                    text-slate-900
                "
            >
                {displayValue}
            </p>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| DETAIL ITEM
|--------------------------------------------------------------------------
*/

function DetailItem({
    label,
    value,
    prominent = false,
}: {
    label: string;
    value:
        | string
        | number
        | null
        | undefined;
    prominent?: boolean;
}) {
    return (
        <div
            className="
                min-w-0
                rounded-xl
                border
                border-transparent
                p-2
                transition-all
                duration-200
                hover:border-slate-200
                hover:bg-white
            "
        >
            <p
                className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.1em]
                    text-slate-400
                "
            >
                {label}
            </p>

            <p
                className={`
                    mt-1
                    break-words
                    ${
                        prominent
                            ? "text-sm font-bold text-slate-900"
                            : "text-sm font-medium text-slate-700"
                    }
                `}
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