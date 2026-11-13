
"use client";

import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    X,
    BookOpen,
    Loader2,
    AlertCircle,
    Printer,
    RefreshCw,
    Plus,
} from "lucide-react";

import AddPaymentModal from "./AddPaymentModal";
import type { Property } from "./PropertyDetailsCard";

type Props = {
    open: boolean;
    onClose: () => void;
    fullpin: string;
    tdno?: string | null;
    taxpayer?: string | null;
    propertyLocation?: string | null;
};

type LedgerItem = {
    id: string;
    transaction_id: string;

    billing_id: string | null;
    billing_item_id: string | null;
    billing_number: string | null;

    td_number: string | null;
    declared_owner: string | null;
    property_location: string | null;

    assessed_value: string | number | null;

    start_quarter: number | null;
    start_year: number | null;
    end_quarter: number | null;
    end_year: number | null;

    basic: string | number | null;
    sef: string | number | null;
    penalty: string | number | null;
    discount: string | number | null;

    amount: string | number | null;
    tax_due: string | number | null;

    created_at?: string | null;
    payment_date?: string | null;

    taxpayer_name: string | null;

    status: string;

    or_number?: string | null;
    collector_id?: string | null;
    collector_name?: string | null;
    collector_username?: string | null;
};

type LedgerRow = LedgerItem & {
    penaltyDiscount: number;
};

type OwnerGroup = {
    key: string;
    owner: string;
    tdNumber: string;
    records: LedgerRow[];
};

function toNumber(
    value: string | number | null | undefined
) {
    return Number(value || 0);
}

function formatCurrency(
    value: number | string | null | undefined
) {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(toNumber(value));
}

function formatDate(
    value: string | null | undefined
) {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "2-digit",
    });
}

function getYear(item: LedgerItem) {
    if (
        item.start_year &&
        item.end_year &&
        item.start_year !== item.end_year
    ) {
        return `${item.start_year}-${item.end_year}`;
    }

    return String(
        item.start_year ||
        item.end_year ||
        "-"
    );
}

function getPenaltyDiscount(item: LedgerItem) {
    const penalty = toNumber(item.penalty);
    const discount = toNumber(item.discount);

    // Penalty is positive; discount is negative.
    return penalty - discount;
}

function getOwner(item: LedgerItem) {
    return (
        item.declared_owner ||
        item.taxpayer_name ||
        "Unknown Owner"
    );
}

function normalize(value: string) {
    return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export default function RPTLedgerModal({
    open,
    onClose,
    fullpin,
    tdno,
    taxpayer,
    propertyLocation,
}: Props) {

    const [items, setItems] = useState<LedgerItem[]>([]);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");
    const [showAddPayment, setShowAddPayment] = useState(false);

    /*
    ============================================================
    PAYMENT PROPERTY
    Build the subset consumed by AddPaymentModal.
    ============================================================
    */

    const paymentProperty = useMemo(() => {
        const assessedValue =
            items.find((item) => item.assessed_value != null)
                ?.assessed_value ?? 0;

        return {
            fullpin,
            tdno: tdno || "",
            taxpayer_name: taxpayer || null,
            owner_name: taxpayer || null,
            totalav: toNumber(assessedValue),
            barangay_name: propertyLocation || "",
        } as Property;
    }, [fullpin, tdno, taxpayer, propertyLocation, items]);

    /*
    ============================================================
    FETCH LEDGER
    ============================================================
    */

    const fetchLedger = useCallback(async () => {

        if (!fullpin) {
            setItems([]);
            return;
        }

        try {

            setLoading(true);
            setError("");

            const response = await fetch(
                `/api/rpt/payments/${encodeURIComponent(fullpin)}`,
                {
                    method: "GET",
                    cache: "no-store",
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message ||
                    "Failed to load RPT ledger."
                );
            }

            setItems(result.data || []);

        } catch (err) {

            console.error("RPT Ledger Error:", err);

            setItems([]);

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load RPT ledger."
            );

        } finally {

            setLoading(false);

        }

    }, [fullpin]);

    /*
    ============================================================
    LOAD LEDGER
    ============================================================
    */

    useEffect(() => {

        if (open) {
            fetchLedger();
        }

    }, [open, fetchLedger]);

    /*
    ============================================================
    PREPARE LEDGER RECORDS
    ============================================================
    */

    const ledgerRecords = useMemo(() => {

        return items
            .map((item) => ({
                ...item,
                penaltyDiscount: getPenaltyDiscount(item),
            }))
            .sort((a, b) => {

                const dateAValue =
                    a.payment_date || a.created_at;

                const dateBValue =
                    b.payment_date || b.created_at;

                const dateA = dateAValue
                    ? new Date(dateAValue).getTime()
                    : 0;

                const dateB = dateBValue
                    ? new Date(dateBValue).getTime()
                    : 0;

                return dateA - dateB;

            });

    }, [items]);

    /*
    ============================================================
    GROUP BY DECLARED OWNER + TD NUMBER
    ============================================================
    */

    const ownerGroups = useMemo(() => {

        const groups = new Map<string, OwnerGroup>();

        ledgerRecords.forEach((item) => {

            const owner = getOwner(item);

            const tdNumber =
                item.td_number ||
                tdno ||
                "-";

            const key = [
                normalize(owner),
                normalize(tdNumber),
            ].join("|");

            if (!groups.has(key)) {

                groups.set(key, {
                    key,
                    owner,
                    tdNumber,
                    records: [],
                });

            }

            groups.get(key)!.records.push(item);

        });

        return Array.from(groups.values());

    }, [ledgerRecords, tdno]);

    /*
    ============================================================
    TOTALS
    ============================================================
    */

    const totals = useMemo(() => {

        return ledgerRecords.reduce(
            (result, item) => {

                result.assessedValue += toNumber(
                    item.assessed_value
                );

                result.taxPaid += toNumber(
                    item.amount
                );

                result.adjustment +=
                    item.penaltyDiscount;

                return result;

            },
            {
                assessedValue: 0,
                taxPaid: 0,
                adjustment: 0,
            }
        );

    }, [ledgerRecords]);

    /*
    ============================================================
    PRINT
    ============================================================
    */

    function handlePrint() {

        window.print();

    }

    if (!open) return null;

    return (
        <div
            className="
                fixed inset-0 z-[100]
                flex items-center justify-center
                bg-slate-950/60 p-3 sm:p-6
            "
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >

            <div
                className="
                    flex max-h-[94vh] w-full max-w-[1500px]
                    flex-col overflow-hidden
                    rounded-2xl bg-white shadow-2xl
                "
            >

                {/* HEADER */}

                <div
                    className="
                        flex items-center justify-between
                        border-b border-slate-200
                        bg-slate-800 px-6 py-5 text-white
                    "
                >

                    <div className="flex items-center gap-3">

                        <div className="
                            flex h-11 w-11 items-center justify-center
                            rounded-xl bg-white/10
                        ">
                            <BookOpen size={22} />
                        </div>

                        <div>
                            <h2 className="text-lg font-bold">
                                Real Property Tax Ledger
                            </h2>

                            <p className="mt-0.5 text-xs text-slate-300">
                                RPT Payment Account History
                            </p>
                        </div>

                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="
                            rounded-lg p-2 text-slate-300
                            transition hover:bg-white/10 hover:text-white
                        "
                    >
                        <X size={21} />
                    </button>

                </div>

                {/* PROPERTY INFORMATION */}

                <div className="
                    grid grid-cols-1 gap-4
                    border-b border-slate-200
                    bg-slate-50 px-6 py-4
                    sm:grid-cols-2 lg:grid-cols-4
                ">

                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Tax Declaration
                        </p>

                        <p className="mt-1 text-sm font-bold text-slate-800">
                            {tdno || "-"}
                        </p>
                    </div>

                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Declared Owner
                        </p>

                        <p className="mt-1 text-sm font-bold text-slate-800">
                            {taxpayer || "-"}
                        </p>
                    </div>

                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Property Location
                        </p>

                        <p className="mt-1 text-sm font-bold text-slate-800">
                            {propertyLocation || "-"}
                        </p>
                    </div>

                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Property PIN
                        </p>

                        <p className="mt-1 break-all text-sm font-bold text-slate-800">
                            {fullpin}
                        </p>
                    </div>

                </div>

                {/* SUMMARY */}

                <div className="
                    grid grid-cols-1 gap-3
                    border-b border-slate-200
                    px-6 py-4 sm:grid-cols-3
                ">

                    <div className="rounded-xl border border-slate-200 p-3">
                        <p className="text-[10px] font-bold uppercase text-slate-400">
                            Total Assessed Value
                        </p>

                        <p className="mt-1 text-lg font-bold text-slate-800">
                            {loading
                                ? "Loading..."
                                : formatCurrency(totals.assessedValue)}
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-3">
                        <p className="text-[10px] font-bold uppercase text-slate-400">
                            Total Tax Paid
                        </p>

                        <p className="mt-1 text-lg font-bold text-emerald-600">
                            {loading
                                ? "Loading..."
                                : formatCurrency(totals.taxPaid)}
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-3">
                        <p className="text-[10px] font-bold uppercase text-slate-400">
                            Penalty / Discount
                        </p>

                        <p className={`mt-1 text-lg font-bold ${
                            totals.adjustment > 0
                                ? "text-red-600"
                                : totals.adjustment < 0
                                    ? "text-emerald-600"
                                    : "text-slate-800"
                        }`}>
                            {loading
                                ? "Loading..."
                                : `${totals.adjustment > 0 ? "+" : totals.adjustment < 0 ? "-" : ""}${formatCurrency(Math.abs(totals.adjustment))}`}
                        </p>
                    </div>

                </div>

                {/* LEDGER TABLE */}

                <div className="
                    min-h-0 flex-1 overflow-auto
                    px-6 py-5
                ">

                    {loading ? (

                        <div className="
                            flex min-h-52 items-center justify-center
                            gap-3 text-sm text-slate-500
                        ">
                            <Loader2 className="animate-spin" size={20} />
                            Loading RPT ledger...
                        </div>

                    ) : error ? (

                        <div className="
                            flex items-start gap-3 rounded-xl
                            border border-red-200 bg-red-50 p-4
                            text-sm text-red-700
                        ">
                            <AlertCircle size={19} />

                            <div>
                                <p className="font-bold">
                                    Unable to load ledger
                                </p>

                                <p className="mt-1">
                                    {error}
                                </p>

                                <button
                                    type="button"
                                    onClick={fetchLedger}
                                    className="
                                        mt-3 inline-flex items-center gap-2
                                        font-bold underline
                                    "
                                >
                                    <RefreshCw size={13} />
                                    Try Again
                                </button>
                            </div>
                        </div>

                    ) : (

                        <div className="
                            overflow-x-auto rounded-xl
                            border border-slate-200
                        ">

                            <table className="
                                w-full min-w-[1250px]
                                border-collapse text-xs
                            ">

                                <thead className="
                                    sticky top-0 z-10
                                    bg-slate-100 text-slate-600
                                ">

                                    <tr>

                                        <th className="
                                            border-b border-r border-slate-200
                                            px-3 py-3 text-left
                                        ">
                                            Declared Owner
                                        </th>

                                        <th className="
                                            border-b border-r border-slate-200
                                            px-3 py-3 text-left
                                        ">
                                            TD No.
                                        </th>

                                        <th className="
                                            border-b border-r border-slate-200
                                            px-3 py-3 text-center
                                        ">
                                            Year
                                        </th>

                                        <th className="
                                            border-b border-r border-slate-200
                                            px-3 py-3 text-right
                                        ">
                                            Assessed Value
                                        </th>

                                        <th className="
                                            border-b border-r border-slate-200
                                            px-3 py-3 text-right
                                        ">
                                            Tax Paid
                                        </th>

                                        <th className="
                                            border-b border-r border-slate-200
                                            px-3 py-3 text-right
                                        ">
                                            Penalty / Discount
                                        </th>

                                        <th className="
                                            border-b border-r border-slate-200
                                            px-3 py-3 text-left
                                        ">
                                            OR Number
                                        </th>

                                        <th className="
                                            border-b border-r border-slate-200
                                            px-3 py-3 text-left
                                        ">
                                            Date Paid
                                        </th>

                                        <th className="
                                            border-b border-slate-200
                                            px-3 py-3 text-left
                                        ">
                                            Collector
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {ownerGroups.map((group) => (

                                        group.records.map((item, index) => (

                                            <tr
                                                key={item.id}
                                                className="
                                                    transition
                                                    hover:bg-blue-50/50
                                                "
                                            >

                                                {/* OWNER - DISPLAY ONCE */}

                                                <td className="
                                                    border-b border-r border-slate-100
                                                    px-3 py-3 font-semibold text-slate-800
                                                ">
                                                    {index === 0
                                                        ? group.owner
                                                        : null}
                                                </td>

                                                {/* TD - DISPLAY ONCE */}

                                                <td className="
                                                    border-b border-r border-slate-100
                                                    px-3 py-3 font-semibold text-slate-700
                                                ">
                                                    {index === 0
                                                        ? group.tdNumber
                                                        : null}
                                                </td>

                                                {/* YEAR */}

                                                <td className="
                                                    border-b border-r border-slate-100
                                                    px-3 py-3 text-center text-slate-700
                                                ">
                                                    {getYear(item)}
                                                </td>

                                                {/* ASSESSED VALUE */}

                                                <td className="
                                                    whitespace-nowrap border-b border-r border-slate-100
                                                    px-3 py-3 text-right font-medium text-slate-700
                                                ">
                                                    {formatCurrency(item.assessed_value)}
                                                </td>

                                                {/* TAX PAID */}

                                                <td className="
                                                    whitespace-nowrap border-b border-r border-slate-100
                                                    px-3 py-3 text-right font-bold text-emerald-600
                                                ">
                                                    {formatCurrency(item.amount)}
                                                </td>

                                                {/* PENALTY / DISCOUNT */}

                                                <td className={`
                                                    whitespace-nowrap border-b border-r border-slate-100
                                                    px-3 py-3 text-right font-bold
                                                    ${
                                                        item.penaltyDiscount > 0
                                                            ? "text-red-600"
                                                            : item.penaltyDiscount < 0
                                                                ? "text-emerald-600"
                                                                : "text-slate-500"
                                                    }
                                                `}>
                                                    {item.penaltyDiscount > 0
                                                        ? "+"
                                                        : item.penaltyDiscount < 0
                                                            ? "-"
                                                            : ""}
                                                    {formatCurrency(
                                                        Math.abs(item.penaltyDiscount)
                                                    )}
                                                </td>

                                                {/* OR NUMBER */}

                                                <td className="
                                                    border-b border-r border-slate-100
                                                    px-3 py-3 font-semibold text-slate-700
                                                ">
                                                    {item.or_number || "-"}
                                                </td>

                                                {/* DATE PAID */}

                                                <td className="
                                                    whitespace-nowrap border-b border-r border-slate-100
                                                    px-3 py-3 text-slate-600
                                                ">
                                                    {formatDate(item.payment_date)}
                                                </td>

                                                {/* COLLECTOR */}

                                                <td className="
                                                    border-b border-slate-100
                                                    px-3 py-3 text-slate-700
                                                ">
                                                    {item.collector_name || "Unknown Collector"}
                                                </td>

                                            </tr>

                                        ))

                                    ))}

                                    {ownerGroups.length === 0 && (

                                        <tr>
                                            <td
                                                colSpan={9}
                                                className="
                                                    px-5 py-12
                                                    text-center text-slate-400
                                                "
                                            >
                                                No RPT ledger records found.
                                            </td>
                                        </tr>

                                    )}

                                </tbody>



                            </table>

                        </div>

                    )}

                </div>

                {/* FOOTER */}

                <div className="
                    flex items-center justify-between gap-3
                    border-t border-slate-200
                    bg-slate-50 px-6 py-4
                ">

                    <p className="
                        text-[10px] font-semibold text-slate-400
                    ">
                        RPT ACCOUNT LEDGER
                    </p>

                    <div className="flex gap-2">

                        <button
                            type="button"
                            onClick={() => setShowAddPayment(true)}
                            disabled={loading}
                            className="
                                inline-flex items-center gap-2
                                rounded-lg bg-blue-700
                                px-4 py-2 text-xs font-bold
                                text-white hover:bg-blue-800
                                disabled:cursor-not-allowed disabled:opacity-50
                            "
                        >
                            <Plus size={15} />
                            Add Payment
                        </button>

                        <button
                            type="button"
                            onClick={handlePrint}
                            disabled={
                                loading ||
                                ledgerRecords.length === 0
                            }
                            className="
                                inline-flex items-center gap-2
                                rounded-lg border border-slate-300
                                bg-white px-4 py-2 text-xs font-bold
                                text-slate-700 hover:bg-slate-100
                                disabled:opacity-50
                            "
                        >
                            <Printer size={15} />
                            Print
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            className="
                                rounded-lg bg-slate-800
                                px-5 py-2 text-xs font-bold
                                text-white hover:bg-slate-700
                            "
                        >
                            Close
                        </button>

                    </div>

                </div>

            </div>

            <AddPaymentModal
                open={showAddPayment}
                onClose={() => setShowAddPayment(false)}
                property={paymentProperty}
                onSuccess={() => {
                    setShowAddPayment(false);
                    void fetchLedger();
                }}
            />
        </div>
    );
}
