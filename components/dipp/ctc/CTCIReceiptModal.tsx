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
import IndividualInformation from "./IndividualInformation";
import TaxComputation from "./TaxComputation";
import Footer from "./Footer";

type Props = {
    open: boolean;
    booklet: any;
    onClose: () => void;
    onSuccess: () => void;
};

export default function CTCIReceiptModal({
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
    | Individual Information
    |--------------------------------------------------------------------------
    */

    const [
        name,
        setName,
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
        crNumber,
        setCrNumber,
    ] = useState("");

    const [
        citizenship,
        setCitizenship,
    ] = useState(
        "FILIPINO"
    );

    const [
        sex,
        setSex,
    ] = useState("");

    const [
        height,
        setHeight,
    ] = useState("");

    const [
        weight,
        setWeight,
    ] = useState("");

    const [
        placeOfBirth,
        setPlaceOfBirth,
    ] = useState("");

    const [
        birthDate,
        setBirthDate,
    ] = useState("");

    const [
        civilStatus,
        setCivilStatus,
    ] = useState("");

    const [
        occupation,
        setOccupation,
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
    | Income / Salary Tax
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
    | Process CTC-I
    |--------------------------------------------------------------------------
    */

    async function processCTCI() {

        try {

            if (
                !name.trim()
            ) {

                await Swal.fire({
                    icon: "warning",
                    title: "Required Field",
                    text:
                        "Please enter the individual's name.",
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

            const res =
                await axios.post(
                    "/api/dipp/transactions",
                    {
                        booklet_registration_id:
                            booklet.booklet_registration_id,

                        receipt_date:
                            issueDate,

                        payor:
                            name,

                        payment_mode:
                            "Cash",

                        remarks:
                            null,

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

                        ctc: {
                        ctc_type: "CTC-I",

                        full_name: name.trim(),

                        address: address || null,

                        tin: tin || null,

                        cr_number: crNumber || null,

                        citizenship: citizenship || null,

                        sex: sex || null,

                        height: height || null,

                        weight: weight || null,

                        place_of_birth:
                            placeOfBirth || null,

                        birth_date:
                            birthDate || null,

                        civil_status:
                            civilStatus || null,

                        occupation:
                            occupation || null,

                        corporation_name: null,

                        sec_registration: null,

                        representative: null,

                        place_issued:
                            placeIssued || null,

                        issue_date:
                            issueDate || null,

                        tax_mode:
                            mode,

                        taxable_amount:
                            Number(grossIncome),

                        basic_tax:
                            Number(basicTax),

                        salary_tax:
                            Number(incomeTax),

                        additional_tax:
                            Number(otherIncome),

                        penalty:
                            Number(penalty),

                        interest:
                            Number(interest),

                        total_amount:
                            Number(total),
                    }
                    }
                );

            await Swal.fire({
                icon: "success",
                title:
                    "CTC-I Successfully Issued",
                text:
                    `CTC No. ${res.data.or_number}`,
                timer: 1500,
                showConfirmButton: false,
            });

            if (
                res.data.transaction_id
            ) {

                window.open(
                    `/print/dipp/ctc/${res.data.transaction_id}`,
                    "_blank"
                );

            }

            await onSuccess();

            onClose();

        } catch (
            err: any
        ) {

            console.error(
                "CTC-I ERROR:",
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

        setName("");
        setAddress("");
        setTin("");
        setCrNumber("");
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
                    ACTUAL BOOKLET HEADER COMPONENT
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
                        ctcType="INDIVIDUAL"
                        onIssueDateChange={setIssueDate}
                        onPlaceIssuedChange={setPlaceIssued}
                    />

                    {/* ======================================================
                        INDIVIDUAL INFORMATION
                    ====================================================== */}

                    <IndividualInformation

                        name={
                            name
                        }

                        address={
                            address
                        }

                        tin={
                            tin
                        }

                        crNumber={
                            crNumber
                        }

                        citizenship={
                            citizenship
                        }

                        sex={
                            sex
                        }

                        height={
                            height
                        }

                        weight={
                            weight
                        }

                        placeOfBirth={
                            placeOfBirth
                        }

                        birthDate={
                            birthDate
                        }

                        civilStatus={
                            civilStatus
                        }

                        occupation={
                            occupation
                        }

                        saving={
                            saving
                        }

                        onNameChange={
                            setName
                        }

                        onAddressChange={
                            setAddress
                        }

                        onTinChange={
                            setTin
                        }

                        onCRNumberChange={
                            setCrNumber
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
                    ACTUAL FOOTER COMPONENT
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
                        processCTCI
                    }

                />

            </div>

        </div>
    );
}