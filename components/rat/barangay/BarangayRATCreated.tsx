"use client";

import { Fragment, useEffect, useState } from "react";
import axios from "axios";
import {
    ChevronDown,
    ChevronRight,
    Eye,
    RefreshCw,
} from "lucide-react";

type Props = {
    refreshKey: number;
};

type RATRecord = {
    id: string;
    rat_no: string;
    status: string;
    remarks: string | null;
    generated_at: string;
    completed_at: string | null;
    created_at: string;

    barangay_user: {
        id: string;
        username: string;
        full_name: string;
    };

    barangay: {
        id: string | null;
        code: string | null;
        name: string | null;
        municipality: string | null;
        province: string | null;
    };

    booklet_count: number;

    // These are expected if returned by the API.
    beginning_or?: number | null;
    ending_or?: number | null;
};

type RATItem = {
    id: string;
    rat_id: string;
    booklet_id: string;
    issued_at: string | null;
    remarks: string | null;
    created_at: string;

    control_no: string | null;
    accountable_form_id: string;
    fiscal_year: number;
    series: string | null;
    beginning_or: number;
    ending_or: number;
    receipt_count: number;
    current_or: number;
    status: string | null;
    received_date: string | null;
    issued_date: string | null;
    supplier: string | null;
    is_active: boolean;
};

type RATDetails = {
    rat: {
        id: string;
        rat_no: string;
        status: string;
        remarks: string | null;
        generated_at: string;
        completed_at: string | null;
        created_at: string;

        barangay_user: {
            id: string;
            username: string;
            full_name: string;
            email: string | null;
        };

        barangay: {
            id: string | null;
            code: string | null;
            name: string | null;
            municipality: string | null;
            province: string | null;
        };
    };

    items: RATItem[];
};

export default function BarangayRATCreated({
    refreshKey,
}: Props) {
    const [rats, setRats] = useState<RATRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [expandedId, setExpandedId] =
        useState<string | null>(null);

    const [details, setDetails] =
        useState<RATDetails | null>(null);

    const [loadingDetails, setLoadingDetails] =
        useState(false);

    useEffect(() => {
        loadRATs();
    }, [refreshKey]);

    async function loadRATs() {
        try {
            setLoading(true);
            setError("");

            const response = await axios.get(
                "/api/barangay-rat"
            );

            if (response.data?.success) {
                setRats(
                    response.data.rats ?? []
                );
            } else {
                setError(
                    response.data?.message ??
                        "Failed to load RAT records."
                );
            }
        } catch (error) {
            console.error(
                "Load Barangay RAT error:",
                error
            );

            setError(
                "Failed to load RAT records."
            );
        } finally {
            setLoading(false);
        }
    }

    async function handleView(
        ratId: string
    ) {
        if (expandedId === ratId) {
            setExpandedId(null);
            setDetails(null);
            return;
        }

        try {
            setExpandedId(ratId);
            setDetails(null);
            setLoadingDetails(true);
            setError("");

            const response = await axios.get(
                `/api/barangay-rat/${ratId}`
            );

            if (response.data?.success) {
                setDetails({
                    rat: response.data.rat,
                    items:
                        response.data.items ?? [],
                });
            } else {
                setError(
                    response.data?.message ??
                        "Failed to load RAT details."
                );
            }
        } catch (error) {
            console.error(
                "Load RAT details error:",
                error
            );

            setError(
                "Failed to load RAT details."
            );

            setExpandedId(null);
        } finally {
            setLoadingDetails(false);
        }
    }

    function formatDate(
        value: string | null
    ) {
        if (!value) {
            return "—";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "—";
        }

        return date.toLocaleDateString(
            "en-PH",
            {
                year: "numeric",
                month: "short",
                day: "2-digit",
            }
        );
    }

    function formatDateTime(
        value: string | null
    ) {
        if (!value) {
            return "—";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "—";
        }

        return date.toLocaleString(
            "en-PH",
            {
                year: "numeric",
                month: "short",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
            }
        );
    }

    function getStatusClass(
        status: string | null
    ) {
        switch (
            status?.toUpperCase()
        ) {
            case "ACTIVE":
                return "bg-green-100 text-green-700";

            case "COMPLETED":
                return "bg-blue-100 text-blue-700";

            case "CANCELLED":
                return "bg-red-100 text-red-700";

            case "CREATED":
                return "bg-amber-100 text-amber-700";

            default:
                return "bg-slate-100 text-slate-600";
        }
    }

    function getORRange(
        rat: RATRecord
    ) {
        if (
            rat.beginning_or !== null &&
            rat.beginning_or !== undefined &&
            rat.ending_or !== null &&
            rat.ending_or !== undefined
        ) {
            return `${rat.beginning_or} - ${rat.ending_or}`;
        }

        return "—";
    }

    function getDetailsORRange() {
        if (
            !details ||
            details.items.length === 0
        ) {
            return "—";
        }

        const beginningValues =
            details.items
                .map(
                    (item) =>
                        Number(
                            item.beginning_or
                        )
                )
                .filter(
                    (value) =>
                        !Number.isNaN(value)
                );

        const endingValues =
            details.items
                .map(
                    (item) =>
                        Number(
                            item.ending_or
                        )
                )
                .filter(
                    (value) =>
                        !Number.isNaN(value)
                );

        if (
            beginningValues.length === 0 ||
            endingValues.length === 0
        ) {
            return "—";
        }

        const beginning = Math.min(
            ...beginningValues
        );

        const ending = Math.max(
            ...endingValues
        );

        return `${beginning} - ${ending}`;
    }

    return (
        <div className="w-full min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {/* Header */}
            <div className="flex min-w-0 items-center justify-between border-b border-slate-200 px-4 py-4">
                <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-slate-800">
                        Created RAT
                    </h2>

                    <p className="mt-1 truncate text-sm text-slate-500">
                        Previously created Barangay RAT records.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={loadRATs}
                    disabled={loading}
                    title="Refresh"
                    className="ml-3 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-300 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <RefreshCw
                        size={17}
                        className={
                            loading
                                ? "animate-spin"
                                : ""
                        }
                    />
                </button>
            </div>

            <div className="min-w-0 p-4">
                {/* Error */}
                {error && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">
                        {error}
                    </div>
                )}

                {/* Loading */}
                {loading ? (
                    <div className="flex items-center justify-center py-10">
                        <div className="flex items-center gap-3 text-sm text-slate-500">
                            <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
                            Loading RAT records...
                        </div>
                    </div>
                ) : rats.length === 0 ? (
                    /* Empty */
                    <div className="rounded-lg border border-dashed border-slate-300 px-4 py-10 text-center">
                        <div className="text-sm font-medium text-slate-600">
                            No Barangay RAT records found.
                        </div>

                        <div className="mt-1 text-xs text-slate-400">
                            Created RAT records will appear here.
                        </div>
                    </div>
                ) : (
                    /*
                     * No overflow-x-auto here.
                     * The table uses fixed proportions so it stays
                     * inside the 4-column card.
                     */
                    <div className="w-full min-w-0">
                        <table className="w-full table-fixed">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 text-left">
                                    <th className="w-[34%] px-2 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                                        OR Range
                                    </th>

                                    <th className="w-[30%] px-2 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                                        Barangay
                                    </th>

                                    <th className="w-[26%] px-2 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                                        Date
                                    </th>

                                    <th className="w-[10%] px-1 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">
                                        View
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {rats.map(
                                    (
                                        rat,
                                        index
                                    ) => {
                                        const isExpanded =
                                            expandedId ===
                                            rat.id;

                                        return (
                                            <Fragment
                                                key={
                                                    rat.id
                                                }
                                            >
                                                <tr
                                                    className={`border-b border-slate-100 transition ${
                                                        isExpanded
                                                            ? "bg-blue-50/50"
                                                            : "hover:bg-slate-50"
                                                    }`}
                                                >
                                                    {/* OR RANGE */}
                                                    <td className="px-2 py-3">
                                                        <div className="truncate text-sm font-semibold text-slate-800">
                                                            {getORRange(
                                                                rat
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* BARANGAY */}
                                                    <td className="px-2 py-3">
                                                        <div
                                                            className="truncate text-sm font-medium text-slate-800"
                                                            title={
                                                                rat
                                                                    .barangay
                                                                    .name ??
                                                                ""
                                                            }
                                                        >
                                                            {rat
                                                                .barangay
                                                                .name ??
                                                                "—"}
                                                        </div>
                                                    </td>

                                                    {/* DATE */}
                                                    <td className="px-2 py-3">
                                                        <div className="whitespace-nowrap text-sm text-slate-600">
                                                            {formatDate(
                                                                rat.generated_at
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* VIEW */}
                                                    <td className="px-1 py-3 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleView(
                                                                    rat.id
                                                                )
                                                            }
                                                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-blue-600 transition hover:bg-blue-100"
                                                            title={
                                                                isExpanded
                                                                    ? "Hide details"
                                                                    : "View details"
                                                            }
                                                        >
                                                            {isExpanded ? (
                                                                <ChevronDown
                                                                    size={
                                                                        17
                                                                    }
                                                                />
                                                            ) : (
                                                                <Eye
                                                                    size={
                                                                        17
                                                                    }
                                                                />
                                                            )}
                                                        </button>
                                                    </td>
                                                </tr>

                                                {/* DETAILS */}
                                                {isExpanded && (
                                                    <tr>
                                                        <td
                                                            colSpan={
                                                                4
                                                            }
                                                            className="border-b border-slate-200 bg-slate-50 p-3"
                                                        >
                                                            {loadingDetails ? (
                                                                <div className="flex items-center justify-center py-6 text-sm text-slate-500">
                                                                    <span className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
                                                                    Loading RAT details...
                                                                </div>
                                                            ) : details ? (
                                                                <div className="space-y-3">
                                                                    {/* Summary */}
                                                                    <div className="grid grid-cols-1 gap-3">
                                                                        <div className="rounded-lg border border-slate-200 bg-white p-3">
                                                                            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                                                                OR Range
                                                                            </div>

                                                                            <div className="mt-1 text-sm font-semibold text-slate-800">
                                                                                {getDetailsORRange()}
                                                                            </div>
                                                                        </div>

                                                                        <div className="rounded-lg border border-slate-200 bg-white p-3">
                                                                            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                                                                Barangay
                                                                            </div>

                                                                            <div className="mt-1 text-sm font-semibold text-slate-800">
                                                                                {details
                                                                                    .rat
                                                                                    .barangay
                                                                                    .name ??
                                                                                    "—"}
                                                                            </div>
                                                                        </div>

                                                                        <div className="rounded-lg border border-slate-200 bg-white p-3">
                                                                            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                                                                Date
                                                                            </div>

                                                                            <div className="mt-1 text-sm font-semibold text-slate-800">
                                                                                {formatDateTime(
                                                                                    details
                                                                                        .rat
                                                                                        .generated_at
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Booklets */}
                                                                    <div className="rounded-lg border border-slate-200 bg-white">
                                                                        <div className="flex items-center gap-2 border-b border-slate-200 px-3 py-2.5">
                                                                            <ChevronRight
                                                                                size={
                                                                                    17
                                                                                }
                                                                                className="text-blue-600"
                                                                            />

                                                                            <h3 className="text-sm font-semibold text-slate-800">
                                                                                Booklets
                                                                            </h3>

                                                                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                                                                                {
                                                                                    details
                                                                                        .items
                                                                                        .length
                                                                                }
                                                                            </span>
                                                                        </div>

                                                                        <div className="divide-y divide-slate-100">
                                                                            {details.items.map(
                                                                                (
                                                                                    item,
                                                                                    itemIndex
                                                                                ) => (
                                                                                    <div
                                                                                        key={
                                                                                            item.id
                                                                                        }
                                                                                        className="grid grid-cols-[24px_1fr] gap-2 px-3 py-2.5"
                                                                                    >
                                                                                        <div className="text-xs text-slate-400">
                                                                                            {itemIndex +
                                                                                                1}
                                                                                        </div>

                                                                                        <div className="min-w-0">
                                                                                            <div className="truncate text-sm font-medium text-slate-800">
                                                                                                {item.control_no ??
                                                                                                    "—"}
                                                                                            </div>

                                                                                            <div className="mt-0.5 text-xs text-slate-500">
                                                                                                OR{" "}
                                                                                                {
                                                                                                    item.beginning_or
                                                                                                }{" "}
                                                                                                -{" "}
                                                                                                {
                                                                                                    item.ending_or
                                                                                                }
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                )
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    {/* Remarks */}
                                                                    {details
                                                                        .rat
                                                                        .remarks && (
                                                                        <div className="rounded-lg border border-slate-200 bg-white p-3">
                                                                            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                                                                Remarks
                                                                            </div>

                                                                            <div className="mt-1 text-sm text-slate-700">
                                                                                {
                                                                                    details
                                                                                        .rat
                                                                                        .remarks
                                                                                }
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <div className="py-6 text-center text-sm text-slate-500">
                                                                    No details available.
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                )}
                                            </Fragment>
                                        );
                                    }
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}