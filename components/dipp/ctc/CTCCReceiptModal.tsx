"use client";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import axios from "axios";
import Swal from "sweetalert2";

import BookletHeader from "../general/BookletHeader";

import CertificateInformation from "./CertificateInformation";
import TaxComputation from "./TaxComputation";
import Footer from "./Footer";

type Props = {
    open: boolean;
    booklet: any;
    onClose: () => void;
    onSuccess: () => void;
};

export default function CTCCReceiptModal({
    open,
    booklet,
    onClose,
    onSuccess,
}: Props) {

    /*
    |--------------------------------------------------------------------------
    | Loading
    |--------------------------------------------------------------------------
    */

    const [
        saving,
        setSaving,
    ] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | Certificate Information
    |--------------------------------------------------------------------------
    */

    const [
        issueDate,
        setIssueDate,
    ] = useState(
        new Date()
            .toISOString()
            .substring(0, 10)
    );

    const [
        placeIssued,
        setPlaceIssued,
    ] = useState(
        "TAYTAY, PALAWAN"
    );

    /*
    |--------------------------------------------------------------------------
    | Corporation Information
    |--------------------------------------------------------------------------
    */

    const [
        corporationName,
        setCorporationName,
    ] = useState("");

    const [
        address,
        setAddress,
    ] = useState("");

    const [
        tin,
        setTin,
    ] = useState("");

    const [
        secRegistration,
        setSecRegistration,
    ] = useState("");

    const [
        representative,
        setRepresentative,
    ] = useState("");

    /*
    |--------------------------------------------------------------------------
    | Tax Computation
    |--------------------------------------------------------------------------
    */

    const [
        mode,
        setMode,
    ] = useState(
        "TAXABLE"
    );

    const [
        grossIncome,
        setGrossIncome,
    ] = useState(0);

    const [
        otherIncome,
        setOtherIncome,
    ] = useState(0);

    const basicTax = 5;

    /*
    |--------------------------------------------------------------------------
    | Salary Tax
    |--------------------------------------------------------------------------
    |
    | Income / 1000
    |
    */

    const incomeTax =
        useMemo(() => {

            if (
                mode === "PESO"
            ) {
                return 1;
            }

            return (
                Number(
                    grossIncome
                ) / 1000
            );

        }, [
            grossIncome,
            mode,
        ]);

    /*
    |--------------------------------------------------------------------------
    | Month(s)
    |--------------------------------------------------------------------------
    |
    | January = 1
    | February = 2
    | ...
    | August = 8
    |
    */

    const months =
        useMemo(() => {

            if (!issueDate) {
                return 0;
            }

            const date =
                new Date(
                    `${issueDate}T00:00:00`
                );

            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {
                return 0;
            }

            return (
                date.getMonth() + 1
            );

        }, [
            issueDate,
        ]);

    /*
    |--------------------------------------------------------------------------
    | Penalty
    |--------------------------------------------------------------------------
    |
    | ₱1.00 for every month
    |
    */

    const penaltyPerMonth = 1;

    const penalty =
        useMemo(() => {

            return (
                months *
                penaltyPerMonth
            );

        }, [
            months,
        ]);

    /*
    |--------------------------------------------------------------------------
    | Tax Total
    |--------------------------------------------------------------------------
    */

    const taxTotal =
        useMemo(() => {

            return (
                Number(
                    basicTax
                ) +

                Number(
                    incomeTax
                ) +

                Number(
                    otherIncome
                )
            );

        }, [
            incomeTax,
            otherIncome,
        ]);

    /*
    |--------------------------------------------------------------------------
    | Interest
    |--------------------------------------------------------------------------
    |
    | No additional interest computation for now.
    |
    */

    const interest = 0;

    /*
    |--------------------------------------------------------------------------
    | Grand Total
    |--------------------------------------------------------------------------
    */

    const total =
        useMemo(() => {

            return (
                Number(
                    taxTotal
                ) +

                Number(
                    penalty
                ) +

                Number(
                    interest
                )
            );

        }, [
            taxTotal,
            penalty,
            interest,
        ]);

    /*
    |--------------------------------------------------------------------------
    | Process CTC-C
    |--------------------------------------------------------------------------
    */

    async function processCTCC() {

        try {

            /*
            |--------------------------------------------------------------------------
            | Validation
            |--------------------------------------------------------------------------
            */

            if (
                !corporationName.trim()
            ) {

                await Swal.fire({
                    icon: "warning",
                    title: "Required Field",
                    text:
                        "Please enter the corporation name.",
                });

                return;
            }

            if (
                !address.trim()
            ) {

                await Swal.fire({
                    icon: "warning",
                    title: "Required Field",
                    text:
                        "Please enter the address.",
                });

                return;
            }

            if (
                !issueDate
            ) {

                await Swal.fire({
                    icon: "warning",
                    title: "Required Field",
                    text:
                        "Please select the date issued.",
                });

                return;
            }

            setSaving(true);

            /*
            |--------------------------------------------------------------------------
            | Save Transaction
            |--------------------------------------------------------------------------
            */

            const res =
                await axios.post(
                    "/api/dipp/transactions",
                    {
                        booklet_registration_id:
                            booklet.booklet_registration_id,

                        receipt_date:
                            issueDate,

                        payor:
                            corporationName.trim(),

                        payment_mode:
                            "Cash",

                        remarks:
                            null,

                        /*
                        |--------------------------------------------------------------------------
                        | Keep items because the API
                        | expects the property.
                        |--------------------------------------------------------------------------
                        */

                        items: [
                            {
                                account_id:
                                    null,

                                amount:
                                    total,

                                remarks:
                                    null,
                            },
                        ],

                        /*
                        |--------------------------------------------------------------------------
                        | CTC-C Data
                        |--------------------------------------------------------------------------
                        */

                        ctc: {

                            ctc_type:
                                "CTC-C",

                            /*
                            | Individual fields
                            | are intentionally null.
                            */

                            full_name:
                                null,

                            address:
                                address || null,

                            tin:
                                tin || null,

                            cr_number:
                                null,

                            citizenship:
                                null,

                            sex:
                                null,

                            height:
                                null,

                            weight:
                                null,

                            place_of_birth:
                                null,

                            birth_date:
                                null,

                            civil_status:
                                null,

                            occupation:
                                null,

                            /*
                            | Corporation
                            */

                            corporation_name:
                                corporationName.trim(),

                            sec_registration:
                                secRegistration ||
                                null,

                            representative:
                                representative ||
                                null,

                            /*
                            | Certificate
                            */

                            place_issued:
                                placeIssued ||
                                null,

                            issue_date:
                                issueDate ||
                                null,

                            /*
                            | Tax
                            */

                            tax_mode:
                                mode,

                            taxable_amount:
                                Number(
                                    grossIncome
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
                                    otherIncome
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
            |--------------------------------------------------------------------------
            | Success
            |--------------------------------------------------------------------------
            */

            await Swal.fire({
                icon: "success",
                title:
                    "CTC-C Successfully Issued",
                text:
                    `CTC No. ${res.data.or_number}`,
                timer: 1500,
                showConfirmButton: false,
            });

            /*
            |--------------------------------------------------------------------------
            | Open Print
            |--------------------------------------------------------------------------
            */

            if (
                res.data.transaction_id
            ) {

                window.open(
                    `/print/dipp/ctc/${res.data.transaction_id}`,
                    "_blank"
                );

            }

            /*
            |--------------------------------------------------------------------------
            | Refresh Parent
            |--------------------------------------------------------------------------
            */

            await onSuccess();

            /*
            |--------------------------------------------------------------------------
            | Close
            |--------------------------------------------------------------------------
            */

            onClose();

        } catch (
            err: any
        ) {

            console.error(
                "CTC-C ERROR:",
                err
            );

            await Swal.fire({
                icon: "error",
                title:
                    "Unable to Process",
                text:
                    err.response?.data?.message ||
                    "Unexpected error.",
            });

        } finally {

            setSaving(false);

        }

    }

    /*
    |--------------------------------------------------------------------------
    | Reset
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        if (!open) {
            return;
        }

        setSaving(false);

        setIssueDate(
            new Date()
                .toISOString()
                .substring(0, 10)
        );

        setPlaceIssued(
            "TAYTAY, PALAWAN"
        );

        setCorporationName("");

        setAddress("");

        setTin("");

        setSecRegistration("");

        setRepresentative("");

        setMode(
            "TAXABLE"
        );

        setGrossIncome(0);

        setOtherIncome(0);

    }, [open]);

    /*
    |--------------------------------------------------------------------------
    | Don't Render
    |--------------------------------------------------------------------------
    */

    if (
        !open ||
        !booklet
    ) {
        return null;
    }

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">

            <div className="flex h-[94vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

                {/* ==========================================================
                    BOOKLET HEADER
                ========================================================== */}

                <BookletHeader
                    booklet={
                        booklet
                    }
                />

                {/* ==========================================================
                    BODY
                ========================================================== */}

                <div className="flex-1 space-y-5 overflow-y-auto bg-slate-100 p-6">

                    {/* ======================================================
                        CERTIFICATE INFORMATION
                    ====================================================== */}

                    <CertificateInformation
                        booklet={booklet}
                        issueDate={issueDate}
                        placeIssued={placeIssued}
                        saving={saving}
                        ctcType="CORPORATION"
                        onIssueDateChange={setIssueDate}
                        onPlaceIssuedChange={setPlaceIssued}
                    />

                    {/* ======================================================
                        CORPORATION INFORMATION
                    ====================================================== */}

                    <div className="rounded-xl border bg-white shadow-sm">

                        <div className="border-b bg-slate-50 px-5 py-4">

                            <h2 className="text-base font-bold text-slate-800">

                                Corporation Information

                            </h2>

                            <p className="mt-1 text-sm text-slate-500">

                                Enter the registered corporation information.

                            </p>

                        </div>

                        <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">

                            {/* Corporation Name */}

                            <div className="md:col-span-2">

                                <label className="mb-1 block text-sm font-semibold text-slate-700">

                                    Corporation Name

                                </label>

                                <input
                                    type="text"
                                    value={
                                        corporationName
                                    }
                                    onChange={(e) =>
                                        setCorporationName(
                                            e.target.value
                                        )
                                    }
                                    disabled={
                                        saving
                                    }
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                                    placeholder="Enter corporation name"
                                />

                            </div>

                            {/* Address */}

                            <div className="md:col-span-2">

                                <label className="mb-1 block text-sm font-semibold text-slate-700">

                                    Address

                                </label>

                                <input
                                    type="text"
                                    value={
                                        address
                                    }
                                    onChange={(e) =>
                                        setAddress(
                                            e.target.value
                                        )
                                    }
                                    disabled={
                                        saving
                                    }
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                                    placeholder="Enter corporation address"
                                />

                            </div>

                            {/* TIN */}

                            <div>

                                <label className="mb-1 block text-sm font-semibold text-slate-700">

                                    TIN

                                </label>

                                <input
                                    type="text"
                                    value={
                                        tin
                                    }
                                    onChange={(e) =>
                                        setTin(
                                            e.target.value
                                        )
                                    }
                                    disabled={
                                        saving
                                    }
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                                    placeholder="Enter TIN"
                                />

                            </div>

                            {/* SEC Registration */}

                            <div>

                                <label className="mb-1 block text-sm font-semibold text-slate-700">

                                    SEC Registration No.

                                </label>

                                <input
                                    type="text"
                                    value={
                                        secRegistration
                                    }
                                    onChange={(e) =>
                                        setSecRegistration(
                                            e.target.value
                                        )
                                    }
                                    disabled={
                                        saving
                                    }
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                                    placeholder="Enter SEC registration number"
                                />

                            </div>

                            {/* Representative */}

                            <div className="md:col-span-2">

                                <label className="mb-1 block text-sm font-semibold text-slate-700">

                                    Authorized Representative

                                </label>

                                <input
                                    type="text"
                                    value={
                                        representative
                                    }
                                    onChange={(e) =>
                                        setRepresentative(
                                            e.target.value
                                        )
                                    }
                                    disabled={
                                        saving
                                    }
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                                    placeholder="Enter authorized representative"
                                />

                            </div>

                        </div>

                    </div>

                    {/* ======================================================
                        TAX COMPUTATION
                    ====================================================== */}

                    <TaxComputation

                        mode={
                            mode
                        }

                        grossIncome={
                            grossIncome
                        }

                        incomeTax={
                            incomeTax
                        }

                        otherIncome={
                            otherIncome
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
                            setMode
                        }

                        onGrossIncomeChange={
                            setGrossIncome
                        }

                    />

                </div>

                {/* ==========================================================
                    FOOTER
                ========================================================== */}

                <Footer

                    saving={
                        saving
                    }

                    total={
                        total
                    }

                    onCancel={
                        onClose
                    }

                    onProcess={
                        processCTCC
                    }

                />

            </div>

        </div>

    );
}