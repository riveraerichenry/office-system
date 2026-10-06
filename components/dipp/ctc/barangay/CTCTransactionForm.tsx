"use client";

import { useEffect, useState } from "react";

import axios from "axios";

import {
    BookOpen,
    ChevronDown,
    Loader2,
    X,
} from "lucide-react";

import IndividualInformation from "./IndividualInformation";
import TaxComputation from "./TaxComputation";

interface Booklet {
    id: string;

    form_code?: string | null;

    beginning_or?: number | string | null;

    ending_or?: number | string | null;

    current_or?: number | string | null;
}

interface Props {
    open: boolean;

    onClose: () => void;
}

interface ComputedValues {
    basicTax: number;

    incomeTax: number;

    otherIncome: number;

    interest: number;

    penalty: number;

    total: number;
}

export default function CTCTransactionForm({
    open,

    onClose,
}: Props) {
    /*
    ============================================================
    BOOKLETS
    ============================================================
    */

    const [booklets, setBooklets] =
        useState<Booklet[]>([]);

    const [selectedBooklet, setSelectedBooklet] =
        useState<Booklet | null>(null);

    const [loadingBooklets, setLoadingBooklets] =
        useState(true);

    const [bookletOpen, setBookletOpen] =
        useState(false);

    const [error, setError] =
        useState("");

    const [saving, setSaving] =
        useState(false);

    /*
    ============================================================
    TRANSACTION DATE
    ============================================================
    */

    const [transactionDate, setTransactionDate] =
        useState(() => {
            const today =
                new Date();

            return today
                .toISOString()
                .split("T")[0];
        });

    /*
    ============================================================
    INDIVIDUAL INFORMATION
    ============================================================
    */

    const [fullName, setFullName] =
        useState("");

    const [barangay, setBarangay] =
        useState("");

    const [tin, setTin] =
        useState("");

    const [ctcCrNumber, setCtcCrNumber] =
        useState("");

    const [citizenship, setCitizenship] =
        useState("FILIPINO");

    const [sex, setSex] =
        useState("");

    const [height, setHeight] =
        useState("");

    const [weight, setWeight] =
        useState("");

    const [placeOfBirth, setPlaceOfBirth] =
        useState("");

    const [birthDate, setBirthDate] =
        useState("");

    const [civilStatus, setCivilStatus] =
        useState("");

    const [occupation, setOccupation] =
        useState("");

    /*
    ============================================================
    TAX COMPUTATION
    ============================================================
    */

    const [taxMode, setTaxMode] =
        useState("TAXABLE");

    const [grossReceipts, setGrossReceipts] =
        useState(0);

    const [basicTax, setBasicTax] =
        useState(5);

    const [incomeTax, setIncomeTax] =
        useState(0);

    const [otherTax, setOtherTax] =
        useState(0);

    const [interest, setInterest] =
        useState(0);

    const [penalty, setPenalty] =
        useState(10);

    const [total, setTotal] =
        useState(15);

    /*
    ============================================================
    COMPUTED VALUES
    ============================================================
    */

    function handleComputedChange(
        values: ComputedValues
    ) {
        setBasicTax(
            values.basicTax
        );

        setIncomeTax(
            values.incomeTax
        );

        setOtherTax(
            values.otherIncome
        );

        setInterest(
            values.interest
        );

        setPenalty(
            values.penalty
        );

        setTotal(
            values.total
        );
    }

    /*
    ============================================================
    LOAD BOOKLETS
    ============================================================
    */

    useEffect(() => {
        if (!open) {
            return;
        }

        loadBooklets();
    }, [open]);

    async function loadBooklets() {
        try {
            setLoadingBooklets(
                true
            );

            setError("");

            const response =
                await axios.get(
                    "/api/barangay-rat/my-booklets"
                );

            if (
                !response.data?.success
            ) {
                throw new Error(
                    response.data?.message ??
                        "Failed to load booklets."
                );
            }

            const loadedBooklets: Booklet[] =
                response.data
                    .booklets ?? [];

            setBooklets(
                loadedBooklets
            );

            if (
                loadedBooklets.length ===
                1
            ) {
                setSelectedBooklet(
                    loadedBooklets[0]
                );
            }
        } catch (
            err: any
        ) {
            console.error(
                "Failed to load CTC booklets:",
                err
            );

            setError(
                err?.response
                    ?.data?.message ??
                    err?.message ??
                    "Failed to load assigned booklets."
            );
        } finally {
            setLoadingBooklets(
                false
            );
        }
    }

    /*
    ============================================================
    FORMAT OR RANGE
    ============================================================
    */

    function formatORRange(
        booklet: Booklet
    ) {
        const beginning =
            booklet.beginning_or !==
                null &&
            booklet.beginning_or !==
                undefined
                ? String(
                      booklet.beginning_or
                  )
                : "—";

        const ending =
            booklet.ending_or !==
                null &&
            booklet.ending_or !==
                undefined
                ? String(
                      booklet.ending_or
                  )
                : "—";

        return `${beginning} - ${ending}`;
    }

    /*
    ============================================================
    FORMAT CURRENT OR
    ============================================================
    */

    function formatCurrentOR(
        booklet: Booklet
    ) {
        if (
            booklet.current_or ===
                null ||
            booklet.current_or ===
                undefined
        ) {
            return "—";
        }

        return String(
            booklet.current_or
        );
    }

    /*
    ============================================================
    SELECT BOOKLET
    ============================================================
    */

    function handleSelectBooklet(
        booklet: Booklet
    ) {
        setSelectedBooklet(
            booklet
        );

        setBookletOpen(false);
    }

    /*
    ============================================================
    CREATE BARANGAY CTC
    ============================================================
    */

    async function handleCreateCTC() {
        if (!selectedBooklet) {
            setError(
                "Please select a CTC accountable form."
            );

            return;
        }

        if (!transactionDate) {
            setError(
                "Please select the transaction date."
            );

            return;
        }

        if (!fullName.trim()) {
            setError(
                "Full name is required."
            );

            return;
        }

        if (!total || Number(total) <= 0) {
            setError(
                "CTC total amount must be greater than zero."
            );

            return;
        }

        try {
            setSaving(true);

            setError("");

            /*
            ====================================================
            BARANGAY CTC API
            ====================================================
            */

            const response =
                await axios.post(
                    "/api/dipp/ctc/barangay",
                    {
                        /*
                        ============================================
                        BOOKLET
                        ============================================
                        */

                        booklet_registration_id:
                            selectedBooklet.id,

                        /*
                        ============================================
                        RECEIPT
                        ============================================
                        */

                        receipt_date:
                            transactionDate,

                        payor:
                            fullName.trim(),

                        payment_mode:
                            "Cash",

                        remarks:
                            null,

                        /*
                        ============================================
                        CTC INFORMATION
                        ============================================
                        */

                        ctc: {
                            /*
                            ----------------------------------------
                            CTC TYPE
                            ----------------------------------------
                            */

                            ctc_type:
                                selectedBooklet.form_code ??
                                "CTC-I",

                            /*
                            ----------------------------------------
                            INDIVIDUAL INFORMATION
                            ----------------------------------------
                            */

                            full_name:
                                fullName.trim(),

                            address:
                                barangay.trim() ||
                                null,

                            tin:
                                tin.trim() ||
                                null,

                            cr_number:
                                ctcCrNumber.trim() ||
                                null,

                            citizenship:
                                citizenship.trim() ||
                                null,

                            sex:
                                sex ||
                                null,

                            height:
                                height.trim() ||
                                null,

                            weight:
                                weight.trim() ||
                                null,

                            place_of_birth:
                                placeOfBirth.trim() ||
                                null,

                            birth_date:
                                birthDate ||
                                null,

                            civil_status:
                                civilStatus ||
                                null,

                            occupation:
                                occupation.trim() ||
                                null,

                            /*
                            ----------------------------------------
                            TAX COMPUTATION
                            ----------------------------------------
                            */

                            tax_mode:
                                taxMode,

                            taxable_amount:
                                Number(
                                    grossReceipts
                                ),

                            basic_tax:
                                Number(
                                    basicTax
                                ),

                            salary_tax:
                                Number(
                                    incomeTax
                                ),

                            additional_tax:
                                Number(
                                    otherTax
                                ),

                            penalty:
                                Number(
                                    penalty
                                ),

                            interest:
                                Number(
                                    interest
                                ),

                            total_amount:
                                Number(
                                    total
                                ),
                        },
                    }
                );

            /*
            ====================================================
            CHECK API RESPONSE
            ====================================================
            */

            if (
                !response.data?.success
            ) {
                throw new Error(
                    response.data?.message ??
                        "Failed to record Barangay CTC."
                );
            }

            /*
            ====================================================
            OPEN PRINT PAGE
            ====================================================
            */

            if (
                response.data
                    ?.transaction_id
            ) {
                window.open(
                    `/print/dipp/ctci/${response.data.transaction_id}`,
                    "_blank"
                );
            }

            /*
            ====================================================
            CLOSE FORM
            ====================================================
            */

            onClose();

        } catch (
            err: any
        ) {
            console.error(
                "BARANGAY CTC TRANSACTION ERROR:",
                err
            );

            console.error(
                "RESPONSE:",
                err?.response?.data
            );

            setError(
                err?.response
                    ?.data?.message ??
                    err?.message ??
                    "Unable to process Barangay CTC transaction."
            );
        } finally {
            setSaving(false);
        }
    }

    /*
    ============================================================
    RESET FORM
    ============================================================
    */

    useEffect(() => {
        if (!open) {
            return;
        }

        setSaving(false);

        setError("");

        setBookletOpen(false);

        /*
        --------------------------------------------------------
        RESET TRANSACTION DATE
        --------------------------------------------------------
        */

        const today =
            new Date();

        setTransactionDate(
            today
                .toISOString()
                .split("T")[0]
        );

        /*
        --------------------------------------------------------
        RESET INDIVIDUAL INFORMATION
        --------------------------------------------------------
        */

        setFullName("");

        setBarangay("");

        setTin("");

        setCtcCrNumber("");

        setCitizenship(
            "FILIPINO"
        );

        setSex("");

        setHeight("");

        setWeight("");

        setPlaceOfBirth("");

        setBirthDate("");

        setCivilStatus("");

        setOccupation("");

        /*
        --------------------------------------------------------
        RESET TAX COMPUTATION
        --------------------------------------------------------
        */

        setTaxMode(
            "TAXABLE"
        );

        setGrossReceipts(0);

        setBasicTax(5);

        setIncomeTax(0);

        setOtherTax(0);

        setInterest(0);

        setPenalty(10);

        setTotal(15);

    }, [open]);

    /*
    ============================================================
    DON'T RENDER
    ============================================================
    */

    if (!open) {
        return null;
    }

    /*
    ============================================================
    RENDER
    ============================================================
    */

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

            {/*
            ====================================================
            BACKDROP
            ====================================================
            */}

            <div
                className="absolute inset-0 bg-slate-900/50"
                onClick={onClose}
            />

            {/*
            ====================================================
            MAIN CARD
            ====================================================
            */}

            <div className="relative flex max-h-[95vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

                {/*
                ====================================================
                MAIN HEADER
                ====================================================
                */}

                <div className="shrink-0 border-b border-slate-200 bg-white px-6 py-4">

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                        {/*
                        ====================================================
                        TITLE
                        ====================================================
                        */}

                        <div className="flex items-center gap-3">

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100">

                                <BookOpen
                                    size={22}
                                    className="text-blue-700"
                                />

                            </div>

                            <div>

                                <h2 className="text-lg font-bold text-slate-800">
                                    CTC Transaction
                                </h2>

                                <p className="text-sm text-slate-500">
                                    Community Tax Certificate
                                </p>

                            </div>

                        </div>

                        {/*
                        ====================================================
                        HEADER CONTROLS
                        ====================================================
                        */}

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

                            {/*
                            ====================================================
                            ACCOUNTABLE FORM DROPDOWN
                            ====================================================
                            */}

                            <div className="relative w-full sm:w-[380px]">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setBookletOpen(
                                            !bookletOpen
                                        )
                                    }
                                    disabled={
                                        loadingBooklets ||
                                        booklets.length ===
                                            0
                                    }
                                    className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-left transition hover:border-blue-400 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                                >

                                    <div className="min-w-0">

                                        {loadingBooklets ? (
                                            <div className="flex items-center gap-2">

                                                <Loader2
                                                    className="h-4 w-4 animate-spin text-blue-600"
                                                />

                                                <span className="text-sm font-medium text-slate-600">
                                                    Loading forms...
                                                </span>

                                            </div>
                                        ) : selectedBooklet ? (
                                            <div>

                                                <p className="text-xs font-medium text-slate-500">
                                                    Accountable Form
                                                </p>

                                                <p className="truncate text-sm font-bold text-slate-800">

                                                    {
                                                        selectedBooklet.form_code ??
                                                        "CTC"
                                                    }

                                                    <span className="mx-2 text-slate-400">
                                                        •
                                                    </span>

                                                    OR{" "}
                                                    {formatORRange(
                                                        selectedBooklet
                                                    )}

                                                </p>

                                            </div>
                                        ) : (
                                            <div>

                                                <p className="text-xs font-medium text-slate-500">
                                                    Accountable Form
                                                </p>

                                                <p className="text-sm font-bold text-slate-700">
                                                    Select CTC Form
                                                </p>

                                            </div>
                                        )}

                                    </div>

                                    <ChevronDown
                                        className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${
                                            bookletOpen
                                                ? "rotate-180"
                                                : ""
                                        }`}
                                    />

                                </button>

                                {/*
                                ====================================================
                                DROPDOWN OPTIONS
                                ====================================================
                                */}

                                {bookletOpen &&
                                    booklets.length >
                                        0 && (
                                        <div className="absolute right-0 top-full z-[100] mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">

                                            <div className="max-h-64 overflow-y-auto">

                                                {booklets.map(
                                                    (
                                                        booklet
                                                    ) => {

                                                        const isSelected =
                                                            selectedBooklet?.id ===
                                                            booklet.id;

                                                        return (
                                                            <button
                                                                key={
                                                                    booklet.id
                                                                }
                                                                type="button"
                                                                onClick={() =>
                                                                    handleSelectBooklet(
                                                                        booklet
                                                                    )
                                                                }
                                                                className={`w-full border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 ${
                                                                    isSelected
                                                                        ? "bg-blue-50"
                                                                        : "hover:bg-slate-50"
                                                                }`}
                                                            >

                                                                <div className="flex items-center justify-between gap-4">

                                                                    <div>

                                                                        <p className="text-sm font-bold text-slate-800">
                                                                            {
                                                                                booklet.form_code ??
                                                                                "CTC"
                                                                            }
                                                                        </p>

                                                                        <p className="mt-1 text-xs text-slate-500">

                                                                            OR Range:{" "}

                                                                            <span className="font-semibold text-slate-700">
                                                                                {formatORRange(
                                                                                    booklet
                                                                                )}
                                                                            </span>

                                                                        </p>

                                                                    </div>

                                                                    {isSelected && (
                                                                        <span className="shrink-0 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                                                                            Selected
                                                                        </span>
                                                                    )}

                                                                </div>

                                                            </button>
                                                        );
                                                    }
                                                )}

                                            </div>

                                        </div>
                                    )}

                            </div>

                            {/*
                            ====================================================
                            DATE
                            ====================================================
                            */}

                            <div className="min-w-[160px]">

                                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                    Date
                                </label>

                                <input
                                    type="date"
                                    value={
                                        transactionDate
                                    }
                                    onChange={(e) =>
                                        setTransactionDate(
                                            e.target.value
                                        )
                                    }
                                    disabled={
                                        saving
                                    }
                                    className="h-[42px] w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                                />

                            </div>

                            {/*
                            ====================================================
                            CURRENT OR
                            ====================================================
                            */}

                            <div className="flex min-w-[150px] items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-5 py-2.5">

                                <div className="text-center">

                                    <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                                        Current OR
                                    </p>

                                    <p className="text-2xl font-extrabold leading-none tracking-tight text-blue-700">
                                        {selectedBooklet
                                            ? formatCurrentOR(
                                                  selectedBooklet
                                              )
                                            : "—"}
                                    </p>

                                </div>

                            </div>

                            {/*
                            ====================================================
                            CLOSE
                            ====================================================
                            */}

                            <button
                                type="button"
                                onClick={onClose}
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                            >
                                <X size={20} />
                            </button>

                        </div>

                    </div>

                </div>

                {/*
                ====================================================
                BODY
                ====================================================
                */}

                <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-5">

                    {/*
                    ====================================================
                    ERROR
                    ====================================================
                    */}

                    {error && (
                        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">

                            <p className="text-sm font-medium text-red-700">
                                {error}
                            </p>

                        </div>
                    )}

                    {/*
                    ====================================================
                    INDIVIDUAL INFORMATION
                    ====================================================
                    */}

                    <IndividualInformation
                        name={fullName}
                        address={barangay}
                        tin={tin}
                        crNumber={ctcCrNumber}
                        citizenship={citizenship}
                        sex={sex}
                        height={height}
                        weight={weight}
                        placeOfBirth={placeOfBirth}
                        birthDate={birthDate}
                        civilStatus={civilStatus}
                        occupation={occupation}
                        saving={saving}

                        onNameChange={
                            setFullName
                        }

                        onAddressChange={
                            setBarangay
                        }

                        onTinChange={
                            setTin
                        }

                        onCRNumberChange={
                            setCtcCrNumber
                        }

                        onCitizenshipChange={
                            setCitizenship
                        }

                        onSexChange={
                            setSex
                        }

                        onHeightChange={
                            setHeight
                        }

                        onWeightChange={
                            setWeight
                        }

                        onPlaceOfBirthChange={
                            setPlaceOfBirth
                        }

                        onBirthDateChange={
                            setBirthDate
                        }

                        onCivilStatusChange={
                            setCivilStatus
                        }

                        onOccupationChange={
                            setOccupation
                        }
                    />

                    {/*
                    ====================================================
                    TAX COMPUTATION
                    ====================================================
                    */}

                    <div className="mt-5">

                        <TaxComputation
                            mode={
                                taxMode
                            }

                            grossIncome={
                                grossReceipts
                            }

                            incomeTax={
                                incomeTax
                            }

                            otherIncome={
                                otherTax
                            }

                            basicTax={
                                basicTax
                            }

                            interest={
                                interest
                            }

                            penalty={
                                penalty
                            }

                            total={
                                total
                            }

                            saving={
                                saving
                            }

                            onModeChange={
                                setTaxMode
                            }

                            onGrossIncomeChange={(
                                value
                            ) => {
                                setGrossReceipts(
                                    Number(
                                        value
                                    ) || 0
                                );
                            }}

                            onComputedChange={
                                handleComputedChange
                            }
                        />

                    </div>

                </div>

                {/*
                ====================================================
                FOOTER
                ====================================================
                */}

                <div className="flex shrink-0 justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4">

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={
                            saving
                        }
                        className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        disabled={
                            !selectedBooklet ||
                            saving ||
                            !transactionDate
                        }
                        onClick={
                            handleCreateCTC
                        }
                        className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {saving
                            ? "Processing..."
                            : "Create CTC"}
                    </button>

                </div>

            </div>

        </div>
    );
}