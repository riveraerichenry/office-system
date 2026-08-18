"use client";

import {
    useState,
} from "react";

import {
    X,
    Printer,
    CheckCircle2,
} from "lucide-react";

import RCDGenerateForm from "./rcd/RCDGenerateForm";

import RCDPreview from "./rcd/RCDPreview";

import {
    RCD,
    RCDItem,
    RCDFundSource,
    RCDUser,
    RCDFormRow,
} from "./rcd/RCDTypes";


// ============================================================
// PROPS
// ============================================================

type Props = {
    open: boolean;
    onClose: () => void;
};


// ============================================================
// GENERATED RCD RESPONSE
// ============================================================

type GeneratedRCD = {

    rcd: RCD;

    items: RCDItem[];

    summary: {
        transaction_count: number;
        total_collections: number;
        total_remittances: number;
        total_deposits: number;
        balance: number;
    };

    fund_source: RCDFundSource;

    user: RCDUser;

    previous_form_rows: RCDFormRow[];
};


// ============================================================
// COMPONENT
// ============================================================

export default function GenerateRCDModal({
    open,
    onClose,
}: Props) {

    // =========================================================
    // FORM STATE
    // =========================================================

    const [
        fundSourceId,
        setFundSourceId,
    ] = useState("");


    const [
        dateFrom,
        setDateFrom,
    ] = useState("");


    const [
        dateTo,
        setDateTo,
    ] = useState("");


    // =========================================================
    // GENERATED RCD
    // =========================================================

    const [
        generatedRCD,
        setGeneratedRCD,
    ] = useState<GeneratedRCD | null>(
        null
    );


    // =========================================================
    // GENERATING
    // =========================================================

    const [
        generating,
        setGenerating,
    ] = useState(false);


    // =========================================================
    // ERROR
    // =========================================================

    const [
        error,
        setError,
    ] = useState("");


    // =========================================================
    // DON'T RENDER
    // =========================================================

    if (!open) {
        return null;
    }


    // =========================================================
    // GENERATE RCD
    // =========================================================

    const handleGenerateRCD =
        async () => {

            setError("");


            // -----------------------------------------------
            // VALIDATION
            // -----------------------------------------------

            if (!fundSourceId) {

                setError(
                    "Please select a fund source."
                );

                return;
            }


            if (!dateFrom) {

                setError(
                    "Please select the beginning date."
                );

                return;
            }


            if (!dateTo) {

                setError(
                    "Please select the ending date."
                );

                return;
            }


            if (
                dateFrom >
                dateTo
            ) {

                setError(
                    "Beginning date cannot be later than ending date."
                );

                return;
            }


            // -----------------------------------------------
            // START
            // -----------------------------------------------

            setGenerating(true);


            try {

                const response =
                    await fetch(
                        "/api/rcd",
                        {
                            method:
                                "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",
                            },

                            body:
                                JSON.stringify(
                                    {
                                        fund_source_id:
                                            fundSourceId,

                                        date_from:
                                            dateFrom,

                                        date_to:
                                            dateTo,
                                    }
                                ),
                        }
                    );


                const data =
                    await response.json();


                // -------------------------------------------
                // API ERROR
                // -------------------------------------------

                if (
                    !response.ok ||
                    !data.success
                ) {

                    throw new Error(
                        data.message ||
                        "Failed to generate RCD."
                    );
                }


                // -------------------------------------------
                // SAVE GENERATED RCD
                // -------------------------------------------

                setGeneratedRCD(
                    data
                );


            } catch (
                error: any
            ) {

                console.error(
                    "GENERATE RCD ERROR:",
                    error
                );


                setError(
                    error?.message ||
                    "Failed to generate RCD."
                );


            } finally {

                setGenerating(false);

            }
        };


    // =========================================================
    // PRINT
    // =========================================================

    const handlePrint =
        () => {

            if (
                !generatedRCD
            ) {
                return;
            }


            /*
             * IMPORTANT:
             *
             * window.print() opens the browser's
             * print dialog.
             *
             * It does NOT select a printer itself.
             *
             * The user can then choose the
             * desired Windows printer.
             */

            window.print();
        };


    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div
            className="
                fixed
                inset-0
                z-[70]
                flex
                items-center
                justify-center
                bg-black/50
                p-4
            "
        >

            <div
                className="
                    flex
                    h-[95vh]
                    w-full
                    max-w-[1500px]
                    flex-col
                    overflow-hidden
                    rounded-xl
                    bg-white
                    shadow-2xl
                "
            >

                {/* =====================================================
                    HEADER
                ====================================================== */}

                <div
                    className="
                        flex
                        shrink-0
                        items-center
                        justify-between
                        border-b
                        bg-white
                        px-6
                        py-4
                    "
                >

                    <div>

                        <h2
                            className="
                                text-lg
                                font-bold
                                text-slate-900
                            "
                        >
                            Generate RCD
                        </h2>

                        <p
                            className="
                                text-sm
                                text-slate-500
                            "
                        >
                            Report of Collections and Deposits
                        </p>

                    </div>


                    {/* =================================================
                        CLOSE X
                    ================================================== */}

                    <button
                        type="button"
                        onClick={onClose}
                        className="
                            rounded-lg
                            p-2
                            text-slate-500
                            transition
                            hover:bg-slate-100
                            hover:text-slate-900
                        "
                        title="Close"
                    >

                        <X
                            size={22}
                        />

                    </button>

                </div>


                {/* =====================================================
                    ERROR
                ====================================================== */}

                {error && (

                    <div
                        className="
                            shrink-0
                            border-b
                            border-red-200
                            bg-red-50
                            px-6
                            py-3
                            text-sm
                            font-semibold
                            text-red-700
                        "
                    >

                        {error}

                    </div>

                )}


                {/* =====================================================
                    BODY
                ====================================================== */}

                <div
                    className="
                        min-h-0
                        flex-1
                        overflow-hidden
                    "
                >

                    <div
                        className="
                            grid
                            h-full
                            grid-cols-1
                            lg:grid-cols-[480px_minmax(0,1fr)]
                        "
                    >

                        {/* =================================================
                            LEFT
                        ================================================== */}

                        <div
                            className="
                                min-h-0
                                overflow-y-auto
                                border-r
                                bg-slate-50
                                p-5
                            "
                        >

                            <RCDGenerateForm

                                fundSourceId={
                                    fundSourceId
                                }

                                setFundSourceId={
                                    setFundSourceId
                                }

                                dateFrom={
                                    dateFrom
                                }

                                setDateFrom={
                                    setDateFrom
                                }

                                dateTo={
                                    dateTo
                                }

                                setDateTo={
                                    setDateTo
                                }

                            />

                        </div>


                        {/* =================================================
                            RIGHT - PREVIEW
                        ================================================== */}

                        <div
                            className="
                                min-h-0
                                overflow-y-auto
                                bg-slate-200
                            "
                        >

                            <RCDPreview
                                rcd={
                                    generatedRCD?.rcd ??
                                    null
                                }

                                items={
                                    generatedRCD?.items ??
                                    []
                                }

                                fundSource={
                                    generatedRCD?.fund_source ??
                                    null
                                }

                                user={
                                    generatedRCD?.user ??
                                    null
                                }

                                previousFormRows={
                                    generatedRCD?.previous_form_rows ??
                                    []
                                }
                            />

                        </div>

                    </div>

                </div>


                {/* =====================================================
                    FOOTER
                ====================================================== */}

                <div
                    className="
                        flex
                        shrink-0
                        items-center
                        justify-between
                        border-t
                        bg-white
                        px-6
                        py-4
                    "
                >

                    {/* =================================================
                        STATUS
                    ================================================== */}

                    <div>

                        {generatedRCD ? (

                            <div
                                className="
                                    flex
                                    items-center
                                    gap-2
                                    text-sm
                                    font-semibold
                                    text-green-700
                                "
                            >

                                <CheckCircle2
                                    size={18}
                                />

                                <span>
                                    RCD Generated:
                                </span>

                                <span
                                    className="
                                        font-bold
                                    "
                                >
                                    {
                                        generatedRCD
                                            .rcd
                                            .report_no
                                    }
                                </span>

                            </div>

                        ) : (

                            <span
                                className="
                                    text-xs
                                    font-medium
                                    text-slate-400
                                "
                            >
                                Select the fund source and date range.
                            </span>

                        )}

                    </div>


                    {/* =================================================
                        ACTIONS
                    ================================================== */}

                    <div
                        className="
                            flex
                            items-center
                            gap-3
                        "
                    >

                        {/* =============================================
                            PRINT

                            Only appears after RCD generation.
                        ============================================== */}

                        {generatedRCD && (

                            <button
                                type="button"
                                onClick={
                                    handlePrint
                                }
                                className="
                                    flex
                                    items-center
                                    gap-2
                                    rounded-lg
                                    border
                                    border-slate-300
                                    bg-white
                                    px-5
                                    py-2
                                    text-sm
                                    font-semibold
                                    text-slate-700
                                    transition
                                    hover:bg-slate-50
                                "
                            >

                                <Printer
                                    size={17}
                                />

                                Print

                            </button>

                        )}


                        {/* =============================================
                            GENERATE RCD
                        ============================================== */}

                        <button
                            type="button"
                            onClick={
                                handleGenerateRCD
                            }
                            disabled={
                                generating
                            }
                            className="
                                rounded-lg
                                bg-blue-600
                                px-5
                                py-2
                                text-sm
                                font-semibold
                                text-white
                                transition
                                hover:bg-blue-700
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
                        >

                            {generating
                                ? "Generating..."
                                : generatedRCD
                                    ? "Generate New RCD"
                                    : "Generate RCD"}

                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
}