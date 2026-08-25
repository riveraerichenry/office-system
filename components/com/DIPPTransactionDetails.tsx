"use client";

import {
    useEffect,
    useState,
} from "react";


type Props = {
    transactionId?: string | null;
};


export default function DIPPTransactionDetails({
    transactionId,
}: Props) {

    const [
        header,
        setHeader,
    ] = useState<any | null>(null);


    const [
        items,
        setItems,
    ] = useState<any[]>([]);


    const [
        loading,
        setLoading,
    ] = useState(false);


    const [
        error,
        setError,
    ] = useState<string | null>(null);


    useEffect(() => {

        if (!transactionId) {

            setHeader(null);
            setItems([]);
            setError(null);

            return;

        }

        const id = transactionId;

        let cancelled = false;

        async function loadDetails() {

            try {

                setLoading(true);
                setError(null);

                const response = await fetch(
                    `/api/dipp/transaction-details?id=${encodeURIComponent(id)}`,
                    {
                        method: "GET",
                        cache: "no-store",
                    }
                );

                /*
                ========================================================
                CHECK RESPONSE BEFORE PARSING JSON
                ========================================================
                */

                const contentType =
                    response.headers.get(
                        "content-type"
                    ) ?? "";

                const responseText =
                    await response.text();

                if (!contentType.includes("application/json")) {

                    console.error(
                        "DIPP DETAILS RETURNED NON-JSON:",
                        {
                            status: response.status,
                            statusText: response.statusText,
                            url: response.url,
                            contentType,
                            responseText:
                                responseText.substring(
                                    0,
                                    1000
                                ),
                        }
                    );

                    throw new Error(
                        `Transaction details API returned ${response.status} instead of JSON.`
                    );

                }

                const data =
                    JSON.parse(
                        responseText
                    );


                if (!response.ok) {

                    throw new Error(
                        data?.message ??
                        data?.error ??
                        "Failed to load transaction details."
                    );

                }


                if (cancelled) {
                    return;
                }


                setHeader(
                    data?.header ??
                    null
                );


                setItems(
                    Array.isArray(
                        data?.items
                    )
                        ? data.items
                        : []
                );

            }
            catch (err: any) {

                console.error(
                    "LOAD DIPP TRANSACTION DETAILS ERROR:",
                    err
                );


                if (!cancelled) {

                    setHeader(null);
                    setItems([]);

                    setError(
                        err?.message ??
                        "Failed to load transaction details."
                    );

                }

            }
            finally {

                if (!cancelled) {
                    setLoading(false);
                }

            }

        }

        loadDetails();

        return () => {

            cancelled = true;

        };

    }, [
        transactionId,
    ]);

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
                year: "numeric",
                month: "long",
                day: "numeric",
            }
        );

    }


    /*
    ============================================================
    NO TRANSACTION SELECTED
    ============================================================
    */

    if (!transactionId) {

        return (

            <div className="
                flex
                min-h-[400px]
                items-center
                justify-center
                p-6
                text-center
            ">

                <div>

                    <div className="
                        mx-auto
                        mb-3
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-full
                        bg-slate-100
                        text-slate-400
                    ">
                        —
                    </div>


                    <h3 className="
                        font-semibold
                        text-slate-700
                    ">
                        No Transaction Selected
                    </h3>


                    <p className="
                        mt-1
                        text-sm
                        text-slate-500
                    ">
                        Select a DIPP transaction
                        from the list.
                    </p>

                </div>

            </div>

        );

    }


    /*
    ============================================================
    LOADING
    ============================================================
    */

    if (loading) {

        return (

            <div className="
                flex
                min-h-[400px]
                items-center
                justify-center
                text-sm
                text-slate-500
            ">

                Loading transaction details...

            </div>

        );

    }


    /*
    ============================================================
    ERROR
    ============================================================
    */

    if (error) {

        return (

            <div className="p-5">

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

        );

    }


    /*
    ============================================================
    NOT FOUND
    ============================================================
    */

    if (!header) {

        return (

            <div className="
                p-5
                text-sm
                text-slate-500
            ">

                Transaction not found.

            </div>

        );

    }


    return (

        <div className="
            flex
            flex-col
        ">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="
                border-b
                border-slate-200
                px-5
                py-4
            ">

                <h2 className="
                    text-lg
                    font-semibold
                    text-slate-800
                ">
                    Transaction Details
                </h2>


                <p className="
                    mt-1
                    text-xs
                    text-slate-500
                ">
                    DIPP transaction information
                </p>

            </div>


            {/* ==================================================
                DETAILS
            ================================================== */}

            <div className="
                max-h-[calc(100vh-180px)]
                overflow-auto
                p-5
            ">


                {/* OR NUMBER */}

                <DetailRow
                    label="OR Number"
                    value={
                        header.or_number ??
                        "—"
                    }
                />


                {/* RECEIPT DATE */}

                <DetailRow
                    label="Receipt Date"
                    value={
                        formatDate(
                            header.receipt_date
                        )
                    }
                />


                {/* PAYOR */}

                <DetailRow
                    label="Payor"
                    value={
                        header.payor ??
                        "—"
                    }
                />


                {/* PAYMENT MODE */}

                <DetailRow
                    label="Payment Mode"
                    value={
                        header.payment_mode ??
                        "—"
                    }
                />


                {/* STATUS */}

                <DetailRow
                    label="Status"
                    value={
                        header.status ??
                        "—"
                    }
                />


                {/* ACCOUNTABLE FORM */}

                <DetailRow
                    label="Accountable Form"
                    value={
                        header.form_code
                            ? `${header.form_code} - ${
                                header.form_name ??
                                ""
                            }`
                            : (
                                header.form_name ??
                                "—"
                            )
                    }
                />


                {/* ENCODED BY */}

                <DetailRow
                    label="Encoded By"
                    value={
                        header.encoded_by ??
                        "—"
                    }
                />


                {/* ==================================================
                    BOOKLET
                ================================================== */}

                <div className="
                    mt-5
                    rounded-lg
                    border
                    border-slate-200
                    bg-slate-50
                    p-4
                ">

                    <div className="
                        mb-3
                        text-xs
                        font-semibold
                        uppercase
                        tracking-wide
                        text-slate-500
                    ">
                        Booklet Information
                    </div>


                    <div className="space-y-2">

                        <DetailRow
                            label="Booklet No."
                            value={
                                header.booklet_number ??
                                "—"
                            }
                        />


                        <DetailRow
                            label="Fiscal Year"
                            value={
                                header.fiscal_year ??
                                "—"
                            }
                        />


                        <DetailRow
                            label="Series"
                            value={
                                header.series ??
                                "—"
                            }
                        />


                        <DetailRow
                            label="Beginning OR"
                            value={
                                header.beginning_or ??
                                "—"
                            }
                        />


                        <DetailRow
                            label="Ending OR"
                            value={
                                header.ending_or ??
                                "—"
                            }
                        />


                        <DetailRow
                            label="Current OR"
                            value={
                                header.current_or ??
                                "—"
                            }
                        />

                    </div>

                </div>


                {/* ==================================================
                    GRAND TOTAL
                ================================================== */}

                <div className="
                    mt-5
                    rounded-lg
                    border
                    border-slate-200
                    bg-slate-50
                    p-4
                ">

                    <div className="
                        text-xs
                        font-medium
                        uppercase
                        tracking-wide
                        text-slate-400
                    ">
                        Grand Total
                    </div>


                    <div className="
                        mt-1
                        text-2xl
                        font-bold
                        text-slate-800
                    ">

                        ₱
                        {
                            formatAmount(
                                header.grand_total
                            )
                        }

                    </div>

                </div>


                {/* ==================================================
                    TRANSACTION ITEMS
                ================================================== */}

                <div className="mt-5">

                    <div className="
                        mb-3
                        text-sm
                        font-semibold
                        text-slate-700
                    ">
                        Account Items
                    </div>


                    <div className="
                        overflow-hidden
                        rounded-lg
                        border
                        border-slate-200
                    ">

                        {
                            items.length === 0 ? (

                                <div className="
                                    p-4
                                    text-center
                                    text-sm
                                    text-slate-500
                                ">
                                    No transaction items.
                                </div>

                            ) : (

                                <div className="
                                    divide-y
                                    divide-slate-100
                                ">

                                    {
                                        items.map(
                                            (
                                                item,
                                                index
                                            ) => (

                                                <div
                                                    key={
                                                        `${item?.account_code ?? "account"}-${index}`
                                                    }
                                                    className="
                                                        p-3
                                                    "
                                                >

                                                    <div className="
                                                        text-xs
                                                        font-medium
                                                        text-slate-500
                                                    ">

                                                        {
                                                            item?.account_code ??
                                                            "—"
                                                        }

                                                    </div>


                                                    <div className="
                                                        mt-1
                                                        text-sm
                                                        font-medium
                                                        text-slate-800
                                                    ">

                                                        {
                                                            item?.account_name ??
                                                            "—"
                                                        }

                                                    </div>


                                                    <div className="
                                                        mt-1
                                                        text-right
                                                        text-sm
                                                        font-semibold
                                                        text-slate-700
                                                    ">

                                                        ₱
                                                        {
                                                            formatAmount(
                                                                item?.amount
                                                            )
                                                        }

                                                    </div>

                                                </div>

                                            )
                                        )
                                    }

                                </div>

                            )
                        }

                    </div>

                </div>


                {/* ==================================================
                    REMARKS
                ================================================== */}

                {
                    header.remarks && (

                        <div className="mt-5">

                            <div className="
                                text-xs
                                font-medium
                                uppercase
                                tracking-wide
                                text-slate-400
                            ">
                                Remarks
                            </div>


                            <div className="
                                mt-1
                                text-sm
                                text-slate-700
                            ">

                                {
                                    header.remarks
                                }

                            </div>

                        </div>

                    )
                }

            </div>

        </div>

    );

}


/*
============================================================
DETAIL ROW
============================================================
*/

function DetailRow({
    label,
    value,
}: {
    label: string;
    value: any;
}) {

    return (

        <div className="
            flex
            items-start
            justify-between
            gap-4
            border-b
            border-slate-100
            py-2
        ">

            <span className="
                shrink-0
                text-xs
                font-medium
                text-slate-500
            ">
                {label}
            </span>


            <span className="
                max-w-[65%]
                text-right
                text-sm
                font-medium
                text-slate-800
            ">
                {
                    value ?? "—"
                }
            </span>

        </div>

    );

}