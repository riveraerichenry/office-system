"use client";

import {
    useEffect,
    useState,
} from "react";

type Props = {
    selectedTransaction?: any | null;

    onSelectTransaction: (
        transaction: any
    ) => void;
};

export default function DIPPTransactionList({
    selectedTransaction,
    onSelectTransaction,
}: Props) {

    const [
        transactions,
        setTransactions,
    ] = useState<any[]>([]);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        error,
        setError,
    ] = useState<string | null>(null);


    useEffect(() => {

        let cancelled = false;


        async function loadTransactions() {

            try {

                setLoading(true);
                setError(null);


                const response =
                    await fetch(
                        "/api/com/dipp-transactions",
                        {
                            method: "GET",
                            cache: "no-store",
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data?.message ??
                        data?.error ??
                        "Failed to load DIPP transactions."
                    );

                }


                if (cancelled) {
                    return;
                }


                const rows =
                    Array.isArray(data)
                        ? data
                        : Array.isArray(data?.data)
                            ? data.data
                            : [];


                setTransactions(rows);

            }
            catch (err: any) {

                console.error(
                    "LOAD DIPP TRANSACTIONS ERROR:",
                    err
                );


                if (!cancelled) {

                    setTransactions([]);

                    setError(
                        err?.message ??
                        "Failed to load DIPP transactions."
                    );

                }

            }
            finally {

                if (!cancelled) {
                    setLoading(false);
                }

            }

        }


        loadTransactions();


        return () => {
            cancelled = true;
        };

    }, []);


    function formatAmount(
        value: any
    ): string {

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


    function formatDate(
        value: any
    ): string {

        if (!value) {
            return "—";
        }


        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return String(value);

        }


        return date.toLocaleDateString(
            "en-PH",
            {
                month: "2-digit",
                day: "2-digit",
                year: "numeric",
            }
        );

    }


    return (

        <div className="
            flex
            h-full
            flex-col
        ">

            {/* ====================================================
                HEADER
            ==================================================== */}

            <div className="
                flex
                shrink-0
                items-center
                justify-between
                border-b
                border-slate-200
                px-5
                py-4
            ">

                <div>

                    <h2 className="
                        text-lg
                        font-semibold
                        text-slate-800
                    ">
                        DIPP Transactions
                    </h2>


                    <p className="
                        mt-1
                        text-xs
                        text-slate-500
                    ">
                        Select a transaction to view its details.
                    </p>

                </div>


                <div className="
                    rounded-full
                    bg-slate-100
                    px-3
                    py-1
                    text-xs
                    font-medium
                    text-slate-600
                ">

                    {transactions.length} records

                </div>

            </div>


            {/* ====================================================
                ERROR
            ==================================================== */}

            {
                !loading &&
                error && (

                    <div className="p-4">

                        <div className="
                            rounded-lg
                            border
                            border-red-200
                            bg-red-50
                            p-4
                            text-sm
                            text-red-600
                        ">

                            {error}

                        </div>

                    </div>

                )
            }


            {/* ====================================================
                TABLE
            ==================================================== */}

            {
                !loading &&
                !error && (

                    <div className="
                        min-h-0
                        flex-1
                        overflow-auto
                    ">

                        {
                            transactions.length === 0 ? (

                                <div className="
                                    flex
                                    min-h-[300px]
                                    items-center
                                    justify-center
                                    text-sm
                                    text-slate-500
                                ">
                                    No DIPP transactions found.
                                </div>

                            ) : (

                                <table className="
                                    w-full
                                    border-collapse
                                    text-xs
                                ">

                                    <thead className="
                                        sticky
                                        top-0
                                        z-10
                                        bg-slate-100
                                    ">

                                        <tr>

                                            <th className="
                                                whitespace-nowrap
                                                border-b
                                                border-r
                                                border-slate-300
                                                px-3
                                                py-2
                                                text-left
                                                font-semibold
                                                text-slate-700
                                            ">
                                                Receipt No
                                            </th>


                                            <th className="
                                                whitespace-nowrap
                                                border-b
                                                border-r
                                                border-slate-300
                                                px-3
                                                py-2
                                                text-left
                                                font-semibold
                                                text-slate-700
                                            ">
                                                Receipt Date
                                            </th>


                                            <th className="
                                                min-w-[190px]
                                                border-b
                                                border-r
                                                border-slate-300
                                                px-3
                                                py-2
                                                text-left
                                                font-semibold
                                                text-slate-700
                                            ">
                                                Payor
                                            </th>


                                            <th className="
                                                min-w-[180px]
                                                border-b
                                                border-r
                                                border-slate-300
                                                px-3
                                                py-2
                                                text-left
                                                font-semibold
                                                text-slate-700
                                            ">
                                                Remarks
                                            </th>


                                            <th className="
                                                whitespace-nowrap
                                                border-b
                                                border-r
                                                border-slate-300
                                                px-3
                                                py-2
                                                text-center
                                                font-semibold
                                                text-slate-700
                                            ">
                                                Type
                                            </th>


                                            <th className="
                                                whitespace-nowrap
                                                border-b
                                                border-r
                                                border-slate-300
                                                px-3
                                                py-2
                                                text-center
                                                font-semibold
                                                text-slate-700
                                            ">
                                                Fund
                                            </th>


                                            <th className="
                                                whitespace-nowrap
                                                border-b
                                                border-r
                                                border-slate-300
                                                px-3
                                                py-2
                                                text-left
                                                font-semibold
                                                text-slate-700
                                            ">
                                                Officer
                                            </th>


                                            <th className="
                                                whitespace-nowrap
                                                border-b
                                                border-r
                                                border-slate-300
                                                px-3
                                                py-2
                                                text-center
                                                font-semibold
                                                text-slate-700
                                            ">
                                                Status
                                            </th>


                                            <th className="
                                                whitespace-nowrap
                                                border-b
                                                border-slate-300
                                                px-3
                                                py-2
                                                text-right
                                                font-semibold
                                                text-slate-700
                                            ">
                                                Amount
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {
                                            transactions.map(
                                                (
                                                    transaction,
                                                    index
                                                ) => {

                                                    const id =
                                                        transaction?.id ??
                                                        index;


                                                    const isSelected =
                                                        selectedTransaction?.id ===
                                                        transaction?.id;


                                                    return (

                                                        <tr
                                                            key={id}
                                                            onClick={() =>
                                                                onSelectTransaction(
                                                                    transaction
                                                                )
                                                            }
                                                            className={`
                                                                cursor-pointer
                                                                transition
                                                                ${
                                                                    isSelected
                                                                        ? "bg-blue-50"
                                                                        : "hover:bg-slate-50"
                                                                }
                                                            `}
                                                        >

                                                            {/* RECEIPT NO */}

                                                            <td className="
                                                                whitespace-nowrap
                                                                border-b
                                                                border-r
                                                                border-slate-200
                                                                px-3
                                                                py-2
                                                                font-medium
                                                                text-blue-700
                                                            ">

                                                                {
                                                                    transaction?.or_number ??
                                                                    transaction?.or_no ??
                                                                    "—"
                                                                }

                                                            </td>


                                                            {/* DATE */}

                                                            <td className="
                                                                whitespace-nowrap
                                                                border-b
                                                                border-r
                                                                border-slate-200
                                                                px-3
                                                                py-2
                                                                text-slate-700
                                                            ">

                                                                {
                                                                    formatDate(
                                                                        transaction?.receipt_date ??
                                                                        transaction?.transaction_date ??
                                                                        transaction?.date
                                                                    )
                                                                }

                                                            </td>


                                                            {/* PAYOR */}

                                                            <td className="
                                                                max-w-[220px]
                                                                border-b
                                                                border-r
                                                                border-slate-200
                                                                px-3
                                                                py-2
                                                                text-slate-800
                                                            ">

                                                                <div className="
                                                                    truncate
                                                                    font-medium
                                                                ">

                                                                    {
                                                                        transaction?.payor ??
                                                                        transaction?.payor_name ??
                                                                        "—"
                                                                    }

                                                                </div>

                                                            </td>


                                                            {/* REMARKS */}

                                                            <td className="
                                                                max-w-[220px]
                                                                border-b
                                                                border-r
                                                                border-slate-200
                                                                px-3
                                                                py-2
                                                                text-slate-600
                                                            ">

                                                                <div className="
                                                                    truncate
                                                                ">

                                                                    {
                                                                        transaction?.remarks ??
                                                                        "—"
                                                                    }

                                                                </div>

                                                            </td>


                                                            {/* TYPE */}

                                                            <td className="
                                                                whitespace-nowrap
                                                                border-b
                                                                border-r
                                                                border-slate-200
                                                                px-3
                                                                py-2
                                                                text-center
                                                                text-slate-700
                                                            ">
                                                                {
                                                                    transaction?.payment_mode ??
                                                                    "—"
                                                                }
                                                            </td>


                                                            {/* FUND */}

                                                            <td className="
                                                                whitespace-nowrap
                                                                border-b
                                                                border-r
                                                                border-slate-200
                                                                px-3
                                                                py-2
                                                                text-center
                                                                text-slate-700
                                                            ">
                                                                {
                                                                    transaction?.fund_code ??
                                                                    "—"
                                                                }
                                                            </td>


                                                            {/* OFFICER */}

                                                            <td className="
                                                                whitespace-nowrap
                                                                border-b
                                                                border-r
                                                                border-slate-200
                                                                px-3
                                                                py-2
                                                                text-slate-700
                                                            ">

                                                                {
                                                                    transaction?.encoded_by_name ??
                                                                    transaction?.encoded_by ??
                                                                    transaction?.officer ??
                                                                    "—"
                                                                }

                                                            </td>


                                                            {/* STATUS */}

                                                            <td className="
                                                                whitespace-nowrap
                                                                border-b
                                                                border-r
                                                                border-slate-200
                                                                px-3
                                                                py-2
                                                                text-center
                                                            ">

                                                                <span className={`
                                                                    inline-flex
                                                                    rounded-full
                                                                    px-2
                                                                    py-0.5
                                                                    text-[10px]
                                                                    font-semibold
                                                                    ${
                                                                        String(
                                                                            transaction?.status ??
                                                                            ""
                                                                        ).toUpperCase() ===
                                                                        "ISSUED"
                                                                            ? "bg-green-100 text-green-700"
                                                                            : "bg-slate-100 text-slate-600"
                                                                    }
                                                                `}>

                                                                    {
                                                                        transaction?.status ??
                                                                        "—"
                                                                    }

                                                                </span>

                                                            </td>


                                                            {/* AMOUNT */}

                                                            <td className="
                                                                whitespace-nowrap
                                                                border-b
                                                                border-slate-200
                                                                px-3
                                                                py-2
                                                                text-right
                                                                font-semibold
                                                                text-slate-800
                                                            ">

                                                                ₱
                                                                {
                                                                    formatAmount(
                                                                        transaction?.grand_total ??
                                                                        transaction?.amount
                                                                    )
                                                                }

                                                            </td>

                                                        </tr>

                                                    );

                                                }
                                            )
                                        }

                                    </tbody>

                                </table>

                            )
                        }

                    </div>

                )
            }


            {/* ====================================================
                LOADING
            ==================================================== */}

            {
                loading && (

                    <div className="
                        flex
                        min-h-[300px]
                        items-center
                        justify-center
                        text-sm
                        text-slate-500
                    ">

                        Loading transactions...

                    </div>

                )
            }

        </div>

    );

}