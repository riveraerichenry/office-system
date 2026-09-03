"use client";

type Props = {
    loading: boolean;

    results: any[];

    selected: any;

    /*
    ================================================================
    PAYOR
    ================================================================
    */

    payor: string;

    onPayorChange: (
        value: string
    ) => void;


    /*
    ================================================================
    PAYMENT MODE
    ================================================================
    */

    paymentMode: string;

    onPaymentModeChange: (
        value: string
    ) => void;


    /*
    ================================================================
    BILLING SELECT
    ================================================================
    */

    onSelect: (
        row: any
    ) => void;
};


export default function AF56BillingResults({

    loading,

    results,

    selected,


    /*
    ================================================================
    PAYOR
    ================================================================
    */

    payor,

    onPayorChange,


    /*
    ================================================================
    PAYMENT MODE
    ================================================================
    */

    paymentMode,

    onPaymentModeChange,


    /*
    ================================================================
    SELECT
    ================================================================
    */

    onSelect,

}: Props) {


    /*
    ================================================================
    PAYMENT MODES
    ================================================================
    */

    const PAYMENT_MODES = [

        "Cash",

        "Check",

        "Cash + Check",

    ];


    return (

        <div className="space-y-6">


            {/* =====================================================
                SEARCH RESULTS
            ===================================================== */}

            {(!selected || loading || results.length > 0) && (

                <>

                    {/* =============================================
                        LOADING
                    ============================================= */}

                    {loading ? (

                        <div className="rounded-lg border border-dashed py-12 text-center text-sm text-slate-500">

                            Searching billings...

                        </div>

                    ) : results.length === 0 ? (

                        /* =========================================
                            NO RESULTS
                        ========================================= */

                        <div className="rounded-lg border border-dashed py-12 text-center text-sm text-slate-500">

                            No billing records found.

                        </div>

                    ) : (

                        /* =========================================
                            RESULTS
                        ========================================= */

                        <div className="space-y-3">

                            {results.map((row) => (

                                <button
                                    key={row.id}
                                    type="button"
                                    onClick={() =>
                                        onSelect(row)
                                    }
                                    className="flex w-full items-center gap-4 border-b px-4 py-3 text-left transition hover:bg-blue-50 last:border-b-0"
                                >

                                    <div className="min-w-0 flex-1">

                                        <div className="truncate text-sm">


                                            {/* DECLARED OWNER */}

                                            <span className="font-semibold text-blue-700">

                                                {row.owner_name}

                                            </span>


                                            <span className="mx-2 text-slate-300">

                                                •

                                            </span>


                                            {/* PIN */}

                                            <span className="text-slate-600">

                                                {row.fullpin}

                                            </span>


                                            <span className="mx-2 text-slate-300">

                                                •

                                            </span>


                                            {/* TD NUMBER */}

                                            <span className="text-slate-600">

                                                TD {row.td_number}

                                            </span>


                                            <span className="mx-2 text-slate-300">

                                                •

                                            </span>


                                            {/* LOCATION */}

                                            <span className="text-slate-600">

                                                {row.location}

                                            </span>


                                            <span className="mx-2 text-slate-300">

                                                •

                                            </span>


                                            {/* CLASSIFICATION */}

                                            <span className="font-medium text-slate-700">

                                                {row.classification_name}

                                            </span>


                                        </div>

                                    </div>


                                    {/* =================================
                                        GRAND TOTAL
                                    ================================= */}

                                    <div className="whitespace-nowrap text-right">

                                        <div className="font-semibold text-green-700">

                                            ₱

                                            {Number(
                                                row.grand_total ?? 0
                                            ).toLocaleString(
                                                "en-PH",
                                                {
                                                    minimumFractionDigits: 2,
                                                }
                                            )}

                                        </div>

                                    </div>


                                </button>

                            ))}

                        </div>

                    )}

                </>

            )}


            {/* =====================================================
                SELECTED BILLING INFORMATION
            ===================================================== */}

            {selected &&
                !loading &&
                results.length === 0 && (

                    <div className="overflow-hidden rounded-xl border bg-white">


                        {/* =========================================
                            HEADER
                        ========================================= */}

                        <div className="border-b bg-slate-50 px-6 py-5">


                            <div className="flex flex-wrap items-start justify-between gap-6">


                                {/* DECLARED OWNER */}

                                <div>

                                    <h2 className="text-xl font-semibold text-slate-800">

                                        {selected.owner_name}

                                    </h2>


                                    <p className="mt-1 text-sm text-slate-500">

                                        Billing No.{" "}

                                        {selected.billing_number}

                                    </p>

                                </div>


                                {/* GRAND TOTAL */}

                                <div className="text-right">

                                    <div className="text-xs uppercase tracking-wide text-slate-500">

                                        Grand Total

                                    </div>


                                    <div className="text-3xl font-bold text-green-700">

                                        ₱

                                        {Number(
                                            selected.grand_total ?? 0
                                        ).toLocaleString(
                                            "en-PH",
                                            {
                                                minimumFractionDigits: 2,
                                            }
                                        )}

                                    </div>

                                </div>


                            </div>


                            {/* =====================================
                                BILLING DETAILS
                            ===================================== */}

                            <div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-3 text-sm lg:grid-cols-4">


                                {/* PIN */}

                                <div>

                                    <div className="text-xs uppercase text-slate-500">

                                        PIN

                                    </div>

                                    <div className="font-medium">

                                        {selected.fullpin}

                                    </div>

                                </div>


                                {/* TD NUMBER */}

                                <div>

                                    <div className="text-xs uppercase text-slate-500">

                                        TD Number

                                    </div>

                                    <div className="font-medium">

                                        {selected.td_number}

                                    </div>

                                </div>


                                {/* CLASSIFICATION */}

                                <div>

                                    <div className="text-xs uppercase text-slate-500">

                                        Classification

                                    </div>

                                    <div className="font-medium">

                                        {selected.classification_name}

                                    </div>

                                </div>


                                {/* STATUS */}

                                <div>

                                    <div className="text-xs uppercase text-slate-500">

                                        Status

                                    </div>

                                    <div className="font-medium">

                                        {selected.status}

                                    </div>

                                </div>


                                {/* PROPERTY LOCATION */}

                                <div className="col-span-2">

                                    <div className="text-xs uppercase text-slate-500">

                                        Property Location

                                    </div>

                                    <div className="font-medium">

                                        {selected.location}

                                    </div>

                                </div>


                                {/* BILLING DATE */}

                                <div>

                                    <div className="text-xs uppercase text-slate-500">

                                        Billing Date

                                    </div>

                                    <div className="font-medium">

                                        {selected.billing_date
                                            ? new Date(
                                                selected.billing_date
                                            ).toLocaleDateString(
                                                "en-PH",
                                                {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                }
                                            )
                                            : "-"
                                        }

                                    </div>

                                </div>


                            </div>

                        </div>


                        {/* =========================================
                            PAYMENT INFORMATION
                        ========================================= */}

                        <div className="p-6">


                            <div className="grid grid-cols-2 gap-6 p-5">


                                {/* =================================
                                    PAYOR

                                    This is NOT the declared owner.

                                    This value comes from the parent
                                    and will later be sent to:

                                    dipp_transactions.payor
                                ================================= */}

                                <div>

                                    <label className="text-xs font-medium uppercase tracking-wide text-slate-500">

                                        Payor

                                    </label>


                                    <input
                                        value={payor}
                                        onChange={(e) =>
                                            onPayorChange(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter payor name..."
                                        className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                    />

                                </div>


                                {/* =================================
                                    PAYMENT MODE
                                ================================= */}

                                <div>

                                    <label className="text-xs font-medium uppercase tracking-wide text-slate-500">

                                        Payment Mode

                                    </label>


                                    <div className="mt-2 flex overflow-hidden rounded-lg border border-slate-300">


                                        {PAYMENT_MODES.map(
                                            (mode) => (

                                                <button
                                                    key={mode}
                                                    type="button"
                                                    onClick={() =>
                                                        onPaymentModeChange(
                                                            mode
                                                        )
                                                    }
                                                    className={`flex-1 border-l first:border-l-0 px-4 py-3 text-sm font-medium transition ${
                                                        paymentMode === mode
                                                            ? "bg-blue-600 text-white"
                                                            : "bg-white text-slate-700 hover:bg-slate-100"
                                                    }`}
                                                >

                                                    {mode}

                                                </button>

                                            )
                                        )}


                                    </div>

                                </div>


                            </div>


                        </div>


                    </div>

                )}

        </div>

    );

}