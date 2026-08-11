"use client";

import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

import RCDReportForm from "./rcd/RCDReportForm";
import RCDTransactionTable from "./rcd/RCDTransactionTable";

type Props = {
    open: boolean;
    onClose: () => void;
};

type RCDData = {
    success: boolean;
    filters: {
        fund_source_id: string;
        date_from: string;
        date_to: string;
    };
    summary: {
        total_booklets: number;
        total_receipts: number;
        total_issued: number;
        total_collections: number;
    };
    forms?: any[];
    accountability?: any[];
    collections?: any[];
    remittances?: any[];
    deposits?: any[];
    summary_of_collections?: {
        total_collections: number;
        total_remittances: number;
        total_deposits: number;
        balance: number;
    };
};

export default function GenerateRCDModal({
    open,
    onClose,
}: Props) {
    const getCurrentDate = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(
            now.getMonth() + 1
        ).padStart(2, "0");
        const day = String(
            now.getDate()
        ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };

    const [fundSourceId, setFundSourceId] =
        useState("");

    const [dateFrom, setDateFrom] =
        useState(getCurrentDate);

    const [dateTo, setDateTo] =
        useState(getCurrentDate);

    const [fundSources, setFundSources] =
        useState<any[]>([]);

    const [loadingFunds, setLoadingFunds] =
        useState(false);

    const [loading, setLoading] =
        useState(false);

    const [rcd, setRcd] =
        useState<RCDData | null>(null);

    useEffect(() => {
        if (open) {
            loadFundSources();
        }
    }, [open]);

    async function loadFundSources() {
        try {
            setLoadingFunds(true);

            const response = await axios.get(
                "/api/fund-sources"
            );

            setFundSources(
                Array.isArray(
                    response.data?.data
                )
                    ? response.data.data
                    : Array.isArray(
                          response.data
                      )
                    ? response.data
                    : []
            );
        } catch (error) {
            console.error(
                "Failed to load fund sources:",
                error
            );

            Swal.fire(
                "Error",
                "Unable to load fund sources.",
                "error"
            );
        } finally {
            setLoadingFunds(false);
        }
    }

    function formatDate(value: string) {
        if (!value) return "-";

        return new Date(
            `${value}T00:00:00`
        ).toLocaleDateString(
            "en-PH",
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            }
        );
    }

    function formatCurrency(value: number) {
        return new Intl.NumberFormat(
            "en-PH",
            {
                style: "currency",
                currency: "PHP",
                minimumFractionDigits: 2,
            }
        ).format(
            Number(value || 0)
        );
    }

    function handleDateFromChange(
        value: string
    ) {
        setDateFrom(value);

        if (
            value &&
            dateTo &&
            value > dateTo
        ) {
            setDateTo(value);
        }
    }

    function handleDateToChange(
        value: string
    ) {
        if (
            dateFrom &&
            value < dateFrom
        ) {
            setDateTo(dateFrom);
            return;
        }

        setDateTo(value);
    }

    async function generateRCD() {
        if (!fundSourceId) {
            await Swal.fire(
                "Fund Source Required",
                "Please select a fund source.",
                "warning"
            );

            return;
        }

        if (!dateFrom || !dateTo) {
            await Swal.fire(
                "Date Required",
                "Please select the date range.",
                "warning"
            );

            return;
        }

        if (dateFrom > dateTo) {
            await Swal.fire(
                "Invalid Date Range",
                "From Date cannot be later than To Date.",
                "warning"
            );

            return;
        }

        try {
            setLoading(true);
            setRcd(null);

            const params =
                new URLSearchParams({
                    fund_source_id:
                        fundSourceId,
                    date_from: dateFrom,
                    date_to: dateTo,
                });

            const response =
                await axios.get(
                    `/api/rcd?${params.toString()}`
                );

            if (
                !response.data?.success
            ) {
                throw new Error(
                    response.data?.message ||
                        "Unable to generate RCD."
                );
            }

            setRcd(
                response.data
            );
        } catch (error: any) {
            console.error(
                "RCD GENERATION ERROR:",
                error
            );

            Swal.fire(
                "Error",
                error.response?.data
                    ?.message ||
                    error.message ||
                    "Unable to generate RCD.",
                "error"
            );
        } finally {
            setLoading(false);
        }
    }

    const selectedFundSource =
        fundSources.find(
            (item: any) =>
                String(item.id) ===
                String(fundSourceId)
        );

    /*
     * Normalize API arrays.
     */
    const accountability =
        Array.isArray(
            rcd?.accountability
        )
            ? rcd.accountability
            : [];

    const collections =
        Array.isArray(
            rcd?.collections
        )
            ? rcd.collections
            : [];

    const remittances =
        Array.isArray(
            rcd?.remittances
        )
            ? rcd.remittances
            : [];

    const deposits =
        Array.isArray(
            rcd?.deposits
        )
            ? rcd.deposits
            : [];

    const summary =
        rcd?.summary || {
            total_booklets: 0,
            total_receipts: 0,
            total_issued: 0,
            total_collections: 0,
        };

    const collectionSummary =
        rcd?.summary_of_collections || {
            total_collections: 0,
            total_remittances: 0,
            total_deposits: 0,
            balance: 0,
        };

    function handleClose() {
        if (loading) return;

        setRcd(null);
        onClose();
    }

    /*
     * IMPORTANT:
     * Do not render the modal when open === false.
     */
    if (!open) {
        return null;
    }

    return (
        <>
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-6">
                <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

                    {/* HEADER */}

                    <div className="flex items-center justify-between border-b bg-blue-900 px-6 py-4 text-white">

                        <div>
                            <h2 className="text-lg font-bold">
                                Generate RCD Report
                            </h2>

                            <p className="text-sm text-blue-100">
                                Report of Collections and Deposits
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="rounded-lg p-2 transition hover:bg-white/20 disabled:opacity-50"
                        >
                            <X size={20} />
                        </button>

                    </div>

                    {/* BODY */}

                    <div className="flex-1 overflow-y-auto bg-slate-100 p-5">

                        <RCDReportForm
                            fundSourceId={
                                fundSourceId
                            }
                            setFundSourceId={
                                setFundSourceId
                            }
                            fundSources={
                                fundSources
                            }
                            loadingFunds={
                                loadingFunds
                            }
                            loading={
                                loading
                            }
                            dateFrom={
                                dateFrom
                            }
                            dateTo={
                                dateTo
                            }
                            handleDateFromChange={
                                handleDateFromChange
                            }
                            handleDateToChange={
                                handleDateToChange
                            }
                        />

                        {/* TRANSACTION ITEMS */}

                        <div className="mt-4">
                            <RCDTransactionTable
                                open={open}
                                fundSourceId={
                                    fundSourceId
                                }
                                dateFrom={
                                    dateFrom
                                }
                                dateTo={
                                    dateTo
                                }
                                loading={
                                    loading
                                }
                            />
                        </div>

                        {/* GENERATED RESULT */}

                        {rcd && (
                            <div className="mt-5 space-y-5">

                                {/* REPORT INFORMATION */}

                                <div className="rounded-xl border bg-white p-6 shadow-sm">

                                    <div className="border-b pb-4">

                                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                            Report of Collections and Deposits
                                        </p>

                                        <h3 className="mt-1 text-xl font-bold text-slate-900">
                                            RCD
                                        </h3>

                                        <p className="mt-1 text-sm text-slate-500">
                                            {formatDate(
                                                rcd.filters
                                                    .date_from
                                            )}{" "}
                                            to{" "}
                                            {formatDate(
                                                rcd.filters
                                                    .date_to
                                            )}
                                        </p>

                                        {selectedFundSource && (
                                            <p className="mt-1 text-sm font-medium text-slate-700">
                                                {selectedFundSource.fund_code
                                                    ? `${selectedFundSource.fund_code} - `
                                                    : ""}
                                                {selectedFundSource.fund_name ??
                                                    selectedFundSource.name ??
                                                    selectedFundSource.description ??
                                                    "-"}
                                            </p>
                                        )}

                                    </div>

                                    {/* SUMMARY CARDS */}

                                    <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">

                                        <div className="rounded-lg border bg-slate-50 p-4">
                                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                                Booklets
                                            </p>

                                            <p className="mt-1 text-2xl font-bold text-slate-900">
                                                {
                                                    summary.total_booklets
                                                }
                                            </p>
                                        </div>

                                        <div className="rounded-lg border bg-slate-50 p-4">
                                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                                Accountable Forms
                                            </p>

                                            <p className="mt-1 text-2xl font-bold text-slate-900">
                                                {
                                                    summary.total_receipts
                                                }
                                            </p>
                                        </div>

                                        <div className="rounded-lg border bg-slate-50 p-4">
                                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                                Issued
                                            </p>

                                            <p className="mt-1 text-2xl font-bold text-slate-900">
                                                {
                                                    summary.total_issued
                                                }
                                            </p>
                                        </div>

                                        <div className="rounded-lg border bg-slate-50 p-4">
                                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                                Collections
                                            </p>

                                            <p className="mt-1 text-2xl font-bold text-blue-700">
                                                {formatCurrency(
                                                    summary.total_collections
                                                )}
                                            </p>
                                        </div>

                                    </div>

                                </div>

                                {/* ACCOUNTABILITY */}

                                <div className="rounded-xl border bg-white shadow-sm">

                                    <div className="border-b bg-slate-50 px-5 py-4">
                                        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                                            Accountability for Accountable Forms
                                        </h3>
                                    </div>

                                    <div className="overflow-x-auto">

                                        <table className="w-full text-sm">

                                            <thead className="border-b bg-slate-100">

                                                <tr>

                                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                                                        Form
                                                    </th>

                                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                                                        Control No.
                                                    </th>

                                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                                                        Series
                                                    </th>

                                                    <th className="px-4 py-3 text-right font-semibold text-slate-700">
                                                        Beginning OR
                                                    </th>

                                                    <th className="px-4 py-3 text-right font-semibold text-slate-700">
                                                        Ending OR
                                                    </th>

                                                    <th className="px-4 py-3 text-right font-semibold text-slate-700">
                                                        Qty.
                                                    </th>

                                                    <th className="px-4 py-3 text-right font-semibold text-slate-700">
                                                        Collections
                                                    </th>

                                                </tr>

                                            </thead>

                                            <tbody>

                                                {accountability.length ===
                                                0 ? (

                                                    <tr>

                                                        <td
                                                            colSpan={
                                                                7
                                                            }
                                                            className="px-4 py-10 text-center text-slate-500"
                                                        >
                                                            No accountable forms found for the selected criteria.
                                                        </td>

                                                    </tr>

                                                ) : (

                                                    accountability.map(
                                                        (
                                                            item: any,
                                                            index: number
                                                        ) => (

                                                            <tr
                                                                key={
                                                                    item.lor_id ??
                                                                    index
                                                                }
                                                                className="border-b last:border-b-0 hover:bg-slate-50"
                                                            >

                                                                <td className="px-4 py-3 font-semibold text-slate-800">
                                                                    {item.form_code ??
                                                                        "-"}
                                                                </td>

                                                                <td className="px-4 py-3 text-slate-700">
                                                                    {item.control_no ??
                                                                        "-"}
                                                                </td>

                                                                <td className="px-4 py-3 text-slate-700">
                                                                    {item.series ??
                                                                        "-"}
                                                                </td>

                                                                <td className="px-4 py-3 text-right font-medium">
                                                                    {item.beginning_or ??
                                                                        0}
                                                                </td>

                                                                <td className="px-4 py-3 text-right font-medium">
                                                                    {item.ending_or ??
                                                                        0}
                                                                </td>

                                                                <td className="px-4 py-3 text-right font-medium">
                                                                    {item.receipt_count ??
                                                                        0}
                                                                </td>

                                                                <td className="px-4 py-3 text-right font-medium">
                                                                    {formatCurrency(
                                                                        item.collection_total
                                                                    )}
                                                                </td>

                                                            </tr>

                                                        )
                                                    )

                                                )}

                                            </tbody>

                                        </table>

                                    </div>

                                </div>

                                {/* COLLECTIONS */}

                                <div className="rounded-xl border bg-white shadow-sm">

                                    <div className="border-b bg-slate-50 px-5 py-4">
                                        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                                            Collections
                                        </h3>
                                    </div>

                                    <div className="px-5 py-8 text-center text-sm text-slate-500">
                                        {collections.length ===
                                        0
                                            ? "No collection transactions recorded for this period."
                                            : `${collections.length} collection transaction(s) found.`}
                                    </div>

                                </div>

                                {/* REMITTANCES */}

                                <div className="rounded-xl border bg-white shadow-sm">

                                    <div className="border-b bg-slate-50 px-5 py-4">
                                        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                                            Remittances
                                        </h3>
                                    </div>

                                    <div className="px-5 py-8 text-center text-sm text-slate-500">
                                        {remittances.length ===
                                        0
                                            ? "No remittances recorded for this period."
                                            : `${remittances.length} remittance transaction(s) found.`}
                                    </div>

                                </div>

                                {/* DEPOSITS */}

                                <div className="rounded-xl border bg-white shadow-sm">

                                    <div className="border-b bg-slate-50 px-5 py-4">
                                        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                                            Deposits
                                        </h3>
                                    </div>

                                    <div className="px-5 py-8 text-center text-sm text-slate-500">
                                        {deposits.length ===
                                        0
                                            ? "No deposits recorded for this period."
                                            : `${deposits.length} deposit transaction(s) found.`}
                                    </div>

                                </div>

                                {/* SUMMARY */}

                                <div className="rounded-xl border bg-white shadow-sm">

                                    <div className="border-b bg-slate-50 px-5 py-4">
                                        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                                            Summary
                                        </h3>
                                    </div>

                                    <div className="divide-y px-5">

                                        <div className="flex items-center justify-between py-3">

                                            <span className="text-sm text-slate-600">
                                                Total Collections
                                            </span>

                                            <span className="font-semibold text-slate-900">
                                                {formatCurrency(
                                                    collectionSummary.total_collections
                                                )}
                                            </span>

                                        </div>

                                        <div className="flex items-center justify-between py-3">

                                            <span className="text-sm text-slate-600">
                                                Total Remittances
                                            </span>

                                            <span className="font-semibold text-slate-900">
                                                {formatCurrency(
                                                    collectionSummary.total_remittances
                                                )}
                                            </span>

                                        </div>

                                        <div className="flex items-center justify-between py-3">

                                            <span className="text-sm text-slate-600">
                                                Total Deposits
                                            </span>

                                            <span className="font-semibold text-slate-900">
                                                {formatCurrency(
                                                    collectionSummary.total_deposits
                                                )}
                                            </span>

                                        </div>

                                        <div className="flex items-center justify-between py-4">

                                            <span className="font-semibold text-slate-800">
                                                Balance
                                            </span>

                                            <span className="text-lg font-bold text-blue-700">
                                                {formatCurrency(
                                                    collectionSummary.balance
                                                )}
                                            </span>

                                        </div>

                                    </div>

                                </div>

                            </div>
                        )}

                    </div>

                    {/* FOOTER */}

                    <div className="flex items-center justify-between border-t bg-white px-6 py-4">

                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                        >
                            Close
                        </button>

                        <div className="flex items-center gap-3">

                            <button
                                type="button"
                                onClick={
                                    generateRCD
                                }
                                disabled={
                                    loading ||
                                    loadingFunds
                                }
                                className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >

                                {loading ? (
                                    <>
                                        <Loader2
                                            size={
                                                18
                                            }
                                            className="animate-spin"
                                        />

                                        Generating...
                                    </>
                                ) : (
                                    "Generate RCD"
                                )}

                            </button>

                            {rcd && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        window.print()
                                    }
                                    className="rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                >
                                    Print RCD
                                </button>
                            )}

                        </div>

                    </div>

                </div>
            </div>
        </>
    );
}