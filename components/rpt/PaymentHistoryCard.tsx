"use client";

import {
    CreditCard,
    Receipt,
    Plus,
    Loader2,
    AlertCircle,
    X,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { Property } from "./PropertyDetailsCard";

type Props = {
    property: Property;
    onAddPayment: () => void;
    onCreateBilling: () => void;
};

type PaymentItem = {
    id: string;
    transaction_id: string;
    billing_id: string | null;
    tax_declaration_id: string | null;
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
    created_at: string;
    tax_due: string | number | null;
    billing_number: string | null;
    billing_item_id: string | null;
    account_id: string | null;
    taxpayer_name: string | null;
    payment_date: string;
    status: string;
};

function formatCurrency(
    value: string | number | null | undefined
) {
    const amount = Number(value || 0);

    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

function formatDate(
    value: string | null | undefined
) {
    if (!value) {
        return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "2-digit",
    });
}

function getQuarterLabel(
    quarter: number | null | undefined
) {
    if (!quarter) {
        return "-";
    }

    return `Q${quarter}`;
}

function formatCoverage(payment: PaymentItem) {
    if (
        !payment.start_year ||
        !payment.start_quarter
    ) {
        return "-";
    }

    const start = `${getQuarterLabel(
        Number(payment.start_quarter)
    )} ${payment.start_year}`;

    if (
        !payment.end_year ||
        !payment.end_quarter
    ) {
        return start;
    }

    const end = `${getQuarterLabel(
        Number(payment.end_quarter)
    )} ${payment.end_year}`;

    return `${start} - ${end}`;
}

export default function PaymentHistoryCard({
    property,
    onAddPayment,
    onCreateBilling,
}: Props) {
    const [payments, setPayments] = useState<
        PaymentItem[]
    >([]);

    const [totalPaid, setTotalPaid] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [showAddPayment, setShowAddPayment] =
        useState(false);

    // ---------------------------------------------------------
    // PAYMENT FORM
    // ---------------------------------------------------------

    const [paymentDate, setPaymentDate] = useState("");
    const [startQuarter, setStartQuarter] = useState("1");
    const [startYear, setStartYear] = useState("");
    const [endQuarter, setEndQuarter] = useState("1");
    const [endYear, setEndYear] = useState("");
    const [billingNumber, setBillingNumber] = useState("");
    const [taxDue, setTaxDue] = useState("");
    const [amountPaid, setAmountPaid] = useState("");

    // ---------------------------------------------------------
    // OPEN MODAL
    // ---------------------------------------------------------

    function openAddPayment() {
        const today = new Date()
            .toISOString()
            .split("T")[0];

        setPaymentDate(today);

        setStartQuarter("1");
        setStartYear("");

        setEndQuarter("1");
        setEndYear("");

        setBillingNumber("");
        setTaxDue("");
        setAmountPaid("");

        setShowAddPayment(true);
    }

    // ---------------------------------------------------------
    // CLOSE MODAL
    // ---------------------------------------------------------

    function closeAddPayment() {
        setShowAddPayment(false);
    }

    // ---------------------------------------------------------
    // SAMPLE SAVE
    // ---------------------------------------------------------

    function handleSavePayment(
        e: React.FormEvent<HTMLFormElement>
    ) {
        e.preventDefault();

        const paymentData = {
            property_id: property.fullpin,
            tdno: property.tdno,

            taxpayer_name:
                property.taxpayer_name ||
                property.owner_name ||
                "",

            payment_date: paymentDate,

            start_quarter: Number(startQuarter),
            start_year: Number(startYear),

            end_quarter: Number(endQuarter),
            end_year: Number(endYear),

            billing_number:
                billingNumber || null,

            assessed_value: Number(
                property.totalav || 0
            ),

            tax_due: Number(taxDue),
            amount: Number(amountPaid),

            declared_owner:
                property.owner_name ||
                property.taxpayer_name ||
                "",

            property_location:
                property.barangay_name || null,
        };

        console.log(
            "SAMPLE RPT PAYMENT:",
            paymentData
        );

        // SAMPLE ONLY
        // No database insertion yet.

        setShowAddPayment(false);
    }

    // ---------------------------------------------------------
    // FETCH PAYMENT HISTORY
    // ---------------------------------------------------------

    useEffect(() => {
        async function fetchPaymentHistory() {
            if (!property?.fullpin) {
                setPayments([]);
                setTotalPaid(0);
                setError("");
                return;
            }

            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `/api/rpt/payments/${encodeURIComponent(
                        property.fullpin
                    )}`,
                    {
                        method: "GET",
                        cache: "no-store",
                    }
                );

                const result = await response.json();

                if (
                    !response.ok ||
                    !result.success
                ) {
                    throw new Error(
                        result.message ||
                            "Failed to load payment history."
                    );
                }

                setPayments(result.data || []);

                setTotalPaid(
                    Number(result.total_paid || 0)
                );
            } catch (err) {
                console.error(
                    "Failed to load RPT payment history:",
                    err
                );

                setPayments([]);
                setTotalPaid(0);

                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load payment history."
                );
            } finally {
                setLoading(false);
            }
        }

        fetchPaymentHistory();
    }, [property?.fullpin]);

    return (
        <>
            {/* =====================================================
                PAYMENT HISTORY CARD
            ===================================================== */}

            <div
                className="
                    h-full
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
                {/* =================================================
                    HEADER
                ================================================= */}

                <div
                    className="
                        relative
                        overflow-hidden
                        border-b
                        border-orange-600
                        bg-orange-500
                        px-5
                        py-5
                        text-white
                    "
                >
                    <div
                        className="
                            absolute
                            -right-10
                            -top-12
                            h-32
                            w-32
                            rounded-full
                            bg-white/[0.10]
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

                        <div
                            className="
                                flex
                                items-center
                                gap-3
                            "
                        >
                            <div
                                className="
                                    flex
                                    h-10
                                    w-10
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-white/15
                                    ring-1
                                    ring-white/20
                                "
                            >
                                <CreditCard size={19} />
                            </div>

                            <div>
                                <h2
                                    className="
                                        text-base
                                        font-bold
                                    "
                                >
                                    Payment History
                                </h2>

                                <p
                                    className="
                                        mt-0.5
                                        text-[11px]
                                        text-orange-100
                                    "
                                >
                                    RPT payment activity
                                </p>
                            </div>
                        </div>

                        {/* ACTION BUTTONS */}

                        <div
                            className="
                                flex
                                items-center
                                gap-2
                            "
                        >
                            {/* CREATE BILLING */}

                            <button
                                type="button"
                                onClick={onCreateBilling}
                                className="
                                    inline-flex
                                    items-center
                                    justify-center
                                    gap-1.5
                                    rounded-lg
                                    bg-white
                                    px-3
                                    py-2
                                    text-xs
                                    font-bold
                                    text-blue-600
                                    shadow-sm
                                    transition-all
                                    duration-200
                                    hover:-translate-y-0.5
                                    hover:bg-blue-50
                                    hover:shadow-md
                                    active:translate-y-0
                                "
                            >
                                <Receipt size={15} />

                                Create Billing
                            </button>

                            {/* ADD PAYMENT */}

                            <button
                                type="button"
                                onClick={openAddPayment}
                                className="
                                    inline-flex
                                    items-center
                                    justify-center
                                    gap-1.5
                                    rounded-lg
                                    border
                                    border-white/30
                                    bg-orange-600
                                    px-3
                                    py-2
                                    text-xs
                                    font-bold
                                    text-white
                                    shadow-sm
                                    transition-all
                                    duration-200
                                    hover:-translate-y-0.5
                                    hover:bg-orange-700
                                    hover:shadow-md
                                    active:translate-y-0
                                "
                            >
                                <Plus size={15} />

                                Add Payment
                            </button>
                        </div>
                    </div>
                </div>

                {/* =================================================
                    BODY
                ================================================= */}

                <div className="p-5">
                    {/* TOTAL PAID */}

                    <div
                        className="
                            relative
                            overflow-hidden
                            rounded-2xl
                            border
                            border-orange-100
                            bg-orange-50
                            p-5
                        "
                    >
                        <div
                            className="
                                absolute
                                -bottom-10
                                -right-10
                                h-28
                                w-28
                                rounded-full
                                bg-white/70
                            "
                        />

                        <div className="relative">
                            <p
                                className="
                                    text-[10px]
                                    font-bold
                                    uppercase
                                    tracking-[0.12em]
                                    text-orange-600
                                "
                            >
                                Total Paid
                            </p>

                            <p
                                className="
                                    mt-2
                                    text-2xl
                                    font-bold
                                    tracking-tight
                                    text-slate-900
                                "
                            >
                                {loading
                                    ? "Loading..."
                                    : formatCurrency(
                                          totalPaid
                                      )}
                            </p>

                            <div
                                className="
                                    mt-3
                                    flex
                                    items-center
                                    gap-2
                                "
                            >
                                <span
                                    className="
                                        flex
                                        h-5
                                        w-5
                                        items-center
                                        justify-center
                                        rounded-full
                                        bg-orange-500
                                        text-white
                                    "
                                >
                                    <Receipt size={11} />
                                </span>

                                <span
                                    className="
                                        text-[10px]
                                        font-medium
                                        text-slate-500
                                    "
                                >
                                    {loading
                                        ? "Loading payment records..."
                                        : `${payments.length} payment item${
                                              payments.length ===
                                              1
                                                  ? ""
                                                  : "s"
                                          } found`}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ERROR */}

                    {error && (
                        <div
                            className="
                                mt-5
                                flex
                                items-start
                                gap-3
                                rounded-xl
                                border
                                border-red-200
                                bg-red-50
                                p-4
                                text-red-700
                            "
                        >
                            <AlertCircle
                                size={18}
                                className="mt-0.5 shrink-0"
                            />

                            <div>
                                <p
                                    className="
                                        text-sm
                                        font-bold
                                    "
                                >
                                    Unable to load payment
                                    history
                                </p>

                                <p
                                    className="
                                        mt-1
                                        text-xs
                                    "
                                >
                                    {error}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* PAYMENT ITEMS */}

                    <div className="mt-5">
                        <div
                            className="
                                mb-3
                                flex
                                items-center
                                justify-between
                            "
                        >
                            <h3
                                className="
                                    text-sm
                                    font-bold
                                    text-slate-900
                                "
                            >
                                Payment Items
                            </h3>

                            <span
                                className="
                                    rounded-full
                                    bg-slate-100
                                    px-2.5
                                    py-1
                                    text-[10px]
                                    font-semibold
                                    text-slate-500
                                "
                            >
                                {loading
                                    ? "Loading..."
                                    : `${payments.length} Records`}
                            </span>
                        </div>

                        {/* LOADING */}

                        {loading && (
                            <div
                                className="
                                    flex
                                    items-center
                                    justify-center
                                    rounded-2xl
                                    border
                                    border-slate-200
                                    bg-slate-50
                                    px-5
                                    py-10
                                "
                            >
                                <div
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                        text-sm
                                        text-slate-500
                                    "
                                >
                                    <Loader2
                                        size={18}
                                        className="animate-spin"
                                    />

                                    Loading payment history...
                                </div>
                            </div>
                        )}

                        {/* EMPTY */}

                        {!loading &&
                            !error &&
                            payments.length === 0 && (
                                <div
                                    className="
                                        rounded-2xl
                                        border
                                        border-dashed
                                        border-slate-300
                                        bg-slate-50/70
                                        px-5
                                        py-10
                                        text-center
                                        transition-all
                                        duration-300
                                        hover:border-orange-300
                                        hover:bg-orange-50/30
                                    "
                                >
                                    <div
                                        className="
                                            mx-auto
                                            flex
                                            h-12
                                            w-12
                                            items-center
                                            justify-center
                                            rounded-2xl
                                            bg-white
                                            text-orange-500
                                            shadow-sm
                                        "
                                    >
                                        <Receipt size={20} />
                                    </div>

                                    <h4
                                        className="
                                            mt-3
                                            text-sm
                                            font-bold
                                            text-slate-700
                                        "
                                    >
                                        No payment history
                                    </h4>

                                    <p
                                        className="
                                            mx-auto
                                            mt-1.5
                                            max-w-[240px]
                                            text-xs
                                            leading-5
                                            text-slate-400
                                        "
                                    >
                                        Payment records for
                                        this property will
                                        appear here once
                                        available.
                                    </p>
                                </div>
                            )}

                        {/* PAYMENT RECORDS */}

                        {!loading &&
                            !error &&
                            payments.length > 0 && (
                                <div
                                    className="
                                        overflow-hidden
                                        rounded-2xl
                                        border
                                        border-slate-200
                                    "
                                >
                                    <div
                                        className="
                                            max-h-[420px]
                                            overflow-y-auto
                                        "
                                    >
                                        <div className="divide-y divide-slate-100">
                                            {payments.map(
                                                (payment) => (
                                                    <div
                                                        key={
                                                            payment.id
                                                        }
                                                        className="
                                                            bg-white
                                                            px-4
                                                            py-4
                                                            transition-colors
                                                            hover:bg-slate-50
                                                        "
                                                    >
                                                        {/* TOP */}

                                                        <div
                                                            className="
                                                                flex
                                                                items-start
                                                                justify-between
                                                                gap-3
                                                            "
                                                        >
                                                            <div>
                                                                <p
                                                                    className="
                                                                        text-sm
                                                                        font-bold
                                                                        text-slate-800
                                                                    "
                                                                >
                                                                    {formatCoverage(
                                                                        payment
                                                                    )}
                                                                </p>

                                                                <p
                                                                    className="
                                                                        mt-1
                                                                        text-[11px]
                                                                        text-slate-500
                                                                    "
                                                                >
                                                                    Payment
                                                                    Date:{" "}
                                                                    {formatDate(
                                                                        payment.payment_date
                                                                    )}
                                                                </p>
                                                            </div>

                                                            {/* AMOUNT */}

                                                            <div className="text-right">
                                                                <p
                                                                    className="
                                                                        text-sm
                                                                        font-bold
                                                                        text-emerald-600
                                                                    "
                                                                >
                                                                    {formatCurrency(
                                                                        payment.amount
                                                                    )}
                                                                </p>

                                                                <span
                                                                    className="
                                                                        mt-1
                                                                        inline-flex
                                                                        rounded-full
                                                                        bg-emerald-50
                                                                        px-2
                                                                        py-0.5
                                                                        text-[9px]
                                                                        font-bold
                                                                        uppercase
                                                                        text-emerald-600
                                                                    "
                                                                >
                                                                    {payment.status ||
                                                                        "PAID"}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* DETAILS */}

                                                        <div
                                                            className="
                                                                mt-3
                                                                grid
                                                                grid-cols-2
                                                                gap-3
                                                                text-[11px]
                                                                sm:grid-cols-3
                                                            "
                                                        >
                                                            {/* TD */}

                                                            <div>
                                                                <p className="text-slate-400">
                                                                    TD
                                                                    Number
                                                                </p>

                                                                <p
                                                                    className="
                                                                        font-semibold
                                                                        text-slate-700
                                                                    "
                                                                >
                                                                    {payment.td_number ||
                                                                        "-"}
                                                                </p>
                                                            </div>

                                                            {/* ASSESSED VALUE */}

                                                            <div>
                                                                <p className="text-slate-400">
                                                                    Assessed
                                                                    Value
                                                                </p>

                                                                <p
                                                                    className="
                                                                        font-semibold
                                                                        text-slate-700
                                                                    "
                                                                >
                                                                    {formatCurrency(
                                                                        payment.assessed_value
                                                                    )}
                                                                </p>
                                                            </div>

                                                            {/* TAX DUE */}

                                                            <div>
                                                                <p className="text-slate-400">
                                                                    Tax Due
                                                                </p>

                                                                <p
                                                                    className="
                                                                        font-semibold
                                                                        text-slate-700
                                                                    "
                                                                >
                                                                    {formatCurrency(
                                                                        payment.tax_due
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* REFERENCE */}

                                                        <div
                                                            className="
                                                                mt-3
                                                                flex
                                                                flex-wrap
                                                                items-center
                                                                gap-x-4
                                                                gap-y-1
                                                                border-t
                                                                border-slate-100
                                                                pt-3
                                                            "
                                                        >
                                                            {/* BILLING NUMBER */}

                                                            <span
                                                                className="
                                                                    text-[10px]
                                                                    text-slate-400
                                                                "
                                                            >
                                                                Billing:{" "}
                                                                <strong
                                                                    className="
                                                                        font-semibold
                                                                        text-slate-600
                                                                    "
                                                                >
                                                                    {payment.billing_number ||
                                                                        "-"}
                                                                </strong>
                                                            </span>

                                                            {/* TAXPAYER */}

                                                            <span
                                                                className="
                                                                    text-[10px]
                                                                    text-slate-400
                                                                "
                                                            >
                                                                Taxpayer:{" "}
                                                                <strong
                                                                    className="
                                                                        font-semibold
                                                                        text-slate-600
                                                                    "
                                                                >
                                                                    {payment.taxpayer_name ||
                                                                        payment.declared_owner ||
                                                                        "-"}
                                                                </strong>
                                                            </span>

                                                            {/* PROPERTY LOCATION */}

                                                            {payment.property_location && (
                                                                <span
                                                                    className="
                                                                        text-[10px]
                                                                        text-slate-400
                                                                    "
                                                                >
                                                                    Location:{" "}
                                                                    <strong
                                                                        className="
                                                                            font-semibold
                                                                            text-slate-600
                                                                        "
                                                                    >
                                                                        {
                                                                            payment.property_location
                                                                        }
                                                                    </strong>
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                    </div>

                    {/* PROPERTY REFERENCE */}

                    <div
                        className="
                            mt-5
                            rounded-xl
                            border
                            border-slate-200
                            bg-white
                            p-4
                            shadow-sm
                            transition-all
                            hover:border-blue-200
                            hover:shadow-md
                        "
                    >
                        <div
                            className="
                                flex
                                items-center
                                justify-between
                                gap-3
                            "
                        >
                            {/* TD NUMBER */}

                            <div>
                                <p
                                    className="
                                        text-[10px]
                                        font-bold
                                        uppercase
                                        tracking-[0.1em]
                                        text-slate-400
                                    "
                                >
                                    Property
                                </p>

                                <p
                                    className="
                                        mt-1
                                        text-sm
                                        font-bold
                                        text-slate-900
                                    "
                                >
                                    {property.tdno || "-"}
                                </p>
                            </div>

                            {/* BARANGAY */}

                            <div className="text-right">
                                <p
                                    className="
                                        text-[10px]
                                        font-bold
                                        uppercase
                                        tracking-[0.1em]
                                        text-slate-400
                                    "
                                >
                                    Barangay
                                </p>

                                <p
                                    className="
                                        mt-1
                                        max-w-[140px]
                                        truncate
                                        text-xs
                                        font-semibold
                                        text-slate-700
                                    "
                                >
                                    {property.barangay_name ||
                                        "-"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* =====================================================
                ADD PAYMENT MODAL
            ===================================================== */}

            {showAddPayment && (
                <div
                    className="
                        fixed
                        inset-0
                        z-[9999]
                        flex
                        items-center
                        justify-center
                        bg-black/50
                        p-4
                    "
                >
                    <div
                        className="
                            w-full
                            max-w-3xl
                            overflow-hidden
                            rounded-xl
                            bg-white
                            shadow-2xl
                        "
                    >
                        {/* MODAL HEADER */}

                        <div
                            className="
                                flex
                                items-center
                                justify-between
                                border-b
                                bg-blue-700
                                px-6
                                py-4
                                text-white
                            "
                        >
                            <div
                                className="
                                    flex
                                    items-center
                                    gap-3
                                "
                            >
                                <div
                                    className="
                                        rounded-lg
                                        bg-white/15
                                        p-2
                                    "
                                >
                                    <CreditCard size={22} />
                                </div>

                                <div>
                                    <h2 className="text-lg font-semibold">
                                        Add RPT Payment
                                    </h2>

                                    <p className="text-sm text-blue-100">
                                        Record a payment for
                                        this property
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={closeAddPayment}
                                className="
                                    rounded-lg
                                    p-2
                                    transition
                                    hover:bg-white/15
                                "
                            >
                                <X size={22} />
                            </button>
                        </div>

                        {/* FORM */}

                        <form
                            onSubmit={handleSavePayment}
                        >
                            <div
                                className="
                                    max-h-[75vh]
                                    space-y-6
                                    overflow-y-auto
                                    p-6
                                "
                            >
                                {/* PROPERTY INFORMATION */}

                                <div>
                                    <h3
                                        className="
                                            mb-3
                                            text-sm
                                            font-semibold
                                            uppercase
                                            tracking-wide
                                            text-gray-600
                                        "
                                    >
                                        Property Information
                                    </h3>

                                    <div
                                        className="
                                            grid
                                            grid-cols-1
                                            gap-4
                                            md:grid-cols-2
                                        "
                                    >
                                        {/* TD NUMBER */}

                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                                TD Number
                                            </label>

                                            <input
                                                type="text"
                                                value={
                                                    property.tdno ||
                                                    ""
                                                }
                                                readOnly
                                                className="
                                                    w-full
                                                    rounded-lg
                                                    border
                                                    bg-gray-100
                                                    px-3
                                                    py-2.5
                                                    text-sm
                                                    text-gray-700
                                                "
                                            />
                                        </div>

                                        {/* FULL PIN */}

                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                                Full PIN
                                            </label>

                                            <input
                                                type="text"
                                                value={
                                                    property.fullpin ||
                                                    ""
                                                }
                                                readOnly
                                                className="
                                                    w-full
                                                    rounded-lg
                                                    border
                                                    bg-gray-100
                                                    px-3
                                                    py-2.5
                                                    text-sm
                                                    text-gray-700
                                                "
                                            />
                                        </div>

                                        {/* TAXPAYER */}

                                        <div className="md:col-span-2">
                                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                                Taxpayer
                                            </label>

                                            <input
                                                type="text"
                                                value={
                                                    property.taxpayer_name ||
                                                    property.owner_name ||
                                                    ""
                                                }
                                                readOnly
                                                className="
                                                    w-full
                                                    rounded-lg
                                                    border
                                                    bg-gray-100
                                                    px-3
                                                    py-2.5
                                                    text-sm
                                                    text-gray-700
                                                "
                                            />
                                        </div>

                                        {/* ASSESSED VALUE */}

                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                                Assessed Value
                                            </label>

                                            <input
                                                type="text"
                                                value={Number(
                                                    property.totalav ||
                                                        0
                                                ).toLocaleString(
                                                    "en-PH",
                                                    {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    }
                                                )}
                                                readOnly
                                                className="
                                                    w-full
                                                    rounded-lg
                                                    border
                                                    bg-gray-100
                                                    px-3
                                                    py-2.5
                                                    text-sm
                                                    text-gray-700
                                                "
                                            />
                                        </div>

                                        {/* LOCATION */}

                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                                Property Location
                                            </label>

                                            <input
                                                type="text"
                                                value={
                                                    property.barangay_name ||
                                                    ""
                                                }
                                                readOnly
                                                className="
                                                    w-full
                                                    rounded-lg
                                                    border
                                                    bg-gray-100
                                                    px-3
                                                    py-2.5
                                                    text-sm
                                                    text-gray-700
                                                "
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* PAYMENT INFORMATION */}

                                <div>
                                    <h3
                                        className="
                                            mb-3
                                            text-sm
                                            font-semibold
                                            uppercase
                                            tracking-wide
                                            text-gray-600
                                        "
                                    >
                                        Payment Information
                                    </h3>

                                    <div
                                        className="
                                            grid
                                            grid-cols-1
                                            gap-4
                                            md:grid-cols-2
                                        "
                                    >
                                        {/* PAYMENT DATE */}

                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                                Payment Date
                                            </label>

                                            <input
                                                type="date"
                                                value={
                                                    paymentDate
                                                }
                                                onChange={(e) =>
                                                    setPaymentDate(
                                                        e.target.value
                                                    )
                                                }
                                                required
                                                className="
                                                    w-full
                                                    rounded-lg
                                                    border
                                                    px-3
                                                    py-2.5
                                                    text-sm
                                                    outline-none
                                                    focus:border-blue-500
                                                    focus:ring-2
                                                    focus:ring-blue-100
                                                "
                                            />
                                        </div>

                                        {/* BILLING NUMBER */}

                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                                Billing Number
                                            </label>

                                            <input
                                                type="text"
                                                value={
                                                    billingNumber
                                                }
                                                onChange={(e) =>
                                                    setBillingNumber(
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Optional"
                                                className="
                                                    w-full
                                                    rounded-lg
                                                    border
                                                    px-3
                                                    py-2.5
                                                    text-sm
                                                    outline-none
                                                    focus:border-blue-500
                                                    focus:ring-2
                                                    focus:ring-blue-100
                                                "
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* TAX COVERAGE */}

                                <div>
                                    <h3
                                        className="
                                            mb-3
                                            text-sm
                                            font-semibold
                                            uppercase
                                            tracking-wide
                                            text-gray-600
                                        "
                                    >
                                        Tax Coverage
                                    </h3>

                                    <div
                                        className="
                                            grid
                                            grid-cols-2
                                            gap-4
                                            md:grid-cols-4
                                        "
                                    >
                                        {/* START QUARTER */}

                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                                Start Quarter
                                            </label>

                                            <select
                                                value={
                                                    startQuarter
                                                }
                                                onChange={(e) =>
                                                    setStartQuarter(
                                                        e.target.value
                                                    )
                                                }
                                                className="
                                                    w-full
                                                    rounded-lg
                                                    border
                                                    px-3
                                                    py-2.5
                                                    text-sm
                                                "
                                            >
                                                <option value="1">
                                                    1st Quarter
                                                </option>

                                                <option value="2">
                                                    2nd Quarter
                                                </option>

                                                <option value="3">
                                                    3rd Quarter
                                                </option>

                                                <option value="4">
                                                    4th Quarter
                                                </option>
                                            </select>
                                        </div>

                                        {/* START YEAR */}

                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                                Start Year
                                            </label>

                                            <input
                                                type="number"
                                                value={
                                                    startYear
                                                }
                                                onChange={(e) =>
                                                    setStartYear(
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="2026"
                                                min="1900"
                                                max="2100"
                                                required
                                                className="
                                                    w-full
                                                    rounded-lg
                                                    border
                                                    px-3
                                                    py-2.5
                                                    text-sm
                                                "
                                            />
                                        </div>

                                        {/* END QUARTER */}

                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                                End Quarter
                                            </label>

                                            <select
                                                value={
                                                    endQuarter
                                                }
                                                onChange={(e) =>
                                                    setEndQuarter(
                                                        e.target.value
                                                    )
                                                }
                                                className="
                                                    w-full
                                                    rounded-lg
                                                    border
                                                    px-3
                                                    py-2.5
                                                    text-sm
                                                "
                                            >
                                                <option value="1">
                                                    1st Quarter
                                                </option>

                                                <option value="2">
                                                    2nd Quarter
                                                </option>

                                                <option value="3">
                                                    3rd Quarter
                                                </option>

                                                <option value="4">
                                                    4th Quarter
                                                </option>
                                            </select>
                                        </div>

                                        {/* END YEAR */}

                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                                End Year
                                            </label>

                                            <input
                                                type="number"
                                                value={
                                                    endYear
                                                }
                                                onChange={(e) =>
                                                    setEndYear(
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="2026"
                                                min="1900"
                                                max="2100"
                                                required
                                                className="
                                                    w-full
                                                    rounded-lg
                                                    border
                                                    px-3
                                                    py-2.5
                                                    text-sm
                                                "
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* AMOUNTS */}

                                <div>
                                    <h3
                                        className="
                                            mb-3
                                            text-sm
                                            font-semibold
                                            uppercase
                                            tracking-wide
                                            text-gray-600
                                        "
                                    >
                                        Payment Amount
                                    </h3>

                                    <div
                                        className="
                                            grid
                                            grid-cols-1
                                            gap-4
                                            md:grid-cols-2
                                        "
                                    >
                                        {/* TAX DUE */}

                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                                Tax Due
                                            </label>

                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={taxDue}
                                                onChange={(e) =>
                                                    setTaxDue(
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="0.00"
                                                required
                                                className="
                                                    w-full
                                                    rounded-lg
                                                    border
                                                    px-3
                                                    py-2.5
                                                    text-sm
                                                    outline-none
                                                    focus:border-blue-500
                                                    focus:ring-2
                                                    focus:ring-blue-100
                                                "
                                            />
                                        </div>

                                        {/* AMOUNT PAID */}

                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                                Amount Paid
                                            </label>

                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0.01"
                                                value={
                                                    amountPaid
                                                }
                                                onChange={(e) =>
                                                    setAmountPaid(
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="0.00"
                                                required
                                                className="
                                                    w-full
                                                    rounded-lg
                                                    border
                                                    border-blue-500
                                                    px-3
                                                    py-2.5
                                                    text-sm
                                                    font-semibold
                                                    outline-none
                                                    focus:ring-2
                                                    focus:ring-blue-100
                                                "
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* MODAL FOOTER */}

                            <div
                                className="
                                    flex
                                    justify-end
                                    gap-3
                                    border-t
                                    bg-gray-50
                                    px-6
                                    py-4
                                "
                            >
                                <button
                                    type="button"
                                    onClick={closeAddPayment}
                                    className="
                                        rounded-lg
                                        border
                                        border-gray-300
                                        bg-white
                                        px-5
                                        py-2.5
                                        text-sm
                                        font-medium
                                        text-gray-700
                                        hover:bg-gray-100
                                    "
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="
                                        rounded-lg
                                        bg-blue-700
                                        px-5
                                        py-2.5
                                        text-sm
                                        font-semibold
                                        text-white
                                        hover:bg-blue-800
                                    "
                                >
                                    Save Payment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}