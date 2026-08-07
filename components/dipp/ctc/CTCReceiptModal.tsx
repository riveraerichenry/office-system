"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

import BookletHeader from "../general/BookletHeader";

import CertificateInformation from "./CertificateInformation";
import IndividualInformation from "./IndividualInformation";
import CorporationInformation from "./CorporationInformation";
import TaxComputation from "./TaxComputation";
import Footer from "./Footer";
type Props = {
    open: boolean;

    booklet: any;

    onClose: () => void;

    onSuccess: () => void;
};

export default function CTCReceiptModal({

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

    const [saving, setSaving] =
        useState(false);

    /*
    |--------------------------------------------------------------------------
    | Certificate Information
    |--------------------------------------------------------------------------
    */

    const [issueDate, setIssueDate] =
        useState(
            new Date()
                .toISOString()
                .substring(0, 10)
        );

    const [placeIssued, setPlaceIssued] =
        useState("TAYTAY, PALAWAN");

    /*
    |--------------------------------------------------------------------------
    | Individual Information
    |--------------------------------------------------------------------------
    */

    const [name, setName] =
        useState("");

    const [address, setAddress] =
        useState("");

    const [tin, setTin] =
        useState("");

    const [crNumber, setCrNumber] =
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
    |--------------------------------------------------------------------------
    | Corporation Information
    |--------------------------------------------------------------------------
    */

    const [corporationName, setCorporationName] =
        useState("");

    const [businessAddress, setBusinessAddress] =
        useState("");

    const [secNumber, setSecNumber] =
        useState("");

    const [authorizedRepresentative, setAuthorizedRepresentative] =
        useState("");

    /*
    |--------------------------------------------------------------------------
    | Tax Computation
    |--------------------------------------------------------------------------
    */

    const [mode, setMode] =
        useState("TAXABLE");

    const [grossIncome, setGrossIncome] =
        useState(0);

    const [incomeTax, setIncomeTax] =
        useState(0);

    const [otherIncome, setOtherIncome] =
        useState(0);

    const [basicTax, setBasicTax] =
        useState(5);

    const [interest, setInterest] =
        useState(0);

    const [penalty, setPenalty] =
        useState(0);

    /*
    |--------------------------------------------------------------------------
    | Computed Total
    |--------------------------------------------------------------------------
    */

    const total =
        useMemo(() => {

            return (

                Number(basicTax)

                +

                Number(incomeTax)

                +

                Number(otherIncome)

                +

                Number(interest)

                +

                Number(penalty)

            );

        }, [

            basicTax,

            incomeTax,

            otherIncome,

            interest,

            penalty,

        ]);


    async function processCTC() {

        try {

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

                            booklet.form_code === "CTC-C"

                                ?

                                corporationName

                                :

                                name,

                        payment_mode:

                            "Cash",

                        remarks:

                            null,

                        items: [

                            {

                                account_id: null,

                                amount: total,

                                remarks: null,

                            }

                        ],

                        ctc: {

                            full_name:

                                name,

                            corporation_name:

                                corporationName,

                            address,

                            tin,

                            cr_number:

                                crNumber,

                            citizenship,

                            sex,

                            civil_status:

                                civilStatus,

                            occupation,

                            birth_date:

                                birthDate,

                            place_of_birth:

                                placeOfBirth,

                            height,

                            weight,

                            sec_registration:

                                secNumber,

                            representative:

                                authorizedRepresentative,

                            place_issued:

                                placeIssued,

                            issue_date:

                                issueDate,

                            tax_mode:

                                mode,

                            taxable_amount:

                                grossIncome,

                            basic_tax:

                                basicTax,

                            additional_tax:

                                incomeTax +

                                otherIncome,

                            interest,

                            penalty,

                            grand_total:

                                total,

                        }

                    }

                );

            Swal.fire({

                icon: "success",

                title: "CTC Successfully Issued",

                text: `CTC No. ${res.data.or_number}`,

                timer: 1500,

                showConfirmButton: false,

            });

            /*
                Print
            */

            window.open(

                `/print/dipp/ctc/${res.data.transaction_id}`,

                "_blank"

            );

            await onSuccess();

            onClose();

        }

        catch (err: any) {

            Swal.fire({

                icon: "error",

                title: "Unable to Process",

                text:

                    err.response?.data?.message ||

                    "Unexpected error.",

            });

        }

        finally {

            setSaving(false);

        }

    }

    /*
    |--------------------------------------------------------------------------
    | Reset
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        if (!open) return;

        setIssueDate(
            new Date()
                .toISOString()
                .substring(0, 10)
        );

    }, [open]);

    if (

        !open ||

        !booklet

    )

        return null;

    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">

            <div className="flex h-[94vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

                <BookletHeader

                    booklet={booklet}

                />

                <div className="flex-1 space-y-5 overflow-y-auto bg-slate-100 p-6">

                    <CertificateInformation

                        booklet={booklet}

                        issueDate={issueDate}

                        placeIssued={placeIssued}

                        saving={saving}

                        onIssueDateChange={

                            setIssueDate

                        }

                        onPlaceIssuedChange={

                            setPlaceIssued

                        }

                    />

                    {

                        booklet.form_code ===
                        "CTC-CORPORATION"

                        ?

                        <CorporationInformation

                            corporationName={corporationName}

                            address={businessAddress}

                            tin={tin}

                            secNumber={secNumber}

                            representative={authorizedRepresentative}

                            saving={saving}

                            onCorporationNameChange={

                                setCorporationName

                            }

                            onAddressChange={

                                setBusinessAddress

                            }

                            onTinChange={

                                setTin

                            }

                            onSECChange={

                                setSecNumber

                            }

                            onRepresentativeChange={

                                setAuthorizedRepresentative

                            }

                        />

                        :

                        <IndividualInformation

                            name={name}

                            address={address}

                            tin={tin}

                            crNumber={crNumber}

                            citizenship={citizenship}

                            sex={sex}

                            height={height}

                            weight={weight}

                            placeOfBirth={placeOfBirth}

                            birthDate={birthDate}

                            civilStatus={civilStatus}

                            occupation={occupation}

                            saving={saving}

                            onNameChange={setName}

                            onAddressChange={setAddress}

                            onTinChange={setTin}

                            onCRNumberChange={setCrNumber}

                            onCitizenshipChange={

                                setCitizenship

                            }

                            onSexChange={setSex}

                            onHeightChange={setHeight}

                            onWeightChange={setWeight}

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

                    }

                    <TaxComputation

                        mode={mode}

                        grossIncome={grossIncome}

                        incomeTax={incomeTax}

                        otherIncome={otherIncome}

                        basicTax={basicTax}

                        interest={interest}

                        penalty={penalty}

                        total={total}

                        saving={saving}

                        onModeChange={setMode}

                        onGrossIncomeChange={

                            setGrossIncome

                        }

                    />

                </div>

                <Footer

                    saving={saving}

                    total={total}

                    onCancel={onClose}

                    onProcess={processCTC}

                />

            </div>

        </div>

    );

}