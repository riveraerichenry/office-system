"use client";

import {
    Loader2,
    RefreshCw,
} from "lucide-react";

import {
    useEffect,
    useState,
} from "react";

import axios from "axios";

type Transaction = {
    id?: string;

    receipt_number?: string;
    receipt_date?: string;

    payor?: string;
    remarks?: string;

    form_code?: string;

    status?: string;

    amount?: number;
};

type Props = {
    open: boolean;

    fundSourceId: string;

    dateFrom: string;
    dateTo: string;

    loading: boolean;
};

export default function RCDTransactionTable({
    open,
    fundSourceId,
    dateFrom,
    dateTo,
    loading,
}: Props) {

    // =====================================================
    // TRANSACTIONS
    // =====================================================

    const [
        transactions,
        setTransactions,
    ] = useState<Transaction[]>(
        []
    );

    const [
        loadingTransactions,
        setLoadingTransactions,
    ] = useState(false);

    // =====================================================
    // LOAD TRANSACTIONS
    // =====================================================

    async function loadTransactions() {

        if (
            !fundSourceId ||
            !dateFrom ||
            !dateTo ||
            dateFrom > dateTo
        ) {

            setTransactions([]);

            return;
        }

        try {

            setLoadingTransactions(
                true
            );

            const params =
                new URLSearchParams({
                    fund_source_id:
                        fundSourceId,

                    date_from:
                        dateFrom,

                    date_to:
                        dateTo,
                });

            const response =
                await axios.get(
                    `/api/rcd/transactions?${params.toString()}`
                );

            if (
                !response.data?.success
            ) {

                throw new Error(
                    response.data?.message ??
                    "Unable to load transaction items."
                );
            }

            const rows =
                response.data?.transactions;

            setTransactions(
                Array.isArray(rows)
                    ? rows
                    : []
            );

        } catch (error) {

            console.error(
                "RCD TRANSACTION LOAD ERROR:",
                error
            );

            setTransactions([]);

        } finally {

            setLoadingTransactions(
                false
            );

        }
    }

    // =====================================================
    // LOAD WHEN FILTER CHANGES
    // =====================================================

    useEffect(() => {

        if (!open) {
            return;
        }

        loadTransactions();

    }, [
        open,
        fundSourceId,
        dateFrom,
        dateTo,
    ]);

    // =====================================================
    // FORMAT DATE
    // =====================================================

    function formatDate(
        value?: string
    ) {

        if (!value) {
            return "-";
        }

        const cleanDate =
            value.substring(
                0,
                10
            );

        const date =
            new Date(
                `${cleanDate}T00:00:00`
            );

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return value;
        }

        return date.toLocaleDateString(
            "en-PH",
            {
                month: "short",
                day: "2-digit",
                year: "numeric",
            }
        );
    }

    // =====================================================
    // FORMAT AMOUNT
    // =====================================================

    function formatAmount(
        value?: number
    ) {

        return Number(
            value ?? 0
        ).toLocaleString(
            "en-PH",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }
        );
    }

    // =====================================================
    // TOTAL
    // =====================================================

    const totalAmount =
        transactions.reduce(
            (
                total,
                item
            ) =>
                total +
                Number(
                    item.amount ?? 0
                ),
            0
        );

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div
            className="
                overflow-hidden
                rounded-xl
                border
                bg-white
                shadow-sm
            "
        >

            {/* =================================================
                CARD HEADER
            ================================================= */}

            <div
                className="
                    flex
                    items-center
                    justify-between
                    border-b
                    px-5
                    py-3
                "
            >

                <div>

                    <h3
                        className="
                            text-sm
                            font-semibold
                            uppercase
                            tracking-wide
                            text-slate-700
                        "
                    >
                        Transaction Items
                    </h3>

                    <p
                        className="
                            mt-0.5
                            text-xs
                            text-slate-500
                        "
                    >
                        Transactions for the selected
                        fund source and remittance period.
                    </p>

                </div>

                <div
                    className="
                        flex
                        items-center
                        gap-2
                    "
                >

                    <span
                        className="
                            rounded-full
                            bg-slate-100
                            px-2.5
                            py-1
                            text-xs
                            font-semibold
                            text-slate-600
                        "
                    >
                        {transactions.length}
                        {" "}
                        {transactions.length === 1
                            ? "transaction"
                            : "transactions"}
                    </span>

                    <button
                        type="button"
                        onClick={
                            loadTransactions
                        }
                        disabled={
                            loadingTransactions ||
                            loading ||
                            !fundSourceId
                        }
                        title="Refresh transactions"
                        className="
                            rounded-lg
                            border
                            border-slate-300
                            bg-white
                            p-1.5
                            text-slate-500
                            transition
                            hover:bg-slate-50
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                    >

                        {loadingTransactions ? (

                            <Loader2
                                size={16}
                                className="
                                    animate-spin
                                "
                            />

                        ) : (

                            <RefreshCw
                                size={16}
                            />

                        )}

                    </button>

                </div>

            </div>

            {/* =================================================
                TABLE
            ================================================= */}

            <div
                className="
                    overflow-x-auto
                "
            >

                <table
                    className="
                        w-full
                        table-fixed
                        text-xs
                    "
                >

                    <thead>

                        <tr
                            className="
                                border-b
                                bg-slate-50
                            "
                        >

                            <th
                                className="
                                    w-[13%]
                                    px-3
                                    py-2.5
                                    text-left
                                    font-semibold
                                    text-slate-500
                                "
                            >
                                Receipt No.
                            </th>

                            <th
                                className="
                                    w-[13%]
                                    px-3
                                    py-2.5
                                    text-left
                                    font-semibold
                                    text-slate-500
                                "
                            >
                                Receipt Date
                            </th>

                            <th
                                className="
                                    w-[16%]
                                    px-3
                                    py-2.5
                                    text-left
                                    font-semibold
                                    text-slate-500
                                "
                            >
                                Payor
                            </th>

                            <th
                                className="
                                    w-[20%]
                                    px-3
                                    py-2.5
                                    text-left
                                    font-semibold
                                    text-slate-500
                                "
                            >
                                Remarks
                            </th>

                            <th
                                className="
                                    w-[12%]
                                    px-3
                                    py-2.5
                                    text-left
                                    font-semibold
                                    text-slate-500
                                "
                            >
                                Form Code
                            </th>

                            <th
                                className="
                                    w-[10%]
                                    px-3
                                    py-2.5
                                    text-left
                                    font-semibold
                                    text-slate-500
                                "
                            >
                                Status
                            </th>

                            <th
                                className="
                                    w-[16%]
                                    px-3
                                    py-2.5
                                    text-right
                                    font-semibold
                                    text-slate-500
                                "
                            >
                                Amount
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {/* =====================================
                            LOADING
                        ====================================== */}

                        {loadingTransactions ? (

                            <tr>

                                <td
                                    colSpan={7}
                                    className="
                                        px-4
                                        py-10
                                        text-center
                                    "
                                >

                                    <div
                                        className="
                                            flex
                                            items-center
                                            justify-center
                                            gap-2
                                            text-xs
                                            text-slate-500
                                        "
                                    >

                                        <Loader2
                                            size={16}
                                            className="
                                                animate-spin
                                            "
                                        />

                                        Loading transactions...

                                    </div>

                                </td>

                            </tr>

                        ) : !fundSourceId ? (

                            /* =================================
                                NO FUND SOURCE
                            ================================== */

                            <tr>

                                <td
                                    colSpan={7}
                                    className="
                                        px-4
                                        py-10
                                        text-center
                                        text-xs
                                        text-slate-400
                                    "
                                >
                                    Select a fund source to
                                    load transaction items.
                                </td>

                            </tr>

                        ) : transactions.length === 0 ? (

                            /* =================================
                                EMPTY
                            ================================== */

                            <tr>

                                <td
                                    colSpan={7}
                                    className="
                                        px-4
                                        py-10
                                        text-center
                                        text-xs
                                        text-slate-400
                                    "
                                >
                                    No transaction items found
                                    for the selected criteria.
                                </td>

                            </tr>

                        ) : (

                            /* =================================
                                ROWS
                            ================================== */

                            transactions.map(
                                (
                                    transaction,
                                    index
                                ) => (

                                    <tr
                                        key={
                                            transaction.id ??
                                            index
                                        }
                                        className="
                                            border-b
                                            last:border-b-0
                                            hover:bg-slate-50
                                        "
                                    >

                                        {/* RECEIPT NUMBER */}

                                        <td
                                            className="
                                                truncate
                                                px-3
                                                py-2.5
                                                font-medium
                                                text-slate-800
                                            "
                                        >
                                            {
                                                transaction.receipt_number ??
                                                "-"
                                            }
                                        </td>

                                        {/* RECEIPT DATE */}

                                        <td
                                            className="
                                                truncate
                                                px-3
                                                py-2.5
                                                text-slate-600
                                            "
                                        >
                                            {
                                                formatDate(
                                                    transaction.receipt_date
                                                )
                                            }
                                        </td>

                                        {/* PAYOR */}

                                        <td
                                            className="
                                                max-w-0
                                                truncate
                                                px-3
                                                py-2.5
                                                text-slate-700
                                            "
                                            title={
                                                transaction.payor ??
                                                ""
                                            }
                                        >
                                            {
                                                transaction.payor ??
                                                "-"
                                            }
                                        </td>

                                        {/* REMARKS */}

                                        <td
                                            className="
                                                max-w-0
                                                truncate
                                                px-3
                                                py-2.5
                                                text-slate-600
                                            "
                                            title={
                                                transaction.remarks ??
                                                ""
                                            }
                                        >
                                            {
                                                transaction.remarks ??
                                                "-"
                                            }
                                        </td>

                                        {/* FORM CODE */}

                                        <td
                                            className="
                                                truncate
                                                px-3
                                                py-2.5
                                                font-medium
                                                text-slate-700
                                            "
                                        >
                                            {
                                                transaction.form_code ??
                                                "-"
                                            }
                                        </td>

                                        {/* STATUS */}

                                        <td
                                            className="
                                                px-3
                                                py-2.5
                                            "
                                        >

                                            <span
                                                className="
                                                    inline-flex
                                                    max-w-full
                                                    truncate
                                                    rounded-full
                                                    bg-slate-100
                                                    px-2
                                                    py-0.5
                                                    text-[10px]
                                                    font-medium
                                                    text-slate-600
                                                "
                                            >
                                                {
                                                    transaction.status ??
                                                    "-"
                                                }
                                            </span>

                                        </td>

                                        {/* AMOUNT */}

                                        <td
                                            className="
                                                whitespace-nowrap
                                                px-3
                                                py-2.5
                                                text-right
                                                font-semibold
                                                text-slate-800
                                            "
                                        >
                                            ₱{" "}
                                            {
                                                formatAmount(
                                                    transaction.amount
                                                )
                                            }
                                        </td>

                                    </tr>

                                )
                            )

                        )}

                    </tbody>

                    {/* =================================================
                        TOTAL
                    ================================================= */}

                    {transactions.length > 0 && (

                        <tfoot>

                            <tr
                                className="
                                    border-t
                                    bg-slate-50
                                "
                            >

                                <td
                                    colSpan={6}
                                    className="
                                        px-3
                                        py-2.5
                                        text-right
                                        font-bold
                                        text-slate-700
                                    "
                                >
                                    Total
                                </td>

                                <td
                                    className="
                                        px-3
                                        py-2.5
                                        text-right
                                        font-bold
                                        text-slate-900
                                    "
                                >
                                    ₱{" "}
                                    {
                                        formatAmount(
                                            totalAmount
                                        )
                                    }
                                </td>

                            </tr>

                        </tfoot>

                    )}

                </table>

            </div>

        </div>
    );
}